// src/lib/crm/aeterna-one.ts
// Outbound Integration Adapter for Aeterna One (Sister Product CRM)
//
// Strictly uses company-approved documented APIs/webhooks.
// Features: Outbound contract, HMAC signature, idempotency key, AbortSignal timeout,
// bounded retries with exponential backoff, and strict dev/prod status isolation.

import crypto from "crypto";
import { db } from "@/lib/db";

export interface StudentLeadInput {
  userId: string;
  name: string;
  email: string;
  mobile?: string;
  city?: string;
  state?: string;
  educationLevel?: string;
  institution?: string;
  course?: string;
  careerInterest?: string;
  counsellorConsent: boolean;
}

export interface CrmSyncResult {
  leadId: string;
  status: "PENDING" | "SYNCED" | "DEV_MOCK_SYNCED" | "FAILED";
  message: string;
  isCredentialsConfigured: boolean;
  externalCrmId?: string;
  attempts: number;
}

export interface CrmOutboundPayload {
  eventId: string;
  eventType: "lead.counselling.requested";
  timestamp: string;
  idempotencyKey: string;
  data: {
    leadId: string;
    userId: string;
    name: string;
    email: string;
    mobile?: string;
    city?: string;
    state?: string;
    educationLevel?: string;
    institution?: string;
    course?: string;
    careerInterest?: string;
    counsellorConsent: boolean;
  };
}

const DEFAULT_TIMEOUT_MS = 5000;
const MAX_RETRIES = 3;

/**
 * Creates an HMAC-SHA256 signature for outgoing webhook payload verification.
 */
