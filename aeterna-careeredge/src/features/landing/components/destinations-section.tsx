"use client";

import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";

const destinations = [
  {
    name: "United Kingdom",
    flag: "🇬🇧",
    details: "4,200+ admits",
  },
  {
    name: "Canada",
    flag: "🇨🇦",
    details: "PGWP pathways",
  },
  {
    name: "Germany",
    flag: "🇩🇪",
    details: "Free tuition tracks",
  },
  {
    name: "United States",
    flag: "🇺🇸",
    details: "STEM OPT linked",
  },
  {
    name: "Australia",
    flag: "🇦🇺",
    details: "Group of Eight",
  },
  {
    name: "Ireland",
    flag: "🇮🇪",
    details: "Dublin tech hub",
  },
];

const SECONDS_PER_LOOP = 30;

function DestinationPill({ card }: { card: (typeof destinations)[number] }) {
  return (
    <li className="flex shrink-0 items-center gap-2.5 rounded-xl border border-gold/30 bg-white px-4 py-2 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gold hover:shadow-md">
      <span aria-hidden="true" className="text-xl leading-none">
        {card.flag}
      </span>
      <div>
        <p className="whitespace-nowrap text-xs font-semibold text-on-surface">
          {card.name}
        </p>
        <p className="whitespace-nowrap text-[10px] font-medium text-gray-700">
          {card.details}
        </p>
      </div>
    </li>
  );
}

export function DestinationsSection() {
  const reduceMotion = useReducedMotion();
  const paused = useRef(false);

  // progress runs from 0 to -50 (% of the doubled track), then wraps seamlessly
  const progress = useMotionValue(0);
  const x = useTransform(progress, (v) => `${v}%`);

  useAnimationFrame((_, delta) => {
    if (paused.current || reduceMotion) return;
    let next = progress.get() - (50 / SECONDS_PER_LOOP) * (delta / 1000);
    if (next <= -50) next += 50;
    progress.set(next);
  });

  return (
    <section className="w-full border-y border-gold/40 bg-white py-6 shadow-md shadow-black/10">
      <div className="mx-auto max-w-7xl px-margin md:px-margin-tablet lg:px-margin-desktop">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:gap-8">
          <div className="shrink-0 text-center md:text-left">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              Target Global Hubs
            </span>
            <p className="text-base font-bold text-primary">
              Top Destinations for 2026–27
            </p>
          </div>

          {/* Viewport: clips the track and fades both edges */}
          <div
            onMouseEnter={() => (paused.current = true)}
            onMouseLeave={() => (paused.current = false)}
            className="min-w-0 w-full flex-1 overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
          >
            <motion.div style={{ x }} className="flex w-max">
              <ul className="flex shrink-0 gap-2.5 pr-2.5">
                {destinations.map((card) => (
                  <DestinationPill key={card.name} card={card} />
                ))}
              </ul>

              {/* Duplicate set for a seamless loop, hidden from screen readers */}
              <ul aria-hidden="true" className="flex shrink-0 gap-2.5 pr-2.5">
                {destinations.map((card) => (
                  <DestinationPill key={card.name} card={card} />
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
