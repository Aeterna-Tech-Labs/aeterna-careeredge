// scripts/capture-after-screenshots.js
// Captures after-screenshots for Step 3 at 360px, 768px, and 1280px.

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { PrismaClient } = require("@prisma/client");
const { SignJWT } = require("jose");

const prisma = new PrismaClient();
const OUTPUT_DIR = path.join(__dirname, "..", "docs", "screenshots", "after");
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

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
  const jwt = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);

  return jwt;
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

  async setViewport(width, height) {
    await this.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 640,
    });
    await new Promise((r) => setTimeout(r, 400));
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

async function run() {
  console.log("================================================================================");
  console.log("STEP 3: Capturing AFTER Screenshots (New Scoped Theme & Accordion Section Editor)");
  console.log("================================================================================\n");

  const testUser = await prisma.user.findFirst({
    where: { email: "anujwork2410@gmail.com" },
  });
  if (!testUser) throw new Error("Test user not found");

  const testResume = await prisma.resume.findFirst({
    where: { userId: testUser.id },
    orderBy: { updatedAt: "desc" },
  });

  await prisma.guideSeenPanel.upsert({
    where: { userId_panelId: { userId: testUser.id, panelId: "product-tour" } },
    update: { seenAt: new Date() },
    create: { userId: testUser.id, panelId: "product-tour", seenAt: new Date() },
  });

  const sessionToken = await mintSessionCookie({
    userId: testUser.id,
    email: testUser.email,
    name: testUser.name,
    onboardingCompleted: true,
  });

  console.log("Starting Chrome with remote debugging on port 9222...");
  const chrome = spawn("google-chrome", [
    "--headless=new",
    "--remote-debugging-port=9222",
    "--no-sandbox",
    "--disable-gpu",
    "about:blank",
  ]);

  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch("http://localhost:9222/json/version");
      if (res.ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }

  const wsUrl = await getBrowserTarget();
  const cdp = new ChromeCDP(wsUrl);
  await cdp.connect();

  await cdp.send("Network.enable");
  await cdp.send("Page.enable");
  await cdp.send("DOM.enable");

  const viewports = [
    { name: "1280px", width: 1280, height: 900 },
    { name: "768px", width: 768, height: 1024 },
    { name: "360px", width: 360, height: 740 },
  ];

  // 1. Authenticated Pages
  await cdp.send("Network.setCookie", {
    name: "ace_session",
    value: sessionToken,
    domain: "localhost",
    path: "/",
    httpOnly: true,
  });

  const authenticatedPages = [
    { id: "dashboard", url: "http://localhost:3000/dashboard" },
    { id: "resume_builder", url: `http://localhost:3000/resume/builder?id=${testResume ? testResume.id : ""}` },
    { id: "resume_studio", url: "http://localhost:3000/resume/studio" },
    { id: "jobs", url: "http://localhost:3000/jobs" },
    { id: "applications", url: "http://localhost:3000/applications" },
    { id: "career_passport", url: "http://localhost:3000/passport" },
  ];

  for (const page of authenticatedPages) {
    for (const vp of viewports) {
      console.log(`Navigating to ${page.id} at ${vp.name}...`);
      await cdp.setViewport(vp.width, vp.height);
      await cdp.navigate(page.url, 2500);
      const filePath = path.join(OUTPUT_DIR, `${page.id}_${vp.name}.png`);
      await cdp.captureScreenshot(filePath);
    }
  }

  // 2. Public Pages
  await cdp.send("Network.deleteCookies", {
    name: "ace_session",
    domain: "localhost",
    path: "/",
  });

  const publicPages = [
    { id: "landing", url: "http://localhost:3000/" },
    { id: "login", url: "http://localhost:3000/login" },
    { id: "signup", url: "http://localhost:3000/signup" },
  ];

  for (const page of publicPages) {
    for (const vp of viewports) {
      console.log(`Navigating to public page ${page.id} at ${vp.name}...`);
      await cdp.setViewport(vp.width, vp.height);
      await cdp.navigate(page.url, 2000);
      const filePath = path.join(OUTPUT_DIR, `${page.id}_${vp.name}.png`);
      await cdp.captureScreenshot(filePath);
    }
  }

  await cdp.close();
  chrome.kill();
  console.log("\n✅ All 27 AFTER screenshots captured successfully!");
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Screenshot capture failed:", err);
  process.exit(1);
});
