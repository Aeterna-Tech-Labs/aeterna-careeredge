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

export interface OptimizeLinkedInParams {
  userId: string;
  sectionType: LinkedInSectionType;
  domain: string;
  targetRole: string;
  currentText?: string;
  skills: string[];
  evidenceSummary?: string;
  institution?: string;
  course?: string;
  experiences?: Array<{ title: string; company: string; duration?: string; description?: string }>;
  variation?: number;
  bypassCache?: boolean;
}

export async function optimizeLinkedInSection(params: OptimizeLinkedInParams): Promise<OptimizedSectionResult> {
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
    experiences = [],
    variation = 1,
    bypassCache = true,
  } = params;

  const aiService = new ServerAiService(15000);
  const modelTier = sectionType === "ABOUT" ? "QUALITY" : "FAST";

  const expSummary =
    experiences.length > 0
      ? experiences
          .map(
            (e, i) =>
              `${i + 1}. ${e.title} at ${e.company}${e.duration ? ` (${e.duration})` : ""}${e.description ? `: ${e.description}` : ""}`
          )
          .join("\n")
      : "Hands-on academic coursework and practical projects.";

  const variationDirective =
    variation === 2
      ? "Variation Style #2: Focus strongly on technical depth, core stack specialization, and framework proficiencies."
      : variation === 3
      ? "Variation Style #3: Focus strongly on business impact, metrics, velocity, and leadership."
      : variation > 3
      ? `Variation Style #${variation}: Provide a distinctive creative alternative with fresh phrasing, strong action verbs, and alternative framing.`
      : "Variation Style #1: Balance recruiter search keywords with core verified qualifications.";

  const prompt = `You are the Aeterna CareerEdge LinkedIn Optimization Engine.
Optimize the "${sectionType}" section for a student aiming for "${targetRole}" in "${domain}".
Current Student Profile:
- Course: ${course} from ${institution}
- Verified Skills: ${skills.join(", ") || "Domain fundamentals"}
- Evidence: ${evidenceSummary}
- Work / Project History:
${expSummary}
- Current Draft: "${currentText}"

VARIATION DIRECTIVE (Iteration #${variation}):
${variationDirective}
Do NOT produce identical phrasing to prior standard outputs. Use distinctive vocabulary and sentence structure.

CRITICAL INVARIANTS:
1. Never invent fake companies, metrics, or degrees. Use the candidate's real experiences and skills.
2. Produce an improvedText tailored strictly to ${domain}.
3. Provide whyBetter explaining the recruiter impact.
4. List keywordsTargeted.
5. If sectionType is HEADLINE, format as: [Target Role] | [Core Specialization] | [Key Verified Achievement or Degree].
6. If sectionType is ABOUT, create a compelling 3-paragraph narrative.
7. If sectionType is FEATURED, recommend 2-3 specific portfolio pieces, repository links or clinical logs the student should pin.
8. If sectionType is EXPERIENCE, format the role(s) into high-impact, quantifiable bullet points using the Google/Amazon XYZ formula ("Accomplished [X] as measured by [Y], by doing [Z]"). Include company name and role.

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
    bypassCache,
    temperature: 0.75,
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

  // Deterministic Fallback per Section with Variation Support
  if (sectionType === "HEADLINE") {
    let headlineText: string;
    if (variation === 2) {
      headlineText = `${targetRole} | Full-Stack & ${skills[0] || "Modern Web"} Specialist | Scalable Systems | ${institution}`;
    } else if (variation === 3) {
      headlineText = `Aspiring ${targetRole} | High-Performance Web & Architecture with ${skills.slice(0, 3).join(", ")} | ${course}`;
    } else {
      headlineText = `${targetRole} | ${course} Graduate | ${skills.slice(0, 2).join(" & ") || "Domain Specialist"}`;
    }

    return {
      sectionType,
      originalText: currentText,
      improvedText: headlineText,
      whyBetter: `Uses high-intent recruiter search keywords for ${targetRole} and highlights verified qualification (Variation #${variation}).`,
      keywordsTargeted: [targetRole, ...skills.slice(0, 3)],
      supportingEvidence: [evidenceSummary],
      isAiGenerated: false,
    };
  } else if (sectionType === "ABOUT") {
    let aboutText: string;
    if (variation === 2) {
      aboutText = `Results-driven ${targetRole} specializing in ${domain} technologies.\n\nDemonstrated success implementing ${skills.slice(0, 3).join(", ") || "core frameworks"} through structured academic coursework and hands-on laboratory projects at ${institution}. Committed to writing maintainable, tested, and secure code.\n\nOpen to high-growth engineering roles and technical collaborations. Connect with me to review my verified portfolio.`;
    } else if (variation === 3) {
      aboutText = `Forward-thinking ${targetRole} with an academic background in ${course} from ${institution}.\n\nPassionate about turning complex requirements into elegant, high-impact deliverables. Deep interest in ${skills.slice(0, 2).join(" and ") || domain} and scalable architectures.\n\nActively interviewing for entry-level positions and internships. Feel free to connect or view my CareerEdge proof vault.`;
    } else {
      aboutText = `Aspiring ${targetRole} with an academic foundation in ${course} from ${institution}.\n\nPassionate about ${domain} best practices and delivering ethical, evidence-backed outcomes. Experienced with hands-on practice in ${skills.slice(0, 3).join(", ") || "core competencies"}.\n\nActively seeking opportunities to contribute to high-impact teams. Connect with me or review my verified credentials on CareerEdge.`;
    }

    return {
      sectionType,
      originalText: currentText,
      improvedText: aboutText,
      whyBetter: `Structured 3-paragraph format proven to boost recruiter response and profile readability (Variation #${variation}).`,
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
  } else if (sectionType === "EXPERIENCE") {
    const topExp = experiences[0];
    const roleTitle = topExp?.title || targetRole;
    const comp = topExp?.company || "Organization";
    const skillList = skills.slice(0, 3).join(", ") || "core domain tools";

    let expBullets: string;
    if (variation === 2) {
      expBullets = `${roleTitle} | ${comp}\n• Architected and shipped scalable components utilizing ${skillList}, adhering strictly to code review and testing benchmarks.\n• Identified and resolved application bottlenecks, driving improvements in execution speed and system resilience.\n• Authored comprehensive technical documentation and collaborated in agile sprints to meet tight sprint deadlines.`;
    } else if (variation === 3) {
      expBullets = `${roleTitle} | ${comp}\n• Spearheaded core software development workflows in ${skillList}, translating product requirements into production-ready software.\n• Partnered with senior engineers and stakeholders to streamline deployments and enhance maintainability.\n• Championed testing best practices and bug resolution, maintaining zero regression defects across released components.`;
    } else {
      expBullets = `${roleTitle} | ${comp}\n• Engineered and delivered core project deliverables leveraging ${skillList}, ensuring compliance with quality and performance standards.\n• Collaborated cross-functionally to refine requirements, reduce turnaround times, and debug complex workflows.\n• Documented architectural workflows, testing pipelines, and deployment procedures to accelerate team velocity.`;
    }

    return {
      sectionType,
      originalText: currentText,
      improvedText: expBullets,
      whyBetter: `Formats experience using the recruiter-preferred STAR / XYZ impact formula, directly showcasing verified competence in ${skillList} (Variation #${variation}).`,
      keywordsTargeted: [targetRole, ...skills.slice(0, 3)],
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
