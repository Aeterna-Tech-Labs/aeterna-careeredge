"use client";

// src/app/resume/builder/builder-client.tsx
// Comprehensive Multi-Domain Resume Builder: Full-Resume AI Improvement + Complete Customization
// Day 2 Resume Builder Upgrade (Truth-Enforced, Multi-Template, Undo/Redo, Local Checks)

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { StudentLayout } from "@/components/layouts/student-layout";
import { HowItWorksPanel } from "@/components/guidance/how-it-works-panel";
import type {
  FullResumeData,
  FullResumeAnalysisReport,
  SectionSuggestion,
  ResumeStyleConfig,
} from "@/lib/resume/types";
import { normalizeResumeData, computeResumeContentHash } from "@/lib/resume/adapter";
import { runLocalResumeChecks, type LocalCheckReport } from "@/lib/resume/local-checks";
import { ResumePreview } from "./components/resume-preview";
import { SectionEditor } from "./components/section-editor";
import { CustomizePanel } from "./components/customize-panel";
import { AiReviewPanel } from "./components/ai-review-panel";
import { VersionHistoryModal } from "./components/version-history-modal";
import { BeforeAfterModal } from "./components/before-after-modal";
import type { TruthCheckReport } from "@/lib/truth-check/service";
import {
  Save,
  CheckCheck,
  Printer,
  Download,
  Search,
  ArrowLeft,
  Sparkles,
  Undo2,
  Redo2,
  History,
  Copy,
  SlidersHorizontal,
  FileText,
  Palette,
  AlertTriangle,
  Loader2,
  ShieldCheck,
} from "lucide-react";

interface BuilderClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    academicDomain: string;
    preferredJobRole?: string;
  };
  resume: {
    id: string;
    title: string;
    targetRole?: string | null;
    templateId: string;
    atsScore?: number | null;
    structuredData?: string | null;
    styleData?: string | null;
  };
  evidenceItems: Array<{
    id: string;
    title: string;
    type: string;
    relatedSkill?: string | null;
    url?: string | null;
  }>;
}

