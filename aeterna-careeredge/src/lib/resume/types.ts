// src/lib/resume/types.ts
// Comprehensive Type Definitions for Full-Resume Customization & AI Improvement Engine
// Day 2 Resume Builder Upgrade (Strict Multi-Domain & Truth-Enforcing Architecture)

import { z } from "zod";

export type SectionType =
  | "contact"
  | "summary"
  | "education"
  | "experience"
  | "projects"
  | "skills"
  | "certifications"
  | "achievements"
  | "publications"
  | "volunteer"
  | "languages"
  | "custom";

export type ProvenanceType =
  | "STUDENT_INPUT"
  | "DOCUMENT_EXTRACTED"
  | "LINKEDIN_OAUTH"
  | "LINKEDIN_PDF"
  | "VERIFIED_REFERENCE"
  | "JOB_PROVIDER"
  | "AI_SUGGESTION";

export interface ResumeBullet {
  id: string;
  text: string;
  provenance: ProvenanceType;
  isApproved: boolean;
  needsConfirmation?: boolean;
}

export interface ResumeEntry {
  id: string;
  title?: string;
  subtitle?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  score?: string;
  url?: string;
  text?: string;
  bullets: ResumeBullet[];
  tags?: string[];
  provenance?: ProvenanceType;
}

export interface SectionLayoutOptions {
  displayMode?: "bullets" | "paragraph" | "tags" | "grouped";
  datePosition?: "right" | "below" | "hidden";
  showLocation?: boolean;
  showLinks?: boolean;
}

export interface ResumeSection {
  id: string;
  type: SectionType;
  customTitle: string;
  visible: boolean;
  layoutOptions?: SectionLayoutOptions;
  entries: ResumeEntry[];
}

export interface ResumeContactInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
}

export type ResumeTemplateId =
  | "standard-modern"
  | "executive-classic"
  | "tech-minimal"
  | "two-column-sidebar"
  | "academic-clinical"
  | "creative-portfolio";

export interface TemplateDefinition {
  id: ResumeTemplateId;
  name: string;
  description: string;
  atsRating: "ATS-Safe" | "Standard ATS" | "Visual / Direct";
  isAtsSafe: boolean;
  recommendedFor: string;
}

export interface ResumeColors {
  accent: string;      // Primary brand accent (e.g. #7A0F1F)
  heading: string;     // Section headings (#2B1810)
  body: string;        // Body text (#374151)
  link: string;        // URLs (#7A0F1F)
  background: string;  // Document page background (#FFFFFF)
  sidebar: string;     // Sidebar background (#FDF7F5)
}

export interface ResumeFonts {
  heading: string;
  body: string;
}

export interface ResumeFontSizes {
  name: number;        // 18-32 px
  headings: number;    // 11-18 px
  body: number;        // 10-14 px
}

export interface ResumeSpacing {
  margins: "compact" | "standard" | "relaxed"; // 8mm, 12mm, 16mm
  sectionSpacing: number; // 8-24 px
  lineHeight: number;     // 1.2-1.7
  bulletIndent: number;   // 12-24 px
}

export interface ResumeLayoutSettings {
  columnLayout: "single" | "two-column-left" | "two-column-right";
  headerAlignment: "left" | "center";
  showPhoto: boolean;     // default false
  photoUrl?: string;
  dateFormat: "MMM YYYY" | "MM/YYYY" | "YYYY";
  showContactIcons: boolean;
  dividerStyle: "solid" | "dashed" | "subtle" | "none";
  pageSize?: "A4" | "Letter";
}

export interface ResumePageSettings {
  pageSize: "A4" | "Letter";
  fitToOnePage: boolean;
}

export interface ResumeStyleConfig {
  templateId: ResumeTemplateId;
  colors: ResumeColors;
  fonts: ResumeFonts;
  fontSizes: ResumeFontSizes;
  spacing: ResumeSpacing;
  layout: ResumeLayoutSettings;
  page: ResumePageSettings;
}

