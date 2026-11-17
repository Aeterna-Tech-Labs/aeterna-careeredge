"use client";

// src/app/evidence-vault/evidence-vault-client.tsx
// Evidence Vault ("Proof Bank") Interactive Client (Day 2 Addendum Section B1)

import { useState } from "react";
import { StudentLayout } from "@/components/layouts/student-layout";
import { HowItWorksPanel } from "@/components/guidance/how-it-works-panel";
import {
  ShieldCheck,
  Plus,
  Trash2,
  ExternalLink,
  FileText,
  CheckCircle2,
  Award,
  Layers,
  X,
  Loader2,
} from "lucide-react";

interface EvidenceVaultClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    academicDomain: string;
    preferredJobRole?: string;
  };
  initialSkills: Array<{ id: string; name: string; category?: string | null }>;
  initialDocuments: Array<{
    id: string;
    originalFileName: string;
    fileSizeBytes: number;
    mimeType: string;
    category?: string;
  }>;
  initialEvidence: Array<{
    id: string;
    title: string;
    type: string;
    relatedSkill?: string | null;
    date?: Date | string | null;
    issuer?: string | null;
    url?: string | null;
    provenance: string;
    notes?: string | null;
    storedDocument?: {
      id: string;
      originalFileName: string;
      fileSizeBytes: number;
    } | null;
    createdAt: Date;
  }>;
}

const EVIDENCE_TYPES = [
  { value: "CERTIFICATE", label: "Certificate / Credential" },
  { value: "PROJECT_LINK", label: "Project Link / Demo" },
  { value: "GITHUB_REPO", label: "GitHub / Code Repository" },
  { value: "INTERNSHIP_LETTER", label: "Internship / Relieving Letter" },
  { value: "CLINICAL_LOG", label: "Clinical Rotation / Ward Log (Healthcare)" },
  { value: "LESSON_PLAN", label: "Lesson Plan / Curriculum (Teaching)" },
  { value: "MOOT_COURT", label: "Moot Court Record / Memorial (Law)" },
  { value: "MARK_SHEET", label: "Mark Sheet / Transcript" },
  { value: "PORTFOLIO", label: "Design Portfolio / Case Study" },
  { value: "AWARD", label: "Academic / Competition Award" },
  { value: "OTHER", label: "Other Verifiable Artifact" },
];

