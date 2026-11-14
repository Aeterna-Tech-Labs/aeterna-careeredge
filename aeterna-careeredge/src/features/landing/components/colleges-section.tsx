"use client";

import {
  GraduationCap,
  Users,
  ClipboardCheck,
  BrainCircuit,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { MotionConfig, motion, type Variants } from "motion/react";

const benefits = [
  {
    icon: Users,
    title: "Student career readiness",
    description:
      "Give students a structured space to organise their skills, education and career goals.",
  },
  {
    icon: ClipboardCheck,
    title: "Career Passport",
    description:
      "Help students build a professional profile they can develop throughout their academic journey.",
  },
  {
    icon: BrainCircuit,
    title: "AI-powered preparation",
    description:
      "Introduce students to resume building, profile preparation and career discovery tools.",
  },
  {
    icon: MessageCircle,
    title: "Guided support",
    description:
      "Create opportunities for students to seek additional career guidance when they need it.",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const fadeLeft: Variants = {
  hidden: { opacity: 0, x: 32 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.25 } },
};

const arrowVariants: Variants = {
  rest: { x: 0 },
  hover: { x: 5 },
};

const spring = { type: "spring", stiffness: 300, damping: 20 } as const;

export function CollegesSection() {
  return (
    <MotionConfig reducedMotion="user">
      <section className="relative isolate overflow-hidden bg-primary-dark py-20 text-white sm:py-24">
        {/* Soft background glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,rgba(246,181,28,0.10),transparent_50%),radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.06),transparent_50%)]"
        />

        <div className="page-container">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            {/* Left content */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/30 bg-white/10 text-gold">
                <GraduationCap size={29} aria-hidden="true" />
              </div>

              <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-gold">
                For colleges and institutions
              </p>

              <h2 className="mt-4 max-w-xl font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Help your students become career-ready.
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-white/75">
                CareerEdge brings career preparation, employability tools and
                structured student profiles together in one platform. Support
                students as they prepare for their next step.
              </p>

              <motion.div
                initial="rest"
                whileHover="hover"
                whileTap={{ scale: 0.98 }}
                transition={spring}
                className="mt-8 inline-block"
              >
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-3 rounded-xl bg-gold px-6 py-3.5 text-sm font-bold text-primary-dark shadow-lg shadow-black/20 transition-colors hover:bg-gold-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-primary-dark"
                >
                  Explore College Solutions
                  <motion.span
                    variants={arrowVariants}
                    transition={spring}
                    className="inline-flex"
                  >
                    <ArrowRight size={17} aria-hidden="true" />
                  </motion.span>
                </Link>
              </motion.div>

              <p className="mt-4 text-xs text-white/55">
                Interested in exploring CareerEdge for your institution?
              </p>
            </motion.div>

            {/* Right card */}
            <motion.div
              variants={fadeLeft}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="relative"
            >
              <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />

              <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-8">
                {/* Accent line */}
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent"
                />

                <div className="flex items-center gap-3 border-b border-white/10 pb-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold text-primary-dark">
                    <GraduationCap size={22} aria-hidden="true" />
                  </div>

                  <div>
                    <p className="font-heading font-bold">
                      Career readiness framework
                    </p>
                    <p className="mt-1 text-xs text-white/55">
                      A structured student journey
                    </p>
                  </div>
                </div>

                <motion.ul
                  variants={listVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.3 }}
                  className="mt-6 space-y-5"
                >
                  {benefits.map((benefit) => {
                    const Icon = benefit.icon;

                    return (
                      <motion.li
                        key={benefit.title}
                        variants={fadeUp}
                        whileHover={{ x: 4 }}
                        transition={spring}
                        className="group flex gap-4"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-gold transition-colors duration-200 group-hover:bg-gold group-hover:text-primary-dark">
                          <Icon size={20} aria-hidden="true" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2
                              size={14}
                              aria-hidden="true"
                              className="text-gold"
                            />
                            <h3 className="text-sm font-semibold">
                              {benefit.title}
                            </h3>
                          </div>

                          <p className="mt-1 text-xs leading-5 text-white/60">
                            {benefit.description}
                          </p>
                        </div>
                      </motion.li>
                    );
                  })}
                </motion.ul>

                <div className="mt-7 rounded-2xl border border-gold/20 bg-gold/10 p-4">
                  <p className="text-xs font-semibold text-gold">
                    A more connected student journey
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/70">
                    From understanding career interests to preparing for
                    opportunities, help students take meaningful next steps.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