export interface FullResumeData {
  domainKey: string;
  domainName: string;
  targetRole: string;
  contactInfo: ResumeContactInfo;
  sections: ResumeSection[];
  style: ResumeStyleConfig;
  selectedPassportItems?: string[];
  contentHash?: string;
  versionId?: string;
}

// ── Zod Schemas for Full-Resume AI Analysis Validation ────────────────────────

export const SectionIssueSchema = z.object({
  id: z.string(),
  severity: z.enum(["high", "medium", "low"]),
  message: z.string(),
  field: z.string().optional(),
});

export const SectionSuggestionSchema = z.object({
  id: z.string(),
  original: z.string(),
  improved: z.string(),
  reason: z.string(),
  keywordsUsed: z.array(z.string()).default([]),
  evidenceSource: z.string().default("Career Passport"),
  needsStudentConfirmation: z.boolean().default(false),
  provenance: z.literal("AI_SUGGESTION").default("AI_SUGGESTION"),
});

export const SectionAnalysisResultSchema = z.object({
  sectionId: z.string(),
  sectionTitle: z.string(),
  score: z.number().min(0).max(100),
  scoreExplanation: z.string(),
  strengths: z.array(z.string()).default([]),
  issues: z.array(SectionIssueSchema).default([]),
  missingInformation: z.array(z.string()).default([]),
  suggestions: z.array(SectionSuggestionSchema).default([]),
});

export const TopPriorityFixSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  impact: z.enum(["high", "medium", "low"]),
  sectionId: z.string(),
});

export const CrossSectionIssueSchema = z.object({
  type: z.string(),
  description: z.string(),
  severity: z.enum(["high", "medium", "low"]),
  affectedSections: z.array(z.string()).default([]),
});

export const AtsReadabilityFindingsSchema = z.object({
  readabilityScore: z.number().min(0).max(100),
  formatCheck: z.enum(["PASS", "WARNING", "FAIL"]).default("PASS"),
  bulletLengthEvaluation: z.string(),
  standardHeadingsDetected: z.array(z.string()).default([]),
  unconventionalHeadings: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
});

export const JdComparisonResultSchema = z.object({
  targetRole: z.string(),
  atsMatchScore: z.number().min(0).max(100),
  matchingRequirements: z.array(z.string()).default([]),
  missingRequirements: z.array(z.string()).default([]),
  unsupportedRequirements: z.array(z.string()).default([]),
  recommendedKeywords: z.array(z.string()).default([]),
});

export const FullResumeAnalysisReportSchema = z.object({
  overallScore: z.number().min(0).max(100),
  scoreExplanation: z.string(),
  topPriorityFixes: z.array(TopPriorityFixSchema).default([]),
  sectionAnalyses: z.array(SectionAnalysisResultSchema).default([]),
  crossSectionIssues: z.array(CrossSectionIssueSchema).default([]),
  atsReadabilityFindings: AtsReadabilityFindingsSchema,
  jdComparison: JdComparisonResultSchema.optional(),
  contentHash: z.string().default(""),
  analyzedAt: z.string().default(""),
  isOutOfDate: z.boolean().default(false),
});

export type SectionIssue = z.infer<typeof SectionIssueSchema>;
export type SectionSuggestion = z.infer<typeof SectionSuggestionSchema>;
export type SectionAnalysisResult = z.infer<typeof SectionAnalysisResultSchema>;
export type TopPriorityFix = z.infer<typeof TopPriorityFixSchema>;
export type CrossSectionIssue = z.infer<typeof CrossSectionIssueSchema>;
export type AtsReadabilityFindings = z.infer<typeof AtsReadabilityFindingsSchema>;
export type JdComparisonResult = z.infer<typeof JdComparisonResultSchema>;
export type FullResumeAnalysisReport = z.infer<typeof FullResumeAnalysisReportSchema>;
