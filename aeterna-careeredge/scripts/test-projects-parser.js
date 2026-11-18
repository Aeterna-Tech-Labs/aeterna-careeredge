// scripts/test-projects-parser.js
// Comprehensive End-to-End Test Suite for Resume Projects Extraction & Boundary Verification
// Tests all 9 required realistic fixture scenarios against the live API pipeline:
// 1. 3 projects, each with title, link, 3 bullets (the exact bug).
// 2. Projects with wrapped, multi-line bullets.
// 3. Projects where title and tech stack share one line ("Project Name | React, Node").
// 4. Projects without links.
// 5. Different bullet characters (•, -, *, –, ▪, ◦, numbered lists, checkmarks).
// 6. Projects section followed by a Skills or Achievements section with bullets (make sure those bullets are not swallowed by the last project).
// 7. Two-column resume layout where projects are in one column.
// 8. Project with a single-line description and no bullets (valid; do not delete).
// 9. Title-only project that is genuinely a real project (keep, flag for review).

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const { PrismaClient } = require("@prisma/client");
const { SignJWT } = require("jose");

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";

let passedCount = 0;
let totalTests = 0;

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

async function uploadAndParse(pastedText, sessionCookie) {
  const form = new FormData();
  form.append("pastedText", pastedText);
  form.append("consent", "true");

  const res = await fetch(`${BASE_URL}/api/resumes/upload`, {
    method: "POST",
    headers: { Cookie: sessionCookie },
    body: form,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Upload API returned HTTP ${res.status}: ${errorText}`);
  }

  const json = await res.json();
  return json.parsedData || json.parsed;
}

async function runFixtureTest(testName, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ [PASS] Fixture ${totalTests}: ${testName}`);
    passedCount++;
  } catch (err) {
    console.error(`  ✗ [FAIL] Fixture ${totalTests}: ${testName}`);
    console.error(`    ${err.message}\n`);
    throw err;
  }
}

// --------------------------------------------------------------------------------
// FIXTURE DEFINITIONS
// --------------------------------------------------------------------------------

// 1. 3 Projects, each with title, link, and 3 bullets (The Exact Reported Bug)
const FIXTURE_1 = `John Doe
john.doe@example.com | San Francisco, CA

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

// 2. Projects with wrapped, multi-line bullets
const FIXTURE_2 = `Jane Smith
jane@example.com

PROJECTS
Autonomous Rover Navigation
https://github.com/janesmith/rover
• Engineered SLAM algorithm using ROS2 and C++ for real-time obstacle avoidance
in heavily cluttered indoor and outdoor test environments.
• Streamlined telemetry streaming via WebRTC protocol
enabling low-latency remote command and control.

Healthcare ML Diagnosis
https://github.com/janesmith/health-ai
• Trained ResNet-50 computer vision model on 50,000 chest X-ray radiographs
achieving 94.2% diagnostic accuracy and exceeding baseline benchmarks.
• Deployed inference pipeline using FastAPI and TensorRT
handling over 200 concurrent prediction requests with sub-100ms latency.
`;

// 3. Projects where title and tech stack share one line with | or -
const FIXTURE_3 = `Alex Chen
alex@example.com

PROJECTS
FinTrack Expense Manager | React, Node.js, Express, PostgreSQL
https://github.com/alexchen/fintrack
• Architected double-entry ledger database schema with ACID transactional integrity.
• Implemented automated recurring payment reminders using BullMQ job queues.

CodeCollab IDE | Next.js, WebSockets, Docker, Monaco Editor
https://github.com/alexchen/codecollab
• Designed operational transformation engine for simultaneous multi-user code editing.
• Containerized remote code execution sandbox with strict CPU and memory limits.
`;

// 4. Projects without links
const FIXTURE_4 = `Sara Connor
sara@example.com

PROJECTS
CyberShield Malware Detection
• Developed signature-based scanner identifying known threat patterns.
• Configured Linux kernel eBPF probes to detect unauthorized root privilege escalations.

