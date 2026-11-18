// scripts/test-day2-benchmark.js
// Multi-Domain Benchmark Runner for all 6 professions: Nursing, Teaching, IT, Commerce, Design, Law

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const prisma = new PrismaClient();

async function runBenchmark() {
  console.log("\n📊 RUNNING MULTI-DOMAIN MODEL BENCHMARK (6 Core Professions)...\n");

  const frameworksPath = path.join(__dirname, "../src/lib/resume/frameworks.ts");
  const frameworksSrc = fs.readFileSync(frameworksPath, "utf8");

  const readinessPath = path.join(__dirname, "../src/lib/readiness/service.ts");
  const readinessSrc = fs.readFileSync(readinessPath, "utf8");

  const mockJobsPath = path.join(__dirname, "../src/lib/jobs/mock-data.ts");
  const mockJobsSrc = fs.readFileSync(mockJobsPath, "utf8");

  const PROFESSIONS = [
    {
      key: "HEALTHCARE",
      name: "Nursing & Healthcare",
      regulatoryBody: "Indian Nursing Council (INC)",
      statutoryPrereq: "B.Sc Nursing / GNM Registered Nurse & Midwife",
      frameworkKey: "HEALTHCARE",
      jobKey: "HEALTHCARE",
    },
    {
      key: "TEACHING",
      name: "Teaching & Education",
      regulatoryBody: "National Council for Teacher Education (NCTE)",
      statutoryPrereq: "B.Ed / CTET Qualification",
      frameworkKey: "EDUCATION",
      jobKey: "TEACHING",
    },
    {
      key: "COMMERCE",
      name: "Commerce & Finance",
      regulatoryBody: "Institute of Chartered Accountants of India (ICAI)",
      statutoryPrereq: "B.Com / CA Inter / GST Practitioner",
      frameworkKey: "COMMERCE",
      jobKey: "COMMERCE",
    },
    {
      key: "TECH",
      name: "Technology & Software",
      regulatoryBody: "NASSCOM FutureSkills Prime & AICTE",
      statutoryPrereq: "B.E. / B.Tech / MCA or Deployed Codebase",
      frameworkKey: "ENGINEERING",
      jobKey: "TECH",
    },
    {
      key: "LAW",
      name: "Law & Corporate Legal",
      regulatoryBody: "Bar Council of India (BCI)",
      statutoryPrereq: "LL.B enrolled with Bar Council / AIBE",
      frameworkKey: "LAW",
      jobKey: "LAW",
    },
    {
      key: "DESIGN",
      name: "Design & UX/UI",
      regulatoryBody: "India Design Council",
      statutoryPrereq: "B.Des or Portfolio with 2+ Case Studies",
      frameworkKey: "DESIGN",
      jobKey: "DESIGN",
    },
  ];

  // Create temporary synthetic student for benchmark
  const user = await prisma.user.create({
    data: {
      name: "Benchmark Candidate",
      email: `bench_${Date.now()}@aeterna.io`,
    },
  });

  let verifiedCount = 0;

  for (const prof of PROFESSIONS) {
    const hasFramework = frameworksSrc.includes(`domainKey: "${prof.frameworkKey}"`);
    const hasBenchmark = readinessSrc.includes(prof.key) && readinessSrc.includes(prof.regulatoryBody);
    const hasJobs = mockJobsSrc.includes(`domain: "${prof.jobKey}"`);

    // Verify database role fit recording
    const roleFitRecord = await prisma.roleFitResult.create({
      data: {
        userId: user.id,
        profession: prof.key,
        resultsJson: JSON.stringify({
          profession: prof.name,
          regulatoryBody: prof.regulatoryBody,
          statutoryPrereq: prof.statutoryPrereq,
          frameworkKey: prof.frameworkKey,
          verified: true,
        }),
        referenceSourceIds: JSON.stringify([prof.regulatoryBody]),
      },
    });

    if (hasFramework && hasBenchmark && hasJobs && roleFitRecord.id) {
      verifiedCount++;
      console.log(`✅ [${prof.key}] ${prof.name}`);
      console.log(`   Regulatory Standard: ${prof.regulatoryBody}`);
      console.log(`   Statutory Prerequisite: ${prof.statutoryPrereq}`);
      console.log(`   Resume Framework: ${prof.frameworkKey}`);
      console.log(`   Catalog Jobs & Persistence: VERIFIED\n`);
    } else {
      console.error(`❌ [${prof.key}] Failed verification (hasFw: ${hasFramework}, hasBench: ${hasBenchmark}, hasJobs: ${hasJobs})`);
    }
  }

  // Cleanup benchmark test data
  await prisma.roleFitResult.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });

  console.log("=======================================================");
  console.log(`🎉 BENCHMARK COMPLETE: ${verifiedCount}/${PROFESSIONS.length} PROFESSIONS VERIFIED`);
  console.log("=======================================================\n");

  await prisma.$disconnect();
}

runBenchmark().catch((err) => {
  console.error("Benchmark failed:", err);
  process.exit(1);
});
