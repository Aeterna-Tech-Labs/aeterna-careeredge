"use client";

import { useState, type ReactNode } from "react";
import { Pencil, X, Award, Briefcase, GraduationCap, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ACADEMIC_DOMAINS,
  CAREER_INTERESTS,
  EDUCATION_LEVELS,
  INDIAN_STATES,
  STUDY_ABROAD_COUNTRIES,
  GRADING_SYSTEMS,
  UNIVERSAL_SKILLS,
  DOMAIN_DETAILS,
  type AcademicDomain,
  type OnboardingData,
} from "@/types/onboarding";
import {
  ChipSelect,
  FieldGroup,
  FormField,
  SelectControl,
  TextField,
  TextareaControl,
  fieldClass,
} from "@/features/form/form-controls";

export type StepErrors = Partial<Record<keyof OnboardingData, string>>;

type StepProps = {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
  errors: StepErrors;
};

function toggleItem<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
}

function SectionLabel({ children, icon: Icon }: { children: ReactNode; icon?: React.ElementType }) {
  return (
    <div className="flex items-center gap-2">
      {Icon && <Icon size={16} className="text-[#7A0F1F]" aria-hidden="true" />}
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7A0F1F]">
        {children}
      </p>
    </div>
  );
}

/* --------------------- Step 1: Personal & Education --------------------- */

export function StepPersonalEducation({ data, update, errors }: StepProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => String(currentYear - 5 + i));

  const domainMeta = data.academicDomain
    ? DOMAIN_DETAILS[data.academicDomain as AcademicDomain]
    : undefined;

  const institutionPlaceholder =
    domainMeta?.placeholders.institution ||
    "e.g. Bangalore University, Christ University, KMC Manipal, RVCE";

  const coursePlaceholder =
    domainMeta?.placeholders.course ||
    "e.g. B.Com Accounting, BA LLB, B.Sc Nursing, B.Tech";

  const specializationPlaceholder =
    domainMeta?.placeholders.specialization ||
    "e.g. Corporate Tax, AI & ML, Clinical Nursing, Constitutional Law";

  return (
    <div className="space-y-6">
      <SectionLabel icon={GraduationCap}>Personal &amp; Academic Background</SectionLabel>

      {/* Full Name */}
      <TextField
        id="ob-name"
        label="Full Name"
        value={data.name}
        onChange={(name) => update({ name })}
        error={errors.name}
        placeholder="Enter your full name"
        autoComplete="name"
      />

      {/* Location */}
      <div className="grid gap-5 sm:grid-cols-2 relative z-30">
        <TextField
          id="ob-city"
          label="Current City"
          value={data.city}
          onChange={(city) => update({ city })}
          error={errors.city}
          placeholder="e.g. Bengaluru, Mysuru, Hubli, Mangaluru"
        />

        <FormField id="ob-state" label="State / Union Territory" error={errors.state}>
          <SelectControl
            id="ob-state"
            value={data.state}
            onChange={(state) => update({ state })}
            options={INDIAN_STATES}
            placeholder="Select your state / UT"
            error={errors.state}
          />
        </FormField>
      </div>

      {/* Academic Domain */}
      <div className="relative z-20">
        <FormField
          id="ob-domain"
          label="Academic &amp; Professional Domain"
          hint="Select the field that best describes your primary studies or profession"
          error={errors.academicDomain}
        >
          <SelectControl
            id="ob-domain"
            value={data.academicDomain}
            onChange={(academicDomain) => update({ academicDomain })}
            options={ACADEMIC_DOMAINS}
            placeholder="Select your academic domain (e.g. Commerce, Law, Healthcare, Engineering)"
            error={errors.academicDomain}
          />
        </FormField>
      </div>

      {/* Qualification & Year */}
      <div className="grid gap-5 sm:grid-cols-2 relative z-10">
        <FormField
          id="ob-level"
          label="Education Level / Qualification"
          error={errors.educationLevel}
        >
          <SelectControl
            id="ob-level"
            value={data.educationLevel}
            onChange={(educationLevel) => update({ educationLevel })}
            options={EDUCATION_LEVELS}
            placeholder="Select education level"
            error={errors.educationLevel}
          />
        </FormField>

        <FormField
          id="ob-year"
          label="Graduation Year"
          hint="Actual or expected"
          error={errors.graduationYear}
        >
          <SelectControl
            id="ob-year"
            value={data.graduationYear}
            onChange={(graduationYear) => update({ graduationYear })}
            options={years}
            placeholder="Select year"
            error={errors.graduationYear}
          />
        </FormField>
      </div>

      {/* College / Institution */}
      <TextField
        id="ob-institution"
        label="College / Institution / University"
        value={data.institution}
        onChange={(institution) => update({ institution })}
        error={errors.institution}
        placeholder={institutionPlaceholder}
      />

      {/* Course & Specialization */}
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="ob-course"
          label="Course / Degree Program"
          value={data.course}
          onChange={(course) => update({ course })}
          error={errors.course}
          placeholder={coursePlaceholder}
        />

        <TextField
          id="ob-spec"
          label="Specialization / Major"
          optional
          value={data.specialization}
          onChange={(specialization) => update({ specialization })}
          placeholder={specializationPlaceholder}
        />
      </div>

      {/* Grading System & Score */}
      <div className="grid gap-5 sm:grid-cols-2 relative z-0">
        <FormField
          id="ob-grading-type"
          label="Grading Format"
          optional
          hint="Select your institution's evaluation format"
        >
          <SelectControl
            id="ob-grading-type"
            value={data.gradingType}
            onChange={(gradingType) => update({ gradingType })}
            options={GRADING_SYSTEMS}
            placeholder="Select grading scale"
          />
        </FormField>

        <TextField
          id="ob-grade-value"
          label="Score / Grade / Result"
          optional
          value={data.gradeValue}
          onChange={(gradeValue) => update({ gradeValue })}
          placeholder="e.g. 8.85 CGPA or 85% or Distinction"
        />
      </div>
    </div>
  );
}

