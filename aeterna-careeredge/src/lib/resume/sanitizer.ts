// src/lib/resume/sanitizer.ts
// Universal Text Sanitization & Mojibake Resolution Engine for Aeterna CareerEdge
// Eliminates misencoded UTF-8 artifacts (â€¢, â€“', â†’, etc.), rogue bullet symbols,
// and control characters from resumes, databases, and AI generation pipelines.

import type {
  ParsedResumePayload,
} from "./parser";
import type {
  ResumeSection,
  FullResumeData,
} from "./types";
import type {
  ResumeStudioStrategyOption,
} from "./studio-generator";

/**
 * Normalizes common misencoded Latin-1 / Windows-1252 / UTF-8 artifact sequences.
 * Matches both Latin-1 byte representations (\u00E2\u0080\u00A2) and Windows-1252 character interpretations (â€¢).
 */
export function cleanMojibake(str?: string | null): string {
  if (!str) return "";
  return str
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    // Double-encoded UTF-8 sequences (UTF-8 bytes misinterpreted as Windows-1252 and re-encoded)
    .replace(/Ã¢â‚¬Â¢/g, "•")
    .replace(/Ã¢â‚¬â€œ/g, "–")
    .replace(/Ã¢â‚¬â„¢/g, "'")
    .replace(/Ã¢â‚¬Å“/g, "“")
    .replace(/Ã¢â‚¬ï¿½/g, "”")
    // Bullet (0xE2 0x80 0xA2 in Latin-1 / Win1252)
    .replace(/(\u00E2[\u0080\u20AC]\u00A2|â€¢)/g, "•")
    // Right arrow (0xE2 0x86 0x92)
    .replace(/(\u00E2[\u0086\u2020][\u0092\u2019]|â†’)/g, "→")
    // Left arrow (0xE2 0x86 0x90)
    .replace(/(\u00E2[\u0086\u2020][\u0090\u0080]|â† )/g, "←")
    // En-dash (0xE2 0x80 0x93)
    .replace(/(\u00E2[\u0080\u20AC][\u0093\u201C]|â€“)/g, "–")
    // Em-dash (0xE2 0x80 0x94)
    .replace(/(\u00E2[\u0080\u20AC][\u0094\u201D]|â€”)/g, "—")
    // Single quotes (0xE2 0x80 0x98 / 0x99)
    .replace(/(\u00E2[\u0080\u20AC][\u0098\u02DC]|â€˜)/g, "‘")
    .replace(/(\u00E2[\u0080\u20AC][\u0099\u2122]|â€™)/g, "’")
    // Double quotes (0xE2 0x80 0x9C / 0x9D)
    .replace(/(\u00E2[\u0080\u20AC][\u009C\u0153]|â€œ)/g, "“")
    .replace(/(\u00E2[\u0080\u20AC][\u009D\u009D\s]|â€[ \x9d\s])/g, "”")
    // Ellipsis (0xE2 0x80 0xA6)
    .replace(/(\u00E2[\u0080\u20AC][\u00A6\u2026]|â€¦)/g, "…")
    // Non-breaking space & middle dot
    .replace(/\u00C2\u00A0/g, " ")
    .replace(/\u00C2\u00B7/g, "·")
    .replace(/Â\s/g, " ")
    .replace(/Â/g, "")
    // Unicode replacement character artifacts
    .replace(/\uFFFD/g, "")
    .replace(/ï¿½/g, "")
    // Strip non-printable ASCII control characters (preserving newline \n and tab \t)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    // Normalize consecutive non-newline whitespace
    .replace(/[^\S\r\n]+/g, " ");
}

/**
 * Normalizes bullet text for resume entries.
 * Cleans mojibake, strips leading bullet glyphs/dashes/numbering,
 * and ensures clean, professional phrasing.
 */
export function cleanBulletText(str?: string | null): string {
  if (!str) return "";
  let text = cleanMojibake(str).trim();

  // Pattern for leading bullets, list markers, and dashes
  const leadingBulletPattern = /^[ \t]*(?:[•●○▪▫■□►▸›∙⁃✓✔\*\-\u2022\u2023\u25E6\u2043\u2219\u25AA\u25AB\u25CF\u25CB\u25A0\u25A1\u2713\u2714–—]+|(?:\(?\d+[\.\)]|\(\w\)))[ \t]*/;

  let prev = "";
  while (text !== prev && leadingBulletPattern.test(text)) {
    prev = text;
    text = text.replace(leadingBulletPattern, "").trim();
  }

  // Final safety strip of any residual leading dash or bullet characters
  text = text.replace(/^[•\-\*–—\s]+/, "").trim();

  return text;
}

/**
 * Sanitizes an entire ParsedResumePayload so all sections, bullets, and metadata
 * are completely clean of encoding artifacts.
 */