Decentralized Voting Prototype
• Built proof-of-concept cryptographic voting protocol using zero-knowledge proofs.
• Conducted stress tests simulating 10,000 voter ballots under network partitioning.
`;

// 5. Different bullet characters (▪, ◦, *, –, numbered lists, checkmarks)
const FIXTURE_5 = `Marcus Brody
marcus@example.com

PROJECTS
SmartGrid IoT Energy Meter
▪ Designed ESP32 sensor hardware logging electricity consumption via MQTT.
▫ Integrated Grafana dashboard displaying wattage metrics in real time.
◦ Reduced standby power consumption by 18% through sleep mode tuning.

Quantum Cryptography Simulator
1. Implemented BB84 quantum key distribution protocol in Python.
2. Simulated eavesdropping intercept-resend attacks to measure quantum bit error rates.
✓ Verified secrecy thresholds under depolarizing noise channels.
`;

// 6. Projects followed by Skills/Achievements with bullets (Boundary Test)
const FIXTURE_6 = `David Miller
david@example.com

PROJECTS
Neural Style Transfer Web App
https://github.com/dmiller/style-transfer
• Implemented Gatys style transfer optimization algorithm using PyTorch.
• Built web interface with canvas preview and GPU acceleration.

SKILLS
• Languages: Python, C++, TypeScript, Go
• Frameworks: PyTorch, React, Next.js, Django

ACHIEVEMENTS
• 1st Place Winner at National Hackathon 2024 out of 120 teams.
• Published research paper on computer vision at IEEE Student Symposium.
`;

// 7. Two-column resume layout simulation
const FIXTURE_7 = `Priya Patel
priya.patel@example.com | +91 9876543210

PROJECTS
EcoTrack Carbon Footprint Estimator
https://github.com/priyapatel/ecotrack
• Calculated supply chain carbon emissions using GHG protocol factors.
• Visualized lifecycle impacts with interactive Sankey diagrams.

OmniSearch Semantic Document Engine
https://github.com/priyapatel/omnisearch
• Created vector search index with Qdrant and OpenAI embeddings.
• Ranked search results using reciprocal rank fusion hybrid scoring.

EDUCATION
B.Tech in Computer Science, IIT Bombay
`;

// 8. Project with a single-line description and no bullets (Valid; do not delete)
const FIXTURE_8 = `Elena Rostova
elena@example.com

PROJECTS
Algorithmic High-Frequency Trading Bot
A low-latency C++ trading engine executing statistical arbitrage strategies across multiple crypto order books with sub-millisecond socket feeds.

Portfolio Website 2025
https://github.com/elena/portfolio
Personal developer showcase portfolio built with Next.js 15, Tailwind CSS, and Framer Motion animations.
`;

// 9. Title-only project that is genuinely a real project (Keep, flag for review)
const FIXTURE_9 = `Robert Lang
robert@example.com

PROJECTS
Smart Home IoT Automation Hub
https://github.com/robertlang/smart-home-hub

