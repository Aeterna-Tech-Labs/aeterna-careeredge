// src/proxy.ts
// Route protection for Aeterna CareerEdge
//
// Next.js 16 renamed middleware.ts → proxy.ts (export "proxy" not "middleware").
// See: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

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

// Routes that require the user to be logged in
const PROTECTED_PREFIXES = ["/dashboard", "/onboarding", "/resume", "/sop",
  "/passport", "/career-discovery", "/job-matcher", "/interview-coach",
  "/portfolio", "/applications", "/mentor", "/counselling", "/settings",
  "/linkedin",
];

// Routes that logged-in users should not see (redirect to dashboard)
const AUTH_ROUTES = ["/login", "/signup"];

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || "xo5odNE2wssVxrcloxtSOgYXkHOLSwIW8/jHNSlsewM=";
  return new TextEncoder().encode(secret);
}

async function getSessionFromRequest(
  request: NextRequest
): Promise<{ userId: string; onboardingCompleted: boolean } | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    let rawClean = token.trim().replace(/^["']|["']$/g, "");
    try {
      rawClean = decodeURIComponent(rawClean);
    } catch {}
    rawClean = rawClean.trim().replace(/^["']|["']$/g, "").replace(/\s+/g, "");
    const parts = rawClean.split(".");
    if (parts.length !== 3) return null;
    const cleanToken = parts
      .map((p) => p.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""))
      .join(".");

    const { payload } = await jwtVerify(cleanToken, getSecret());
    return {
      userId: (payload.userId || payload.sub || "") as string,
      onboardingCompleted: Boolean(payload.onboardingCompleted),
    };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const session = await getSessionFromRequest(request);
  const isLoggedIn = session !== null;

  // ── Redirect logged-in users away from auth pages ─────────────────────

  if (isLoggedIn && AUTH_ROUTES.some((r) => pathname === r)) {
    if (!session.onboardingCompleted) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow dedicated print routes with exportToken query param (cryptographically verified in page handler)
  if (pathname.includes("/print") && request.nextUrl.searchParams.has("exportToken")) {
    return NextResponse.next();
  }

  // ── Protect student routes ─────────────────────────────────────────────

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Redirect to onboarding if incomplete ──────────────────────────────

  if (
    isLoggedIn &&
    !session.onboardingCompleted &&
    isProtected &&
    !pathname.startsWith("/onboarding")
  ) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico|assets/).*)",
  ],
};
