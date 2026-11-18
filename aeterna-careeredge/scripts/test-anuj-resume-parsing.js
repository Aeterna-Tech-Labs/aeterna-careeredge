// scripts/test-anuj-resume-parsing.js
// Verification suite for Anuj Dandavate's resume structure and universal PDF parsing

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const { PrismaClient } = require("@prisma/client");
const { SignJWT } = require("jose");

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✕ FAIL: ${message}`);
    failed++;
  }
}

function getAuthSecret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  const candidatePaths = [
    path.join(__dirname, ".env"),
    path.join(__dirname, "..", ".env"),
    path.join(process.cwd(), ".env"),
  ];
  for (const envPath of candidatePaths) {
    try {
      if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, "utf8");
        const match = envFile.match(/AUTH_SECRET=["']?([^"'\r\n]+)["']?/);
        if (match) return match[1];
      }
    } catch {}
  }
  return "default_dev_secret_careeredge";
}

const AUTH_SECRET = getAuthSecret();

async function mintSessionCookie(payload) {
  const secretKey = new TextEncoder().encode(AUTH_SECRET);
  const jwt = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);

  return `ace_session=${jwt}`;
}

const ANUJ_RESUME_TEXT = `ANUJ DANDAVATE
anujwork2410@gmail.com | +91 9209224604 | Pune, Maharashtra | LinkedIn | GitHub | Portfolio

SUMMARY
Full-Stack Developer (MERN) with hands-on experience building production dashboards, REST APIs, and AI-enabled features using React, Node.js, Express, MongoDB, and PostgreSQL. Proven ability to ship end-to-end features — from database schema to pixel-perfect UI — with clean code, Git workflows, and AI-assisted development. Currently pursuing AWS Cloud training to strengthen deployment and infrastructure skills.

EXPERIENCE
APPLICATION DEVELOPMENT INTERN, Nexanova Pro Tech 06/2025 – 12/2025
• Engineered 15+ reusable React + TypeScript components with Tailwind CSS for a production admin dashboard, reducing UI development time by 25% and ensuring design consistency across the platform.
• Built and optimized REST APIs (Node.js/Express) with efficient data fetching patterns, reducing redundant network requests and improving page load speed by 15% for client-facing modules.
• Collaborated with design teams to implement responsive UI components using Material UI and Tailwind CSS, ensuring pixel-perfect alignment with Figma specs across all devices.

PROJECTS
Monitor Pulse , API Monitoring Platform - OnGoing Project
• Engineered a high-performance API monitoring platform using React and TypeScript, achieving 90+ Lighthouse performance scores through optimized rendering and reusable components.
• Built 10+ reusable and responsive UI components with Tailwind CSS, delivering consistent experiences across mobile, tablet, and desktop.
• Implemented 5+ application routes using React Router DOM, including nested routes, dynamic navigation, and scalable page-level architecture.
• Integrated 15+ Framer Motion interactions including hover animations, transitions, and animated status indicators for a polished and responsive user experience.
Github :- https://github.com/Anuj21d/Monitorly

RAG News Chatbot
• Developed a RAG-based chatbot achieving 95% accuracy retrieving from 500+ articles; built the React frontend with fallback UI for vector-store misses.
• Retrieval pipeline returns top-5 chunks in ~0.8s; added error handling + retry logic so API failures don't blank-screen the UI.
• Deployed on Render with monitoring.
Github :- https://github.com/Anuj21d/Projects_React/tree/main/Chat_Bot

AI Sketch Caption Generator
• Built a React app generating AI captions in ~4s; processed 3,000+ images with loading-state UI cutting perceived latency by ~40%.
• Designed REST API flow (upload → Gemini → caption) with error boundaries and retry logic for graceful failure handling.
• Deployed on Vercel with CI/CD; includes unit tests for caption-prompt builder.
GitHub :- https://github.com/Anuj21d/Projects_React/tree/main/react-ai-sketch-caption-generator

SKILLS
Programming Language: JavaScript (ES6+),Java,C++,python(basic)
Frameworks & Libraries:: React.js, Node.js, Express.js, REST APIs, Tailwind CSS, Material UI, GSAP, Framer Motion
Testing: Jest, Supertest
Databases: MySQL, PostgreSQL, MongoDB
Developer Tools: Git, GitHub, Vercel, Render, VS Code
AI & Other: Google Gemini API, RAG

TRAINING & CERTIFICATIONS
Restart (AWS Cloud Computing) — Currently Pursuing, HOPE Foundation
Focus: AWS Cloud Services, EC2, S3, IAM, VPC, Cloud Deployment

EDUCATION
Savitribai Phule Pune University (SPPU), Bachelor of Engineering in Artificial Intelligence & Data Science 2022 – 2026
• SGPA: 9.63 / 10
• CGPA: 8.46/10
• Relevant Coursework: Data Structures & Algorithms, Machine Learning, Database Management Systems, Cloud Computing, Object-Oriented Programming.

