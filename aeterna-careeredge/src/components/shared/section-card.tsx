"use client";

// src/components/shared/section-card.tsx
// Consistent section card container respecting brand palette and spacing hierarchy.

import { type ReactNode } from "react";

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className = "",
  headerClassName = "",
  contentClassName = "",
}: SectionCardProps) {
  return (
    <section
      className={`rounded-2xl border border-border bg-surface shadow-card transition-all duration-200 overflow-hidden min-w-0 w-full ${className}`}
    >
      {(title || action) && (
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border px-4 sm:px-6 py-3.5 sm:py-4.5 ${headerClassName}`}
        >
          <div>
            {title && (
              <h2 className="font-heading text-base font-extrabold text-foreground tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-secondary-text leading-normal">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={`p-4 sm:p-6 min-w-0 ${contentClassName}`}>{children}</div>
    </section>
  );
}
