"use client";

// src/components/guidance/empty-state.tsx
// Universal Empty State Guidance Component (Day 2 Section C5)
// Rule: Every empty state must state what this is, what to do, and offer one clear button. Never a blank screen.

import Link from "next/link";
import { type LucideIcon, ArrowRight } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
  actionDisabled?: boolean;
  secondaryNote?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onActionClick,
  actionDisabled = false,
  secondaryNote,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#EBDDD1] bg-white/60 p-8 text-center sm:p-12 ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FCE9E8] text-[#7A0F1F] shadow-xs mb-4">
        <Icon size={26} strokeWidth={2} />
      </div>

      <h3 className="font-heading text-base font-bold text-[#2B1B1B] sm:text-lg">
        {title}
      </h3>

      <p className="mt-1.5 max-w-md text-xs sm:text-sm leading-relaxed text-[#765F5D]">
        {description}
      </p>

      {actionLabel && (
        <div className="mt-6">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-2 rounded-xl bg-[#7A0F1F] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm shadow-[#7A0F1F]/20 hover:bg-[#4C0915] transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>{actionLabel}</span>
              <ArrowRight size={15} />
            </Link>
          ) : (
            <button
              type="button"
              onClick={onActionClick}
              disabled={actionDisabled}
              className="inline-flex items-center gap-2 rounded-xl bg-[#7A0F1F] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm shadow-[#7A0F1F]/20 hover:bg-[#4C0915] transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
            >
              <span>{actionLabel}</span>
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      )}

      {secondaryNote && (
        <p className="mt-3 text-[11px] text-[#9A8580] italic">
          {secondaryNote}
        </p>
      )}
    </div>
  );
}