Automated Drone Fleet Management Platform
https://github.com/robertlang/drone-fleet
`;

async function main() {
  console.log("================================================================================");
  console.log("RUNNING COMPREHENSIVE RESUME PROJECTS EXTRACTION TEST SUITE (9 FIXTURES)");
  console.log("================================================================================\n");

  const testUser = await prisma.user.findFirst();
  if (!testUser) {
    throw new Error("No user found in SQLite dev database.");
  }

  const sessionCookie = await mintSessionCookie({
    userId: testUser.id,
    sub: testUser.id,
    role: "STUDENT",
    name: testUser.name,
    email: testUser.email,
    onboardingCompleted: true,
  });

  // FIXTURE 1: 3 Projects, each with title, link, 3 bullets
  await runFixtureTest("3 Projects, each with title, link, 3 bullets (The Exact Reported Bug)", async () => {
    const parsed = await uploadAndParse(FIXTURE_1, sessionCookie);
    assert.strictEqual(parsed.projects.length, 3, `Expected exactly 3 projects, got ${parsed.projects.length}`);
    
    // Project 1
    assert.strictEqual(parsed.projects[0].title, "TaskMaster Pro");
    assert.strictEqual(parsed.projects[0].url, "https://github.com/johndoe/taskmaster");
    assert.strictEqual(parsed.projects[0].bullets.length, 3, `Expected 3 bullets, got ${parsed.projects[0].bullets.length}`);
    assert.ok(parsed.projects[0].bullets[0].includes("decreased database load by 40%"), "Wrapped line should be merged into bullet 1");

    // Project 2
    assert.strictEqual(parsed.projects[1].title, "DevPulse Analytics");
    assert.strictEqual(parsed.projects[1].url, "https://github.com/johndoe/devpulse");
    assert.strictEqual(parsed.projects[1].bullets.length, 3);

    // Project 3
    assert.strictEqual(parsed.projects[2].title, "CloudVault Storage");
    assert.strictEqual(parsed.projects[2].url, "https://github.com/johndoe/cloudvault");
    assert.strictEqual(parsed.projects[2].bullets.length, 3);
  });

  // FIXTURE 2: Wrapped, multi-line bullets
  await runFixtureTest("Projects with wrapped, multi-line bullets", async () => {
    const parsed = await uploadAndParse(FIXTURE_2, sessionCookie);
    assert.strictEqual(parsed.projects.length, 2, `Expected 2 projects, got ${parsed.projects.length}`);
    assert.strictEqual(parsed.projects[0].title, "Autonomous Rover Navigation");
    assert.strictEqual(parsed.projects[0].bullets.length, 2);
    assert.ok(parsed.projects[0].bullets[0].includes("cluttered indoor and outdoor"));
    assert.strictEqual(parsed.projects[1].title, "Healthcare ML Diagnosis");
    assert.strictEqual(parsed.projects[1].bullets.length, 2);
    assert.ok(parsed.projects[1].bullets[0].includes("exceeding baseline benchmarks"));
  });

  // FIXTURE 3: Title and tech stack on one line
  await runFixtureTest("Projects where title and tech stack share one line with delimiter (|)", async () => {
    const parsed = await uploadAndParse(FIXTURE_3, sessionCookie);
    assert.strictEqual(parsed.projects.length, 2, `Expected 2 projects, got ${parsed.projects.length}`);
    assert.strictEqual(parsed.projects[0].title, "FinTrack Expense Manager");
    assert.strictEqual(parsed.projects[0].subtitle, "React, Node.js, Express, PostgreSQL");
    assert.strictEqual(parsed.projects[0].bullets.length, 2);
    assert.strictEqual(parsed.projects[1].title, "CodeCollab IDE");
    assert.strictEqual(parsed.projects[1].subtitle, "Next.js, WebSockets, Docker, Monaco Editor");
    assert.strictEqual(parsed.projects[1].bullets.length, 2);
  });

  // FIXTURE 4: Projects without links
  await runFixtureTest("Projects without links (pure title + bullets)", async () => {
    const parsed = await uploadAndParse(FIXTURE_4, sessionCookie);
    assert.strictEqual(parsed.projects.length, 2, `Expected 2 projects, got ${parsed.projects.length}`);
    assert.strictEqual(parsed.projects[0].title, "CyberShield Malware Detection");
    assert.ok(!parsed.projects[0].url, "Project 1 should have no URL");
    assert.strictEqual(parsed.projects[0].bullets.length, 2);
    assert.strictEqual(parsed.projects[1].title, "Decentralized Voting Prototype");
    assert.ok(!parsed.projects[1].url, "Project 2 should have no URL");
    assert.strictEqual(parsed.projects[1].bullets.length, 2);
  });

  // FIXTURE 5: Different bullet characters
  await runFixtureTest("Different bullet characters (▪, ◦, 1., 2., ✓)", async () => {
    const parsed = await uploadAndParse(FIXTURE_5, sessionCookie);
    assert.strictEqual(parsed.projects.length, 2, `Expected 2 projects, got ${parsed.projects.length}`);
    assert.strictEqual(parsed.projects[0].title, "SmartGrid IoT Energy Meter");
    assert.strictEqual(parsed.projects[0].bullets.length, 3);
    assert.strictEqual(parsed.projects[1].title, "Quantum Cryptography Simulator");
    assert.strictEqual(parsed.projects[1].bullets.length, 3);
  });

  // FIXTURE 6: Boundary test (Projects followed by Skills / Achievements)
  await runFixtureTest("Projects followed by Skills & Achievements with bullets (No section bleed)", async () => {
    const parsed = await uploadAndParse(FIXTURE_6, sessionCookie);
    assert.strictEqual(parsed.projects.length, 1, `Expected 1 project, got ${parsed.projects.length}`);
    assert.strictEqual(parsed.projects[0].title, "Neural Style Transfer Web App");
    assert.strictEqual(parsed.projects[0].bullets.length, 2);
    assert.ok(parsed.skills.length > 0, "Skills should be parsed separately and not bleed into projects");
  });

  // FIXTURE 7: Two-column layout simulation
  await runFixtureTest("Two-column layout simulation", async () => {
    const parsed = await uploadAndParse(FIXTURE_7, sessionCookie);
    assert.strictEqual(parsed.projects.length, 2, `Expected 2 projects, got ${parsed.projects.length}`);
    assert.strictEqual(parsed.projects[0].title, "EcoTrack Carbon Footprint Estimator");
    assert.strictEqual(parsed.projects[0].bullets.length, 2);
    assert.strictEqual(parsed.projects[1].title, "OmniSearch Semantic Document Engine");
    assert.strictEqual(parsed.projects[1].bullets.length, 2);
  });

  // FIXTURE 8: Project with a single-line description and no bullets
  await runFixtureTest("Project with a single-line description and no bullets (Valid; do not delete)", async () => {
    const parsed = await uploadAndParse(FIXTURE_8, sessionCookie);
    assert.strictEqual(parsed.projects.length, 2, `Expected 2 projects, got ${parsed.projects.length}`);
    assert.strictEqual(parsed.projects[0].title, "Algorithmic High-Frequency Trading Bot");
    assert.strictEqual(parsed.projects[0].bullets.length, 1);
    assert.ok(parsed.projects[0].bullets[0].includes("low-latency C++ trading engine"));
    assert.strictEqual(parsed.projects[1].title, "Portfolio Website 2025");
    assert.strictEqual(parsed.projects[1].bullets.length, 1);
  });

  // FIXTURE 9: Title-only project that is genuinely a real project
  await runFixtureTest("Title-only projects with link (Keep, mark lowConfidence)", async () => {
    const parsed = await uploadAndParse(FIXTURE_9, sessionCookie);
    assert.strictEqual(parsed.projects.length, 2, `Expected 2 projects, got ${parsed.projects.length}`);
    assert.strictEqual(parsed.projects[0].title, "Smart Home IoT Automation Hub");
    assert.strictEqual(parsed.projects[0].url, "https://github.com/robertlang/smart-home-hub");
    assert.strictEqual(parsed.projects[0].lowConfidence, true, "Title-only project should be flagged with lowConfidence");
    assert.strictEqual(parsed.projects[1].title, "Automated Drone Fleet Management Platform");
    assert.strictEqual(parsed.projects[1].url, "https://github.com/robertlang/drone-fleet");
  });

  console.log("\n================================================================================");
  console.log(`ALL 9 TEST FIXTURES PASSED SUCCESSFULLY! (${passedCount}/${totalTests})`);
  console.log("================================================================================\n");
}

main().catch(err => {
  console.error("Test suite error:", err);
  process.exit(1);
});
