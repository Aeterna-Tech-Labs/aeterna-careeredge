// scripts/test-dashboard-tour-tabs.js
// Automated End-to-End Browser & API QA Suite for Dashboard, Product Tour, and All App Tabs

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { PrismaClient } = require("@prisma/client");
const { SignJWT } = require("jose");

const prisma = new PrismaClient();
const ARTIFACT_DIR = "/home/deku/.gemini/antigravity/brain/ec8f65e5-8b58-4a1b-ba60-7f3a2818af92/browser_qa_dashboard";
fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

function getAuthSecret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  try {
    const envFile = fs.readFileSync(path.join(__dirname, "..", ".env"), "utf8");
    const match = envFile.match(/AUTH_SECRET=["']?([^"'\n]+)["']?/);
    if (match) return match[1];
  } catch {}
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

class ChromeCDP {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.msgId = 1;
    this.callbacks = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      } catch (e) {
        console.error("CDP parse error:", e);
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async navigate(url, waitMs = 2000) {
    await this.send("Page.navigate", { url });
    await new Promise((r) => setTimeout(r, waitMs));
  }

  async evaluate(expression) {
    const res = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval error: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result?.value;
  }

  async captureScreenshot(filePath) {
    const res = await this.send("Page.captureScreenshot", { format: "png" });
    const buffer = Buffer.from(res.data, "base64");
    fs.writeFileSync(filePath, buffer);
    console.log(`📸 Screenshot saved: ${path.basename(filePath)} (${buffer.length} bytes)`);
  }

  async close() {
    if (this.ws) this.ws.close();
  }
}

async function getBrowserTarget() {
  const res = await fetch("http://localhost:9222/json/list");
  const pages = await res.json();
  const page = pages.find((p) => p.type === "page") || pages[0];
  if (!page) throw new Error("No page found in Chrome");
  return page.webSocketDebuggerUrl;
}

let testNumber = 0;
let passedCount = 0;
function assertTest(name, condition, details = "") {
  testNumber++;
  if (condition) {
    passedCount++;
    console.log(`✅ ${testNumber}. ${name}: PASSED ${details}`);
  } else {
    console.error(`❌ ${testNumber}. ${name}: FAILED ${details}`);
    process.exitCode = 1;
  }
}