/* ----------------------- Step 2: Skills & Projects ---------------------- */

export function StepSkillsProjects({ data, update, errors }: StepProps) {
  const [customSkill, setCustomSkill] = useState("");

  const domainMeta = data.academicDomain
    ? DOMAIN_DETAILS[data.academicDomain as AcademicDomain]
    : undefined;

  // Combine domain skills with universal core skills
  const suggestedSkills = domainMeta
    ? Array.from(new Set([...domainMeta.suggestedSkills, ...UNIVERSAL_SKILLS]))
    : Array.from(new Set([...UNIVERSAL_SKILLS, "Excel", "Data Analysis", "Communication", "Project Management"]));

  const customSkills = data.skills.filter((s) => !suggestedSkills.includes(s));

  function addCustomSkill() {
    const trimmed = customSkill.trim();
    if (trimmed && !data.skills.includes(trimmed)) {
      update({ skills: [...data.skills, trimmed] });
    }
    setCustomSkill("");
  }

  const projectPlaceholder =
    domainMeta?.placeholders.project ||
    "Briefly describe your key academic project, research study, practical case, or creative portfolio.";

  return (
    <div className="space-y-6">
      <SectionLabel icon={Sparkles}>Skills &amp; Practical Projects</SectionLabel>

      {/* Skills Picker */}
      <FieldGroup
        id="ob-skills"
        label="Key Skills &amp; Competencies"
        hint={`Select skills relevant to your ${data.academicDomain || "academic"} field. You can add custom skills anytime.`}
        error={errors.skills}
      >
        <ChipSelect
          options={suggestedSkills}
          selected={data.skills}
          onToggle={(skill) => update({ skills: toggleItem(data.skills, skill) })}
        />

        <div className="mt-4 flex gap-2">
          <Input
            aria-label="Add a custom skill"
            value={customSkill}
            onChange={(event) => setCustomSkill(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addCustomSkill();
              }
            }}
            placeholder="Add a custom skill (e.g. GST Auditing, Legal Drafting, Figma)..."
            className={fieldClass()}
          />
          <Button
            type="button"
            variant="outline"
            onClick={addCustomSkill}
            className="h-12 rounded-xl px-5"
          >
            Add
          </Button>
        </div>

        {customSkills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {customSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 rounded-full border border-[#7A0F1F] bg-[#7A0F1F] py-1.5 pl-3.5 pr-2 text-sm font-medium text-white"
              >
                {skill}
                <button
                  type="button"
                  onClick={() =>
                    update({ skills: data.skills.filter((x) => x !== skill) })
                  }
                  aria-label={`Remove ${skill}`}
                  className="rounded-full p-0.5 opacity-75 transition hover:bg-white/20 hover:opacity-100"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        )}
      </FieldGroup>

      {/* Projects */}
      <FormField
        id="ob-projects"
        label="Academic, Practical or Research Projects"
        optional
        hint="Supports research papers, legal briefs, design portfolios, clinical studies, or technical work"
      >
        <TextareaControl
          id="ob-projects"
          value={data.projects}
          onChange={(projects) => update({ projects })}
          placeholder={projectPlaceholder}
          rows={4}
        />
      </FormField>
    </div>
  );
}

