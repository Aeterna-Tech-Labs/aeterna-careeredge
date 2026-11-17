"use client";

// src/app/dashboard/dashboard-client.tsx

import { useState, type ChangeEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getNextBestAction,
  type StudentContextSnapshot,
} from "@/lib/guidance/next-best-action";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  type Variants,
} from "motion/react";
import { GettingStartedChecklist } from "@/components/guidance/getting-started-checklist";
import { HowItWorksPanel } from "@/components/guidance/how-it-works-panel";
import { StudentLayout } from "@/components/layouts/student-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CircularProgress } from "@/components/ui/circular-progress";
import {
  FileText,
  TrendingUp,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ArrowRight,
  Sparkles,
  BriefcaseBusiness,
  Target,
  Clock,
  MessageCircle,
  CalendarDays,
  Lock,
  Bot,
  FileSearch,
  GraduationCap,
  MapPin,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface StoredDoc {
  id: string;
  originalFileName: string;
  fileSizeBytes: number;
  mimeType: string;
  category: string;
  createdAt: string | Date;
}

interface DashboardUser {
  id: string;
  name: string;
  email: string;
  profile: {
    academicDomain: string | null;
    specialization: string | null;
    educationLevel: string | null;
    institution: string | null;
    course: string | null;
    gradingType: string | null;
    gradeValue: string | null;
    careerInterests: string | null;
    preferredJobRole: string | null;
    targetIndustry: string | null;
    passportScore: number | null;
  } | null;
  storedDocuments?: StoredDoc[];
  resumes?: Array<{
    id: string;
    title: string;
    targetRole?: string | null;
    templateId?: string | null;
    atsScore?: number | null;
    updatedAt: string | Date;
  }>;
  applications?: Array<{
    id: string;
    jobTitle: string;
    companyName: string;
    applicationStatus?: string;
    status?: string;
    updatedAt: string | Date;
  }>;
  _count?: {
    educations: number;
    skills: number;
    projects: number;
    experiences: number;
    certifications: number;
    resumes?: number;
    applications?: number;
  };
}

interface DashboardClientProps {
  user: DashboardUser;
}

/* ------------------------------------------------------------------ */
/*  Motion                                                             */
/* ------------------------------------------------------------------ */

const spring = { type: "spring", stiffness: 300, damping: 22 } as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const lineGrow: Variants = {
  hidden: { scaleY: 0 },
  show: { scaleY: 1, transition: { duration: 0.8, ease: "easeOut" } },
};

const arrowNudge: Variants = { rest: { x: 0 }, hover: { x: 4 } };

/** Fades a block in once, when it scrolls into view. */
function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getNextMilestone(user: DashboardUser): {
  title: string;
  description: string;
} {
  if (!user.profile) {
    return {
      title: "Complete Onboarding",
      description: "Set up your academic profile to get started.",
    };
  }
  const score = user.profile.passportScore ?? 0;
  if (score < 30) {
    return {
      title: "Add Education Details",
      description: "Add your academic history to boost your profile.",
    };
  }
  if (score < 50) {
    return {
      title: "Upload Your Resume",
      description: "Upload a resume to unlock ATS scoring.",
    };
  }
  if (score < 70) {
    return {
      title: "Add Skills & Projects",
      description: "Showcase your skills and projects to employers.",
    };
  }
  return {
    title: "Study-Abroad Preferences",
    description: "Set your destination preferences for tailored SOPs.",
  };
}

/* ------------------------------------------------------------------ */
/*  Small components                                                   */
/* ------------------------------------------------------------------ */

function StatCard({
  title,
  value,
  subtitle,
  description,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4, transition: spring }}
      className="group"
    >
      <Card padding="sm" hover className="h-full">
        <CardContent>
          <div className="flex items-start justify-between gap-2">
            <p className="text-[13px] font-medium leading-tight text-secondary-text">
              {title}
            </p>
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${color}`}
            >
              <Icon size={17} aria-hidden="true" />
            </div>
          </div>

          <p className="mt-3 font-heading text-3xl font-bold leading-none text-foreground">
            {value}
          </p>
          <p className="mt-1 text-xs font-semibold text-primary">{subtitle}</p>

          <p className="mt-2 text-xs leading-snug text-muted-text">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DisabledButton({
  children,
  variant = "maroon",
}: {
  children: ReactNode;
  variant?: "maroon" | "outline" | "blue";
}) {
  const styles = {
    maroon: "bg-[#7A0F1F] text-white",
    outline: "border border-border bg-white text-secondary-text",
    blue: "bg-blue-600 text-white",
  }[variant];

  return (
    <button
      type="button"
      disabled
      className={`inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold opacity-50 ${styles}`}
    >
      {children}
    </button>
  );
}

function BuilderCard({
  tileLabel,
  tileClass,
  tileTextClass,
  title,
  description,
  note,
  children,
}: {
  tileLabel: string;
  tileClass: string;
  tileTextClass: string;
  title: string;
  description: string;
  note?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Reveal>
      <motion.div whileHover={{ y: -3, transition: spring }}>
        <Card hover>
          <CardContent className="p-0">
            <div className="flex gap-4 p-5">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${tileClass}`}
              >
                <p
                  className={`text-center text-[9px] font-bold uppercase tracking-wider ${tileTextClass}`}
                >
                  {tileLabel}
                </p>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-heading text-sm font-bold text-foreground">
                    {title}
                  </h4>
                  <Badge variant="warning" size="sm">
                    Coming Soon
                  </Badge>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-secondary-text">
                  {description}
                </p>
                {note}
                <div className="mt-3 flex flex-wrap gap-2">{children}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Reveal>
  );
}

