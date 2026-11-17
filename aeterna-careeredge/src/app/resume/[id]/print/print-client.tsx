"use client";

// src/app/resume/[id]/print/print-client.tsx
// Dedicated Clean Print & PDF Preview Client (Zero Website UI)

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ResumePreview } from "@/app/resume/builder/components/resume-preview";
import type { FullResumeData } from "@/lib/resume/types";
import { Printer, Download, ArrowLeft, Check, Loader2 } from "lucide-react";

interface PrintClientProps {
  resumeId: string;
  data: FullResumeData;
  autoPrint?: boolean;
  isPdfExport?: boolean;
  pageSize?: "A4" | "Letter";
}

export function PrintClient({
  resumeId,
  data,
  autoPrint = false,
  isPdfExport = false,
  pageSize = "A4",
}: PrintClientProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  async function handleDownload() {
    setDownloading(true);
    setDownloadSuccess(false);
    try {
      const res = await fetch(`/api/resumes/${resumeId}/export-pdf?pageSize=${pageSize}`);
      if (!res.ok) throw new Error("Failed to download PDF.");

      const blob = await res.blob();
      const contentDisposition = res.headers.get("Content-Disposition");
      let filename = "Resume.pdf";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to export PDF. You can also use the 'Print / Save as PDF' button.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className={isPdfExport ? "bg-white p-0 m-0" : "min-h-screen bg-stone-100 print:bg-white print:p-0"}>
      {/* ── Dynamic Page Sizing ────────────────────────────────────────────── */}
      <style>{`
        @page {
          size: ${pageSize === "Letter" ? "letter portrait" : "A4 portrait"};
          margin: 10mm;
        }
      `}</style>

      {/* ── Screen-Only Control Toolbar (Strictly hidden when printing or headless export) ──────── */}
      {!isPdfExport && (
        <div className="sticky top-0 z-50 border-b border-[#EBDDD1] bg-white/95 px-4 py-2.5 backdrop-blur-md shadow-xs print:hidden">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href={`/resume/builder?id=${resumeId}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#EBDDD1] bg-white px-3 py-1.5 text-xs font-semibold text-[#765F5D] hover:bg-stone-50 transition"
              >
                <ArrowLeft size={13} />
                <span>Back to Editor</span>
              </Link>
              <div className="hidden sm:block border-l border-stone-200 pl-3">
                <span className="text-xs font-bold text-[#2B1810]">
                  {data.contactInfo.name} — {data.targetRole || "Resume"}
                </span>
                <span className="ml-2 text-[10px] text-stone-500 font-mono">
                  [Print & ATS Export Mode • {pageSize}]
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#7A0F1F] bg-[#FFF9ED] px-3.5 py-1.5 text-xs font-bold text-[#7A0F1F] hover:bg-[#FFF0D4] transition disabled:opacity-50"
              >
                {downloading ? (
                  <>
                    <Loader2 size={13} className="animate-spin text-[#7A0F1F]" />
                    <span>Generating PDF...</span>
                  </>
                ) : downloadSuccess ? (
                  <>
                    <Check size={13} className="text-emerald-600" />
                    <span className="text-emerald-700">Downloaded!</span>
                  </>
                ) : (
                  <>
                    <Download size={13} />
                    <span>Download PDF</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#7A0F1F] px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#600C18] transition"
              >
                <Printer size={13} />
                <span>Print / Save as PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Resume Document Body (Zero Website UI) ───────────────────────── */}
      <main className={isPdfExport ? "p-0 m-0" : "py-6 sm:py-10 print:py-0 print:px-0"}>
        <div className={isPdfExport ? "w-full p-0 m-0 bg-white" : "mx-auto max-w-[820px] print:max-w-none print:w-full bg-white print:bg-transparent shadow-md print:shadow-none rounded-xl print:rounded-none p-8 print:p-0"}>
          <ResumePreview data={data} isPrintMode={true} />
        </div>
      </main>
    </div>
  );
}
