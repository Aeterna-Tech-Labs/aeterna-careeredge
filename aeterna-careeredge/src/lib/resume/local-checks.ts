// src/lib/resume/local-checks.ts
// Deterministic, Zero-Cost Local Quality & ATS Checks for Resume Builder (Part 1.5)
// Runs instantly in memory on every keystroke or document change with zero AI cost.

import type { FullResumeData } from "./types";
import { getFrameworkForDomain } from "./frameworks";

export interface LocalCheckFinding {
  id: string;
  category: "COMPLETENESS" | "LENGTH" | "CHRONOLOGY" | "STYLE" | "WEAK_BULLETS" | "CONTACT" | "SKILL_EVIDENCE" | "ATS";
  severity: "high" | "medium" | "low";
  title: string;
  message: string;
  sectionId?: string;
  entryId?: string;
  bulletId?: string;
  autoFixSuggestion?: string;
}

export interface LocalCheckReport {
  overallHealthScore: number; // 0 - 100
  totalFindings: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  findings: LocalCheckFinding[];
  estimatedPageCount: number;
  wordCount: number;
  characterCount: number;
}

const WEAK_VERB_STARTERS = [
  "responsible for",
  "duties included",
  "handled",
  "worked on",
  "assisted with",
  "helped with",
  "participated in",
  "tasked with",
  "involved in",
];

export const STRONG_ACTION_VERBS = [
  "engineered",
  "architected",
  "developed",
  "spearheaded",
  "implemented",
  "optimized",
  "orchestrated",
  "triaged",
  "diagnosed",
  "administered",
  "reconciled",
  "audited",
  "designed",
  "delivered",
  "formulated",
  "standardized",
  "executed",
  "automated",
  "mentored",
];

