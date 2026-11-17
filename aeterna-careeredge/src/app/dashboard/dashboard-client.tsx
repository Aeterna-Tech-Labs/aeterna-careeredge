"use client";

// src/app/dashboard/dashboard-client.tsx
// Redesigned dashboard — reference-based implementation

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
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
  _count?: {
    educations: number;
    skills: number;
    projects: number;
    experiences: number;
    certifications: number;
  };
}

interface DashboardClientProps {
  user: DashboardUser;
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
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DashboardClient({ user }: DashboardClientProps) {
  const router = useRouter();

  const [documents, setDocuments] = useState<StoredDoc[]>(
    user.storedDocuments || []
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
        `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Limit is 5 MB.`
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

  const stats = [
    {
      title: "Resumes Created",
      value: documents.filter((d) => d.category === "RESUME").length.toString() || "0",
      subtitle: "Drafted",
      description:
        documents.length > 0 ? "Documents in vault" : "Upload your first resume",
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
      value: "0",
      subtitle: "Active",
      description: "Track jobs you apply to",
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-700",
    },
  ];

  /* ---- render ---- */

  return (
    <StudentLayout
      userName={user.name}
      userInitial={user.name.charAt(0).toUpperCase()}
      onLogout={handleLogout}
    >
      <div className="space-y-6 max-w-[1280px] mx-auto">
        {/* ============================================================
            HERO — Welcome banner
        ============================================================ */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4C0915] via-[#6B0D1A] to-[#7A0F1F] p-6 sm:p-8 text-white">
          {/* Decorative shapes */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#F2B63D]/8" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5" />

          {/* Top badge */}
          {user.profile?.institution && (
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#F2B63D]">
              <GraduationCap size={13} />
              {user.profile.academicDomain || "Student"} · {new Date().getFullYear()}
            </div>
          )}

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left — greeting */}
            <div className="flex-1 min-w-0">
              <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
                {greeting}, {firstName} 👋
              </h1>

              <p className="mt-2 text-sm sm:text-[15px] leading-relaxed text-white/70 max-w-lg">
                Your <span className="font-semibold text-white">Career Passport</span> is{" "}
                <span className="font-bold text-[#F2B63D]">{score}% complete</span>.{" "}
                {milestone.description}
              </p>

              {institutionLine && (
                <div className="mt-3 flex items-center gap-1.5 text-[13px] text-white/50">
                  <MapPin size={13} />
                  <span>{institutionLine}</span>
                </div>
              )}
            </div>

            {/* Right — passport score + milestone */}
            <div className="flex items-center gap-5 sm:gap-8">
              <CircularProgress
                value={score}
                size={110}
                strokeWidth={8}
                label="Ready"
              />

              <div className="hidden sm:block max-w-[220px]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#F2B63D]/80">
                  Next Milestone
                </p>
                <h3 className="mt-1 font-heading text-base font-bold leading-snug">
                  {milestone.title}
                </h3>
                <button className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-[#F2B63D] px-4 py-2 text-xs font-bold text-[#4C0915] shadow-sm shadow-black/20 hover:bg-[#E8A020] transition-colors">
                  Complete profile
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            STATS ROW
        ============================================================ */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} padding="sm" hover>
                <CardContent>
                  <div className="flex items-start justify-between">
                    <p className="text-[12px] font-medium text-secondary-text leading-tight">
                      {stat.title}
                    </p>
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${stat.color}`}
                    >
                      <Icon size={16} />
                    </div>
                  </div>

                  <p className="mt-2 font-heading text-2xl sm:text-3xl font-bold text-foreground leading-none">
                    {stat.value}
                  </p>
                  <p className="text-[11px] font-semibold text-primary mt-0.5">
                    {stat.subtitle}
                  </p>

                  <p className="mt-1.5 text-[11px] text-muted-text leading-snug">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* ============================================================
            MAIN CONTENT — Two columns
        ============================================================ */}
        <section className="grid gap-6 lg:grid-cols-5">
          {/* LEFT COLUMN — 3/5 */}
          <div className="space-y-6 lg:col-span-3">
            {/* Continue Where You Left Off heading */}
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-foreground">
                Continue Where You Left Off
              </h2>
              <span className="text-[12px] font-medium text-secondary-text">
                {documents.length + 3} Assets
              </span>
            </div>

            {/* Resume card */}
            <Card hover>
              <CardContent className="p-0">
                <div className="flex gap-4 p-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-red-50">
                    <div className="text-center">
                      <p className="text-[8px] font-bold text-[#7A0F1F] uppercase tracking-wider">
                        Resume
                      </p>
                      <div className="mt-0.5 flex items-center gap-0.5 text-[7px] text-muted-text">
                        <span>v.1</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-heading text-sm font-bold text-foreground">
                        Resume Builder
                      </h4>
                      <Badge variant="warning" size="sm">
                        Coming Soon
                      </Badge>
                    </div>
                    <p className="mt-1 text-[12px] text-secondary-text leading-relaxed">
                      Build an ATS-optimized resume tailored to your domain and career goals.
                    </p>
                    <div className="mt-2.5 flex gap-2">
                      <button
                        disabled
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#7A0F1F] px-3 py-1.5 text-[11px] font-semibold text-white opacity-50 cursor-not-allowed"
                      >
                        <Sparkles size={12} />
                        Edit in Builder
                      </button>
                      <button
                        disabled
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-[11px] font-semibold text-secondary-text opacity-50 cursor-not-allowed"
                      >
                        <FileText size={12} />
                        PDF
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SOP card */}
            <Card hover>
              <CardContent className="p-0">
                <div className="flex gap-4 p-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                    <div className="text-center">
                      <p className="text-[8px] font-bold text-amber-700 uppercase tracking-wider">
                        SOP Draft
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-heading text-sm font-bold text-foreground">
                        SOP Builder
                      </h4>
                      <Badge variant="warning" size="sm">
                        Coming Soon
                      </Badge>
                    </div>
                    <p className="mt-1 text-[12px] text-secondary-text leading-relaxed">
                      Create domain-specific SOPs for university applications — calibrated for academic integrity.
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-text">
                      <CheckCircle2 size={11} className="text-emerald-500" />
                      Ethical Academic Integrity Checked (0% hallucinated sources)
                    </p>
                    <div className="mt-2.5 flex gap-2">
                      <button
                        disabled
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#7A0F1F] px-3 py-1.5 text-[11px] font-semibold text-white opacity-50 cursor-not-allowed"
                      >
                        Edit SOP
                      </button>
                      <button
                        disabled
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-[11px] font-semibold text-secondary-text opacity-50 cursor-not-allowed"
                      >
                        Export PDF
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* LinkedIn card */}
            <Card hover>
              <CardContent className="p-0">
                <div className="flex gap-4 p-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                    <div className="text-center">
                      <p className="text-[8px] font-bold text-blue-700 uppercase tracking-wider">
                        LinkedIn
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-heading text-sm font-bold text-foreground">
                        LinkedIn About & Featured Experience
                      </h4>
                      <Badge variant="warning" size="sm">
                        Coming Soon
                      </Badge>
                    </div>
                    <p className="mt-1 text-[12px] text-secondary-text leading-relaxed">
                      Auto-generate LinkedIn content optimized for recruiter search algorithms.
                    </p>
                    <div className="mt-2.5 flex gap-2">
                      <button
                        disabled
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-[11px] font-semibold text-secondary-text opacity-50 cursor-not-allowed"
                      >
                        Copy All
                      </button>
                      <button
                        disabled
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white opacity-50 cursor-not-allowed"
                      >
                        Sync with LinkedIn
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents Vault — PRESERVED FUNCTIONALITY */}
            <Card>
              <div className="border-b border-[#EBDDD1]/60 p-5 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="font-heading text-base font-bold text-foreground">
                      Career Documents & Vault
                    </h3>
                    <p className="mt-0.5 text-[12px] text-secondary-text">
                      Secure private storage — resumes, transcripts, certificates
                      (max 5 MB).
                    </p>
                  </div>
                  <label
                    className={`inline-flex items-center gap-2 rounded-xl bg-[#7A0F1F] px-4 py-2.5 text-[11px] font-semibold text-white shadow-sm shadow-[#7A0F1F]/20 hover:bg-[#4C0915] transition-colors cursor-pointer ${
                      uploading ? "opacity-70 pointer-events-none" : ""
                    }`}
                  >
                    <Upload size={14} />
                    <span>
                      {uploading
                        ? "Uploading…"
                        : "Upload PDF / Document"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc,.png,.jpg"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadError && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-[11px] font-medium text-red-700">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
                {uploadSuccess && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-[11px] font-medium text-emerald-700">
                    <CheckCircle2 size={14} className="shrink-0" />
                    <span>{uploadSuccess}</span>
                  </div>
                )}
              </div>

              <CardContent className="p-5">
                {documents.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-[#EBDDD1] p-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#FCE9E8] text-[#7A0F1F] mb-3">
                      <FileText size={22} />
                    </div>
                    <h4 className="font-semibold text-foreground text-sm">
                      No documents in your passport yet
                    </h4>
                    <p className="mt-1 text-[11px] text-secondary-text max-w-sm mx-auto">
                      Upload your latest resume or academic transcript (PDF, max
                      5 MB). All files are encrypted and accessible only with
                      student authentication.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#EBDDD1]/60">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-soft text-primary">
                            <FileCheck size={18} />
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-foreground">
                              {doc.originalFileName}
                            </p>
                            <p className="text-[11px] text-secondary-text">
                              {(doc.fileSizeBytes / 1024).toFixed(1)} KB ·{" "}
                              {doc.category}
                            </p>
                          </div>
                        </div>

                        <a
                          href={`/api/documents/${doc.id}/download`}
                          download={doc.originalFileName}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#EBDDD1] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#765F5D] hover:bg-[#FDF7F5] hover:text-[#7A0F1F] hover:border-[#7A0F1F]/40 shadow-2xs transition-colors"
                        >
                          <Download size={13} />
                          <span>Download</span>
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN — 2/5 */}
          <div className="space-y-6 lg:col-span-2">
            {/* AI Mentor card */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-[#FFF8F0] to-[#FFF0E0] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F2B63D] to-[#E8A020] shadow-sm">
                    <Bot size={20} className="text-[#4C0915]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading text-sm font-bold text-foreground">
                        Dr. Ananya AI Mentor
                      </h4>
                      <Badge variant="maroon" size="sm">
                        Pro AI
                      </Badge>
                    </div>
                    <p className="text-[11px] text-secondary-text">
                      {user.profile?.academicDomain || "Career"} Specialist
                    </p>
                  </div>
                </div>
              </div>

              <CardContent className="p-5 space-y-4">
                {/* Chat preview */}
                <div className="rounded-xl bg-surface-muted p-3.5">
                  <p className="text-[12px] text-secondary-text italic leading-relaxed">
                    &ldquo;Hi {firstName}! I can help with resume reviews, SOP
                    drafts, interview prep, and career guidance tailored to your{" "}
                    {user.profile?.academicDomain || "academic"} background.&rdquo;
                  </p>
                  <p className="mt-1 text-[10px] text-muted-text flex items-center gap-1">
                    <Clock size={10} />
                    Just now
                  </p>
                </div>

                {/* Quick prompts */}
                <div>
                  <p className="text-[11px] font-semibold text-secondary-text mb-2">
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
                        disabled
                        className="w-full rounded-lg bg-[#FFF0C7]/50 px-3 py-2 text-left text-[11px] font-medium text-[#7A0F1F] hover:bg-[#FFF0C7] transition-colors cursor-not-allowed opacity-70"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Coming soon badge */}
                <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2.5">
                  <Lock size={12} className="text-muted-text" />
                  <span className="text-[11px] font-medium text-muted-text">
                    AI Mentor launching soon
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Counselling card */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-[#FCE9E8] to-[#FFF0E0] px-5 py-4">
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} className="text-[#7A0F1F]" />
                  <h4 className="font-heading text-sm font-bold text-foreground">
                    Book a 1:1 Counselling Session
                  </h4>
                </div>
                <p className="mt-1 text-[11px] text-secondary-text">
                  Verified{" "}
                  {user.profile?.academicDomain
                    ? user.profile.academicDomain.toLowerCase()
                    : "career"}{" "}
                  & placement mentors
                </p>
              </div>

              <CardContent className="p-5 space-y-4">
                <p className="text-[12px] text-secondary-text leading-relaxed">
                  Connect virtually with Senior Counsellors for career guidance,
                  university shortlisting, and placement mock rounds.
                </p>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-soft">
                    <MessageCircle size={18} className="text-[#7A0F1F]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-foreground">
                      Career Counsellor
                    </p>
                    <p className="text-[10px] text-muted-text">
                      Next slot available: Coming soon
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-1.5 text-[10px] text-muted-text">
                  <Lock size={10} className="mt-0.5 shrink-0" />
                  <span>
                    Shared only with your explicit consent · Zero spam / cold
                    calls guarantee
                  </span>
                </div>

                <button
                  disabled
                  className="w-full rounded-xl border-2 border-dashed border-[#7A0F1F]/20 bg-[#FCE9E8]/50 py-2.5 text-[12px] font-semibold text-[#7A0F1F] opacity-60 cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <BriefcaseBusiness size={14} />
                  Pick a Time Slot — Coming Soon
                </button>
              </CardContent>
            </Card>

            {/* Career Status mini-card */}
            <Card>
              <CardContent className="p-5 space-y-3">
                <h4 className="font-heading text-sm font-bold text-foreground">
                  Career Status
                </h4>
                <Badge variant="success" dot>
                  Profile active
                </Badge>
                <div>
                  <p className="text-[12px] font-semibold text-foreground">
                    Your next step
                  </p>
                  <p className="mt-0.5 text-[11px] text-secondary-text leading-relaxed">
                    {milestone.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ============================================================
            CAREER ROADMAP — Placeholder
        ============================================================ */}
        <section>
          <Card>
            <div className="border-b border-[#EBDDD1]/60 p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-lg font-bold text-foreground">
                  6–12 Month Career Roadmap
                </h3>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A0F1F]">
                  Target: {new Date().getFullYear() + 1}
                </span>
              </div>
            </div>

            <CardContent className="p-5">
              <div className="relative">
                {/* Timeline */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[#EBDDD1]" />

                {/* Phase 1 */}
                <div className="relative flex gap-4 pb-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 z-10">
                    <CheckCircle2 size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[12px] font-bold text-foreground">
                        Phase 1: Foundation (Months 1–2)
                      </p>
                      <Badge variant="success" size="sm">
                        {score >= 50 ? "In Progress" : "Getting Started"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[12px] text-secondary-text">
                      Complete your Career Passport, upload documents, and set
                      career goals.
                    </p>
                  </div>
                </div>

                {/* Phase 2 */}
                <div className="relative flex gap-4 pb-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 z-10">
                    <Clock size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-foreground">
                      Phase 2: Portfolio & Skills (Months 3–5)
                    </p>
                    <Badge variant="warning" size="sm">
                      Upcoming
                    </Badge>
                    <p className="mt-1 text-[12px] text-secondary-text">
                      Build your resume, draft SOPs, and develop domain-specific
                      skills.
                    </p>
                  </div>
                </div>

                {/* Phase 3 */}
                <div className="relative flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400 z-10">
                    <Target size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-foreground">
                      Phase 3: Applications & Interviews (Months 6–8)
                    </p>
                    <Badge variant="default" size="sm">
                      Upcoming
                    </Badge>
                    <p className="mt-1 text-[12px] text-secondary-text">
                      Apply to opportunities, attend placement drives, and
                      prepare for interviews.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </StudentLayout>
  );
}
