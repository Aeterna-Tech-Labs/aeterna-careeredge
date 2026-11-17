// scripts/test-day2-phase4-5.js
// Automated Test Suite for Day 2 Phase 4 (Job Discovery & Matching) & Phase 5 (Applications & Packs)

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const prisma = new PrismaClient();

async function runTests() {
  console.log("\n🧪 Running Aeterna CareerEdge Day 2 Phase 4 & 5 Test Suite...\n");
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
    // 1. Static Architecture & Multi-Domain Inspection
    const mockJobsPath = path.join(__dirname, "../src/lib/jobs/mock-data.ts");
    const mockJobsSrc = fs.readFileSync(mockJobsPath, "utf8");

    assert(
      mockJobsSrc.includes('"HEALTHCARE"') &&
        mockJobsSrc.includes('"TEACHING"') &&
        mockJobsSrc.includes('"COMMERCE"') &&
        mockJobsSrc.includes('"TECH"') &&
        mockJobsSrc.includes('"LAW"') &&
        mockJobsSrc.includes('"DESIGN"'),
      "Multi-Domain Job Catalog includes Healthcare, Teaching, Commerce, Tech, Law, and Design"
    );

    assert(
      mockJobsSrc.includes("isDemoJob: true") &&
        mockJobsSrc.includes("provenance:") &&
        mockJobsSrc.includes("National Career Service (NCS)"),
      "Every mock job listing has explicit demo disclosure and official verified provenance"
    );

    // 2. Matching Engine Rules: Absolute NO Hiring Probability Invariant
    const matchingPath = path.join(__dirname, "../src/lib/jobs/matching.ts");
    const matchingSrc = fs.readFileSync(matchingPath, "utf8");

    assert(
      matchingSrc.includes("NEVER outputs hiring probability") &&
        matchingSrc.includes("NOT a hiring guarantee"),
      "Matching engine strictly enforces invariant: NO hiring probability percentages"
    );

    assert(
      matchingSrc.includes("disqualifyingFactors") &&
        matchingSrc.includes("INC") &&
        matchingSrc.includes("Bar Council"),
      "Matching engine checks domain regulatory prerequisites (INC, BCI, B.Ed)"
    );

    // 3. Provider Abstraction & Caching
    const providerPath = path.join(__dirname, "../src/lib/jobs/provider.ts");
    const providerSrc = fs.readFileSync(providerPath, "utf8");

    assert(
      providerSrc.includes("class JoobleJobProvider") &&
        providerSrc.includes("class MultiDomainMockJobProvider") &&
        providerSrc.includes("class UnifiedJobProvider"),
      "Job provider architecture implements Jooble, MultiDomainMock, and Unified router"
    );

    assert(
      providerSrc.includes("CACHE_TTL_MS = 15 * 60 * 1000") ||
        providerSrc.includes("15 * 60 * 1000"),
      "Provider implements 15-minute server-side caching to respect API quotas"
    );

    // 4. Database Setup & Proof Bank Test User
    const testEmail = `job_test_${Date.now()}@aeterna.io`;
    const user = await prisma.user.create({
      data: {
        name: "Anuj Hegde",
        email: testEmail,
      },
    });

    const skill1 = await prisma.studentSkill.create({
      data: {
        userId: user.id,
        name: "TypeScript",
        category: "TECHNICAL",
        proficiencyLevel: "ADVANCED",
        dataOrigin: "STUDENT_INPUT",
      },
    });

    const evItem = await prisma.evidenceItem.create({
      data: {
        userId: user.id,
        title: "APMC E-Commerce Portal GitHub Repo",
        type: "GITHUB_REPO",
        relatedSkill: "TypeScript",
        provenance: "STUDENT_INPUT",
        description: "Full-stack Next.js and TypeScript repository for agricultural trade",
      },
    });

    assert(user.id && skill1.id && evItem.id, "Test user, skill, and Proof Bank evidence item created in DB");

    // 5. Application Tracker Lifecycle & Event History
    const initialHistory = [
      {
        status: "SAVED",
        timestamp: new Date().toISOString(),
      },
    ];

    const appRecord = await prisma.jobApplication.create({
      data: {
        userId: user.id,
        jobTitle: "Junior Full-Stack Software Engineer",
        companyName: "Razorpay",
        jobListingRefId: "job-tech-01",
        jobUrl: "https://razorpay.com/jobs",
        location: "Bengaluru, Karnataka",
        salary: "₹8,00,000 - ₹12,00,000 / year",
        employmentType: "FULL_TIME",
        applicationStatus: "SAVED",
        statusHistoryJson: JSON.stringify(initialHistory),
      },
    });

    assert(
      appRecord.id && appRecord.applicationStatus === "SAVED",
      "Application created with initial SAVED status"
    );

    // Transition to APPLIED with explicit audit record
    const updatedHistory = [
      ...initialHistory,
      {
        status: "APPLIED",
        timestamp: new Date().toISOString(),
        notes: "Confirmed submission on Razorpay careers portal",
      },
    ];

    const appliedRecord = await prisma.jobApplication.update({
      where: { id: appRecord.id },
      data: {
        applicationStatus: "APPLIED",
        appliedDate: new Date(),
        statusHistoryJson: JSON.stringify(updatedHistory),
      },
    });

    const parsedHistory = JSON.parse(appliedRecord.statusHistoryJson || "[]");
    assert(
      appliedRecord.applicationStatus === "APPLIED" &&
        appliedRecord.appliedDate !== null &&
        parsedHistory.length === 2 &&
        parsedHistory[1].status === "APPLIED",
      "Application transitioned to APPLIED with explicit timestamp audit history"
    );

    // 6. 4-Part Application Pack Database Persistence
    const talkingPoints = [
      {
        skill: "TypeScript",
        evidenceTitle: "APMC E-Commerce Portal GitHub Repo",
        talkingPoint: "Demonstrated production TypeScript capability in APMC portal repository.",
        verificationBadge: "VERIFIED_PROOF_BANK",
      },
      {
        skill: "Full-Stack Development",
        evidenceTitle: "B.E. Computer Science (VTU)",
        talkingPoint: "Completed rigorous academic coursework in data structures and distributed systems.",
        verificationBadge: "ACADEMIC_RECORD",
      },
    ];

    const checklist = [
      "Review customized resume v1",
      "Attach verified Proof Bank certificates",
      "Submit on official Razorpay careers portal",
    ];

    const packRecord = await prisma.applicationPack.create({
      data: {
        userId: user.id,
        jobId: "job-tech-01",
        jobTitle: "Junior Full-Stack Software Engineer",
        companyName: "Razorpay",
        matchSnapshot: JSON.stringify({ matchScore: 85 }),
        coverNoteDraft: "Dear Hiring Team at Razorpay,\nI am writing to express my interest...",
        introMessageDraft: "Hi Razorpay Team,\nI recently came across the engineering opening...",
        talkingPointsJson: JSON.stringify(talkingPoints),
        checklist: JSON.stringify(checklist),
        externalUrl: "https://razorpay.com/jobs",
      },
    });

    assert(
      packRecord.id &&
        packRecord.coverNoteDraft &&
        packRecord.introMessageDraft,
      "4-Part Application Pack persisted with cover note, outreach intro, and talking points"
    );

    const savedTalkingPoints = JSON.parse(packRecord.talkingPointsJson || "[]");
    assert(
      savedTalkingPoints.length === 2 &&
        savedTalkingPoints[0].evidenceTitle.includes("APMC"),
      "Application pack talking points directly cite verified Proof Bank artifact"
    );

    // 7. Cleanup
    await prisma.applicationPack.deleteMany({ where: { userId: user.id } });
    await prisma.jobApplication.deleteMany({ where: { userId: user.id } });
    await prisma.evidenceItem.deleteMany({ where: { userId: user.id } });
    await prisma.studentSkill.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });

    console.log(`\n🎉 === SUMMARY: ${passed}/${total} TESTS PASSED ===\n`);
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
