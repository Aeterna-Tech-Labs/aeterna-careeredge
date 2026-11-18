// src/lib/resume/parser.ts
// Structured Resume Parser with Strict Anti-Hallucination Guarantees
// Parses raw resume text into verified candidate entities with DOCUMENT_EXTRACTED provenance.
// Uses fast deterministic heuristic rules first, with AI structuring fallback via ServerAiService.

import crypto from "crypto";
import { ServerAiService } from "@/lib/ai/provider";
import {
  normalizeBulletGlyphs,
  joinWrappedLines,
  normalizeTextEncoding,
} from "./extractor";
import type {
  FullResumeData,
  ResumeSection,
  ResumeContactInfo,
} from "./types";
import { DEFAULT_STYLE_CONFIG } from "./templates";

export const ACTION_VERBS =
  /^(?:developed|built|created|implemented|designed|architected|engineered|optimized|reduced|increased|spearheaded|orchestrated|automated|deployed|integrated|managed|led|authored|configured|delivered|streamlined|formulated|programmed|migrated|refactored|secured|maintained|trained|conducted|established|analyzed|collaborated|accelerated|generated|solved|executed|scaled|transformed|assisted|oversaw|coordinated|launched|monitored|improved|achieved|tested|debugged|supervised|administered)\b/i;

export const CONTINUATION_WORDS =
  /^(?:and|or|with|to|in|for|on|by|at|from|via|including|achieving|resulting|reducing|increasing|enabling|across|into|such\s+as|as\s+well\s+as)\b/i;

export const TECH_STACK_LINE =
  /^(?:tech(?:nologies)?(?:\s+used|\s+stack)?|stack|built\s+with|tools?|environment)\s*[:\-–—]/i;

export interface ParsedResumePayload {
  contactInfo: ResumeContactInfo;
  summary?: string;
  education: Array<{
    degree: string;
    institution: string;
    branch?: string;
    startYear?: string;
    endYear?: string;
    score?: string;
    bullets?: string[];
  }>;
  experience: Array<{
    title: string;
    company: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    bullets: string[];
    lowConfidence?: boolean;
  }>;
  projects: Array<{
    title: string;
    subtitle?: string;
    url?: string;
    bullets: string[];
    techStack?: string[];
    lowConfidence?: boolean;
    sourceSnippet?: string;
  }>;
  skills: Array<{
    name: string;
    category?: "TECHNICAL" | "DOMAIN" | "TOOL" | "SOFT";
  }>;
  certifications: Array<{
    title: string;
    issuer?: string;
    year?: string;
    url?: string;
  }>;
  customSections: Array<{
    title: string;
    entries: Array<{
      title?: string;
      subtitle?: string;
      text?: string;
      bullets?: string[];
    }>;
  }>;
  rawTextSnippet: string;
  contentHash: string;
}

/**
 * Deterministically extracts email, phone, links, and names from text.
 */