ANUJ DANDAVATE anujwork2410@gmail.com
`;

function buildSyntheticPdf(text) {
  const textTokens = text
    .split("\n")
    .map((line) => `(${line.replace(/[()\\]/g, "")}) Tj T*`)
    .join(" ");

  const decompressedStream = Buffer.from(`BT /F1 10 Tf 20 780 Td 12 TL ${textTokens} ET`);
  const deflatedStream = zlib.deflateSync(decompressedStream);

  return Buffer.concat([
    Buffer.from(
      "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n" +
      "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n" +
      "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n" +
      "4 0 obj\n<< /Length " + deflatedStream.length + " /Filter /FlateDecode >>\nstream\n"
    ),
    deflatedStream,
    Buffer.from("\nendstream\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF"),
  ]);
}

async function run() {
  console.log("================================================================================");
  console.log("TEST SUITE: Anuj Dandavate Resume Parsing & Universal PDF Ingestion");
  console.log("================================================================================\n");

  const pdfBuffer = buildSyntheticPdf(ANUJ_RESUME_TEXT);

  // 1. Setup User and Session Cookie
  console.log("1. Setting Up Student User & Session...");
  let testUser = await prisma.user.findFirst({
    where: { email: "anujwork2410@gmail.com" },
  });

  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        email: "anujwork2410@gmail.com",
        name: "Anuj Dandavate",
        passwordHash: "$2a$10$abcdefghijklmnopqrstuvwxyz123456",
        onboardingCompleted: true,
        profile: {
          create: {
            academicDomain: "Engineering & Technology",
            preferredJobRole: "Full Stack Developer",
          },
        },
      },
    });
  }

  const sessionCookie = await mintSessionCookie({
    userId: testUser.id,
    sub: testUser.id,
    role: "STUDENT",
    name: testUser.name,
    email: testUser.email,
    onboardingCompleted: true,
  });

  // 2. Test Live HTTP Upload Endpoint with Anuj's Resume PDF
  console.log("\n2. Testing Live HTTP Upload with Anuj's Digital PDF Resume...");
  const form = new FormData();
  form.append("file", new Blob([pdfBuffer], { type: "application/pdf" }), "Anuj_Dandavate_Resume.pdf");
  form.append("consent", "true");

  const resUpload = await fetch(`${BASE_URL}/api/resumes/upload`, {
    method: "POST",
    headers: { Cookie: sessionCookie },
    body: form,
  });

  const resText = await resUpload.text();
  let uploadJson = {};
  try {
    uploadJson = JSON.parse(resText);
  } catch {
    console.error("Upload response was not JSON:", resText);
  }

  assert(resUpload.status === 200, `POST /api/resumes/upload responded with HTTP 200 (Got: ${resUpload.status})`);
  assert(uploadJson.success === true, "Upload response indicates success: true");
  assert(uploadJson.documentId !== undefined, "Returns StoredDocument documentId");
  assert(uploadJson.isScanned === false || uploadJson.isScanned === undefined, "Resume correctly processed as digital selectable text (isScanned is false)");

  const parsed = uploadJson.parsedData || uploadJson.parsed;
  assert(parsed !== undefined, "Returns structured parsed preview for mandatory student review");

  // Assert Contact Info
  assert(parsed.contactInfo.name.toUpperCase().includes("ANUJ DANDAVATE"), `Contact name matches: ${parsed.contactInfo.name}`);
  assert(parsed.contactInfo.email === "anujwork2410@gmail.com", `Contact email matches: ${parsed.contactInfo.email}`);
  assert(parsed.contactInfo.phone.includes("9209224604"), `Contact phone matches: ${parsed.contactInfo.phone}`);
  assert(parsed.contactInfo.location.includes("Pune"), `Contact location matches: ${parsed.contactInfo.location}`);

  // Assert Summary
  assert(parsed.summary !== undefined && parsed.summary.includes("Full-Stack Developer"), "Summary section extracted");

  // Assert Experience
  console.log("PARSED EXPERIENCE ENTRIES:\n", JSON.stringify(parsed.experience, null, 2));
  assert(parsed.experience.length >= 1, `Experience entries found: ${parsed.experience.length}`);
  const exp0 = parsed.experience[0];
  assert(exp0.title.includes("APPLICATION DEVELOPMENT INTERN"), `Experience title: ${exp0.title}`);
  assert(exp0.company.includes("Nexanova Pro Tech"), `Experience company: ${exp0.company}`);
  assert(exp0.startDate === "06/2025" && exp0.endDate === "12/2025", `Experience dates: ${exp0.startDate} - ${exp0.endDate}`);
  assert(exp0.bullets.length >= 3, `Experience bullets count: ${exp0.bullets.length}`);

  // Assert Projects
  assert(parsed.projects.length >= 3, `Projects found: ${parsed.projects.length}`);
  const monitorly = parsed.projects.find((p) => p.title.toLowerCase().includes("monitor pulse"));
  assert(monitorly !== undefined, "Found 'Monitor Pulse' project");
  assert(monitorly && monitorly.url && monitorly.url.includes("github.com/Anuj21d/Monitorly"), `Project URL matched: ${monitorly?.url}`);

  const ragBot = parsed.projects.find((p) => p.title.toLowerCase().includes("rag news chatbot"));
  assert(ragBot !== undefined, "Found 'RAG News Chatbot' project");

  const aiSketch = parsed.projects.find((p) => p.title.toLowerCase().includes("ai sketch caption generator"));
  assert(aiSketch !== undefined, "Found 'AI Sketch Caption Generator' project");

  // Assert Skills
  assert(parsed.skills.length >= 8, `Skills parsed: ${parsed.skills.length}`);
  const skillNames = parsed.skills.map((s) => s.name.toLowerCase());
  assert(skillNames.some((s) => s.includes("javascript")), "Includes JavaScript skill");
  assert(skillNames.some((s) => s.includes("react")), "Includes React skill");
  assert(skillNames.some((s) => s.includes("node")), "Includes Node.js skill");
  assert(skillNames.some((s) => s.includes("tailwind")), "Includes Tailwind CSS skill");
  assert(skillNames.some((s) => s.includes("mongodb")), "Includes MongoDB skill");
  assert(skillNames.some((s) => s.includes("postgresql")), "Includes PostgreSQL skill");

  // Assert Certifications
  assert(parsed.certifications.length >= 1, `Certifications count: ${parsed.certifications.length}`);
  const cert0 = parsed.certifications[0];
  assert(cert0.title.includes("AWS Cloud Computing"), `Certification title: ${cert0.title}`);

  // Assert Education
  assert(parsed.education.length >= 1, `Education count: ${parsed.education.length}`);
  const edu0 = parsed.education[0];
  assert(edu0.institution.includes("Savitribai Phule Pune University") || edu0.degree.includes("Savitribai Phule Pune University"), `Education institution/degree matched: ${edu0.institution} / ${edu0.degree}`);
  assert(edu0.endYear === "2026", `Education graduation year: ${edu0.endYear}`);
  assert(edu0.score !== undefined && edu0.score.includes("9.63"), `Education score: ${edu0.score}`);

  // 3. Test Mandatory Review Import into Career Passport & Resume Studio Draft
  console.log("\n3. Testing Mandatory Review Import into Career Passport & Resume Studio Draft...");
  const importPayload = {
    documentId: uploadJson.documentId,
    approvedPayload: parsed,
    saveToPassport: true,
    createResume: true,
    resumeTitle: "Anuj Dandavate - Full Stack MERN Resume",
    targetRole: "Full Stack Developer",
  };

  const resImport = await fetch(`${BASE_URL}/api/resumes/import`, {
    method: "POST",
    headers: {
      Cookie: sessionCookie,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(importPayload),
  });

  const importText = await resImport.text();
  console.log("resImport status:", resImport.status, "body:", importText);
  let importJson = {};
  try { importJson = JSON.parse(importText); } catch {}

  assert(resImport.status === 201 || resImport.status === 200, `POST /api/resumes/import succeeded with HTTP ${resImport.status}`);
  assert(importJson.success === true, "Import reported success: true");
  assert(importJson.resumeId !== undefined, `Created Resume Studio draft (id: ${importJson.resumeId})`);

  // Verify DB entities created with provenance DOCUMENT_EXTRACTED
  const expDb = await prisma.studentExperience.findFirst({
    where: { userId: testUser.id, dataOrigin: "DOCUMENT_EXTRACTED" },
  });
  assert(expDb !== null && expDb.companyName.includes("Nexanova Pro Tech"), "Experience saved to Career Passport with DOCUMENT_EXTRACTED provenance");

  const projDb = await prisma.studentProject.findFirst({
    where: { userId: testUser.id, dataOrigin: "DOCUMENT_EXTRACTED" },
  });
  assert(projDb !== null, "Project saved to Career Passport with DOCUMENT_EXTRACTED provenance");

  const skillDb = await prisma.studentSkill.findFirst({
    where: { userId: testUser.id, dataOrigin: "DOCUMENT_EXTRACTED" },
  });
  assert(skillDb !== null, "Skill saved to Career Passport with DOCUMENT_EXTRACTED provenance");

  console.log("\n================================================================================");
  console.log(`TEST RESULTS: ${passed} passed, ${failed} failed.`);
  console.log("================================================================================\n");

  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
