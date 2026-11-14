"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Rocket,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MotionConfig, motion, type Variants } from "motion/react";

const spring = { type: "spring", stiffness: 300, damping: 20 } as const;

const buttonVariants: Variants = {
  rest: { scale: 1, transition: spring },
  hover: { scale: 1.03, transition: spring },
  tap: { scale: 0.98, transition: spring },
};

const arrowVariants: Variants = {
  rest: { x: 0, transition: spring },
  hover: { x: 5, transition: spring },
};

const rocketVariants: Variants = {
  rest: { x: 0, y: 0, transition: spring },
  hover: { x: 3, y: -3, transition: spring },
};

const textVariants: Variants = {
  rest: { x: 0, transition: spring },
  hover: { x: 2, transition: spring },
};

const imageVariants: Variants = {
  rest: { scale: 1, transition: spring },
  hover: { scale: 1.06, transition: spring },
};

// Entrance animation: the hero content staggers in on page load
const contentVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const trustItems = [
  { icon: CheckCircle2, iconClass: "text-success", label: "Free to start" },
  {
    icon: ShieldCheck,
    iconClass: "text-success",
    label: "Your data stays private",
  },
  {
    icon: MapPin,
    iconClass: "text-primary",
    label: "Bengaluru · Mysuru · Belagavi",
  },
];

export function HeroSection() {
  return (
    <MotionConfig reducedMotion="user">
      <section className="relative isolate overflow-hidden bg-background">
        {/* Subtle background gradient */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-white via-background to-gold-soft/30"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(122,15,31,0.05),transparent_55%)]"
        />

        <div className="page-container grid min-h-[730px] items-center gap-12 lg:grid-cols-2 lg:py-10">
          {/* Hero content */}
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="show"
            className="relative z-10"
          >
            <motion.div variants={itemVariants}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-primary shadow-sm">
                <motion.span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full bg-gold"
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                Your future starts here
              </div>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="max-w-2xl font-heading text-4xl font-extrabold leading-[1.15] tracking-tight text-primary sm:text-5xl lg:text-6xl"
            >
              Build your career.
              <span className="mt-1 block text-primary">Study abroad.</span>
              <span className="mt-1 inline-block text-foreground">
                <span>Get hired.</span>
                <Image
                  src="/assets/images/svgs/underline.svg"
                  width={120}
                  height={12}
                  alt=""
                  className="w-70 object-cover"
                />
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-7 max-w-xl text-base leading-8 text-secondary-text sm:text-lg"
            >
              One profile. AI-powered resume, SOP, LinkedIn and career roadmap —
              made for students across India.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-9 flex flex-col gap-3 sm:flex-row"
            >
              <motion.div
                variants={buttonVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
              >
                <Link href="/signup">
                  <Button size="lg" fullWidth>
                    Take Free Career Assessment
                    <motion.span
                      variants={arrowVariants}
                      className="inline-flex"
                    >
                      <ArrowRight size={18} />
                    </motion.span>
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                variants={buttonVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
              >
                <Link href="#how-it-works">
                  <Button variant="outline" size="lg" fullWidth>
                    <motion.span
                      variants={rocketVariants}
                      className="inline-flex"
                    >
                      <Rocket size={16} color="#6b0f1a" strokeWidth={1.5} />
                    </motion.span>
                    <motion.span variants={textVariants}>
                      See how it works
                    </motion.span>
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Trust indicators */}
            <motion.ul
              variants={itemVariants}
              className="mt-9 flex flex-wrap gap-x-4 gap-y-3"
            >
              {trustItems.map(({ icon: Icon, iconClass, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2 rounded-full bg-[#FFF0EF]/80 px-4 py-2 text-sm text-secondary-text shadow-sm"
                >
                  <Icon size={17} aria-hidden="true" className={iconClass} />
                  {label}
                </li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
            className="mx-auto w-full max-w-[472px]"
          >
            <motion.div initial="rest" whileHover="hover" className="relative">
              <div className="absolute -right-8 -top-8 h-64 w-64 rounded-full bg-gold-soft/70 blur-3xl" />

              {/* Image box: overflow-hidden stays here, with nothing else inside */}
              <div className="relative h-[480px] w-full overflow-hidden rounded-3xl shadow-xl">
                <motion.div
                  variants={imageVariants}
                  className="absolute inset-0"
                >
                  <Image
                    src="/assets/images/hero-section/group-friends.webp"
                    alt="Indian college students collaborating on their career goals"
                    fill
                    priority
                    sizes="(max-width: 472px) 100vw, 472px"
                    className="object-cover"
                  />
                </motion.div>
              </div>

              {/* Card: sibling of the image box, so it can overlap the corner without being clipped.
                  Floats gently up and down. */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-10 left-0 w-[calc(100%-1rem)] rounded-2xl bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/5 sm:-left-10 sm:w-[380px]"
              >
                {/* Top row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Image
                      src="/assets/images/avatar/anuj.webp"
                      alt="Anuj Dandavate"
                      width={44}
                      height={44}
                      className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-white"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-heading text-lg font-bold leading-tight text-foreground">
                        Anuj Dandavate
                      </p>
                      <p className="truncate text-sm text-secondary-text">
                        VTU Belagavi • CSE &apos;25
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-950">
                    <Star size={14} strokeWidth={2} aria-hidden="true" />
                    KSSF Verified
                  </span>
                </div>

                <div className="my-3.5 h-px bg-black/5" />

                {/* Passport strength */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-amber-950">
                      72%
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        Passport Strength
                      </p>
                      <p className="truncate text-sm text-secondary-text">
                        Top 8% ready for Bengaluru drives
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-md bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
                    96% Match
                  </span>
                </div>

                {/* Bottom strip */}
                <div className="mt-3.5 flex items-center justify-between rounded-xl bg-red-50 px-3.5 py-2.5">
                  <div className="flex items-center gap-2 text-xs font-medium text-red-950">
                    <CheckCircle2
                      size={15}
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                    SOP &amp; ATS Resume Ready
                  </div>
                  <button
                    type="button"
                    className="text-xs font-bold text-rose-900 transition-colors hover:text-rose-700"
                  >
                    Preview →
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Skyline sits behind the content */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-11 left-1/2 -z-10 -translate-x-1/2"
        >
          <Image
            src="/assets/images/hero-section/Buildings-removebg-preview.webp"
            alt=""
            width={1000}
            height={600}
            className="h-45 w-auto max-w-none"
          />
        </div>
      </section>
    </MotionConfig>
  );
}
