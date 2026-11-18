"use client";

// src/components/guidance/getting-started-checklist.tsx
// Persistent Getting Started Checklist Widget (Day 2 Section C3)
// Derived from real database records — no fake completion state.

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, ArrowRight, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  isComplete: boolean;
  route: string;
  actionText: string;
}

interface GettingStartedChecklistProps {
  items: ChecklistItem[];
  className?: string;
}

export function GettingStartedChecklist({
  items,
  className = "",
}: GettingStartedChecklistProps) {
  const [collapsed, setCollapsed] = useState(false);

  const completedCount = items.filter((i) => i.isComplete).length;
  const totalCount = items.length;
  const isAllComplete = completedCount === totalCount;
  const percent = Math.round((completedCount / totalCount) * 100);

  // If complete, start collapsed
  const shouldRenderDetails = !collapsed && (!isAllComplete || !collapsed);

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-[#EBDDD1] bg-white shadow-sm transition-all ${className}`}
    >
      {/* Header */}
      <div className="border-b border-[#EBDDD1]/60 bg-gradient-to-r from-[#FFF8F0] to-[#FFF2E2] px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F2B63D] text-[#4C0915] font-bold shadow-xs">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-sm font-bold text-[#2B1B1B]">
                  Getting Started Checklist
                </h3>
                <span className="rounded-full bg-[#7A0F1F] px-2 py-0.5 text-[10px] font-bold text-white">
                  {completedCount} of {totalCount} done
                </span>
              </div>
              <p className="mt-0.5 text-xs text-[#765F5D]">
                Complete these 8 milestones to unlock your full Career Readiness score.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand checklist" : "Collapse checklist"}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#765F5D] hover:bg-white/80 transition-colors"
          >
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3.5 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#EBDDD1]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#7A0F1F] to-[#F2B63D] transition-all duration-500 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-[#7A0F1F]">{percent}%</span>
        </div>
      </div>

      {/* Items list */}
      {shouldRenderDetails && (
        <div className="divide-y divide-[#EBDDD1]/50 p-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between gap-4 p-3 rounded-xl transition-colors ${
                item.isComplete ? "bg-emerald-50/40" : "hover:bg-[#FFF8F0]/60"
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 shrink-0">
                  {item.isComplete ? (
                    <CheckCircle2 size={18} className="text-emerald-600" />
                  ) : (
                    <Circle size={18} className="text-[#9A8580]" />
                  )}
                </div>
                <div className="min-w-0">
                  <p
                    className={`text-xs font-bold leading-tight ${
                      item.isComplete
                        ? "text-emerald-950 line-through decoration-emerald-600/40"
                        : "text-[#2B1B1B]"
                    }`}
                  >
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#765F5D] leading-snug">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                {item.isComplete ? (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 px-2.5 py-1 rounded-md">
                    Done
                  </span>
                ) : (
                  <Link
                    href={item.route}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#7A0F1F] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-[#4C0915] transition-colors"
                  >
                    <span>{item.actionText}</span>
                    <ArrowRight size={12} />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
