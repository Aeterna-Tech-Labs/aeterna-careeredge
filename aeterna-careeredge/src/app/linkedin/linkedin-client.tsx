"use client";

// src/app/linkedin/linkedin-client.tsx
// LinkedIn Profile Intelligence & Optimization Workspace (Day 2 Part 4)

import { useState, useEffect } from "react";
import Link from "next/link";
import { StudentLayout } from "@/components/layouts/student-layout";
import { HowItWorksPanel } from "@/components/guidance/how-it-works-panel";
import {
  Network,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  FileText,
  Upload,
  ChevronRight,
  Loader2,
  X,
  Info,
} from "lucide-react";
import type { LinkedInSectionType, OptimizedSectionResult } from "@/lib/linkedin/optimizer";
import type { LinkedInAnalysisReport } from "@/lib/linkedin/analysis";
import type { ParsedLinkedInProfile } from "@/lib/linkedin/parser";

interface LinkedInClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    academicDomain: string;
    preferredJobRole?: string;
    course?: string;
    institution?: string;
  };
  initialProfile: {
    id: string;
    profileUrl?: string | null;
    linkedInSubId?: string | null;
    linkedInName?: string | null;
    linkedInEmail?: string | null;
    linkedInPictureUrl?: string | null;
    connectedAt?: Date | null;
    headlineSuggestion?: string | null;
    summarySuggestion?: string | null;
    optimizationScore?: number | null;
    importedRawJson?: string | null;
    sectionsJson?: string | null;
  } | null;
  skills: Array<{ id: string; name: string; category?: string | null }>;
  experiencesCount: number;
  isOidcConfigured: boolean;
  errorParam?: string;
  connectedParam?: string;
  simulatedParam?: string;
}

