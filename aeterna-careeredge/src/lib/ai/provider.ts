// src/lib/ai/provider.ts
// Server-Side AI Provider Abstraction (Day 2 Part 9)
// Strict separation of student truth vs AI advice, cost control, token tracking, and environment-driven model selection.

import crypto from "crypto";
import type {
  AiModelTier,
  AiTaskRequest,
  AiTaskResponse,
  AiTokenUsage,
} from "./types";
import { recordUsage } from "@/lib/monetization/entitlements";
import { sanitizeContextForAi } from "./guardrails";

// ── In-Memory Cache for Deduplication ──────────────────────────────────────────
const RESPONSE_CACHE = new Map<string, { response: unknown; expiresAt: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// ── Cost Benchmarking Defaults (per 1,000,000 tokens in USD) ───────────────────
// FAST (e.g. Gemini 2.0 Flash / Haiku): $0.10 input, $0.40 output
// QUALITY (e.g. Gemini 2.0 Pro / Claude Sonnet): $1.25 input, $5.00 output
const USD_TO_INR = 86.5;

function calculateCost(tier: AiModelTier, inputTokens: number, outputTokens: number): { usd: number; inr: number } {
  const isFast = tier === "FAST";
  const inputRate = isFast ? 0.10 / 1_000_000 : 1.25 / 1_000_000;
  const outputRate = isFast ? 0.40 / 1_000_000 : 5.00 / 1_000_000;

  const costUsd = inputTokens * inputRate + outputTokens * outputRate;
  const costInr = costUsd * USD_TO_INR;

  return {
    usd: Number(costUsd.toFixed(6)),
    inr: Number(costInr.toFixed(4)),
  };
}

export class ServerAiService {
  private timeoutMs: number;

  constructor(timeoutMs = 15000) {
    this.timeoutMs = timeoutMs;
  }

  /**
   * Determine which provider to use based on environment.
   */
  getProviderName(): string {
    return (process.env.AI_PROVIDER || "mock").toLowerCase();
  }

  /**
   * Determine the configured model name for a given tier.
   * No hardcoded model names in business logic.
   */
  getModelName(tier: AiModelTier): string {
    if (tier === "QUALITY") {
      return process.env.AI_MODEL_QUALITY || "gemini-3.5-flash-lite";
    }
    return process.env.AI_MODEL_FAST || "gemini-3.5-flash-lite";
  }

  /**
   * Main entrypoint: generates structured advice with token tracking, caching, and guardrails.
   */
  async generateStructuredAdvice<T>(
    request: AiTaskRequest
  ): Promise<AiTaskResponse<T>> {
    const startTime = Date.now();
    const tier: AiModelTier = request.modelTier ?? "FAST";
    const provider = this.getProviderName();
    const model = this.getModelName(tier);

    // 1. Sanitize student context (never leak direct PII)
    const sanitizedStudentContext = sanitizeContextForAi(
      request.studentContext as unknown as Record<string, unknown>
    );

    // 2. Hash request payload for caching & deduplication
    const cacheKey = crypto
      .createHash("sha256")
      .update(
        JSON.stringify({
          operation: request.operation,
          tier,
          student: sanitizedStudentContext,
          reference: request.verifiedReferenceContext,
          prompt: request.customPrompt,
        })
      )
      .digest("hex");

    const cachedEntry = RESPONSE_CACHE.get(cacheKey);
    if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
      return {
        ...(cachedEntry.response as AiTaskResponse<T>),
        cached: true,
      };
    }

    // 3. Check for API keys
    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.ANTHROPIC_API_KEY ||
      process.env.OPENAI_API_KEY;

    let response: AiTaskResponse<T>;

    // 4. Execute AI call or development mock
    if (!apiKey || provider === "mock") {
      response = this.executeMockOperation<T>({
        request,
        sanitizedContext: sanitizedStudentContext,
        tier,
        provider: "DEV_MOCK",
        model: `mock-${tier.toLowerCase()}`,
        startTime,
      });
    } else {
      // Real API integration adapter
      response = await this.executeRealProvider<T>({
        request,
        sanitizedContext: sanitizedStudentContext,
        tier,
        provider,
        model,
        apiKey,
        startTime,
      });
    }

    // 5. Cache successful responses
    if (response.success && response.data) {
      RESPONSE_CACHE.set(cacheKey, {
        response,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
    }

    // 6. Record usage metrics in database if user ID provided
    if (request.userId) {
      try {
        await recordUsage({
          userId: request.userId,
          featureKey: request.operation,
          operationType: tier === "QUALITY" ? "REVIEW" : "EXTRACTION",
          inputTokens: response.metadata.usage.inputTokens,
          outputTokens: response.metadata.usage.outputTokens,
          estimatedCost: response.metadata.usage.estimatedCostInr,
          provider: response.metadata.provider,
          model: response.metadata.model,
          latencyMs: response.metadata.latencyMs,
        });
      } catch (err) {
        console.error("[AiService] Failed to record usage metric:", err);
      }
    }

    return response;
  }

  /**
   * Real provider caller with AbortController timeout.
   */
  private async executeRealProvider<T>(params: {
    request: AiTaskRequest;
    sanitizedContext: Record<string, unknown>;
    tier: AiModelTier;
    provider: string;
    model: string;
    apiKey: string;
    startTime: number;
  }): Promise<AiTaskResponse<T>> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      if (params.provider === "gemini") {
        const model = params.model || "gemini-3.5-flash-lite";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${params.apiKey}`;

        const promptText = `You are the Aeterna CareerEdge AI Engine.
You must return ONLY a raw JSON object (no markdown, no backticks, no code blocks) conforming strictly to this schema:
${params.request.schemaDescription}

Operation: ${params.request.operation}
Student Context:
${JSON.stringify(params.sanitizedContext, null, 2)}
${params.request.verifiedReferenceContext ? `Verified References:\n${JSON.stringify(params.request.verifiedReferenceContext, null, 2)}\n` : ""}
Task Instructions:
${params.request.customPrompt || "Perform this career advisory operation truthfully according to the student context."}

IMPORTANT PRODUCT INVARIANTS:
1. Never invent credentials, college names, grades, companies, dates, or metrics.
2. If evidence is lacking, state that evidence is needed.
3. No hiring probability percentages.
4. Keep advice domain-specific and actionable.`;

        let geminiRes: Response | null = null;
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            geminiRes = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              signal: controller.signal,
              body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: {
                  temperature: 0.2,
                  responseMimeType: "application/json",
                },
              }),
            });
            if (geminiRes.ok) break;
            if ((geminiRes.status === 503 || geminiRes.status === 429) && attempt === 0) {
              await new Promise((r) => setTimeout(r, 1200));
              continue;
            }
            break;
          } catch (fetchErr) {
            if (attempt === 0) {
              await new Promise((r) => setTimeout(r, 1200));
              continue;
            }
            throw fetchErr;
          }
        }

        clearTimeout(timer);

        if (geminiRes && geminiRes.ok) {
          const raw = await geminiRes.json();
          const candidateText = raw?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            const parsedData = JSON.parse(candidateText.trim()) as T;
            const inputTokens = raw?.usageMetadata?.promptTokenCount || 250;
            const outputTokens = raw?.usageMetadata?.candidatesTokenCount || 150;
            const cost = calculateCost(params.tier, inputTokens, outputTokens);
            const latencyMs = Date.now() - params.startTime;

            return {
              success: true,
              data: parsedData,
              metadata: {
                provider: "google-gemini",
                model,
                tier: params.tier,
                latencyMs,
                usage: {
                  inputTokens,
                  outputTokens,
                  totalTokens: inputTokens + outputTokens,
                  estimatedCostUsd: cost.usd,
                  estimatedCostInr: cost.inr,
                },
                isAiGenerated: true,
                isStudentVerified: false,
                generatedAt: new Date(),
              },
            };
          }
        } else {
          clearTimeout(timer);
          const status = geminiRes?.status || 500;
          const statusText = geminiRes?.statusText || "Service Unavailable";
          const errText = geminiRes ? await geminiRes.text().catch(() => "") : "";
          console.error(`[AiService] Gemini API returned status ${status}: ${errText}`);
          return {
            success: false,
            error: `Gemini API returned HTTP ${status}: ${errText || statusText}`,
            metadata: {
              provider: "google-gemini",
              model,
              tier: params.tier,
              latencyMs: Date.now() - params.startTime,
              usage: {
                inputTokens: 0,
                outputTokens: 0,
                totalTokens: 0,
                estimatedCostUsd: 0,
                estimatedCostInr: 0,
              },
              isAiGenerated: true,
              isStudentVerified: false,
              generatedAt: new Date(),
            },
          };
        }
      }

      clearTimeout(timer);
      return this.executeMockOperation<T>(params);
    } catch (err: unknown) {
      clearTimeout(timer);
      const isTimeout = (err as Error)?.name === "AbortError";
      const latencyMs = Date.now() - params.startTime;

      return {
        success: false,
        error: isTimeout
          ? `AI request timed out after ${this.timeoutMs}ms.`
          : `AI service error: ${(err as Error)?.message || "Unknown error"}`,
        metadata: {
          provider: params.provider,
          model: params.model,
          tier: params.tier,
          latencyMs,
          usage: {
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
            estimatedCostUsd: 0,
            estimatedCostInr: 0,
          },
          isAiGenerated: true,
          isStudentVerified: false,
          generatedAt: new Date(),
        },
      };
    }
  }

  /**
   * Deterministic, domain-aware mock generator matching real schemas.
   * Produces realistic benchmarks across Nursing, Teaching, Commerce, IT, Law, Design, etc.
   */
  private executeMockOperation<T>(params: {
    request: AiTaskRequest;
    sanitizedContext: Record<string, unknown>;
    tier: AiModelTier;
    provider: string;
    model: string;
    startTime: number;
  }): AiTaskResponse<T> {
    const { request, sanitizedContext, tier, provider, model, startTime } = params;
    const domain = (request.studentContext.academicDomain as string) || "General Field";
    const role = (request.studentContext.targetRole as string) || "Professional Specialist";
    const latencyMs = Date.now() - startTime + Math.floor(Math.random() * 80 + 40);

    // Realistic token counts for benchmark calculation
    const inputTokens = 420 + Math.floor(Math.random() * 120);
    const outputTokens = 260 + Math.floor(Math.random() * 90);
    const cost = calculateCost(tier, inputTokens, outputTokens);

    const usage: AiTokenUsage = {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      estimatedCostUsd: cost.usd,
      estimatedCostInr: cost.inr,
    };

    let mockData: unknown = {};

    switch (request.operation) {
      case "RESUME_REVIEW":
        mockData = {
          domain,
          targetRole: role,
          overallScore: 84,
          strengths: [
            `Verified academic foundation from accredited institution in ${domain}.`,
            "Practical coursework and relevant skills are clearly stated.",
          ],
          criticalGaps: [
            `Needs quantifiable outcome metrics for project entries relevant to ${role}.`,
            "Include official certifications or clinical/practical exposure documentation.",
          ],
          unsupportedClaims: [],
          recommendedKeywords: [
            "Domain Competencies",
            "Quality Assurance",
            "Standard Operating Procedures",
            "Cross-functional Collaboration",
          ],
        };
        break;

      case "TRUTH_CHECK":
        mockData = {
          verifiedClaimsCount: request.studentContext.skills.length,
          flaggedItems: [],
          integrityScore: 100,
          status: "PASSED",
          summary: "All resume statements trace directly to Career Passport records.",
        };
        break;

      case "ROLE_FIT":
        mockData = {
          domain,
          matchedRoles: [
            {
              roleTitle: role,
              fitType: "closer fit",
              whatYouHave: request.studentContext.skills.slice(0, 3),
              whatIsMissing: ["Advanced domain accreditation", "1 capstone project"],
              entryLevelPath: "Graduate Trainee / Associate Specialist",
            },
            {
              roleTitle: `Senior ${role}`,
              fitType: "stretch role",
              whatYouHave: request.studentContext.skills.slice(0, 2),
              whatIsMissing: ["2+ years specialized domain experience", "Independent case handling"],
              entryLevelPath: "Requires intermediate specialization first",
            },
          ],
        };
        break;

      case "CAREER_GUIDE":
        mockData = {
          answer: `For your background in ${domain}, your strongest next milestone is to add practical evidence to your Evidence Vault and verify your top competencies.`,
          nextBestStep: "Upload proof of your latest project or certificate.",
          actionRoute: "/evidence-vault",
          citedSources: ["Career Passport", `${domain} Professional Reference Standards`],
        };
        break;

      default:
        mockData = {
          operation: request.operation,
          domain,
          targetRole: role,
          recommendation: `Verified guidance tailored for ${domain} - ${role}.`,
          sanitizedContext,
        };
    }

    return {
      success: true,
      data: mockData as T,
      metadata: {
        provider,
        model,
        tier,
        latencyMs,
        usage,
        isAiGenerated: true,
        isStudentVerified: false,
        generatedAt: new Date(),
      },
    };
  }
}

// Singleton export
export const aiService = new ServerAiService();
