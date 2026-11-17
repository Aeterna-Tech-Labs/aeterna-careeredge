"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  type Variants,
} from "motion/react";
import { ArrowLeft, ArrowRight, CheckCircle2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/common/BrandLogo";
import { FieldError, fadeUp } from "@/features/form/form-controls";
import { StepProgress } from "@/features/onboarding/components/step-progress";
import {
  StepPersonalEducation,
  StepSkillsProjects,
  StepExperienceAchievements,
  StepGoals,
  StepReview,
  type StepErrors,
} from "@/features/onboarding/components/steps";
import { ONBOARDING_STEPS, type OnboardingData } from "@/types/onboarding";

/* --------------------------------- Animation -------------------------------- */

const slideVariants: Variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: "easeOut" } },
  exit: (dir: number) => ({
    x: dir < 0 ? 60 : -60,
    opacity: 0,
    transition: { duration: 0.25, ease: "easeIn" },
  }),
};

const arrowRight: Variants = { rest: { x: 0 }, hover: { x: 4 } };
const arrowLeft: Variants = { rest: { x: 0 }, hover: { x: -4 } };
const spring = { type: "spring", stiffness: 300, damping: 20 } as const;

/* ------------------------------- Initial state ------------------------------ */

const INITIAL_DATA: OnboardingData = {
  name: "",
  email: "",
  mobile: "",
  city: "",
  state: "",
  academicDomain: "",
  educationLevel: "",
  institution: "",
  course: "",
  specialization: "",
  graduationYear: "",
  gradingType: "",
  gradeValue: "",
  skills: [],
  projects: "",
  experience: "",
  certifications: "",
  achievements: "",
  careerInterests: [],
  preferredJobRole: "",
  targetIndustry: "",
  higherEducationGoal: "",
  shortTermGoal: "",
  longTermGoal: "",
  studyAbroadCountries: [],
};

/* ---------------------------------- Validation ------------------------------- */

/** Required fields per step for multi-domain students. */
function validateStep(step: number, d: OnboardingData): StepErrors {
  const e: StepErrors = {};

  if (step === 0) {
    if (!d.name.trim()) e.name = "Please enter your full name.";
    if (!d.city.trim()) e.city = "Please enter your city.";
    if (!d.state) e.state = "Please select your state or UT.";
    if (!d.academicDomain)
      e.academicDomain = "Please select your academic or professional domain.";
    if (!d.educationLevel)
      e.educationLevel = "Please select your education qualification level.";
    if (!d.institution.trim())
      e.institution = "Please enter your college or institution.";
    if (!d.course.trim())
      e.course = "Please enter your course or degree program.";
    if (!d.graduationYear)
      e.graduationYear = "Please select your graduation year.";
  }

  if (step === 3) {
    if (!d.preferredJobRole.trim())
      e.preferredJobRole = "Please enter the profession or role you are aiming for.";
    if (d.careerInterests.length === 0)
      e.careerInterests = "Choose at least one career interest area.";
  }

  return e;
}

/* ---------------------------------- Helpers ---------------------------------- */

