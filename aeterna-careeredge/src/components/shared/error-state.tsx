"use client";

// src/components/shared/error-state.tsx
// Consistent error state component with plain-language explanation and retry button.

import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We could not load this section. Your existing data is safe. Please try again.",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`rounded-2xl border border-rose-200 bg-rose-50/70 p-6 text-center space-y-3 ${className}`}
    >
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
        <AlertTriangle size={20} aria-hidden="true" />
      </div>

      <div className="space-y-1 max-w-sm mx-auto">
        <h3 className="font-heading text-sm font-bold text-rose-900">
          {title}
        </h3>
        <p className="text-xs text-rose-700 leading-normal">
          {message}
        </p>
      </div>

      {onRetry && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-white px-4 py-1.5 text-xs font-bold text-rose-800 hover:bg-rose-100 transition shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
          >
            <RefreshCw size={12} />
            <span>Try Again</span>
          </button>
        </div>
      )}
    </div>
  );
}