export function runLocalResumeChecks(
  resume: FullResumeData,
  evidenceSkillTitles: string[] = []
): LocalCheckReport {
  const findings: LocalCheckFinding[] = [];
  const framework = getFrameworkForDomain(resume.domainKey);

  let totalWords = 0;
  let totalChars = 0;

  // 1. Contact Information Checks
  const { contactInfo } = resume;
  if (!contactInfo.name || contactInfo.name.trim().length < 2) {
    findings.push({
      id: "cnt_missing_name",
      category: "CONTACT",
      severity: "high",
      title: "Missing Candidate Name",
      message: "Your resume header is missing a full legal/professional name.",
      sectionId: "sec_contact",
    });
  }

  if (!contactInfo.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email)) {
    findings.push({
      id: "cnt_invalid_email",
      category: "CONTACT",
      severity: "high",
      title: "Invalid or Missing Email",
      message: "Provide a valid professional email address in the contact section.",
      sectionId: "sec_contact",
    });
  }

  if (!contactInfo.phone || contactInfo.phone.trim().length < 8) {
    findings.push({
      id: "cnt_missing_phone",
      category: "CONTACT",
      severity: "medium",
      title: "Missing Phone Number",
      message: "Recruiters and automated systems require a valid direct contact number.",
      sectionId: "sec_contact",
    });
  }

  // Domain-specific link requirements
  if (
    (resume.domainKey === "ENGINEERING" || resume.domainKey === "TECH") &&
    !contactInfo.githubUrl &&
    !contactInfo.portfolioUrl
  ) {
    findings.push({
      id: "cnt_missing_code_link",
      category: "CONTACT",
      severity: "medium",
      title: "Missing Portfolio or GitHub Link",
      message: "Software engineering recruiters strongly expect a GitHub or live portfolio URL.",
      sectionId: "sec_contact",
    });
  }

  // 2. Framework Required Sections Completeness Check
  const visibleTypes = new Set<string>(resume.sections.filter((s) => s.visible).map((s) => s.type));
  framework.sections.forEach((reqSec) => {
    if (reqSec.required) {
      const match = visibleTypes.has(reqSec.key) ||
        (reqSec.key === "clinicalRotations" && visibleTypes.has("experience")) ||
        (reqSec.key === "qualifications" && visibleTypes.has("education")) ||
        (reqSec.key === "competencies" && visibleTypes.has("skills"));

      if (!match) {
        findings.push({
          id: `req_sec_${reqSec.key}`,
          category: "COMPLETENESS",
          severity: "high",
          title: `Missing Section: ${reqSec.label}`,
          message: `The ${framework.name} benchmark requires a distinct '${reqSec.label}' section.`,
        });
      }
    }
  });

  // Extract all text content for skill-evidence and word count
  let fullResumeCorpus = "";
  const claimedSkills: string[] = [];

  resume.sections.forEach((section) => {
    if (!section.visible) return;

    if (section.type === "skills") {
      section.entries.forEach((e) => {
        if (e.tags) claimedSkills.push(...e.tags);
      });
    }

    section.entries.forEach((entry) => {
      if (entry.title) {
        fullResumeCorpus += " " + entry.title;
        totalWords += entry.title.split(/\s+/).length;
      }
      if (entry.subtitle) {
        fullResumeCorpus += " " + entry.subtitle;
        totalWords += entry.subtitle.split(/\s+/).length;
      }
      if (entry.text) {
        fullResumeCorpus += " " + entry.text;
        totalWords += entry.text.split(/\s+/).filter(Boolean).length;
        totalChars += entry.text.length;

        // Summary length check
        if (section.type === "summary") {
          const wordCount = entry.text.split(/\s+/).filter(Boolean).length;
          if (wordCount < 20) {
            findings.push({
              id: "sum_too_short",
              category: "LENGTH",
              severity: "medium",
              title: "Summary is Too Brief",
              message: "Your summary is under 20 words. Expand to 3 concise sentences for maximum impact.",
              sectionId: section.id,
              entryId: entry.id,
            });
          } else if (wordCount > 90) {
            findings.push({
              id: "sum_too_long",
              category: "LENGTH",
              severity: "low",
              title: "Summary is Overly Verbose",
              message: "Your summary exceeds 90 words. Shorten to keep it skimmable in 6 seconds.",
              sectionId: section.id,
              entryId: entry.id,
            });
          }
        }
      }

      // Check bullets inside entry
      entry.bullets.forEach((bullet) => {
        const text = bullet.text.trim();
        fullResumeCorpus += " " + text;
        const words = text.split(/\s+/).filter(Boolean);
        totalWords += words.length;
        totalChars += text.length;

        if (words.length === 0) return;

        // Weak verb detection
        const lower = text.toLowerCase();
        for (const weak of WEAK_VERB_STARTERS) {
          if (lower.startsWith(weak)) {
            findings.push({
              id: `weak_${bullet.id}`,
              category: "WEAK_BULLETS",
              severity: "medium",
              title: "Weak Opening Phrase Detected",
              message: `Bullet starts with passive phrase "${weak}". Replace with a strong action verb like "Architected", "Engineered", or "Implemented".`,
              sectionId: section.id,
              entryId: entry.id,
              bulletId: bullet.id,
              autoFixSuggestion: `Replace "${weak}" with an active accomplishment verb.`,
            });
            break;
          }
        }

        // Bullet length checks
        if (words.length > 35) {
          findings.push({
            id: `long_bullet_${bullet.id}`,
            category: "LENGTH",
            severity: "low",
            title: "Overly Long Bullet Point",
            message: `This bullet is ${words.length} words long. Split into two points or trim filler words for better ATS readability.`,
            sectionId: section.id,
            entryId: entry.id,
            bulletId: bullet.id,
          });
        } else if (words.length < 4) {
          findings.push({
            id: `short_bullet_${bullet.id}`,
            category: "WEAK_BULLETS",
            severity: "medium",
            title: "Underdeveloped Bullet Point",
            message: "Bullet is too short (less than 4 words) and lacks context or tangible impact.",
            sectionId: section.id,
            entryId: entry.id,
            bulletId: bullet.id,
          });
        }

        // Check for repeated words in close proximity (e.g. "the the", "with with")
        const repeatedWordMatch = text.match(/\b([a-zA-Z]+)\s+\1\b/i);
        if (repeatedWordMatch) {
          findings.push({
            id: `dup_word_${bullet.id}`,
            category: "STYLE",
            severity: "medium",
            title: `Accidental Duplicate Word: "${repeatedWordMatch[0]}"`,
            message: `Detected consecutive duplicate word "${repeatedWordMatch[1]}" in this bullet.`,
            sectionId: section.id,
            entryId: entry.id,
            bulletId: bullet.id,
          });
        }
      });

      // Date Chronology & Consistency Checks
      if (entry.startDate && entry.endDate && !entry.isCurrent) {
        if (entry.startDate > entry.endDate) {
          findings.push({
            id: `date_chronology_${entry.id}`,
            category: "CHRONOLOGY",
            severity: "high",
            title: "Start Date After End Date",
            message: `Entry "${entry.title || "item"}" has a start date (${entry.startDate}) that is after its end date (${entry.endDate}).`,
            sectionId: section.id,
            entryId: entry.id,
          });
        }
      }
    });
  });

  // 3. Unbacked Claimed Skills Check
  const lowerCorpus = fullResumeCorpus.toLowerCase();
  const evidenceSet = new Set(evidenceSkillTitles.map((s) => s.toLowerCase().trim()));

  claimedSkills.forEach((skill) => {
    const cleanSkill = skill.toLowerCase().trim();
    if (cleanSkill.length < 2) return;

    // Check if mentioned in projects/experience or backed by Evidence Vault
    const occurrencesInCorpus = (lowerCorpus.match(new RegExp(`\\b${cleanSkill.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "gi")) || []).length;
    const hasEvidenceVaultProof = evidenceSet.has(cleanSkill);

    if (occurrencesInCorpus <= 1 && !hasEvidenceVaultProof) {
      findings.push({
        id: `unbacked_skill_${cleanSkill.replace(/\s+/g, "_")}`,
        category: "SKILL_EVIDENCE",
        severity: "low",
        title: `Skill Lacks Experience Context: "${skill}"`,
        message: `"${skill}" is listed in your skills section but never referenced in your project or experience descriptions. Mention how you applied it or attach an Evidence Vault artifact.`,
      });
    }
  });

  // 4. ATS Formatting Checks
  if (resume.style.templateId === "two-column-sidebar") {
    findings.push({
      id: "ats_two_column_warning",
      category: "ATS",
      severity: "low",
      title: "Non-Standard Column Structure for ATS",
      message: "Two-column sidebar layouts can sometimes disrupt older ATS screen scrapers. For online application portals, consider using 'Standard Modern' or 'Tech Minimal'.",
    });
  }

  // 5. Overall Health Calculation
  let overallHealthScore = 100;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  findings.forEach((f) => {
    if (f.severity === "high") {
      highCount++;
      overallHealthScore -= 15;
    } else if (f.severity === "medium") {
      mediumCount++;
      overallHealthScore -= 6;
    } else {
      lowCount++;
      overallHealthScore -= 2;
    }
  });

  overallHealthScore = Math.max(30, Math.min(100, overallHealthScore));

  // Estimate page count: ~400 words per single-column A4 page
  const estimatedPageCount = totalWords <= 450 ? 1 : totalWords <= 950 ? 2 : 3;

  return {
    overallHealthScore,
    totalFindings: findings.length,
    highCount,
    mediumCount,
    lowCount,
    findings,
    estimatedPageCount,
    wordCount: totalWords,
    characterCount: totalChars,
  };
}
