// src/lib/session.ts
// JWT session management using jose (edge-compatible)

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Polyfill atob auto-padding so jose never fails on unpadded RFC 7519 base64url signatures
if (typeof globalThis.atob === "function") {
  const origAtob = globalThis.atob;
  if (!(origAtob as any).__careeredge_padded) {
    const patchedAtob = function (str: string) {
      let s = String(str);
      const mod = s.length % 4;
      if (mod === 2) s += "==";
      else if (mod === 3) s += "=";
      return origAtob(s);
    };
    (patchedAtob as any).__careeredge_padded = true;
    globalThis.atob = patchedAtob;
  }
}

// Turbopack / Node 24 experimental Uint8Array.fromBase64 throws InvalidCharacterError on valid RFC 7519 base64url characters.
// Disable it so jose uses its robust atob / Buffer decoder.
if (typeof Uint8Array !== "undefined" && "fromBase64" in Uint8Array) {
  try {
    delete (Uint8Array as any).fromBase64;
  } catch {
    (Uint8Array as any).fromBase64 = undefined;
  }
}

const SESSION_COOKIE = "ace_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret(): Uint8Array {
  let secret = process.env.AUTH_SECRET;
  if (!secret) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require("fs");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require("path");
      const envPath = path.resolve(process.cwd(), ".env");
      if (fs.existsSync(envPath)) {
        const match = fs.readFileSync(envPath, "utf8").match(/AUTH_SECRET=["']?([^"'\r\n]+)["']?/);
        if (match) secret = match[1];
      }
    } catch {}
  }
  return new TextEncoder().encode(secret || "xo5odNE2wssVxrcloxtSOgYXkHOLSwIW8/jHNSlsewM=");
}

// ── Payload stored inside the JWT ────────────────────────────────────────────

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  onboardingCompleted: boolean;
}

// ── Create and sign a session JWT ────────────────────────────────────────────

export async function createSession(payload: SessionPayload): Promise<string> {
  const secret = getSecret();

  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secret);

  return token;
}

// ── Verify and decode a JWT ───────────────────────────────────────────────────

export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    let rawClean = token.trim().replace(/^["']|["']$/g, "");
    try {
      rawClean = decodeURIComponent(rawClean);
    } catch {}
    rawClean = rawClean.trim().replace(/^["']|["']$/g, "").replace(/\s+/g, "");
    // Normalize any legacy or standard base64 encoded JWT parts into RFC 7519 base64url
    const parts = rawClean.split(".");
    if (parts.length !== 3) return null;
    const cleanToken = parts
      .map((p) => p.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""))
      .join(".");

    const secret = getSecret();
    const { payload } = await jwtVerify(cleanToken, secret);
    const rawPayload = payload as Record<string, unknown>;
    const userId = (payload.userId ||
      (typeof rawPayload.id === "string" ? rawPayload.id : undefined) ||
      (typeof rawPayload.sub === "string" ? rawPayload.sub : undefined) ||
      "") as string;
    return {
      userId,
      email: (payload.email || "") as string,
      name: (payload.name || "") as string,
      onboardingCompleted: Boolean(payload.onboardingCompleted),
    };
  } catch (err: any) {
    console.error("[verifySession ERROR]:", err?.name, err?.message);
    return null;
  }
}

// ── Set the session cookie (Server Action / Route Handler only) ───────────────

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await createSession(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

// ── Clear the session cookie ─────────────────────────────────────────────────

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// ── Read and verify the current session from the cookie store or request ────

export async function getSession(req?: {
  cookies?: { get: (name: string) => { value: string } | undefined };
  headers?: { get: (name: string) => string | null };
}): Promise<SessionPayload | null> {
  let token: string | undefined;
  if (req?.cookies && typeof req.cookies.get === "function") {
    token = req.cookies.get(SESSION_COOKIE)?.value;
  }
  if (!token && req?.headers && typeof req.headers.get === "function") {
    const rawCookie = req.headers.get("cookie") || "";
    const match = rawCookie.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
    if (match) token = match[1];
  }
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE)?.value;
    } catch {
      // In route handlers or edge context without cookies()
    }
  }
  if (!token) return null;
  return verifySession(token);
}

// ── Read the raw JWT from cookies (for proxy.ts — cannot import cookies()) ───
// Use this in proxy.ts by reading the cookie from the request object directly.

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
