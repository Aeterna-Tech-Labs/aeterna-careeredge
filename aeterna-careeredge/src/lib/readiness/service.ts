// src/lib/readiness/service.ts
// Career Readiness & Role Fit Explorer Engine
// Benchmarked against official occupational standards (NCS, NSDC, INC, BCI, ICAI)
// INVARIANT: Factual alignment scoring only. NO hiring probability percentages.

import { db } from "@/lib/db";
import { trackProgressEvent } from "@/lib/guidance/progress";

export interface RoleBenchmark {
  roleTitle: string;
  profession: string;
  description: string;
  coreCompetencies: string[];
  prerequisiteEducation: string;
  regulatorySource: string;
  sourceUrl: string;
}

export interface EvaluatedRoleFit {
  roleTitle: string;
  readinessScore: number; // 0-100 factual criteria alignment
  matchedCompetencies: { name: string; verified: boolean; evidenceTitle?: string }[];
  missingCompetencies: string[];
  evidenceCoveragePercent: number;
  prerequisiteSatisfied: boolean;
  prerequisiteNote: string;
  regulatorySource: string;
  sourceUrl: string;
}

export const OCCUPATIONAL_ROLE_BENCHMARKS: Record<string, RoleBenchmark[]> = {
  HEALTHCARE: [
    {
      roleTitle: "Staff Nurse (Critical Care / ICU)",
      profession: "HEALTHCARE",
      description: "Direct bedside nursing care, patient hemodynamic monitoring, medication administration, and ventilator management.",
      coreCompetencies: [
        "Patient Vitals Monitoring",
        "Medication Administration",
        "BLS / ACLS Certification",
        "Infection Control Protocols",
        "Ventilator Management",
      ],
      prerequisiteEducation: "B.Sc Nursing or GNM registered with State Nursing Council / INC",
      regulatorySource: "Indian Nursing Council (INC) & NABH Standards",
      sourceUrl: "https://www.indiannursingcouncil.org",
    },
    {
      roleTitle: "Clinical Nursing Instructor",
      profession: "HEALTHCARE",
      description: "Supervise ward clinical rotations, conduct OSCE practical demonstrations, and evaluate clinical logbooks.",
      coreCompetencies: [
        "Clinical Demonstration",
        "INC Curriculum Compliance",
        "Pedagogy & Lesson Planning",
        "Objective Structured Clinical Examination (OSCE)",
      ],
      prerequisiteEducation: "M.Sc Nursing or B.Sc Nursing with registered council license",
      regulatorySource: "National Career Service (NCS) Occupational Standard 2221",
      sourceUrl: "https://www.ncs.gov.in",
    },
  ],
  TEACHING: [
    {
      roleTitle: "Secondary School Educator (TGT)",
      profession: "TEACHING",
      description: "CBSE/ICSE curriculum delivery, interactive lesson planning, formative evaluations, and lab practicums.",
      coreCompetencies: [
        "Curriculum Mastery",
        "STEM Lesson Planning",
        "Formative & Summative Assessment",
        "Classroom Management",
        "Differentiated Instruction",
      ],
      prerequisiteEducation: "B.Ed with Bachelor's Degree + CTET Paper II / State TET",
      regulatorySource: "National Council for Teacher Education (NCTE)",
      sourceUrl: "https://ncte.gov.in",
    },
    {
      roleTitle: "Pre-University / Junior Lecturer",
      profession: "TEACHING",
      description: "Subject matter instruction for 11th and 12th standards, seminar guidance, and competitive exam preparation.",
      coreCompetencies: [
        "Advanced Subject Pedagogy",
        "Case Study Method",
        "Student Academic Mentorship",
        "Higher Secondary Curriculum",
      ],
      prerequisiteEducation: "Postgraduate Master's Degree (M.Sc / M.Com / M.A.) with min 55% marks",
      regulatorySource: "Department of Pre-University Education Karnataka",
      sourceUrl: "https://pue.karnataka.gov.in",
    },
  ],
  COMMERCE: [
    {
      roleTitle: "Tax & Statutory Compliance Associate",
      profession: "COMMERCE",
      description: "Monthly GST return filings (GSTR-1, 3B), quarterly TDS reconciliations, 26AS matching, and audit response preparation.",
      coreCompetencies: [
        "GST Return Filing (GSTR-1, 3B)",
        "TallyPrime / ERP Accounting",
        "Advanced Excel (VLOOKUP, Pivot, INDEX/MATCH)",
        "TDS Computation & 26AS Reconciliation",
      ],
      prerequisiteEducation: "B.Com / BBA (Finance) or CA / CMA Inter",
      regulatorySource: "Institute of Chartered Accountants of India (ICAI)",
      sourceUrl: "https://www.icai.org",
    },
    {
      roleTitle: "Financial Analyst - FP&A",
      profession: "COMMERCE",
      description: "Operating budget forecasting, monthly MIS reporting, variance analysis, and cash flow modeling.",
      coreCompetencies: [
        "Financial Modeling",
        "Variance Analysis",
        "MIS Reporting",
        "Budget Forecasting",
      ],
      prerequisiteEducation: "B.Com / M.Com / MBA Finance",
      regulatorySource: "National Occupational Standards (NSDC) - Banking & Financial Services",
      sourceUrl: "https://www.nsdcindia.org",
    },
  ],
  TECH: [
    {
      roleTitle: "Full-Stack Web Developer",
      profession: "TECH",
      description: "End-to-end web engineering using modern TypeScript, React, Next.js, and Node.js REST/GraphQL APIs.",
      coreCompetencies: [
        "TypeScript",
        "React / Next.js",
        "Node.js & REST APIs",
        "SQL Databases & ORM",
        "Git & CI/CD Workflows",
      ],
      prerequisiteEducation: "B.E. / B.Tech / MCA in Computer Science or demonstrable code portfolio",
      regulatorySource: "NASSCOM FutureSkills Prime & AICTE Curriculum",
      sourceUrl: "https://futureskillsprime.in",
    },
    {
      roleTitle: "Cloud Infrastructure Associate",
      profession: "TECH",
      description: "Cloud compute provisioning, IAM access configuration, Linux server maintenance, and containerization.",
      coreCompetencies: [
        "AWS Cloud Fundamentals",
        "Linux Server Administration",
        "Bash / Python Scripting",
        "Networking & DNS",
      ],
      prerequisiteEducation: "B.E. / B.Tech / BCA / B.Sc IT with cloud fundamentals",
      regulatorySource: "National Career Service (NCS) ICT Sector",
      sourceUrl: "https://www.ncs.gov.in",
    },
  ],
  LAW: [
    {
      roleTitle: "Junior Legal Associate - Contracts & Corporate",
      profession: "LAW",
      description: "Drafting commercial contracts, due diligence reviews, statutory compliance registers, and legal research memos.",
      coreCompetencies: [
        "Contract Drafting & Review",
        "Corporate Due Diligence",
        "Legal Research (Manupatra / SCC Online)",
        "Companies Act 2013 Compliance",
      ],
      prerequisiteEducation: "LL.B or 5-year B.A. LL.B enrolled with Bar Council of India",
      regulatorySource: "Bar Council of India (BCI) Legal Education Rules",
      sourceUrl: "http://www.barcouncilofindia.org",
    },
  ],
  DESIGN: [
    {
      roleTitle: "UI/UX Product Designer",
      profession: "DESIGN",
      description: "User research, wireframing, high-fidelity Figma design systems, responsive component libraries, and usability testing.",
      coreCompetencies: [
        "Figma & Auto-layout Mastery",
        "Design Systems & Component Libraries",
        "User Research & Usability Testing",
        "Wireframing & Prototyping",
      ],
      prerequisiteEducation: "B.Des / M.Des / HCI Degree or demonstrable design case study portfolio",
      regulatorySource: "India Design Council & National Institute of Design Guidelines",
      sourceUrl: "https://indiadesigncouncil.org",
    },
  ],
};

