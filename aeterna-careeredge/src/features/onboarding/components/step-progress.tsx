"use client";

import { Check } from "lucide-react";
import { motion } from "motion/react";

/** Numbered stepper. Completed steps can be clicked to go back. */
export function StepProgress({
  steps,
  current,
  onSelect,
}: {
  steps: readonly string[];
  current: number;
  onSelect: (index: number) => void;
}) {
  return (
    <nav aria-label="Onboarding progress">
      <ol className="flex">
        {steps.map((label, i) => {
          const done = i < current;
          const active = i === current;
          const isLast = i === steps.length - 1;

          return (
            <li
              key={label}
              className="relative flex flex-1 flex-col items-center"
            >
              {/* Connector to the next step */}
              {!isLast && (
                <div
                  aria-hidden="true"
                  className="absolute left-1/2 top-4 h-0.5 w-full -translate-y-1/2 bg-[#EBDDD1]"
                >
                  <motion.div
                    className="h-full origin-left bg-[#7A0F1F]"
                    initial={false}
                    animate={{ scaleX: done ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => onSelect(i)}
                disabled={i > current}
                aria-current={active ? "step" : undefined}
                aria-label={`${label}${done ? " (completed)" : ""}`}
                className="group relative z-10 flex flex-col items-center gap-2 focus-visible:outline-none disabled:cursor-not-allowed"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors duration-300 group-focus-visible:ring-2 group-focus-visible:ring-[#7A0F1F]/40 group-focus-visible:ring-offset-2 ${
                    done
                      ? "border-[#7A0F1F] bg-[#7A0F1F] text-white"
                      : active
                        ? "border-[#7A0F1F] bg-white text-[#7A0F1F] ring-4 ring-[#7A0F1F]/10"
                        : "border-[#EBDDD1] bg-white text-[#9A8580]"
                  }`}
                >
                  {done ? <Check size={15} aria-hidden="true" /> : i + 1}
                </span>

                <span
                  className={`hidden text-center text-xs transition-colors sm:block ${
                    active
                      ? "font-semibold text-[#7A0F1F]"
                      : done
                        ? "text-[#765F5D] group-hover:text-[#7A0F1F]"
                        : "text-[#B9A5A3]"
                  }`}
                >
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Mobile shows only the current step name */}
      <p className="mt-3 text-center text-sm font-semibold text-[#7A0F1F] sm:hidden">
        {steps[current]}
      </p>
    </nav>
  );
}
