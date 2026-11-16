// src/lib/ai/types.ts
// AI Integration Architecture Types — Multi-Domain Aware

export interface ScopedStudentContext {
  academicDomain?: string;
  specialization?: string;
  educationLevel?: string;
  fieldOfStudy?: string;
  grade?: string;
  skills: string[];
  projectsSummary?: string;
  experienceSummary?: string;
  achievementsSummary?: string;
  certificationsSummary?: string;
  targetRole?: string;
  targetIndustry?: string;
}

export interface VerifiedReferenceContext {
  sourceName: string;
  officialReferenceFacts: Record<string, string | number | boolean>;
}

export interface AiTaskRequest {
  task: "RESUME_FEEDBACK" | "SOP_CRITIQUE" | "CAREER_PATH_SUGGESTION" | "INTERVIEW_COACH";
  studentContext: ScopedStudentContext;
  verifiedReferenceContext?: VerifiedReferenceContext;
  customPrompt?: string;
}

export interface AiTaskResponse<T = unknown> {
  success: boolean;
  data?: T;
  rawText?: string;
  error?: string;
  metadata: {
    provider: string;
    modelName: string;
    isAiGenerated: true;
    isStudentVerified: false;
    generatedAt: Date;
    tokensUsed?: number;
  };
}