function parseJsonArray(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/* ------------------------------------ Page ----------------------------------- */

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
  const [errors, setErrors] = useState<StepErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [savingAndExiting, setSavingAndExiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [fromDashboard, setFromDashboard] = useState(false);

  useEffect(() => {
    async function loadCurrentStudent() {
      try {
        const res = await fetch("/api/auth/me");
        if (
          typeof window !== "undefined" &&
          window.location.search.includes("from=dashboard")
        ) {
          setFromDashboard(true);
        }
        if (res.ok) {
          const json = await res.json();
          if (json.user) {
            if (json.user.onboardingCompleted) {
              setIsOnboarded(true);
            }
            const p = json.user.profile;
            setData((prev) => ({
              ...prev,
              name: prev.name || json.user.name || "",
              email: prev.email || json.user.email || "",
              mobile:
                prev.mobile ||
                (json.user.mobile
                  ? json.user.mobile.replace(/^\+91/, "").replace(/\s/g, "")
                  : ""),
              city: prev.city || p?.city || "",
              state: prev.state || p?.state || "",
              academicDomain: prev.academicDomain || p?.academicDomain || "",
              specialization: prev.specialization || p?.specialization || "",
              educationLevel: prev.educationLevel || p?.educationLevel || "",
              institution: prev.institution || p?.institution || "",
              course: prev.course || p?.course || "",
              graduationYear:
                prev.graduationYear ||
                (p?.graduationYear != null ? String(p.graduationYear) : ""),
              gradingType: prev.gradingType || p?.gradingType || "",
              gradeValue: prev.gradeValue || p?.gradeValue || "",
              skills:
                prev.skills.length > 0
                  ? prev.skills
                  : p?.skills
                    ? parseJsonArray(p.skills)
                    : [],
              projects: prev.projects || p?.projects || "",
              experience: prev.experience || p?.experience || "",
              certifications: prev.certifications || p?.certifications || "",
              achievements: prev.achievements || p?.achievements || "",
              careerInterests:
                prev.careerInterests.length > 0
                  ? prev.careerInterests
                  : p?.careerInterests
                    ? parseJsonArray(p.careerInterests)
                    : [],
              preferredJobRole:
                prev.preferredJobRole || p?.preferredJobRole || "",
              targetIndustry: prev.targetIndustry || p?.targetIndustry || "",
              higherEducationGoal:
                prev.higherEducationGoal || p?.higherEducationGoal || "",
              shortTermGoal: prev.shortTermGoal || p?.shortTermGoal || "",
              longTermGoal: prev.longTermGoal || p?.longTermGoal || "",
              studyAbroadCountries:
                prev.studyAbroadCountries.length > 0
                  ? prev.studyAbroadCountries
                  : p?.studyAbroadCountries
                    ? parseJsonArray(p.studyAbroadCountries)
                    : [],
            }));
          }
        }
      } catch {
        // Fallback gracefully
      }
    }
    loadCurrentStudent();
  }, []);

  const totalSteps = ONBOARDING_STEPS.length;
  const isLastStep = step === totalSteps - 1;
  const percent = Math.round(((step + 1) / totalSteps) * 100);

  function update(patch: Partial<OnboardingData>) {
    setData((prev) => ({ ...prev, ...patch }));
    // Clear the error of any field that was just edited
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(patch).forEach((key) => {
        delete next[key as keyof OnboardingData];
      });
      return next;
    });
  }

  function goTo(target: number) {
    setDirection(target > step ? 1 : -1);
    setStep(target);
    setErrors({});
    setError(null);
  }

  function next() {
    const stepErrors = validateStep(step, data);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    goTo(step + 1);
  }

  function prev() {
    if (step > 0) goTo(step - 1);
  }

  async function saveAndExit() {
    setSavingAndExiting(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, partialSave: true }),
      });
      const resData = (await res.json().catch(() => ({}))) as {
        user?: { onboardingCompleted?: boolean };
      };

      // If user has already completed onboarding or came from the dashboard, return them to the dashboard
      if (isOnboarded || fromDashboard || resData?.user?.onboardingCompleted) {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch {
      setError("Could not save progress. Please try again.");
    } finally {
      setSavingAndExiting(false);
    }
  }

  async function handleSubmit() {
    // Re-check every step, and jump to the first one with a problem
    for (let s = 0; s < totalSteps - 1; s++) {
      const stepErrors = validateStep(s, data);
      if (Object.keys(stepErrors).length > 0) {
        goTo(s);
        setErrors(stepErrors);
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(
          json.error ?? "Could not save your profile. Please try again.",
        );
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------------------------------- Render --------------------------------- */

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative isolate min-h-screen bg-[#FFF8F6]">
        {/* Soft background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(246,181,28,0.10),transparent_50%)]"
        />

        {/* Header */}
        <header className="sticky top-0 z-40 bg-gradient-to-r from-[#5C0914] via-[#7A0F1F] to-[#9A1B2E] shadow-lg shadow-black/20">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#F6B51C] to-transparent"
          />
          <div className="mx-auto flex h-20 max-w-3xl items-center justify-between gap-4 px-5 sm:px-8">
            <BrandLogo
              tone="dark"
              href={isOnboarded || fromDashboard ? "/dashboard" : "/"}
            />

            <div className="flex items-center gap-3">
              {(isOnboarded || fromDashboard) && (
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  Back to Dashboard
                </button>
              )}

              <button
                type="button"
                onClick={saveAndExit}
                disabled={savingAndExiting || submitting}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-[#F6B51C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F6B51C] disabled:opacity-50"
              >
                <Save size={15} aria-hidden="true" />
                {savingAndExiting ? "Saving…" : "Save & Exit"}
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-5 pb-16 pt-10 sm:px-8">
          {/* Heading and progress */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mb-8"
          >
            <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] text-[#7A0F1F]">
              <span>
                Step {step + 1} of {totalSteps}
              </span>
              <span className="text-[#9A8580]">{percent}% complete</span>
            </div>

            <h1 className="font-heading text-3xl font-bold tracking-tight text-[#2B1B1B] sm:text-4xl">
              Set Up Your Career Passport
            </h1>

            <div className="mt-8">
              <StepProgress
                steps={ONBOARDING_STEPS}
                current={step}
                onSelect={goTo}
              />
            </div>
          </motion.div>

          {/* Step card */}
          <div className="relative min-h-[460px] overflow-hidden rounded-3xl border border-[#EBDDD1] bg-white p-6 shadow-xl shadow-black/5 sm:p-8">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#7A0F1F] via-[#F6B51C] to-[#7A0F1F]"
            />

            <AnimatePresence custom={direction} mode="wait" initial={false}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {step === 0 && (
                  <StepPersonalEducation
                    data={data}
                    update={update}
                    errors={errors}
                  />
                )}
                {step === 1 && (
                  <StepSkillsProjects
                    data={data}
                    update={update}
                    errors={errors}
                  />
                )}
                {step === 2 && (
                  <StepExperienceAchievements
                    data={data}
                    update={update}
                    errors={errors}
                  />
                )}
                {step === 3 && (
                  <StepGoals data={data} update={update} errors={errors} />
                )}
                {step === 4 && <StepReview data={data} onEdit={goTo} />}
              </motion.div>
            </AnimatePresence>

            <FieldError id="onboarding-error" message={error} />
          </div>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <motion.div
              initial="rest"
              whileHover={step === 0 ? undefined : "hover"}
              whileTap={step === 0 ? undefined : { scale: 0.98 }}
              transition={spring}
            >
              <Button
                type="button"
                variant="outline"
                onClick={prev}
                disabled={step === 0}
                className="h-12 gap-2 rounded-xl px-5"
              >
                <motion.span variants={arrowLeft} className="inline-flex">
                  <ArrowLeft size={16} aria-hidden="true" />
                </motion.span>
                Previous
              </Button>
            </motion.div>

            <motion.div
              initial="rest"
              whileHover="hover"
              whileTap={{ scale: 0.98 }}
              transition={spring}
            >
              {isLastStep ? (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  loading={submitting}
                  className="h-12 gap-2 rounded-xl bg-[#7A0F1F] px-6 text-white shadow-md shadow-[#7A0F1F]/20 hover:bg-[#4C0915]"
                >
                  <CheckCircle2 size={16} aria-hidden="true" />
                  {submitting ? "Saving…" : "Complete & Go to Dashboard"}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={next}
                  className="h-12 gap-2 rounded-xl bg-[#7A0F1F] px-6 text-white shadow-md shadow-[#7A0F1F]/20 hover:bg-[#4C0915]"
                >
                  Next
                  <motion.span variants={arrowRight} className="inline-flex">
                    <ArrowRight size={16} aria-hidden="true" />
                  </motion.span>
                </Button>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </MotionConfig>
  );
}
