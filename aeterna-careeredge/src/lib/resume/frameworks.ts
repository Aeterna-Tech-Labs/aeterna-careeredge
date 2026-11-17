// src/lib/resume/frameworks.ts
// Profession-Specific Resume Frameworks & Authoritative Research Benchmarks (Day 2 Part 3)
// Configuration-driven, multi-domain architectures. No identical resume structures across domains.

export interface ResumeSectionConfig {
  key: string;
  label: string;
  description: string;
  required: boolean;
  isSpecialized?: boolean;
  evidencePrompt?: string;
}

export interface ResearchSourceReference {
  sourceName: string;
  sourceUrl: string;
  verificationDate: string;
  profession: string;
  targetRole: string;
  summary: string;
  isOfficialRegulation: boolean;
}

export interface DomainResumeFramework {
  domainKey: string;
  name: string;
  description: string;
  suggestedRoles: string[];
  sections: ResumeSectionConfig[];
  competencyChecklist: string[];
  regulatoryGuidelines?: string;
  officialResearchSources: ResearchSourceReference[];
}

export const RESUME_FRAMEWORKS: Record<string, DomainResumeFramework> = {
  HEALTHCARE: {
    domainKey: "HEALTHCARE",
    name: "Nursing & Healthcare",
    description: "Clinical-first structure highlighting rotations, patient safety, and regulated competencies.",
    suggestedRoles: [
      "Staff Nurse (ICU/Ward)",
      "Clinical Care Nurse",
      "Operation Theatre Nurse",
      "Community Health Officer",
      "Nursing Educator",
    ],
    regulatoryGuidelines:
      "Indian Nursing Council (INC) & State Nursing Council regulations mandate distinct documentation of clinical rotations, bed capacity, and procedures. Clinical exposure must never be presented as independent corporate employment unless salaried.",
    sections: [
      { key: "summary", label: "Professional Clinical Summary", description: "Brief overview of nursing license, clinical focus, and core patient care philosophies.", required: true },
      { key: "qualifications", label: "Nursing & Medical Qualifications", description: "B.Sc Nursing / GNM / P.B.B.Sc credentials, university registration, and council number.", required: true },
      { key: "clinicalRotations", label: "Clinical Rotations & Hospital Exposure", description: "Wards, ICU, Pediatrics, OBG rotations, hospital bed sizes, and hours completed.", required: true, isSpecialized: true, evidencePrompt: "Logbook or clinical completion certificate" },
      { key: "competencies", label: "Patient Care Competencies & Procedures", description: "IV cannulation, vitals monitoring, medication administration, BLS/ACLS adherence.", required: true, isSpecialized: true },
      { key: "certifications", label: "Certifications & Registrations", description: "State Nursing Council registration, BLS/ACLS, Infection Control protocols.", required: true, evidencePrompt: "Certificate or council registration badge" },
      { key: "experience", label: "Clinical Employment & Internships", description: "Paid hospital duties or compulsory rotating medical internships.", required: false },
    ],
    competencyChecklist: [
      "Patient Vitals & Triage Assessment",
      "Aseptic Techniques & Infection Prevention",
      "Medication Administration & 5 Rights",
      "Emergency Code Response (BLS/ACLS)",
      "Electronic Health Records (EHR) Documentation",
    ],
    officialResearchSources: [
      {
        sourceName: "Indian Nursing Council (INC) Competency Framework",
        sourceUrl: "https://www.indiannursingcouncil.org",
        verificationDate: "2024-08-15",
        profession: "Nursing",
        targetRole: "Registered Nurse",
        summary: "Mandates documentation of ward-specific rotation hours, logbooks, and basic life support qualifications.",
        isOfficialRegulation: true,
      },
      {
        sourceName: "National Career Service (NCS) - Staff Nurse Standard",
        sourceUrl: "https://www.ncs.gov.in",
        verificationDate: "2024-05-10",
        profession: "Healthcare",
        targetRole: "Staff Nurse",
        summary: "Employers prioritize emergency ward rotation exposure, medication protocols, and recognized council registration.",
        isOfficialRegulation: false,
      },
    ],
  },

  EDUCATION: {
    domainKey: "EDUCATION",
    name: "Teaching & Education",
    description: "Pedagogy-centered structure detailing subject specialization, lesson planning, and student outcomes.",
    suggestedRoles: [
      "Secondary School Teacher (TGT/PGT)",
      "Primary Teacher (PRT)",
      "Curriculum Designer",
      "Academic Coordinator",
      "Special Educator",
    ],
    regulatoryGuidelines:
      "NCTE (National Council for Teacher Education) and NEP 2020 guidelines emphasize experiential pedagogy, learning outcomes, classroom diversity, and inclusive education.",
    sections: [
      { key: "summary", label: "Teaching Philosophy & Summary", description: "Student-centered educational philosophy and subject domain expertise.", required: true },
      { key: "education", label: "Academic & Pedagogical Qualifications", description: "B.Ed / D.El.Ed / M.Ed with subject major (e.g. Mathematics, Science, English).", required: true },
      { key: "teachingPractice", label: "Teaching Practice & Internships", description: "Classroom teaching hours, grade levels taught, and school internship records.", required: true, isSpecialized: true, evidencePrompt: "Internship letter or school teaching record" },
      { key: "lessonPlanning", label: "Lesson Planning & Pedagogy", description: "Experiential learning modules, NEP 2020 outcome mapping, and classroom activities.", required: true, isSpecialized: true },
      { key: "classroomManagement", label: "Classroom Management & Inclusion", description: "Behavioral strategies, parent communication, and diverse learner accommodations.", required: true, isSpecialized: true },
      { key: "certifications", label: "Certifications & Teacher Eligibility", description: "CTET / State TET / EdTech tool proficiencies.", required: false, evidencePrompt: "TET Scorecard or certificate" },
    ],
    competencyChecklist: [
      "Curriculum & Lesson Plan Design",
      "Classroom Engagement & Management",
      "Formative & Summative Student Assessment",
      "Hybrid & Digital Teaching Tools (LMS)",
      "NEP 2020 Outcome-Based Learning",
    ],
    officialResearchSources: [
      {
        sourceName: "National Council for Teacher Education (NCTE) Norms",
        sourceUrl: "https://ncte.gov.in",
        verificationDate: "2024-07-01",
        profession: "Teaching",
        targetRole: "School Educator",
        summary: "Focuses on pedagogical competency, micro-teaching practicum, and pedagogical content knowledge.",
        isOfficialRegulation: true,
      },
      {
        sourceName: "Central Board of Secondary Education (CBSE) Educator Profile",
        sourceUrl: "https://www.cbse.gov.in",
        verificationDate: "2024-03-22",
        profession: "School Education",
        targetRole: "TGT / PGT Teacher",
        summary: "High demand for teachers experienced with differentiated learning and digital interactive tools.",
        isOfficialRegulation: false,
      },
    ],
  },

  ENGINEERING: {
    domainKey: "ENGINEERING",
    name: "IT, Software & Engineering",
    description: "Code and project-driven structure showcasing tech stacks, live architectures, and system impact.",
    suggestedRoles: [
      "Full-Stack Web Developer",
      "Frontend Engineer",
      "Backend / API Engineer",
      "Cloud & DevOps Associate",
      "Data Analyst / ML Engineer",
    ],
    sections: [
      { key: "summary", label: "Technical Summary", description: "Engineering specialization, architecture philosophies, and primary stack.", required: true },
      { key: "technicalSkills", label: "Programming Languages & Tech Stack", description: "Languages, frameworks, databases, cloud, and developer tooling.", required: true },
      { key: "projects", label: "Engineering Projects & Live Deployments", description: "Full-stack apps, system architectures, GitHub links, and live URLs.", required: true, isSpecialized: true, evidencePrompt: "GitHub repo link or deployment URL" },
      { key: "experience", label: "Work Experience & Tech Internships", description: "Software engineering roles, agile sprint participation, and business metrics.", required: false },
      { key: "education", label: "Education & Degree", description: "B.Tech / B.E. / BCA / MCA in Computer Science or related engineering discipline.", required: true },
      { key: "certifications", label: "Certifications & Coding Achievements", description: "AWS / Google Cloud / LeetCode / Hackathon placements.", required: false, evidencePrompt: "Certificate link or credential badge" },
    ],
    competencyChecklist: [
      "Data Structures & Algorithmic Problem Solving",
      "Full-Stack Development (React/Next.js/Node)",
      "RESTful API & Relational Database Design (SQL)",
      "Git Workflow & CI/CD Fundamentals",
      "Cloud Deployment & Docker Containerization",
    ],
    officialResearchSources: [
      {
        sourceName: "NASSCOM FutureSkills Prime Competency Model",
        sourceUrl: "https://futureskillsprime.in",
        verificationDate: "2024-06-12",
        profession: "Software Engineering",
        targetRole: "Software Developer",
        summary: "Employers prioritize demonstrable repositories, unit testing awareness, and clean API design over static buzzwords.",
        isOfficialRegulation: false,
      },
    ],
  },

  COMMERCE: {
    domainKey: "COMMERCE",
    name: "Commerce, Finance & Banking",
    description: "Metrics and compliance-focused structure highlighting accounting, taxation, and financial analysis.",
    suggestedRoles: [
      "Financial Analyst",
      "Accountant / Tax Consultant",
      "Banking Operations Associate",
      "Audit Associate",
      "Equity Research Assistant",
    ],
    regulatoryGuidelines:
      "ICAI (Institute of Chartered Accountants of India) and regulatory standards emphasize statutory compliance, GST, IFRS/IndAS, and audit trails.",
    sections: [
      { key: "summary", label: "Executive & Financial Summary", description: "Financial analysis acumen, accounting software expertise, and reporting accuracy.", required: true },
      { key: "education", label: "Qualifications & Professional Degrees", description: "B.Com / BBA Finance / M.Com / CA Inter / CMA / CFA candidate.", required: true },
      { key: "financialSkills", label: "Accounting, Taxation & Financial Tools", description: "Tally Prime, SAP, Excel Financial Modeling, GST, Ind AS, ROC filings.", required: true, isSpecialized: true },
      { key: "projects", label: "Financial Modeling & Audit Projects", description: "Portfolio valuation, tax audit simulations, ratio analysis, balance sheet reconciliations.", required: true, isSpecialized: true, evidencePrompt: "Spreadsheet model link or project report" },
      { key: "experience", label: "Internships & Articleship Experience", description: "CA articleship, bank internships, or accounts payable/receivable exposure.", required: false, evidencePrompt: "Articleship / Internship completion letter" },
      { key: "certifications", label: "Certifications & Compliances", description: "NISM certifications, Advanced Excel, Financial Modeling certifications.", required: false },
    ],
    competencyChecklist: [
      "Financial Statement Analysis & Ratio Analysis",
      "Direct & Indirect Taxation (GST / Income Tax)",
      "Advanced Excel (VLOOKUP, Pivot, DCF Modeling)",
      "Statutory Audit & Internal Controls Compliance",
      "ERP Software Proficiency (Tally Prime / SAP)",
    ],
    officialResearchSources: [
      {
        sourceName: "Institute of Chartered Accountants of India (ICAI) Standards",
        sourceUrl: "https://www.icai.org",
        verificationDate: "2024-04-18",
        profession: "Finance & Accounting",
        targetRole: "Accountant / Analyst",
        summary: "Statutory compliance knowledge, reconciliations, and spreadsheet modeling accuracy are primary evaluation criteria.",
        isOfficialRegulation: true,
      },
    ],
  },

  DESIGN: {
    domainKey: "DESIGN",
    name: "Design & Creative Media",
    description: "Visual and portfolio-driven structure prioritizing design process, case studies, and tool proficiency.",
    suggestedRoles: [
      "UI/UX Product Designer",
      "Visual & Graphic Designer",
      "Interaction Designer",
      "Motion Graphics Designer",
      "Brand Identity Specialist",
    ],
    sections: [
      { key: "summary", label: "Design Statement & Portfolio Link", description: "Design philosophy, user empathy approach, and direct portfolio URL.", required: true },
      { key: "portfolio", label: "Selected Case Studies & Design Projects", description: "Figma case studies, problem statements, user research, wireframes, and prototypes.", required: true, isSpecialized: true, evidencePrompt: "Behance / Dribbble / Figma case study URL" },
      { key: "tools", label: "Design Tools & Prototyping", description: "Figma, Adobe Creative Suite (Illustrator, Photoshop), Principle, Webflow.", required: true },
      { key: "skills", label: "Core Design Competencies", description: "Design systems, typography, information architecture, user testing, usability audits.", required: true },
      { key: "experience", label: "Design Internships & Client Work", description: "Freelance client deliveries, agency internships, cross-functional engineering handoffs.", required: false },
      { key: "education", label: "Education & Art Specialization", description: "B.Des / BFA / Visual Communication or related degrees.", required: true },
    ],
    competencyChecklist: [
      "User Research & Journey Mapping",
      "Wireframing & Interactive Prototyping (Figma)",
      "Design Systems & Component Libraries",
      "Responsive Layouts & Visual Hierarchy",
      "Developer Handoff & Design QA",
    ],
    officialResearchSources: [
      {
        sourceName: "National Institute of Design (NID) Curriculum Framework",
        sourceUrl: "https://www.nid.edu",
        verificationDate: "2024-05-30",
        profession: "Design",
        targetRole: "Product Designer",
        summary: "Emphasis on end-to-end design thinking methodology, documented user research, and rationalized design decisions.",
        isOfficialRegulation: false,
      },
    ],
  },

  LAW: {
    domainKey: "LAW",
    name: "Law & Legal Studies",
    description: "Jurisprudence and case-driven structure emphasizing drafting, court exposure, and legal research.",
    suggestedRoles: [
      "Corporate Legal Associate",
      "Litigation Associate",
      "Legal Research Analyst",
      "Compliance & Regulatory Officer",
      "Arbitration Specialist",
    ],
    regulatoryGuidelines:
      "Bar Council of India (BCI) rules govern legal practice. Resumes must accurately distinguish between enrolled advocates, law clerks, and student interns.",
    sections: [
      { key: "summary", label: "Professional Legal Summary", description: "Practice area interests (Corporate, Criminal, IPR, Civil) and jurisdictional focus.", required: true },
      { key: "education", label: "Legal Qualifications & Bar Status", description: "LL.B / B.A. LL.B / B.B.A. LL.B / LL.M, university rank, and Bar enrollment status.", required: true },
      { key: "internships", label: "Judicial & Chamber Internships", description: "High Court/Supreme Court clerkships, law firm internships, chambers experience.", required: true, isSpecialized: true, evidencePrompt: "Chamber internship certificate" },
      { key: "mootCourt", label: "Moot Court & Trial Competitions", description: "National moots, memorials drafted, researcher awards, parliamentary debates.", required: true, isSpecialized: true, evidencePrompt: "Moot certificate or award document" },
      { key: "legalResearch", label: "Legal Research & Publications", description: "SCC Online/Manupatra research, articles published in recognized law journals.", required: false, evidencePrompt: "Published paper link or journal DOI" },
      { key: "drafting", label: "Drafting & Advisory Competencies", description: "Contracts, NDAs, writ petitions, legal notices, due diligence reports.", required: true, isSpecialized: true },
    ],
    competencyChecklist: [
      "Statutory & Case Law Research (SCC/Manupatra)",
      "Pleadings & Contractual Drafting",
      "Corporate Due Diligence & Regulatory Filing",
      "Oral Advocacy & Legal Reasoning",
      "Client Advisory & Conflict Analysis",
    ],
    officialResearchSources: [
      {
        sourceName: "Bar Council of India (BCI) Rules for Legal Education",
        sourceUrl: "http://www.barcouncilofindia.org",
        verificationDate: "2024-02-14",
        profession: "Legal Profession",
        targetRole: "Legal Associate",
        summary: "Rigorous standards for internship documentation, continuous moot court participation, and ethics compliance.",
        isOfficialRegulation: true,
      },
    ],
  },

  GENERAL: {
    domainKey: "GENERAL",
    name: "Arts, Sciences & Multidisciplinary",
    description: "Versatile foundation adapting to diverse disciplines, liberal arts, and general fresh graduates.",
    suggestedRoles: [
      "Operations Coordinator",
      "Content & Communications Specialist",
      "Research Associate",
      "Human Resources Associate",
      "Business Development Executive",
    ],
    sections: [
      { key: "summary", label: "Professional Profile", description: "Core academic strengths, leadership initiatives, and transferable professional skills.", required: true },
      { key: "education", label: "Education & Degree", description: "Undergraduate / Postgraduate degrees, honors, and key coursework.", required: true },
      { key: "skills", label: "Core Competencies & Tools", description: "Transferable skills, languages, digital tools, and analytical abilities.", required: true },
      { key: "projects", label: "Projects & Academic Research", description: "Fieldwork, dissertations, community initiatives, or creative portfolios.", required: true, evidencePrompt: "Project documentation or live link" },
      { key: "experience", label: "Experience & Student Leadership", description: "Student council, university societies, part-time roles, or internships.", required: false },
      { key: "achievements", label: "Honors, Awards & Certifications", description: "Academic merit awards, debate titles, or recognized certifications.", required: false },
    ],
    competencyChecklist: [
      "Analytical & Written Communication",
      "Project & Stakeholder Coordination",
      "Critical Problem Solving & Synthesis",
      "Digital Productivity Tools",
      "Cross-Functional Team Collaboration",
    ],
    officialResearchSources: [
      {
        sourceName: "National Career Service (NCS) Youth Employability Guide",
        sourceUrl: "https://www.ncs.gov.in",
        verificationDate: "2024-01-15",
        profession: "Multidisciplinary",
        targetRole: "Graduate Trainee",
        summary: "Transferable problem-solving, verified project ownership, and strong communication skills drive entry-level selection.",
        isOfficialRegulation: false,
      },
    ],
  },
};

