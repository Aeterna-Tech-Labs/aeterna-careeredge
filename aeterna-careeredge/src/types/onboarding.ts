// src/types/onboarding.ts
// Multi-Domain Onboarding Types — Aeterna CareerEdge

export {
  ACADEMIC_DOMAINS,
  GRADING_SYSTEMS,
  UNIVERSAL_SKILLS,
  DOMAIN_DETAILS,
  type AcademicDomain,
  type DomainMeta,
} from "@/lib/constants/domains";

export interface OnboardingProject {
  id: string;
  title: string;
  role?: string;
  description: string;
  technologies?: string;
  url?: string;
}

export interface OnboardingData {
  // Step 1 — Personal & Education Details
  name: string;
  email: string;
  mobile: string;
  city: string;
  state: string;
  academicDomain: string;
  educationLevel: string;
  institution: string;
  course: string;
  specialization: string;
  graduationYear: string;
  gradingType: string;
  gradeValue: string;

  // Step 2 — Skills & Projects
  skills: string[];
  projects: OnboardingProject[];

  // Step 3 — Experience & Achievements
  experience: string;
  certifications: string;
  achievements: string;

  // Step 4 — Career Goals
  careerInterests: string[];
  preferredJobRole: string;
  targetIndustry: string;
  higherEducationGoal: string;
  shortTermGoal: string;
  longTermGoal: string;
  studyAbroadCountries: string[];
}

export const ONBOARDING_STEPS = [
  "Personal & Education",
  "Skills & Projects",
  "Experience & Achievements",
  "Career Goals",
  "Review & Confirm",
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
] as const;

export const EDUCATION_LEVELS = [
  "10th (SSLC)",
  "12th (PUC / HSC)",
  "Diploma",
  "Undergraduate (UG / Bachelor's)",
  "BE / B.Tech",
  "B.Sc / B.Sc (Hons)",
  "B.Com / B.Com (Hons)",
  "BBA / BBM",
  "BCA",
  "BA / BA (Hons)",
  "B.Des / B.Arch",
  "MBBS / BDS",
  "B.Pharm / D.Pharm",
  "B.Sc Nursing",
  "BA LLB / BBA LLB / LLB",
  "Postgraduate (PG / Master's)",
  "ME / M.Tech",
  "MBA / PGDM",
  "M.Sc",
  "M.Com",
  "MCA",
  "MA",
  "LLM",
  "MD / MS",
  "PhD / Doctoral",
  "Vocational / ITI / Certificate",
  "Other",
] as const;

export const CAREER_INTERESTS = [
  "Engineering & Technology",
  "Software & Information Technology",
  "Finance, Banking & Accounting",
  "Business & General Management",
  "Healthcare, Medicine & Nursing",
  "Legal Practice & Judiciary",
  "Science, Research & Analytics",
  "Design, Creative & Architecture",
  "Education, Teaching & EdTech",
  "Civil Services & Public Policy",
  "Media, Journalism & PR",
  "Hospitality & Tourism Operations",
  "Agriculture & Sustainability",
  "Marketing, Brand & Sales",
  "Entrepreneurship & Startups",
  "Supply Chain & Logistics",
  "Vocational & Specialized Trades",
  "Other",
] as const;

export const STUDY_ABROAD_COUNTRIES = [
  "USA", "UK", "Canada", "Australia", "Germany", "Ireland",
  "Netherlands", "Singapore", "New Zealand", "France", "Sweden", "Japan",
] as const;
