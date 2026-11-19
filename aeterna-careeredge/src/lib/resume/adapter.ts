// src/lib/resume/adapter.ts
// Universal Resume Data Normalizer & Backward Compatibility Adapter
// Safely maps legacy flat resume representations into the full customizable section model.

import crypto from "crypto";
import type {
  FullResumeData,
  ResumeSection,
  ResumeEntry,
  ResumeStyleConfig,
  ProvenanceType,
  ResumeColors,
  ResumeFonts,
  ResumeFontSizes,
  ResumeSpacing,
  ResumeLayoutSettings,
} from "./types";
import { DEFAULT_STYLE_CONFIG } from "./templates";
import { getFrameworkForDomain } from "./frameworks";

export function computeResumeContentHash(data: FullResumeData): string {
  const contentToHash = {
    domainKey: data.domainKey,
    targetRole: data.targetRole,
    contactInfo: data.contactInfo,
    sections: data.sections.map((s) => ({
      id: s.id,
      type: s.type,
      customTitle: s.customTitle,
      visible: s.visible,
      entries: s.entries.map((e) => ({
        title: e.title,
        subtitle: e.subtitle,
        bullets: e.bullets.map((b) => b.text),
        text: e.text,
        tags: e.tags,
      })),
    })),
  };
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(contentToHash))
    .digest("hex");
}

