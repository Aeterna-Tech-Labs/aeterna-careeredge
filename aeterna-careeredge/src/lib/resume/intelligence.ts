// src/lib/resume/intelligence.ts
// Profession-Specific Resume Intelligence, Optimization & JD Alignment (Day 2 Part 3.4)
// Truth-enforcing analysis engine. Never invents skills or encourages unverified claims.

import { ServerAiService } from "@/lib/ai/provider";
import { getFrameworkForDomain, type DomainResumeFramework } from "./frameworks";
import { evaluateSkillEvidence } from "@/lib/evidence/service";

export interface ResumeReviewInput {
  userId: string;
  domain: string;
  targetRole: string;
  summary: string;
  skills: string[];
  educationSummary: string;
  experienceSummary?: string;
  projectsSummary?: string;
  jobDescription?: string;
}

export interface DetailedGapItem {
  requirement: string;
  candidateStatus: "MATCHED" | "PARTIAL" | "MISSING";
  evidenceOrContext: string;
  actionableFix: string;
}

export interface JdAlignmentResult {
  jobRoleExtracted?: string;
  roleReadinessVerdict: "STRONG_MATCH" | "COMPETITIVE_WITH_GAPS" | "REQUIRES_UPSKILLING";
  alignmentSummary: string;
  matchingSkills: string[];
  missingSkills: string[];
  unsupportedSkills: string[];
  evidenceRequired: string[];
  atsKeywordDensityScore: number; // 0 to 100
  atsKeywordsToIncorporate: string[];
  detailedGaps: DetailedGapItem[];
  actionableImprovements: string[];
  interviewTalkingPoints: string[];
}

export interface ResumeIntelligenceReport {
  domain: string;
  targetRole: string;
  completenessScore: number;
  atsReadabilityScore: number;
  evidenceCoverageScore: number;
  frameworkCompliance: {
    domainName: string;
    requiredSectionsPresent: string[];
    missingSections: string[];
    officialResearchSource: string;
  };
  jdAlignment?: JdAlignmentResult;
  skillsAudit: Record<string, { status: "SUPPORTED" | "NEEDS_EVIDENCE" | "UNSUPPORTED"; evidenceTitles: string[] }>;
  recommendations: string[];
  isAiGenerated: boolean;
  aiError?: string;
  aiMetadata?: {
    model: string;
    latencyMs: number;
    usage?: { inputTokens: number; outputTokens: number };
  };
}

