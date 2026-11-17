// src/lib/linkedin/optimizer.ts
// LinkedIn Section-by-Section AI Optimizer (Day 2 Part 4.5)
// Generates before/after improvements, rationale, and keyword recommendations with dual model tiers.

import { ServerAiService } from "@/lib/ai/provider";

export type LinkedInSectionType = "HEADLINE" | "ABOUT" | "EXPERIENCE" | "FEATURED";

export interface OptimizedSectionResult {
  sectionType: LinkedInSectionType;
  originalText?: string;
  improvedText: string;
  whyBetter: string;
  keywordsTargeted: string[];
  supportingEvidence: string[];
  isAiGenerated: boolean;
}

export async function optimizeLinkedInSection(params: {
  userId: string;
  sectionType: LinkedInSectionType;
  domain: string;
  targetRole: string;
  currentText?: string;
  skills: string[];
  evidenceSummary?: string;
  institution?: string;
  course?: string;
}): Promise<OptimizedSectionResult> {
  const {
    userId,
    sectionType,
    domain,
    targetRole,
    currentText = "",
    skills,
    evidenceSummary = "Verified academic coursework and projects.",
    institution = "Higher Education Institute",
    course = "Graduate Degree",
  } = params;

  const aiService = new ServerAiService(15000);
  const modelTier = sectionType === "ABOUT" ? "QUALITY" : "FAST";

  const prompt = `You are the Aeterna CareerEdge LinkedIn Optimization Engine.
Optimize the "${sectionType}" section for a student aiming for "${targetRole}" in "${domain}".
Current Student Profile:
- Course: ${course} from ${institution}
- Verified Skills: ${skills.join(", ") || "Domain fundamentals"}
- Evidence: ${evidenceSummary}
- Current Draft: "${currentText}"

CRITICAL INVARIANTS:
1. Never invent fake companies, metrics, or degrees.
2. Produce an improvedText tailored strictly to ${domain}.
3. Provide whyBetter explaining the recruiter impact.
4. List keywordsTargeted.
5. If sectionType is HEADLINE, format as: [Target Role] | [Core Specialization] | [Key Verified Achievement or Degree].
6. If sectionType is ABOUT, create a compelling 3-paragraph narrative.
7. If sectionType is FEATURED, recommend 2-3 specific portfolio pieces, repository links or clinical logs the student should pin.

Output strictly valid JSON matching schema.`;

  const aiRes = await aiService.generateStructuredAdvice<{
    improvedText: string;
    whyBetter: string;
    keywordsTargeted: string[];
    supportingEvidence: string[];
  }>({
    operation: "LINKEDIN_OPTIMIZATION",
    modelTier,
    userId,
    studentContext: {
      userId,
      academicDomain: domain,
      targetRole,
      skills,
      course,
      institution,
      evidenceSummary,
    },
    customPrompt: prompt,
    schemaDescription:
      "{ improvedText: string, whyBetter: string, keywordsTargeted: string[], supportingEvidence: string[] }",
  });

  if (aiRes.success && aiRes.data) {
    return {
      sectionType,
      originalText: currentText || undefined,
      improvedText: aiRes.data.improvedText,
      whyBetter: aiRes.data.whyBetter,
      keywordsTargeted: aiRes.data.keywordsTargeted || [],
      supportingEvidence: aiRes.data.supportingEvidence || [evidenceSummary],
      isAiGenerated: true,
    };
  }

  // Deterministic Fallback per Section
  if (sectionType === "HEADLINE") {
    return {
      sectionType,
      originalText: currentText,
      improvedText: `${targetRole} | ${course} Graduate | ${skills.slice(0, 2).join(" & ") || "Domain Specialist"}`,
      whyBetter: `Uses high-intent recruiter search keywords for ${targetRole} and highlights verified qualification.`,
      keywordsTargeted: [targetRole, ...skills.slice(0, 3)],
      supportingEvidence: [evidenceSummary],
      isAiGenerated: false,
    };
  } else if (sectionType === "ABOUT") {
    return {
      sectionType,
      originalText: currentText,
      improvedText: `Aspiring ${targetRole} with an academic foundation in ${course} from ${institution}.\n\nPassionate about ${domain} best practices and delivering ethical, evidence-backed outcomes. Experienced with hands-on practice in ${skills.slice(0, 3).join(", ") || "core competencies"}.\n\nActively seeking opportunities to contribute to high-impact teams. Connect with me or review my verified credentials on CareerEdge.`,
      whyBetter: "Structured 3-paragraph format proven to boost recruiter response and profile readability.",
      keywordsTargeted: [targetRole, domain, ...skills.slice(0, 4)],
      supportingEvidence: [evidenceSummary],
      isAiGenerated: false,
    };
  } else if (sectionType === "FEATURED") {
    return {
      sectionType,
      originalText: currentText,
      improvedText: `1. Verified ${course} Degree Transcript & Academic Honors\n2. Primary Capstone Project / Clinical Rotation Documentation\n3. Proof Bank Credential: ${skills[0] || "Core Specialization"} Certificate`,
      whyBetter: "Featuring concrete proof items converts profile views into recruiter interview invitations.",
      keywordsTargeted: ["Portfolio", "Evidence", "Verified Credentials"],
      supportingEvidence: [evidenceSummary],
      isAiGenerated: false,
    };
  }

  return {
    sectionType,
    originalText: currentText,
    improvedText: currentText || `Dedicated ${targetRole} professional with verified background in ${domain}.`,
    whyBetter: "Clarifies core domain strengths.",
    keywordsTargeted: [targetRole],
    supportingEvidence: [evidenceSummary],
    isAiGenerated: false,
  };
}