export function normalizeResumeData(
  rawStructured: unknown,
  fallbackUser?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    domain?: string;
    preferredJobRole?: string;
  },
  savedStyleData?: string | null
): FullResumeData {
  let parsed: Record<string, unknown> = {};
  if (typeof rawStructured === "string") {
    try {
      parsed = JSON.parse(rawStructured);
    } catch {
      parsed = {};
    }
  } else if (typeof rawStructured === "object" && rawStructured !== null) {
    parsed = rawStructured as Record<string, unknown>;
  }

  const domainKey = (parsed.domainKey as string) || fallbackUser?.domain || "GENERAL";
  const framework = getFrameworkForDomain(domainKey);
  const targetRole = (parsed.targetRole as string) || fallbackUser?.preferredJobRole || "Professional";

  // Parse style data or use defaults with deep merging
  let style: ResumeStyleConfig = { ...DEFAULT_STYLE_CONFIG };
  if (savedStyleData) {
    try {
      const parsedStyle = typeof savedStyleData === "string" ? JSON.parse(savedStyleData) : savedStyleData;
      style = {
        ...DEFAULT_STYLE_CONFIG,
        ...parsedStyle,
        colors: { ...DEFAULT_STYLE_CONFIG.colors, ...(parsedStyle.colors || {}) },
        fonts: { ...DEFAULT_STYLE_CONFIG.fonts, ...(parsedStyle.fonts || {}) },
        fontSizes: { ...DEFAULT_STYLE_CONFIG.fontSizes, ...(parsedStyle.fontSizes || {}) },
        spacing: { ...DEFAULT_STYLE_CONFIG.spacing, ...(parsedStyle.spacing || {}) },
        layout: { ...DEFAULT_STYLE_CONFIG.layout, ...(parsedStyle.layout || {}) },
      };
    } catch {
      // Use defaults
    }
  } else if (parsed.style && typeof parsed.style === "object") {
    const rawStyle = parsed.style as Record<string, unknown>;
    style = {
      ...DEFAULT_STYLE_CONFIG,
      ...rawStyle,
      colors: { ...DEFAULT_STYLE_CONFIG.colors, ...((rawStyle.colors as ResumeColors) || {}) },
      fonts: { ...DEFAULT_STYLE_CONFIG.fonts, ...((rawStyle.fonts as ResumeFonts) || {}) },
      fontSizes: { ...DEFAULT_STYLE_CONFIG.fontSizes, ...((rawStyle.fontSizes as ResumeFontSizes) || {}) },
      spacing: { ...DEFAULT_STYLE_CONFIG.spacing, ...((rawStyle.spacing as ResumeSpacing) || {}) },
      layout: { ...DEFAULT_STYLE_CONFIG.layout, ...((rawStyle.layout as ResumeLayoutSettings) || {}) },
    };
  } else if (parsed.templateId && typeof parsed.templateId === "string") {
    style.templateId = parsed.templateId as ResumeStyleConfig["templateId"];
  }

  // Parse Contact Info
  const rawContact = (parsed.contactInfo as Record<string, unknown>) || {};
  const contactInfo = {
    name: String(rawContact.name || fallbackUser?.name || "Student Name"),
    email: String(rawContact.email || fallbackUser?.email || ""),
    phone: String(rawContact.phone || fallbackUser?.phone || ""),
    location: String(rawContact.location || fallbackUser?.location || "India"),
    linkedinUrl: rawContact.linkedinUrl ? String(rawContact.linkedinUrl) : undefined,
    portfolioUrl: rawContact.portfolioUrl ? String(rawContact.portfolioUrl) : undefined,
    githubUrl: rawContact.githubUrl ? String(rawContact.githubUrl) : undefined,
  };

  // If already in modular section format, return validated data
  if (Array.isArray(parsed.sections) && parsed.sections.length > 0) {
    const sections: ResumeSection[] = (parsed.sections as Record<string, unknown>[]).map((sec, secIdx) => {
      const isSkills = sec.type === "skills";
      const entries: ResumeEntry[] = Array.isArray(sec.entries)
        ? (sec.entries as Record<string, unknown>[]).map((ent, entIdx) => {
            const rawTags = Array.isArray(ent.tags) ? (ent.tags as string[]).map(String) : [];
            const seenTagKeys = new Set<string>();
            const uniqueTags: string[] = [];
            for (const t of rawTags) {
              const clean = t.trim();
              if (!clean) continue;
              const key = clean.toLowerCase().replace(/[^a-z0-9]/g, "");
              if (!seenTagKeys.has(key)) {
                seenTagKeys.add(key);
                uniqueTags.push(clean);
              }
            }

            const rawSubtitle = ent.subtitle ? String(ent.subtitle) : undefined;
            // Clear subtitle if in skills section or if it duplicates tags
            const subtitle = isSkills
              ? undefined
              : rawSubtitle && uniqueTags.length > 0 && uniqueTags.some((tag) => rawSubtitle.toLowerCase().includes(tag.toLowerCase()))
              ? undefined
              : rawSubtitle;

            return {
              id: String(ent.id || `ent_${secIdx}_${entIdx}_${Date.now()}`),
              title: ent.title ? String(ent.title) : undefined,
              subtitle,
              location: ent.location ? String(ent.location) : undefined,
              startDate: ent.startDate ? String(ent.startDate) : undefined,
              endDate: ent.endDate ? String(ent.endDate) : undefined,
              isCurrent: Boolean(ent.isCurrent),
              score: ent.score ? String(ent.score) : undefined,
              url: ent.url ? String(ent.url) : undefined,
              text: ent.text ? String(ent.text) : undefined,
              bullets: Array.isArray(ent.bullets)
                ? (ent.bullets as (string | { id?: string; text: string; provenance?: string; isApproved?: boolean })[]).map((b, bIdx) => {
                    if (typeof b === "string") {
                      return {
                        id: `b_${secIdx}_${entIdx}_${bIdx}`,
                        text: b.replace(/^[•\-\*]\s*/, "").trim(),
                        provenance: "STUDENT_INPUT" as const,
                        isApproved: true,
                      };
                    }
                    return {
                      id: String(b.id || `b_${secIdx}_${entIdx}_${bIdx}`),
                      text: String(b.text || "").replace(/^[•\-\*]\s*/, "").trim(),
                      provenance: (b.provenance as ProvenanceType) || "STUDENT_INPUT",
                      isApproved: b.isApproved ?? true,
                      needsConfirmation: (b as { needsConfirmation?: boolean }).needsConfirmation,
                    };
                  })
                : [],
              tags: uniqueTags.length > 0 ? uniqueTags : undefined,
            };
          })
        : [];

      return {
        id: String(sec.id || `sec_${sec.type || "custom"}_${secIdx}`),
        type: (sec.type as ResumeSection["type"]) || "custom",
        customTitle: String(sec.customTitle || sec.title || "Section"),
        visible: sec.visible !== false,
        layoutOptions: (sec.layoutOptions as ResumeSection["layoutOptions"]) || {},
        entries,
      };
    });

    const fullData: FullResumeData = {
      domainKey,
      domainName: framework.name,
      targetRole,
      contactInfo,
      sections,
      style,
      selectedPassportItems: Array.isArray(parsed.selectedPassportItems)
        ? (parsed.selectedPassportItems as string[])
        : [],
    };
    fullData.contentHash = computeResumeContentHash(fullData);
    return fullData;
  }

  // ── Backward-Compatibility Migration: Convert Legacy Flat Data ────────────────
  const sections: ResumeSection[] = [];

  // 1. Summary Section
  const summaryText = typeof parsed.summary === "string" ? parsed.summary.trim() : "";
  sections.push({
    id: "sec_summary",
    type: "summary",
    customTitle: framework.sections[0]?.label || "Professional Summary",
    visible: true,
    layoutOptions: { displayMode: "paragraph" },
    entries: [
      {
        id: "ent_summary_1",
        text: summaryText,
        bullets: [],
        provenance: "STUDENT_INPUT",
      },
    ],
  });

  // 2. Core Skills Section
  const rawSkills = Array.isArray(parsed.skills) ? (parsed.skills as string[]) : [];
  sections.push({
    id: "sec_skills",
    type: "skills",
    customTitle: "Core Competencies",
    visible: true,
    layoutOptions: { displayMode: "tags" },
    entries: [
      {
        id: "ent_skills_1",
        title: "All Competencies",
        tags: rawSkills,
        bullets: [],
        provenance: "STUDENT_INPUT",
      },
    ],
  });

  // 3. Experience / Clinical Exposure
  const rawExp = Array.isArray(parsed.experience) ? (parsed.experience as Record<string, unknown>[]) : [];
  const expEntries: ResumeEntry[] = rawExp.map((exp, idx) => {
    const desc = String(exp.description || "");
    const bulletLines = desc
      .split("\n")
      .map((l) => l.replace(/^[•\-*]\s*/, "").trim())
      .filter(Boolean);

    return {
      id: `ent_exp_${idx}`,
      title: String(exp.title || "Position"),
      subtitle: String(exp.organization || exp.company || ""),
      location: exp.location ? String(exp.location) : undefined,
      startDate: exp.startDate ? String(exp.startDate) : undefined,
      endDate: exp.endDate ? String(exp.endDate) : undefined,
      isCurrent: Boolean(exp.isCurrent),
      bullets:
        bulletLines.length > 0
          ? bulletLines.map((line, bIdx) => ({
              id: `b_exp_${idx}_${bIdx}`,
              text: line,
              provenance: "STUDENT_INPUT",
              isApproved: true,
            }))
          : [
              {
                id: `b_exp_${idx}_0`,
                text: desc || "Documented professional responsibilities and deliverables.",
                provenance: "STUDENT_INPUT",
                isApproved: true,
              },
            ],
    };
  });

  sections.push({
    id: "sec_experience",
    type: "experience",
    customTitle:
      domainKey === "HEALTHCARE"
        ? "Clinical Rotations & Practicum"
        : domainKey === "EDUCATION"
          ? "Teaching Practicum & Experience"
          : "Experience & Internships",
    visible: true,
    layoutOptions: { displayMode: "bullets", datePosition: "right" },
    entries: expEntries,
  });

  // 4. Education Section
  const rawEdu = Array.isArray(parsed.education) ? (parsed.education as Record<string, unknown>[]) : [];
  const eduEntries: ResumeEntry[] = rawEdu.map((edu, idx) => ({
    id: `ent_edu_${idx}`,
    title: String(edu.degree || "Degree"),
    subtitle: String(edu.institution || "Institution"),
    startDate: edu.startYear ? String(edu.startYear) : undefined,
    endDate: edu.endYear ? String(edu.endYear) : undefined,
    score: edu.score ? String(edu.score) : undefined,
    bullets: [],
  }));

  sections.push({
    id: "sec_education",
    type: "education",
    customTitle: "Education & Qualifications",
    visible: true,
    layoutOptions: { displayMode: "bullets", datePosition: "right" },
    entries: eduEntries,
  });

  // 5. Projects Section
  const rawProjects = Array.isArray(parsed.projects) ? (parsed.projects as Record<string, unknown>[]) : [];
  const projEntries: ResumeEntry[] = rawProjects.map((p, idx) => {
    const desc = String(p.description || "");
    const bulletLines = desc
      .split("\n")
      .map((l) => l.replace(/^[•\-*]\s*/, "").trim())
      .filter(Boolean);

    const techTags = Array.isArray(p.techStack)
      ? (p.techStack as string[]).map(String)
      : typeof p.techStack === "string" && p.techStack.trim()
        ? p.techStack.split(/[,+]/).map((t) => t.trim()).filter(Boolean)
        : typeof p.technologies === "string" && p.technologies.trim()
          ? p.technologies.split(/[,+]/).map((t) => t.trim()).filter(Boolean)
          : Array.isArray(p.tags)
            ? (p.tags as string[]).map(String)
            : undefined;

    return {
      id: `ent_proj_${idx}`,
      title: String(p.title || "Project"),
      subtitle: p.subtitle ? String(p.subtitle) : p.role ? String(p.role) : undefined,
      url: p.url ? String(p.url) : p.projectUrl ? String(p.projectUrl) : undefined,
      bullets:
        bulletLines.length > 0
          ? bulletLines.map((line, bIdx) => ({
              id: `b_proj_${idx}_${bIdx}`,
              text: line,
              provenance: "STUDENT_INPUT",
              isApproved: true,
            }))
          : [
              {
                id: `b_proj_${idx}_0`,
                text: desc || "Implemented practical architecture and deliverables.",
                provenance: "STUDENT_INPUT",
                isApproved: true,
              },
            ],
      tags: techTags,
    };
  });

  sections.push({
    id: "sec_projects",
    type: "projects",
    customTitle: "Projects & Key Initiatives",
    visible: true,
    layoutOptions: { displayMode: "bullets" },
    entries: projEntries,
  });

  // 6. Certifications Section (if any)
  const rawCerts = Array.isArray(parsed.certifications) ? (parsed.certifications as string[]) : [];
  if (rawCerts.length > 0) {
    sections.push({
      id: "sec_certifications",
      type: "certifications",
      customTitle: "Certifications & Training",
      visible: true,
      layoutOptions: { displayMode: "bullets" },
      entries: rawCerts.map((c, idx) => ({
        id: `ent_cert_${idx}`,
        title: c,
        bullets: [],
      })),
    });
  }

  const fullData: FullResumeData = {
    domainKey,
    domainName: framework.name,
    targetRole,
    contactInfo,
    sections,
    style,
    selectedPassportItems: [],
  };

  fullData.contentHash = computeResumeContentHash(fullData);
  return fullData;
}
