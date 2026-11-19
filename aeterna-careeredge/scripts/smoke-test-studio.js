// scripts/smoke-test-studio.js
// End-to-end HTTP smoke test for Resume Studio: generation, refinement, and persistence.

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { SignJWT } = require("jose");

const prisma = new PrismaClient();

function getAuthSecret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  const envPath = path.join(__dirname, "..", ".env");
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf8");
    const match = envFile.match(/AUTH_SECRET=["']?([^"'\r\n]+)["']?/);
    if (match) return match[1];
  }
  return "default_dev_secret_careeredge";
}

async function mintSessionCookie(payload) {
  const secretKey = new TextEncoder().encode(getAuthSecret());
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

async function runSmokeTest() {
  console.log("================================================================================");
  console.log("RESUME STUDIO E2E SMOKE TEST: Multi-Strategy, Refinement & Persistence");
  console.log("================================================================================\n");

  try {
    // 1. Verify User exists
    const user = await prisma.user.findFirst({
      where: { email: "anujwork2410@gmail.com" },
    });

    if (!user) {
      throw new Error("Test user anujwork2410@gmail.com not found in database.");
    }
    console.log(`✅ 1. Authenticated test user: ${user.name} (${user.email})`);

    const sessionToken = await mintSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      onboardingCompleted: true,
    });

    const headers = {
      "Content-Type": "application/json",
      Cookie: `ace_session=${sessionToken}`,
    };

    // 2. Test POST /api/resume/studio (Generate 3 Options)
    console.log("\n📡 Testing POST /api/resume/studio (Multi-Strategy Generation)...");
    const genRes = await fetch("http://localhost:3000/api/resume/studio", {
      method: "POST",
      headers,
      body: JSON.stringify({
        sourceType: "passport",
        targetRolePrompt: "Senior Full Stack Developer",
        professionDomain: "it",
        jobDescription: "Looking for an engineer skilled in React, Next.js, TypeScript, and microservices architecture.",
      }),
    });

    if (!genRes.ok) {
      const errText = await genRes.text();
      throw new Error(`Generation failed with HTTP ${genRes.status}: ${errText}`);
    }

    const genData = await genRes.json();
    if (!genData.success || !Array.isArray(genData.options) || genData.options.length !== 3) {
      throw new Error(`Expected 3 strategic options, got: ${JSON.stringify(genData)}`);
    }

    console.log(`✅ 2. Generated 3 Distinct Strategies:`);
    for (const opt of genData.options) {
      console.log(`   - [${opt.id}] ${opt.strategyName}: ${opt.matchScore}% Match, ${opt.wordCount} words, Template: ${opt.templateId}`);
    }

    console.log(`✅ 3. Honest Gap Analysis:`);
    console.log(`   - Matched: ${genData.gapAnalysis.matchedKeywords.slice(0, 5).join(", ")}...`);
    console.log(`   - Missing (unverified): ${genData.gapAnalysis.missingKeywords.slice(0, 5).join(", ")}`);
    console.log(`   - Truth notice: "${genData.gapAnalysis.truthInvariantNotice}"`);

    // 3. Test POST /api/resume/studio/refine (Conversational Refinement)
    console.log("\n📡 Testing POST /api/resume/studio/refine (Conversational Refinement)...");
    const chosenOption = genData.options[0];
    const refineRes = await fetch("http://localhost:3000/api/resume/studio/refine", {
      method: "POST",
      headers,
      body: JSON.stringify({
        option: chosenOption,
        refinementPrompt: "Make the summary punchier for a fast-paced fintech scaleup focusing on high-volume transactions and system reliability.",
        targetRole: "Senior Full Stack Developer",
        professionDomain: "it",
      }),
    });

    if (!refineRes.ok) {
      const errText = await refineRes.text();
      throw new Error(`Refinement failed with HTTP ${refineRes.status}: ${errText}`);
    }

    const refineData = await refineRes.json();
    if (!refineData.success || !refineData.updatedOption) {
      throw new Error(`Invalid refinement response: ${JSON.stringify(refineData)}`);
    }

    console.log(`✅ 4. Conversational Refinement Succeeded:`);
    console.log(`   - Changes Summary: "${refineData.changesSummary}"`);
    console.log(`   - Refined Summary Preview: "${refineData.updatedOption.summary.slice(0, 120)}..."`);
    console.log(`   - Truth Check Verified: ${refineData.truthCheck.verified} (${refineData.truthCheck.notice})`);

    // 4. Test POST /api/resume/studio/save (Save as Active Resume)
    console.log("\n📡 Testing POST /api/resume/studio/save (Persistence)...");
    const saveRes = await fetch("http://localhost:3000/api/resume/studio/save", {
      method: "POST",
      headers,
      body: JSON.stringify({
        option: refineData.updatedOption,
        contactInfo: genData.contactInfo,
        targetRole: "Senior Full Stack Developer",
        resumeTitle: "Smoke Test Senior Full Stack - Refined",
      }),
    });

    if (!saveRes.ok) {
      const errText = await saveRes.text();
      throw new Error(`Save failed with HTTP ${saveRes.status}: ${errText}`);
    }

    const saveData = await saveRes.json();
    if (!saveData.success || !saveData.resumeId) {
      throw new Error(`Save returned invalid data: ${JSON.stringify(saveData)}`);
    }

    console.log(`✅ 5. Active Resume Saved in DB with ID: ${saveData.resumeId}`);

    // Verify in DB directly
    const savedResume = await prisma.resume.findUnique({
      where: { id: saveData.resumeId },
    });
    if (!savedResume) {
      throw new Error(`Saved resume ${saveData.resumeId} could not be retrieved from Prisma DB`);
    }
    console.log(`✅ 6. Verified Resume in Prisma DB: "${savedResume.title}" (ATS Score: ${savedResume.atsScore}%)`);

    // Cleanup smoke test record
    await prisma.resume.delete({ where: { id: saveData.resumeId } });
    console.log(`✅ 7. Smoke test resume cleanly deleted from database.`);

    console.log("\n🎉 ALL RESUME STUDIO SMOKE TESTS PASSED CLEANLY!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Smoke test failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runSmokeTest();
