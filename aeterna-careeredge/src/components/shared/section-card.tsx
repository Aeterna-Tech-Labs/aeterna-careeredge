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
      className={`rounded-2xl border border-[#EBDDD1] bg-white shadow-xs transition-shadow ${className}`}
    >
      {(title || action) && (
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EBDDD1]/60 px-5 py-4 ${headerClassName}`}
        >
          <div>
            {title && (
              <h2 className="font-heading text-sm sm:text-base font-bold text-[#2B1B1B]">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-[#765F5D] leading-normal">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={`p-5 ${contentClassName}`}>{children}</div>
    </section>
  );
}
