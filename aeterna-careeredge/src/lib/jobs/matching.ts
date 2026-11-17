// src/lib/jobs/matching.ts
// CareerEdge Job Match Engine
// Factual alignment analysis based on verified Career Passport data
// INVARIANT: NEVER outputs hiring probability percentages or speculative hiring promises!

import { db } from "@/lib/db";
import type { JobListing, JobMatchResult, MatchingSkill, MissingSkill } from "./types";

export async function matchStudentToJob(
  userId: string,
  job: JobListing
): Promise<JobMatchResult> {
  // 1. Fetch student's comprehensive Career Passport
  const [skills, educations, experiences, certs, projects, evidenceItems] =
    await Promise.all([
      db.studentSkill.findMany({ where: { userId } }),
      db.educationRecord.findMany({ where: { userId } }),
      db.studentExperience.findMany({ where: { userId } }),
      db.certification.findMany({ where: { userId } }),
      db.studentProject.findMany({ where: { userId } }),
      db.evidenceItem.findMany({ where: { userId } }),
    ]);

  // Map student skill names for case-insensitive matching
  const skillMap = new Map<string, { id: string; name: string }>();
  for (const s of skills) {
    skillMap.set(s.name.toLowerCase().trim(), { id: s.id, name: s.name });
  }

  // Map verified evidence by skill or title
  const evidenceSkillSet = new Set<string>();
  const evidenceTitleMap = new Map<string, { id: string; title: string }>();
  for (const ev of evidenceItems) {
    if (ev.relatedSkill) {
      evidenceSkillSet.add(ev.relatedSkill.toLowerCase().trim());
      evidenceTitleMap.set(ev.relatedSkill.toLowerCase().trim(), {
        id: ev.id,
        title: ev.title,
      });
    }
    evidenceSkillSet.add(ev.title.toLowerCase().trim());
    evidenceTitleMap.set(ev.title.toLowerCase().trim(), {
      id: ev.id,
      title: ev.title,
    });
  }

  // 2. Evaluate Required Skills
  const matchingSkills: MatchingSkill[] = [];
  const missingSkills: MissingSkill[] = [];
  const evidenceNeeded: string[] = [];

  const jobReqs = job.requirements.length > 0 ? job.requirements : ["Communication Skills", "Domain Fundamentals"];

  for (const req of jobReqs) {
    const reqLower = req.toLowerCase().trim();
    let isMatched = false;
    let matchedName = req;

    // Check direct match or substring in student skills
    for (const [sKey, sObj] of skillMap.entries()) {
      if (sKey === reqLower || sKey.includes(reqLower) || reqLower.includes(sKey)) {
        isMatched = true;
        matchedName = sObj.name;
        break;
      }
    }

    if (isMatched) {
      const hasVerifiedEvidence =
        evidenceSkillSet.has(matchedName.toLowerCase().trim()) ||
        evidenceSkillSet.has(reqLower);

      const evInfo = evidenceTitleMap.get(matchedName.toLowerCase().trim()) || evidenceTitleMap.get(reqLower);

      matchingSkills.push({
        name: matchedName,
        verified: hasVerifiedEvidence,
        evidenceId: evInfo?.id,
        evidenceTitle: evInfo?.title,
      });

      if (!hasVerifiedEvidence) {
        evidenceNeeded.push(
          `Skill "${matchedName}" is in your profile but has no Proof Bank artifact linked.`
        );
      }
    } else {
      missingSkills.push({
        name: req,
        importance: "CRITICAL",
        bridgeRecommendation: getBridgeRecommendation(req, job.domain),
      });
    }
  }

  // 3. Evaluate Academic / Regulatory Alignment
  const latestEducation = educations[0];
  const studentDegree = latestEducation
    ? `${latestEducation.degree} in ${latestEducation.fieldOfStudy}`
    : "No academic qualification recorded";

  const disqualifyingFactors: string[] = [];

  // Check domain specific prerequisites
  if (job.domain === "HEALTHCARE") {
    const hasNursingDegree = educations.some(
      (e) =>
        (e.degree || "").toLowerCase().includes("nurs") ||
        (e.fieldOfStudy || "").toLowerCase().includes("nurs")
    );
    if (!hasNursingDegree && educations.length > 0) {
      disqualifyingFactors.push(
        "Job requires B.Sc Nursing / GNM recognized by Indian Nursing Council (INC) or State Nursing Council. Your recorded degree is in another field."
      );
    }
  } else if (job.domain === "TEACHING") {
    const hasTeachingCred =
      educations.some(
        (e) =>
          (e.degree || "").toLowerCase().includes("b.ed") ||
          (e.fieldOfStudy || "").toLowerCase().includes("education")
      ) || certs.some((c) => (c.title || "").toLowerCase().includes("tet"));
    if (!hasTeachingCred && educations.length > 0) {
      disqualifyingFactors.push(
        "Job requires B.Ed or CTET qualification. No teaching credential was found in your Career Passport."
      );
    }
  } else if (job.domain === "LAW") {
    const hasLawDegree = educations.some(
      (e) =>
        (e.degree || "").toLowerCase().includes("ll.b") ||
        (e.degree || "").toLowerCase().includes("law")
    );
    if (!hasLawDegree && educations.length > 0) {
      disqualifyingFactors.push(
        "Job requires LL.B recognized by Bar Council of India (BCI). No law degree found in your records."
      );
    }
  }

  // 4. Calculate Factual Match Score (0-100)
  // Weighted:
  // - 50% from required skills (with 1.0 for verified evidence, 0.6 for unverified claim)
  // - 25% from academic eligibility
  // - 25% from experiences / projects / certifications breadth
  let skillPoints = 0;
  for (const ms of matchingSkills) {
    skillPoints += ms.verified ? 1.0 : 0.6;
  }
  const skillRatio = jobReqs.length > 0 ? skillPoints / jobReqs.length : 0.5;
  const skillScore = Math.min(50, Math.round(skillRatio * 50));

  const academicScore = disqualifyingFactors.length === 0 ? 25 : 5;

  let practicalScore = 0;
  if (experiences.length > 0) practicalScore += 10;
  if (projects.length > 0) practicalScore += 10;
  if (certs.length > 0) practicalScore += 5;
  practicalScore = Math.min(25, practicalScore);

  const rawScore = skillScore + academicScore + practicalScore;
  const matchScore = Math.max(10, Math.min(95, rawScore));

  // 5. Honest Suitability Explanation
  let suitabilityExplanation = "";
  if (disqualifyingFactors.length > 0) {
    suitabilityExplanation = `You have prerequisites to address: ${disqualifyingFactors[0]} Focus on completing required statutory credentials before applying.`;
  } else if (matchScore >= 75) {
    suitabilityExplanation = `Strong factual match! You fulfill ${matchingSkills.length} of ${jobReqs.length} required competencies. ${
      evidenceNeeded.length > 0
        ? `Back your remaining ${evidenceNeeded.length} skills with Proof Bank artifacts to strengthen your application.`
        : "Your claims are well-supported by evidence."
    }`;
  } else if (matchScore >= 50) {
    suitabilityExplanation = `Moderate match. You meet ${matchingSkills.length} of ${jobReqs.length} core requirements. Bridging ${missingSkills
      .slice(0, 2)
      .map((s) => s.name)
      .join(", ")} will significantly boost your readiness.`;
  } else {
    suitabilityExplanation = `Developing match. This role requires key skills (${missingSkills
      .slice(0, 3)
      .map((s) => s.name)
      .join(", ")}) not yet present in your Career Passport. Check the recommended action sprint to bridge these.`;
  }

  return {
    jobId: job.id,
    jobTitle: job.title,
    companyName: job.company,
    matchScore,
    matchingSkills,
    missingSkills,
    evidenceNeeded,
    disqualifyingFactors,
    suitabilityExplanation,
    academicAlignment: {
      eligible: disqualifyingFactors.length === 0,
      studentQualification: studentDegree,
      requiredQualification: job.qualifications[0] || "Graduate Degree",
      details:
        disqualifyingFactors.length === 0
          ? "Your recorded academic background aligns with the job's prerequisite degree."
          : disqualifyingFactors.join(" "),
    },
    disclaimer:
      "This match score measures factual requirement alignment between your Career Passport and the job listing. It is NOT a hiring guarantee or probability percentage.",
  };
}

function getBridgeRecommendation(skill: string, domain: string): string {
  if (domain === "HEALTHCARE") {
    return `Complete a clinical rotation or simulation module covering ${skill} and record supervisor verification.`;
  }
  if (domain === "TEACHING") {
    return `Develop a sample lesson plan and classroom activity demonstrating ${skill} in your teaching practicum.`;
  }
  if (domain === "COMMERCE") {
    return `Complete practical hands-on exercises in ${skill} using sample GST/TDS datasets or financial models.`;
  }
  if (domain === "TECH") {
    return `Build a focused capstone feature or utility demonstrating ${skill} and commit it to GitHub.`;
  }
  if (domain === "LAW") {
    return `Draft a sample agreement or legal research brief addressing ${skill} using standard SCC Online / Manupatra citations.`;
  }
  if (domain === "DESIGN") {
    return `Add a case study wireframe demonstrating ${skill} to your design portfolio with user rationale.`;
  }
  return `Review foundational principles and complete a documented mini-project demonstrating ${skill}.`;
}