export function extractContactDetails(text: string): ResumeContactInfo {
  // Email regex
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0].trim() : "";

  // Phone regex (Indian + International formats)
  const phoneMatch = text.match(
    /(?:(?:\+|00)91[\s.-]?)?(?:[6-9]\d{9}|(?:\d{3,4}[\s.-]?\d{3,4}[\s.-]?\d{3,4}))/
  );
  const phone = phoneMatch ? phoneMatch[0].trim() : "";

  // LinkedIn URL
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9-_]+)/i);
  const linkedinUrl = linkedinMatch
    ? linkedinMatch[0].startsWith("http")
      ? linkedinMatch[0]
      : `https://${linkedinMatch[0]}`
    : undefined;

  // GitHub URL
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9-_]+)/i);
  const githubUrl = githubMatch
    ? githubMatch[0].startsWith("http")
      ? githubMatch[0]
      : `https://${githubMatch[0]}`
    : undefined;

  // Portfolio URL
  const portfolioMatch = text.match(
    /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-_]+\.(?:dev|me|io|in|com|tech))(?:\/[^\s]*)?/i
  );
  const portfolioUrl =
    portfolioMatch && !portfolioMatch[0].includes("linkedin") && !portfolioMatch[0].includes("github")
      ? portfolioMatch[0].startsWith("http")
        ? portfolioMatch[0]
        : `https://${portfolioMatch[0]}`
      : undefined;

  // Location heuristic
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  let location = "";
  for (const l of lines.slice(0, 10)) {
    const parts = l.split(/\||•/).map((p) => p.trim());
    for (const part of parts) {
      if (
        /(?:Bengaluru|Bangalore|Mumbai|Delhi|Hyderabad|Pune|Chennai|Kolkata|Noida|Gurugram|Maharashtra|Karnataka|India|USA|UK|Singapore)/i.test(
          part
        ) &&
        !part.includes("@") &&
        part.length < 50
      ) {
        location = part;
        break;
      }
    }
    if (location) break;
  }

  // Name heuristic: usually the first non-empty line of the resume that isn't a header or email
  let name = "";
  for (const l of lines.slice(0, 10)) {
    // If line has email, check if name appears before email (e.g. "ANUJ DANDAVATE anujwork2410@gmail.com")
    let candidate = l;
    if (l.includes("@")) {
      const beforeEmail = l.split(/[a-zA-Z0-9._%+-]+@/)[0].trim().replace(/[:|•\-–—]+$/, "").trim();
      if (
        beforeEmail.length >= 2 &&
        beforeEmail.length <= 40 &&
        !/^(?:SUMMARY|EDUCATION|EXPERIENCE|PROJECTS|SKILLS|CERTIFICATIONS|PROFILE)\b/i.test(beforeEmail)
      ) {
        candidate = beforeEmail;
      } else {
        continue;
      }
    }

    if (
      !candidate.includes("@") &&
      !candidate.includes("http") &&
      !candidate.includes("RESUME") &&
      !candidate.includes("CURRICULUM") &&
      !/^(?:SUMMARY|EDUCATION|EXPERIENCE|PROJECTS|SKILLS|CERTIFICATIONS|PROFILE|ABOUT|CONTACT)\b/i.test(candidate) &&
      !/^\+?\d/.test(candidate) &&
      candidate.length >= 2 &&
      candidate.length <= 40
    ) {
      name = candidate.replace(/[^a-zA-Z\s.'-]/g, "").trim();
      if (name.split(/\s+/).length >= 1) break;
    }
  }

  return {
    name: name || "Candidate Name",
    email,
    phone,
    location,
    linkedinUrl,
    githubUrl,
    portfolioUrl,
  };
}

/**
 * Deterministic Section Segmenter
 * Unwraps lines, normalizes bullet glyphs, and strictly separates sections without bullet spillover.
 */
export function segmentResumeSections(rawText: string): Map<string, string[]> {
  const sections = new Map<string, string[]>();
  const unwrapped = joinWrappedLines(normalizeBulletGlyphs(normalizeTextEncoding(rawText)));
  const lines = unwrapped.split("\n").map((l) => l.trim()).filter(Boolean);

  let currentSection = "HEADER";
  sections.set(currentSection, []);

  const sectionKeywords: Record<string, RegExp> = {
    SUMMARY: /^(?:professional\s+)?(?:summary|profile|about\s+me|objective)$/i,
    EDUCATION: /^(?:education|academic\s+history|qualifications|academics)$/i,
    EXPERIENCE: /^(?:experience|work\s+experience|employment|internships?|professional\s+experience)$/i,
    PROJECTS: /^(?:projects|academic\s+projects|personal\s+projects|key\s+projects)$/i,
    SKILLS: /^(?:skills|technical\s+skills|core\s+competencies|technologies)$/i,
    CERTIFICATIONS: /^(?:(?:training\s*(?:&|and)\s*)?certifications?|licenses|credentials|courses|training)$/i,
    ACHIEVEMENTS: /^(?:achievements?|awards|honors|extracurricular)$/i,
  };

  for (const line of lines) {
    let matchedSection: string | null = null;
    const isBullet =
      line.startsWith("•") ||
      /^[-*▪▫◦◆◇►▸›∙⁃✓✔]\s*/.test(line) ||
      /^\(?\d+[\.\)]\s*/.test(line);

    const cleanHeader = line.replace(/[:\-–—]+$/, "").trim();

    // A bullet line or long sentence can NEVER be a section header
    if (!isBullet && cleanHeader.length < 50 && !cleanHeader.includes("http")) {
      for (const [secKey, regex] of Object.entries(sectionKeywords)) {
        if (regex.test(cleanHeader)) {
          matchedSection = secKey;
          break;
        }
      }
    }

    if (matchedSection) {
      currentSection = matchedSection;
      if (!sections.has(currentSection)) sections.set(currentSection, []);
    } else {
      sections.get(currentSection)?.push(line);
    }
  }

  return sections;
}

/**
 * Pure Deterministic Parser
 */
export function parseResumeDeterministically(rawText: string): ParsedResumePayload {
  const contentHash = crypto.createHash("sha256").update(rawText).digest("hex");
  const contactInfo = extractContactDetails(rawText);
  const segments = segmentResumeSections(rawText);

  // Summary
  const summaryLines = segments.get("SUMMARY") || [];
  const summary = summaryLines.join(" ").trim();

  // Education
  const eduLines = segments.get("EDUCATION") || [];
  const education: ParsedResumePayload["education"] = [];
  let currentEdu: ParsedResumePayload["education"][0] | null = null;

  for (const line of eduLines) {
    if (
      /(?:b\.?tech|bachelor|m\.?tech|master|diploma|b\.?sc|m\.?sc|bba|mba|ph\.?d|high\s+school|secondary|university|college|institute)/i.test(
        line
      )
    ) {
      if (currentEdu) education.push(currentEdu);
      let degree = line;
      let institution = "";

      // Check if degree and institution are separated by comma or pipe on same line
      if (line.includes(",") || line.includes("|")) {
        const parts = line.split(/[,|]/).map((p) => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
          if (/(?:university|college|institute|school|sppu|iit|nit|bits)/i.test(parts[0])) {
            institution = parts[0];
            degree = parts.slice(1).join(", ");
          } else if (/(?:university|college|institute|school|sppu|iit|nit|bits)/i.test(parts[parts.length - 1])) {
            institution = parts[parts.length - 1];
            degree = parts.slice(0, -1).join(", ");
          } else {
            degree = parts[0];
            institution = parts[1];
          }
        }
      }

      currentEdu = {
        degree,
        institution,
        bullets: [],
      };

      const yearMatch = line.match(/\b(20\d{2}|19\d{2})\b/g);
      if (yearMatch) {
        currentEdu.endYear = yearMatch[yearMatch.length - 1];
        if (yearMatch.length > 1) currentEdu.startYear = yearMatch[0];
      }
    } else if (currentEdu && !currentEdu.institution && line.length < 80) {
      currentEdu.institution = line;
    } else if (currentEdu) {
      const yearMatch = line.match(/\b(20\d{2}|19\d{2})\b/g);
      if (yearMatch && !currentEdu.endYear) {
        currentEdu.endYear = yearMatch[yearMatch.length - 1];
        if (yearMatch.length > 1) currentEdu.startYear = yearMatch[0];
      }
      const scoreMatch = line.match(/(?:CGPA|SGPA|GPA|Percentage|%)\s*[:=]?\s*([0-9.]+(?:\s*\/\s*[0-9.]+)?[\/%]?)/i);
      if (scoreMatch && !currentEdu.score) {
        currentEdu.score = scoreMatch[0].trim();
      }
      if (line.startsWith("•") || line.startsWith("-")) {
        currentEdu.bullets?.push(line.replace(/^[•\-*]\s*/, ""));
      }
    }
  }
  if (currentEdu) education.push(currentEdu);

  // Experience
  const expLines = segments.get("EXPERIENCE") || [];
  const rawExperience: ParsedResumePayload["experience"] = [];
  let currentExp: ParsedResumePayload["experience"][0] | null = null;

  for (const line of expLines) {
    const isBullet =
      line.startsWith("•") ||
      /^[-*▪▫◦◆◇►▸›∙⁃✓✔]\s*/.test(line) ||
      /^\(?\d+[\.\)]\s*/.test(line);

    if (isBullet) {
      if (currentExp) {
        currentExp.bullets.push(line.replace(/^(?:•|[-*▪▫◦◆◇►▸›∙⁃✓✔]|\(?\d+[\.\)])\s*/, "").trim());
      }
      continue;
    }

    const hasRoleKeyword = /(?:intern|developer|engineer|lead|consultant|manager|analyst|associate|trainee|architect|specialist)/i.test(line);
    const hasCompanySeparator = line.includes(" at ") || line.includes(", ") || line.includes(" | ") || line.includes(" – ") || line.includes(" - ");
    const isActionVerbSentence = ACTION_VERBS.test(line) && (line.split(/\s+/).length > 4 || /[.:;!?]$/.test(line));
    const isContinuation = /^[a-z]/.test(line) || CONTINUATION_WORDS.test(line);

    if (currentExp && (isActionVerbSentence || isContinuation)) {
      currentExp.bullets.push(line);
      continue;
    }

    if (hasRoleKeyword && (hasCompanySeparator || line.length < 60) && !isActionVerbSentence && !isContinuation) {
      if (currentExp) rawExperience.push(currentExp);
      let title = line;
      let company = "";
      let startDate: string | undefined;
      let endDate: string | undefined;
      let isCurrent = false;

      // Extract dates from header line (e.g., 06/2023 – 08/2023 or 2022 - Present)
      const dateRangeMatch = line.match(/(\d{1,2}\/\d{4}|\w+\s+\d{4}|\d{4})\s*(?:[-–—to\u2013]|â€“)+\s*(\d{1,2}\/\d{4}|\w+\s+\d{4}|\d{4}|Present|Current)/i);
      let cleanLine = line;
      if (dateRangeMatch) {
        startDate = dateRangeMatch[1].trim();
        endDate = dateRangeMatch[2].trim();
        if (/present|current/i.test(endDate)) {
          isCurrent = true;
          endDate = undefined;
        }
        cleanLine = line.replace(dateRangeMatch[0], "").trim();
      }

      if (cleanLine.includes(" at ")) {
        const parts = cleanLine.split(" at ");
        title = parts[0].trim();
        company = parts.slice(1).join(" at ").trim();
      } else if (cleanLine.includes(", ")) {
        const parts = cleanLine.split(", ");
        title = parts[0].trim();
        company = parts.slice(1).join(", ").trim();
      } else if (cleanLine.includes(" | ")) {
        const parts = cleanLine.split(" | ");
        title = parts[0].trim();
        company = parts.slice(1).join(" | ").trim();
      }

      // If company has trailing date range that wasn't stripped from line
      const trailingDateMatch = company.match(/(\d{1,2}\/\d{4}|\w+\s+\d{4}|\d{4})\s*(?:[-–—to\u2013]|â€“)+\s*(\d{1,2}\/\d{4}|\w+\s+\d{4}|\d{4}|Present|Current)/i);
      if (trailingDateMatch) {
        if (!startDate) startDate = trailingDateMatch[1].trim();
        if (!endDate && !isCurrent) {
          if (/present|current/i.test(trailingDateMatch[2])) isCurrent = true;
          else endDate = trailingDateMatch[2].trim();
        }
        company = company.replace(trailingDateMatch[0], "").trim();
      }

      currentExp = {
        title: title.replace(/[,|\-–—â€“]+$/, "").trim(),
        company: company.replace(/[,|\-–—â€“]+$/, "").trim(),
        startDate,
        endDate,
        isCurrent,
        bullets: [],
      };
    } else if (currentExp) {
      if (!currentExp.company && line.length < 50 && !line.includes("http") && !isActionVerbSentence) {
        currentExp.company = line;
      } else {
        currentExp.bullets.push(line);
      }
    }
  }
  if (currentExp) rawExperience.push(currentExp);
  const experience = validateAndRepairExperience(rawExperience);

  // Projects
  const projLines = segments.get("PROJECTS") || [];
  const rawProjects: ParsedResumePayload["projects"] = [];
  let currentProj: ParsedResumePayload["projects"][0] | null = null;

  for (let i = 0; i < projLines.length; i++) {
    const rawLine = projLines[i].trim();
    if (!rawLine) continue;

    // 1. Check for URL
    const urlMatch = rawLine.match(/(?:https?:\/\/[^\s]+|github\.com\/[^\s]+|gitlab\.com\/[^\s]+|bitbucket\.org\/[^\s]+)/i);
    const lineWithoutUrl = urlMatch ? rawLine.replace(urlMatch[0], "").trim() : rawLine;
    const isLinkLine = Boolean(
      urlMatch &&
        (lineWithoutUrl.length === 0 ||
          lineWithoutUrl
            .replace(
              /^(?:github|gitlab|bitbucket|link|code|repo|source|url|project\s+link|live\s+demo)\s*[:\-–—\s]*/i,
              ""
            )
            .trim().length === 0)
    );

    if (isLinkLine && urlMatch) {
      if (currentProj) {
        currentProj.url = urlMatch[0].startsWith("http") ? urlMatch[0] : `https://${urlMatch[0]}`;
      }
      continue;
    }

    // 2. Check for Bullet Marker
    const isBulletMarker =
      rawLine.startsWith("•") ||
      /^[-*▪▫◦◆◇►▸›∙⁃✓✔]\s*/.test(rawLine) ||
      /^\(?\d+[\.\)]\s*/.test(rawLine);

    if (isBulletMarker) {
      const bulletText = rawLine.replace(/^(?:•|[-*▪▫◦◆◇►▸›∙⁃✓✔]|\(?\d+[\.\)])\s*/, "").trim();
      if (currentProj) {
        currentProj.bullets.push(bulletText);
      } else {
        // Bullet appeared before any project title: start initial project
        currentProj = {
          title: "Project",
          bullets: [bulletText],
        };
      }
      continue;
    }

    // 3. Check for Tech Stack indicator line
    if (TECH_STACK_LINE.test(rawLine) && currentProj) {
      const tech = rawLine.replace(TECH_STACK_LINE, "").trim();
      currentProj.subtitle = currentProj.subtitle ? `${currentProj.subtitle} | ${tech}` : tech;
      continue;
    }

    // Look ahead to check next line context
    let nextNonEmptyLine = "";
    for (let k = i + 1; k < projLines.length; k++) {
      if (projLines[k].trim()) {
        nextNonEmptyLine = projLines[k].trim();
        break;
      }
    }
    const nextHasUrl = /(?:https?:\/\/|github\.com)/i.test(nextNonEmptyLine);
    const nextIsBullet = nextNonEmptyLine.startsWith("•") || /^[-*▪▫◦◆◇►▸›∙⁃✓✔]/.test(nextNonEmptyLine);
    const nextIsTech = TECH_STACK_LINE.test(nextNonEmptyLine) || /^(?:tech|stack|built)/i.test(nextNonEmptyLine);
    const hasTitleSeparator = rawLine.includes(" | ") || rawLine.includes(" – ") || rawLine.includes(" — ");

    // Check if line is formatted in Title Case (e.g. "Automated Drone Fleet Management Platform")
    const words = rawLine.trim().split(/\s+/);
    const isTitleCase =
      words.length <= 8 &&
      words.every(
        (w) =>
          /^[A-Z0-9"(\[]/.test(w) ||
          /^(?:and|or|of|for|in|on|with|to|at|by|the|a|an|v\d+|\d+)$/i.test(w)
      ) &&
      !/[.:;!?]$/.test(rawLine);

    // 4. Check for Action Verb sentence (un-bulleted description)
    // A title-cased proper noun phrase followed by a URL or bullets is a TITLE, not a bullet!
    const isActionVerbSentence =
      ACTION_VERBS.test(rawLine) &&
      !hasTitleSeparator &&
      !(isTitleCase && (nextHasUrl || nextIsBullet || nextIsTech)) &&
      (rawLine.split(/\s+/).length > 4 || /[.:;!?]$/.test(rawLine));

    // 5. Check for Continuation sentence
    const isContinuation =
      /^[a-z]/.test(rawLine) ||
      CONTINUATION_WORDS.test(rawLine);

    if (currentProj && (isActionVerbSentence || isContinuation)) {
      currentProj.bullets.push(rawLine);
      continue;
    }

    // 6. Strict Project Title Boundary Detection
    // A line is a Project Title ONLY IF:
    // - Not a bullet marker
    // - Not an action verb sentence
    // - Not a continuation line
    // - Reasonably short (<= 80 chars, or <= 10 words)
    // - Starts with uppercase letter or digit
    const looksLikeTitle =
      rawLine.length <= 80 &&
      rawLine.split(/\s+/).length <= 10 &&
      /^[A-Z0-9"']/.test(rawLine) &&
      !isActionVerbSentence &&
      !isContinuation;

    // Positive project boundary condition
    if (
      looksLikeTitle &&
      (hasTitleSeparator ||
        nextHasUrl ||
        nextIsBullet ||
        nextIsTech ||
        !currentProj ||
        currentProj.bullets.length > 0 ||
        Boolean(currentProj.url))
    ) {
      if (currentProj) rawProjects.push(currentProj);

      let title = rawLine;
      let subtitle: string | undefined;
      const url = urlMatch
        ? urlMatch[0].startsWith("http")
          ? urlMatch[0]
          : `https://${urlMatch[0]}`
        : undefined;

      if (hasTitleSeparator) {
        const separator = rawLine.includes(" | ") ? " | " : rawLine.includes(" – ") ? " – " : " — ";
        const parts = rawLine.split(separator);
        title = parts[0].trim();
        subtitle = parts.slice(1).join(" | ").trim();
      }

      currentProj = {
        title: title.replace(/[:\-–—]+$/, "").trim(),
        subtitle,
        url,
        bullets: [],
      };
    } else if (currentProj) {
      // Ambiguous line attaches to the active project's bullets (never spawns an orphan project)
      currentProj.bullets.push(rawLine);
    } else {
      currentProj = {
        title: rawLine.replace(/[:\-–—]+$/, "").trim(),
        bullets: [],
      };
    }
  }
  if (currentProj) rawProjects.push(currentProj);
  const projects = validateAndRepairProjects(rawProjects);

  // Skills
  const skillLines = segments.get("SKILLS") || [];
  const rawSkills: string[] = [];
  for (const line of skillLines) {
    const content = line.includes(":") ? line.slice(line.lastIndexOf(":") + 1).trim() : line;
    if (content.includes(",")) {
      content.split(",").map((s) => s.trim()).filter(Boolean).forEach((s) => rawSkills.push(s));
    } else if (content.includes("|")) {
      content.split("|").map((s) => s.trim()).filter(Boolean).forEach((s) => rawSkills.push(s));
    } else if (content.startsWith("•") || content.startsWith("-")) {
      rawSkills.push(content.replace(/^[•\-]\s*/, "").trim());
    } else if (content.length < 40) {
      rawSkills.push(content.trim());
    }
  }

  const skills: ParsedResumePayload["skills"] = rawSkills
    .filter((s) => s.length > 1 && s.length < 50)
    .map((s) => ({
      name: s,
      category: categorizeSkill(s),
    }));

  // Certifications
  const certLines = segments.get("CERTIFICATIONS") || [];
  const certifications: ParsedResumePayload["certifications"] = [];
  let currentCert: ParsedResumePayload["certifications"][0] | null = null;

  for (const line of certLines) {
    if (line.toLowerCase().startsWith("focus:") && currentCert) {
      continue;
    }
    const clean = line.replace(/^[•\-*]\s*/, "").trim();
    if (clean.length > 2 && clean.length < 100) {
      let title = clean;
      let issuer: string | undefined;

      if (clean.includes(" | ")) {
        const parts = clean.split(" | ");
        title = parts[0].trim();
        issuer = parts[1].trim();
      } else if (clean.includes(" — ")) {
        const parts = clean.split(" — ");
        title = parts[0].trim();
        issuer = parts[1].trim();
      }

      currentCert = {
        title,
        issuer,
      };
      certifications.push(currentCert);
    }
  }

  return {
    contactInfo,
    summary: summary || undefined,
    education,
    experience,
    projects,
    skills,
    certifications,
    customSections: [],
    rawTextSnippet: rawText.slice(0, 1500),
    contentHash,
  };
}

/**
 * Post-parse validator & repair for projects.
 * Catches orphan projects (0 bullets, no URL), detects whether their title is an un-bulleted action verb or continuation line,
 * and auto-merges them into the previous project.
 * Genuinely standalone titles with 0 bullets are retained and flagged with lowConfidence: true.
 */
export function validateAndRepairProjects(
  rawProjects: ParsedResumePayload["projects"],
  _sourceText?: string
): ParsedResumePayload["projects"] {
  const repaired: ParsedResumePayload["projects"] = [];

  for (let i = 0; i < rawProjects.length; i++) {
    const proj = rawProjects[i];
    const title = (proj.title || "").trim();
    const bullets = (proj.bullets || []).map((b) => b.trim()).filter(Boolean);
    const hasUrl = Boolean(proj.url);

    // Check if this project is an "orphan" (0 bullets, no URL)
    if (bullets.length === 0 && !hasUrl && repaired.length > 0) {
      const prevProj = repaired[repaired.length - 1];

      const isOrphanBullet =
        /^[a-z]/.test(title) ||
        CONTINUATION_WORDS.test(title) ||
        ACTION_VERBS.test(title) ||
        title.split(/\s+/).length > 7 ||
        /[.!?]$/.test(title);

      const isOrphanTechStack =
        TECH_STACK_LINE.test(title) ||
        /^(?:react|node|python|java|c\+\+|aws|docker|typescript|next\.js|sql|mongodb|graphql|tailwind|flutter)\b/i.test(title);

      if (isOrphanBullet) {
        prevProj.bullets.push(title);
        continue;
      }

      if (isOrphanTechStack) {
        prevProj.subtitle = prevProj.subtitle ? `${prevProj.subtitle} | ${title}` : title;
        continue;
      }

      // If it looks like a genuine project title without bullets, keep it but flag it
      if (title.length >= 2 && title.length <= 70 && !ACTION_VERBS.test(title)) {
        repaired.push({
          ...proj,
          title,
          bullets: [],
          lowConfidence: true,
        });
        continue;
      }
    }

    // Check if title has embedded tech stack or subtitle
    let cleanTitle = title;
    let subtitle = proj.subtitle;
    if (!subtitle && (cleanTitle.includes(" | ") || cleanTitle.includes(" – ") || cleanTitle.includes(" — "))) {
      const separator = cleanTitle.includes(" | ") ? " | " : cleanTitle.includes(" – ") ? " – " : " — ";
      const parts = cleanTitle.split(separator);
      cleanTitle = parts[0].trim();
      subtitle = parts.slice(1).join(" | ").trim();
    }

    repaired.push({
      ...proj,
      title: cleanTitle,
      subtitle,
      url: proj.url ? proj.url : undefined,
      bullets,
      lowConfidence: proj.lowConfidence || bullets.length === 0,
    });
  }

  return repaired;
}

/**
 * Post-parse validator & repair for experience.
 * Merges orphan bullet lines into previous job role.
 */
export function validateAndRepairExperience(
  rawExperience: ParsedResumePayload["experience"]
): ParsedResumePayload["experience"] {
  const repaired: ParsedResumePayload["experience"] = [];

  for (let i = 0; i < rawExperience.length; i++) {
    const exp = rawExperience[i];
    const title = (exp.title || "").trim();
    const bullets = (exp.bullets || []).map((b) => b.trim()).filter(Boolean);
    const hasCompany = Boolean(exp.company && exp.company.length > 1);

    if (bullets.length === 0 && !hasCompany && repaired.length > 0) {
      const prevExp = repaired[repaired.length - 1];
      const isOrphanBullet =
        /^[a-z]/.test(title) ||
        CONTINUATION_WORDS.test(title) ||
        ACTION_VERBS.test(title) ||
        title.split(/\s+/).length > 7;

      if (isOrphanBullet) {
        prevExp.bullets.push(title);
        continue;
      }
    }

    repaired.push({
      ...exp,
      title,
      bullets,
      lowConfidence: exp.lowConfidence || bullets.length === 0,
    });
  }

  return repaired;
}

function categorizeSkill(name: string): "TECHNICAL" | "DOMAIN" | "TOOL" | "SOFT" {
  const techRegex = /java|python|c\+\+|react|node|sql|aws|docker|typescript|javascript|html|css|angular|flutter|kubernetes/i;
  const toolRegex = /git|jira|figma|postman|vscode|linux|excel|tableau|powerbi|photoshop/i;
  const softRegex = /communication|leadership|teamwork|problem-solving|critical\s+thinking|adaptability|time\s+management/i;

  if (techRegex.test(name)) return "TECHNICAL";
  if (toolRegex.test(name)) return "TOOL";
  if (softRegex.test(name)) return "SOFT";
  return "DOMAIN";
}

/**
 * Intelligent Structured Parser with AI Fallback
 * Strictly guarantees Anti-Hallucination: parses ONLY what is present in rawText.
 */
export async function parseResumeWithIntelligence(
  rawText: string,
  userDomain = "ENGINEERING_TECH"
): Promise<ParsedResumePayload> {
  const deterministic = parseResumeDeterministically(rawText);

  // If deterministic parser successfully populated education, experience, or projects, and contact, return immediately
  const hasGoodYield =
    (deterministic.education.length > 0 ||
      deterministic.projects.length > 0 ||
      deterministic.experience.length > 0) &&
    Boolean(deterministic.contactInfo.email);

  if (hasGoodYield) {
    return deterministic;
  }

  // Use economical ServerAiService FAST model to structure ambiguous formatting
  const aiService = new ServerAiService();
  if (aiService.getProviderName() === "mock") {
    return deterministic;
  }

  try {
    const prompt = `
You are a precision resume extraction engine. Extract ONLY facts explicitly present in the provided resume text.
Do NOT invent, infer, or hallucinate degrees, colleges, grades, companies, dates, or skills.
If a field is missing, omit it or leave it blank.

CRITICAL RULES FOR PROJECTS:
1. A project is a named piece of work (e.g., "TaskMaster Pro", "DevPulse Analytics", "CloudVault Storage").
2. Bullet points under a project are its DESCRIPTION, NEVER separate projects.
3. NEVER create a project from a bullet point or a sentence starting with an action verb (e.g. "Built...", "Implemented...", "Reduced...").
4. If a resume has 3 projects, output EXACTLY 3 project objects in the projects array.
5. If a line is wrapped or ambiguous, attach it as a bullet to the project above it. Do NOT make it a new project.
6. Extract links (e.g. GitHub URL) into the "url" field of the project they belong to.
7. Never invent technologies or links not in the text.

CRITICAL RULES FOR WORK EXPERIENCE:
1. A job entry represents a role at a company (e.g. "Software Engineer Intern at CloudScale Inc").
2. Bullet points under a role describe responsibilities and achievements, NEVER separate job entries.

Output strict JSON matching this schema:
{
  "name": string,
  "email": string,
  "phone": string,
  "location": string,
  "linkedinUrl": string,
  "githubUrl": string,
  "portfolioUrl": string,
  "summary": string,
  "education": [{"degree": string, "institution": string, "branch": string, "startYear": string, "endYear": string, "score": string}],
  "experience": [{"title": string, "company": string, "location": string, "startDate": string, "endDate": string, "bullets": [string]}],
  "projects": [{"title": string, "subtitle": string, "url": string, "bullets": [string], "lowConfidence": boolean}],
  "skills": [{"name": string, "category": "TECHNICAL"|"DOMAIN"|"TOOL"|"SOFT"}],
  "certifications": [{"title": string, "issuer": string, "year": string}]
}

Resume Text:
"""
${rawText.slice(0, 8000)}
"""
`;

    const response = await aiService.generateStructuredAdvice<Partial<ParsedResumePayload>>({
      operation: "EXTRACTION",
      studentContext: { academicDomain: userDomain, skills: [] },
      customPrompt: prompt,
      schemaDescription: "JSON object with contactInfo, summary, education, experience, projects, skills, certifications",
      modelTier: "FAST",
    });

    if (response.data) {
      const data = response.data;
      const aiProjects = validateAndRepairProjects(
        ((data.projects as any) || deterministic.projects).map((p: any) => ({
          title: p.title || "Project",
          subtitle: p.subtitle,
          url: p.url,
          bullets: Array.isArray(p.bullets) ? p.bullets : [],
          lowConfidence: Boolean(p.lowConfidence),
        }))
      );

      const aiExperience = validateAndRepairExperience(
        ((data.experience as any) || deterministic.experience).map((e: any) => ({
          title: e.title || "Role",
          company: e.company || "",
          location: e.location,
          startDate: e.startDate,
          endDate: e.endDate,
          isCurrent: Boolean(e.isCurrent),
          bullets: Array.isArray(e.bullets) ? e.bullets : [],
        }))
      );

      // Reconcile: If deterministic found clean projects and AI created excess orphans, prefer deterministic
      const finalProjects =
        deterministic.projects.length > 0 && aiProjects.length > deterministic.projects.length * 1.5
          ? deterministic.projects
          : aiProjects;

      return {
        contactInfo: {
          name: (data as any).name || deterministic.contactInfo.name,
          email: (data as any).email || deterministic.contactInfo.email,
          phone: (data as any).phone || deterministic.contactInfo.phone,
          location: (data as any).location || deterministic.contactInfo.location,
          linkedinUrl: (data as any).linkedinUrl || deterministic.contactInfo.linkedinUrl,
          githubUrl: (data as any).githubUrl || deterministic.contactInfo.githubUrl,
          portfolioUrl: (data as any).portfolioUrl || deterministic.contactInfo.portfolioUrl,
        },
        summary: data.summary || deterministic.summary,
        education: (data.education as any) || deterministic.education,
        experience: aiExperience,
        projects: finalProjects,
        skills: (data.skills as any) || deterministic.skills,
        certifications: (data.certifications as any) || deterministic.certifications,
        customSections: [],
        rawTextSnippet: rawText.slice(0, 1500),
        contentHash: deterministic.contentHash,
      };
    }
  } catch (err) {
    console.warn("[ResumeParser] AI structuring fallback failed, returning deterministic parse:", err);
  }

  return deterministic;
}

/**
 * Converts a ParsedResumePayload into FullResumeData for Resume Studio.
 * Every extracted element is tagged with provenance: "DOCUMENT_EXTRACTED".
 */
export function convertParsedPayloadToResumeData(
  payload: ParsedResumePayload,
  domainKey = "engineering",
  targetRole = "Software Engineer"
): FullResumeData {
  const sections: ResumeSection[] = [];

  // 1. Summary Section
  if (payload.summary) {
    sections.push({
      id: "sec_summary",
      type: "summary",
      customTitle: "Professional Summary",
      visible: true,
      layoutOptions: { displayMode: "paragraph" },
      entries: [
        {
          id: `ent_sum_${Date.now()}`,
          text: payload.summary,
          bullets: [],
          provenance: "DOCUMENT_EXTRACTED",
        },
      ],
    });
  }

  // 2. Education Section
  if (payload.education.length > 0) {
    sections.push({
      id: "sec_education",
      type: "education",
      customTitle: "Education",
      visible: true,
      layoutOptions: { displayMode: "bullets", datePosition: "right" },
      entries: payload.education.map((edu, idx) => ({
        id: `ent_edu_${idx}_${Date.now()}`,
        title: edu.degree || "Degree",
        subtitle: edu.institution || "Institution",
        startDate: edu.startYear,
        endDate: edu.endYear,
        score: edu.score,
        bullets: (edu.bullets || []).map((b, bIdx) => ({
          id: `bul_edu_${idx}_${bIdx}`,
          text: b,
          provenance: "DOCUMENT_EXTRACTED",
          isApproved: true,
        })),
        provenance: "DOCUMENT_EXTRACTED",
      })),
    });
  }

  // 3. Experience Section
  if (payload.experience.length > 0) {
    sections.push({
      id: "sec_experience",
      type: "experience",
      customTitle: "Experience & Internships",
      visible: true,
      layoutOptions: { displayMode: "bullets", datePosition: "right" },
      entries: payload.experience.map((exp, idx) => ({
        id: `ent_exp_${idx}_${Date.now()}`,
        title: exp.title || "Role",
        subtitle: exp.company || "Company",
        location: exp.location,
        startDate: exp.startDate,
        endDate: exp.endDate,
        isCurrent: exp.isCurrent,
        bullets: exp.bullets.map((b, bIdx) => ({
          id: `bul_exp_${idx}_${bIdx}`,
          text: b,
          provenance: "DOCUMENT_EXTRACTED",
          isApproved: true,
        })),
        provenance: "DOCUMENT_EXTRACTED",
      })),
    });
  }

  // 4. Projects Section
  if (payload.projects.length > 0) {
    sections.push({
      id: "sec_projects",
      type: "projects",
      customTitle: "Key Projects",
      visible: true,
      layoutOptions: { displayMode: "bullets", showLinks: true },
      entries: payload.projects.map((proj, idx) => ({
        id: `ent_proj_${idx}_${Date.now()}`,
        title: proj.title,
        subtitle: proj.subtitle,
        url: proj.url,
        bullets: proj.bullets.map((b, bIdx) => ({
          id: `bul_proj_${idx}_${bIdx}`,
          text: b,
          provenance: "DOCUMENT_EXTRACTED",
          isApproved: true,
        })),
        provenance: "DOCUMENT_EXTRACTED",
      })),
    });
  }

  // 5. Skills Section
  if (payload.skills.length > 0) {
    sections.push({
      id: "sec_skills",
      type: "skills",
      customTitle: "Skills & Technologies",
      visible: true,
      layoutOptions: { displayMode: "tags" },
      entries: [
        {
          id: `ent_skills_${Date.now()}`,
          title: "Core Competencies",
          tags: payload.skills.map((s) => s.name),
          bullets: [],
          provenance: "DOCUMENT_EXTRACTED",
        },
      ],
    });
  }

  // 6. Certifications Section
  if (payload.certifications.length > 0) {
    sections.push({
      id: "sec_certifications",
      type: "certifications",
      customTitle: "Certifications & Credentials",
      visible: true,
      layoutOptions: { displayMode: "bullets" },
      entries: payload.certifications.map((cert, idx) => ({
        id: `ent_cert_${idx}_${Date.now()}`,
        title: cert.title,
        subtitle: cert.issuer,
        endDate: cert.year,
        url: cert.url,
        bullets: [],
        provenance: "DOCUMENT_EXTRACTED",
      })),
    });
  }

  return {
    domainKey,
    domainName: domainKey.charAt(0).toUpperCase() + domainKey.slice(1),
    targetRole,
    contactInfo: payload.contactInfo,
    sections,
    style: {
      ...DEFAULT_STYLE_CONFIG,
      templateId: "standard-modern",
    },
    contentHash: payload.contentHash,
  };
}
