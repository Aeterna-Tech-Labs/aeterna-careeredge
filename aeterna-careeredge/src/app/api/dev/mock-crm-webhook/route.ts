// src/app/api/dev/mock-crm-webhook/route.ts
// Local development mock receiver for Aeterna One CRM outbound webhooks.
// Strictly rejected (404) in production.

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// In-memory set for idempotency check during server lifetime
const processedIdempotencyKeys = new Set<string>();

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // 1. Strict production block
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
  }

  // 2. Failure simulation header check (for testing retries and error handling)
  const simulatedAction = req.headers.get("x-mock-crm-action");
  if (simulatedAction === "fail") {
    console.warn("⚠️ [MOCK CRM] Simulating 500 Internal Server Error as requested by test/header");
    return NextResponse.json(
      { error: "Simulated Aeterna One CRM server error." },
      { status: 500 }
    );
  }

  // 3. Idempotency check
  const idempotencyKey = req.headers.get("x-idempotency-key");
  if (idempotencyKey && processedIdempotencyKeys.has(idempotencyKey)) {
    console.log(`ℹ️ [MOCK CRM] Duplicate webhook received for idempotency key: ${idempotencyKey}`);
    return NextResponse.json(
      {
        status: "success",
        duplicate: true,
        message: "Webhook already processed (Idempotent response)",
        idempotencyKey,
      },
      { status: 200 }
    );
  }

  // 4. Parse payload
  let payload: Record<string, unknown> | null = null;
  let rawBody = "";
  try {
    rawBody = await req.text();
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  // 5. Signature verification (if secret configured or provided)
  const signature = req.headers.get("x-aeterna-signature");
  const webhookSecret = process.env.AETERNA_ONE_CRM_SECRET || "dev-crm-webhook-secret-key";

  if (signature) {
    const expectedSignature =
      "sha256=" +
      crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");

    if (signature !== expectedSignature) {
      console.warn("⚠️ [MOCK CRM] HMAC Signature mismatch:", { received: signature, expected: expectedSignature });
      // In dev we still proceed or report signature failure
    }
  }

  if (idempotencyKey) {
    processedIdempotencyKeys.add(idempotencyKey);
  }

  const externalCrmId = "aeterna_lead_" + Math.random().toString(36).substring(2, 10);
  const data = (payload?.data as Record<string, unknown>) || {};
  const student = (payload?.student as Record<string, unknown>) || {};
  const studentName = String(data.name || student.name || "Student");
  const studentEmail = String(data.email || student.email || "unknown@aeterna.education");

  console.log("\n==================================================");
  console.log("📥 [MOCK CRM WEBHOOK RECEIVED]");
  console.log(`🆔 External Lead ID: ${externalCrmId}`);
  console.log(`👤 Student: ${studentName} (${studentEmail})`);
  console.log(`🔑 Idempotency Key: ${idempotencyKey || "none"}`);
  console.log(`🔏 Signature: ${signature || "none"}`);
  console.log("==================================================\n");

  return NextResponse.json({
    status: "success",
    leadId: (data.leadId as string) || (payload?.leadId as string) || "mock_lead",
    externalCrmId,
    receivedAt: new Date().toISOString(),
  });
}
