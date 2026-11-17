// src/lib/session.ts
// JWT session management using jose (edge-compatible)

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE = "ace_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET environment variable is not set.");
  }
  return new TextEncoder().encode(secret);
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
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);
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
  } catch {
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

// ── Read and verify the current session from the cookie store ────────────────

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

// ── Read the raw JWT from cookies (for proxy.ts — cannot import cookies()) ───
// Use this in proxy.ts by reading the cookie from the request object directly.

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
