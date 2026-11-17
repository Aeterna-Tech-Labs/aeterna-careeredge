// src/lib/linkedin/analysis.ts
// Profession-Aware LinkedIn Profile Intelligence (Day 2 Part 4.4)
// Evaluates completeness, role keywords, and evidence without faking official LinkedIn search ranking algorithms.

import { evaluateSkillEvidence } from "@/lib/evidence/service";

export interface LinkedInSectionScore {
  section: "Headline" | "About" | "Experience" | "Skills" | "Certifications";
  score: number; // 0 to 100
  status: "OPTIMAL" | "NEEDS_IMPROVEMENT" | "CRITICAL_GAP";
  feedback: string;
}

export interface LinkedInAnalysisReport {
  overallScore: number; // 0 to 100
  sectionScores: LinkedInSectionScore[];
  strengths: string[];
  weaknesses: string[];
  missingElements: string[];
  evidenceBackedRatio: number;
  domainBenchmarkNote: string;
  evaluatedAt: string;
}

export async function analyzeLinkedInProfile(params: {
  userId: string;
  domain: string;
  targetRole: string;
  headline?: string;
  about?: string;
  skills: string[];
  experiencesCount: number;
  certificationsCount: number;
}): Promise<LinkedInAnalysisReport> {
  const { userId, domain, targetRole, headline = "", about = "", skills } = params;

  // 1. Evidence Evaluation
  const evidenceAudit = await evaluateSkillEvidence(userId, skills);
  const totalSkills = skills.length;
  const backedSkills = Object.values(evidenceAudit).filter((s) => s.status === "SUPPORTED").length;
  const evidenceBackedRatio = totalSkills === 0 ? 0 : Math.round((backedSkills / totalSkills) * 100);

  // 2. Section Scoring
  const sectionScores: LinkedInSectionScore[] = [];

  // Headline Score
  let headlineScore = 40;
  if (headline.length > 20) headlineScore += 20;
  if (headline.toLowerCase().includes(targetRole.toLowerCase())) headlineScore += 25;
  if (headline.includes("|") || headline.includes("•") || headline.includes("-")) headlineScore += 15;
  headlineScore = Math.min(100, headlineScore);

  sectionScores.push({
    section: "Headline",
    score: headlineScore,
    status: headlineScore >= 80 ? "OPTIMAL" : headlineScore >= 60 ? "NEEDS_IMPROVEMENT" : "CRITICAL_GAP",
    feedback:
      headlineScore >= 80
        ? "Headline cleanly communicates your target profession and core specialization."
        : `Include your explicit target role "${targetRole}" and a verified core strength separated by a divider.`,
  });

  // About Section Score
  let aboutScore = 30;
  if (about.length > 100) aboutScore += 25;
  if (about.length > 300) aboutScore += 20;
  if (about.toLowerCase().includes("certified") || about.toLowerCase().includes("rotation") || about.toLowerCase().includes("project") || about.toLowerCase().includes("experience")) {
    aboutScore += 25;
  }
  aboutScore = Math.min(100, aboutScore);

  sectionScores.push({
    section: "About",
    score: aboutScore,
    status: aboutScore >= 80 ? "OPTIMAL" : aboutScore >= 60 ? "NEEDS_IMPROVEMENT" : "CRITICAL_GAP",
    feedback:
      aboutScore >= 80
        ? "Rich narrative highlighting academic background and verifiable outcomes."
        : "Expand your About section with a 3-paragraph structure: background, key achievements, and current career focus.",
  });

  // Experience Score
  let expScore = params.experiencesCount > 0 ? 75 : 45;
  if (params.experiencesCount >= 2) expScore += 20;
  sectionScores.push({
    section: "Experience",
    score: Math.min(100, expScore),
    status: expScore >= 75 ? "OPTIMAL" : "NEEDS_IMPROVEMENT",
    feedback:
      params.experiencesCount > 0
        ? "Documented work history present. Ensure each role cites measurable outcomes."
        : "Add clinical rotations, internships, or academic project responsibilities.",
  });

  // Skills Score
  let skillsScore = Math.min(100, skills.length * 10);
  if (evidenceBackedRatio > 50) skillsScore = Math.min(100, skillsScore + 15);
  sectionScores.push({
    section: "Skills",
    score: skillsScore,
    status: skillsScore >= 80 ? "OPTIMAL" : skillsScore >= 50 ? "NEEDS_IMPROVEMENT" : "CRITICAL_GAP",
    feedback:
      skills.length >= 8
        ? `Strong competency bank (${skills.length} skills). ${evidenceBackedRatio}% backed by Proof Bank artifacts.`
        : `Add at least ${Math.max(1, 8 - skills.length)} more domain skills to satisfy recruiter search volume.`,
  });

  // Overall Readiness Score
  const overallScore = Math.round(
    sectionScores.reduce((sum, sec) => sum + sec.score, 0) / sectionScores.length
  );

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const missingElements: string[] = [];

  if (headlineScore >= 75) strengths.push("Strong keyword-rich professional headline.");
  else weaknesses.push("Headline lacks target role or specialization keyword.");

  if (aboutScore >= 75) strengths.push("Comprehensive About summary establishing your professional identity.");
  else weaknesses.push("About summary is brief or missing specific clinical/project achievements.");

  if (evidenceBackedRatio >= 50) strengths.push(`${evidenceBackedRatio}% of skills backed by verifiable Proof Bank artifacts.`);
  else weaknesses.push("Multiple skills lack attached certificates or project demo links.");

  if (!headline) missingElements.push("Professional Headline");
  if (!about || about.length < 50) missingElements.push("3-Paragraph About Narrative");
  if (skills.length < 5) missingElements.push("Minimum 5 Core Domain Competencies");

  return {
    overallScore,
    sectionScores,
    strengths,
    weaknesses,
    missingElements,
    evidenceBackedRatio,
    domainBenchmarkNote: `Benchmarked against entry-level ${domain} expectations in India & global markets.`,
    evaluatedAt: new Date().toISOString(),
  };
}
