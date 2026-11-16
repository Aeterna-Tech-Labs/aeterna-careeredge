// src/app/api/auth/oauth/dev-mock/route.ts
// Development-only simulated Google OAuth sign-in.
// STRICTLY disabled in production.

import { NextRequest, NextResponse } from "next/server";
import { handleGoogleIdentity } from "@/lib/auth/oauth";
import { setSessionCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Strict production check
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email") || "dev.student@aeterna.education";
  const name = searchParams.get("name") || "Ananya Sharma (Dev Student)";
  const sub = "mock-google-sub-" + Buffer.from(email).toString("hex").slice(0, 16);

  const origin =
    req.headers.get("origin") ||
    process.env.NEXTAUTH_URL ||
    req.nextUrl.origin ||
    "http://localhost:3000";

  console.log("\n==================================================");
  console.log("🚀 [OAUTH DEV SIMULATION] Signing in with Mock Google Identity");
  console.log(`👤 Name:  ${name}`);
  console.log(`📧 Email: ${email}`);
  console.log(`🆔 Sub:   ${sub}`);
  console.log("==================================================\n");

  const { user } = await handleGoogleIdentity({ email, name, sub });

  await setSessionCookie({
    userId: user.id,
    email: user.email,
    name: user.name,
    onboardingCompleted: user.onboardingCompleted,
  });

  const targetUrl = user.onboardingCompleted ? "/dashboard" : "/onboarding";
  return NextResponse.redirect(new URL(targetUrl, origin));
}

export async function POST(req: NextRequest) {
  // Strict production check
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const email = body.email || "dev.student@aeterna.education";
    const name = body.name || "Ananya Sharma (Dev Student)";
    const sub = "mock-google-sub-" + Buffer.from(email).toString("hex").slice(0, 16);

    const { user, isNew } = await handleGoogleIdentity({ email, name, sub });

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      onboardingCompleted: user.onboardingCompleted,
    });

    return NextResponse.json({
      success: true,
      simulated: true,
      isNewUser: isNew,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (error) {
    console.error("[OAuth Dev Mock Error]", error);
    return NextResponse.json(
      { error: "Failed to simulate Google OAuth." },
      { status: 500 }
    );
  }
}
