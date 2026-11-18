"use client";

// src/components/tour/product-tour.tsx
// Accessible, anchored Product Tour with spotlight cutouts (no blur), floating-ui positioning,
// mobile bottom sheet, database persistence, keyboard navigation, and full WCAG AA compliance.

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  computePosition,
  offset,
  flip,
  shift,
  arrow,
  autoUpdate,
  type Placement,
} from "@floating-ui/dom";
import { TOUR_STEPS, type TourStep } from "@/config/tour-steps";
import { Sparkles, X, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

interface ProductTourProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
  radius: number;
}

function findTargetElement(selector?: string): HTMLElement | null {
  if (!selector) return null;
  // Try exact selector first
  let el = document.querySelector<HTMLElement>(selector);
  if (el) return el;

  // If selector is a data-tour selector, also try id fallback
  const dataTourMatch = selector.match(/data-tour=["']([^"']+)["']/);
  if (dataTourMatch) {
    const tourName = dataTourMatch[1];
    el = document.getElementById(`tour-${tourName}`);
    if (el) return el;
  }

  // If selector is an id selector, also try data-tour fallback
  const idMatch = selector.match(/#tour-([a-zA-Z0-9_-]+)/);
  if (idMatch) {
    const tourName = idMatch[1];
    el = document.querySelector<HTMLElement>(`[data-tour="${tourName}"]`);
    if (el) return el;
  }

  return null;
}

function isElementVisible(el: HTMLElement): boolean {
  if (!el.isConnected) return false;
  const style = window.getComputedStyle(el);
  if (
    style.display === "none" ||
    style.visibility === "hidden" ||
    parseFloat(style.opacity || "1") === 0
  ) {
    return false;
  }
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

export function ProductTour({ forceOpen = false, onClose }: ProductTourProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [floatingStyle, setFloatingStyle] = useState<React.CSSProperties>({});
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
  const [resolvedPlacement, setResolvedPlacement] = useState<string>("bottom");
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const targetElRef = useRef<HTMLElement | null>(null);
  const lastActiveElement = useRef<HTMLElement | null>(null);

  const totalSteps = TOUR_STEPS.length;
  const currentStep: TourStep = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === totalSteps - 1;
  const isCenteredStep = !currentStep.targetSelector || currentStep.placement === "center";

  // Check mobile viewport and motion preference
  useEffect(() => {
    function checkMedia() {
      setIsMobile(window.innerWidth < 640);
      setPrefersReducedMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    }
    checkMedia();
    window.addEventListener("resize", checkMedia);
    return () => window.removeEventListener("resize", checkMedia);
  }, []);

  // Persist dismissal / completion to database
  const persistTourState = useCallback(async () => {
    try {
      await fetch("/api/guide/seen-panel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ panelId: "product-tour", dismissed: true }),
      });
    } catch {
      // Ignore network errors
    }
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    persistTourState();
    if (lastActiveElement.current) {
      lastActiveElement.current.focus();
    }
    if (onClose) onClose();
  }, [persistTourState, onClose]);

  const handleFinish = useCallback(() => {
    handleClose();
    if (currentStep.isTerminal) {
      router.push("/passport");
    }
  }, [handleClose, currentStep.isTerminal, router]);

  const handleNext = useCallback(() => {
    if (isLast) {
      handleFinish();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [isLast, handleFinish]);

  const handleBack = useCallback(() => {
    if (!isFirst) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [isFirst]);

  // Initial database status check on mount
  useEffect(() => {
    async function checkTourStatus() {
      try {
        const res = await fetch("/api/guide/seen-panel?panelId=product-tour");
        if (res.ok) {
          const json = await res.json();
          if (!json.seen && !json.dismissed) {
            lastActiveElement.current = document.activeElement as HTMLElement;
            setCurrentStepIndex(0);
            setIsOpen(true);
          }
        }
      } catch {
        // Fail quietly on network hiccup
      }
    }

    checkTourStatus();
  }, []);

  // Respond to forceOpen prop (Replay button)
  useEffect(() => {
    if (forceOpen) {
      lastActiveElement.current = document.activeElement as HTMLElement;
      requestAnimationFrame(() => {
        setCurrentStepIndex(0);
        setIsOpen(true);
      });
    }
  }, [forceOpen]);

  // Update position via @floating-ui/dom
  const updateTooltipPosition = useCallback(
    (targetEl: HTMLElement, tooltipEl: HTMLElement) => {
      if (isMobile || isCenteredStep) return;

      const stepPlacement = currentStep.placement;
      const preferredPlacement: Placement =
        stepPlacement && stepPlacement !== "center" ? stepPlacement : "bottom";

      computePosition(targetEl, tooltipEl, {
        strategy: "fixed",
        placement: preferredPlacement,
        middleware: [
          offset(14),
          flip({
            fallbackPlacements: ["top", "bottom"],
            padding: 12,
          }),
          shift({
            mainAxis: true,
            crossAxis: true,
            padding: 12,
          }),
          arrowRef.current ? arrow({ element: arrowRef.current, padding: 8 }) : null,
        ].filter(Boolean),
      }).then(({ x, y, placement, middlewareData }) => {
        setFloatingStyle({
          position: "fixed",
          top: `${y}px`,
          left: `${x}px`,
        });
        setResolvedPlacement(placement);

        if (arrowRef.current && middlewareData.arrow) {
          const { x: arrowX, y: arrowY } = middlewareData.arrow;
          const side = placement.split("-")[0] as "top" | "right" | "bottom" | "left";
          const staticSideMap: Record<"top" | "right" | "bottom" | "left", "top" | "right" | "bottom" | "left"> = {
            top: "bottom",
            right: "left",
            bottom: "top",
            left: "right",
          };
          const staticSide = staticSideMap[side] || "top";

          setArrowStyle({
            position: "absolute",
            left: arrowX != null ? `${arrowX}px` : "",
            top: arrowY != null ? `${arrowY}px` : "",
            right: "",
            bottom: "",
            [staticSide]: "-6px",
          });
        }
      });
    },
    [isMobile, isCenteredStep, currentStep.placement]
  );

  // Respond to window resize by keeping target centered
  useEffect(() => {
    const handleResize = () => {
      if (targetElRef.current) {
        targetElRef.current.scrollIntoView({
          behavior: "auto",
          block: window.innerWidth < 640 ? "start" : "center",
          inline: "nearest",
        });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Measure and scroll target into view when step changes
  useEffect(() => {
    if (!isOpen) return;

    if (isCenteredStep) {
      const raf = requestAnimationFrame(() => {
        setSpotlightRect(null);
      });
      targetElRef.current = null;
      return () => cancelAnimationFrame(raf);
    }

    const targetEl = findTargetElement(currentStep.targetSelector);

    // If target is missing, hidden or zero-size, skip gracefully without crashing
    if (!targetEl || !isElementVisible(targetEl)) {
      console.warn(
        `[ProductTour] Target for step "${currentStep.id}" (${currentStep.targetSelector}) not found or hidden. Gracefully skipping.`
      );
      const raf = requestAnimationFrame(() => {
        if (currentStepIndex < totalSteps - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          handleFinish();
        }
      });
      return () => cancelAnimationFrame(raf);
    }

    targetElRef.current = targetEl;

    // Smoothly scroll target into view
    targetEl.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: isMobile ? "start" : "center",
      inline: "nearest",
    });

    const PADDING = 8;
    const calculateSpotlight = () => {
      if (!targetEl.isConnected) return;
      const rect = targetEl.getBoundingClientRect();
      setSpotlightRect({
        top: Math.max(0, rect.top - PADDING),
        left: Math.max(0, rect.left - PADDING),
        width: rect.width + PADDING * 2,
        height: rect.height + PADDING * 2,
        radius: 16,
      });

      if (dialogRef.current) {
        updateTooltipPosition(targetEl, dialogRef.current);
      }
    };

    const initialRaf = requestAnimationFrame(calculateSpotlight);

    // Re-check after scroll finishes
    const timer = setTimeout(calculateSpotlight, prefersReducedMotion ? 20 : 250);
    return () => {
      cancelAnimationFrame(initialRaf);
      clearTimeout(timer);
    };
  }, [
    isOpen,
    currentStepIndex,
    isCenteredStep,
    currentStep.id,
    currentStep.targetSelector,
    isMobile,
    prefersReducedMotion,
    totalSteps,
    handleFinish,
    updateTooltipPosition,
  ]);

  // Hook autoUpdate from @floating-ui/dom
  useEffect(() => {
    if (!isOpen || !targetElRef.current || !dialogRef.current || isMobile || isCenteredStep) {
      return;
    }

    const cleanup = autoUpdate(targetElRef.current, dialogRef.current, () => {
      if (targetElRef.current && dialogRef.current) {
        const rect = targetElRef.current.getBoundingClientRect();
        const PADDING = 8;
        setSpotlightRect({
          top: Math.max(0, rect.top - PADDING),
          left: Math.max(0, rect.left - PADDING),
          width: rect.width + PADDING * 2,
          height: rect.height + PADDING * 2,
          radius: 16,
        });
        updateTooltipPosition(targetElRef.current, dialogRef.current);
      }
    });

    return () => cleanup();
  }, [isOpen, currentStepIndex, isMobile, isCenteredStep, updateTooltipPosition]);

  // Handle keyboard events (Escape, ArrowLeft, ArrowRight, Focus Trap)
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      } else if (e.key === "ArrowRight" && !isLast) {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft" && !isFirst) {
        e.preventDefault();
        handleBack();
      } else if (e.key === "Tab") {
        if (!dialogRef.current) return;
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isFirst, isLast, handleBack, handleClose, handleNext]);

  // Auto-focus dialog on mount or step change
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      const primaryBtn = dialogRef.current.querySelector<HTMLElement>(
        'button[data-primary="true"]'
      );
      if (primaryBtn) {
        primaryBtn.focus();
      } else {
        dialogRef.current.focus();
      }
    }
  }, [isOpen, currentStepIndex]);

  // Prevent background clicks from propagating to page elements
  const handleBlockerClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Screen reader polite announcement
  const announcement = useMemo(
    () =>
      `Step ${currentStepIndex + 1} of ${totalSteps}: ${currentStep.title}. ${currentStep.description}`,
    [currentStepIndex, totalSteps, currentStep.title, currentStep.description]
  );

  if (!isOpen) return null;

  return (
    <div
      role="region"
      aria-label="Product Tour Overlay"
      className="fixed inset-0 z-50 pointer-events-none"
    >
      {/* Screen Reader Announcement */}
      <div className="sr-only" aria-live="polite">
        {announcement}
      </div>

      {/* ============================================================
          DIMMED OVERLAY & SPOTLIGHT CUTOUT (Zero Blur, Sharp Target)
      ============================================================ */}
      {isCenteredStep || !spotlightRect ? (
        // Plain dark overlay for centered steps (Welcome & Finish)
        <div
          data-testid="tour-backdrop"
          aria-hidden="true"
          onClick={handleBlockerClick}
          className="fixed inset-0 z-40 bg-[rgba(43,27,27,0.55)] pointer-events-auto transition-opacity duration-200"
        />
      ) : (
        <>
          {/* Four Click-Blocker Panels around target (blocks clicks on dimmed area) */}
          {/* Top Panel */}
          <div
            data-testid="tour-blocker-top"
            aria-hidden="true"
            onClick={handleBlockerClick}
            className="fixed inset-x-0 top-0 z-40 pointer-events-auto"
            style={{ height: `${spotlightRect.top}px` }}
          />
          {/* Bottom Panel */}
          <div
            data-testid="tour-blocker-bottom"
            aria-hidden="true"
            onClick={handleBlockerClick}
            className="fixed inset-x-0 bottom-0 z-40 pointer-events-auto"
            style={{ top: `${spotlightRect.top + spotlightRect.height}px` }}
          />
          {/* Left Panel */}
          <div
            data-testid="tour-blocker-left"
            aria-hidden="true"
            onClick={handleBlockerClick}
            className="fixed z-40 pointer-events-auto"
            style={{
              top: `${spotlightRect.top}px`,
              left: 0,
              width: `${spotlightRect.left}px`,
              height: `${spotlightRect.height}px`,
            }}
          />
          {/* Right Panel */}
          <div
            data-testid="tour-blocker-right"
            aria-hidden="true"
            onClick={handleBlockerClick}
            className="fixed z-40 pointer-events-auto"
            style={{
              top: `${spotlightRect.top}px`,
              left: `${spotlightRect.left + spotlightRect.width}px`,
              right: 0,
              height: `${spotlightRect.height}px`,
            }}
          />

          {/* Target Highlight Box: box-shadow dims the page without any blur */}
          <div
            data-testid="tour-highlight"
            data-tour-spotlight="true"
            aria-hidden="true"
            className="fixed pointer-events-none z-40 rounded-2xl border-2 border-[#F2B63D] ring-4 ring-[#F2B63D]/25 transition-all duration-200 ease-out"
            style={{
              top: `${spotlightRect.top}px`,
              left: `${spotlightRect.left}px`,
              width: `${spotlightRect.width}px`,
              height: `${spotlightRect.height}px`,
              boxShadow: "0 0 0 9999px rgba(43, 27, 27, 0.55)",
            }}
          />
        </>
      )}

      {/* ============================================================
          TOOLTIP DIALOG (Anchored next to target or Mobile Bottom Sheet)
      ============================================================ */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-dialog-title"
        aria-describedby="tour-dialog-desc"
        tabIndex={-1}
        style={
          isCenteredStep
            ? {
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }
            : isMobile
            ? undefined
            : floatingStyle
        }
        className={`pointer-events-auto z-50 overflow-hidden bg-white shadow-2xl shadow-[#2B1B1B]/20 outline-hidden transition-all duration-200 ${
          isMobile
            ? "fixed inset-x-3 bottom-3 rounded-2xl border border-[#EBDDD1] p-5 max-w-none"
            : isCenteredStep
            ? "w-full max-w-md rounded-3xl border border-[#EBDDD1] p-6 sm:p-7"
            : "w-[340px] max-w-[calc(100vw-24px)] rounded-3xl border border-[#EBDDD1] p-5 sm:p-6"
        }`}
      >
        {/* Tooltip Arrow (Floating Mode Only) */}
        {!isCenteredStep && !isMobile && (
          <div
            ref={arrowRef}
            style={arrowStyle}
            aria-hidden="true"
            className={`h-3 w-3 rotate-45 border-[#EBDDD1] bg-white pointer-events-none ${
              resolvedPlacement.startsWith("bottom")
                ? "border-t border-l"
                : resolvedPlacement.startsWith("top")
                ? "border-b border-r"
                : resolvedPlacement.startsWith("right")
                ? "border-b border-l"
                : "border-t border-r"
            }`}
          />
        )}

        {/* Brand Top Bar & Progress Dots */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#EBDDD1]">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#F2B63D] text-[#4C0915] font-bold shadow-2xs">
              <Sparkles size={13} aria-hidden="true" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A0F1F]">
              CareerEdge Quick Tour
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#FFF9ED] border border-[#F2B63D]/40 px-2 py-0.5 text-[11px] font-bold text-[#7A0F1F]">
              Step {currentStepIndex + 1} of {totalSteps}
            </span>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Skip product tour"
              className="flex h-11 w-11 min-h-[44px] min-w-[44px] -mr-2 items-center justify-center rounded-xl text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Thin Gold Progress Bar */}
        <div
          className="h-1 w-full bg-stone-100 overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="h-full bg-[#F2B63D] transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="py-4 space-y-1.5">
          <h3
            id="tour-dialog-title"
            className="font-heading text-base sm:text-lg font-bold tracking-tight text-[#2B1B1B]"
          >
            {currentStep.title}
          </h3>
          <p
            id="tour-dialog-desc"
            className="text-xs sm:text-sm text-[#765F5D] leading-relaxed"
          >
            {currentStep.description}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="pt-3.5 border-t border-[#EBDDD1]/60 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="text-xs font-semibold text-[#765F5D] hover:text-[#7A0F1F] transition px-2 py-2 min-h-[44px] flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A0F1F] rounded-lg"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1 rounded-xl border border-[#EBDDD1] bg-white px-3 py-2 min-h-[44px] text-xs font-semibold text-[#2B1B1B] hover:bg-[#FDF7F5] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A0F1F]"
              >
                <ArrowLeft size={13} aria-hidden="true" />
                <span>Back</span>
              </button>
            )}

            <button
              type="button"
              data-primary="true"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#7A0F1F] px-4 py-2 min-h-[44px] text-xs font-bold text-white hover:bg-[#4C0915] transition shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B63D]"
            >
              <span>
                {currentStep.primaryButtonLabel ||
                  (isLast ? "Finish Tour" : "Next")}
              </span>
              {isLast ? (
                <CheckCircle2 size={13} aria-hidden="true" />
              ) : (
                <ArrowRight size={13} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
