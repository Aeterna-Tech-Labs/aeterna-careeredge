// src/app/resume/builder/components/before-after-modal.tsx
// Before / After Whole Resume Comparison Modal (Part 1.4 & Part 6)

import React from "react";
import type { FullResumeData } from "@/lib/resume/types";
import { ResumePreview } from "./resume-preview";
import { Sliders } from "lucide-react";

interface BeforeAfterModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalData: FullResumeData;
  currentData: FullResumeData;
}

export function BeforeAfterModal({
  isOpen,
  onClose,
  originalData,
  currentData,
}: BeforeAfterModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#EBDDD1] px-6 py-4 bg-[#FDFBF9]">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-[#7A0F1F]" />
            <h3 className="font-heading text-base font-bold text-[#2B1810]">
              Whole Resume Before & After Comparison
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-stone-400 hover:text-stone-700 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Side by Side Preview Scrollable View */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Original */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2">
                <span className="font-bold text-xs uppercase tracking-wider text-stone-500">
                  Before: Original Baseline
                </span>
                <span className="text-[10px] bg-stone-200 px-2 py-0.5 rounded font-mono">
                  Template: {originalData.style.templateId}
                </span>
              </div>
              <div className="scale-95 origin-top pointer-events-none">
                <ResumePreview data={originalData} />
              </div>
            </div>

            {/* Current */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2">
                <span className="font-bold text-xs uppercase tracking-wider text-[#7A0F1F]">
                  After: Customized & AI-Optimized
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-200">
                  Active Document
                </span>
              </div>
              <div className="scale-95 origin-top pointer-events-none">
                <ResumePreview data={currentData} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#EBDDD1] px-6 py-3 bg-white flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#7A0F1F] px-5 py-2 text-xs font-bold text-white hover:bg-[#600C18]"
          >
            Back to Editor
          </button>
        </div>
      </div>
    </div>
  );
}
