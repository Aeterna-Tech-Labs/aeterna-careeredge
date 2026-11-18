"use client";

// src/components/ui/coming-soon-card.tsx
// Consistent card component for upcoming features displayed in dashboard grids and tool overviews.

import Link from "next/link";
import { ComingSoonBadge } from "./coming-soon-badge";
import { ArrowUpRight, BookOpen, CalendarDays, Sparkles } from "lucide-react";
import type { FeatureDefinition } from "@/config/features";

interface ComingSoonCardProps {
  feature: FeatureDefinition;
  className?: string;
}

export function ComingSoonCard({ feature, className = "" }: ComingSoonCardProps) {
  const getIcon = () => {
    switch (feature.iconName) {
      case "BookOpen":
        return <BookOpen size={18} className="text-[#7A0F1F]" />;
      case "CalendarDays":
        return <CalendarDays size={18} className="text-[#7A0F1F]" />;
      default:
        return <Sparkles size={18} className="text-[#7A0F1F]" />;
    }
  };

  return (
    <div
      data-feature-status="coming-soon"
      className={`group relative flex flex-col justify-between rounded-2xl border border-dashed border-stone-300 bg-stone-50/70 p-5 transition-all hover:border-[#7A0F1F]/40 hover:bg-[#FFFBF9] ${className}`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-stone-200 shadow-2xs group-hover:border-[#F2B63D]/60 transition-colors">
            {getIcon()}
          </div>
          <ComingSoonBadge label="Coming soon" variant="subtle" />
        </div>

        <div>
          <h4 className="font-heading text-sm font-bold text-[#2B1B1B] group-hover:text-[#7A0F1F] transition-colors">
            {feature.name}
          </h4>
          <p className="mt-1 text-xs text-stone-600 leading-relaxed">
            {feature.shortDescription}
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-stone-200/60 mt-4 flex items-center justify-between text-xs font-semibold text-stone-600">
        <span className="text-[11px] text-stone-500">{feature.expectedNote || "In design"}</span>
        <Link
          href={feature.route}
          className="inline-flex items-center gap-1 text-[#7A0F1F] hover:text-[#4C0915] font-bold transition-colors"
          aria-label={`Learn more about ${feature.name} (Coming soon)`}
        >
          <span>Preview</span>
          <ArrowUpRight size={13} />
        </Link>
      </div>
    </div>
  );
}
