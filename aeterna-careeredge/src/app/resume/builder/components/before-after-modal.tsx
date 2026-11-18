// src/app/resume/builder/components/before-after-modal.tsx
// Before / After Whole Resume Comparison Modal (Flow-Style Interaction)
// Side-by-Side Visual View + Granular Changes Diff & Granular Revert Controls

import React, { useState, useMemo } from "react";
import type { FullResumeData } from "@/lib/resume/types";
import { runLocalResumeChecks } from "@/lib/resume/local-checks";
import { ResumePreview } from "./resume-preview";
import {
  SlidersHorizontal,
  CheckCircle2,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Layers,
  ShieldCheck,
  X,
} from "lucide-react";

interface BeforeAfterModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalData: FullResumeData;
  currentData: FullResumeData;
  onRevertBullet?: (sectionId: string, entryId: string, bulletId: string, originalText: string) => void;
}

interface BulletDiffItem {
  sectionId: string;
  sectionTitle: string;
  entryId: string;
  entryTitle: string;
  bulletId: string;
  originalText: string;
  currentText: string;
  provenance: string;
}

export function BeforeAfterModal({
  isOpen,
  onClose,
  originalData,
  currentData,
  onRevertBullet,
}: BeforeAfterModalProps) {
  const [activeTab, setActiveTab] = useState<"visual" | "diff">("visual");

  // Health scores
  const originalReport = useMemo(() => runLocalResumeChecks(originalData, []), [originalData]);
  const currentReport = useMemo(() => runLocalResumeChecks(currentData, []), [currentData]);

  const scoreDiff = currentReport.overallHealthScore - originalReport.overallHealthScore;

  // Extract all modified bullets between original and current
  const modifiedBullets = useMemo(() => {
    const list: BulletDiffItem[] = [];

    // Map original bullets for quick lookup
    const origBulletMap = new Map<string, string>();
    originalData.sections.forEach((sec) => {
      sec.entries.forEach((ent) => {
        ent.bullets.forEach((b) => {
          origBulletMap.set(b.id, b.text);
        });
      });
    });

    currentData.sections.forEach((sec) => {
      sec.entries.forEach((ent) => {
        ent.bullets.forEach((b) => {
          const originalText = origBulletMap.get(b.id);
          if (originalText && originalText !== b.text) {
            list.push({
              sectionId: sec.id,
              sectionTitle: sec.customTitle,
              entryId: ent.id,
              entryTitle: ent.title || "Entry",
              bulletId: b.id,
              originalText,
              currentText: b.text,
              provenance: b.provenance,
            });
          } else if (!originalText && b.provenance === "AI_SUGGESTION") {
            list.push({
              sectionId: sec.id,
              sectionTitle: sec.customTitle,
              entryId: ent.id,
              entryTitle: ent.title || "Entry",
              bulletId: b.id,
              originalText: "(New optimized bullet)",
              currentText: b.text,
              provenance: b.provenance,
            });
          }
        });
      });
    });

    return list;
  }, [originalData, currentData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-xs">
      <div className="w-full max-w-6xl max-h-[94vh] flex flex-col rounded-3xl bg-white shadow-2xl overflow-hidden border border-[#EBDDD1]">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-[#EBDDD1] px-6 py-4 bg-[#FDFBF9] gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7A0F1F] text-[#F2B63D] shadow-xs">
              <SlidersHorizontal size={18} />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-[#2B1810]">
                Whole Resume Before &amp; After Comparison
              </h3>
              <p className="text-xs text-[#765F5D]">
                Compare your baseline draft against your customized ATS-optimized version.
              </p>
            </div>
          </div>

          {/* Metric Comparison Badges */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs">
              <span className="text-stone-500 font-semibold">Baseline:</span>
              <span className="font-bold text-stone-700">{originalReport.overallHealthScore}%</span>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs">
              <span className="text-emerald-700 font-semibold">Optimized:</span>
              <span className="font-bold text-emerald-900">{currentReport.overallHealthScore}%</span>
              {scoreDiff > 0 && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  <TrendingUp size={10} />
                  <span>+{scoreDiff}%</span>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex border-b border-[#EBDDD1] px-6 bg-white gap-3 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("visual")}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === "visual"
                ? "border-[#7A0F1F] text-[#7A0F1F]"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            <Layers size={14} />
            <span>Side-by-Side Paper Preview</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("diff")}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === "diff"
                ? "border-[#7A0F1F] text-[#7A0F1F]"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            <Sparkles size={14} className="text-[#F2B63D]" />
            <span>Highlights of Changes ({modifiedBullets.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-100">
          {activeTab === "visual" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Baseline Original */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-stone-500">
                    Before: Original Baseline
                  </span>
                  <span className="text-[10px] bg-stone-200 px-2 py-0.5 rounded font-mono text-stone-700">
                    Template: {originalData.style.templateId}
                  </span>
                </div>
                <div className="scale-90 sm:scale-95 origin-top pointer-events-none">
                  <ResumePreview data={originalData} isPrintMode={false} />
                </div>
              </div>

              {/* Customized & Improved */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-[#7A0F1F]">
                    After: Customized &amp; AI-Optimized
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-200">
                    Active Document
                  </span>
                </div>
                <div className="scale-90 sm:scale-95 origin-top pointer-events-none">
                  <ResumePreview data={currentData} isPrintMode={false} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "diff" && (
            <div className="space-y-4 max-w-4xl mx-auto">
              {/* Ethics Notice */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-950 flex items-start gap-3 shadow-2xs">
                <ShieldCheck size={18} className="text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Strict Truth &amp; Provenance Guarantee</p>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    CareerEdge never fabricates degrees, companies, certifications, or false metrics.
                    Every modification below clarifies wording, strengthens active verbs, or formats existing student records for maximum ATS keyword indexing.
                  </p>
                </div>
              </div>

              {modifiedBullets.length === 0 ? (
                <div className="rounded-2xl border border-[#EBDDD1] bg-white p-12 text-center space-y-3">
                  <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-sm text-[#2B1810]">
                    Current Document Matches Original Baseline
                  </h4>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    Use &ldquo;AI Review&rdquo; or click &ldquo;AI Rewrite&rdquo; on any bullet point to strengthen your phrasing and see live before-and-after differences here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {modifiedBullets.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-[#EBDDD1] bg-white p-4 space-y-2.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#7A0F1F]">
                          {item.sectionTitle} &bull; {item.entryTitle}
                        </span>
                        {onRevertBullet && item.originalText !== "(New optimized bullet)" && (
                          <button
                            type="button"
                            onClick={() =>
                              onRevertBullet(
                                item.sectionId,
                                item.entryId,
                                item.bulletId,
                                item.originalText
                              )
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-[11px] font-semibold text-stone-600 hover:bg-stone-100 transition"
                          >
                            <RotateCcw size={11} />
                            <span>Revert this bullet</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {/* Original */}
                        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 space-y-1">
                          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
                            Before (Original):
                          </span>
                          <p className="text-stone-700 leading-relaxed font-sans line-through decoration-rose-400">
                            {item.originalText}
                          </p>
                        </div>

                        {/* Current */}
                        <div className="rounded-xl border border-emerald-300 bg-emerald-50/60 p-3 space-y-1">
                          <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block">
                            After (Optimized):
                          </span>
                          <p className="text-stone-900 font-medium leading-relaxed font-sans">
                            {item.currentText}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#EBDDD1] px-6 py-3.5 bg-white flex items-center justify-between">
          <span className="text-xs text-stone-500 font-mono">
            {modifiedBullets.length} {modifiedBullets.length === 1 ? "bullet modified" : "bullets modified"}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#7A0F1F] px-5 py-2 text-xs font-bold text-white hover:bg-[#600C18] transition shadow-xs"
          >
            Done &amp; Return to Editor
          </button>
        </div>
      </div>
    </div>
  );
}
