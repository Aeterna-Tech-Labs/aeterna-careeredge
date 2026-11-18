"use client";

// src/components/passport/certification-modal.tsx
// Modal for adding or editing student certifications and credentials

import React, { useState } from "react";
import { X, Save, AlertCircle, ShieldCheck } from "lucide-react";

export interface CertificationItem {
  id?: string;
  name: string;
  title?: string;
  issuingOrg: string;
  issuingOrganization?: string;
  issueDate?: string | null;
  rawIssueDate?: string;
  credentialUrl?: string | null;
}

interface CertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (saved: CertificationItem, score: number) => void;
  initialData?: CertificationItem | null;
}

export function CertificationModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: CertificationModalProps) {
  const isEditing = Boolean(initialData?.id);

  const [name, setName] = useState(
    initialData?.name || initialData?.title || ""
  );
  const [issuingOrg, setIssuingOrg] = useState(
    initialData?.issuingOrg || initialData?.issuingOrganization || ""
  );
  const [issueDate, setIssueDate] = useState(initialData?.rawIssueDate || "");
  const [credentialUrl, setCredentialUrl] = useState(
    initialData?.credentialUrl || ""
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !issuingOrg.trim()) {
      setError("Certification title and issuing organization are required.");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      id: initialData?.id,
      name: name.trim(),
      issuingOrg: issuingOrg.trim(),
      issueDate: issueDate || null,
      credentialUrl: credentialUrl.trim() || null,
    };

    try {
      const res = await fetch("/api/passport/certifications", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save certification.");
      }

      onSuccess(data.certification, data.score);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="certification-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF9ED] text-[#7A0F1F]">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 id="certification-modal-title" className="text-lg font-bold text-gray-900">
                {isEditing ? "Edit Certification" : "Add Certification"}
              </h2>
              <p className="text-xs text-gray-500">
                Add verifiable certificates and credentials.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1 text-gray-400 hover:bg-stone-100 hover:text-gray-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700">
              Certificate Title *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AWS Certified Cloud Practitioner / Tally Prime"
              required
              className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-xs focus:border-[#7A0F1F] focus:outline-none focus:ring-1 focus:ring-[#7A0F1F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">
              Issuing Organization *
            </label>
            <input
              type="text"
              value={issuingOrg}
              onChange={(e) => setIssuingOrg(e.target.value)}
              placeholder="e.g. Amazon Web Services, Coursera, ICAI"
              required
              className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-xs focus:border-[#7A0F1F] focus:outline-none focus:ring-1 focus:ring-[#7A0F1F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">
              Issue Date
            </label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-xs focus:border-[#7A0F1F] focus:outline-none focus:ring-1 focus:ring-[#7A0F1F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">
              Verification / Credential URL
            </label>
            <input
              type="url"
              value={credentialUrl}
              onChange={(e) => setCredentialUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-xs focus:border-[#7A0F1F] focus:outline-none focus:ring-1 focus:ring-[#7A0F1F]"
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-stone-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-stone-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-stone-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#7A0F1F] px-5 py-2 text-xs font-bold text-white hover:bg-[#4C0915] disabled:opacity-50 shadow-xs transition"
            >
              <Save size={14} />
              <span>{saving ? "Saving…" : isEditing ? "Update Certificate" : "Add Certificate"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
