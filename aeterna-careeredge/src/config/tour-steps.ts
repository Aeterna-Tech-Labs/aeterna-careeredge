// src/config/tour-steps.ts
// Plain-language Product Tour step definitions for first-time onboarding.
// Kept in one central content file for future Hindi/Marathi i18n support.

import { TOUR_SELECTORS } from "./tour-constants";

export interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string; // CSS selector to spotlight; if missing or not found, renders centered modal
  placement?: "top" | "bottom" | "left" | "right" | "center";
  primaryButtonLabel?: string;
  isTerminal?: boolean;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to CareerEdge",
    description: "Your ethical, verifiable digital career passport. Let us show you around in 1 minute.",
    placement: "center",
    primaryButtonLabel: "Start Tour",
  },
  {
    id: "next-best-action",
    title: "Your Next Best Action",
    description: "CareerEdge calculates the single most important step for you to take next based on your real records.",
    targetSelector: TOUR_SELECTORS.NEXT_BEST_ACTION,
    placement: "bottom",
  },
  {
    id: "checklist",
    title: "Getting Started Checklist",
    description: "Follow these 8 structured milestones to complete your profile and maximize your placement readiness.",
    targetSelector: TOUR_SELECTORS.CHECKLIST,
    placement: "bottom",
  },
  {
    id: "quick-actions",
    title: "Quick Action Hub",
    description: "Jump straight into uploading an existing resume, building from your Career Passport, checking ATS keywords, or uploading evidence certificates.",
    targetSelector: TOUR_SELECTORS.QUICK_ACTIONS,
    placement: "top",
  },
  {
    id: "key-metrics",
    title: "Real Verified Metrics",
    description: "See your actual resume count, verified evidence records, and applications. Zero fake numbers.",
    targetSelector: TOUR_SELECTORS.METRICS,
    placement: "top",
  },
  {
    id: "all-tools",
    title: "Full Tool Registry",
    description: "Explore all available tools grouped by purpose, plus upcoming features marked clearly as Coming soon.",
    targetSelector: TOUR_SELECTORS.ALL_TOOLS,
    placement: "top",
  },
  {
    id: "career-guide",
    title: "AI Career Guide & Help",
    description: "Need help? Every tool includes a 'How this works' guide, and you can chat with the Career Guide anytime.",
    targetSelector: TOUR_SELECTORS.CAREER_GUIDE,
    placement: "top",
  },
  {
    id: "finish",
    title: "You are All Set!",
    description: "Start by completing your Career Passport to unlock targeted resumes and real job matches.",
    placement: "center",
    primaryButtonLabel: "Go to Career Passport",
    isTerminal: true,
  },
];
