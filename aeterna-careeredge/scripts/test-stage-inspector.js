// scripts/test-stage-inspector.js
// Stage-by-Stage Inspector for Resume Parsing with 3 Projects
// Analyzes: (a) Raw extracted text, (b) Segmented sections, (c) Parser output, (d) Final mapped entries

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { SignJWT } = require("jose");

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";

function getAuthSecret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  const envPath = path.resolve(__dirname, "..", ".env");
  if (fs.existsSync(envPath)) {
    const match = fs.readFileSync(envPath, "utf8").match(/AUTH_SECRET=["']?([^"'\r\n]+)["']?/);
    if (match) return match[1];
  }
  return "default_dev_secret_careeredge";
}

async function mintSessionCookie(payload) {
  const secretKey = new TextEncoder().encode(getAuthSecret());
  const jwt = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);

  return `ace_session=${jwt}`;
}

const FIXTURE_3_PROJECTS = `John Doe
john.doe@example.com | +1 555-0199 | San Francisco, CA | https://github.com/johndoe

EDUCATION
B.S. in Computer Science, Stanford University
2020 - 2024 | GPA: 3.9/4.0

EXPERIENCE
Software Engineer Intern, CloudScale Inc 06/2023 – 08/2023
• Developed microservices using Node.js and TypeScript.
• Optimized query performance across PostgreSQL database.

PROJECTS
TaskMaster Pro
https://github.com/johndoe/taskmaster
• Built collaborative task management platform using Next.js and Prisma
and decreased database load by 40% across microservices.
• Implemented real-time WebSocket notifications with Redis Pub/Sub
• Reduced API response times by 35% through query caching

DevPulse Analytics
https://github.com/johndoe/devpulse
• Created developer metric tracking dashboard with interactive charts
• Processed over 100k daily telemetry events with Kafka and Go
• Deployed microservices to Kubernetes cluster with automated CI/CD

CloudVault Storage
https://github.com/johndoe/cloudvault
• Developed encrypted object storage system with AWS S3 integration
• Integrated OAuth2 and role-based access control with 99.9% uptime
• Wrote end-to-end integration tests using Jest and Playwright

SKILLS
TypeScript, React, Node.js, Next.js, Redis, Docker, PostgreSQL, Go
`;

async function main() {
  console.log("================================================================================");
  console.log("STAGE-BY-STAGE INSPECTION: 3-Project Resume Parsing Pipeline");
  console.log("================================================================================\n");

  const testUser = await prisma.user.findFirst();
  const sessionCookie = await mintSessionCookie({
    userId: testUser.id,
    sub: testUser.id,
    role: "STUDENT",
    name: testUser.name,
    email: testUser.email,
    onboardingCompleted: true,
  });

  // Call /api/resumes/upload with pastedText
  const form = new FormData();
  form.append("pastedText", FIXTURE_3_PROJECTS);
  form.append("consent", "true");

  console.log("--- STAGE (a): RAW EXTRACTED TEXT ---");
  console.log(`Length: ${FIXTURE_3_PROJECTS.length} characters, Lines: ${FIXTURE_3_PROJECTS.split("\n").length}`);
  const lines = FIXTURE_3_PROJECTS.split("\n");
  const projStartIdx = lines.findIndex(l => l.trim() === "PROJECTS");
  const skillsStartIdx = lines.findIndex(l => l.trim() === "SKILLS");
  console.log("Raw Projects lines snippet:\n");
  lines.slice(projStartIdx, skillsStartIdx).forEach((l, i) => {
    console.log(`  [Line ${i + 1}] "${l}"`);
  });

  const res = await fetch(`${BASE_URL}/api/resumes/upload`, {
    method: "POST",
    headers: { Cookie: sessionCookie },
    body: form,
  });

  if (!res.ok) {
    console.error("Upload failed with status:", res.status, await res.text());
    process.exit(1);
  }

  const json = await res.json();
  const parsed = json.parsedData || json.parsed;
  console.log("\n--- STAGE (b): SEGMENTED TEXT / EXTRACTED TEXT FROM SERVER ---");
  console.log(json.rawTextSnippet || json.extractedText || "No raw text snippet");

  console.log("\n--- STAGE (c): PARSER OUTPUT (projects array) ---");
  console.log(`Total Projects Found: ${parsed.projects.length} (EXPECTED: 3)\n`);
  parsed.projects.forEach((p, idx) => {
    console.log(`  [Project ${idx + 1}]`);
    console.log(`    Title: "${p.title}"`);
    console.log(`    URL: ${p.url || "(none)"}`);
    console.log(`    Bullets count: ${p.bullets.length}`);
    p.bullets.forEach((b, bIdx) => {
      console.log(`      • Bullet ${bIdx + 1}: "${b}"`);
    });
  });

  // Now inspect convertParsedPayloadToResumeData by calling /api/resumes/import
  console.log("\n--- STAGE (d): FINAL MAPPED ENTRIES IN RESUME STUDIO ---");
  const importRes = await fetch(`${BASE_URL}/api/resumes/import`, {
    method: "POST",
    headers: {
      Cookie: sessionCookie,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      documentId: json.documentId,
      approvedPayload: parsed,
      importToPassport: false,
      createResume: true,
      resumeTitle: "Inspector Test Resume",
      targetRole: "Full Stack Engineer",
    }),
  });

  const importJson = await importRes.json();
  const resume = await prisma.resume.findUnique({
    where: { id: importJson.resumeId },
  });

  const resumePayload = JSON.parse(resume.structuredData || resume.payload || "{}");
  const projSec = resumePayload.sections.find(s => s.type === "projects");
  console.log(`Resume Studio Projects Section Entries count: ${projSec.entries.length}\n`);
  projSec.entries.forEach((e, idx) => {
    console.log(`  [Entry ${idx + 1}] Title: "${e.title}", Bullets: ${e.bullets.length}, URL: ${e.url || "none"}`);
  });

  // Clean up test resume
  await prisma.resume.delete({ where: { id: importJson.resumeId } });
  if (json.documentId) {
    await prisma.storedDocument.delete({ where: { id: json.documentId } }).catch(() => {});
  }
}

main().catch(err => {
  console.error("Inspector error:", err);
  process.exit(1);
});