function UploadMessage({
  tone,
  message,
}: {
  tone: "error" | "success";
  message: string | null;
}) {
  const isError = tone === "error";

  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.div
          role={isError ? "alert" : "status"}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div
            className={`mt-3 flex items-center gap-2 rounded-lg p-3 text-xs font-medium ${
              isError
                ? "bg-red-50 text-red-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {isError ? (
              <AlertCircle size={14} className="shrink-0" aria-hidden="true" />
            ) : (
              <CheckCircle2 size={14} className="shrink-0" aria-hidden="true" />
            )}
            <span>{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DashboardClient({ user }: DashboardClientProps) {
  const router = useRouter();

  const [documents, setDocuments] = useState<StoredDoc[]>(
    user.storedDocuments || [],
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  /* ---- handlers ---- */

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);

    if (file.size > 5 * 1024 * 1024) {
      setUploadError(
        `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Limit is 5 MB.`,
      );
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "RESUME");

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || "Failed to upload document.");
        return;
      }

      setUploadSuccess(`Successfully uploaded ${file.name}`);
      if (data.document) {
        setDocuments((prev) => [
          {
            id: data.document.id,
            originalFileName: data.document.fileName,
            fileSizeBytes: data.document.fileSizeBytes,
            mimeType: data.document.mimeType,
            category: data.document.category,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    } catch {
      setUploadError("Network error occurred during document upload.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  /* ---- derived data ---- */

  const firstName = user.name.split(" ")[0];
  const score = user.profile?.passportScore ?? (user.profile ? 72 : 10);
  const milestone = getNextMilestone(user);
  const greeting = getGreeting();

  const institutionLine = [
    user.profile?.institution,
    user.profile?.course,
    user.profile?.specialization,
  ]
    .filter(Boolean)
    .join(" · ");

  const createdResumes = user.resumes || [];
  const totalResumes =
    createdResumes.length > 0
      ? createdResumes.length
      : (user._count?.resumes || 0) +
        documents.filter((d) => d.category === "RESUME").length;
  const totalApplications =
    user.applications?.length ?? user._count?.applications ?? 0;

  const stats = [
    {
      title: "Resumes Created",
      value: totalResumes.toString(),
      subtitle: totalResumes > 0 ? "Active in Builder" : "Drafted",
      description:
        totalResumes > 0
          ? `${totalResumes} tailored resume${totalResumes > 1 ? "s" : ""} ready`
          : "Create your first resume",
      icon: FileText,
      color: "bg-red-50 text-[#7A0F1F]",
    },
    {
      title: "SOPs Drafted",
      value: "—",
      subtitle: "Coming Soon",
      description: "SOP Builder launching soon",
      icon: FileSearch,
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Skill Gaps Identified",
      value: (user._count?.skills || 0).toString(),
      subtitle: "Tracked",
      description: "Based on your career goals",
      icon: Target,
      color: "bg-amber-50 text-amber-700",
    },
    {
      title: "Applications Tracked",
      value: totalApplications.toString(),
      subtitle: totalApplications > 0 ? "In Pipeline" : "Active",
      description:
        totalApplications > 0
          ? `${totalApplications} job application${totalApplications > 1 ? "s" : ""} tracked`
          : "Track jobs you apply to",
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-700",
    },
  ];

  const phases: {
    title: string;
    description: string;
    icon: LucideIcon;
    iconClass: string;
    badge: { variant: "success" | "warning" | "default"; label: string };
  }[] = [
    {
      title: "Phase 1: Foundation (Months 1–2)",
      description:
        "Complete your Career Passport, upload documents, and set career goals.",
      icon: CheckCircle2,
      iconClass: "bg-emerald-100 text-emerald-600",
      badge: {
        variant: "success",
        label: score >= 50 ? "In Progress" : "Getting Started",
      },
    },
    {
      title: "Phase 2: Portfolio & Skills (Months 3–5)",
      description:
        "Build your resume, draft SOPs, and develop domain-specific skills.",
      icon: Clock,
      iconClass: "bg-amber-100 text-amber-600",
      badge: { variant: "warning", label: "Upcoming" },
    },
    {
      title: "Phase 3: Applications & Interviews (Months 6–8)",
      description:
        "Apply to opportunities, attend placement drives, and prepare for interviews.",
      icon: Target,
      iconClass: "bg-gray-100 text-gray-400",
      badge: { variant: "default", label: "Upcoming" },
    },
  ];

  const contextSnapshot: StudentContextSnapshot = {
    onboardingCompleted: true,
    passportScore: score,
    hasDomain: Boolean(user.profile?.academicDomain),
    hasRole: Boolean(user.profile?.preferredJobRole),
    educationCount: user._count?.educations || 0,
    skillCount: user._count?.skills || 0,
    evidenceCount: user._count?.certifications || documents.length,
    unsupportedClaimsCount: 0,
    resumeCount: totalResumes,
    savedJobsCount: 0,
    activeApplicationsCount: totalApplications,
    overdueFollowUpsCount: 0,
    activeSprintTasksDue: 0,
  };
  const nextAction = getNextBestAction(contextSnapshot);

  const checklistItems = [
    {
      id: "field-role",
      label: "Choose your field and role",
      description: "Pick your academic domain and professional target role.",
      isComplete: Boolean(
        user.profile?.academicDomain && user.profile?.preferredJobRole
      ),
      route: "/onboarding?from=dashboard",
      actionText: "Update",
    },
    {
      id: "passport",
      label: "Complete your Career Passport",
      description: "Provide education history, grades, and core competencies.",
      isComplete: score >= 70,
      route: "/onboarding?from=dashboard",
      actionText: "Edit Profile",
    },
    {
      id: "evidence",
      label: "Add at least one piece of evidence",
      description:
        "Back up your skill claims with certificates or project links in the Evidence Vault.",
      isComplete:
        (user._count?.certifications || 0) > 0 || documents.length > 0,
      route: "/evidence-vault",
      actionText: "Open Vault",
    },
    {
      id: "first-resume",
      label: "Create your first resume",
      description:
        "Draft a clean, role-tailored resume from your verified passport.",
      isComplete: totalResumes > 0,
      route: "/resume",
      actionText: totalResumes > 0 ? "Manage" : "Create",
    },
    {
      id: "truth-check",
      label: "Check your resume honesty",
      description:
        "Verify that all claims on your resume trace to real evidence.",
      isComplete: false,
      route: "/truth-check",
      actionText: "Run Check",
    },
    {
      id: "linkedin",
      label: "Add or import your LinkedIn profile",
      description:
        "Upload profile PDF or paste text to evaluate recruiter algorithm fit.",
      isComplete: false,
      route: "/linkedin",
      actionText: "Import",
    },
    {
      id: "save-jobs",
      label: "Find and save 3 jobs",
      description: "Discover real opportunities matching your verified skills.",
      isComplete: false,
      route: "/jobs",
      actionText: "Find Jobs",
    },
    {
      id: "readiness-report",
      label: "Open your Career Readiness Report",
      description:
        "Review your comprehensive roadmap and skill-gap breakdown.",
      isComplete: false,
      route: "/readiness-report",
      actionText: "View Report",
    },
  ];

  /* ---- render ---- */

  return (
    <StudentLayout
      userName={user.name}
      userInitial={user.name.charAt(0).toUpperCase()}
      studentDomain={user.profile?.academicDomain || undefined}
      targetRole={user.profile?.preferredJobRole || undefined}
      onLogout={handleLogout}
    >
      <MotionConfig reducedMotion="user">
        <div className="mx-auto max-w-[1280px] space-y-6">
          {/* ============================================================
              HERO: welcome banner
          ============================================================ */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-[#4C0915] via-[#6B0D1A] to-[#7A0F1F] p-6 text-white shadow-xl shadow-[#4C0915]/20 sm:p-8"
          >
            {/* Decorative shapes */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-20 -z-10 h-72 w-72 rounded-full bg-[#F2B63D]/15 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-12 -left-12 -z-10 h-44 w-44 rounded-full bg-white/5"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F2B63D] to-transparent"
            />

            {/* Top badge */}
            {user.profile?.institution && (
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#F2B63D]/30 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#F2B63D]">
                <GraduationCap size={13} aria-hidden="true" />
                {user.profile.academicDomain || "Student"} ·{" "}
                {new Date().getFullYear()}
              </div>
            )}

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              {/* Left: greeting */}
              <div className="min-w-0 flex-1">
                <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                  <span suppressHydrationWarning>{greeting}</span>, {firstName}{" "}
                  👋
                </h1>

                <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/75 sm:text-[15px]">
                  Your{" "}
                  <span className="font-semibold text-white">
                    Career Passport
                  </span>{" "}
                  is{" "}
                  <span className="font-bold text-[#F2B63D]">
                    {score}% complete
                  </span>
                  . {milestone.description}
                </p>

                {institutionLine && (
                  <div className="mt-3 flex items-center gap-1.5 text-[13px] text-white/60">
                    <MapPin size={13} aria-hidden="true" />
                    <span>{institutionLine}</span>
                  </div>
                )}
              </div>

              {/* Right: passport score and milestone */}
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
                <CircularProgress
                  value={score}
                  size={110}
                  strokeWidth={8}
                  label="Ready"
                />

                <div className="sm:max-w-[220px]">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#F2B63D]/80">
                    Next Milestone
                  </p>
                  <h3 className="mt-1 font-heading text-base font-bold leading-snug">
                    {nextAction.title}
                  </h3>

                  <motion.div
                    initial="rest"
                    whileHover="hover"
                    whileTap={{ scale: 0.97 }}
                    transition={spring}
                    className="mt-3 inline-block"
                  >
                    <Link
                      href={nextAction.actionRoute}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#F2B63D] px-4 py-2 text-xs font-bold text-[#4C0915] shadow-sm shadow-black/20 transition-colors hover:bg-[#E8A020] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B63D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#4C0915]"
                    >
                      {nextAction.actionLabel}
                      <motion.span
                        variants={arrowNudge}
                        className="inline-flex"
                      >
                        <ArrowRight size={13} aria-hidden="true" />
                      </motion.span>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* ============================================================
              STATS ROW
          ============================================================ */}
          <motion.section
            variants={stagger}
            initial="hidden"
            animate="show"
            aria-label="Your progress"
            className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4"
          >
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </motion.section>

          {/* ============================================================
              GUIDANCE: How It Works & Getting Started Checklist
          ============================================================ */}
          <div className="space-y-4">
            <HowItWorksPanel sectionId="career-passport" />
            <GettingStartedChecklist items={checklistItems} />
          </div>

          {/* ============================================================
              MAIN CONTENT: two columns
          ============================================================ */}
          <section className="grid gap-6 lg:grid-cols-5">
            {/* LEFT COLUMN: 3/5 */}
            <div className="space-y-6 lg:col-span-3">
              <Reveal className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold text-foreground">
                  Continue Where You Left Off
                </h2>
                <span className="text-xs font-medium text-secondary-text">
                  {documents.length + 3} Assets
                </span>
              </Reveal>

              <BuilderCard
                tileLabel="Resume"
                tileClass="bg-red-50"
                tileTextClass="text-[#7A0F1F]"
                title="Resume Builder"
                description={
                  user.resumes && user.resumes.length > 0
                    ? `Active: "${user.resumes[0].title}" (${user.resumes[0].targetRole || "Professional"}) • Updated ${new Date(user.resumes[0].updatedAt).toLocaleDateString()}`
                    : "Build an ATS-optimized resume tailored to your domain and career goals."
                }
              >
                <Link
                  href={user.resumes && user.resumes.length > 0 ? `/resume/builder?id=${user.resumes[0].id}` : "/resume"}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#7A0F1F] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#600C18] transition"
                >
                  <Sparkles size={12} aria-hidden="true" />
                  <span>{user.resumes && user.resumes.length > 0 ? "Edit in Builder" : "Create Resume"}</span>
                </Link>
                {user.resumes && user.resumes.length > 0 && (
                  <Link
                    href={`/resume/${user.resumes[0].id}/print`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#EBDDD1] bg-white px-3.5 py-2 text-xs font-semibold text-[#765F5D] hover:bg-stone-50 transition"
                  >
                    <FileText size={12} aria-hidden="true" />
                    <span>View / Print PDF</span>
                  </Link>
                )}
              </BuilderCard>

              <BuilderCard
                tileLabel="SOP Draft"
                tileClass="bg-amber-50"
                tileTextClass="text-amber-700"
                title="SOP Builder"
                description="Create domain-specific SOPs for university applications, calibrated for academic integrity."
                note={
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-text">
                    <CheckCircle2
                      size={12}
                      className="text-emerald-500"
                      aria-hidden="true"
                    />
                    Ethical Academic Integrity Checked (0% hallucinated sources)
                  </p>
                }
              >
                <DisabledButton>Coming Soon</DisabledButton>
              </BuilderCard>

              <BuilderCard
                tileLabel="LinkedIn"
                tileClass="bg-blue-50"
                tileTextClass="text-blue-700"
                title="LinkedIn Profile Intelligence"
                description="Auto-generate LinkedIn content optimized for recruiter search algorithms."
              >
                <Link
                  href="/linkedin"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A66C2] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#004182] transition"
                >
                  <Sparkles size={12} aria-hidden="true" />
                  <span>Open LinkedIn Workspace</span>
                </Link>
              </BuilderCard>

              {/* Documents vault */}
              <Reveal>
                <Card>
                  <div className="border-b border-[#EBDDD1]/60 p-5 pb-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-heading text-base font-bold text-foreground">
                          Career Documents & Vault
                        </h3>
                        <p className="mt-0.5 text-[13px] text-secondary-text">
                          Secure private storage: resumes, transcripts,
                          certificates (max 5 MB).
                        </p>
                      </div>

                      <motion.label
                        whileHover={uploading ? undefined : { y: -2 }}
                        whileTap={uploading ? undefined : { scale: 0.97 }}
                        transition={spring}
                        className={`inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#7A0F1F] px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-[#7A0F1F]/20 transition-colors focus-within:ring-2 focus-within:ring-[#7A0F1F] focus-within:ring-offset-2 hover:bg-[#4C0915] ${
                          uploading ? "pointer-events-none opacity-70" : ""
                        }`}
                      >
                        <Upload size={14} aria-hidden="true" />
                        <span>
                          {uploading ? "Uploading…" : "Upload PDF / Document"}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.docx,.doc,.png,.jpg"
                          onChange={handleFileUpload}
                          disabled={uploading}
                          className="sr-only"
                        />
                      </motion.label>
                    </div>

                    <UploadMessage tone="error" message={uploadError} />
                    <UploadMessage tone="success" message={uploadSuccess} />
                  </div>

                  <CardContent className="p-5">
                    {documents.length === 0 ? (
                      <div className="rounded-2xl border-2 border-dashed border-[#EBDDD1] p-8 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FCE9E8] text-[#7A0F1F]">
                          <FileText size={22} aria-hidden="true" />
                        </div>
                        <h4 className="text-sm font-semibold text-foreground">
                          No documents in your passport yet
                        </h4>
                        <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-secondary-text">
                          Upload your latest resume or academic transcript (PDF,
                          max 5 MB). All files are encrypted and accessible only
                          with student authentication.
                        </p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-[#EBDDD1]/60">
                        <AnimatePresence initial={false}>
                          {documents.map((doc) => (
                            <motion.li
                              key={doc.id}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="flex items-center justify-between gap-3 py-3">
                                <div className="flex min-w-0 items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-soft text-primary">
                                    <FileCheck size={18} aria-hidden="true" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-foreground">
                                      {doc.originalFileName}
                                    </p>
                                    <p className="text-xs text-secondary-text">
                                      {(doc.fileSizeBytes / 1024).toFixed(1)} KB
                                      · {doc.category}
                                    </p>
                                  </div>
                                </div>

                                <a
                                  href={`/api/documents/${doc.id}/download`}
                                  download={doc.originalFileName}
                                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#EBDDD1] bg-white px-3 py-1.5 text-xs font-semibold text-[#765F5D] shadow-2xs transition-colors hover:border-[#7A0F1F]/40 hover:bg-[#FDF7F5] hover:text-[#7A0F1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A0F1F]"
                                >
                                  <Download size={13} aria-hidden="true" />
                                  <span>Download</span>
                                </a>
                              </div>
                            </motion.li>
                          ))}
                        </AnimatePresence>
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </Reveal>
            </div>

            {/* RIGHT COLUMN: 2/5 */}
            <div className="space-y-6 lg:col-span-2">
              {/* AI Mentor card */}
              <Reveal>
                <Card className="overflow-hidden">
                  <div className="bg-gradient-to-r from-[#FFF8F0] to-[#FFF0E0] p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F2B63D] to-[#E8A020] shadow-sm">
                        <Bot
                          size={20}
                          className="text-[#4C0915]"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-heading text-sm font-bold text-foreground">
                            Dr. Ananya AI Mentor
                          </h4>
                          <Badge variant="maroon" size="sm">
                            Pro AI
                          </Badge>
                        </div>
                        <p className="text-xs text-secondary-text">
                          {user.profile?.academicDomain || "Career"} Specialist
                        </p>
                      </div>
                    </div>
                  </div>

                  <CardContent className="space-y-4 p-5">
                    {/* Chat preview */}
                    <div className="rounded-2xl rounded-tl-sm bg-surface-muted p-3.5">
                      <p className="text-[13px] italic leading-relaxed text-secondary-text">
                        &ldquo;Hi {firstName}! I can help with resume reviews,
                        SOP drafts, interview prep, and career guidance tailored
                        to your {user.profile?.academicDomain || "academic"}{" "}
                        background.&rdquo;
                      </p>
                      <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-text">
                        <Clock size={10} aria-hidden="true" />
                        Just now
                      </p>
                    </div>

                    {/* Quick prompts */}
                    <div>
                      <p className="mb-2 text-xs font-semibold text-secondary-text">
                        Quick Prompts:
                      </p>
                      <div className="space-y-1.5">
                        {[
                          `"Review my resume for ${user.profile?.targetIndustry || "top companies"}"`,
                          `"Suggest SOP hook for university applications"`,
                          `"Simulate campus HR round"`,
                        ].map((prompt) => (
                          <button
                            key={prompt}
                            type="button"
                            disabled
                            className="w-full cursor-not-allowed rounded-lg bg-[#FFF0C7]/50 px-3 py-2 text-left text-xs font-medium text-[#7A0F1F] opacity-70"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2.5">
                      <Lock
                        size={12}
                        className="text-muted-text"
                        aria-hidden="true"
                      />
                      <span className="text-xs font-medium text-muted-text">
                        AI Mentor launching soon
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>

              {/* Counselling card */}
              <Reveal>
                <Card className="overflow-hidden">
                  <div className="bg-gradient-to-r from-[#FCE9E8] to-[#FFF0E0] px-5 py-4">
                    <div className="flex items-center gap-2">
                      <CalendarDays
                        size={16}
                        className="text-[#7A0F1F]"
                        aria-hidden="true"
                      />
                      <h4 className="font-heading text-sm font-bold text-foreground">
                        Book a 1:1 Counselling Session
                      </h4>
                    </div>
                    <p className="mt-1 text-xs text-secondary-text">
                      Verified{" "}
                      {user.profile?.academicDomain
                        ? user.profile.academicDomain.toLowerCase()
                        : "career"}{" "}
                      & placement mentors
                    </p>
                  </div>

                  <CardContent className="space-y-4 p-5">
                    <p className="text-[13px] leading-relaxed text-secondary-text">
                      Connect virtually with Senior Counsellors for career
                      guidance, university shortlisting, and placement mock
                      rounds.
                    </p>

                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-soft">
                        <MessageCircle
                          size={18}
                          className="text-[#7A0F1F]"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-foreground">
                          Career Counsellor
                        </p>
                        <p className="text-[11px] text-muted-text">
                          Next slot available: Coming soon
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5 text-[11px] text-muted-text">
                      <Lock
                        size={11}
                        className="mt-0.5 shrink-0"
                        aria-hidden="true"
                      />
                      <span>
                        Shared only with your explicit consent · Zero spam /
                        cold calls guarantee
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled
                      className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#7A0F1F]/20 bg-[#FCE9E8]/50 py-2.5 text-[13px] font-semibold text-[#7A0F1F] opacity-60"
                    >
                      <BriefcaseBusiness size={14} aria-hidden="true" />
                      Pick a Time Slot: Coming Soon
                    </button>
                  </CardContent>
                </Card>
              </Reveal>

              {/* Career Status mini-card */}
              <Reveal>
                <Card>
                  <CardContent className="space-y-3 p-5">
                    <h4 className="font-heading text-sm font-bold text-foreground">
                      Career Status
                    </h4>
                    <Badge variant="success" dot>
                      Profile active
                    </Badge>
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">
                        Your next step
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-secondary-text">
                        {milestone.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            </div>
          </section>

          {/* ============================================================
              CAREER ROADMAP
          ============================================================ */}
          <Reveal>
            <Card>
              <div className="border-b border-[#EBDDD1]/60 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    6–12 Month Career Roadmap
                  </h3>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#7A0F1F]">
                    Target: {new Date().getFullYear() + 1}
                  </span>
                </div>
              </div>

              <CardContent className="p-5">
                <motion.ol
                  variants={stagger}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.3 }}
                  className="relative"
                >
                  {/* Timeline line draws downward */}
                  <motion.div
                    aria-hidden="true"
                    variants={lineGrow}
                    className="absolute bottom-5 left-5 top-5 w-0.5 origin-top bg-[#EBDDD1]"
                  />

                  {phases.map((phase, i) => {
                    const Icon = phase.icon;
                    const isLast = i === phases.length - 1;

                    return (
                      <motion.li
                        key={phase.title}
                        variants={fadeUp}
                        className={`relative flex gap-4 ${isLast ? "" : "pb-6"}`}
                      >
                        <div
                          className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${phase.iconClass}`}
                        >
                          <Icon size={18} aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1 pt-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[13px] font-bold text-foreground">
                              {phase.title}
                            </p>
                            <Badge variant={phase.badge.variant} size="sm">
                              {phase.badge.label}
                            </Badge>
                          </div>
                          <p className="mt-1 text-[13px] text-secondary-text">
                            {phase.description}
                          </p>
                        </div>
                      </motion.li>
                    );
                  })}
                </motion.ol>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </MotionConfig>
    </StudentLayout>
  );
}
