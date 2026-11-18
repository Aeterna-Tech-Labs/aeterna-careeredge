// aeterna-careeredge/scripts/test-passport-deduplication.js
// Verification suite: Full Career Passport Deduplication & Idempotent Import Engine

const { PrismaClient } = require("@prisma/client");
const { SignJWT } = require("jose");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

function getAuthSecret() {
  const envPath = path.join(__dirname, "..", ".env");
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf-8");
    const match = envFile.match(/AUTH_SECRET=["']?([^"'\r\n]+)["']?/);
    if (match) return match[1];
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

async function run() {
  console.log("================================================================================");
  console.log("TEST SUITE: Career Passport Deduplication & Multi-Import Idempotency");
  console.log("================================================================================\n");

  // 1. Find or seed a dedicated student
  const email = `dedup.test.${Date.now()}@aeterna.test`;
  const user = await prisma.user.create({
    data: {
      name: "Deduplication Tester",
      email,
      passwordHash: "dummyhash",
      onboardingCompleted: true,
      profile: {
        create: {
          academicDomain: "ENGINEERING",
          passportScore: 60,
        },
      },
    },
  });

  const userId = user.id;
  console.log(`1. Created test student: ${userId} (${email})`);

  // Mock approved payload representing a full parsed resume
  const mockResumePayload = {
    contactInfo: {
      name: "Deduplication Tester",
      email,
      phone: "+91 9876543210",
      location: "Bengaluru, Karnataka",
    },
    education: [
      {
        institution: "PES University, Bengaluru",
        degree: "B.Tech in Computer Science and Engineering",
        branch: "Computer Science",
        startYear: "2021",
        endYear: "2025",
        score: "9.2 CGPA",
      },
    ],
    experience: [
      {
        title: "Software Engineering Intern",
        company: "Accenture India",
        bullets: [
          "Developed microservices with Spring Boot and Node.js.",
          "Automated deployment pipelines using Docker and GitHub Actions.",
        ],
        isCurrent: false,
      },
    ],
    projects: [
      {
        title: "Cloud Resource Optimizer",
        bullets: [
          "Monitors AWS EC2 instances and dynamically scales workloads.",
          "Cut test environment cloud spend by 35%.",
        ],
        url: "https://github.com/tester/cloud-optimizer",
      },
      {
        title: "AI Semantic Search Engine",
        bullets: [
          "RAG search with vector embeddings across 10,000 PDF documents.",
          "Sub-second semantic lookup with 96% precision.",
        ],
        url: "https://github.com/tester/semantic-search",
      },
    ],
    skills: [
      { name: "TypeScript", category: "TECHNICAL" },
      { name: "React", category: "TECHNICAL" },
      { name: "React.js", category: "TECHNICAL" }, // duplicate alias of React!
      { name: "Node.js", category: "TECHNICAL" },
      { name: "PostgreSQL", category: "TECHNICAL" },
    ],
    certifications: [
      {
        title: "AWS Certified Cloud Practitioner",
        issuer: "Amazon Web Services",
        url: "https://aws.amazon.com/verify/123",
      },
    ],
  };

  const sessionCookie = await mintSessionCookie({
    userId,
    sub: userId,
    role: "STUDENT",
    name: user.name,
    email: user.email,
    onboardingCompleted: true,
  });

  try {
    // 2. Perform FIRST Import
    console.log("\n2. Performing FIRST resume import into Career Passport...");
    const res1 = await fetch("http://localhost:3000/api/resumes/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        approvedPayload: mockResumePayload,
        saveToPassport: true,
        createResume: true,
        resumeTitle: "Test Resume 1",
      }),
    });

    const data1 = await res1.json();
    console.log("Import 1 status:", res1.status, "success:", data1.success);
    if (!data1.success) throw new Error("First import failed: " + JSON.stringify(data1));

    // Verify initial counts in database
    const edu1 = await prisma.educationRecord.count({ where: { userId } });
    const exp1 = await prisma.studentExperience.count({ where: { userId } });
    const proj1 = await prisma.studentProject.count({ where: { userId } });
    const skills1 = await prisma.studentSkill.count({ where: { userId } });
    const certs1 = await prisma.certification.count({ where: { userId } });

    console.log(`Initial counts -> Edu: ${edu1}, Exp: ${exp1}, Proj: ${proj1}, Skills: ${skills1}, Certs: ${certs1}`);

    if (edu1 !== 1) throw new Error(`Expected 1 education, got ${edu1}`);
    if (exp1 !== 1) throw new Error(`Expected 1 experience, got ${exp1}`);
    if (proj1 !== 2) throw new Error(`Expected 2 projects, got ${proj1}`);
    // "React" and "React.js" should normalize to the same skill!
    if (skills1 !== 4) throw new Error(`Expected 4 distinct skills (React/React.js consolidated), got ${skills1}`);
    if (certs1 !== 1) throw new Error(`Expected 1 certification, got ${certs1}`);
    console.log("  ✓ First import successfully populated Career Passport without skill alias duplicates");

    // 3. Perform SECOND Import of the SAME resume (Simulating user re-uploading)
    console.log("\n3. Performing SECOND import of the EXACT SAME RESUME...");
    const res2 = await fetch("http://localhost:3000/api/resumes/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        approvedPayload: mockResumePayload,
        saveToPassport: true,
        createResume: true,
        resumeTitle: "Test Resume 2",
      }),
    });

    const data2 = await res2.json();
    console.log("Import 2 status:", res2.status, "success:", data2.success);
    if (!data2.success) throw new Error("Second import failed: " + JSON.stringify(data2));

    // Check counts after second import
    const edu2 = await prisma.educationRecord.count({ where: { userId } });
    const exp2 = await prisma.studentExperience.count({ where: { userId } });
    const proj2 = await prisma.studentProject.count({ where: { userId } });
    const skills2 = await prisma.studentSkill.count({ where: { userId } });
    const certs2 = await prisma.certification.count({ where: { userId } });

    console.log(`Counts after re-import -> Edu: ${edu2}, Exp: ${exp2}, Proj: ${proj2}, Skills: ${skills2}, Certs: ${certs2}`);

    if (edu2 !== 1) throw new Error(`DUPLICATE DETECTED! Expected 1 education, got ${edu2}`);
    if (exp2 !== 1) throw new Error(`DUPLICATE DETECTED! Expected 1 experience, got ${exp2}`);
    if (proj2 !== 2) throw new Error(`DUPLICATE DETECTED! Expected 2 projects, got ${proj2}`);
    if (skills2 !== 4) throw new Error(`DUPLICATE DETECTED! Expected 4 skills, got ${skills2}`);
    if (certs2 !== 1) throw new Error(`DUPLICATE DETECTED! Expected 1 certification, got ${certs2}`);
    console.log("  ✓ Re-import is 100% idempotent: ZERO duplicate records created!");

    // 4. Test Deduplication API Endpoint
    console.log("\n4. Testing /api/passport/deduplicate on-demand endpoint...");
    const resDedup = await fetch("http://localhost:3000/api/passport/deduplicate", {
      method: "POST",
      headers: {
        Cookie: sessionCookie,
      },
    });
    const dataDedup = await resDedup.json();
    console.log("Deduplicate status:", resDedup.status, "message:", dataDedup.message);
    if (dataDedup.summary?.totalRemoved !== 0) {
      throw new Error(`Expected 0 redundant records for clean user, got ${dataDedup.summary.totalRemoved}`);
    }
    console.log("  ✓ Deduplicate API reports clean state: 0 duplicates");

    // 5. Test Intentional Injected Duplicate and Automatic Consolidation
    console.log("\n5. Testing automatic cleanup of injected legacy duplicate...");
    // Inject duplicate education directly into database
    await prisma.educationRecord.create({
      data: {
        userId,
        institution: "PES University, Bengaluru",
        degree: "B.Tech in Computer Science and Engineering",
        level: "UG",
        startYear: 2021,
        endYear: 2025,
        dataOrigin: "LEGACY_DUPLICATE",
      },
    });

    const countBefore = await prisma.educationRecord.count({ where: { userId } });
    console.log(`Injected 1 duplicate education record (total now: ${countBefore})`);

    const resClean = await fetch("http://localhost:3000/api/passport/deduplicate", {
      method: "POST",
      headers: {
        Cookie: sessionCookie,
      },
    });
    const dataClean = await resClean.json();
    console.log("Cleanup status:", resClean.status, "summary:", dataClean.summary);
    if (dataClean.summary?.educationsRemoved !== 1) {
      throw new Error(`Expected 1 education removed, got ${dataClean.summary?.educationsRemoved}`);
    }

    const countAfter = await prisma.educationRecord.count({ where: { userId } });
    if (countAfter !== 1) {
      throw new Error(`Expected exactly 1 education remaining, got ${countAfter}`);
    }
    console.log("  ✓ Injected duplicate successfully detected, merged, and removed!");

    console.log("\n================================================================================");
    console.log("🎉 ALL PASSPORT DEDUPLICATION & IDEMPOTENCY TESTS PASSED!");
    console.log("================================================================================");
  } finally {
    // Teardown
    await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    await prisma.$disconnect();
  }
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