export function LinkedInClient({
  user,
  initialProfile,
  skills: _skills,
  experiencesCount: _experiencesCount,
  isOidcConfigured,
  errorParam,
  connectedParam,
  simulatedParam,
}: LinkedInClientProps) {
  const [activeSection, setActiveSection] = useState<LinkedInSectionType>("HEADLINE");
  const [profile, setProfile] = useState(initialProfile);
  const [optimizing, setOptimizing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<{ type: "error" | "success"; message: string } | null>(() => {
    if (errorParam) return { type: "error", message: decodeURIComponent(errorParam) };
    if (connectedParam) {
      return {
        type: "success",
        message: `LinkedIn account successfully linked${simulatedParam ? " (Dev Simulation Mode)" : ""}!`,
      };
    }
    return null;
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importMode, setImportMode] = useState<"TEXT" | "PDF">("TEXT");
  const [rawText, setRawText] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [stagedImport, setStagedImport] = useState<ParsedLinkedInProfile | null>(() => {
    if (initialProfile?.importedRawJson) {
      try {
        return JSON.parse(initialProfile.importedRawJson);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [savedSections, setSavedSections] = useState<Record<string, OptimizedSectionResult>>(() => {
    if (initialProfile?.sectionsJson) {
      try {
        return JSON.parse(initialProfile.sectionsJson);
      } catch {
        return {};
      }
    }
    return {};
  });

  const [analysisReport, setAnalysisReport] = useState<LinkedInAnalysisReport | null>(null);

  // Load Analysis Report on mount
  useEffect(() => {
    fetch("/api/linkedin/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.analysisReport) setAnalysisReport(data.analysisReport);
        if (data.savedSections) setSavedSections(data.savedSections);
      })
      .catch(() => {});
  }, []);

  async function handleOptimize(sectionType: LinkedInSectionType) {
    setOptimizing(true);
    try {
      const currentDraft =
        sectionType === "HEADLINE"
          ? profile?.headlineSuggestion || stagedImport?.headline || ""
          : sectionType === "ABOUT"
          ? profile?.summarySuggestion || stagedImport?.about || ""
          : "";

      const res = await fetch("/api/linkedin/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionType, currentText: currentDraft }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Optimization failed.");

      setSavedSections((prev) => ({
        ...prev,
        [sectionType]: data.result,
      }));

      // Update local profile state
      if (sectionType === "HEADLINE") {
        setProfile((prev) => (prev ? { ...prev, headlineSuggestion: data.result.improvedText } : null));
      } else if (sectionType === "ABOUT") {
        setProfile((prev) => (prev ? { ...prev, summarySuggestion: data.result.improvedText } : null));
      }
    } catch (err: unknown) {
      alert((err as Error).message || "Optimization request failed.");
    } finally {
      setOptimizing(false);
    }
  }

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      const res = await fetch("/api/auth/oauth/linkedin", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to disconnect.");
      }
      setProfile((prev) => (prev ? { ...prev, linkedInSubId: null, linkedInName: null } : null));
      setBannerNotice({ type: "success", message: "LinkedIn account disconnected successfully." });
    } catch (err: unknown) {
      setBannerNotice({ type: "error", message: (err as Error).message || "Failed to disconnect." });
    } finally {
      setDisconnecting(false);
    }
  }

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  }

  async function handleTextImport(e: React.FormEvent) {
    e.preventDefault();
    if (!rawText.trim()) return;
    setImporting(true);
    setImportError(null);

    try {
      const res = await fetch("/api/linkedin/import-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed.");

      setStagedImport(data.parsed);
      setShowImportModal(false);
      setRawText("");
    } catch (err: unknown) {
      setImportError((err as Error).message || "Import failed.");
    } finally {
      setImporting(false);
    }
  }

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/linkedin/import-pdf", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "PDF import failed.");

      setStagedImport(data.parsed);
      setShowImportModal(false);
    } catch (err: unknown) {
      setImportError((err as Error).message || "PDF import failed.");
    } finally {
      setImporting(false);
    }
  }

  const currentResult: OptimizedSectionResult | undefined = savedSections[activeSection];

  return (
    <StudentLayout
      userName={user.name}
      studentDomain={user.academicDomain}
      targetRole={user.preferredJobRole}
    >
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7A0F1F]">
              <Network size={16} />
              <span>Professional Identity Suite</span>
            </div>
            <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-[#2B1810] sm:text-3xl">
              LinkedIn Profile Intelligence
            </h1>
            <p className="mt-1 text-sm text-[#765F5D]">
              Domain-specific headline, summary, and experience optimization. Compare before & after drafts with 1-click copying.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#EBDDD1] bg-white px-4 py-2 text-xs font-semibold text-[#2B1810] hover:bg-[#FDF7F5] shadow-xs transition-colors"
            >
              <Upload size={14} className="text-[#7A0F1F]" />
              <span>Import LinkedIn Profile</span>
            </button>

            {profile?.linkedInSubId ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 border border-emerald-200">
                  <CheckCircle2 size={14} />
                  <span>OIDC Connected ({profile.linkedInName || "LinkedIn"})</span>
                </span>
                <button
                  type="button"
                  disabled={disconnecting}
                  onClick={handleDisconnect}
                  className="rounded-xl border border-[#EBDDD1] bg-white px-3 py-2 text-xs font-semibold text-[#765F5D] hover:bg-rose-50 hover:text-rose-700 transition-colors disabled:opacity-50"
                >
                  {disconnecting ? "Disconnecting..." : "Disconnect"}
                </button>
              </div>
            ) : isOidcConfigured ? (
              <div className="flex items-center gap-2">
                <a
                  href="/api/auth/oauth/linkedin"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A66C2] px-4 py-2 text-xs font-semibold text-white hover:bg-[#084e96] transition-colors"
                >
                  <Network size={14} />
                  <span>Connect with LinkedIn</span>
                </a>
                <a
                  href="/api/auth/oauth/linkedin?dev=true"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#EBDDD1] bg-white px-3 py-2 text-xs font-semibold text-[#765F5D] hover:bg-[#FDF7F5] transition-colors"
                  title="Simulate LinkedIn connection locally without external OAuth"
                >
                  <span>Dev Simulation</span>
                </a>
              </div>
            ) : (
              <a
                href="/api/auth/oauth/linkedin?dev=true"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A66C2] px-4 py-2 text-xs font-semibold text-white hover:bg-[#084e96] transition-colors"
                title="Connect with simulated LinkedIn identity for local testing"
              >
                <Network size={14} />
                <span>Connect LinkedIn (Dev Sim)</span>
              </a>
            )}
          </div>
        </div>

        {/* Banner Notice */}
        {bannerNotice && (
          <div
            className={`rounded-xl border p-4 flex items-center justify-between text-xs ${
              bannerNotice.type === "error"
                ? "border-rose-200 bg-rose-50 text-rose-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-900"
            }`}
          >
            <div className="flex items-center gap-2">
              {bannerNotice.type === "error" ? (
                <Info size={16} className="text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
              )}
              <span>{bannerNotice.message}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setBannerNotice(null);
                window.history.replaceState({}, "", "/linkedin");
              }}
              className="text-stone-500 hover:text-stone-800 font-bold ml-4"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Guidance Panel */}
        <HowItWorksPanel toolKey="linkedin-check" />

        {/* OIDC Disclosure Banner */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 flex items-start gap-3 text-xs text-blue-900">
          <Info size={18} className="text-blue-700 shrink-0 mt-0.5" />
          <p>
            <strong>Official LinkedIn OIDC Policy:</strong> Standard LinkedIn connection grants identity verification. Complete historical education, skills, and work details are imported securely via <strong>LinkedIn PDF export</strong> or <strong>direct text paste</strong> without sharing LinkedIn credentials.
          </p>
        </div>

        {/* Readiness Overview Cards */}
        {analysisReport && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-[#EBDDD1] bg-white p-5 shadow-sm">
              <span className="text-xs font-semibold text-[#765F5D] uppercase tracking-wider">
                Readiness Score
              </span>
              <p className="mt-2 text-3xl font-bold text-[#7A0F1F]">
                {analysisReport.overallScore}%
              </p>
              <p className="mt-1 text-[11px] text-[#765F5D]">CareerEdge domain benchmark</p>
            </div>

            <div className="rounded-2xl border border-[#EBDDD1] bg-white p-5 shadow-sm">
              <span className="text-xs font-semibold text-[#765F5D] uppercase tracking-wider">
                Proof Ratio
              </span>
              <p className="mt-2 text-3xl font-bold text-emerald-800">
                {analysisReport.evidenceBackedRatio}%
              </p>
              <p className="mt-1 text-[11px] text-[#765F5D]">Skills backed by Proof Bank</p>
            </div>

            <div className="rounded-2xl border border-[#EBDDD1] bg-white p-5 shadow-sm">
              <span className="text-xs font-semibold text-[#765F5D] uppercase tracking-wider">
                Headline Status
              </span>
              <p className="mt-2 text-lg font-bold text-[#2B1810]">
                {analysisReport.sectionScores.find((s) => s.section === "Headline")?.status.replace("_", " ")}
              </p>
              <p className="mt-1 text-[11px] text-[#765F5D]">Target role alignment</p>
            </div>

            <div className="rounded-2xl border border-[#EBDDD1] bg-white p-5 shadow-sm">
              <span className="text-xs font-semibold text-[#765F5D] uppercase tracking-wider">
                About Narrative
              </span>
              <p className="mt-2 text-lg font-bold text-[#2B1810]">
                {analysisReport.sectionScores.find((s) => s.section === "About")?.status.replace("_", " ")}
              </p>
              <p className="mt-1 text-[11px] text-[#765F5D]">3-paragraph structure</p>
            </div>
          </div>
        )}

        {/* Section Optimization Studio */}
        <div className="rounded-2xl border border-[#EBDDD1] bg-white p-6 shadow-sm space-y-6">
          {/* Section Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-[#EBDDD1] pb-4">
            {[
              { id: "HEADLINE", label: "Headline Optimization" },
              { id: "ABOUT", label: "About Narrative" },
              { id: "FEATURED", label: "Featured Artifacts" },
              { id: "EXPERIENCE", label: "Experience Presentation" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id as LinkedInSectionType)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                  activeSection === tab.id
                    ? "bg-[#7A0F1F] text-white"
                    : "bg-[#FCF9F6] text-[#765F5D] hover:bg-[#FDF7F5]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Studio Content */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#2B1810]">
                  {activeSection === "HEADLINE" && "Optimized Professional Headline"}
                  {activeSection === "ABOUT" && "3-Paragraph Narrative Summary"}
                  {activeSection === "FEATURED" && "High-Proof Featured Section Recommendations"}
                  {activeSection === "EXPERIENCE" && "Role Description & Impact Formula"}
                </h3>
                <p className="text-xs text-[#765F5D]">
                  Crafted strictly for {user.academicDomain} targeting {user.preferredJobRole || "entry-level roles"}.
                </p>
              </div>

              <button
                type="button"
                disabled={optimizing}
                onClick={() => handleOptimize(activeSection)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#7A0F1F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#600C18] disabled:opacity-50 transition-colors"
              >
                {optimizing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                <span>Generate Improved Copy</span>
              </button>
            </div>

            {currentResult ? (
              <div className="space-y-4">
                {/* Before / After Comparison */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Original / Current Draft
                    </span>
                    <p className="text-xs text-stone-700 whitespace-pre-wrap leading-relaxed min-h-[80px]">
                      {currentResult.originalText || "No previous draft provided."}
                    </p>
                  </div>

                  <div className="rounded-xl border border-emerald-300 bg-emerald-50/40 p-4 space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                        CareerEdge Optimized Copy
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(currentResult.improvedText, activeSection)}
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 transition-colors"
                      >
                        {copiedKey === activeSection ? (
                          <>
                            <Check size={12} className="text-emerald-700" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs font-medium text-emerald-950 whitespace-pre-wrap leading-relaxed min-h-[80px]">
                      {currentResult.improvedText}
                    </p>
                  </div>
                </div>

                {/* Rationale & Keyword Badges */}
                <div className="rounded-xl border border-[#EBDDD1] bg-[#FCF9F6] p-4 space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-[#2B1810]">
                      Why This Improves Your Visibility:
                    </h4>
                    <p className="mt-1 text-xs text-[#765F5D] leading-relaxed">
                      {currentResult.whyBetter}
                    </p>
                  </div>

                  {currentResult.keywordsTargeted.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-bold text-[#2B1810]">Targeted Keywords:</span>
                      {currentResult.keywordsTargeted.map((kw, idx) => (
                        <span
                          key={idx}
                          className="rounded-md bg-white border border-[#EBDDD1] px-2 py-0.5 text-[10px] font-semibold text-[#7A0F1F]"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#EBDDD1] bg-[#FCF9F6] p-8 text-center">
                <Sparkles size={24} className="text-[#7A0F1F] mx-auto" />
                <h4 className="mt-2 text-xs font-bold text-[#2B1810]">
                  No Optimization Generated Yet
                </h4>
                <p className="mt-1 text-xs text-[#765F5D]">
                  Click &quot;Generate Improved Copy&quot; to synthesize an evidence-backed draft tailored to your target role.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Staged Import Review Banner (if data imported) */}
        {stagedImport && (
          <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                  Staged LinkedIn Import ({stagedImport.provenance})
                </span>
                <h3 className="mt-1 font-heading text-sm font-bold text-[#2B1810]">
                  Imported Profile Summary
                </h3>
              </div>
              <Link
                href="/passport"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#7A0F1F] hover:underline"
              >
                <span>View Career Passport</span>
                <ChevronRight size={12} />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
              <div className="rounded-xl border border-[#EBDDD1] p-3">
                <span className="font-bold text-[#765F5D]">Imported Headline</span>
                <p className="mt-1 text-[#2B1810] font-medium">{stagedImport.headline || "None"}</p>
              </div>
              <div className="rounded-xl border border-[#EBDDD1] p-3">
                <span className="font-bold text-[#765F5D]">Detected Skills ({stagedImport.skills.length})</span>
                <p className="mt-1 text-[#2B1810] font-medium truncate">
                  {stagedImport.skills.slice(0, 4).join(", ") || "None"}
                </p>
              </div>
              <div className="rounded-xl border border-[#EBDDD1] p-3">
                <span className="font-bold text-[#765F5D]">Work Records</span>
                <p className="mt-1 text-[#2B1810] font-medium">
                  {stagedImport.experiences.length} positions recorded
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between border-b border-[#EBDDD1] pb-3">
                <div className="flex items-center gap-2">
                  <Upload size={18} className="text-[#7A0F1F]" />
                  <h3 className="font-heading text-lg font-bold text-[#2B1810]">
                    Import LinkedIn Profile
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="rounded-lg p-1 text-[#765F5D] hover:bg-[#FDF7F5]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 flex gap-2 border-b border-[#EBDDD1] pb-3">
                <button
                  type="button"
                  onClick={() => setImportMode("TEXT")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                    importMode === "TEXT"
                      ? "bg-[#7A0F1F] text-white"
                      : "bg-[#FCF9F6] text-[#765F5D]"
                  }`}
                >
                  Paste Profile Text
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode("PDF")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                    importMode === "PDF"
                      ? "bg-[#7A0F1F] text-white"
                      : "bg-[#FCF9F6] text-[#765F5D]"
                  }`}
                >
                  Upload Profile PDF
                </button>
              </div>

              {importError && (
                <div className="mt-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200">
                  {importError}
                </div>
              )}

              {importMode === "TEXT" ? (
                <form onSubmit={handleTextImport} className="mt-4 space-y-3">
                  <label className="block text-xs font-bold text-[#2B1810]">
                    Paste Copied Profile Text
                  </label>
                  <textarea
                    rows={8}
                    required
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Copy all text from your LinkedIn profile or 'Save to PDF' text and paste here..."
                    className="w-full rounded-xl border border-[#EBDDD1] p-3 text-xs text-[#2B1810] focus:border-[#7A0F1F] focus:outline-hidden"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowImportModal(false)}
                      className="rounded-xl border border-[#EBDDD1] px-4 py-2 text-xs font-semibold text-[#765F5D]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={importing}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#7A0F1F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#600C18] disabled:opacity-50"
                    >
                      {importing && <Loader2 size={12} className="animate-spin" />}
                      <span>Parse Profile</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-4 space-y-4">
                  <div className="rounded-xl border-2 border-dashed border-[#EBDDD1] p-6 text-center">
                    <FileText size={28} className="text-[#7A0F1F] mx-auto" />
                    <p className="mt-2 text-xs font-bold text-[#2B1810]">
                      Upload Official LinkedIn PDF Export
                    </p>
                    <p className="mt-1 text-[11px] text-[#765F5D]">
                      On LinkedIn, click More → Save to PDF. Max size: 5 MB.
                    </p>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handlePdfUpload}
                      disabled={importing}
                      className="mt-3 block w-full text-xs text-stone-500 file:mr-2 file:rounded-lg file:border-0 file:bg-[#7A0F1F] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                    />
                  </div>
                  {importing && (
                    <div className="flex items-center justify-center gap-2 text-xs text-[#7A0F1F] font-bold">
                      <Loader2 size={14} className="animate-spin" />
                      <span>Parsing PDF text streams...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