/**
 * Resolves the appropriate resume framework for any academic domain string.
 */
export function getFrameworkForDomain(domainString?: string): DomainResumeFramework {
  if (!domainString) return RESUME_FRAMEWORKS.GENERAL;
  const upper = domainString.toUpperCase();

  if (upper.includes("HEALTH") || upper.includes("NURS") || upper.includes("MEDIC") || upper.includes("PHARM")) {
    return RESUME_FRAMEWORKS.HEALTHCARE;
  }
  if (upper.includes("TEACH") || upper.includes("EDUCAT") || upper.includes("PEDAGOG")) {
    return RESUME_FRAMEWORKS.EDUCATION;
  }
  if (upper.includes("ENGIN") || upper.includes("TECH") || upper.includes("COMPUT") || upper.includes("IT") || upper.includes("SOFTWARE")) {
    return RESUME_FRAMEWORKS.ENGINEERING;
  }
  if (upper.includes("COMMERC") || upper.includes("FINANC") || upper.includes("ACCOUNT") || upper.includes("BANK") || upper.includes("MANAGEMENT")) {
    return RESUME_FRAMEWORKS.COMMERCE;
  }
  if (upper.includes("DESIGN") || upper.includes("MEDIA") || upper.includes("ANIMAT") || upper.includes("UI") || upper.includes("UX")) {
    return RESUME_FRAMEWORKS.DESIGN;
  }
  if (upper.includes("LAW") || upper.includes("LEGAL") || upper.includes("JUDIC")) {
    return RESUME_FRAMEWORKS.LAW;
  }

  return RESUME_FRAMEWORKS.GENERAL;
}