/* -------------------- Step 3: Experience & Achievements ------------------ */

export function StepExperienceAchievements({ data, update }: StepProps) {
  const domainMeta = data.academicDomain
    ? DOMAIN_DETAILS[data.academicDomain as AcademicDomain]
    : undefined;

  const experiencePlaceholder =
    domainMeta?.placeholders.experience ||
    "e.g. Internship, articleship, clinical training, or part-time work with key responsibilities.";

  return (
    <div className="space-y-6">
      <SectionLabel icon={Briefcase}>Experience &amp; Achievements</SectionLabel>

      {/* Work / Internship Experience */}
      <FormField
        id="ob-experience"
        label="Internships &amp; Work Experience"
        optional
        hint="Optional — students and fresh graduates with no prior work experience can freely skip and continue"
      >
        <TextareaControl
          id="ob-experience"
          value={data.experience}
          onChange={(experience) => update({ experience })}
          placeholder={experiencePlaceholder}
          rows={3}
        />
      </FormField>

      {/* Certifications */}
      <FormField
        id="ob-certifications"
        label="Certifications &amp; Professional Licenses"
        optional
        hint="e.g. CA Foundation, BLS/CPR, Bar Council Enrollment, NPTEL, Coursera, or industry licenses"
      >
        <TextareaControl
          id="ob-certifications"
          value={data.certifications}
          onChange={(certifications) => update({ certifications })}
          placeholder="e.g. Certified Financial Modeler, Advanced Excel (Microsoft), Basic Life Support (AHA)"
          rows={2}
        />
      </FormField>

      {/* Key Achievements */}
      <FormField
        id="ob-achievements"
        label="Key Achievements &amp; Honors"
        optional
        hint="Academic rank, moot court awards, hackathons, research publications, scholarships, or leadership roles"
      >
        <TextareaControl
          id="ob-achievements"
          value={data.achievements}
          onChange={(achievements) => update({ achievements })}
          placeholder="e.g. 1st Rank in University Moot Court, Published research paper on renewable energy in peer-reviewed journal"
          rows={2}
        />
      </FormField>
    </div>
  );
}

/* -------------------------- Step 4: Career Goals ------------------------- */

export function StepGoals({ data, update, errors }: StepProps) {
  const domainMeta = data.academicDomain
    ? DOMAIN_DETAILS[data.academicDomain as AcademicDomain]
    : undefined;

  const rolePlaceholder =
    domainMeta?.placeholders.targetRole ||
    "e.g. Financial Analyst, Staff Nurse, Legal Associate, Product Designer, Software Engineer";

  return (
    <div className="space-y-6">
      <SectionLabel icon={Target}>Career Goals &amp; Aspirations</SectionLabel>

      {/* Preferred Job Role */}
      <TextField
        id="ob-role"
        label="Target Profession / Preferred Job Role"
        value={data.preferredJobRole}
        onChange={(preferredJobRole) => update({ preferredJobRole })}
        error={errors.preferredJobRole}
        placeholder={rolePlaceholder}
        hint="Be specific. This helps our guidance and matching engine suggest tailored pathways."
      />

      {/* Target Industry */}
      <TextField
        id="ob-industry"
        label="Preferred Industry / Sector"
        optional
        value={data.targetIndustry}
        onChange={(targetIndustry) => update({ targetIndustry })}
        placeholder="e.g. Banking & Financial Services, Healthcare & Hospitals, Corporate Law, EdTech"
      />

      {/* Career Interests */}
      <FieldGroup
        id="ob-interests"
        label="Career Interest Areas"
        hint="Select up to 3 sectors you would like to explore or pursue."
        error={errors.careerInterests}
      >
        <ChipSelect
          options={CAREER_INTERESTS}
          selected={data.careerInterests}
          onToggle={(interest) =>
            update({
              careerInterests: toggleItem(data.careerInterests, interest),
            })
          }
          max={3}
        />
        <p className="mt-3 text-xs text-[#9A8580]">
          {data.careerInterests.length} of 3 selected
        </p>
      </FieldGroup>

      {/* Higher Education / Further Studies Goals */}
      <TextField
        id="ob-higher-ed"
        label="Higher Education Aspirations"
        optional
        value={data.higherEducationGoal}
        onChange={(higherEducationGoal) => update({ higherEducationGoal })}
        placeholder="e.g. Direct Job Placement, Master's degree in India, Study Abroad, PhD, or Civil Services"
      />

      {/* Study Abroad Destinations */}
      <FieldGroup
        id="ob-countries"
        label="Study Abroad Destinations of Interest"
        optional
        hint="Select any international destinations you may consider for higher studies."
      >
        <ChipSelect
          options={STUDY_ABROAD_COUNTRIES}
          selected={data.studyAbroadCountries}
          onToggle={(country) =>
            update({
              studyAbroadCountries: toggleItem(
                data.studyAbroadCountries,
                country,
              ),
            })
          }
        />
      </FieldGroup>
    </div>
  );
}