export function sanitizeResumePayload(payload: ParsedResumePayload): ParsedResumePayload {
  if (!payload) return payload;

  return {
    ...payload,
    contactInfo: {
      ...payload.contactInfo,
      name: cleanMojibake(payload.contactInfo?.name).trim(),
      email: cleanMojibake(payload.contactInfo?.email).trim(),
      phone: cleanMojibake(payload.contactInfo?.phone).trim(),
      location: cleanMojibake(payload.contactInfo?.location).trim(),
      linkedinUrl: payload.contactInfo?.linkedinUrl ? cleanMojibake(payload.contactInfo.linkedinUrl).trim() : undefined,
      githubUrl: payload.contactInfo?.githubUrl ? cleanMojibake(payload.contactInfo.githubUrl).trim() : undefined,
      portfolioUrl: payload.contactInfo?.portfolioUrl ? cleanMojibake(payload.contactInfo.portfolioUrl).trim() : undefined,
    },
    summary: payload.summary ? cleanMojibake(payload.summary).trim() : undefined,
    education: (payload.education || []).map((edu) => ({
      ...edu,
      degree: cleanMojibake(edu.degree).trim(),
      institution: cleanMojibake(edu.institution).trim(),
      branch: edu.branch ? cleanMojibake(edu.branch).trim() : undefined,
      score: edu.score ? cleanMojibake(edu.score).trim() : undefined,
      bullets: (edu.bullets || []).map((b) => cleanBulletText(b)).filter(Boolean),
    })),
    experience: (payload.experience || []).map((exp) => ({
      ...exp,
      title: cleanBulletText(exp.title),
      company: cleanMojibake(exp.company).trim(),
      location: exp.location ? cleanMojibake(exp.location).trim() : undefined,
      bullets: (exp.bullets || []).map((b) => cleanBulletText(b)).filter(Boolean),
    })),
    projects: (payload.projects || []).map((proj) => ({
      ...proj,
      title: cleanBulletText(proj.title),
      subtitle: proj.subtitle ? cleanMojibake(proj.subtitle).trim() : undefined,
      url: proj.url ? cleanMojibake(proj.url).trim() : undefined,
      bullets: (proj.bullets || []).map((b) => cleanBulletText(b)).filter(Boolean),
      techStack: (proj.techStack || []).map((t) => cleanMojibake(t).trim()).filter(Boolean),
    })),
    skills: (payload.skills || []).map((s) => ({
      ...s,
      name: cleanMojibake(s.name).trim(),
    })),
    certifications: (payload.certifications || []).map((c) => ({
      ...c,
      title: cleanMojibake(c.title).trim(),
      issuer: c.issuer ? cleanMojibake(c.issuer).trim() : undefined,
    })),
    customSections: (payload.customSections || []).map((cs) => ({
      ...cs,
      title: cleanMojibake(cs.title).trim(),
      entries: (cs.entries || []).map((entry) => ({
        ...entry,
        title: entry.title ? cleanBulletText(entry.title) : undefined,
        subtitle: entry.subtitle ? cleanMojibake(entry.subtitle).trim() : undefined,
        text: entry.text ? cleanMojibake(entry.text).trim() : undefined,
        bullets: (entry.bullets || []).map((b) => cleanBulletText(b)).filter(Boolean),
      })),
    })),
  };
}

/**
 * Sanitizes an array of ResumeSection objects (used in Resume Builder and Resume Studio).
 */
export function sanitizeResumeSections(sections: ResumeSection[]): ResumeSection[] {
  if (!sections || !Array.isArray(sections)) return [];

  return sections.map((sec) => ({
    ...sec,
    customTitle: cleanMojibake(sec.customTitle).trim(),
    entries: (sec.entries || []).map((entry) => ({
      ...entry,
      title: entry.title ? cleanBulletText(entry.title) : "",
      subtitle: entry.subtitle ? cleanMojibake(entry.subtitle).trim() : "",
      location: entry.location ? cleanMojibake(entry.location).trim() : undefined,
      score: entry.score ? cleanMojibake(entry.score).trim() : undefined,
      text: entry.text ? cleanMojibake(entry.text).trim() : undefined,
      tags: entry.tags ? entry.tags.map((t) => cleanMojibake(t).trim()).filter(Boolean) : undefined,
      bullets: (entry.bullets || []).map((b) => ({
        ...b,
        text: cleanBulletText(b.text),
      })).filter((b) => Boolean(b.text)),
    })),
  }));
}

/**
 * Sanitizes a generated ResumeStudioStrategyOption before sending to client or saving.
 */
export function sanitizeStudioOption(option: ResumeStudioStrategyOption): ResumeStudioStrategyOption {
  if (!option) return option;

  return {
    ...option,
    strategyName: cleanMojibake(option.strategyName).trim(),
    tagline: cleanMojibake(option.tagline).trim(),
    badgeLabel: cleanMojibake(option.badgeLabel).trim(),
    summary: cleanMojibake(option.summary).trim(),
    highlights: (option.highlights || []).map((h) => cleanMojibake(h).trim()),
    sections: sanitizeResumeSections(option.sections),
  };
}

/**
 * Sanitizes FullResumeData for storage or builder rendering.
 */
export function sanitizeResumeData(data: FullResumeData): FullResumeData {
  if (!data) return data;

  return {
    ...data,
    domainName: cleanMojibake(data.domainName).trim(),
    targetRole: cleanMojibake(data.targetRole).trim(),
    contactInfo: {
      ...data.contactInfo,
      name: cleanMojibake(data.contactInfo?.name).trim(),
      email: cleanMojibake(data.contactInfo?.email).trim(),
      phone: cleanMojibake(data.contactInfo?.phone).trim(),
      location: cleanMojibake(data.contactInfo?.location).trim(),
      linkedinUrl: data.contactInfo?.linkedinUrl ? cleanMojibake(data.contactInfo.linkedinUrl).trim() : undefined,
      githubUrl: data.contactInfo?.githubUrl ? cleanMojibake(data.contactInfo.githubUrl).trim() : undefined,
      portfolioUrl: data.contactInfo?.portfolioUrl ? cleanMojibake(data.contactInfo.portfolioUrl).trim() : undefined,
    },
    sections: sanitizeResumeSections(data.sections),
  };
}
