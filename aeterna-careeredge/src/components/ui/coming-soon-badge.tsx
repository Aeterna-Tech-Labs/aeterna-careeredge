"use client";

// src/components/ui/coming-soon-badge.tsx
// Accessible "Coming soon" badge using text + icon (never color alone), WCAG AA compliant.

import { Clock, Sparkles } from "lucide-react";

interface ComingSoonBadgeProps {
  label?: string;
  variant?: "subtle" | "brand" | "outline";
  className?: string;
  icon?: "clock" | "sparkles";
}

export function ComingSoonBadge({
  label = "Coming soon",
  variant = "subtle",
  className = "",
  icon = "clock",
}: ComingSoonBadgeProps) {
  const IconComponent = icon === "sparkles" ? Sparkles : Clock;

  const variantStyles = {
    subtle: "bg-stone-100 text-[#4C0915] border border-stone-300 font-semibold",
    brand: "bg-[#FFF9ED] text-[#7A0F1F] border border-[#F2B63D]/60 font-bold",
    outline: "bg-transparent text-stone-700 border border-stone-400 font-medium",
  };

  return (
    <span
      role="status"
      aria-label={`${label}: This feature is currently in development and not yet available.`}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] tracking-wide transition-colors ${variantStyles[variant]} ${className}`}
    >
      <IconComponent size={11} className="shrink-0 text-[#7A0F1F]" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
