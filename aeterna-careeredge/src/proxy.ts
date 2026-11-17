// src/proxy.ts
// Route protection for Aeterna CareerEdge
//
// Next.js 16 renamed middleware.ts → proxy.ts (export "proxy" not "middleware").
// See: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

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
  const secret = process.env.AUTH_SECRET ?? "";
  return new TextEncoder().encode(secret);
}

async function getSessionFromRequest(
  request: NextRequest
): Promise<{ userId: string; onboardingCompleted: boolean } | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      userId: payload.userId as string,
      onboardingCompleted: payload.onboardingCompleted as boolean,
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
