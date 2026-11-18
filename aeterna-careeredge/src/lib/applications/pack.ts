// src/lib/applications/pack.ts
// 4-Part Application Pack Generator: Tailored Resume, Cover Note, Outreach Intro & Proof Bank Talking Points
// INVARIANT: All facts grounded strictly in student's Career Passport and Evidence Vault. ZERO hallucinated metrics.

import { db } from "@/lib/db";
import { aiService } from "@/lib/ai/provider";

export interface ProofTalkingPoint {
  skill: string;
  evidenceTitle: string;
  talkingPoint: string;
  verificationBadge: string;
}

export interface GeneratedApplicationPack {
  id?: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  coverNoteDraft: string;
  introMessageDraft: string;
  talkingPoints: ProofTalkingPoint[];
  checklist: string[];
  externalUrl?: string;
  resumeVersionId?: string;
}

export async function generateApplicationPack(
  userId: string,
  params: {
    jobId: string;
    jobTitle: string;
    companyName: string;
    jobUrl?: string;
  }
): Promise<GeneratedApplicationPack> {
  // 1. Fetch Student Profile and Passport Data
  const [user, _profile, skills, educations, experiences, projects, evidenceItems, resumes] =
    await Promise.all([
      db.user.findUnique({ where: { id: userId } }),
      db.studentProfile.findUnique({ where: { userId } }),
      db.studentSkill.findMany({ where: { userId } }),
      db.educationRecord.findMany({ where: { userId }, orderBy: { endYear: "desc" } }),
      db.studentExperience.findMany({ where: { userId }, orderBy: { startDate: "desc" } }),
      db.studentProject.findMany({ where: { userId } }),
      db.evidenceItem.findMany({ where: { userId } }),
      db.resume.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } }),
    ]);

  const studentName = user?.name || "Candidate";
  const primaryDegree = educations[0]
    ? `${educations[0].degree || "Degree"} in ${educations[0].fieldOfStudy || "General Studies"} from ${educations[0].institution}`
    : "Graduate degree";

  const topSkills = skills.slice(0, 6).map((s) => s.name);
  const bestResume = resumes[0];

  // 2. Select 3 Top Proof Bank Artifacts for Talking Points
  const talkingPoints: ProofTalkingPoint[] = [];

  if (evidenceItems.length > 0) {
    for (const ev of evidenceItems.slice(0, 3)) {
      talkingPoints.push({
        skill: ev.relatedSkill || ev.title,
        evidenceTitle: ev.title,
        talkingPoint: `Demonstrated ${ev.relatedSkill || ev.title} backed by verified evidence "${ev.title}" (${ev.type}).`,
        verificationBadge: "VERIFIED_PROOF_BANK",
      });
    }
  }

  // If student has fewer than 3 evidence items, supplement with recorded projects/experiences
  if (talkingPoints.length < 3 && projects.length > 0) {
    for (const proj of projects.slice(0, 3 - talkingPoints.length)) {
      talkingPoints.push({
        skill: proj.techStack || "Practical Application",
        evidenceTitle: proj.title,
        talkingPoint: `Delivered practical project "${proj.title}": ${proj.description || "Demonstrated core domain problem solving"}.`,
        verificationBadge: "STUDENT_PROJECT",
      });
    }
  }

  if (talkingPoints.length < 3 && experiences.length > 0) {
    for (const exp of experiences.slice(0, 3 - talkingPoints.length)) {
      talkingPoints.push({
        skill: exp.jobTitle,
        evidenceTitle: `${exp.jobTitle} at ${exp.companyName}`,
        talkingPoint: `Completed internship/role at ${exp.companyName} applying core domain workflows.`,
        verificationBadge: "WORK_EXPERIENCE",
      });
    }
  }

  // Fallback if passport is early stage
  if (talkingPoints.length === 0) {
    talkingPoints.push({
      skill: "Academic Rigor",
      evidenceTitle: primaryDegree,
      talkingPoint: `Completed rigorous coursework in ${primaryDegree}.`,
      verificationBadge: "ACADEMIC_RECORD",
    });
  }

  // 3. Generate Targeted Cover Note (Concise, authentic, no hype)
  const coverNotePrompt = `Draft a concise, professional 3-paragraph cover letter for ${studentName} applying for "${params.jobTitle}" at "${params.companyName}".
Student Qualifications:
- Education: ${primaryDegree}
- Core Skills: ${topSkills.join(", ")}
- Verified Accomplishments: ${talkingPoints.map((tp) => tp.talkingPoint).join("; ")}
RULES:
1. Keep tone humble, professional and truthful.
2. Do NOT invent achievements, past employers, or speculative percentages.
3. Keep under 200 words total.`;

  let coverNoteDraft = "";
  try {
    const aiRes = await aiService.generateStructuredAdvice<{ coverNote: string }>({
      operation: "RESUME_CREATION",
      modelTier: "FAST",
      userId,
      studentContext: {
        academicDomain: primaryDegree,
        educationLevel: educations[0]?.level || "UG",
        targetRole: params.jobTitle,
        skills: topSkills,
      },
      customPrompt: coverNotePrompt,
      schemaDescription: '{ "coverNote": "string containing 3 paragraph truthful cover note" }',
    });
    if (aiRes.data?.coverNote) {
      coverNoteDraft = aiRes.data.coverNote.trim();
    } else {
      throw new Error("No data in AI response");
    }
  } catch {
    coverNoteDraft = `Dear Hiring Team at ${params.companyName},

I am writing to express my strong interest in the ${params.jobTitle} opportunity. Having completed my ${primaryDegree}, I have developed rigorous foundations in ${topSkills.slice(0, 3).join(", ")}.

During my academic and practical preparation, I have focused on delivering demonstrable outcomes. Specifically, I have ${talkingPoints[0]?.talkingPoint || "completed relevant coursework and practical projects"}. All my claimed skills and portfolio pieces are backed by documented proof.

I would welcome the opportunity to discuss how my academic background and verified skills can contribute to the team at ${params.companyName}. Thank you for your consideration.

Sincerely,
${studentName}`;
  }

  // 4. Generate Outreach Intro Message (Email / LinkedIn)
  const introMessageDraft = `Hi ${params.companyName} Team,

I recently came across the ${params.jobTitle} opening and wanted to reach out directly. I hold a ${primaryDegree} with core expertise in ${topSkills.slice(0, 3).join(", ")}. 

My background includes ${talkingPoints[0]?.talkingPoint || "verified practical project experience"}. I have prepared a comprehensive application backed by my verified portfolio.

Would love to share my resume and portfolio if you have a brief moment to connect.

Best regards,
${studentName}`;

  // 5. Pre-Application Checklist
  const checklist = [
    `Review customized resume (derived from Career Passport)`,
    `Verify all ${talkingPoints.length} referenced Proof Bank artifacts are current`,
    `Check statutory council registration or degree mark sheets`,
    `Review company background and specific team role`,
    `Submit application on official portal: ${params.companyName}`,
  ];

  // 6. Save or Update in ApplicationPack Database Table
  const existingPack = await db.applicationPack.findFirst({
    where: { userId, jobId: params.jobId },
  });

  let savedPack;
  if (existingPack) {
    savedPack = await db.applicationPack.update({
      where: { id: existingPack.id },
      data: {
        jobTitle: params.jobTitle,
        companyName: params.companyName,
        resumeVersionId: bestResume?.id,
        matchSnapshot: JSON.stringify({
          topSkills,
          talkingPointsCount: talkingPoints.length,
        }),
        coverNoteDraft,
        introMessageDraft,
        talkingPointsJson: JSON.stringify(talkingPoints),
        checklist: JSON.stringify(checklist),
        externalUrl: params.jobUrl,
      },
    });
  } else {
    savedPack = await db.applicationPack.create({
      data: {
        userId,
        jobId: params.jobId,
        jobTitle: params.jobTitle,
        companyName: params.companyName,
        resumeVersionId: bestResume?.id,
        matchSnapshot: JSON.stringify({
          topSkills,
          talkingPointsCount: talkingPoints.length,
        }),
        coverNoteDraft,
        introMessageDraft,
        talkingPointsJson: JSON.stringify(talkingPoints),
        checklist: JSON.stringify(checklist),
        externalUrl: params.jobUrl,
      },
    });
  }

  return {
    id: savedPack.id,
    jobId: params.jobId,
    jobTitle: params.jobTitle,
    companyName: params.companyName,
    coverNoteDraft,
    introMessageDraft,
    talkingPoints,
    checklist,
    externalUrl: params.jobUrl,
    resumeVersionId: bestResume?.id,
  };
}
