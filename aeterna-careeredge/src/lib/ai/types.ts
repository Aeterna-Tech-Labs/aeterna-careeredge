// src/lib/ai/types.ts
// AI Integration Architecture Types — Multi-Domain & Monetization Aware (Day 2 Part 9)

export type AiOperationCategory =
  | "EXTRACTION"
  | "CLASSIFICATION"
  | "RESUME_CREATION"
  | "RESUME_REVIEW"
  | "LINKEDIN_ANALYSIS"
  | "LINKEDIN_OPTIMIZATION"
  | "JOB_MATCH"
  | "READINESS_REPORT"
  | "CAREER_GUIDE"
  | "INTERVIEW_PREP"
  | "TRUTH_CHECK"
  | "ROLE_FIT";

export type AiModelTier = "FAST" | "QUALITY";

export interface ScopedStudentContext {
  userId?: string;
  name?: string;
  academicDomain?: string;
  specialization?: string;
  educationLevel?: string;
  institution?: string;
  course?: string;
  grade?: string;
  skills: string[];
  projectsSummary?: string;
  experienceSummary?: string;
  achievementsSummary?: string;
  certificationsSummary?: string;
  targetRole?: string;
  targetIndustry?: string;
  preferredJobRole?: string;
  evidenceSummary?: string;
  summary?: string;
  educationSummary?: string;
}

export interface VerifiedReferenceContext {
  sourceName: string;
  officialReferenceFacts: Record<string, string | number | boolean | string[]>;
}

export interface AiTaskRequest {
  operation: AiOperationCategory;
  modelTier?: AiModelTier; // defaults to FAST unless QUALITY is explicitly needed
  studentContext: ScopedStudentContext;
  verifiedReferenceContext?: VerifiedReferenceContext;
  customPrompt?: string;
  schemaDescription: string;
  userId?: string;
  documentAttachment?: {
    mimeType: string;
    base64Data: string;
  };
}

export interface AiTokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  estimatedCostInr: number;
}

export interface AiTaskResponse<T = unknown> {
  success: boolean;
  data?: T;
  rawText?: string;
  error?: string;
  cached?: boolean;
  metadata: {
    provider: string;
    model: string;
    tier: AiModelTier;
    latencyMs: number;
    usage: AiTokenUsage;
    isAiGenerated: true;
    isStudentVerified: false;
    generatedAt: Date;
  };
}
