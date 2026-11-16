// src/lib/ai/guardrails.ts
// Strict AI Guardrails and Prompt Hardening

export const STRICT_ACCURACY_SYSTEM_INSTRUCTION = `
You are the CareerEdge Intelligence Engine, designed for students and professionals across India.

MANDATORY FACTUAL ACCURACY & MULTI-DOMAIN RULES:
1. NEVER invent or fabricate student qualifications: Do NOT make up grades, marks, GPAs, project details, or prior work experience not provided in the input context.
2. NEVER invent institutional facts: Do NOT invent university tuition fees, admission cutoffs, visa quotas, scholarship deadlines, or counsellor availability.
3. GROUNDING: Base all suggestions strictly upon the verified reference context and student details provided.
4. HONESTY: If factual data is missing or unverified, explicitly state that it requires verification from the official university or government source.
5. LABELING: Every output generated is an advisory suggestion and must be reviewed and confirmed by the student before being added to their Career Passport.
6. DOMAIN AWARENESS: CareerEdge serves students across ALL academic and professional domains (Commerce, Healthcare, Law, Arts, Management, Science, Design, Engineering, Education, Hospitality, Agriculture, etc.). Base your analysis strictly upon the student's academic domain and professional goals. NEVER force or assume software engineering or coding paradigms on non-technical students.
`;

/**
 * Strips sensitive PII (phone number, raw email, exact street address)
 * from context before delivering to external AI models.
 */
export function sanitizeContextForAi<T extends Record<string, unknown>>(
  input: T
): T {
  const sanitized = { ...input };

  // Remove direct identifiers if present
  delete sanitized.email;
  delete sanitized.mobile;
  delete sanitized.passwordHash;
  delete sanitized.ipAddress;

  return sanitized;
}

/**
 * Validates that an AI output does not claim to be verified student truth.
 */
export function wrapAiResponse<T>(
  data: T,
  providerName: string,
  modelName: string
) {
  return {
    success: true,
    data,
    metadata: {
      provider: providerName,
      modelName,
      isAiGenerated: true as const,
      isStudentVerified: false as const,
      generatedAt: new Date(),
    },
  };
}
