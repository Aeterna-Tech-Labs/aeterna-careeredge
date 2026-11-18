// src/app/api/passport/deduplicate/route.ts
// On-demand Career Passport deduplication & consolidation endpoint

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { deduplicateUserPassport } from "@/lib/passport/deduplication";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const summary = await deduplicateUserPassport(session.userId);

    return NextResponse.json({
      success: true,
      summary,
      message:
        summary.totalRemoved > 0
          ? `Consolidated and removed ${summary.totalRemoved} duplicate records from your Career Passport.`
          : "Your Career Passport has zero duplicate entries.",
    });
  } catch (err: unknown) {
    console.error("[Passport Deduplicate Error]", err);
    return NextResponse.json(
      { error: (err as Error).message || "Deduplication failed." },
      { status: 500 }
    );
  }
}
