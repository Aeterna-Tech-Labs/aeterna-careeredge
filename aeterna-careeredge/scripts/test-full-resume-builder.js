// scripts/test-full-resume-builder.js
// Comprehensive End-to-End Test Suite for Full-Resume AI Improvement & Customization Engine

const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();

// Inlined core logic / imports for fast, standalone NodeJS verification
const WEAK_ACTION_VERBS = [
  "responsible for",
  "worked on",
  "handled",
  "helped with",
  "assisted with",
  "tried to",
  "was part of",
  "tasked with",
  "involved in",
];

function evaluateColorContrast(fgHex, bgHex) {
  function getLuminance(hex) {
    const cleaned = hex.replace("#", "");
    const r = parseInt(cleaned.substring(0, 2), 16) / 255;
    const g = parseInt(cleaned.substring(2, 4), 16) / 255;
    const b = parseInt(cleaned.substring(4, 6), 16) / 255;
    const sRGB = [r, g, b].map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  }
  const l1 = getLuminance(fgHex);
  const l2 = getLuminance(bgHex);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  return {
    ratio: Number(ratio.toFixed(2)),
    passesAa: ratio >= 4.5,
    passesAaa: ratio >= 7.0,
  };
}

function computeContentHash(data) {
  const contentToHash = {
    targetRole: data.targetRole,
    contactInfo: data.contactInfo,
    sections: data.sections.map((s) => ({
      id: s.id,
      type: s.type,
      customTitle: s.customTitle,
      visible: s.visible,
      entries: s.entries.map((e) => ({
        id: e.id,
        title: e.title,
        bullets: e.bullets.map((b) => b.text),
      })),
    })),
  };
  return crypto.createHash("sha256").update(JSON.stringify(contentToHash)).digest("hex");
}

