// src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  verifyPasswordResetToken,
  resetPasswordWithToken,
} from "@/lib/auth/password-reset";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Missing reset token." },
        { status: 400 }
      );
    }

    const verification = await verifyPasswordResetToken(token);
    if (!verification.valid) {
      return NextResponse.json(
        { valid: false, error: verification.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { valid: true, email: verification.userEmail },
      { status: 200 }
    );
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to verify token." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Reset token is required." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const result = await resetPasswordWithToken(token, password);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Password reset failed." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Password updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while resetting password." },
      { status: 500 }
    );
  }
}
