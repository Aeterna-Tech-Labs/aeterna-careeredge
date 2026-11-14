"use client";

import {
  UserRound,
  FileText,
  Route,
  MessageCircle,
  ArrowDown,
  Check,
} from "lucide-react";
import { MotionConfig, motion, type Variants } from "motion/react";

const steps = [
  {
    number: "01",
    title: "Create your Career Passport",
    description:
      "Build one profile with your education, interests, skills and career goals. Your journey starts with understanding where you are today.",
    icon: UserRound,
    points: ["Add your education", "Share your interests", "Set your goals"],
  },
  {
    number: "02",
    title: "Build your professional profile",
    description:
      "Use AI-powered tools to prepare your resume, personal statement and LinkedIn profile with guidance along the way.",
    icon: FileText,
    points: [
      "Create your resume",
      "Structure your SOP",
      "Improve your LinkedIn",
    ],
  },
  {
    number: "03",
    title: "Get your career roadmap",
    description:
      "Explore possible career directions, identify areas to improve and understand the next steps towards your goals.",
    icon: Route,
    points: [
      "Explore career paths",
      "Identify skill gaps",
      "Plan your next steps",
    ],
  },
  {
    number: "04",
    title: "Move forward with confidence",
    description:
      "Prepare for job opportunities, practise interviews and connect with a counsellor if you choose.",
    icon: MessageCircle,
    points: [
      "Prepare for interviews",
      "Track applications",
      "Get optional guidance",
    ],
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const gridVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
};

const spring = { type: "spring", stiffness: 300, damping: 22 } as const;

export function HowItWorksSection() {
  return (
    <MotionConfig reducedMotion="user">
      <section
        id="how-it-works"
        className="relative isolate scroll-mt-24 overflow-hidden bg-background py-20 sm:py-24"
      >
        {/* Soft background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(246,181,28,0.10),transparent_55%)]"
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
              Simple by design
            </p>

            <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Your career journey, one step at a time.
            </h2>

            <p className="mt-5 text-base leading-7 text-secondary-text">
              Start with one profile. Build the tools you need. Follow a clearer
              path towards your next opportunity.
            </p>
          </motion.div>

          <motion.ol
            variants={gridVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="mt-14 grid gap-8 md:grid-cols-2 md:gap-6 lg:grid-cols-4"
          >
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.li
                  key={step.number}
                  variants={fadeUp}
                  whileHover={{ y: -6 }}
                  transition={spring}
                  className="group relative rounded-3xl border border-border bg-white p-6 shadow-sm transition-[box-shadow,border-color] duration-300 hover:border-gold hover:shadow-xl"
                >
                  {/* Accent line that grows in on hover */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-6 top-0 h-0.5 origin-left scale-x-0 rounded-full bg-gradient-to-r from-primary via-gold to-primary transition-transform duration-300 group-hover:scale-x-100"
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold/40 bg-gold-soft text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                      <Icon size={23} aria-hidden="true" />
                    </div>

                    <span className="font-heading text-3xl font-bold text-primary/15 transition-colors duration-300 group-hover:text-gold">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-6 font-heading text-lg font-bold text-foreground">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-secondary-text">
                    {step.description}
                  </p>

                  <ul className="mt-5 space-y-3">
                    {step.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-center gap-2 text-xs font-medium text-foreground"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-soft text-primary">
                          <Check size={12} aria-hidden="true" />
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>

                  {/* Connector: down arrow on mobile, right arrow on desktop, hidden on the 2-column layout */}
                  {index < steps.length - 1 && (
                    <div
                      aria-hidden="true"
                      className="absolute -bottom-7 left-1/2 z-10 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border border-gold/40 bg-white text-primary shadow-sm md:hidden lg:-right-4 lg:bottom-auto lg:left-auto lg:top-8 lg:flex lg:translate-x-0"
                    >
                      <ArrowDown size={15} className="lg:-rotate-90" />
                    </div>
                  )}
                </motion.li>
              );
            })}
          </motion.ol>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-10 text-center text-xs text-secondary-text"
          >
            You stay in control of your profile and decide when to seek
            additional guidance.
          </motion.p>
        </div>
      </section>
    </MotionConfig>
  );
}