export function EvidenceVaultClient({
  user,
  initialSkills,
  initialDocuments,
  initialEvidence,
}: EvidenceVaultClientProps) {
  const [evidenceList, setEvidenceList] = useState(initialEvidence);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [type, setType] = useState("CERTIFICATE");
  const [relatedSkill, setRelatedSkill] = useState("");
  const [issuer, setIssuer] = useState("");
  const [date, setDate] = useState("");
  const [url, setUrl] = useState("");
  const [storedDocId, setStoredDocId] = useState("");
  const [notes, setNotes] = useState("");

  const backedSkillsCount = new Set(
    evidenceList.filter((e) => e.relatedSkill).map((e) => e.relatedSkill!.toLowerCase().trim())
  ).size;

  async function handleAddEvidence(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          type,
          relatedSkill: relatedSkill.trim() || undefined,
          issuer: issuer.trim() || undefined,
          date: date.trim() || undefined,
          url: url.trim() || undefined,
          storedDocId: storedDocId || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add artifact.");
      }

      setEvidenceList((prev) => [data.item, ...prev]);
      setShowAddModal(false);
      setSuccessMsg("Artifact added to your Evidence Vault!");
      // Reset form
      setTitle("");
      setType("CERTIFICATE");
      setRelatedSkill("");
      setIssuer("");
      setDate("");
      setUrl("");
      setStoredDocId("");
      setNotes("");
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to remove this evidence artifact?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/evidence/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not delete artifact.");
      setEvidenceList((prev) => prev.filter((item) => item.id !== id));
      setSuccessMsg("Artifact removed.");
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Failed to delete artifact.");
    } finally {
      setDeletingId(null);
    }
  }

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
              <ShieldCheck size={16} />
              <span>Proof Bank & Artifact Ledger</span>
            </div>
            <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-[#2B1810] sm:text-3xl">
              Evidence Vault
            </h1>
            <p className="mt-1 text-sm text-[#765F5D]">
              Back every claim on your resume and LinkedIn with verifiable certificates, projects, and records.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7A0F1F] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#600C18] transition-colors"
          >
            <Plus size={16} />
            <span>Add Evidence Artifact</span>
          </button>
        </div>

        {/* Guidance Panel */}
        <HowItWorksPanel toolKey="evidence-vault" />

        {/* Notifications */}
        {errorMsg && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800">
            {successMsg}
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#EBDDD1] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#765F5D] uppercase tracking-wider">
                Total Artifacts
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FDF7F5] text-[#7A0F1F]">
                <Layers size={18} />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-[#2B1810]">{evidenceList.length}</p>
            <p className="mt-1 text-xs text-[#765F5D]">Verified documents, repositories & letters</p>
          </div>

          <div className="rounded-2xl border border-[#EBDDD1] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#765F5D] uppercase tracking-wider">
                Supported Skills
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-[#2B1810]">{backedSkillsCount}</p>
            <p className="mt-1 text-xs text-[#765F5D]">Skills linked directly to evidence items</p>
          </div>

          <div className="rounded-2xl border border-[#EBDDD1] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#765F5D] uppercase tracking-wider">
                Proof Integrity
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <Award size={18} />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-[#2B1810]">
              {initialSkills.length === 0 ? "100%" : `${Math.min(100, Math.round((backedSkillsCount / Math.max(1, initialSkills.length)) * 100))}%`}
            </p>
            <p className="mt-1 text-xs text-[#765F5D]">Ratio of verified skills in your passport</p>
          </div>
        </div>

        {/* Artifacts List */}
        <div className="rounded-2xl border border-[#EBDDD1] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#EBDDD1] bg-[#FCF9F6] px-6 py-4">
            <h2 className="text-sm font-bold text-[#2B1810]">Your Evidence Ledger</h2>
            <p className="text-xs text-[#765F5D]">Artifacts stored securely in your private vault</p>
          </div>

          {evidenceList.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FDF7F5] text-[#7A0F1F]">
                <ShieldCheck size={24} />
              </div>
              <h3 className="mt-3 text-base font-bold text-[#2B1810]">No Evidence Added Yet</h3>
              <p className="mx-auto mt-1 max-w-md text-xs text-[#765F5D]">
                Adding certificates, project links, or clinical logs gives your resume 100% honesty score and unlocks employer trust.
              </p>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#7A0F1F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#600C18]"
              >
                <Plus size={14} />
                <span>Add Your First Artifact</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#EBDDD1]">
              {evidenceList.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-[#FCF9F6] transition-colors">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-heading text-sm font-bold text-[#2B1810]">
                        {item.title}
                      </span>
                      <span className="rounded-md bg-[#FDF7F5] px-2 py-0.5 text-[10px] font-semibold text-[#7A0F1F]">
                        {item.type.replace(/_/g, " ")}
                      </span>
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                        {item.provenance}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#765F5D]">
                      {item.relatedSkill && (
                        <span>
                          Skill: <strong className="text-[#2B1810]">{item.relatedSkill}</strong>
                        </span>
                      )}
                      {item.issuer && <span>Issuer: {item.issuer}</span>}
                      {item.date && (
                        <span>
                          Date: {item.date instanceof Date ? item.date.toISOString().slice(0, 7) : String(item.date)}
                        </span>
                      )}
                    </div>

                    {item.notes && <p className="text-xs text-[#8A7573] italic">{item.notes}</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-[#EBDDD1] bg-white px-2.5 py-1 text-xs font-medium text-[#2B1810] hover:bg-[#FDF7F5] transition-colors"
                      >
                        <ExternalLink size={12} className="text-[#7A0F1F]" />
                        <span>Link</span>
                      </a>
                    )}

                    {item.storedDocument && (
                      <a
                        href={`/api/documents/${item.storedDocument.id}/download`}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#EBDDD1] bg-white px-2.5 py-1 text-xs font-medium text-[#2B1810] hover:bg-[#FDF7F5] transition-colors"
                      >
                        <FileText size={12} className="text-emerald-700" />
                        <span>Doc</span>
                      </a>
                    )}

                    <button
                      type="button"
                      disabled={deletingId === item.id}
                      onClick={() => handleDelete(item.id)}
                      className="rounded-lg p-1.5 text-[#8A7573] hover:bg-rose-50 hover:text-rose-700 transition-colors"
                      aria-label="Delete artifact"
                    >
                      {deletingId === item.id ? (
                        <Loader2 size={16} className="animate-spin text-rose-700" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between border-b border-[#EBDDD1] pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#7A0F1F]" />
                  <h3 className="font-heading text-lg font-bold text-[#2B1810]">
                    Add Evidence Artifact
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg p-1 text-[#765F5D] hover:bg-[#FDF7F5]"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddEvidence} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#2B1810]">
                    Artifact Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. AWS Certified Cloud Practitioner / ICU Ward Log"
                    className="mt-1 w-full rounded-xl border border-[#EBDDD1] px-3.5 py-2 text-xs text-[#2B1810] focus:border-[#7A0F1F] focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-[#2B1810]">Type *</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[#EBDDD1] bg-white px-3 py-2 text-xs text-[#2B1810] focus:border-[#7A0F1F] focus:outline-hidden"
                    >
                      {EVIDENCE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2B1810]">
                      Related Skill / Competency
                    </label>
                    <input
                      type="text"
                      list="passportSkills"
                      value={relatedSkill}
                      onChange={(e) => setRelatedSkill(e.target.value)}
                      placeholder="e.g. Patient Care, Python, Tax"
                      className="mt-1 w-full rounded-xl border border-[#EBDDD1] px-3 py-2 text-xs text-[#2B1810] focus:border-[#7A0F1F] focus:outline-hidden"
                    />
                    <datalist id="passportSkills">
                      {initialSkills.map((s) => (
                        <option key={s.id} value={s.name} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-[#2B1810]">Issuer / Org</label>
                    <input
                      type="text"
                      value={issuer}
                      onChange={(e) => setIssuer(e.target.value)}
                      placeholder="e.g. Amazon Web Services / Apollo Hospital"
                      className="mt-1 w-full rounded-xl border border-[#EBDDD1] px-3 py-2 text-xs text-[#2B1810] focus:border-[#7A0F1F] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2B1810]">Date / Year</label>
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="e.g. May 2024"
                      className="mt-1 w-full rounded-xl border border-[#EBDDD1] px-3 py-2 text-xs text-[#2B1810] focus:border-[#7A0F1F] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2B1810]">
                    Artifact URL (GitHub, Demo, Credential)
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="mt-1 w-full rounded-xl border border-[#EBDDD1] px-3.5 py-2 text-xs text-[#2B1810] focus:border-[#7A0F1F] focus:outline-hidden"
                  />
                </div>

                {initialDocuments.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-[#2B1810]">
                      Link to Uploaded Private Document (Optional)
                    </label>
                    <select
                      value={storedDocId}
                      onChange={(e) => setStoredDocId(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[#EBDDD1] bg-white px-3 py-2 text-xs text-[#2B1810] focus:border-[#7A0F1F] focus:outline-hidden"
                    >
                      <option value="">-- No private file attached --</option>
                      {initialDocuments.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.originalFileName} ({(doc.fileSizeBytes / 1024).toFixed(0)} KB)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#2B1810]">Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional context or verification detail..."
                    className="mt-1 w-full rounded-xl border border-[#EBDDD1] px-3 py-2 text-xs text-[#2B1810] focus:border-[#7A0F1F] focus:outline-hidden"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[#EBDDD1]">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-xl border border-[#EBDDD1] px-4 py-2 text-xs font-semibold text-[#765F5D] hover:bg-[#FDF7F5]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#7A0F1F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#600C18] disabled:opacity-50"
                  >
                    {submitting && <Loader2 size={12} className="animate-spin" />}
                    <span>Save to Vault</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
