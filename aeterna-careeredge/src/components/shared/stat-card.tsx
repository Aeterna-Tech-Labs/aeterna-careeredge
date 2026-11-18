"use client";

// src/components/shared/stat-card.tsx
// Consistent key metric card with icon, label, real numeric/status value, and empty guidance.

import { type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  badge?: ReactNode;
  href?: string;
  emptyStateAction?: {
    label: string;
    href: string;
  };
  highlight?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  badge,
  href,
  emptyStateAction,
  highlight = false,
  className = "",
}: StatCardProps) {
  const isZeroOrEmpty = value === 0 || value === "0" || value === "" || value === null || value === undefined;

  const content = (
    <div
      className={`relative flex flex-col justify-between rounded-2xl border p-4 sm:p-5 transition-all ${
        highlight
          ? "border-[#F2B63D] bg-gradient-to-br from-[#FFF9ED] to-white shadow-xs"
          : "border-[#EBDDD1] bg-white hover:border-[#7A0F1F]/40 shadow-2xs"
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[#765F5D] truncate">{label}</span>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-xl shrink-0 ${
            highlight ? "bg-[#7A0F1F] text-[#F2B63D]" : "bg-[#FFF9ED] text-[#7A0F1F] border border-[#EBDDD1]"
          }`}
        >
          <Icon size={16} aria-hidden="true" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#2B1B1B]">
          {value}
        </span>
        {badge}
      </div>

      {subtext && (
        <p className="mt-1 text-[11px] text-[#765F5D] leading-tight truncate">
          {subtext}
        </p>
      )}

      {isZeroOrEmpty && emptyStateAction && (
        <div className="mt-3 pt-2.5 border-t border-[#EBDDD1]/60">
          <Link
            href={emptyStateAction.href}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7A0F1F] hover:text-[#4C0915] transition"
          >
            <span>{emptyStateAction.label}</span>
            <ArrowUpRight size={11} />
          </Link>
        </div>
      )}
    </div>
  );

  if (href && !isZeroOrEmpty) {
    return (
      <Link href={href} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A0F1F] rounded-2xl">
        {content}
      </Link>
    );
  }

  return content;
}
