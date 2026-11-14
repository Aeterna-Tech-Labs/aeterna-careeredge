"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import {
  FileText,
  BookOpen,
  Network,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  type Variants,
} from "motion/react";

const tabs = [
  { id: "resume", label: "Resume", icon: FileText },
  { id: "sop", label: "Personal Statement", icon: BookOpen },
  { id: "linkedin", label: "LinkedIn Profile", icon: Network },
] as const;

type TabId = (typeof tabs)[number]["id"];

const cardClass =
  "mx-auto max-w-xl overflow-hidden rounded-2xl border border-border bg-white shadow-xl shadow-black/5";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

function ResumePreview() {
  return (
    <div className={`${cardClass} p-6 sm:p-8`}>
      <div className="border-b border-border pb-5">
        <p className="font-heading text-2xl font-bold text-primary">
          Priya Sharma
        </p>
        <p className="mt-1 text-xs text-secondary-text">
          Computer Science Student · Bengaluru, India
        </p>
        <p className="mt-3 text-xs text-secondary-text">
          priya@example.com · +91 XXXXX XXXXX · LinkedIn Profile
        </p>
      </div>

      <div className="mt-6 space-y-5 text-left">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
            Professional Summary
          </h4>
          <p className="mt-2 text-xs leading-6 text-secondary-text">
            Motivated computer science student interested in software
            development, problem-solving and building practical digital
            solutions.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
            Education
          </h4>
          <p className="mt-2 text-sm font-semibold text-foreground">
            Bachelor of Engineering
          </p>
          <p className="mt-1 text-xs text-secondary-text">
            Computer Science · University / College
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
            Skills
          </h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {["JavaScript", "React", "HTML", "CSS", "Problem Solving"].map(
              (skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-surface-muted px-2.5 py-1 text-[10px] text-foreground"
                >
                  {skill}
                </span>
              ),
            )}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
            Projects
          </h4>
          <p className="mt-2 text-sm font-semibold text-foreground">
            Student Portfolio Website
          </p>
          <p className="mt-1 text-xs leading-5 text-secondary-text">
            Designed and developed a responsive portfolio to present projects
            and technical skills.
          </p>
        </div>
      </div>
    </div>
  );
}

function SopPreview() {
  return (
    <div className={`${cardClass} p-6 sm:p-8`}>
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <p className="font-heading text-lg font-bold text-primary">
            Statement of Purpose
          </p>
          <p className="mt-1 text-xs text-secondary-text">
            Sample personal statement
          </p>
        </div>
        <BookOpen className="text-primary" size={24} aria-hidden="true" />
      </div>

      <div className="mt-6 space-y-5 text-left">
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            Introduction
          </h4>
          <p className="mt-2 text-xs leading-6 text-secondary-text">
            My interest in technology developed through my academic journey and
            the practical projects that helped me understand how software can
            solve real-world problems.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">
            Academic Background
          </h4>
          <p className="mt-2 text-xs leading-6 text-secondary-text">
            Through coursework and independent learning, I have developed an
            interest in programming, application development and collaborative
            problem-solving.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">
            Future Goals
          </h4>
          <p className="mt-2 text-xs leading-6 text-secondary-text">
            I hope to deepen my knowledge, gain practical experience and
            contribute to meaningful technology projects in the future.
          </p>
        </div>

        <div className="rounded-xl border border-gold/40 bg-gold-soft p-4">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles size={15} aria-hidden="true" />
            <span className="text-xs font-semibold">Writing guidance</span>
          </div>
          <p className="mt-2 text-xs leading-5 text-primary-dark">
            Use your own experiences and goals. Review and personalise every
            AI-assisted suggestion before using it.
          </p>
        </div>
      </div>
    </div>
  );
}

function LinkedInPreview() {
  return (
    <div className={cardClass}>
      <div className="h-24 bg-gradient-to-r from-[#5C0914] via-primary to-[#9A1B2E] sm:h-32" />

      <div className="px-6 pb-7 text-left sm:px-8">
        <div className="-mt-9 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-gold-soft font-heading text-xl font-bold text-primary sm:-mt-11 sm:h-20 sm:w-20 sm:text-2xl">
          PS
        </div>

        <div className="mt-4">
          <h3 className="font-heading text-xl font-bold text-foreground">
            Priya Sharma
          </h3>
          <p className="mt-1 text-sm text-secondary-text">
            Computer Science Student | Aspiring Software Developer
          </p>
          <p className="mt-2 text-xs text-text-muted">
            Bengaluru, Karnataka, India
          </p>
        </div>

        <div className="mt-6 border-t border-border pt-5">
          <h4 className="text-sm font-bold text-foreground">About</h4>
          <p className="mt-2 text-xs leading-6 text-secondary-text">
            I am a computer science student passionate about software
            development and learning through hands-on projects. I enjoy
            exploring new technologies, improving my problem-solving skills and
            connecting with people who build useful digital products.
          </p>
        </div>

        <div className="mt-5 border-t border-border pt-5">
          <h4 className="text-sm font-bold text-foreground">Key Skills</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {["React", "JavaScript", "Web Development", "Teamwork"].map(
              (skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-secondary-text"
                >
                  {skill}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const previews: Record<TabId, () => React.JSX.Element> = {
  resume: ResumePreview,
  sop: SopPreview,
  linkedin: LinkedInPreview,
};

export function SampleOutputSection() {
  const [activeTab, setActiveTab] = useState<TabId>("resume");
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const ActivePreview = previews[activeTab];

  // Arrow keys move between tabs, as expected for role="tablist"
  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft")
      next = (index - 1 + tabs.length) % tabs.length;
    else return;

    event.preventDefault();
    const nextTab = tabs[next];
    setActiveTab(nextTab.id);
    tabRefs.current[nextTab.id]?.focus();
  }

  return (
    <MotionConfig reducedMotion="user">
      <section className="relative isolate overflow-hidden bg-white py-20 sm:py-24">
        {/* Soft background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(246,181,28,0.08),transparent_55%)]"
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
              See what you can create
            </p>

            <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Your story, presented with confidence.
            </h2>

            <p className="mt-5 text-base leading-7 text-secondary-text">
              Explore examples of the professional documents and profiles you
              can work towards with CareerEdge.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="mx-auto mt-10 max-w-3xl"
          >
            <div
              role="tablist"
              aria-label="Sample output types"
              className="mx-auto flex w-fit max-w-full flex-wrap justify-center gap-1 rounded-2xl border border-border bg-white p-1.5 shadow-sm"
            >
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    ref={(el) => {
                      tabRefs.current[tab.id] = el;
                    }}
                    id={`sample-tab-${tab.id}`}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls="sample-output-panel"
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActiveTab(tab.id)}
                    onKeyDown={(event) => handleKeyDown(event, index)}
                    className={`relative flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:text-sm ${
                      isActive
                        ? "text-white"
                        : "text-secondary-text hover:bg-surface-muted hover:text-primary"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="sample-tab-pill"
                        aria-hidden="true"
                        className="absolute inset-0 rounded-xl bg-primary shadow-md shadow-primary/20"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon size={16} aria-hidden="true" />
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              id="sample-output-panel"
              role="tabpanel"
              aria-labelledby={`sample-tab-${activeTab}`}
              className="mt-7"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <ActivePreview />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          <div className="mt-8 flex items-start justify-center gap-2 text-center">
            <CheckCircle2
              size={17}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-success"
            />
            <p className="max-w-xl text-xs leading-5 text-secondary-text">
              These are illustrative examples, not real student profiles or
              generated results. You review and personalise your content.
            </p>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