export function generateWebhookSignature(payload: string, secret: string): string {
  return "sha256=" + crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Stage and synchronize a lead with Aeterna One CRM.
 */
export async function stageCrmLead(
  input: StudentLeadInput,
  options?: {
    customEndpoint?: string;
    simulateFailureHeader?: boolean;
    maxRetries?: number;
    timeoutMs?: number;
  }
): Promise<CrmSyncResult> {
  const envWebhookUrl = process.env.AETERNA_ONE_CRM_WEBHOOK_URL;
  const envApiKey = process.env.AETERNA_ONE_CRM_API_KEY;
  const envSecret = process.env.AETERNA_ONE_CRM_SECRET || "dev-crm-webhook-secret-key";

  // Determine active endpoint
  let targetUrl = options?.customEndpoint || envWebhookUrl;
  const isDev = process.env.NODE_ENV !== "production";

  if (!targetUrl && isDev) {
    // Default to local development mock webhook when in development
    targetUrl = "http://localhost:3000/api/dev/mock-crm-webhook";
  }

  const isMockEndpoint = Boolean(targetUrl?.includes("/api/dev/mock-crm-webhook"));
  const isCredentialsConfigured = Boolean((envWebhookUrl && envApiKey) || isMockEndpoint);

  // 1. Create lead record locally in CareerEdge
  const lead = await db.crmLead.create({
    data: {
      userId: input.userId,
      name: input.name,
      email: input.email.toLowerCase(),
      mobile: input.mobile,
      city: input.city,
      state: input.state,
      educationLevel: input.educationLevel,
      institution: input.institution,
      course: input.course,
      careerInterest: input.careerInterest,
      counsellorConsent: input.counsellorConsent,
      syncStatus: "PENDING",
      syncAttempts: 0,
    },
  });

  // 2. If no endpoint available at all, keep as PENDING
  if (!targetUrl || (!isCredentialsConfigured && !isDev)) {
    return {
      leadId: lead.id,
      status: "PENDING",
      message:
        "Lead safely stored in CareerEdge. Aeterna One CRM integration is pending credentials (AETERNA_ONE_CRM_WEBHOOK_URL / API_KEY).",
      isCredentialsConfigured: false,
      attempts: 0,
    };
  }

  // 3. Prepare standard outbound contract
  const idempotencyKey = crypto.randomUUID();
  const payload: CrmOutboundPayload = {
    eventId: `evt_${crypto.randomBytes(8).toString("hex")}`,
    eventType: "lead.counselling.requested",
    timestamp: new Date().toISOString(),
    idempotencyKey,
    data: {
      leadId: lead.id,
      userId: input.userId,
      name: input.name,
      email: input.email,
      mobile: input.mobile,
      city: input.city,
      state: input.state,
      educationLevel: input.educationLevel,
      institution: input.institution,
      course: input.course,
      careerInterest: input.careerInterest,
      counsellorConsent: input.counsellorConsent,
    },
  };

  const payloadString = JSON.stringify(payload);
  const signature = generateWebhookSignature(payloadString, envSecret);
  const maxRetries = options?.maxRetries ?? MAX_RETRIES;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  let attempt = 0;
  let lastError: string | null = null;
  let externalCrmId: string | undefined;

  while (attempt < maxRetries) {
    attempt++;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-aeterna-signature": signature,
      "x-idempotency-key": idempotencyKey,
      Authorization: `Bearer ${envApiKey || "dev-mock-key"}`,
    };

    if (options?.simulateFailureHeader) {
      headers["x-mock-crm-action"] = "fail";
    }

    try {
      const response = await fetch(targetUrl, {
        method: "POST",
        headers,
        body: payloadString,
        signal: AbortSignal.timeout(timeoutMs),
      });

      const responseText = await response.text();
      let responseJson: Record<string, unknown> | null = null;
      try {
        responseJson = JSON.parse(responseText);
      } catch {
        // Not JSON
      }

      const isSuccess = response.ok;

      // Log this sync attempt
      await db.crmSyncLog.create({
        data: {
          leadId: lead.id,
          endpointUrl: targetUrl,
          requestData: payloadString,
          statusCode: response.status,
          responseData: responseText.slice(0, 2000),
          isSuccess,
        },
      });

      if (isSuccess) {
        externalCrmId =
          (responseJson?.externalCrmId as string) || `crm_${idempotencyKey.slice(0, 8)}`;
        const finalStatus = isMockEndpoint ? "DEV_MOCK_SYNCED" : "SYNCED";

        await db.crmLead.update({
          where: { id: lead.id },
          data: {
            syncStatus: finalStatus,
            syncAttempts: attempt,
            lastSyncAttempt: new Date(),
            externalCrmId,
            errorMessage: null,
          },
        });

        return {
          leadId: lead.id,
          status: finalStatus,
          message: isMockEndpoint
            ? "Simulated delivery to local Aeterna One mock receiver."
            : "Successfully synchronized with Aeterna One CRM.",
          isCredentialsConfigured: true,
          externalCrmId,
          attempts: attempt,
        };
      }

      // Non-2xx response from server
      lastError = `CRM returned HTTP ${response.status}: ${responseText.slice(0, 100)}`;

      // Don't retry on 4xx client errors (except 429 rate limit)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        break;
      }
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : "Network / timeout error";

      await db.crmSyncLog.create({
        data: {
          leadId: lead.id,
          endpointUrl: targetUrl,
          requestData: payloadString,
          statusCode: null,
          errorMessage: lastError,
          isSuccess: false,
        },
      });
    }

    // Wait before next retry (exponential backoff)
    if (attempt < maxRetries) {
      const delay = Math.min(200 * Math.pow(2, attempt - 1), 1000);
      await new Promise((res) => setTimeout(res, delay));
    }
  }

  // All attempts exhausted or unrecoverable error
  await db.crmLead.update({
    where: { id: lead.id },
    data: {
      syncStatus: "FAILED",
      syncAttempts: attempt,
      lastSyncAttempt: new Date(),
      errorMessage: lastError,
    },
  });

  return {
    leadId: lead.id,
    status: "FAILED",
    message: `Aeterna One sync failed after ${attempt} attempts: ${lastError}`,
    isCredentialsConfigured: true,
    attempts: attempt,
  };
}
