// src/config/tour-constants.ts
// Stable data-tour selectors for product tour targets.

export const TOUR_SELECTORS = {
  NEXT_BEST_ACTION: '[data-tour="next-best-action"]',
  CHECKLIST: '[data-tour="checklist"]',
  QUICK_ACTIONS: '[data-tour="quick-actions"]',
  METRICS: '[data-tour="metrics"]',
  ALL_TOOLS: '[data-tour="all-tools"]',
  CAREER_GUIDE: '[data-tour="career-guide"]',
  SIDEBAR: '[data-tour="sidebar"]',
} as const;

export const TOUR_DATA_ATTRS = {
  NEXT_BEST_ACTION: "next-best-action",
  CHECKLIST: "checklist",
  QUICK_ACTIONS: "quick-actions",
  METRICS: "metrics",
  ALL_TOOLS: "all-tools",
  CAREER_GUIDE: "career-guide",
  SIDEBAR: "sidebar",
} as const;
