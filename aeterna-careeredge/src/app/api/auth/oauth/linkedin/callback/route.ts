// src/app/api/auth/oauth/linkedin/callback/route.ts
// LinkedIn OpenID Connect Callback Handler (Day 2 Part 4.1)

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  exchangeLinkedInCode,
  fetchLinkedInUserInfo,
  linkLinkedInAccount,
} from "@/lib/linkedin/oauth";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  if (error) {
    return NextResponse.redirect(
      new URL(`/linkedin?error=${encodeURIComponent(errorDescription || error)}`, req.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/linkedin?error=Missing+authorization+code+or+state", req.url)
    );
  }

  // Verify State Cookie
  const savedState = req.cookies.get("linkedin_oauth_state")?.value;
  if (!savedState || savedState !== state) {
    return NextResponse.redirect(
      new URL("/linkedin?error=Invalid+state+parameter+detected", req.url)
    );
  }

  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const redirectUri = `${protocol}://${host}/api/auth/oauth/linkedin/callback`;

    // 1. Exchange Code on Server
    const accessToken = await exchangeLinkedInCode({ code, redirectUri });

    // 2. Fetch UserInfo
    const identity = await fetchLinkedInUserInfo(accessToken);

    // 3. Link account to student profile
    await linkLinkedInAccount(session.userId, identity);

    const res = NextResponse.redirect(new URL("/linkedin?connected=true", req.url));
    res.cookies.delete("linkedin_oauth_state");
    res.cookies.delete("linkedin_oauth_nonce");
    return res;
  } catch (err: unknown) {
    return NextResponse.redirect(
      new URL(`/linkedin?error=${encodeURIComponent((err as Error).message || "Connection failed")}`, req.url)
    );
  }
}
