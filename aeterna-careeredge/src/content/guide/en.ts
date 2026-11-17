// src/content/guide/en.ts
// Plain-Language Guide Content for Aeterna CareerEdge (Day 2 Section C & D)
// Written for Grade 8 reading level: simple words, short sentences, zero ungrounded jargon.
// Keyed by ID for future Hindi/Marathi i18n support without component code changes.

export interface SectionGuide {
  id: string;
  title: string;
  whatThisIs: string;
  whatToDo: string;
  whatYouGet: string;
}

export interface StaticFaq {
  question: string;
  answer: string;
  actionRoute?: string;
  actionLabel?: string;
}

export const GUIDE_SECTIONS: Record<string, SectionGuide> = {
  "career-passport": {
    id: "career-passport",
    title: "Career Passport",
    whatThisIs: "Your true information in one place: education, skills, projects, and work experience.",
    whatToDo: "Fill each section honestly. Skip what does not apply to you.",
    whatYouGet: "Resumes, profile checks, and job matches based on your real details. We never make things up.",
  },
  "evidence-vault": {
    id: "evidence-vault",
    title: "Evidence Vault",
    whatThisIs: "A safe place for proof of what you have done.",
    whatToDo: "Add certificates, project links, letters, or work samples that prove your skills.",
    whatYouGet: "Stronger resume lines. We can prove to employers which skills are real.",
  },
  "truth-check": {
    id: "truth-check",
    title: "Truth Check",
    whatThisIs: "A check to make sure every line on your resume or LinkedIn profile is really yours.",
    whatToDo: "Run the check before you export. Add proof for any claim that has no evidence.",
    whatYouGet: "100% honesty. Employers trust resumes where every claim has proof.",
  },
  "role-fit-explorer": {
    id: "role-fit-explorer",
    title: "Role Fit Explorer",
    whatThisIs: "A tool for students who do not know which job role suits them best.",
    whatToDo: "Select your field and answer a few simple questions about what you like.",
    whatYouGet: "3 to 5 realistic roles for your field, what you already have, and what you still need to learn.",
  },
  "resume-builder": {
    id: "resume-builder",
    title: "Resume Builder",
    whatThisIs: "Build a clean resume for a specific job role in your field.",
    whatToDo: "Pick the role, choose what to include, and edit each section.",
    whatYouGet: "A clean PDF resume. You can keep different versions for different roles.",
  },
  "resume-check": {
    id: "resume-check",
    title: "Resume Check",
    whatThisIs: "A review of your resume for your chosen role.",
    whatToDo: "Click 'Check my resume'. Paste a job description if you have one.",
    whatYouGet: "What is strong, what is missing, and what to fix first.",
  },
  "linkedin-check": {
    id: "linkedin-check",
    title: "LinkedIn Profile Check",
    whatThisIs: "A review of your LinkedIn profile for your chosen role.",
    whatToDo: "Upload your LinkedIn PDF or paste your profile text. Review what we read.",
    whatYouGet: "A readiness score and better text you can copy. We never post anything to LinkedIn for you.",
  },
  "job-discovery": {
    id: "job-discovery",
    title: "Job Discovery",
    whatThisIs: "Real jobs from approved, official job sources. No fake listings.",
    whatToDo: "Search by role and place. Open a job to see how well your skills match.",
    whatYouGet: "Which skills you have, which you lack, and a direct link to apply on the official site.",
  },
  "application-tracker": {
    id: "application-tracker",
    title: "Application Tracker",
    whatThisIs: "Your personal list of jobs you saved, visited, and applied to.",
    whatToDo: "Save jobs. After you apply on the employer site, come back and tap 'I applied'.",
    whatYouGet: "One place to see what is pending, follow-up dates, and interview stages.",
  },
  "career-readiness-report": {
    id: "career-readiness-report",
    title: "Career Readiness Report",
    whatThisIs: "A clear picture of where you stand for your chosen role.",
    whatToDo: "Click 'Create my report'. Update it after you improve your profile.",
    whatYouGet: "What you have, what is missing, and a step-by-step plan.",
  },
  "gap-to-action-sprint": {
    id: "gap-to-action-sprint",
    title: "Gap-to-Action Sprint",
    whatThisIs: "A 30-day plan made from your real profile gaps.",
    whatToDo: "Do one small task each day. Tick it when done.",
    whatYouGet: "Steady progress you can see, turning gaps into real achievements.",
  },
  "interview-prep-kit": {
    id: "interview-prep-kit",
    title: "Interview Prep Kit",
    whatThisIs: "Practice material tailored to a specific job vacancy.",
    whatToDo: "Pick a saved job and review the likely question themes.",
    whatYouGet: "Questions tied to your own projects and evidence, with tips on how to answer honestly.",
  },
  "career-guide": {
    id: "career-guide",
    title: "AI Career Guide",
    whatThisIs: "A simple assistant that knows your field and guides your next step.",
    whatToDo: "Ask any question, or pick one of the suggested prompts.",
    whatYouGet: "Short, honest answers and direct buttons to the right screen. It never guesses or makes things up.",
  },
};

