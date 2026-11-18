// src/app/api/auth/logout/route.ts
// POST /api/auth/logout — clears the session cookie

import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";

export async function POST(): Promise<NextResponse> {
  await clearSessionCookie();
  return NextResponse.json({ message: "Logged out." });
}
