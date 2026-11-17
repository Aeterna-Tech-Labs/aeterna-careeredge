// src/lib/tools/registry.ts
// Central Tool Registry for Aeterna CareerEdge (Day 2 + Addendum)
// All tools, routes, entitlement tiers, and required passport fields are defined here.
// The dashboard, navigation, onboarding, Guide, and entitlement service read from this registry.

export type PlanAccess = "FREE" | "PREMIUM";

export type ToolCategory =
  | "PORTFOLIO_EVIDENCE"
  | "CAREER_TOOLKIT"
  | "EMPLOYABILITY"
  | "STRATEGY_GROWTH"
  | "SUPPORT";

export interface ToolDefinition {
  id: string;
  name: string;
  tagline: string;
  category: ToolCategory;
  planAccess: PlanAccess;
  route: string;
  requiredPassportFields: string[];
  aiOperationKey?: string;
  iconName: string;
  isImplemented: boolean;
  helpKey: string;
}

export const TOOL_REGISTRY: Record<string, ToolDefinition> = {
  "career-passport": {
    id: "career-passport",
    name: "Career Passport",
    tagline: "Your verified, multi-domain professional foundation.",
    category: "PORTFOLIO_EVIDENCE",
    planAccess: "FREE",
    route: "/passport",
    requiredPassportFields: ["name", "academicDomain"],
    iconName: "Fingerprint",
    isImplemented: true,
    helpKey: "career-passport",
  },
  "evidence-vault": {
    id: "evidence-vault",
    name: "Evidence Vault",
    tagline: "Proof Bank for your certificates, projects, and work samples.",
    category: "PORTFOLIO_EVIDENCE",
    planAccess: "FREE",
    route: "/evidence-vault",
    requiredPassportFields: ["academicDomain"],
    iconName: "ShieldCheck",
    isImplemented: true,
    helpKey: "evidence-vault",
  },
  "truth-check": {
    id: "truth-check",
    name: "Truth Check",
    tagline: "Deterministic honesty review for resumes and LinkedIn claims.",
    category: "CAREER_TOOLKIT",
    planAccess: "FREE",
    route: "/truth-check",
    requiredPassportFields: ["academicDomain", "skills"],
    aiOperationKey: "TRUTH_CHECK",
    iconName: "CheckCheck",
    isImplemented: true,
    helpKey: "truth-check",
  },
  "role-fit-explorer": {
    id: "role-fit-explorer",
    name: "Role Fit Explorer",
    tagline: "Discover which roles suit your verified background.",
    category: "CAREER_TOOLKIT",
    planAccess: "FREE",
    route: "/role-fit-explorer",
    requiredPassportFields: ["academicDomain"],
    aiOperationKey: "ROLE_FIT",
    iconName: "Compass",
    isImplemented: true,
    helpKey: "role-fit-explorer",
  },
  "resume-builder": {
    id: "resume-builder",
    name: "Resume Builder",
    tagline: "Build profession-specific resumes tailored to your domain.",
    category: "CAREER_TOOLKIT",
    planAccess: "FREE",
    route: "/resume",
    requiredPassportFields: ["academicDomain", "educationLevel", "skills"],
    aiOperationKey: "RESUME_CREATION",
    iconName: "FileText",
    isImplemented: true,
    helpKey: "resume-builder",
  },
  "resume-check": {
    id: "resume-check",
    name: "Resume Check",
    tagline: "In-depth review and job-description alignment for your resume.",
    category: "CAREER_TOOLKIT",
    planAccess: "FREE",
    route: "/resume/check",
    requiredPassportFields: ["academicDomain", "skills"],
    aiOperationKey: "RESUME_REVIEW",
    iconName: "FileSearch",
    isImplemented: true,
    helpKey: "resume-check",
  },
  "linkedin-check": {
    id: "linkedin-check",
    name: "LinkedIn Profile Check",
    tagline: "Section-by-section optimization and algorithm fit analysis.",
    category: "CAREER_TOOLKIT",
    planAccess: "FREE",
    route: "/linkedin",
    requiredPassportFields: ["academicDomain"],
    aiOperationKey: "LINKEDIN_ANALYSIS",
    iconName: "Network",
    isImplemented: true,
    helpKey: "linkedin-check",
  },
  "job-discovery": {
    id: "job-discovery",
    name: "Job Discovery",
    tagline: "Real jobs with verified requirement matching from approved sources.",
    category: "EMPLOYABILITY",
    planAccess: "FREE",
    route: "/jobs",
    requiredPassportFields: ["academicDomain", "skills"],
    aiOperationKey: "JOB_MATCH",
    iconName: "BriefcaseBusiness",
    isImplemented: true,
    helpKey: "job-discovery",
  },
  "application-tracker": {
    id: "application-tracker",
    name: "Application Tracker",
    tagline: "Track opportunities you saved, visited, applied to, and interviewed for.",
    category: "EMPLOYABILITY",
    planAccess: "FREE",
    route: "/applications",
    requiredPassportFields: ["academicDomain"],
    iconName: "ClipboardList",
    isImplemented: true,
    helpKey: "application-tracker",
  },
  "application-pack": {
    id: "application-pack",
    name: "Application Pack",
    tagline: "1-click tailored resume, requirement match table, and cover note.",
    category: "EMPLOYABILITY",
    planAccess: "PREMIUM",
    route: "/applications",
    requiredPassportFields: ["academicDomain", "skills"],
    aiOperationKey: "APPLICATION_PACK",
    iconName: "FolderArchive",
    isImplemented: true,
    helpKey: "application-pack",
  },
  "interview-prep-kit": {
    id: "interview-prep-kit",
    name: "Interview Prep Kit",
    tagline: "Job-specific question themes linked to your own evidence.",
    category: "EMPLOYABILITY",
    planAccess: "PREMIUM",
    route: "/interview-prep",
    requiredPassportFields: ["academicDomain", "skills"],
    aiOperationKey: "INTERVIEW_PREP",
    iconName: "Video",
    isImplemented: true,
    helpKey: "interview-prep-kit",
  },
  "career-readiness-report": {
    id: "career-readiness-report",
    name: "Career Readiness Report",
    tagline: "Honest, comprehensive picture of where you stand for your chosen role.",
    category: "STRATEGY_GROWTH",
    planAccess: "FREE",
    route: "/role-fit-explorer",
    requiredPassportFields: ["academicDomain", "educationLevel", "skills", "preferredJobRole"],
    aiOperationKey: "READINESS_REPORT",
    iconName: "TrendingUp",
    isImplemented: true,
    helpKey: "career-readiness-report",
  },
  "gap-to-action-sprint": {
    id: "gap-to-action-sprint",
    name: "Gap-to-Action Sprint",
    tagline: "A 30-day plan turning your skill & profile gaps into small daily wins.",
    category: "STRATEGY_GROWTH",
    planAccess: "PREMIUM",
    route: "/sprints",
    requiredPassportFields: ["academicDomain", "skills", "preferredJobRole"],
    iconName: "Target",
    isImplemented: true,
    helpKey: "gap-to-action-sprint",
  },
  "career-progress-ledger": {
    id: "career-progress-ledger",
    name: "Career Progress Ledger",
    tagline: "Database-backed timeline of all achievements and progress since joining.",
    category: "STRATEGY_GROWTH",
    planAccess: "FREE",
    route: "/progress",
    requiredPassportFields: ["academicDomain"],
    iconName: "History",
    isImplemented: true,
    helpKey: "career-progress-ledger",
  },
  "value-dashboard": {
    id: "value-dashboard",
    name: "Value & ROI Dashboard",
    tagline: "Honest proof of time saved, claims verified, and measurable career progress.",
    category: "STRATEGY_GROWTH",
    planAccess: "FREE",
    route: "/value",
    requiredPassportFields: ["academicDomain"],
    iconName: "Award",
    isImplemented: true,
    helpKey: "value-dashboard",
  },
  "pricing-plans": {
    id: "pricing-plans",
    name: "Plans & Upgrades",
    tagline: "Transparent value-based pricing and entitlement controls.",
    category: "SUPPORT",
    planAccess: "FREE",
    route: "/pricing",
    requiredPassportFields: [],
    iconName: "Sparkles",
    isImplemented: true,
    helpKey: "pricing-plans",
  },
  "career-guide": {
    id: "career-guide",
    name: "AI Career Guide",
    tagline: "Context-aware guide answering questions simply and guiding your next step.",
    category: "SUPPORT",
    planAccess: "FREE",
    route: "/mentor",
    requiredPassportFields: [],
    aiOperationKey: "CAREER_GUIDE",
    iconName: "Bot",
    isImplemented: true, // Phase 1.5 foundation
    helpKey: "career-guide",
  },
};

/** Get a tool by ID safely */
export function getTool(id: string): ToolDefinition | undefined {
  return TOOL_REGISTRY[id];
}

/** Get all tools in a specific category */
export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
  return Object.values(TOOL_REGISTRY).filter((t) => t.category === category);
}

/** Check if a route is a valid whitelisted tool path */
export function isWhitelistedToolRoute(path: string): boolean {
  const clean = path.split("?")[0].replace(/\/$/, "");
  return Object.values(TOOL_REGISTRY).some((t) => t.route === clean);
}
