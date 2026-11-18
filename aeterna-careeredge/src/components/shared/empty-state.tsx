"use client";

// src/components/shared/empty-state.tsx
// Consistent empty state component with guidance and one clear primary action button.

import { type ReactNode } from "react";
import Link from "next/link";
import { type LucideIcon, Sparkles } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryAction?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-[#EBDDD1] bg-[#FFFBF9]/80 p-8 text-center space-y-4 ${className}`}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF9ED] text-[#7A0F1F] border border-[#EBDDD1] shadow-2xs">
        <Icon size={22} aria-hidden="true" />
      </div>

      <div className="space-y-1.5 max-w-sm mx-auto">
        <h3 className="font-heading text-sm sm:text-base font-bold text-[#2B1B1B]">
          {title}
        </h3>
        <p className="text-xs text-[#765F5D] leading-relaxed">
          {description}
        </p>
      </div>

      {(actionLabel || secondaryAction) && (
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          {actionHref && actionLabel && (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#7A0F1F] px-4 py-2 text-xs font-bold text-white hover:bg-[#4C0915] transition shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A0F1F]"
            >
              <span>{actionLabel}</span>
            </Link>
          )}

          {!actionHref && onAction && actionLabel && (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#7A0F1F] px-4 py-2 text-xs font-bold text-white hover:bg-[#4C0915] transition shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A0F1F]"
            >
              <span>{actionLabel}</span>
            </button>
          )}

          {secondaryAction}
        </div>
      )}
    </div>
  );
}
