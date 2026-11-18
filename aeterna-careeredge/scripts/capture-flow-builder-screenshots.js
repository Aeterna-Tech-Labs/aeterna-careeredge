// scripts/capture-flow-builder-screenshots.js
// Automated Visual QA and Screenshot Generation for Resume Upload & Flow-Style Builder

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { PrismaClient } = require("@prisma/client");
const { SignJWT } = require("jose");

const prisma = new PrismaClient();
const ARTIFACT_DIR = "/home/deku/.gemini/antigravity/brain/ec8f65e5-8b58-4a1b-ba60-7f3a2818af92/browser_qa_flow_builder";
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
    if (!code.includes("return ") && !code.includes("const ") && !code.includes("let ") && !code.includes(";")) {
      code = `return (${code});`;
    }
    const res = await this.send("Runtime.evaluate", {
      expression: `(() => {\n${code}\n})()`,
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

async function run() {
  console.log("================================================================================");
  console.log("VISUAL QA: Capturing Flow-Style Builder & Resume Upload Screenshots");
  console.log("================================================================================\n");

  const baseUrl = "http://localhost:3000";

  let testUser = await prisma.user.findFirst({
    where: { email: "student.ananya@careeredge.internal" },
  });

  if (!testUser) {
    testUser = await prisma.user.findFirst({
      where: { email: "anujwork2410@gmail.com" },
    });
  }
  if (!testUser) {
    testUser = await prisma.user.findFirst();
  }

  // Prevent auto-trigger product tour from covering our test views
  await prisma.guideSeenPanel.upsert({
    where: {
      userId_panelId: {
        userId: testUser.id,
        panelId: "product-tour",
      },
    },
    update: { seenAt: new Date() },
    create: {
      userId: testUser.id,
      panelId: "product-tour",
      seenAt: new Date(),
    },
  });

  // Find or create a rich resume for student
  let resume = await prisma.resume.findFirst({
    where: { userId: testUser.id },
    orderBy: { updatedAt: "desc" },
  });

  if (!resume) {
    throw new Error("No resume found for test student. Run test-resume-upload-and-flow-builder.js first.");
  }

  const sessionCookie = await mintSessionCookie({
    userId: testUser.id,
    email: testUser.email,
    name: testUser.name,
    onboardingCompleted: true,
  });

  const rawCookieToken = sessionCookie.split("=")[1];

  console.log("Launching headless Google Chrome on port 9222...");
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

    await cdp.send("Network.setCookie", {
      name: "ace_session",
      value: rawCookieToken,
      domain: "localhost",
      path: "/",
      httpOnly: true,
    });

    await cdp.setViewport(1440, 900);

    // 1. Dashboard View
    console.log("Navigating to /dashboard...");
    await cdp.navigate(`${baseUrl}/dashboard`, 3000);
    await cdp.captureScreenshot(path.join(ARTIFACT_DIR, "01_dashboard_upload_action.png"));

    // 2. Resume Studio Start Screen (3 pathways)
    console.log("Navigating to /resume...");
    await cdp.navigate(`${baseUrl}/resume`, 2500);
    await cdp.captureScreenshot(path.join(ARTIFACT_DIR, "02_resume_studio_3_pathways.png"));

    // 3. Open Upload Modal from Resume Studio
    console.log("Opening Upload Modal...");
    await cdp.evaluate(`
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Upload My Resume') || b.textContent.includes('Upload Resume'));
      if (btn) btn.click();
    `);
    await new Promise((r) => setTimeout(r, 800));
    await cdp.captureScreenshot(path.join(ARTIFACT_DIR, "03_upload_resume_modal.png"));

    // Close modal
    await cdp.evaluate(`
      const closeBtn = document.querySelector('button[aria-label="Close dialog"]');
      if (closeBtn) closeBtn.click();
    `);
    await new Promise((r) => setTimeout(r, 500));

    // 4. Flow-Style Resume Builder Desktop 3-Zone Layout
    console.log(`Navigating to /resume/builder?id=${resume.id}...`);
    await cdp.navigate(`${baseUrl}/resume/builder?id=${resume.id}`, 3000);
    await cdp.captureScreenshot(path.join(ARTIFACT_DIR, "04_flow_builder_3_zone_desktop.png"));

    // 5. Flow-Style Zoom Scaling
    console.log("Testing Zoom Controls...");
    await cdp.evaluate(`
      const zoomOut = Array.from(document.querySelectorAll('button')).find(b => b.title && b.title.includes('Zoom out'));
      if (zoomOut) { zoomOut.click(); }
    `);
    await new Promise((r) => setTimeout(r, 600));
    await cdp.captureScreenshot(path.join(ARTIFACT_DIR, "05_flow_builder_zoom_scaled.png"));

    // Reset zoom
    await cdp.evaluate(`
      const zoomReset = Array.from(document.querySelectorAll('button')).find(b => b.title && b.title.includes('Reset'));
      if (zoomReset) { zoomReset.click(); }
    `);
    await new Promise((r) => setTimeout(r, 500));

    // 6. Test Collapsible Panels
    console.log("Testing Collapsible Side Panels...");
    await cdp.evaluate(`
      const collapseBtns = Array.from(document.querySelectorAll('button[title*="panel"]'));
      collapseBtns.forEach(b => b.click());
    `);
    await new Promise((r) => setTimeout(r, 600));
    await cdp.captureScreenshot(path.join(ARTIFACT_DIR, "06_flow_builder_panels_collapsed.png"));

    // Expand panels back
    await cdp.evaluate(`
      const expandBtns = Array.from(document.querySelectorAll('button[title*="panel"]'));
      expandBtns.forEach(b => b.click());
    `);
    await new Promise((r) => setTimeout(r, 600));

    // 7. Open Fit to 1 Page Assistant Modal
    console.log("Opening Fit to 1 Page Assistant...");
    await cdp.evaluate(`
      const fitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Fit to 1 Page'));
      if (fitBtn) fitBtn.click();
    `);
    await new Promise((r) => setTimeout(r, 800));
    await cdp.captureScreenshot(path.join(ARTIFACT_DIR, "07_fit_to_one_page_modal.png"));

    // Close Fit to 1 Page Assistant Modal
    await cdp.evaluate(`
      const cancelBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Keep As Is') || b.textContent.includes('Close') || b.getAttribute('aria-label') === 'Close');
      if (cancelBtn) cancelBtn.click();
    `);
    await new Promise((r) => setTimeout(r, 500));

    // 8. Open Before & After Modal
    console.log("Opening Before & After Comparison Modal...");
    await cdp.evaluate(`
      const compBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Compare Baseline'));
      if (compBtn) compBtn.click();
    `);
    await new Promise((r) => setTimeout(r, 800));
    await cdp.captureScreenshot(path.join(ARTIFACT_DIR, "08_before_after_modal.png"));

    // Close Before & After Modal
    await cdp.evaluate(`
      const closeCompBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Done') || b.getAttribute('aria-label') === 'Close');
      if (closeCompBtn) closeCompBtn.click();
    `);
    await new Promise((r) => setTimeout(r, 500));

    // 9. Open Import File Modal inside Builder
    console.log("Opening Import File Modal from builder toolbar...");
    await cdp.evaluate(`
      const importBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Import File'));
      if (importBtn) importBtn.click();
    `);
    await new Promise((r) => setTimeout(r, 800));
    await cdp.captureScreenshot(path.join(ARTIFACT_DIR, "09_builder_import_file_modal.png"));

    console.log("\n✅ All Visual QA Screenshots captured successfully!");
  } finally {
    if (cdp) await cdp.close();
    chromeProcess.kill();
  }
}

run().catch((err) => {
  console.error("Visual QA error:", err);
  process.exit(1);
});