/* ----------------------- Step 5: Review & Confirm ----------------------- */

function ReviewCard({
  title,
  icon: Icon,
  onEdit,
  children,
}: {
  title: string;
  icon?: React.ElementType;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#EBDDD1] bg-[#FFFBF9] p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className="text-[#7A0F1F]" aria-hidden="true" />}
          <p className="text-sm font-bold text-[#2B1B1B]">{title}</p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 rounded-md text-xs font-semibold text-[#7A0F1F] transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A0F1F]"
        >
          <Pencil size={12} aria-hidden="true" />
          Edit
        </button>
      </div>
      {children}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string | undefined | null }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[130px_1fr] gap-2 py-2 text-sm sm:grid-cols-[160px_1fr]">
      <span className="font-medium text-[#765F5D]">{label}</span>
      <span className="break-words text-[#2B1B1B]">{value}</span>
    </div>
  );
}

export function StepReview({
  data,
  onEdit,
}: {
  data: OnboardingData;
  onEdit: (step: number) => void;
}) {
  return (
    <div className="space-y-4">
      <SectionLabel icon={Award}>Review Your Career Passport Profile</SectionLabel>

      <ReviewCard title="Personal & Academic Profile" icon={GraduationCap} onEdit={() => onEdit(0)}>
        <div className="divide-y divide-[#F0E5DA]">
          <ReviewRow label="Full Name" value={data.name} />
          <ReviewRow label="City & State" value={`${data.city}, ${data.state}`} />
          <ReviewRow label="Academic Domain" value={data.academicDomain} />
          <ReviewRow label="Qualification" value={data.educationLevel} />
          <ReviewRow label="Institution" value={data.institution} />
          <ReviewRow label="Course / Program" value={data.course} />
          <ReviewRow label="Specialization" value={data.specialization} />
          <ReviewRow label="Graduation Year" value={data.graduationYear} />
          <ReviewRow
            label="Evaluation / Grade"
            value={data.gradeValue ? `${data.gradeValue} (${data.gradingType || "General"})` : data.gradingType}
          />
        </div>
      </ReviewCard>

      <ReviewCard title="Skills & Projects" icon={Sparkles} onEdit={() => onEdit(1)}>
        {data.skills.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {data.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-[#FCE9E8] px-2.5 py-1 text-xs font-medium text-[#7A0F1F]"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
        <div className="divide-y divide-[#F0E5DA]">
          <ReviewRow label="Notable Projects" value={data.projects} />
        </div>
      </ReviewCard>

      <ReviewCard title="Experience & Achievements" icon={Briefcase} onEdit={() => onEdit(2)}>
        <div className="divide-y divide-[#F0E5DA]">
          <ReviewRow label="Experience" value={data.experience || "None specified (Fresh Graduate)"} />
          <ReviewRow label="Certifications" value={data.certifications} />
          <ReviewRow label="Achievements" value={data.achievements} />
        </div>
      </ReviewCard>

      <ReviewCard title="Career Goals & Aspirations" icon={Target} onEdit={() => onEdit(3)}>
        <div className="divide-y divide-[#F0E5DA]">
          <ReviewRow label="Target Profession" value={data.preferredJobRole} />
          <ReviewRow label="Target Industry" value={data.targetIndustry} />
          <ReviewRow
            label="Career Interests"
            value={data.careerInterests.length > 0 ? data.careerInterests.join(", ") : null}
          />
          <ReviewRow label="Higher Education" value={data.higherEducationGoal} />
          <ReviewRow
            label="Study Abroad"
            value={data.studyAbroadCountries.length > 0 ? data.studyAbroadCountries.join(", ") : null}
          />
        </div>
      </ReviewCard>
    </div>
  );
}