export function BuilderClient({ user, resume, evidenceItems }: BuilderClientProps) {
  // Normalize initial data safely (handles both legacy flat data and new modular schema)
  const initialNormalized = useMemo(() => {
    return normalizeResumeData(
      resume.structuredData,
      {
        name: user.name,
        email: user.email,
        domain: user.academicDomain,
        preferredJobRole: resume.targetRole || user.preferredJobRole,
      },
      resume.styleData
    );
  }, [resume, user]);

  // Document state
  const [resumeTitle, setResumeTitle] = useState(resume.title);
  const [data, setData] = useState<FullResumeData>(initialNormalized);
  const [originalData] = useState<FullResumeData>(initialNormalized);

  // Undo / Redo Stacks (Bounded to 25 states)
  const [undoStack, setUndoStack] = useState<FullResumeData[]>([]);
  const [redoStack, setRedoStack] = useState<FullResumeData[]>([]);

  // Navigation & View Tabs: "edit" | "customize" | "ai_review"
  const [activeTab, setActiveTab] = useState<"edit" | "customize" | "ai_review">("edit");
  const [activeSectionId, setActiveSectionId] = useState<string>("sec_summary");

  // Save state
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Full-Resume AI Analysis state
  const [fullAnalysisReport, setFullAnalysisReport] = useState<FullResumeAnalysisReport | null>(null);
  const [analyzingFull, setAnalyzingFull] = useState(false);
  const [jobDescription, setJobDescription] = useState("");

  // Modals state
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showBeforeAfterModal, setShowBeforeAfterModal] = useState(false);
  const [showTruthModal, setShowTruthModal] = useState(false);
  const [truthReport, setTruthReport] = useState<TruthCheckReport | null>(null);
  const [runningTruthCheck, setRunningTruthCheck] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Evidence titles for local check cross-referencing
  const evidenceTitles = useMemo(() => {
    return evidenceItems
      .map((e) => e.relatedSkill || e.title)
      .filter(Boolean) as string[];
  }, [evidenceItems]);

  // Live Deterministic Local Health Checks (Instant, zero AI cost)
  const localReport: LocalCheckReport = useMemo(() => {
    return runLocalResumeChecks(data, evidenceTitles);
  }, [data, evidenceTitles]);

  // Check if analysis is out-of-date compared to active content
  const isAnalysisOutOfDate = useMemo(() => {
    if (!fullAnalysisReport || !fullAnalysisReport.contentHash) return false;
    const currentHash = computeResumeContentHash(data);
    return currentHash !== fullAnalysisReport.contentHash;
  }, [data, fullAnalysisReport]);

  // ── Central State Update with Undo Tracking ────────────────────────────────
  function handleDataChange(nextData: FullResumeData) {
    setUndoStack((prev) => [...prev.slice(-24), data]);
    setRedoStack([]);
    setData(nextData);
    setSaveStatus("Unsaved changes");
  }

  function handleUndo() {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [data, ...prev]);
    setUndoStack((prev) => prev.slice(0, -1));
    setData(previous);
  }

  function handleRedo() {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setUndoStack((prev) => [...prev, data]);
    setRedoStack((prev) => prev.slice(1));
    setData(next);
  }

  // ── Save Function ──────────────────────────────────────────────────────────
  async function handleSave(note?: string) {
    setSaving(true);
    setSaveStatus(null);
    try {
      const contentHash = computeResumeContentHash(data);
      const res = await fetch(`/api/resumes/${resume.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: resumeTitle,
          targetRole: data.targetRole,
          templateId: data.style.templateId,
          structuredData: data,
          styleData: data.style,
          contentHash,
          atsScore: localReport.overallHealthScore,
        }),
      });

      if (!res.ok) throw new Error("Failed to save resume.");

      // If note provided or manual save, also create snapshot in versions
      if (note) {
        await fetch(`/api/resumes/${resume.id}/versions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            versionName: note,
            changeNote: note,
            snapshotData: data,
          }),
        });
      }

      setSaveStatus("All changes saved.");
      setTimeout(() => setSaveStatus(null), 3500);
    } catch (err: unknown) {
      setSaveStatus("Save failed: " + (err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  // ── Full-Resume AI Analysis Action (User-Initiated) ─────────────────────────
  async function handleAnalyzeFull() {
    setAnalyzingFull(true);
    try {
      const res = await fetch(`/api/resumes/${resume.id}/analyze-full`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: jobDescription.trim() || undefined,
          updatedResumeData: data,
          forceRefresh: true,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Analysis failed.");

      if (resData.report) {
        setFullAnalysisReport(resData.report);
        setActiveTab("ai_review");
      }
    } catch (err: unknown) {
      alert((err as Error).message || "Failed to analyze resume.");
    } finally {
      setAnalyzingFull(false);
    }
  }

  // ── Single Section Improvement Action ──────────────────────────────────────
  async function handleImproveSection(sectionId: string) {
    try {
      const res = await fetch(`/api/resumes/${resume.id}/improve-section`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId,
          updatedResumeData: data,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to optimize section.");

      if (resData.sectionResult && fullAnalysisReport) {
        const updatedAnalyses = fullAnalysisReport.sectionAnalyses.map((s) =>
          s.sectionId === sectionId ? resData.sectionResult : s
        );
        setFullAnalysisReport({
          ...fullAnalysisReport,
          sectionAnalyses: updatedAnalyses,
        });
      }
    } catch (err: unknown) {
      alert((err as Error).message || "Could not improve section.");
    }
  }

  // ── Accept Single Suggestion ───────────────────────────────────────────────
  function handleAcceptSuggestion(sectionId: string, suggestion: SectionSuggestion) {
    const updatedSections = data.sections.map((sec) => {
      if (sec.id !== sectionId) return sec;

      if (sec.type === "summary") {
        const updatedEntries = [...sec.entries];
        if (updatedEntries[0]) {
          updatedEntries[0].text = suggestion.improved;
          updatedEntries[0].provenance = "AI_SUGGESTION";
        }
        return { ...sec, entries: updatedEntries };
      }

      // Find matching bullet across entries
      const updatedEntries = sec.entries.map((entry) => {
        const updatedBullets = entry.bullets.map((b) => {
          if (b.text === suggestion.original || b.id === suggestion.id) {
            return {
              ...b,
              text: suggestion.improved,
              provenance: "AI_SUGGESTION" as const,
              isApproved: true,
            };
          }
          return b;
        });
        return { ...entry, bullets: updatedBullets };
      });

      return { ...sec, entries: updatedEntries };
    });

    const nextData = { ...data, sections: updatedSections };
    handleDataChange(nextData);

    // Remove accepted suggestion from review panel
    if (fullAnalysisReport) {
      const updatedAnalyses = fullAnalysisReport.sectionAnalyses.map((s) => {
        if (s.sectionId !== sectionId) return s;
        return {
          ...s,
          suggestions: s.suggestions.filter((sug) => sug.id !== suggestion.id),
        };
      });
      setFullAnalysisReport({ ...fullAnalysisReport, sectionAnalyses: updatedAnalyses });
    }

    handleSave(`Accepted AI rewrite for ${sectionId}`);
  }

  // ── Accept All Safe Suggestions ────────────────────────────────────────────
  function handleAcceptAllSafe() {
    if (!fullAnalysisReport) return;

    let updatedSections = [...data.sections];
    let acceptedCount = 0;

    fullAnalysisReport.sectionAnalyses.forEach((secAnalysis) => {
      secAnalysis.suggestions.forEach((sug) => {
        if (!sug.needsStudentConfirmation) {
          acceptedCount++;
          updatedSections = updatedSections.map((sec) => {
            if (sec.id !== secAnalysis.sectionId) return sec;

            if (sec.type === "summary" && sec.entries[0]) {
              sec.entries[0].text = sug.improved;
              sec.entries[0].provenance = "AI_SUGGESTION";
              return sec;
            }

            const updatedEntries = sec.entries.map((entry) => ({
              ...entry,
              bullets: entry.bullets.map((b) =>
                b.text === sug.original
                  ? { ...b, text: sug.improved, provenance: "AI_SUGGESTION" as const, isApproved: true }
                  : b
              ),
            }));

            return { ...sec, entries: updatedEntries };
          });
        }
      });
    });

    if (acceptedCount === 0) return;

    const nextData = { ...data, sections: updatedSections };
    handleDataChange(nextData);

    // Remove safe suggestions from panel
    const cleanedAnalyses = fullAnalysisReport.sectionAnalyses.map((sec) => ({
      ...sec,
      suggestions: sec.suggestions.filter((sug) => sug.needsStudentConfirmation),
    }));
    setFullAnalysisReport({ ...fullAnalysisReport, sectionAnalyses: cleanedAnalyses });

    handleSave(`Accepted ${acceptedCount} safe AI suggestions`);
  }

  // ── Reject Suggestion ──────────────────────────────────────────────────────
  function handleRejectSuggestion(sectionId: string, suggestionId: string) {
    if (!fullAnalysisReport) return;
    const updatedAnalyses = fullAnalysisReport.sectionAnalyses.map((sec) => {
      if (sec.sectionId !== sectionId) return sec;
      return {
        ...sec,
        suggestions: sec.suggestions.filter((sug) => sug.id !== suggestionId),
      };
    });
    setFullAnalysisReport({ ...fullAnalysisReport, sectionAnalyses: updatedAnalyses });
  }

  // ── Targeted Bullet Action Handler ─────────────────────────────────────────
  async function handleImproveBulletAction(
    bulletText: string,
    action: "make_specific" | "shorten" | "strengthen" | "fix_grammar"
  ): Promise<string> {
    const res = await fetch(`/api/resumes/${resume.id}/improve-bullet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bulletText, action }),
    });

    const resData = await res.json();
    if (!res.ok) throw new Error(resData.error || "Action failed.");
    return resData.suggestion?.improved || bulletText;
  }

  // ── Duplicate Resume Version ───────────────────────────────────────────────
  async function handleDuplicate() {
    try {
      const res = await fetch(`/api/resumes/${resume.id}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${resumeTitle} (Copy)`,
          targetRole: data.targetRole,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to duplicate resume.");
      alert(`Resume duplicated successfully as "${resData.resume.title}"!`);
    } catch (err: unknown) {
      alert((err as Error).message || "Could not duplicate resume.");
    }
  }

  // ── Restore Version Snapshot ───────────────────────────────────────────────
  async function handleRestoreVersion(versionId: string) {
    const res = await fetch(`/api/resumes/${resume.id}/versions/${versionId}/restore`, {
      method: "POST",
    });

    const resData = await res.json();
    if (!res.ok) throw new Error(resData.error || "Failed to restore version.");

    if (resData.resume?.structuredData) {
      const restored = normalizeResumeData(
        resData.resume.structuredData,
        {
          name: user.name,
          email: user.email,
          domain: user.academicDomain,
          preferredJobRole: resData.resume.targetRole,
        },
        resData.resume.styleData
      );
      setData(restored);
      setSaveStatus("Restored version snapshot.");
    }
  }

  // ── Fit To One Page Helper ─────────────────────────────────────────────────
  function handleFitToOnePage() {
    const confirmed = confirm(
      "Fit to 1 Page Helper: This will optimize your page margins to 'compact' (8mm), section spacing to 12px, and line height to 1.3 to ensure clean single-page presentation. Proceed?"
    );
    if (!confirmed) return;

    const updatedStyle: ResumeStyleConfig = {
      ...data.style,
      spacing: {
        ...data.style.spacing,
        margins: "compact",
        sectionSpacing: 12,
        lineHeight: 1.3,
      },
      page: {
        ...data.style.page,
        fitToOnePage: true,
      },
    };

    handleDataChange({ ...data, style: updatedStyle });
  }

  // ── Truth Check Runner ─────────────────────────────────────────────────────
  async function handleTruthCheck() {
    setRunningTruthCheck(true);
    setShowTruthModal(true);
    try {
      const res = await fetch(`/api/resumes/${resume.id}/truth-check`, { method: "POST" });
      const resData = await res.json();
      if (res.ok && resData.report) {
        setTruthReport(resData.report);
      }
    } catch (err) {
      console.error("Truth check failed:", err);
    } finally {
      setRunningTruthCheck(false);
    }
  }

  async function handleExportPdf() {
    setExportingPdf(true);
    setExportError(null);
    try {
      await handleSave("Auto-save before PDF export");
      const pageSize = data.style.layout?.pageSize || "A4";
      const res = await fetch(`/api/resumes/${resume.id}/export-pdf?pageSize=${pageSize}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate PDF resume.");
      }

      const blob = await res.blob();
      const contentDisposition = res.headers.get("Content-Disposition");
      let filename = `${(user.name || "Resume").replace(/\s+/g, "-")}-Resume.pdf`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      const blobUrl = window.URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = blobUrl;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err: unknown) {
      console.error("[ExportPdf] Failed:", err);
      setExportError((err as Error).message || "Export failed. You can also use Print View.");
    } finally {
      setExportingPdf(false);
    }
  }

  async function handleOpenPrintView() {
    try {
      await handleSave("Auto-save before print view");
    } catch (e) {
      console.warn("Auto-save before print view:", e);
    }
    window.open(`/resume/${resume.id}/print`, "_blank");
  }

  return (
    <StudentLayout
      userName={user.name}
      studentDomain={user.academicDomain}
      targetRole={data.targetRole || user.preferredJobRole}
    >
      <div className="min-h-screen bg-[#FDFBF9] pb-16">
        {/* ── 1. Sticky Navigation & Action Toolbar ────────────────────── */}
        <div className="sticky top-0 z-30 border-b border-[#EBDDD1] bg-white px-4 py-3 shadow-xs print:hidden">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                href="/resume"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#EBDDD1] text-[#765F5D] hover:bg-[#FDF7F5] transition-colors"
                title="Back to Resumes"
              >
                <ArrowLeft size={16} />
              </Link>

              <div>
                <input
                  type="text"
                  value={resumeTitle}
                  onChange={(e) => setResumeTitle(e.target.value)}
                  className="font-heading text-sm font-bold text-[#2B1810] focus:border-b focus:border-[#7A0F1F] focus:outline-hidden"
                />
                <div className="flex items-center gap-2 text-[10px] text-[#765F5D]">
                  <span className="font-semibold text-[#7A0F1F]">{data.domainName}</span>
                  <span>•</span>
                  <span>Target: {data.targetRole || "Professional"}</span>
                </div>
              </div>
            </div>

            {/* Central Health & Out-of-Date Indicator */}
            <div className="flex items-center gap-2">
              <div
                className="hidden sm:flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold cursor-pointer"
                style={{
                  backgroundColor: localReport.overallHealthScore >= 80 ? "#F0FDF4" : "#FFFBEB",
                  borderColor: localReport.overallHealthScore >= 80 ? "#86EFAC" : "#FCD34D",
                  color: localReport.overallHealthScore >= 80 ? "#166534" : "#92400E",
                }}
                title={`${localReport.totalFindings} local check findings`}
              >
                <ShieldCheck size={13} />
                <span>Health: {localReport.overallHealthScore}%</span>
              </div>

              {isAnalysisOutOfDate && (
                <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 text-[10px] font-bold">
                  <AlertTriangle size={11} />
                  <span>Analysis Out of Date</span>
                </span>
              )}
            </div>

            {/* Action Buttons: Undo/Redo, AI Analysis, Export, Save */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Undo / Redo */}
              <div className="flex items-center border border-[#EBDDD1] rounded-lg overflow-hidden bg-white">
                <button
                  type="button"
                  disabled={undoStack.length === 0}
                  onClick={handleUndo}
                  className="p-1.5 text-stone-600 hover:bg-[#FDF7F5] disabled:opacity-30"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 size={13} />
                </button>
                <button
                  type="button"
                  disabled={redoStack.length === 0}
                  onClick={handleRedo}
                  className="p-1.5 text-stone-600 hover:bg-[#FDF7F5] disabled:opacity-30 border-l border-[#EBDDD1]"
                  title="Redo"
                >
                  <Redo2 size={13} />
                </button>
              </div>

              {/* Version History */}
              <button
                type="button"
                onClick={() => setShowVersionModal(true)}
                className="inline-flex items-center gap-1 rounded-lg border border-[#EBDDD1] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#765F5D] hover:bg-[#FDF7F5] transition"
                title="Version History & Restore"
              >
                <History size={13} />
                <span className="hidden sm:inline">Versions</span>
              </button>

              {/* Duplicate */}
              <button
                type="button"
                onClick={handleDuplicate}
                className="inline-flex items-center gap-1 rounded-lg border border-[#EBDDD1] bg-white px-2 py-1.5 text-xs font-semibold text-[#765F5D] hover:bg-[#FDF7F5] transition"
                title="Duplicate Resume Version"
              >
                <Copy size={13} />
              </button>

              {/* Truth Check */}
              <button
                type="button"
                onClick={handleTruthCheck}
                className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 transition"
              >
                <CheckCheck size={13} />
                <span className="hidden sm:inline">Truth Check</span>
              </button>

              {/* Full AI Analysis Trigger Button */}
              <button
                type="button"
                disabled={analyzingFull}
                onClick={handleAnalyzeFull}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#F6B51C] bg-[#FFF9ED] px-3 py-1.5 text-xs font-bold text-[#7A0F1F] hover:bg-[#FFF0D4] transition shadow-2xs disabled:opacity-50"
              >
                {analyzingFull ? (
                  <Loader2 size={13} className="animate-spin text-[#7A0F1F]" />
                ) : (
                  <Sparkles size={13} className="text-[#F6B51C]" />
                )}
                <span>{analyzingFull ? "Analyzing…" : "Analyze Full Resume"}</span>
              </button>

              {/* Export PDF (Direct ATS PDF Download) */}
              <button
                type="button"
                disabled={exportingPdf}
                onClick={handleExportPdf}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#7A0F1F] bg-[#FFF9ED] px-3 py-1.5 text-xs font-bold text-[#7A0F1F] hover:bg-[#FFF0D4] transition shadow-2xs disabled:opacity-50"
                title="Download ATS-Friendly Vector PDF"
              >
                {exportingPdf ? (
                  <Loader2 size={13} className="animate-spin text-[#7A0F1F]" />
                ) : (
                  <Download size={13} />
                )}
                <span>{exportingPdf ? "Exporting PDF…" : "Export PDF"}</span>
              </button>

              {/* Print View */}
              <button
                type="button"
                onClick={handleOpenPrintView}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#EBDDD1] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#2B1810] hover:bg-[#FDF7F5] transition"
                title="Open Dedicated Clean Print View"
              >
                <Printer size={13} />
                <span className="hidden sm:inline">Print View</span>
              </button>

              {/* Save */}
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave("Manual student save")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#7A0F1F] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#600C18] disabled:opacity-50 transition shadow-xs"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                <span>Save</span>
              </button>

              {saveStatus && (
                <span className="text-[11px] font-semibold text-emerald-800 animate-in fade-in">
                  {saveStatus}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Export Error Alert Banner */}
        {exportError && (
          <div className="mx-auto max-w-7xl px-4 pt-3 print:hidden">
            <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="shrink-0 text-rose-600" />
                <span>{exportError}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleExportPdf}
                  className="font-bold underline hover:text-rose-900"
                >
                  Retry
                </button>
                <button
                  type="button"
                  onClick={handleOpenPrintView}
                  className="font-bold underline hover:text-rose-900"
                >
                  Open Print View
                </button>
                <button
                  type="button"
                  onClick={() => setExportError(null)}
                  className="text-rose-500 hover:text-rose-800 font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── 2. First-Use Guidance Panel ─────────────────────────────── */}
        <div className="mx-auto max-w-7xl px-4 pt-4 print:hidden">
          <HowItWorksPanel toolKey="resume-builder" />
        </div>

        {/* ── 3. Main Workspace Grid (Editor Tabs | Live Preview) ────────── */}
        <div className="mx-auto max-w-7xl px-4 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ── Left Pane: Workspace Tabs (Edit, Customize, AI Review) ──── */}
            <div className="lg:col-span-5 space-y-4 print:hidden">
              {/* Tab Selector Buttons */}
              <div className="flex rounded-xl bg-stone-200/60 p-1 text-xs font-bold text-stone-700">
                <button
                  type="button"
                  onClick={() => setActiveTab("edit")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${
                    activeTab === "edit"
                      ? "bg-white text-[#7A0F1F] shadow-xs"
                      : "hover:text-[#2B1810]"
                  }`}
                >
                  <FileText size={14} />
                  <span>Sections ({data.sections.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("customize")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${
                    activeTab === "customize"
                      ? "bg-white text-[#7A0F1F] shadow-xs"
                      : "hover:text-[#2B1810]"
                  }`}
                >
                  <Palette size={14} />
                  <span>Customize Style</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("ai_review")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${
                    activeTab === "ai_review"
                      ? "bg-white text-[#7A0F1F] shadow-xs"
                      : "hover:text-[#2B1810]"
                  }`}
                >
                  <Sparkles size={14} className="text-[#F6B51C]" />
                  <span>AI Review</span>
                </button>
              </div>

              {/* Optional Job Description Input Drawer */}
              <div className="rounded-xl border border-[#EBDDD1] bg-white p-3 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#765F5D]">
                    Target Job Description (Optional Alignment Benchmark):
                  </label>
                  {jobDescription && (
                    <button
                      type="button"
                      onClick={() => setJobDescription("")}
                      className="text-[10px] text-stone-400 hover:text-stone-700"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <textarea
                  rows={2}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste a target job description to benchmark requirements and extract keyword matches..."
                  className="w-full text-xs text-[#2B1810] rounded-lg border border-[#EBDDD1] p-2 focus:outline-hidden resize-none"
                />
              </div>

              {/* Tab 1: Section Content Editor */}
              {activeTab === "edit" && (
                <SectionEditor
                  data={data}
                  onChangeData={handleDataChange}
                  onImproveBulletAction={handleImproveBulletAction}
                  onScrollToSection={(secId) => {
                    const el = document.getElementById(secId);
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                />
              )}

              {/* Tab 2: Customization & Style Controls */}
              {activeTab === "customize" && (
                <div className="rounded-2xl border border-[#EBDDD1] bg-white shadow-sm">
                  <CustomizePanel
                    style={data.style}
                    onChangeStyle={(newStyle) => handleDataChange({ ...data, style: newStyle })}
                    onFitToOnePage={handleFitToOnePage}
                  />
                </div>
              )}

              {/* Tab 3: Full-Resume AI Review Panel */}
              {activeTab === "ai_review" && (
                <AiReviewPanel
                  report={fullAnalysisReport}
                  analyzingFull={analyzingFull}
                  onAnalyzeFull={handleAnalyzeFull}
                  onImproveSection={handleImproveSection}
                  onAcceptSuggestion={handleAcceptSuggestion}
                  onAcceptAllSafe={handleAcceptAllSafe}
                  onRejectSuggestion={handleRejectSuggestion}
                  onRegenerateSuggestion={async (secId, sug) => {
                    const improved = await handleImproveBulletAction(sug.original, "strengthen");
                    handleAcceptSuggestion(secId, { ...sug, improved });
                  }}
                  onScrollToSection={(secId) => {
                    const el = document.getElementById(secId);
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                />
              )}
            </div>

            {/* ── Right Pane: Live Document Preview ───────────────────────── */}
            <div className="lg:col-span-7 space-y-3">
              {/* Preview Toolbar */}
              <div className="flex items-center justify-between text-xs text-stone-500 px-2 print:hidden">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#2B1810]">Live Document Preview</span>
                  <span>•</span>
                  <span className="font-mono text-[11px]">
                    {data.style.templateId} ({localReport.estimatedPageCount} {localReport.estimatedPageCount === 1 ? "Page" : "Pages"})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBeforeAfterModal(true)}
                    className="inline-flex items-center gap-1 font-semibold text-[#7A0F1F] hover:underline"
                  >
                    <SlidersHorizontal size={12} />
                    <span>Before / After</span>
                  </button>

                  <Link
                    href={`/resume/check?resumeId=${resume.id}`}
                    className="inline-flex items-center gap-1 font-semibold text-stone-600 hover:underline"
                  >
                    <Search size={12} />
                    <span>JD Match</span>
                  </Link>
                </div>
              </div>

              {/* The Live Document Component */}
              <ResumePreview
                data={data}
                onSelectSection={(secId) => {
                  setActiveSectionId(secId);
                  setActiveTab("edit");
                }}
                activeSectionId={activeSectionId}
              />
            </div>
          </div>
        </div>

        {/* ── Modals ──────────────────────────────────────────────────── */}
        <VersionHistoryModal
          resumeId={resume.id}
          isOpen={showVersionModal}
          onClose={() => setShowVersionModal(false)}
          onRestoreVersion={handleRestoreVersion}
        />

        <BeforeAfterModal
          isOpen={showBeforeAfterModal}
          onClose={() => setShowBeforeAfterModal(false)}
          originalData={originalData}
          currentData={data}
        />

        {/* Truth Check Modal */}
        {showTruthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between border-b border-[#EBDDD1] pb-3">
                <div className="flex items-center gap-2">
                  <CheckCheck size={18} className="text-emerald-700" />
                  <h3 className="font-heading text-lg font-bold text-[#2B1810]">
                    Truth Check Verification
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTruthModal(false)}
                  className="rounded-lg p-1 text-[#765F5D] hover:bg-[#FDF7F5]"
                >
                  ✕
                </button>
              </div>

              {runningTruthCheck ? (
                <div className="py-12 text-center">
                  <Loader2 size={32} className="animate-spin text-[#7A0F1F] mx-auto" />
                  <p className="mt-2 text-xs font-semibold text-[#765F5D]">
                    Verifying resume claims against Evidence Vault and Career Passport...
                  </p>
                </div>
              ) : truthReport ? (
                <div className="space-y-4 pt-4">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                      Honesty Score: {truthReport.honestyScore}%
                    </span>
                    <div className="mt-2 flex gap-4 text-xs font-semibold">
                      <span className="text-emerald-800">
                        ✓ {truthReport.verifiedCount} Verified
                      </span>
                      <span className="text-amber-800">
                        ⚠ {truthReport.unsupportedCount + (truthReport.needsEvidenceCount || 0)} Needs Evidence / Unsupported
                      </span>
                    </div>
                  </div>

                  {truthReport.items.filter((item) => item.status !== "VERIFIED").length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-[#2B1810]">Audit Findings:</span>
                      <div className="max-h-48 overflow-y-auto space-y-1.5">
                        {truthReport.items
                          .filter((item) => item.status !== "VERIFIED")
                          .map((item, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900"
                            >
                              <span className="font-bold">{item.claim}</span>: {item.status} ({item.reason})
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowTruthModal(false)}
                      className="rounded-xl bg-[#7A0F1F] px-4 py-2 text-xs font-bold text-white hover:bg-[#600C18]"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
