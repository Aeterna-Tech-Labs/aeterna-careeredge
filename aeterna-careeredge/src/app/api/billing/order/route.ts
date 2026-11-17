// src/app/api/billing/order/route.ts
// Create Razorpay Order for Plan Upgrade

import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { PLANS } from "@/lib/monetization/plans";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const planId = body.planId || "PREMIUM";
    const selectedPlan = PLANS[planId] || PLANS.PREMIUM;

    const keyId = (process.env.RAZORPAY_KEY_ID || process.env["RAZORPAY_KEY_ID "] || "").trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || process.env["RAZORPAY_KEY_SECRET "] || "").trim();

    const amountInPaise = selectedPlan.priceInr * 100;

    if (keyId && keySecret) {
      try {
        const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
        const res = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${authHeader}`,
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: "INR",
            receipt: `rcpt_${session.userId.slice(-6)}_${Date.now()}`,
            notes: {
              userId: session.userId,
              planId: selectedPlan.id,
            },
          }),
        });

        if (res.ok) {
          const order = await res.json();
          return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId,
            isLive: true,
          });
        }
      } catch (err) {
        console.warn("Razorpay API call failed, falling back to test order:", err);
      }
    }

    // Dev/Test Fallback Order
    const testOrderId = `order_test_${Date.now()}`;
    return NextResponse.json({
      orderId: testOrderId,
      amount: amountInPaise,
      currency: "INR",
      keyId: keyId || "rzp_test_dev",
      isLive: false,
    });
  } catch (error) {
    console.error("Error creating billing order:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}