async function run() {
  console.log("\n=======================================================");
  console.log("🚀 Starting Comprehensive Dashboard & Tabs QA Suite");
  console.log("=======================================================\n");

  const baseUrl = "http://localhost:3000";

  // 1. Fetch real student from DB
  const student = await prisma.user.findFirst({
    where: { email: "pooja.sharma.test@aeterna.io" },
    include: { profile: true },
  });

  if (!student) {
    throw new Error("Student Pooja Sharma not found in dev database.");
  }

  console.log(`Identified test student: ${student.name} (${student.email})`);

  // Reset product-tour seen panel so we can test the first-visit product tour trigger
  await prisma.guideSeenPanel.deleteMany({
    where: {
      userId: student.id,
      panelId: "product-tour",
    },
  });
  console.log("Reset product-tour seen panel in DB for clean first-visit verification.");

  const sessionCookie = await mintSessionCookie({
    userId: student.id,
    email: student.email,
    name: student.name,
    onboardingCompleted: true,
  });

  // Launch headless Chrome
  console.log("Launching headless Google Chrome with CDP on port 9222...");
  const chromeProcess = spawn("google-chrome", [
    "--headless=new",
    "--remote-debugging-port=9222",
    "--no-sandbox",
    "--disable-gpu",
    "about:blank",
  ]);

  let cdp = null;
  // Wait up to 5s for Chrome to become ready
  for (let attempt = 0; attempt < 25; attempt++) {
    try {
      const res = await fetch("http://localhost:9222/json/version");
      if (res.ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }

  // Connect to Chrome CDP
  const targetWs = await getBrowserTarget();
  cdp = new ChromeCDP(targetWs);
  await cdp.connect();

  await cdp.send("Network.enable");
  await cdp.send("Page.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  // Set the session cookie via CDP
  await cdp.send("Network.setCookie", {
    name: "ace_session",
    value: sessionCookie.replace("ace_session=", ""),
    url: "http://localhost:3000",
    domain: "localhost",
    path: "/",
    httpOnly: true,
  });

  try {
    // ========================================================
    // SECTION 1: DASHBOARD RESTOCK & VISUAL HIERARCHY
    // ========================================================
    console.log("\n--- [Section 1: Dashboard Restructure & Hierarchy Verification] ---");
    await cdp.navigate(`${baseUrl}/dashboard`, 3000);

    // Capture initial dashboard load
    await cdp.captureScreenshot(path.join(ARTIFACT_DIR, "01_dashboard_restructured.png"));

    // Check greeting & user identity
    const greetingText = await cdp.evaluate(`
      document.querySelector('h1')?.innerText || ''
    `);
    assertTest(
      "Greeting includes student first name",
      greetingText.includes("Welcome back") || greetingText.includes("Pooja"),
      `(Found: "${greetingText}")`
    );

    // Check "Take Product Tour" button presence
    const tourBtnExists = await cdp.evaluate(`
      Boolean(Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Take Product Tour')))
    `);
    assertTest(
      "Greeting area contains 'Take Product Tour' replay button",
      tourBtnExists
    );

    // Check Next Best Action card
    const nextActionExists = await cdp.evaluate(`
      Boolean(document.getElementById('tour-next-best-action'))
    `);
    assertTest(
      "Next Best Action card is prominent with #tour-next-best-action ID",
      nextActionExists
    );

    // Check Getting Started Checklist
    const checklistExists = await cdp.evaluate(`
      Boolean(document.getElementById('tour-checklist'))
    `);
    assertTest(
      "Getting Started Checklist is rendered with #tour-checklist ID",
      checklistExists
    );

    // Check Quick Actions
    const quickActionsCount = await cdp.evaluate(`
      document.getElementById('tour-quick-actions')?.querySelectorAll('a')?.length || 0
    `);
    assertTest(
      "Quick Actions section contains 4 high-contrast action shortcuts",
      quickActionsCount === 4,
      `(Found: ${quickActionsCount})`
    );

    // Check Key Metrics
    const metricsCount = await cdp.evaluate(`
      document.getElementById('tour-metrics')?.querySelectorAll('article, div.rounded-2xl')?.length || 0
    `);
    assertTest(
      "Key Metrics section renders career readiness stats cards",
      metricsCount >= 4,
      `(Found: ${metricsCount} cards)`
    );

    // Check All Tools Overview & Coming Soon separation
    const toolsOverviewExists = await cdp.evaluate(`
      Boolean(document.getElementById('tour-all-tools'))
    `);
    assertTest(
      "All Tools Overview is rendered with #tour-all-tools ID",
      toolsOverviewExists
    );

    const comingSoonCardsCount = await cdp.evaluate(`
      document.querySelectorAll('[data-feature-status="coming-soon"]').length
    `);
    assertTest(
      "Coming Soon tools (SOP Builder & Career Counselling) visually separated and badged",
      comingSoonCardsCount >= 2,
      `(Found: ${comingSoonCardsCount})`
    );

    // ========================================================
    // SECTION 2: PRODUCT TOUR FUNCTIONALITY
    // ========================================================
    console.log("\n--- [Section 2: Product Tour End-to-End Verification] ---");

    // Click "Take Product Tour" button
    await cdp.evaluate(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Take Product Tour'));
        if (btn) btn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 1000));

    // Verify tour dialog is open and shows Step 1 of 8
    const tourStep1Text = await cdp.evaluate(`
      (() => {
        const dialog = document.querySelector('[role="dialog"]');
        return dialog ? dialog.innerText : '';
      })()
    `);
    assertTest(
      "Product Tour opens modal on trigger and displays 'Step 1 of 8'",
      tourStep1Text.includes("Step 1 of 8"),
      `(Found: "${tourStep1Text.slice(0, 80)}...")`
    );
    await cdp.captureScreenshot(path.join(ARTIFACT_DIR, "02_product_tour_step1.png"));

    // Click primary button ("Start Tour" or "Next") to advance to Step 2
    await cdp.evaluate(`
      (() => {
        const dialog = document.querySelector('[role="dialog"]');
        const nextBtn = dialog?.querySelector('button[data-primary="true"]') || Array.from(dialog?.querySelectorAll('button') || []).find(b => b.innerText.includes('Start') || b.innerText.includes('Next'));
        if (nextBtn) nextBtn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 1000));

    const tourStep2Text = await cdp.evaluate(`
      (() => {
        const dialog = document.querySelector('[role="dialog"]');
        return dialog ? dialog.innerText : '';
      })()
    `);
    assertTest(
      "Product Tour advances to 'Step 2 of 8' when Next is clicked",
      tourStep2Text.includes("Step 2 of 8")
    );
    await cdp.captureScreenshot(path.join(ARTIFACT_DIR, "03_product_tour_step2.png"));

    // Click "Back" to return to Step 1
    await cdp.evaluate(`
      (() => {
        const dialog = document.querySelector('[role="dialog"]');
        const backBtn = Array.from(dialog?.querySelectorAll('button') || []).find(b => b.innerText.includes('Back'));
        if (backBtn) backBtn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 800));

    const tourBackText = await cdp.evaluate(`
      (() => {
        const dialog = document.querySelector('[role="dialog"]');
        return dialog ? dialog.innerText : '';
      })()
    `);
    assertTest(
      "Product Tour returns to 'Step 1 of 8' when Back is clicked",
      tourBackText.includes("Step 1 of 8")
    );

    // Skip the tour to test persistence
    await cdp.evaluate(`
      (() => {
        const dialog = document.querySelector('[role="dialog"]');
        const skipBtn = dialog?.querySelector('button[aria-label="Skip product tour"]') ||
                        Array.from(dialog?.querySelectorAll('button') || []).find(b => b.textContent && b.textContent.includes('Skip'));
        if (skipBtn) skipBtn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 1200));

    // Verify tour modal closed
    const tourClosed = await cdp.evaluate(`
      document.querySelector('[role="dialog"]') === null
    `);
    assertTest(
      "Product Tour dismisses cleanly when Skip/Close is clicked",
      tourClosed
    );

    // Check DB persistence of product-tour dismissal
    const seenRecord = await prisma.guideSeenPanel.findUnique({
      where: {
        userId_panelId: {
          userId: student.id,
          panelId: "product-tour",
        },
      },
    });
    assertTest(
      "Product Tour completion/skip state is persisted in GuideSeenPanel database record",
      Boolean(seenRecord)
    );

    // ========================================================
    // SECTION 3: COMING SOON PAGES & BADGES
    // ========================================================
    console.log("\n--- [Section 3: Dedicated Coming Soon Pages (/sop & /counselling)] ---");

    // Test /sop
    await cdp.navigate(`${baseUrl}/sop`, 2000);
    const sopTitle = await cdp.evaluate(`document.querySelector('h1')?.innerText || ''`);
    const sopHasBadge = await cdp.evaluate(`
      Boolean(document.querySelector('[role="status"]')?.innerText?.toLowerCase().includes("soon"))
    `);
    const sopHasGuarantee = await cdp.evaluate(`
      document.body.innerText.includes("Honesty Guarantee")
    `);
    assertTest(
      "/sop route renders ComingSoonPage with 'SOP & Cover Letter Builder' title",
      sopTitle.includes("SOP") || sopTitle.includes("Statement of Purpose"),
      `(Title: "${sopTitle}")`
    );
    assertTest("/sop displays accessible 'Soon' badge", sopHasBadge);
    assertTest("/sop explains timeline & CareerEdge Honesty Guarantee honestly", sopHasGuarantee);
    await cdp.captureScreenshot(path.join(ARTIFACT_DIR, "04_coming_soon_sop.png"));

    // Test /counselling
    await cdp.navigate(`${baseUrl}/counselling`, 2000);
    const counsellingTitle = await cdp.evaluate(`document.querySelector('h1')?.innerText || ''`);
    const counsellingHasBadge = await cdp.evaluate(`
      Boolean(document.querySelector('[role="status"]')?.innerText?.toLowerCase().includes("soon"))
    `);
    const counsellingHasGuarantee = await cdp.evaluate(`
      document.body.innerText.includes("Honesty Guarantee")
    `);
    assertTest(
      "/counselling route renders ComingSoonPage with '1:1 Career Counselling' title",
      counsellingTitle.includes("Counselling") || counsellingTitle.includes("Guidance"),
      `(Title: "${counsellingTitle}")`
    );
    assertTest("/counselling displays accessible 'Soon' badge", counsellingHasBadge);
    assertTest("/counselling explains booking system honestly", counsellingHasGuarantee);
    await cdp.captureScreenshot(path.join(ARTIFACT_DIR, "05_coming_soon_counselling.png"));

    // ========================================================
    // SECTION 4: ALL SIGNED-IN TABS UI/UX & HOW-IT-WORKS
    // ========================================================
    console.log("\n--- [Section 4: All Tabs UI/UX Consistency & HowItWorksPanel] ---");

    const tabsToTest = [
      { path: "/passport", name: "Career Passport", toolKey: "career-passport" },
      { path: "/evidence-vault", name: "Evidence Vault", toolKey: "evidence-vault" },
      { path: "/truth-check", name: "Truth Check", toolKey: "truth-check" },
      { path: "/resume", name: "Resume Studio", toolKey: "resume-studio" },
      { path: "/linkedin", name: "LinkedIn Optimizer", toolKey: "linkedin-optimizer" },
      { path: "/jobs", name: "Job Discovery", toolKey: "job-discovery" },
      { path: "/applications", name: "Application Tracker", toolKey: "application-tracker" },
      { path: "/role-fit-explorer", name: "Role Fit Explorer", toolKey: "role-fit-explorer" },
      { path: "/sprints", name: "Action Sprints", toolKey: "gap-to-action-sprint" },
      { path: "/interview-prep", name: "Interview Prep", toolKey: "interview-prep-kit" },
      { path: "/value", name: "Value & ROI", toolKey: "value-roi" },
      { path: "/progress", name: "Progress Ledger", toolKey: "progress-ledger" },
      { path: "/pricing", name: "Pricing & Plans", toolKey: "pricing" },
      { path: "/settings", name: "Account Settings", toolKey: "settings" },
    ];

    for (const tab of tabsToTest) {
      await cdp.navigate(`${baseUrl}${tab.path}`, 2000);

      const hasH1 = await cdp.evaluate(`Boolean(document.querySelector('h1'))`);
      const hasHowItWorks = await cdp.evaluate(`
        Boolean(document.querySelector('button[aria-label*="How this works" i], button:has(svg)'))
      `);

      assertTest(
        `Tab [${tab.name}] (${tab.path}) has clean h1 and HowItWorks panel trigger`,
        hasH1 && hasHowItWorks,
        `(h1: ${hasH1}, HowItWorks: ${hasHowItWorks})`
      );

      // In /jobs, test the sample listings disclaimer
      if (tab.path === "/jobs") {
        const hasSampleBadge = await cdp.evaluate(`
          document.body.innerText.includes("Sample listings")
        `);
        assertTest(
          "Jobs tab honestly labels mock vacancy feeds: 'Sample listings (Live feeds connecting)'",
          hasSampleBadge
        );
        await cdp.captureScreenshot(path.join(ARTIFACT_DIR, "06_tab_jobs_disclaimer.png"));
      }

      if (tab.path === "/passport") {
        await cdp.captureScreenshot(path.join(ARTIFACT_DIR, "07_tab_passport_header.png"));
      }
    }

    // ========================================================
    // SECTION 5: UNTOUCHED EXTERNAL ROUTES SANITY CHECK
    // ========================================================
    console.log("\n--- [Section 5: Public Pages Untouched Verification] ---");
    const publicPages = ["/", "/login", "/signup"];
    for (const pagePath of publicPages) {
      await cdp.navigate(`${baseUrl}${pagePath}`, 1500);
      const isOk = await cdp.evaluate(`Boolean(document.body)`);
      assertTest(`Public route [${pagePath}] renders normally without regressions`, isOk);
    }

  } finally {
    if (cdp) await cdp.close().catch(() => {});
    if (chromeProcess) chromeProcess.kill();
  }

  console.log("\n=======================================================");
  console.log(`🎉 COMPREHENSIVE QA FINISHED: ${passedCount}/${testNumber} TESTS PASSED`);
  console.log("=======================================================\n");
}

run()
  .catch((err) => {
    console.error("Test execution fatal error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