export async function evaluateRoleFit(
  userId: string,
  professionKey: string
): Promise<{
  profession: string;
  evaluatedRoles: EvaluatedRoleFit[];
  topRecommendations: string[];
}> {
  const normKey = professionKey.toUpperCase();
  const benchmarks = OCCUPATIONAL_ROLE_BENCHMARKS[normKey] || OCCUPATIONAL_ROLE_BENCHMARKS.TECH;

  const [skills, educations, certs, evidenceItems] = await Promise.all([
    db.studentSkill.findMany({ where: { userId } }),
    db.educationRecord.findMany({ where: { userId } }),
    db.certification.findMany({ where: { userId } }),
    db.evidenceItem.findMany({ where: { userId } }),
  ]);

  const skillNameSet = new Set(skills.map((s) => s.name.toLowerCase().trim()));
  const evidenceSkillMap = new Map<string, string>();
  for (const ev of evidenceItems) {
    if (ev.relatedSkill) {
      evidenceSkillMap.set(ev.relatedSkill.toLowerCase().trim(), ev.title);
    }
    evidenceSkillMap.set(ev.title.toLowerCase().trim(), ev.title);
  }

  const evaluatedRoles: EvaluatedRoleFit[] = [];
  const topRecommendations: string[] = [];

  for (const b of benchmarks) {
    const matchedCompetencies: { name: string; verified: boolean; evidenceTitle?: string }[] = [];
    const missingCompetencies: string[] = [];

    for (const comp of b.coreCompetencies) {
      const compLower = comp.toLowerCase().trim();
      let hasMatch = false;

      for (const sName of skillNameSet) {
        if (sName === compLower || sName.includes(compLower) || compLower.includes(sName)) {
          hasMatch = true;
          break;
        }
      }

      if (hasMatch) {
        const evTitle = evidenceSkillMap.get(compLower);
        matchedCompetencies.push({
          name: comp,
          verified: Boolean(evTitle),
          evidenceTitle: evTitle,
        });
      } else {
        missingCompetencies.push(comp);
      }
    }

    // Evidence coverage calculation
    const verifiedCount = matchedCompetencies.filter((m) => m.verified).length;
    const evidenceCoveragePercent =
      b.coreCompetencies.length > 0
        ? Math.round((verifiedCount / b.coreCompetencies.length) * 100)
        : 0;

    // Prerequisite check
    let prerequisiteSatisfied = true;
    let prerequisiteNote = "Academic degree aligns with role requirement.";

    if (b.profession === "HEALTHCARE") {
      const hasNursing = educations.some(
        (e) => (e.degree || "").toLowerCase().includes("nurs") || (e.fieldOfStudy || "").toLowerCase().includes("nurs")
      );
      if (!hasNursing) {
        prerequisiteSatisfied = false;
        prerequisiteNote = "Requires INC-recognized B.Sc Nursing or GNM qualification.";
      }
    } else if (b.profession === "TEACHING") {
      const hasBEd =
        educations.some(
          (e) => (e.degree || "").toLowerCase().includes("b.ed") || (e.fieldOfStudy || "").toLowerCase().includes("education")
        ) || certs.some((c) => (c.title || "").toLowerCase().includes("tet"));
      if (!hasBEd) {
        prerequisiteSatisfied = false;
        prerequisiteNote = "Requires NCTE-recognized B.Ed or CTET / State TET certification.";
      }
    } else if (b.profession === "LAW") {
      const hasLaw = educations.some(
        (e) => (e.degree || "").toLowerCase().includes("ll.b") || (e.degree || "").toLowerCase().includes("law")
      );
      if (!hasLaw) {
        prerequisiteSatisfied = false;
        prerequisiteNote = "Requires BCI-recognized LL.B degree.";
      }
    }

    // Factual Readiness Score (0-100)
    // 60% competency fulfillment, 25% verified evidence depth, 15% academic prerequisites
    const compScore = (matchedCompetencies.length / b.coreCompetencies.length) * 60;
    const evScore = (evidenceCoveragePercent / 100) * 25;
    const prereqScore = prerequisiteSatisfied ? 15 : 0;
    const readinessScore = Math.min(100, Math.round(compScore + evScore + prereqScore));

    evaluatedRoles.push({
      roleTitle: b.roleTitle,
      readinessScore,
      matchedCompetencies,
      missingCompetencies,
      evidenceCoveragePercent,
      prerequisiteSatisfied,
      prerequisiteNote,
      regulatorySource: b.regulatorySource,
      sourceUrl: b.sourceUrl,
    });

    if (missingCompetencies.length > 0) {
      topRecommendations.push(
        `For ${b.roleTitle}: Build and document practical evidence for ${missingCompetencies.slice(0, 2).join(" and ")}.`
      );
    }
  }

  // Persist in RoleFitResult table
  await db.roleFitResult.create({
    data: {
      userId,
      profession: normKey,
      resultsJson: JSON.stringify(evaluatedRoles),
      referenceSourceIds: JSON.stringify(benchmarks.map((b) => b.regulatorySource)),
    },
  });

  // Track progress event
  await trackProgressEvent({
    userId,
    eventType: "READINESS_REPORT_GENERATED",
    title: `Role Fit Evaluated for ${normKey}`,
    description: `Analyzed ${evaluatedRoles.length} standard roles against official standards`,
    metadata: { profession: normKey, topScore: Math.max(...evaluatedRoles.map((r) => r.readinessScore)) },
  });

  return {
    profession: normKey,
    evaluatedRoles,
    topRecommendations: topRecommendations.slice(0, 4),
  };
}
