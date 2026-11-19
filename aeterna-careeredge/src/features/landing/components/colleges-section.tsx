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
import Image from "next/image";
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
      <section className="relative isolate overflow-hidden bg-primary-dark py-14 text-white sm:py-20 lg:py-24">
        <Image
          src="/assets/images/college_students/campus.webp"
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="-z-30 object-cover"
        />

        {/* Maroon tint: lower the numbers to show more of the image */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-r from-primary-dark/90 via-primary-dark/80 to-primary-dark/65"
        />

        <div className="page-container">
          <div className="grid gap-8 sm:gap-12 lg:gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            {/* Left content */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/30 bg-white/10 text-gold sm:h-14 sm:w-14">
                <GraduationCap size={29} aria-hidden="true" />
              </div>

              <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-gold sm:mt-7">
                For colleges and institutions
              </p>

              <h2 className="mt-4 max-w-xl font-heading text-2xl font-bold tracking-tight min-[375px]:text-3xl sm:text-4xl lg:text-5xl">
                Help your students become career-ready.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-white/75 sm:mt-5 sm:text-base">
                CareerEdge brings career preparation, employability tools and
                structured student profiles together in one platform. Support
                students as they prepare for their next step.
              </p>

              <motion.div
                initial="rest"
                whileHover="hover"
                whileTap={{ scale: 0.98 }}
                transition={spring}
                className="mt-7 inline-block w-full sm:mt-8 sm:w-auto"
              >
                <Link
                  href="/#contact"
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-xs font-bold text-primary-dark shadow-lg shadow-black/20 transition-colors hover:bg-gold-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-primary-dark min-[375px]:gap-3 min-[375px]:px-6 min-[375px]:py-3.5 min-[375px]:text-sm sm:w-auto"
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

              <p className="mt-4 text-center text-xs text-white/55 sm:text-left">
                Interested in exploring CareerEdge for your institution?
              </p>
            </motion.div>

            {/* Right card */}
            <motion.div
              variants={fadeLeft}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="relative overflow-hidden rounded-3xl"
            >
              <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold/10 blur-3xl pointer-events-none" />

              <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-4 shadow-2xl shadow-black/20 backdrop-blur-sm min-[375px]:p-6 sm:p-8">
                {/* Accent line */}
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent"
                />

                <div className="flex items-center gap-2.5 border-b border-white/10 pb-4 sm:gap-3 sm:pb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-primary-dark sm:h-11 sm:w-11">
                    <GraduationCap size={22} aria-hidden="true" />
                  </div>

                  <div>
                    <p className="font-heading text-sm font-bold sm:text-base">
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
                  className="mt-5 space-y-4 sm:mt-6 sm:space-y-5"
                >
                  {benefits.map((benefit) => {
                    const Icon = benefit.icon;

                    return (
                      <motion.li
                        key={benefit.title}
                        variants={fadeUp}
                        whileHover={{ x: 4 }}
                        transition={spring}
                        className="group flex gap-3 sm:gap-4"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-gold transition-colors duration-200 group-hover:bg-gold group-hover:text-primary-dark sm:h-10 sm:w-10">
                          <Icon size={20} aria-hidden="true" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2
                              size={14}
                              aria-hidden="true"
                              className="text-gold"
                            />
                            <h3 className="text-xs font-semibold sm:text-sm">
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

                <div className="mt-6 rounded-2xl border border-gold/20 bg-gold/10 p-3.5 sm:mt-7 sm:p-4">
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
