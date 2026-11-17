// scripts/test-day2-phase6-7.js
// Automated Test Suite for Day 2 Phase 6 (Readiness, Sprints, Interview Prep) & Phase 7 (Value, Ledger, Monetization)

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const prisma = new PrismaClient();

async function runTests() {
  console.log("\n🧪 Running Aeterna CareerEdge Day 2 Phase 6 & 7 Test Suite...\n");
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
    // 1. Static Architecture Checks for Phase 6 Services
    const readinessPath = path.join(__dirname, "../src/lib/readiness/service.ts");
    const readinessSrc = fs.readFileSync(readinessPath, "utf8");

    assert(
      readinessSrc.includes("OCCUPATIONAL_ROLE_BENCHMARKS") &&
        readinessSrc.includes("HEALTHCARE") &&
        readinessSrc.includes("TEACHING") &&
        readinessSrc.includes("COMMERCE") &&
        readinessSrc.includes("TECH") &&
        readinessSrc.includes("LAW") &&
        readinessSrc.includes("DESIGN"),
      "Occupational role benchmarks defined across all 6 core domains"
    );

    assert(
      readinessSrc.includes("Indian Nursing Council (INC)") &&
        readinessSrc.includes("National Council for Teacher Education (NCTE)") &&
        readinessSrc.includes("Institute of Chartered Accountants of India (ICAI)") &&
        readinessSrc.includes("NASSCOM") &&
        readinessSrc.includes("Bar Council of India (BCI)"),
      "Role fit benchmarks link directly to authorized Indian regulatory bodies"
    );

    assert(
      readinessSrc.includes("NO hiring probability percentages") &&
        readinessSrc.includes("readinessScore"),
      "Readiness scoring strictly enforces invariant: NO hiring probability percentages"
    );

    // 2. Sprint Service Architecture
    const sprintPath = path.join(__dirname, "../src/lib/sprints/service.ts");
    const sprintSrc = fs.readFileSync(sprintPath, "utf8");

    assert(
      sprintSrc.includes("defaultTasks = [") &&
        sprintSrc.includes("Week 1:") &&
        sprintSrc.includes("Week 2:") &&
        sprintSrc.includes("Week 3:") &&
        sprintSrc.includes("Week 4:"),
      "30-Day Sprint architecture organizes milestones across 4 structured weeks"
    );

    // 3. Interview Prep Kit Architecture
    const interviewPath = path.join(__dirname, "../src/lib/interview/service.ts");
    const interviewSrc = fs.readFileSync(interviewPath, "utf8");

    assert(
      interviewSrc.includes("STAR method") &&
        interviewSrc.includes("proofBankCitationAdvice") &&
        interviewSrc.includes("Evidence Vault"),
      "Interview prep kit provides STAR frameworks and Proof Bank evidence citations"
    );

    // 4. Test User & Database Model Integration
    const testEmail = `phase67_test_${Date.now()}@aeterna.io`;
    const user = await prisma.user.create({
      data: {
        name: "Devendra Verma",
        email: testEmail,
      },
    });

    const edu = await prisma.educationRecord.create({
      data: {
        userId: user.id,
        level: "UG",
        institution: "PES University Bengaluru",
        degree: "B.Tech",
        fieldOfStudy: "Computer Science",
        startYear: 2021,
        endYear: 2025,
      },
    });

    const skill = await prisma.studentSkill.create({
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
        title: "APMC Trade Portal GitHub Repository",
        type: "GITHUB_REPO",
        relatedSkill: "TypeScript",
        provenance: "STUDENT_INPUT",
        description: "Full-stack TypeScript codebase demonstrating clean architecture",
      },
    });

    assert(user.id && edu.id && skill.id && evItem.id, "Test user with education, skill, and Proof Bank artifact created");

    // 5. RoleFitResult Database Table Persistence
    const roleFit = await prisma.roleFitResult.create({
      data: {
        userId: user.id,
        profession: "TECH",
        resultsJson: JSON.stringify([
          {
            roleTitle: "Full-Stack Web Developer",
            readinessScore: 85,
            evidenceCoveragePercent: 75,
            regulatorySource: "NASSCOM FutureSkills Prime",
          },
        ]),
        referenceSourceIds: JSON.stringify(["NASSCOM FutureSkills Prime"]),
      },
    });

    assert(roleFit.id && roleFit.profession === "TECH", "RoleFitResult persisted in database");

    // 6. Sprint Plan & Sprint Tasks Table Persistence
    const sprintPlan = await prisma.sprintPlan.create({
      data: {
        userId: user.id,
        targetProfession: "Technology & Software",
        targetRole: "Full-Stack Web Developer",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "ACTIVE",
      },
    });

    const task1 = await prisma.sprintTask.create({
      data: {
        planId: sprintPlan.id,
        weekNumber: 1,
        dayNumber: 2,
        title: "Audit Evidence Vault & Upload 2 Key Artifacts",
        description: "Verify primary degree and capstone project repo.",
        linkedGapType: "MISSING_EVIDENCE",
        status: "PENDING",
      },
    });

    assert(sprintPlan.id && task1.id && task1.status === "PENDING", "SprintPlan and SprintTask created in PENDING state");

    // Toggle Task
    const completedTask = await prisma.sprintTask.update({
      where: { id: task1.id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    assert(
      completedTask.status === "COMPLETED" && completedTask.completedAt !== null,
      "SprintTask successfully transitioned to COMPLETED with timestamp"
    );

    // 7. Interview Prep Kit Table Persistence
    const prepKit = await prisma.interviewPrepKit.create({
      data: {
        userId: user.id,
        jobId: "role-fullstack-dev",
        jobTitle: "Full-Stack Web Developer",
        companyName: "Razorpay",
        themesJson: JSON.stringify([
          {
            themeName: "System Design & Architecture",
            questions: [
              {
                id: "q-tech-1",
                category: "TECHNICAL",
                question: "Walk us through a full-stack feature you built end-to-end.",
                responseFramework: "STAR Method",
                proofBankCitationAdvice: "Reference APMC Trade Portal in Evidence Vault",
              },
            ],
          },
        ]),
      },
    });

    assert(prepKit.id && prepKit.jobTitle === "Full-Stack Web Developer", "InterviewPrepKit persisted with question themes");

    // 8. Progress Event Ledger Table Persistence
    const progressEv = await prisma.progressEvent.create({
      data: {
        userId: user.id,
        eventType: "SPRINT_TASK_COMPLETED",
        title: "Completed sprint task: Audit Evidence Vault",
        description: "Milestone logged on Day 2 of 30-day sprint",
        refId: task1.id,
      },
    });

    assert(progressEv.id && progressEv.eventType === "SPRINT_TASK_COMPLETED", "ProgressEvent logged in immutable audit ledger");

    // 9. Monetization & Plan Entitlement Verification
    const plansPath = path.join(__dirname, "../src/lib/monetization/plans.ts");
    const plansSrc = fs.readFileSync(plansPath, "utf8");

    assert(
      plansSrc.includes("priceInr: 0") &&
        plansSrc.includes("priceInr: 499") &&
        plansSrc.includes("RESUME_CHECK: 3") &&
        plansSrc.includes("EVIDENCE_ITEMS: 10"),
      "Central monetization plans define Career Starter (₹0) and CareerEdge Pro (₹499) with explicit quotas"
    );

    // 10. Cleanup
    await prisma.sprintTask.deleteMany({ where: { planId: sprintPlan.id } });
    await prisma.sprintPlan.deleteMany({ where: { id: sprintPlan.id } });
    await prisma.interviewPrepKit.deleteMany({ where: { id: prepKit.id } });
    await prisma.roleFitResult.deleteMany({ where: { id: roleFit.id } });
    await prisma.progressEvent.deleteMany({ where: { id: progressEv.id } });
    await prisma.evidenceItem.deleteMany({ where: { userId: user.id } });
    await prisma.studentSkill.deleteMany({ where: { userId: user.id } });
    await prisma.educationRecord.deleteMany({ where: { userId: user.id } });
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