export async function analyzeResumeIntelligence(input: ResumeReviewInput): Promise<ResumeIntelligenceReport> {
  const framework: DomainResumeFramework = getFrameworkForDomain(input.domain);
  const aiService = new ServerAiService(15000);

  // 1. Evaluate Evidence Coverage for Claimed Skills
  const skillsAudit = await evaluateSkillEvidence(input.userId, input.skills);
  const totalSkills = input.skills.length;
  const supportedSkillsCount = Object.values(skillsAudit).filter((s) => s.status === "SUPPORTED").length;
  const evidenceCoverageScore = totalSkills === 0 ? 0 : Math.round((supportedSkillsCount / totalSkills) * 100);

  // 2. Framework Section Check
  const requiredSections = framework.sections.filter((s) => s.required).map((s) => s.label);
  const presentSections: string[] = ["Professional Summary", "Qualifications"];
  if (input.experienceSummary) presentSections.push("Experience & Internships");
  if (input.projectsSummary) presentSections.push("Projects");

  const missingSections = requiredSections.filter((req) => !presentSections.some((p) => p.includes(req.split(" ")[0])));

  // 3. Completeness & ATS Readability Calculation
  let completenessScore = 50;
  if (input.summary && input.summary.length > 60) completenessScore += 15;
  if (input.skills.length >= 4) completenessScore += 15;
  if (input.educationSummary) completenessScore += 10;
  if (input.projectsSummary || input.experienceSummary) completenessScore += 10;

  let atsReadabilityScore = 80;
  if (missingSections.length > 0) atsReadabilityScore -= missingSections.length * 5;
  if (input.skills.length > 25) atsReadabilityScore -= 10; // Keyword stuffing penalty

  let jdAlignment: JdAlignmentResult | undefined;
  let aiRes: import("@/lib/ai/types").AiTaskResponse<JdAlignmentResult> | undefined;

  // 4. If Job Description is provided, analyze JD Alignment with AI / Fallback
  if (input.jobDescription && input.jobDescription.trim().length > 30) {
    aiRes = await aiService.generateStructuredAdvice<JdAlignmentResult>({
      operation: "RESUME_REVIEW",
      modelTier: "FAST",
      userId: input.userId,
      studentContext: {
        userId: input.userId,
        academicDomain: framework.name,
        targetRole: input.targetRole,
        summary: input.summary,
        educationSummary: input.educationSummary,
        skills: input.skills,
        projectsSummary: input.projectsSummary,
        experienceSummary: input.experienceSummary,
      },
      customPrompt: `You are the Lead Career Intelligence Architect for Aeterna CareerEdge.
Perform an in-depth, rigorous, and highly specific alignment analysis of this candidate's resume against the Job Description.

Target Role: ${input.targetRole}
Domain: ${framework.name}
Candidate Background:
- Summary: ${input.summary || "None provided"}
- Education: ${input.educationSummary || "Not specified"}
- Skills Claimed: ${input.skills.join(", ") || "None"}
- Projects & Work: ${input.projectsSummary || input.experienceSummary || "None specified"}

Job Description:
"""${input.jobDescription.slice(0, 2500)}"""

CRITICAL INVARIANTS:
1. Never suggest the student add fake experience or skills they have not learned.
2. Separate skills into:
   - matchingSkills: Skills present in both JD and candidate profile.
   - missingSkills: Concrete technical or domain skills required by the JD that the candidate has NOT listed.
   - unsupportedSkills: Skills on resume that have zero relevance or mention in the JD.
   - evidenceRequired: Matching skills that require portfolio/clinical verification.
3. roleReadinessVerdict: Select strictly one of:
   - "STRONG_MATCH" (Candidate possesses 80%+ of core requirements)
   - "COMPETITIVE_WITH_GAPS" (Strong fundamental fit, but missing 1-2 secondary tools or domain requirements)
   - "REQUIRES_UPSKILLING" (Missing fundamental prerequisites for the position)
4. alignmentSummary: 2 concise, honest sentences evaluating candidate's exact fit, naming their biggest asset and primary gap.
5. atsKeywordsToIncorporate: 4-6 high-frequency, legitimate industry keywords from the JD that the candidate should naturally weave into their existing project or work bullet points.
6. detailedGaps: 3-5 specific requirements from the JD with candidateStatus ("MATCHED", "PARTIAL", or "MISSING"), specific evidence from candidate's profile (or "None found"), and actionableFix (exact wording adjustment or project addition).
7. actionableImprovements: 3-4 specific, non-generic improvements the candidate can make to this resume right now.
8. interviewTalkingPoints: 2-3 strategic talking points on how the candidate can defend partial/missing skills in an interview by pivoting to their demonstrated strengths.

Return ONLY valid JSON matching schema.`,
      schemaDescription:
        "{ jobRoleExtracted: string, roleReadinessVerdict: string, alignmentSummary: string, matchingSkills: string[], missingSkills: string[], unsupportedSkills: string[], evidenceRequired: string[], atsKeywordDensityScore: number, atsKeywordsToIncorporate: string[], detailedGaps: Array<{ requirement: string, candidateStatus: string, evidenceOrContext: string, actionableFix: string }>, actionableImprovements: string[], interviewTalkingPoints: string[] }",
    });

    if (aiRes.success && aiRes.data) {
      const d = aiRes.data as unknown as Record<string, unknown>;
      const rawGaps = Array.isArray(d.detailedGaps) ? d.detailedGaps : [];
      const parsedGaps: DetailedGapItem[] = rawGaps.map((g) => {
        const item = g as Record<string, unknown>;
        const status = item.candidateStatus === "MATCHED" || item.candidateStatus === "PARTIAL" || item.candidateStatus === "MISSING"
          ? (item.candidateStatus as "MATCHED" | "PARTIAL" | "MISSING")
          : "PARTIAL";
        return {
          requirement: String(item.requirement || "Role Requirement"),
          candidateStatus: status,
          evidenceOrContext: String(item.evidenceOrContext || "Assessed from candidate profile"),
          actionableFix: String(item.actionableFix || "Clarify this requirement in your experience details"),
        };
      });

      const rawVerdict = String(d.roleReadinessVerdict || "");
      const verdict = rawVerdict === "STRONG_MATCH" || rawVerdict === "COMPETITIVE_WITH_GAPS" || rawVerdict === "REQUIRES_UPSKILLING"
        ? rawVerdict
        : "COMPETITIVE_WITH_GAPS";

      jdAlignment = {
        jobRoleExtracted: (d.jobRoleExtracted as string) || input.targetRole,
        roleReadinessVerdict: verdict,
        alignmentSummary: String(d.alignmentSummary || `Candidate profile evaluated against ${input.targetRole} requirements.`),
        matchingSkills: Array.isArray(d.matchingSkills)
          ? (d.matchingSkills as string[])
          : Array.isArray(d.matchedSkills)
            ? (d.matchedSkills as string[])
            : [],
        missingSkills: Array.isArray(d.missingSkills)
          ? (d.missingSkills as string[])
          : Array.isArray(d.missing_skills)
            ? (d.missing_skills as string[])
            : [],
        unsupportedSkills: Array.isArray(d.unsupportedSkills)
          ? (d.unsupportedSkills as string[])
          : [],
        evidenceRequired: Array.isArray(d.evidenceRequired)
          ? (d.evidenceRequired as string[])
          : Array.isArray(d.requiredEvidence)
            ? (d.requiredEvidence as string[])
            : [],
        atsKeywordDensityScore:
          typeof d.atsKeywordDensityScore === "number"
            ? Math.min(100, Math.max(0, d.atsKeywordDensityScore))
            : 75,
        atsKeywordsToIncorporate: Array.isArray(d.atsKeywordsToIncorporate)
          ? (d.atsKeywordsToIncorporate as string[])
          : [],
        detailedGaps: parsedGaps,
        actionableImprovements: Array.isArray(d.actionableImprovements)
          ? (d.actionableImprovements as string[])
          : Array.isArray(d.recommendations)
            ? (d.recommendations as string[])
            : [],
        interviewTalkingPoints: Array.isArray(d.interviewTalkingPoints)
          ? (d.interviewTalkingPoints as string[])
          : [],
      };
      if (jdAlignment.atsKeywordDensityScore) {
        atsReadabilityScore = Math.round((atsReadabilityScore + jdAlignment.atsKeywordDensityScore) / 2);
      }
    } else {
      // Deterministic JD parsing fallback
      const jdWords = input.jobDescription.toLowerCase();
      const matchingSkills = input.skills.filter((s) => jdWords.includes(s.toLowerCase()));
      const missingSkills = framework.competencyChecklist.filter(
        (c) => jdWords.includes(c.toLowerCase()) && !input.skills.some((s) => s.toLowerCase() === c.toLowerCase())
      );
      const ratio = matchingSkills.length / Math.max(1, matchingSkills.length + missingSkills.length);
      const verdict = ratio >= 0.75 ? "STRONG_MATCH" : ratio >= 0.4 ? "COMPETITIVE_WITH_GAPS" : "REQUIRES_UPSKILLING";

      jdAlignment = {
        jobRoleExtracted: input.targetRole,
        roleReadinessVerdict: verdict,
        alignmentSummary: `Candidate aligns with ${matchingSkills.length} core competencies for ${input.targetRole}, with key focus areas identified in ${missingSkills.slice(0, 2).join(", ") || "domain specialization"}.`,
        matchingSkills,
        missingSkills,
        unsupportedSkills: input.skills.filter((s) => !matchingSkills.includes(s)),
        evidenceRequired: matchingSkills.filter((s) => skillsAudit[s]?.status !== "SUPPORTED"),
        atsKeywordDensityScore: Math.min(95, Math.max(50, Math.round(ratio * 100))),
        atsKeywordsToIncorporate: missingSkills.slice(0, 5),
        detailedGaps: [
          ...matchingSkills.slice(0, 2).map((s) => ({
            requirement: s,
            candidateStatus: "MATCHED" as const,
            evidenceOrContext: `Claimed in candidate skills and verified in domain framework.`,
            actionableFix: `Highlight practical outcomes and metrics using ${s} in your project bullet points.`,
          })),
          ...missingSkills.slice(0, 2).map((s) => ({
            requirement: s,
            candidateStatus: "MISSING" as const,
            evidenceOrContext: "Not currently present in candidate skills or projects.",
            actionableFix: `If you have academic coursework or practical exposure in ${s}, add it to your profile. Otherwise, consider an upskilling sprint.`,
          })),
        ],
        actionableImprovements: [
          `Highlight your verified proof for ${matchingSkills.slice(0, 2).join(", ") || "core competencies"} in your summary.`,
          missingSkills.length > 0 ? `Consider evidencing coursework or projects for missing requirement: "${missingSkills[0]}".` : "Ensure all projects cite measurable outcomes and technologies used.",
          `Weave high-priority keywords (${matchingSkills.slice(0, 3).join(", ") || "domain keywords"}) into your experience bullet points to maximize ATS match score.`,
        ],
        interviewTalkingPoints: [
          `When asked about ${missingSkills[0] || "emerging domain tools"}, pivot to your demonstrated mastery of ${matchingSkills[0] || "core fundamentals"} and your ability to rapidly learn new frameworks.`,
          `Highlight your hands-on project work (${input.projectsSummary ? input.projectsSummary.split(":")[0] : "flagship project"}) as proof of practical problem solving.`,
        ],
      };
    }
  }

  // 5. Generate Concrete Recommendations
  const recommendations: string[] = [];
  if (jdAlignment && jdAlignment.actionableImprovements.length > 0) {
    recommendations.push(...jdAlignment.actionableImprovements);
  }
  if (missingSections.length > 0) {
    recommendations.push(`Include standard domain section: "${missingSections[0]}" to satisfy ${framework.name} standards.`);
  }
  const needsEvidenceSkills = Object.entries(skillsAudit)
    .filter(([, val]) => val.status === "NEEDS_EVIDENCE")
    .map(([key]) => key);

  if (needsEvidenceSkills.length > 0) {
    recommendations.push(`Attach verifiable artifacts in your Evidence Vault for: ${needsEvidenceSkills.slice(0, 3).join(", ")}.`);
  }
  if (recommendations.length === 0) {
    recommendations.push("Your resume matches standard domain frameworks cleanly and carries high verifiable proof.");
  }

  const primarySource = framework.officialResearchSources[0]?.sourceName || "National Career Service Guidelines";

  return {
    domain: input.domain,
    targetRole: input.targetRole,
    completenessScore: Math.min(100, completenessScore),
    atsReadabilityScore: Math.min(100, atsReadabilityScore),
    evidenceCoverageScore,
    frameworkCompliance: {
      domainName: framework.name,
      requiredSectionsPresent: presentSections,
      missingSections,
      officialResearchSource: primarySource,
    },
    jdAlignment,
    skillsAudit,
    recommendations,
    isAiGenerated: !!aiRes?.success,
    aiError: aiRes?.error,
    aiMetadata: aiRes?.metadata
      ? {
          model: aiRes.metadata.model,
          latencyMs: aiRes.metadata.latencyMs,
          usage: {
            inputTokens: aiRes.metadata.usage.inputTokens,
            outputTokens: aiRes.metadata.usage.outputTokens,
          },
        }
      : undefined,
  };
}
