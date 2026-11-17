// src/lib/resume/templates.ts
// ATS-Rated Templates, Color Presets, Typography, and WCAG Contrast Verification
// Day 2 Resume Builder Upgrade

import type { TemplateDefinition, ResumeStyleConfig, ResumeColors } from "./types";

export const RESUME_TEMPLATES: Record<string, TemplateDefinition> = {
  "standard-modern": {
    id: "standard-modern",
    name: "Standard Modern",
    description: "Crisp single-column layout with clean section dividers. Maximum ATS readability.",
    atsRating: "ATS-Safe",
    isAtsSafe: true,
    recommendedFor: "Engineering, IT, Corporate & General Graduates",
  },
  "executive-classic": {
    id: "executive-classic",
    name: "Executive Classic",
    description: "Centered serif masthead with traditional horizontal rules. Authoritative and formal.",
    atsRating: "ATS-Safe",
    isAtsSafe: true,
    recommendedFor: "Law, Finance, Management & Senior Roles",
  },
  "tech-minimal": {
    id: "tech-minimal",
    name: "Tech Minimal",
    description: "High-density clean typography with subtle monospace accents for tech stacks.",
    atsRating: "ATS-Safe",
    isAtsSafe: true,
    recommendedFor: "Software Engineers, DevOps, Data Scientists",
  },
  "two-column-sidebar": {
    id: "two-column-sidebar",
    name: "Two-Column Sidebar",
    description: "Distributes contact, skills, and certifications into a distinct left column.",
    atsRating: "Visual / Direct",
    isAtsSafe: false,
    recommendedFor: "Direct Recruiter Review, Networking & Career Fairs (Non-ATS)",
  },
  "academic-clinical": {
    id: "academic-clinical",
    name: "Academic & Clinical",
    description: "Structured partitions tailored for hospital clinical rotations, council registrations, and pedagogy.",
    atsRating: "ATS-Safe",
    isAtsSafe: true,
    recommendedFor: "Nursing, Healthcare, Teaching & Academia",
  },
  "creative-portfolio": {
    id: "creative-portfolio",
    name: "Creative Portfolio",
    description: "Expressive header banner and project showcase framing for design-led roles.",
    atsRating: "Standard ATS",
    isAtsSafe: false,
    recommendedFor: "Design, UX/UI, Marketing & Creative Media",
  },
};

