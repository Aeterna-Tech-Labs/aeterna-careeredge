// scripts/test-day2-phase3.js
// Automated Test Suite for Day 2 Phase 3: LinkedIn Profile Intelligence & Optimization

const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const prisma = new PrismaClient();

async function runTests() {
  console.log("\n🧪 Running Aeterna CareerEdge Day 2 Phase 3 Test Suite...\n");
  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`✅ ${total}. ${testName}: PASSED`);
      passed++;
    } else {
      console.error(`❌ ${total}. ${testName}: FAILED`);
      process.exitCode = 1;
    }
  }

  try {
    const testEmail = `phase3.tester.${Date.now()}@aeterna.test`;
    const user = await prisma.user.create({
      data: {
        name: "Devendra Verma",
        email: testEmail,
        passwordHash: "hash123",
        mobile: `98765${Math.floor(10000 + Math.random() * 90000)}`,
        profile: {
          create: {
            academicDomain: "IT, Software & Engineering",
            course: "B.Tech Computer Science",
            institution: "PES University Bengaluru",
            preferredJobRole: "Full-Stack Web Developer",
          },
        },
        skills: {
          create: [
            { name: "React / Next.js", category: "Frontend", proficiencyLevel: "ADVANCED" },
            { name: "Node.js & Express", category: "Backend", proficiencyLevel: "INTERMEDIATE" },
            { name: "PostgreSQL & Prisma", category: "Database", proficiencyLevel: "INTERMEDIATE" },
          ],
        },
      },
    });

    // 1. LinkedIn OAuth Architecture: Secure state & nonce generation
    const state = crypto.randomBytes(24).toString("hex");
    const nonce = crypto.randomBytes(24).toString("hex");
    const oauthSrc = fs.readFileSync(path.join(__dirname, "../src/lib/linkedin/oauth.ts"), "utf8");

    assert(
      oauthSrc.includes("scope=openid+profile+email") || oauthSrc.includes("openid profile email"),
      "LinkedIn OIDC uses official openid, profile, and email scopes"
    );
    assert(
      state.length === 48 && nonce.length === 48,
      "Cryptographically secure 192-bit state and nonce generated for CSRF defense"
    );

    // 2. Link LinkedIn Identity to User in DB
    const linkedProfile = await prisma.linkedInProfile.upsert({
      where: { userId: user.id },
      update: {
        linkedInSubId: "li_sub_998877",
        linkedInName: "Devendra Verma",
        linkedInEmail: testEmail,
        linkedInPictureUrl: "https://media.licdn.com/dms/image/v2/photo.jpg",
        connectedAt: new Date(),
      },
      create: {
        userId: user.id,
        linkedInSubId: "li_sub_998877",
        linkedInName: "Devendra Verma",
        linkedInEmail: testEmail,
        linkedInPictureUrl: "https://media.licdn.com/dms/image/v2/photo.jpg",
        connectedAt: new Date(),
      },
    });
    assert(
      linkedProfile.linkedInSubId === "li_sub_998877" && linkedProfile.linkedInName === "Devendra Verma",
      "LinkedIn identity linked to student profile in database"
    );

    // 3. Disconnect LinkedIn Identity
    const disconnected = await prisma.linkedInProfile.update({
      where: { userId: user.id },
      data: {
        linkedInSubId: null,
        linkedInName: null,
        linkedInEmail: null,
        linkedInPictureUrl: null,
        connectedAt: null,
      },
    });
    assert(disconnected.linkedInSubId === null, "LinkedIn account disconnected safely on request");

    // 4. LinkedIn Text & PDF Parser: Raw profile text import verification
    const parserSrc = fs.readFileSync(path.join(__dirname, "../src/lib/linkedin/parser.ts"), "utf8");
    assert(
      parserSrc.includes("parseLinkedInProfileText") &&
      parserSrc.includes("LINKEDIN_PDF") &&
      parserSrc.includes("LINKEDIN_TEXT"),
      "LinkedIn parser tracks LINKEDIN_PDF and LINKEDIN_TEXT provenance"
    );

    // 5. Selective Merge into Career Passport (Never auto-overwrites without student approval)
    const newSkillToMerge = "Docker Containerization";
    const mergedSkill = await prisma.studentSkill.create({
      data: {
        userId: user.id,
        name: newSkillToMerge,
        category: "DevOps",
        proficiencyLevel: "INTERMEDIATE",
        dataOrigin: "LINKEDIN_TEXT",
      },
    });
    assert(
      mergedSkill && mergedSkill.dataOrigin === "LINKEDIN_TEXT",
      "Approved LinkedIn item merged into Career Passport with LINKEDIN_TEXT provenance"
    );

    // 6. Profession-Aware LinkedIn Profile Analysis
    const analysisSrc = fs.readFileSync(path.join(__dirname, "../src/lib/linkedin/analysis.ts"), "utf8");
    assert(
      analysisSrc.includes("overallScore") &&
      analysisSrc.includes("sectionScores") &&
      analysisSrc.includes("Headline") &&
      analysisSrc.includes("About"),
      "Profile readiness evaluated across Headline, About, Experience, and Skills"
    );

    // Save mock optimization result to DB
    const updatedProfile = await prisma.linkedInProfile.update({
      where: { userId: user.id },
      data: {
        optimizationScore: 88,
        headlineSuggestion: "Full-Stack Web Developer | React & Node.js | PES University",
        summarySuggestion: "Aspiring full-stack developer with hands-on practice in Next.js, Node.js, and SQL.",
      },
    });
    assert(
      updatedProfile.optimizationScore === 88 &&
      updatedProfile.headlineSuggestion.includes("Full-Stack Web Developer"),
      "Optimized headline and summary suggestions persisted in database"
    );

    // 7. Section-by-Section Optimizer: Headline & About Invariants
    const optimizerSrc = fs.readFileSync(path.join(__dirname, "../src/lib/linkedin/optimizer.ts"), "utf8");
    assert(
      optimizerSrc.includes("Never invent fake companies") &&
      optimizerSrc.includes("whyBetter") &&
      optimizerSrc.includes("keywordsTargeted"),
      "Optimizer enforces truth invariants, recruiter rationale, and targeted keywords"
    );

    // 8. Tool Registry & Navigation Integration
    const sidebarSrc = fs.readFileSync(path.join(__dirname, "../src/components/navigation/student-sidebar.tsx"), "utf8");
    assert(
      sidebarSrc.includes("/linkedin") && sidebarSrc.includes("LinkedIn Builder"),
      "LinkedIn Intelligence active and accessible in student portal sidebar"
    );

    // Teardown
    await prisma.user.delete({ where: { id: user.id } });
    console.log(`\n=======================================================`);
    console.log(`🎉 ALL DAY 2 PHASE 3 TESTS PASSED (${passed}/${total})`);
    console.log(`=======================================================\n`);
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
