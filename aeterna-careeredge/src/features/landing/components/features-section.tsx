"use client";

import {
  FileText,
  BookOpen,
  UserRound,
  Compass,
  BriefcaseBusiness,
  ClipboardList,
  ArrowUpRight,
} from "lucide-react";
import { MotionConfig, motion, type Variants } from "motion/react";
import Link from "next/link";

const features = [
  {
    icon: FileText,
    title: "AI Resume Builder",
    description:
      "Create a professional resume using your education, skills and experience.",
    benefit: "Build your resume",
  },
  {
    icon: BookOpen,
    title: "SOP Writer",
    description:
      "Write a clear personal statement for your university applications.",
    benefit: "Tell your story",
  },
  {
    icon: UserRound,
    title: "LinkedIn Builder",
    description:
      "Create a strong LinkedIn profile that shows who you are and what you can do.",
    benefit: "Build your profile",
  },
  {
    icon: Compass,
    title: "Career Discovery",
    description: "Find career options that match your interests and skills.",
    benefit: "Explore careers",
  },
  {
    icon: BriefcaseBusiness,
    title: "Job & Interview Prep",
    description:
      "Explore job opportunities and practise answering interview questions.",
    benefit: "Prepare for jobs",
  },
  {
    icon: ClipboardList,
    title: "Application Tracker",
    description:
      "Keep track of your job and university applications in one place.",
    benefit: "Stay organised",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const gridVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const spring = { type: "spring", stiffness: 300, damping: 22 } as const;

export function FeaturesSection() {
  return (
    <MotionConfig reducedMotion="user">
      <section
        id="features"
        className="relative isolate scroll-mt-24 overflow-hidden bg-white py-20 sm:py-24"
      >
        {/* Soft background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(246,181,28,0.10),transparent_50%)]"
        />

        <div className="page-container">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Everything in one place
            </p>

            <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Tools to help you move forward.
            </h2>

            <p className="mt-4 text-base leading-7 text-secondary-text">
              From your first resume to your next opportunity, get the tools you
              need to prepare for your future.
            </p>
          </motion.div>

          <motion.ul
            variants={gridVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <Link href="/login">
                  <motion.li
                    key={feature.title}
                    variants={fadeUp}
                    whileHover={{ y: -6 }}
                    transition={spring}
                    className="group relative overflow-hidden rounded-3xl border border-border bg-background p-6 transition-[box-shadow,border-color,background-color] duration-300 hover:border-gold hover:bg-white hover:shadow-xl"
                  >
                    {/* Accent line that grows in on hover */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-primary via-gold to-primary transition-transform duration-300 group-hover:scale-x-100"
                    />

                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold/40 bg-gold-soft text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                        <Icon size={23} aria-hidden="true" />
                      </div>

                      <span className="text-sm font-semibold text-primary/30 transition-colors duration-300 group-hover:text-gold">
                        0{index + 1}
                      </span>
                    </div>

                    <h3 className="mt-6 font-heading text-lg font-bold text-foreground">
                      {feature.title}
                    </h3>

                    <p className="mt-2 min-h-[48px] text-sm leading-6 text-secondary-text">
                      {feature.description}
                    </p>

                    <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary">
                      {feature.benefit}
                      <ArrowUpRight
                        size={16}
                        aria-hidden="true"
                        className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 motion-reduce:transition-none"
                      />
                    </div>
                  </motion.li>
                </Link>
              );
            })}
          </motion.ul>
        </div>
      </section>
    </MotionConfig>
  );
}