export function getTemplatePreset(templateId: string): Partial<ResumeStyleConfig> {
  switch (templateId) {
    case "executive-classic":
      return {
        templateId: "executive-classic",
        fonts: { heading: "Georgia", body: "Garamond" },
        colors: {
          accent: "#1E293B",
          heading: "#0F172A",
          body: "#334155",
          link: "#1E3A8A",
          background: "#FFFFFF",
          sidebar: "#F8FAFC",
        },
        fontSizes: { name: 24, headings: 13, body: 10 },
        layout: {
          columnLayout: "single",
          headerAlignment: "center",
          showPhoto: false,
          dateFormat: "YYYY",
          showContactIcons: false,
          dividerStyle: "solid",
        },
      };
    case "tech-minimal":
      return {
        templateId: "tech-minimal",
        fonts: { heading: "Trebuchet MS", body: "Inter" },
        colors: {
          accent: "#4F46E5",
          heading: "#111827",
          body: "#374151",
          link: "#4338CA",
          background: "#FFFFFF",
          sidebar: "#F9FAFB",
        },
        fontSizes: { name: 20, headings: 12, body: 9.5 },
        spacing: { margins: "compact", sectionSpacing: 14, lineHeight: 1.35, bulletIndent: 14 },
        layout: {
          columnLayout: "single",
          headerAlignment: "left",
          showPhoto: false,
          dateFormat: "MM/YYYY",
          showContactIcons: true,
          dividerStyle: "dashed",
        },
      };
    case "two-column-sidebar":
      return {
        templateId: "two-column-sidebar",
        fonts: { heading: "Plus Jakarta Sans", body: "Inter" },
        colors: {
          accent: "#7A0F1F",
          heading: "#2B1810",
          body: "#374151",
          link: "#7A0F1F",
          background: "#FFFFFF",
          sidebar: "#F8FAFC",
        },
        fontSizes: { name: 22, headings: 13, body: 9.5 },
        layout: {
          columnLayout: "two-column-left",
          headerAlignment: "left",
          showPhoto: false,
          dateFormat: "MMM YYYY",
          showContactIcons: true,
          dividerStyle: "subtle",
        },
      };
    case "academic-clinical":
      return {
        templateId: "academic-clinical",
        fonts: { heading: "Georgia", body: "Inter" },
        colors: {
          accent: "#065F46",
          heading: "#064E3B",
          body: "#374151",
          link: "#059669",
          background: "#FFFFFF",
          sidebar: "#F0FDF4",
        },
        fontSizes: { name: 22, headings: 13, body: 10 },
        layout: {
          columnLayout: "single",
          headerAlignment: "left",
          showPhoto: false,
          dateFormat: "MMM YYYY",
          showContactIcons: true,
          dividerStyle: "solid",
        },
      };
    case "creative-portfolio":
      return {
        templateId: "creative-portfolio",
        fonts: { heading: "Plus Jakarta Sans", body: "Inter" },
        colors: {
          accent: "#7C3AED",
          heading: "#1E1B4B",
          body: "#374151",
          link: "#6D28D9",
          background: "#FFFFFF",
          sidebar: "#F5F3FF",
        },
        fontSizes: { name: 24, headings: 14, body: 9.5 },
        layout: {
          columnLayout: "single",
          headerAlignment: "left",
          showPhoto: true,
          dateFormat: "MMM YYYY",
          showContactIcons: true,
          dividerStyle: "solid",
        },
      };
    case "standard-modern":
    default:
      return {
        templateId: "standard-modern",
        fonts: { heading: "Plus Jakarta Sans", body: "Inter" },
        colors: {
          accent: "#7A0F1F",
          heading: "#2B1810",
          body: "#374151",
          link: "#7A0F1F",
          background: "#FFFFFF",
          sidebar: "#FDF7F5",
        },
        fontSizes: { name: 22, headings: 13, body: 9.5 },
        spacing: { margins: "standard", sectionSpacing: 16, lineHeight: 1.45, bulletIndent: 16 },
        layout: {
          columnLayout: "single",
          headerAlignment: "left",
          showPhoto: false,
          dateFormat: "MMM YYYY",
          showContactIcons: true,
          dividerStyle: "solid",
        },
      };
  }
}

export const COLOR_PRESETS: Array<{
  id: string;
  name: string;
  colors: ResumeColors;
}> = [
  {
    id: "careeredge-maroon",
    name: "CareerEdge Brand",
    colors: {
      accent: "#7A0F1F",
      heading: "#2B1810",
      body: "#374151",
      link: "#7A0F1F",
      background: "#FFFFFF",
      sidebar: "#FDF7F5",
    },
  },
  {
    id: "corporate-navy",
    name: "Corporate Navy",
    colors: {
      accent: "#1E3A8A",
      heading: "#1E293B",
      body: "#334155",
      link: "#2563EB",
      background: "#FFFFFF",
      sidebar: "#F8FAFC",
    },
  },
  {
    id: "clinical-emerald",
    name: "Clinical Emerald",
    colors: {
      accent: "#065F46",
      heading: "#064E3B",
      body: "#374151",
      link: "#059669",
      background: "#FFFFFF",
      sidebar: "#F0FDF4",
    },
  },
  {
    id: "minimal-charcoal",
    name: "Minimal Charcoal",
    colors: {
      accent: "#1F2937",
      heading: "#111827",
      body: "#374151",
      link: "#4B5563",
      background: "#FFFFFF",
      sidebar: "#F9FAFB",
    },
  },
  {
    id: "heritage-amber",
    name: "Heritage Amber",
    colors: {
      accent: "#78350F",
      heading: "#451A03",
      body: "#374151",
      link: "#B45309",
      background: "#FFFFFF",
      sidebar: "#FEF3C7",
    },
  },
];

