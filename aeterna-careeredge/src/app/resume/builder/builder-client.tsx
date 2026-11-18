"use client";

// src/app/resume/builder/builder-client.tsx
// Comprehensive Multi-Domain Resume Builder: Flow-Style 3-Zone Customization System
// Desktop 3-Zone Split (Left Content | Center Live Preview with Zoom & Page Boundaries | Right Design)
// Truth-Enforced, Zero-Fabrication, Multi-Template, Undo/Redo, Real-time PDF Export

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
import { UploadResumeButton } from "@/components/resume/upload-resume-button";
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
  ZoomIn,
  ZoomOut,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  X,
  RotateCcw,
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
  // Normalize initial data safely
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

  // Navigation & View Tabs for Mobile: "edit" | "customize" | "preview" | "ai_review"
  const [mobileTab, setMobileTab] = useState<"edit" | "customize" | "preview" | "ai_review">("edit");
  const [activeSectionId, setActiveSectionId] = useState<string>("sec_summary");

  // Desktop Collapsible Side Panels (3-Zone Flow Layout)
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [showAiDrawer, setShowAiDrawer] = useState(false);

  // Preview Zoom (50% to 150%)
  const [zoom, setZoom] = useState<number>(100);

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
  const [showFitPageModal, setShowFitPageModal] = useState(false);
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
  async function handleSave(note?: string, customData?: FullResumeData) {
    const dataToSave = customData || data;
    setSaving(true);
    setSaveStatus(null);
    try {
      const contentHash = computeResumeContentHash(dataToSave);
      const res = await fetch(`/api/resumes/${resume.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: resumeTitle,
          targetRole: dataToSave.targetRole,
          templateId: dataToSave.style.templateId,
          structuredData: dataToSave,
          styleData: dataToSave.style,
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
            snapshotData: dataToSave,
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

  // ── Full-Resume AI Analysis Action ─────────────────────────────────────────
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
        setShowAiDrawer(true);
        setMobileTab("ai_review");
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
  }

  // ── Reject Single Suggestion ───────────────────────────────────────────────
  function handleRejectSuggestion(sectionId: string, suggestionId: string) {
    if (!fullAnalysisReport) return;
    const updatedAnalyses = fullAnalysisReport.sectionAnalyses.map((s) => {
      if (s.sectionId !== sectionId) return s;
      return {
        ...s,
        suggestions: s.suggestions.filter((sug) => sug.id !== suggestionId),
      };
    });
    setFullAnalysisReport({ ...fullAnalysisReport, sectionAnalyses: updatedAnalyses });
  }

  // ── Accept All Safe Suggestions ───────────────────────────────────────────
  function handleAcceptAllSafe() {
    if (!fullAnalysisReport) return;

    let nextData = { ...data };
    const suggestionsToAccept: Array<{ sectionId: string; sug: SectionSuggestion }> = [];

    fullAnalysisReport.sectionAnalyses.forEach((sec) => {
      sec.suggestions.forEach((sug) => {
        if (!sug.needsStudentConfirmation) {
          suggestionsToAccept.push({ sectionId: sec.sectionId, sug });
        }
      });
    });

    if (suggestionsToAccept.length === 0) {
      alert("No high-confidence suggestions available to auto-apply.");
      return;
    }

    const updatedSections = nextData.sections.map((sec) => {
      const secSugs = suggestionsToAccept.filter((item) => item.sectionId === sec.id);
      if (secSugs.length === 0) return sec;

      if (sec.type === "summary") {
        const lastSug = secSugs[secSugs.length - 1];
        const updatedEntries = [...sec.entries];
        if (updatedEntries[0]) {
          updatedEntries[0].text = lastSug.sug.improved;
          updatedEntries[0].provenance = "AI_SUGGESTION";
        }
        return { ...sec, entries: updatedEntries };
      }

      const updatedEntries = sec.entries.map((entry) => {
        const updatedBullets = entry.bullets.map((b) => {
          const match = secSugs.find((item) => item.sug.original === b.text);
          if (match) {
            return {
              ...b,
              text: match.sug.improved,
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

    nextData = { ...nextData, sections: updatedSections };
    handleDataChange(nextData);

    const updatedAnalyses = fullAnalysisReport.sectionAnalyses.map((s) => ({
      ...s,
      suggestions: s.suggestions.filter((sug) => sug.needsStudentConfirmation),
    }));
    setFullAnalysisReport({ ...fullAnalysisReport, sectionAnalyses: updatedAnalyses });
    alert(`Successfully applied ${suggestionsToAccept.length} verified improvements.`);
  }

  // ── Bullet Rewrite Action ──────────────────────────────────────────────────
  async function handleImproveBulletAction(
    bulletText: string,
    action: "make_specific" | "shorten" | "strengthen" | "fix_grammar"
  ): Promise<string> {
    try {
      const res = await fetch(`/api/resumes/${resume.id}/improve-bullet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bulletText,
          action,
          targetRole: data.targetRole,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to optimize bullet.");
      return resData.improvedBullet || bulletText;
    } catch (err: unknown) {
      alert((err as Error).message || "Could not improve bullet.");
      return bulletText;
    }
  }

  // ── Duplicate Resume ───────────────────────────────────────────────────────
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

  // ── Granular Revert Bullet from Before/After Modal ─────────────────────────
  function handleRevertBullet(
    sectionId: string,
    entryId: string,
    bulletId: string,
    originalText: string
  ) {
    const updatedSections = data.sections.map((sec) => {
      if (sec.id !== sectionId) return sec;
      const updatedEntries = sec.entries.map((ent) => {
        if (ent.id !== entryId) return ent;
        const updatedBullets = ent.bullets.map((b) => {
          if (b.id !== bulletId) return b;
          return {
            ...b,
            text: originalText,
            provenance: "STUDENT_INPUT" as const,
          };
        });
        return { ...ent, bullets: updatedBullets };
      });
      return { ...sec, entries: updatedEntries };
    });

    handleDataChange({ ...data, sections: updatedSections });
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

  // ── PDF Export ─────────────────────────────────────────────────────────────
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
      await handleSave("Auto-save before print view", data);
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
        {/* ── 1. Flow-Style Top Navigation & Master Toolbar ─────────────── */}
        <div className="sticky top-0 z-30 border-b border-[#EBDDD1] bg-white px-3 sm:px-6 py-2.5 shadow-xs print:hidden">
          <div className="mx-auto flex max-w-[1700px] flex-wrap items-center justify-between gap-3">
            {/* Left: Back Link & Document Title */}
            <div className="flex items-center gap-3">
              <Link
                href="/resume"
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#EBDDD1] text-[#765F5D] hover:bg-[#FDF7F5] transition"
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
                  <span>&bull;</span>
                  <span>Target: {data.targetRole || "Professional"}</span>
                </div>
              </div>
            </div>

            {/* Center: Zone Toggle Controls (Desktop Flow Layout) & Health */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="flex items-center rounded-xl border border-[#EBDDD1] bg-[#FCF9F6] p-0.5">
                <button
                  type="button"
                  onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    !isLeftCollapsed
                      ? "bg-white text-[#7A0F1F] shadow-xs"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                  title="Toggle Sections Panel"
                >
                  {isLeftCollapsed ? <PanelLeftOpen size={13} /> : <PanelLeftClose size={13} />}
                  <span>Sections</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsRightCollapsed(!isRightCollapsed)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    !isRightCollapsed
                      ? "bg-white text-[#7A0F1F] shadow-xs"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                  title="Toggle Design Panel"
                >
                  <Palette size={13} />
                  <span>Design</span>
                  {isRightCollapsed ? <PanelRightOpen size={13} /> : <PanelRightClose size={13} />}
                </button>
              </div>

              <div
                className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
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
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 text-[10px] font-bold">
                  <AlertTriangle size={11} />
                  <span>Out of Date</span>
                </span>
              )}
            </div>

            {/* Right: Master Actions Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Universal "Import from File" Button */}
              <UploadResumeButton
                variant="compact"
                label="Import File"
                defaultTargetRole={data.targetRole || ""}
                onSuccess={(result) => {
                  if (result?.resumeId) {
                    window.location.href = `/resume/builder?id=${result.resumeId}`;
                  }
                }}
              />

              {/* Undo / Redo */}
              <div className="flex items-center border border-[#EBDDD1] rounded-xl overflow-hidden bg-white shadow-2xs">
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
                className="inline-flex items-center gap-1 rounded-xl border border-[#EBDDD1] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#765F5D] hover:bg-[#FDF7F5] transition"
                title="Version History"
              >
                <History size={13} />
                <span className="hidden sm:inline">Versions</span>
              </button>

              {/* Duplicate */}
              <button
                type="button"
                onClick={handleDuplicate}
                className="inline-flex items-center gap-1 rounded-xl border border-[#EBDDD1] bg-white px-2 py-1.5 text-xs font-semibold text-[#765F5D] hover:bg-[#FDF7F5] transition"
                title="Duplicate Resume Version"
              >
                <Copy size={13} />
              </button>

              {/* Truth Check */}
              <button
                type="button"
                onClick={handleTruthCheck}
                className="inline-flex items-center gap-1 rounded-xl border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 transition"
              >
                <CheckCheck size={13} />
                <span className="hidden sm:inline">Truth Check</span>
              </button>

              {/* Full AI Analysis Trigger */}
              <button
                type="button"
                disabled={analyzingFull}
                onClick={handleAnalyzeFull}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#F6B51C] bg-[#FFF9ED] px-3 py-1.5 text-xs font-bold text-[#7A0F1F] hover:bg-[#FFF0D4] transition shadow-2xs disabled:opacity-50"
              >
                {analyzingFull ? (
                  <Loader2 size={13} className="animate-spin text-[#7A0F1F]" />
                ) : (
                  <Sparkles size={13} className="text-[#F6B51C]" />
                )}
                <span>{analyzingFull ? "Analyzing…" : "Analyze Full"}</span>
              </button>

              {/* Export PDF */}
              <button
                type="button"
                disabled={exportingPdf}
                onClick={handleExportPdf}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#7A0F1F] bg-[#FFF9ED] px-3 py-1.5 text-xs font-bold text-[#7A0F1F] hover:bg-[#FFF0D4] transition shadow-2xs disabled:opacity-50"
                title="Download ATS-Friendly Vector PDF"
              >
                {exportingPdf ? (
                  <Loader2 size={13} className="animate-spin text-[#7A0F1F]" />
                ) : (
                  <Download size={13} />
                )}
                <span>{exportingPdf ? "Exporting…" : "Export PDF"}</span>
              </button>

              {/* Print View */}
              <button
                type="button"
                onClick={handleOpenPrintView}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#EBDDD1] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#2B1810] hover:bg-[#FDF7F5] transition"
                title="Open Dedicated Clean Print View"
              >
                <Printer size={13} />
                <span className="hidden sm:inline">Print</span>
              </button>

              {/* Save */}
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave("Manual student save")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#7A0F1F] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#600C18] disabled:opacity-50 transition shadow-xs"
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
          <div className="mx-auto max-w-[1700px] px-4 pt-3 print:hidden">
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
        <div className="mx-auto max-w-[1700px] px-4 pt-3 print:hidden">
          <HowItWorksPanel toolKey="resume-builder" />
        </div>

        {/* ── 3. Main Workspace: Desktop 3-Zone Split View ─────────────── */}
        <div className="mx-auto max-w-[1700px] px-3 sm:px-4 pt-3">
          {/* Desktop 3-Zone View (Screens >= 1024px) */}
          <div className="hidden lg:flex items-start gap-4">
            {/* ZONE 1: Left - Sections & Content Panel */}
            <div
              className={`transition-all duration-200 shrink-0 ${
                isLeftCollapsed ? "w-12" : "w-[360px] xl:w-[390px]"
              }`}
            >
              {isLeftCollapsed ? (
                <div className="flex flex-col items-center py-4 bg-white rounded-2xl border border-[#EBDDD1] shadow-xs space-y-4">
                  <button
                    onClick={() => setIsLeftCollapsed(false)}
                    className="p-2 text-[#7A0F1F] hover:bg-[#FFF9ED] rounded-xl transition"
                    title="Expand Sections Editor"
                  >
                    <PanelLeftOpen size={18} />
                  </button>
                  <span className="[writing-mode:vertical-rl] text-xs font-bold text-stone-500 tracking-wider">
                    SECTIONS ({data.sections.length})
                  </span>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-[#EBDDD1] p-3 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#EBDDD1] pb-2">
                    <span className="font-heading text-xs font-bold text-[#2B1810]">
                      Sections &amp; Content ({data.sections.length})
                    </span>
                    <button
                      onClick={() => setIsLeftCollapsed(true)}
                      className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
                      title="Collapse Panel"
                    >
                      <PanelLeftClose size={15} />
                    </button>
                  </div>

                  {/* Optional Job Description Input Drawer */}
                  <div className="rounded-xl border border-[#EBDDD1] bg-white p-2.5 space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#765F5D]">
                        Target Job Description (Optional):
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
                      placeholder="Paste target JD to benchmark keywords and match requirements..."
                      className="w-full text-xs text-[#2B1810] rounded-lg border border-[#EBDDD1] p-2 focus:outline-hidden resize-none"
                    />
                  </div>

                  <SectionEditor
                    data={data}
                    onChangeData={handleDataChange}
                    onImproveBulletAction={handleImproveBulletAction}
                    activeSectionId={activeSectionId}
                    onSelectSection={(id) => {
                      setActiveSectionId(id);
                      const previewEl = document.getElementById(id);
                      if (previewEl) previewEl.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                    onScrollToSection={(secId) => {
                      const el = document.getElementById(secId);
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                  />
                </div>
              )}
            </div>

            {/* ZONE 2: Center - Live Paper Preview Canvas */}
            <div className="flex-1 min-w-0 flex flex-col items-center">
              {/* Center Floating Zoom & Tools Bar */}
              <div className="w-full max-w-[840px] mb-3 flex flex-wrap items-center justify-between gap-3 bg-white border border-[#EBDDD1] rounded-2xl px-4 py-2 shadow-xs text-xs">
                {/* Zoom Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(50, z - 10))}
                    className="p-1 rounded-lg border border-[#EBDDD1] text-stone-600 hover:bg-[#FDF7F5] transition"
                    title="Zoom Out"
                  >
                    <ZoomOut size={13} />
                  </button>
                  <select
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="rounded-lg border border-[#EBDDD1] px-2 py-1 text-xs font-mono font-semibold text-stone-700 bg-white"
                  >
                    <option value={50}>50%</option>
                    <option value={75}>75%</option>
                    <option value={90}>90%</option>
                    <option value={100}>100%</option>
                    <option value={125}>125%</option>
                    <option value={150}>150%</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(150, z + 10))}
                    className="p-1 rounded-lg border border-[#EBDDD1] text-stone-600 hover:bg-[#FDF7F5] transition"
                    title="Zoom In"
                  >
                    <ZoomIn size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom(100)}
                    className="px-2 py-1 text-[11px] font-semibold text-stone-500 hover:text-stone-900"
                  >
                    Reset
                  </button>
                </div>

                {/* Page Count & Fit to 1 Page Assistant */}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                    {data.style.templateId} &bull; {localReport.estimatedPageCount}{" "}
                    {localReport.estimatedPageCount === 1 ? "Page" : "Pages"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowFitPageModal(true)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#F6B51C] bg-[#FFF9ED] px-2.5 py-1 text-[11px] font-bold text-[#7A0F1F] hover:bg-[#FFF0D4] transition"
                  >
                    <Sparkles size={11} className="text-[#F6B51C]" />
                    <span>Fit to 1 Page</span>
                  </button>
                </div>

                {/* Before/After & JD Match */}
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

              {/* The Live Document Component with Scaled Paper Container */}
              <div className="w-full flex justify-center overflow-x-auto pb-12">
                <ResumePreview
                  data={data}
                  onSelectSection={(secId) => {
                    setActiveSectionId(secId);
                    setIsLeftCollapsed(false);
                  }}
                  activeSectionId={activeSectionId}
                  zoom={zoom}
                />
              </div>
            </div>

            {/* ZONE 3: Right - Design & Formatting Panel */}
            <div
              className={`transition-all duration-200 shrink-0 ${
                isRightCollapsed ? "w-12" : "w-[340px] xl:w-[370px]"
              }`}
            >
              {isRightCollapsed ? (
                <div className="flex flex-col items-center py-4 bg-white rounded-2xl border border-[#EBDDD1] shadow-xs space-y-4">
                  <button
                    onClick={() => setIsRightCollapsed(false)}
                    className="p-2 text-[#7A0F1F] hover:bg-[#FFF9ED] rounded-xl transition"
                    title="Expand Design & Formatting Panel"
                  >
                    <Palette size={18} />
                  </button>
                  <span className="[writing-mode:vertical-rl] text-xs font-bold text-stone-500 tracking-wider">
                    DESIGN &amp; STYLES
                  </span>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-[#EBDDD1] p-3 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#EBDDD1] pb-2">
                    <span className="font-heading text-xs font-bold text-[#2B1810]">
                      Design &amp; Formatting
                    </span>
                    <button
                      onClick={() => setIsRightCollapsed(true)}
                      className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
                      title="Collapse Panel"
                    >
                      <PanelRightClose size={15} />
                    </button>
                  </div>
                  <CustomizePanel
                    style={data.style}
                    onChangeStyle={(newStyle) => handleDataChange({ ...data, style: newStyle })}
                    onFitToOnePage={() => setShowFitPageModal(true)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Mobile View (Screens < 1024px) */}
          <div className="lg:hidden space-y-4">
            {/* Tab Selector Buttons */}
            <div className="flex rounded-xl bg-stone-200/60 p-1 text-xs font-bold text-stone-700">
              <button
                type="button"
                onClick={() => setMobileTab("edit")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${
                  mobileTab === "edit"
                    ? "bg-white text-[#7A0F1F] shadow-xs"
                    : "hover:text-[#2B1810]"
                }`}
              >
                <FileText size={14} />
                <span>Sections ({data.sections.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileTab("customize")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${
                  mobileTab === "customize"
                    ? "bg-white text-[#7A0F1F] shadow-xs"
                    : "hover:text-[#2B1810]"
                }`}
              >
                <Palette size={14} />
                <span>Design</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileTab("preview")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${
                  mobileTab === "preview"
                    ? "bg-white text-[#7A0F1F] shadow-xs"
                    : "hover:text-[#2B1810]"
                }`}
              >
                <Printer size={14} />
                <span>Preview</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileTab("ai_review")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${
                  mobileTab === "ai_review"
                    ? "bg-white text-[#7A0F1F] shadow-xs"
                    : "hover:text-[#2B1810]"
                }`}
              >
                <Sparkles size={14} className="text-[#F6B51C]" />
                <span>AI</span>
              </button>
            </div>

            {/* Mobile Tab 1: Section Editor */}
            {mobileTab === "edit" && (
              <div className="bg-white rounded-2xl border border-[#EBDDD1] p-3 shadow-xs">
                <SectionEditor
                  data={data}
                  onChangeData={handleDataChange}
                  onImproveBulletAction={handleImproveBulletAction}
                  activeSectionId={activeSectionId}
                  onSelectSection={(id) => setActiveSectionId(id)}
                />
              </div>
            )}

            {/* Mobile Tab 2: Customize */}
            {mobileTab === "customize" && (
              <div className="bg-white rounded-2xl border border-[#EBDDD1] p-3 shadow-xs">
                <CustomizePanel
                  style={data.style}
                  onChangeStyle={(newStyle) => handleDataChange({ ...data, style: newStyle })}
                  onFitToOnePage={() => setShowFitPageModal(true)}
                />
              </div>
            )}

            {/* Mobile Tab 3: Preview */}
            {mobileTab === "preview" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs px-2">
                  <span className="font-bold text-[#2B1810]">Mobile Live Preview</span>
                  <button
                    type="button"
                    onClick={() => setShowBeforeAfterModal(true)}
                    className="text-[#7A0F1F] font-semibold hover:underline"
                  >
                    Before / After
                  </button>
                </div>
                <div className="overflow-x-auto pb-8">
                  <ResumePreview
                    data={data}
                    onSelectSection={(secId) => {
                      setActiveSectionId(secId);
                      setMobileTab("edit");
                    }}
                    activeSectionId={activeSectionId}
                    zoom={75}
                  />
                </div>
              </div>
            )}

            {/* Mobile Tab 4: AI Review */}
            {mobileTab === "ai_review" && (
              <div className="bg-white rounded-2xl border border-[#EBDDD1] p-3 shadow-xs">
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
              </div>
            )}
          </div>
        </div>

        {/* ── Desktop Slide-Over AI Review Drawer ─────────────────────── */}
        {showAiDrawer && (
          <div className="fixed inset-0 z-40 flex justify-end bg-black/40 backdrop-blur-2xs">
            <div className="w-full max-w-xl bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-4 border-l border-[#EBDDD1] animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between border-b border-[#EBDDD1] pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#7A0F1F] text-[#F2B63D]">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-[#2B1810]">
                      Full-Resume AI Analysis
                    </h3>
                    <p className="text-xs text-[#765F5D]">
                      Benchmark suggestions grounded strictly in your Career Passport facts.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAiDrawer(false)}
                  className="rounded-lg p-1 text-stone-400 hover:text-stone-700"
                >
                  <X size={18} />
                </button>
              </div>

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
            </div>
          </div>
        )}

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
          onRevertBullet={handleRevertBullet}
        />

        {/* Fit to 1 Page Assistant Modal */}
        {showFitPageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-[#EBDDD1] space-y-4 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-[#EBDDD1] pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7A0F1F] text-[#F2B63D]">
                    <Sparkles size={14} />
                  </div>
                  <h4 className="font-heading text-sm font-bold text-[#2B1810]">
                    Fit to 1 Page Assistant
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFitPageModal(false)}
                  className="text-stone-400 hover:text-stone-700"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs text-[#765F5D] leading-relaxed">
                The assistant optimizes typography, margins, and whitespace to pull content that barely spills onto Page 2 back into a crisp single-page presentation without deleting any of your verified credentials.
              </p>

              <div className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs">
                <span className="font-bold text-[10px] uppercase tracking-wider text-stone-500">
                  Proposed Adjustments:
                </span>
                <div className="flex justify-between py-1 border-b border-stone-200">
                  <span className="text-stone-600">Margins:</span>
                  <span className="font-mono text-stone-900 font-bold">
                    {data.style.spacing.margins} &rarr; compact (8mm)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-200">
                  <span className="text-stone-600">Body & Heading Font:</span>
                  <span className="font-mono text-stone-900 font-bold">
                    {data.style.fontSizes.body}px / {data.style.fontSizes.headings}px &rarr; 9.5px / 12px
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-200">
                  <span className="text-stone-600">Section Spacing:</span>
                  <span className="font-mono text-stone-900 font-bold">
                    {data.style.spacing.sectionSpacing}px &rarr; 8px
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-200">
                  <span className="text-stone-600">Line Spacing:</span>
                  <span className="font-mono text-stone-900 font-bold">
                    {data.style.spacing.lineHeight} &rarr; 1.25
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-600">Estimated Length:</span>
                  <span className="font-mono font-bold text-emerald-800">
                    1 Single Page (Strict fit enforced on print & preview)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#EBDDD1] pt-3">
                <button
                  type="button"
                  onClick={() => setShowFitPageModal(false)}
                  className="rounded-xl border border-[#EBDDD1] bg-white px-3.5 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const updatedStyle: ResumeStyleConfig = {
                      ...data.style,
                      fontSizes: {
                        ...data.style.fontSizes,
                        name: Math.min(data.style.fontSizes.name, 20),
                        headings: Math.min(data.style.fontSizes.headings, 12),
                        body: Math.min(data.style.fontSizes.body, 9.5),
                      },
                      spacing: {
                        ...data.style.spacing,
                        margins: "compact",
                        sectionSpacing: 8,
                        lineHeight: 1.25,
                        bulletIndent: 12,
                      },
                      page: {
                        ...data.style.page,
                        fitToOnePage: true,
                      },
                    };
                    const updatedData: FullResumeData = {
                      ...data,
                      style: updatedStyle,
                    };
                    handleDataChange(updatedData);
                    await handleSave("Fit to 1 Page adjustments applied", updatedData);
                    setShowFitPageModal(false);
                  }}
                  className="rounded-xl bg-[#7A0F1F] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#600C18] shadow-xs"
                >
                  Apply Adjustments
                </button>
              </div>
            </div>
          </div>
        )}

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
