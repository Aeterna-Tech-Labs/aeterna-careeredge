"use client";

import {
  ShieldCheck,
  UserCheck,
  FileCheck2,
  LockKeyhole,
  CheckCircle2,
} from "lucide-react";
import { MotionConfig, motion, type Variants } from "motion/react";

const principles = [
  {
    icon: UserCheck,
    title: "You stay in control",
    description:
      "AI suggestions are a starting point. You review, edit and approve your documents before using them.",
  },
  {
    icon: FileCheck2,
    title: "Your story stays truthful",
    description:
      "CareerEdge is designed to help present your real education, skills and experience — not invent achievements.",
  },
  {
    icon: LockKeyhole,
    title: "Guidance on your terms",
    description:
      "Counsellor contact is optional. You decide whether you want additional human guidance.",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const fadeLeft: Variants = {
  hidden: { opacity: 0, x: 32 },
  show: { opacity: 1, x: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const spring = { type: "spring", stiffness: 300, damping: 22 } as const;

export function TrustSection() {
  return (
    <MotionConfig reducedMotion="user">
      <section
        id="about"
        className="relative isolate scroll-mt-24 overflow-hidden bg-background py-20 sm:py-24"
      >
        {/* Soft background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(246,181,28,0.10),transparent_50%)]"
        />

        <div className="page-container">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            {/* Left content */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.div
                whileHover={{ rotate: -6, scale: 1.05 }}
                transition={spring}
                className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/40 bg-gold-soft text-primary shadow-sm"
              >
                <ShieldCheck size={29} aria-hidden="true" />
              </motion.div>

              <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Responsible AI, always
              </p>

              <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Your future deserves a human touch.
              </h2>

              <p className="mt-5 text-base leading-7 text-secondary-text">
                Technology can make preparation easier, but your experiences,
                decisions and ambitions remain at the centre of your career
                journey.
              </p>

              <div className="mt-7 flex items-center gap-3 rounded-2xl border border-gold/40 bg-white p-4 shadow-sm">
                <CheckCircle2
                  className="shrink-0 text-success"
                  size={21}
                  aria-hidden="true"
                />
                <p className="text-sm font-semibold text-foreground">
                  Your profile. Your decisions. Your future.
                </p>
              </div>
            </motion.div>

            {/* Principle cards */}
            <motion.ul
              variants={listVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="space-y-4"
            >
              {principles.map((principle, index) => {
                const Icon = principle.icon;

                return (
                  <motion.li
                    key={principle.title}
                    variants={fadeLeft}
                    whileHover={{ y: -4 }}
                    transition={spring}
                    className="group flex gap-5 rounded-2xl border border-border bg-white p-6 shadow-sm transition-[box-shadow,border-color] duration-200 hover:border-gold hover:shadow-lg sm:p-7"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gold bg-background text-primary shadow-sm transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
                      <Icon size={23} aria-hidden="true" />
                    </div>

                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-primary/50">
                          0{index + 1}
                        </span>
                        <h3 className="font-heading text-base font-bold text-foreground sm:text-lg">
                          {principle.title}
                        </h3>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-secondary-text">
                        {principle.description}
                      </p>
                    </div>
                  </motion.li>
                );
              })}
            </motion.ul>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
