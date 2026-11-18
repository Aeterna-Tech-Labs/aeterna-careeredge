"use client";

// src/components/shared/skeleton-card.tsx
// Accessible skeleton loader replacing ad-hoc spinners.

export function SkeletonCard({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading content…"
      className={`rounded-2xl border border-[#EBDDD1] bg-white p-5 animate-pulse space-y-3.5 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="h-4 w-1/3 rounded-lg bg-stone-200" />
        <div className="h-6 w-6 rounded-lg bg-stone-100" />
      </div>
      <div className="h-6 w-1/2 rounded-lg bg-stone-200" />
      <div className="space-y-2 pt-1">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 rounded-md bg-stone-150"
            style={{ width: `${85 - i * 15}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonRow({ count = 3 }: { count?: number }) {
  return (
    <div className="divide-y divide-[#EBDDD1]/60" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 animate-pulse">
          <div className="flex items-center gap-3 w-2/3">
            <div className="h-9 w-9 rounded-xl bg-stone-200 shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 w-1/2 rounded bg-stone-200" />
              <div className="h-2.5 w-3/4 rounded bg-stone-150" />
            </div>
          </div>
          <div className="h-7 w-20 rounded-lg bg-stone-150 shrink-0" />
        </div>
      ))}
    </div>
  );
}
