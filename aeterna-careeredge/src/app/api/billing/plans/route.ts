// src/app/api/billing/plans/route.ts
// Retrieve available plans and current user subscription details

import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { PLANS } from "@/lib/monetization/plans";
import { getUserPlan } from "@/lib/monetization/entitlements";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userPlanInfo = await getUserPlan(session.userId);

    return NextResponse.json({
      plans: Object.values(PLANS),
      currentPlan: userPlanInfo.planConfig,
      subscription: {
        status: userPlanInfo.status,
        validUntil: userPlanInfo.validUntil,
        source: userPlanInfo.source,
      },
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || process.env["RAZORPAY_KEY_ID "] || null,
    });
  } catch (error) {
    console.error("Error retrieving billing plans:", error);
    return NextResponse.json(
      { error: "Failed to load billing plans" },
      { status: 500 }
    );
  }
}