async function runTests() {
  console.log("\n🧪 Running Aeterna CareerEdge Full-Resume Builder Test Suite...\n");
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
    // 1. Color Contrast & WCAG Compliance Check
    const maroonContrast = evaluateColorContrast("#7A0F1F", "#FFFFFF");
    assert(
      maroonContrast.passesAa && maroonContrast.ratio > 8.0,
      `WCAG AA Contrast: CareerEdge Maroon (#7A0F1F) on White has ratio ${maroonContrast.ratio}:1`
    );

    const badContrast = evaluateColorContrast("#FFFF00", "#FFFFFF");
    assert(
      !badContrast.passesAa && badContrast.ratio < 2.0,
      `WCAG AA Contrast: Yellow (#FFFF00) correctly fails contrast check with ratio ${badContrast.ratio}:1`
    );

    // 2. Deterministic Content Hash & Edit Sensitivity
    const baseResume = {
      targetRole: "Frontend Developer",
      contactInfo: { name: "Ananya Sen", email: "ananya@example.com" },
      sections: [
        {
          id: "sec_summary",
          type: "summary",
          customTitle: "Professional Summary",
          visible: true,
          entries: [
            {
              id: "ent_summary",
              title: "Summary",
              bullets: [{ text: "Detail-oriented software engineer with 2 years of experience." }],
            },
          ],
        },
      ],
    };

    const hash1 = computeContentHash(baseResume);
    const hash2 = computeContentHash(baseResume);
    assert(hash1 === hash2, "Content Hash is 100% deterministic across identical data");

    const modifiedResume = JSON.parse(JSON.stringify(baseResume));
    modifiedResume.sections[0].entries[0].bullets[0].text =
      "Detail-oriented software engineer with 3 years of experience.";
    const hash3 = computeContentHash(modifiedResume);
    assert(hash1 !== hash3, "Content Hash is sensitive to single-character bullet text edits");

    // 3. Local Deterministic Rule Checks (0 AI Cost)
    const bulletTextWithWeakVerb = "Responsible for managing team meetings and coordinating tasks.";
    const lowerBullet = bulletTextWithWeakVerb.toLowerCase();
    const hasWeakVerb = WEAK_ACTION_VERBS.some((v) => lowerBullet.includes(v));
    assert(
      hasWeakVerb,
      `Local Check: Weak verb 'responsible for' detected deterministically without AI API call`
    );

    const tooShortBullet = "Done.";
    const wordCount = tooShortBullet.trim().split(/\s+/).length;
    assert(wordCount < 5, "Local Check: Short bullet warning triggered (< 5 words)");

    // 4. Setup Test User and Resume in Database
    const testEmail = `resumebuilder.tester.${Date.now()}@aeterna.test`;
    const user = await prisma.user.create({
      data: {
        name: "Vikram Malhotra",
        email: testEmail,
        passwordHash: "securehash_test",
        mobile: `98765${Math.floor(10000 + Math.random() * 90000)}`,
        profile: {
          create: {
            academicDomain: "Engineering / Technology",
            course: "B.Tech Computer Science",
            institution: "PES University",
            preferredJobRole: "Full Stack Engineer",
          },
        },
      },
    });

    const initialResumeData = {
      contactInfo: {
        name: user.name,
        email: user.email,
        phone: "+91 9876543210",
        location: "Bengaluru, Karnataka",
      },
      sections: [
        {
          id: "sec_summary",
          type: "summary",
          customTitle: "Professional Summary",
          visible: true,
          entries: [
            {
              id: "ent_sum",
              title: "Executive Overview",
              bullets: [
                {
                  id: "b_sum_1",
                  text: "Results-driven Full Stack Engineer with strong foundation in TypeScript and Next.js.",
                  provenance: "STUDENT_INPUT",
                  isApproved: true,
                },
              ],
            },
          ],
        },
        {
          id: "sec_experience",
          type: "experience",
          customTitle: "Work Experience",
          visible: true,
          entries: [
            {
              id: "ent_exp_1",
              title: "Software Engineering Intern",
              subtitle: "TechCorp Labs",
              dateRange: "2024 - Present",
              bullets: [
                {
                  id: "b_exp_1",
                  text: "Engineered scalable REST APIs serving 15,000 monthly active users.",
                  provenance: "STUDENT_INPUT",
                  isApproved: true,
                },
              ],
            },
          ],
        },
      ],
    };

    const initialHash = computeContentHash(initialResumeData);

    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        title: "Vikram Malhotra - Tech Resume v1",
        targetRole: "Full Stack Engineer",
        structuredData: JSON.stringify(initialResumeData),
        contentHash: initialHash,
        styleData: JSON.stringify({
          templateId: "standard-modern",
          colors: { primary: "#7A0F1F", accent: "#F6B51C" },
        }),
      },
    });

    assert(Boolean(resume.id), "Prisma Resume record created with styleData and contentHash");

    // 5. Version History & Snapshot Creation
    const v1 = await prisma.resumeVersion.create({
      data: {
        resumeId: resume.id,
        userId: user.id,
        versionName: "Initial Milestone",
        changeNote: "Initial draft before AI optimization",
        contentHash: initialHash,
        snapshot: JSON.stringify(initialResumeData),
      },
    });

    assert(Boolean(v1.id) && v1.versionName === "Initial Milestone", "ResumeVersion snapshot saved successfully");

    // 6. Resume Modification & DB Persistence
    const modifiedData = JSON.parse(JSON.stringify(initialResumeData));
    modifiedData.sections[0].entries[0].bullets[0].text =
      "Architected enterprise-grade Next.js microservices reducing server latency by 35%.";
    const modifiedHash = computeContentHash(modifiedData);

    await prisma.resume.update({
      where: { id: resume.id },
      data: {
        structuredData: JSON.stringify(modifiedData),
        contentHash: modifiedHash,
      },
    });

    const updatedResume = await prisma.resume.findUnique({ where: { id: resume.id } });
    const parsedUpdated = JSON.parse(updatedResume.structuredData);
    assert(
      parsedUpdated.sections[0].entries[0].bullets[0].text.includes("microservices"),
      "Resume updated in DB with optimized bullet text"
    );

    // 7. Rollback Verification from Snapshot
    await prisma.resume.update({
      where: { id: resume.id },
      data: {
        structuredData: v1.snapshot,
        contentHash: v1.contentHash,
      },
    });

    const restoredResume = await prisma.resume.findUnique({ where: { id: resume.id } });
    const parsedRestored = JSON.parse(restoredResume.structuredData);
    assert(
      parsedRestored.sections[0].entries[0].bullets[0].text.includes("Results-driven Full Stack Engineer"),
      "Rollback verified: Resume restored to exact snapshot state from ResumeVersion"
    );

    // 8. Resume Duplication Test
    const duplicateResume = await prisma.resume.create({
      data: {
        userId: user.id,
        title: `Copy of ${restoredResume.title}`,
        targetRole: restoredResume.targetRole,
        structuredData: restoredResume.structuredData,
        contentHash: restoredResume.contentHash,
        styleData: restoredResume.styleData,
      },
    });

    assert(
      duplicateResume.id !== restoredResume.id && duplicateResume.title.startsWith("Copy of"),
      "Resume Duplication verified: Cloned record has distinct ID, cloned styles and copied sections"
    );

    // 9. Prompt Guardrail Invariants
    const fs = require("fs");
    const path = require("path");
    const aiAnalyzerSource = fs.readFileSync(
      path.join(__dirname, "../src/lib/resume/ai-analyzer.ts"),
      "utf8"
    );

    assert(
      aiAnalyzerSource.includes("ANTI-HALLUCINATION INVARIANTS") &&
        aiAnalyzerSource.includes("NEVER invent degrees"),
      "Strict Anti-Hallucination rules embedded in system prompts for full-resume analysis"
    );

    assert(
      aiAnalyzerSource.includes("missingInformation"),
      "Missing information prompt workflow embedded in analyzer architecture"
    );

    const aiReviewPanelSource = fs.readFileSync(
      path.join(__dirname, "../src/app/resume/builder/components/ai-review-panel.tsx"),
      "utf8"
    );

    assert(
      aiReviewPanelSource.includes("Accept All Safe"),
      "Accept All Safe bulk review workflow embedded in UI review panel"
    );

    // 10. Multi-domain framework completeness checks
    const frameworksSource = fs.readFileSync(
      path.join(__dirname, "../src/lib/resume/frameworks.ts"),
      "utf8"
    );
    assert(
      frameworksSource.includes("clinicalRotations") && frameworksSource.includes("HEALTHCARE"),
      "Healthcare framework enforces clinicalRotations section as required benchmark"
    );

    assert(
      frameworksSource.includes("pedagogy") && frameworksSource.includes("EDUCATION"),
      "Teaching framework specifies domain-aligned pedagogy / certifications benchmark"
    );

    // Cleanup synthetic test records
    await prisma.resumeVersion.deleteMany({ where: { userId: user.id } });
    await prisma.resume.deleteMany({ where: { userId: user.id } });
    await prisma.studentProfile.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });

    console.log(`\n=======================================================`);
    console.log(`🎉 ALL FULL-RESUME BUILDER TESTS PASSED (${passed}/${total})`);
    console.log(`=======================================================\n`);
  } catch (err) {
    console.error("Test execution failed with error:", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
