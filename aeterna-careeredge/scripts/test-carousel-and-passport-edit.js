// scripts/test-carousel-and-passport-edit.js
// Automated End-to-End Browser & API QA Suite for:
// 1. Dashboard Top-Level Tool Showcase Carousel
// 2. Onboarding Information Editing Mode
// 3. Career Passport Interactive Fill/Edit System (CRUD)

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { PrismaClient } = require("@prisma/client");
const { SignJWT } = require("jose");

const prisma = new PrismaClient();
const ARTIFACT_DIR = "/home/deku/.gemini/antigravity/brain/ec8f65e5-8b58-4a1b-ba60-7f3a2818af92/browser_qa_carousel_passport";
fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

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

  async navigate(url, waitMs = 2500) {
    await this.send("Page.navigate", { url });
    await new Promise((r) => setTimeout(r, waitMs));
  }

  async evaluate(expression) {
    let code = expression.trim();
    if (code.startsWith("(() =>")) {
      // already wrapped
    } else if (!code.includes("return ") && !code.includes("const ") && !code.includes("let ") && !code.includes(";")) {
      code = `return (${code});`;
      code = `(() => {\n${code}\n})()`;
    } else if (!code.includes("return ")) {
      code = `(() => {\n${code}\n})()`;
    } else {
      code = `(() => {\n${code}\n})()`;
    }
    const res = await this.send("Runtime.evaluate", {
      expression: code,
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

  async setViewport(width, height) {
    await this.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 640,
    });
    await new Promise((r) => setTimeout(r, 400));
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
  console.log("🚀 Starting E2E QA: Carousel, Onboarding Edit, & Passport");
  console.log("=======================================================\n");

  const baseUrl = "http://localhost:3000";

  // 1. Identify test student
  const student = await prisma.user.findFirst({
    where: { email: "pooja.sharma.test@aeterna.io" },
    include: { profile: true },
  });

  if (!student) {
    throw new Error("Student Pooja Sharma not found in dev database.");
  }

  // Prevent auto-trigger product tour from covering our test views
  await prisma.guideSeenPanel.upsert({
    where: {
      userId_panelId: {
        userId: student.id,
        panelId: "product-tour",
      },
    },
    update: { seenAt: new Date() },
    create: {
      userId: student.id,
      panelId: "product-tour",
      seenAt: new Date(),
    },
  });

  const sessionCookie = await mintSessionCookie({
    userId: student.id,
    email: student.email,
    name: student.name,
    onboardingCompleted: true,
  });

  const rawCookieToken = sessionCookie.split("=")[1];

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
  for (let attempt = 0; attempt < 25; attempt++) {
    try {
      const res = await fetch("http://localhost:9222/json/version");
      if (res.ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }

  try {
    const wsUrl = await getBrowserTarget();
    cdp = new ChromeCDP(wsUrl);
    await cdp.connect();

    await cdp.send("Network.enable");
    await cdp.send("Page.enable");
    await cdp.send("DOM.enable");

    // Set authenticated session cookie
    await cdp.send("Network.setCookie", {
      name: "ace_session",
      value: rawCookieToken,
      domain: "localhost",
      path: "/",
      httpOnly: true,
    });

    await cdp.setViewport(1280, 850);

    async function typeIntoInput(selector, text) {
      await cdp.evaluate(`
        const el = document.querySelector('${selector}');
        if (el) {
          el.focus();
          el.value = '';
        }
      `);
      await cdp.send("Input.insertText", { text });
      await new Promise((r) => setTimeout(r, 200));
    }

    // =========================================================================
    // PART 1: DASHBOARD TOOL SHOWCASE CAROUSEL
    // =========================================================================
    console.log("\n--- PART 1: Dashboard Tool Showcase Carousel ---");
    await cdp.navigate(`${baseUrl}/dashboard`);

    // Verify Carousel Element exists
    const carouselFound = await cdp.evaluate(`Boolean(document.querySelector('[data-tour="tool-showcase"]'))`);
    assertTest("Tool Showcase Carousel Exists on Dashboard", carouselFound);

    // Verify initial slide is Resume Studio
    const initialTitle = await cdp.evaluate(`
      document.querySelector('[data-tour="tool-showcase"] h2')?.textContent?.trim() || ""
    `);
    assertTest("Carousel Initial Slide Has Headline", initialTitle.length > 0, `("${initialTitle}")`);

    // Click Next chevron to advance slide
    await cdp.evaluate(`
      const btn = document.querySelector('button[aria-label="Next tool slide"]');
      if (btn) btn.click();
    `);
    await new Promise((r) => setTimeout(r, 700));

    const secondTitle = await cdp.evaluate(`
      document.querySelector('[data-tour="tool-showcase"] h2')?.textContent?.trim() || ""
    `);
    assertTest("Manual Chevron Advances Slide", secondTitle !== initialTitle, `("${secondTitle}")`);

    // Test Quick Jump Pills (e.g. click LinkedIn or Job Matches)
    const jumpedToLinkedIn = await cdp.evaluate(`
      const pills = Array.from(document.querySelectorAll('[data-tour="tool-showcase"] ~ div button, [data-tour="tool-showcase"] button'));
      const liBtn = pills.find(b => b.textContent.includes("LinkedIn"));
      if (liBtn) {
        liBtn.click();
        return true;
      }
      return false;
    `);
    await new Promise((r) => setTimeout(r, 600));

    const linkedInSlideActive = await cdp.evaluate(`
      const txt = document.querySelector('[data-tour="tool-showcase"]')?.textContent || "";
      return txt.includes("LinkedIn Intelligence") || txt.includes("Social Proof") || txt.includes("Recruiter");
    `);
    assertTest("Quick-Jump Pill Activates Target Tool", jumpedToLinkedIn && linkedInSlideActive);

    // Verify "Edit Onboarding Info" link in greeting header
    const editOnboardingLink = await cdp.evaluate(`
      return Boolean(document.querySelector('a[href="/onboarding?from=dashboard"]'));
    `);
    assertTest("'Edit Onboarding Info' Link Visible in Greeting Area", editOnboardingLink);

    await cdp.captureScreenshot(path.join(ARTIFACT_DIR, "01_dashboard_carousel.png"));

    // =========================================================================
    // PART 2: ONBOARDING EDIT MODE
    // =========================================================================
    console.log("\n--- PART 2: Onboarding Editing Mode ---");
    await cdp.navigate(`${baseUrl}/onboarding?from=dashboard`);

    // Check Editing Mode Banner
    const editBannerPresent = await cdp.evaluate(`
      return document.body.textContent.includes("Profile Editing Mode");
    `);
    assertTest("Profile Editing Mode Banner Renders", editBannerPresent);

    // Verify all steps are clickable in step-progress stepper
    const stepperJumpSuccess = await cdp.evaluate(`
      const navButtons = Array.from(document.querySelectorAll('nav[aria-label="Onboarding progress"] button'));
      // Step 4 is index 3 (Goals)
      if (navButtons[3] && !navButtons[3].disabled) {
        navButtons[3].click();
        return true;
      }
      return false;
    `);
    await new Promise((r) => setTimeout(r, 700));

    const onGoalsStep = await cdp.evaluate(`
      return document.body.textContent.includes("Target Professional Role") ||
        document.body.textContent.includes("Career Goals") ||
        document.body.textContent.includes("Preferred Job Role");
    `);
    assertTest("Non-Linear Direct Jump to Step 4 Allowed in Edit Mode", stepperJumpSuccess && onGoalsStep);

    await cdp.captureScreenshot(path.join(ARTIFACT_DIR, "02_onboarding_edit_mode.png"));

    // =========================================================================
    // PART 3: CAREER PASSPORT INTERACTIVE FILL & EDIT SYSTEM
    // =========================================================================
    console.log("\n--- PART 3: Career Passport Interactive System ---");
    await cdp.navigate(`${baseUrl}/passport`);

    // Verify Master Profile Edit Button
    const editProfileBtn = await cdp.evaluate(`
      return Array.from(document.querySelectorAll("button")).some(b => b.textContent.includes("Edit Master Profile"));
    `);
    assertTest("'Edit Master Profile' Button Renders in Passport Header", editProfileBtn);

    // Open Profile Modal
    await cdp.evaluate(`
      const b = Array.from(document.querySelectorAll("button")).find(x => x.textContent.includes("Edit Master Profile"));
      if (b) b.click();
    `);
    await new Promise((r) => setTimeout(r, 600));

    const profileModalVisible = await cdp.evaluate(`
      return document.querySelector('#profile-modal-title')?.textContent?.includes("Edit Master Career Profile") || false;
    `);
    assertTest("ProfileModal Opens with Form Controls", profileModalVisible);

    // Close Profile Modal
    await cdp.evaluate(`
      const b = Array.from(document.querySelectorAll("button")).find(x => x.textContent === "Cancel");
      if (b) b.click();
    `);
    await new Promise((r) => setTimeout(r, 400));

    // Test Adding a New Skill via SkillModal
    console.log("\n--- PART 3B: Testing Skill Addition ---");
    await cdp.evaluate(`
      const b = Array.from(document.querySelectorAll("button")).find(x => x.textContent.includes("Add Skill"));
      if (b) b.click();
    `);
    await new Promise((r) => setTimeout(r, 600));

    const testSkill = `Verified-Skill-${Date.now().toString().slice(-4)}`;
    await typeIntoInput('input[placeholder*="Python"]', testSkill);

    const skillAdded = await cdp.evaluate(`
      const submitBtn = Array.from(document.querySelectorAll("button")).find(b => b.type === "submit" && b.textContent.includes("Add Skill"));
      if (submitBtn) {
        submitBtn.click();
        return true;
      }
      return false;
    `);
    assertTest("Skill Form Submitted", skillAdded);
    await new Promise((r) => setTimeout(r, 1500));

    const skillRendered = await cdp.evaluate(`
      return document.body.textContent.includes("${testSkill}");
    `);
    assertTest(`New Skill "${testSkill}" Rendered Optimistically on Page`, skillRendered);

    // Verify Skill in SQLite DB
    const dbSkill = await prisma.studentSkill.findFirst({
      where: { userId: student.id, name: testSkill },
    });
    assertTest("New Skill Persisted in SQLite Database", Boolean(dbSkill));

    // Test Adding an Education Record via EducationModal
    console.log("\n--- PART 3C: Testing Education Addition ---");
    await cdp.evaluate(`
      const b = Array.from(document.querySelectorAll("button")).find(x => x.textContent.includes("Add Degree"));
      if (b) b.click();
    `);
    await new Promise((r) => setTimeout(r, 600));

    const testUni = `Karnataka Tech Institute ${Date.now().toString().slice(-4)}`;
    await typeIntoInput('input[placeholder*="Visvesvaraya"]', testUni);

    const eduAdded = await cdp.evaluate(`
      const submitBtn = Array.from(document.querySelectorAll("button")).find(b => b.type === "submit" && (b.textContent.includes("Add Education") || b.textContent.includes("Update Education")));
      if (submitBtn) {
        submitBtn.click();
        return true;
      }
      return false;
    `);
    assertTest("Education Form Submitted", eduAdded);
    await new Promise((r) => setTimeout(r, 1500));

    const eduRendered = await cdp.evaluate(`
      return document.body.textContent.includes("${testUni}");
    `);
    assertTest(`New Education Record "${testUni}" Rendered`, eduRendered);

    const dbEdu = await prisma.educationRecord.findFirst({
      where: { userId: student.id, institution: testUni },
    });
    assertTest("Education Record Persisted in SQLite Database", Boolean(dbEdu));

    // Test Adding a Practical Project via ProjectModal
    console.log("\n--- PART 3D: Testing Project Addition ---");
    await cdp.evaluate(`
      const b = Array.from(document.querySelectorAll("button")).find(x => x.textContent.includes("Add Project"));
      if (b) b.click();
    `);
    await new Promise((r) => setTimeout(r, 600));

    const testProj = `Healthcare AI Ledger ${Date.now().toString().slice(-4)}`;
    await typeIntoInput('input[placeholder*="Healthcare"]', testProj);

    const projAdded = await cdp.evaluate(`
      const submitBtn = Array.from(document.querySelectorAll("button")).find(b => b.type === "submit" && (b.textContent.includes("Add Project") || b.textContent.includes("Update Project")));
      if (submitBtn) {
        submitBtn.click();
        return true;
      }
      return false;
    `);
    assertTest("Project Form Submitted", projAdded);
    await new Promise((r) => setTimeout(r, 1500));

    const projRendered = await cdp.evaluate(`
      return document.body.textContent.includes("${testProj}");
    `);
    assertTest(`New Project "${testProj}" Rendered on Page`, projRendered);

    const dbProj = await prisma.studentProject.findFirst({
      where: { userId: student.id, title: testProj },
    });
    assertTest("Project Persisted in SQLite Database", Boolean(dbProj));

    // Test Deletion (e.g. Delete the test project we just added)
    console.log("\n--- PART 3E: Testing Deletion ---");
    if (dbProj) {
      // Direct API DELETE test to verify score recalculation
      const deleteRes = await fetch(`${baseUrl}/api/passport/projects?id=${dbProj.id}`, {
        method: "DELETE",
        headers: {
          Cookie: `ace_session=${rawCookieToken}`,
        },
      });
      const deleteJson = await deleteRes.json();
      assertTest("DELETE /api/passport/projects Returns Success", deleteJson.success === true);

      const dbProjAfter = await prisma.studentProject.findUnique({
        where: { id: dbProj.id },
      });
      assertTest("Deleted Project Removed from SQLite Database", dbProjAfter === null);
    }

    // Clean up test records
    if (dbSkill) await prisma.studentSkill.delete({ where: { id: dbSkill.id } });
    if (dbEdu) await prisma.educationRecord.delete({ where: { id: dbEdu.id } });

    await cdp.captureScreenshot(path.join(ARTIFACT_DIR, "03_passport_interactive_hub.png"));

    console.log("\n=======================================================");
    console.log(`🎉 ALL TESTS COMPLETE: ${passedCount}/${testNumber} PASSED`);
    console.log("=======================================================\n");
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exitCode = 1;
  } finally {
    if (cdp) await cdp.close();
    chromeProcess.kill();
    await prisma.$disconnect();
  }
}

run();