/**
 * Static Q&A for the AI Career Guide.
 * When a student asks these questions, we answer instantly from this file with 0 AI cost!
 */
export const STATIC_GUIDE_FAQS: StaticFaq[] = [
  {
    question: "What should I fill first in my profile?",
    answer: "Start with your field and highest education in your Career Passport, then add at least 3 skills you know well.",
    actionRoute: "/passport",
    actionLabel: "Open Career Passport",
  },
  {
    question: "What is the Evidence Vault?",
    answer: "The Evidence Vault is where you save certificates, project links, or work samples. It proves that what you wrote on your resume is real.",
    actionRoute: "/evidence-vault",
    actionLabel: "Open Evidence Vault",
  },
  {
    question: "What is Truth Check?",
    answer: "Truth Check compares your resume claims with your Career Passport and Evidence Vault. It flags anything that does not have proof, so employers trust every line.",
    actionRoute: "/truth-check",
    actionLabel: "Open Truth Check",
  },
  {
    question: "How do I get my Career Readiness score higher?",
    answer: "Your score increases as you add real details: your degree, verified skills, at least one project, and proof in your Evidence Vault.",
    actionRoute: "/passport",
    actionLabel: "Update Passport",
  },
  {
    question: "Does CareerEdge apply to jobs for me automatically?",
    answer: "No. CareerEdge gives you a matching score and an Application Pack. You always apply yourself on the employer's official website, then tap 'I applied' in your Tracker.",
    actionRoute: "/applications",
    actionLabel: "Open Tracker",
  },
  {
    question: "Will you post anything on my LinkedIn account?",
    answer: "Never. CareerEdge only gives you suggestions you can copy. We never write, edit, or post anything to your LinkedIn account.",
    actionRoute: "/linkedin",
    actionLabel: "View LinkedIn Tools",
  },
];

/**
 * Suggested questions per screen for the Guide drawer.
 */
export const PAGE_SUGGESTED_QUESTIONS: Record<string, string[]> = {
  "/dashboard": [
    "What should I do next to improve my profile?",
    "Why is my Career Passport score at this number?",
    "How does the Evidence Vault help me get hired?",
  ],
  "/passport": [
    "Which skills are most important for my field?",
    "How do I add practical projects if I am a fresher?",
    "Can I change my academic field later?",
  ],
  "/evidence-vault": [
    "What kind of documents count as good evidence?",
    "Is my uploaded document private and secure?",
    "How do I link evidence to a specific skill?",
  ],
  "/truth-check": [
    "Why was one of my skills marked as needing evidence?",
    "Can I confirm a claim if I do not have a certificate?",
    "Why does honesty matter more than keyword stuffing?",
  ],
  "/resume": [
    "Which resume template is best for my profession?",
    "How long should my resume be?",
    "Can I make different resumes for different jobs?",
  ],
  "/job-matcher": [
    "How does CareerEdge calculate my job match?",
    "Why does a job show missing skills?",
    "Where do these job listings come from?",
  ],
  "/applications": [
    "When should I follow up on an applied job?",
    "How do I move an application to Interview stage?",
    "Can I add private notes to a saved job?",
  ],
};