export const SAFE_FONTS = [
  {
    name: "Plus Jakarta Sans",
    family: "var(--font-plus-jakarta), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    category: "Sans-Serif (Modern)",
  },
  {
    name: "Inter",
    family: "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    category: "Sans-Serif (Neutral)",
  },
  {
    name: "Georgia",
    family: "Georgia, Cambria, 'Times New Roman', Times, serif",
    category: "Serif (Executive)",
  },
  {
    name: "Garamond",
    family: "Garamond, Baskerville, 'Hoefler Text', 'Times New Roman', serif",
    category: "Serif (Classic)",
  },
  {
    name: "Trebuchet MS",
    family: "'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', sans-serif",
    category: "Sans-Serif (Technical)",
  },
  {
    name: "Courier New",
    family: "'Courier New', Courier, monospace",
    category: "Monospace (Tech Accents)",
  },
];

export const DEFAULT_STYLE_CONFIG: ResumeStyleConfig = {
  templateId: "standard-modern",
  colors: {
    accent: "#7A0F1F",
    heading: "#2B1810",
    body: "#374151",
    link: "#7A0F1F",
    background: "#FFFFFF",
    sidebar: "#FDF7F5",
  },
  fonts: {
    heading: "Plus Jakarta Sans",
    body: "Inter",
  },
  fontSizes: {
    name: 24,
    headings: 13,
    body: 11,
  },
  spacing: {
    margins: "standard",
    sectionSpacing: 16,
    lineHeight: 1.4,
    bulletIndent: 16,
  },
  layout: {
    columnLayout: "single",
    headerAlignment: "left",
    showPhoto: false,
    dateFormat: "MMM YYYY",
    showContactIcons: true,
    dividerStyle: "solid",
  },
  page: {
    pageSize: "A4",
    fitToOnePage: false,
  },
};

// ── WCAG 2.1 Contrast Calculation Engine ──────────────────────────────────────

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    };
  }
  if (clean.length === 6) {
    return {
      r: parseInt(clean.substring(0, 2), 16),
      g: parseInt(clean.substring(2, 4), 16),
      b: parseInt(clean.substring(4, 6), 16),
    };
  }
  return null;
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function calculateContrastRatio(fgHex: string, bgHex: string): number {
  const fg = hexToRgb(fgHex) || { r: 55, g: 65, b: 81 };
  const bg = hexToRgb(bgHex) || { r: 255, g: 255, b: 255 };

  const l1 = getLuminance(fg.r, fg.g, fg.b);
  const l2 = getLuminance(bg.r, bg.g, bg.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return parseFloat(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

export function evaluateColorContrast(colors: ResumeColors): {
  bodyContrast: number;
  headingContrast: number;
  accentContrast: number;
  warnings: string[];
} {
  const bodyContrast = calculateContrastRatio(colors.body, colors.background);
  const headingContrast = calculateContrastRatio(colors.heading, colors.background);
  const accentContrast = calculateContrastRatio(colors.accent, colors.background);

  const warnings: string[] = [];
  if (bodyContrast < 4.5) {
    warnings.push(
      `Body text contrast (${bodyContrast}:1) is below WCAG 2.1 AA requirement (4.5:1). It may be difficult to read on printed paper or screens.`
    );
  }
  if (headingContrast < 3.0) {
    warnings.push(
      `Section heading contrast (${headingContrast}:1) is low for clear section separation.`
    );
  }
  if (accentContrast < 3.0) {
    warnings.push(
      `Accent color contrast (${accentContrast}:1) may appear washed out in print.`
    );
  }

  return {
    bodyContrast,
    headingContrast,
    accentContrast,
    warnings,
  };
}
