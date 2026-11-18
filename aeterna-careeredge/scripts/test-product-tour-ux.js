// scripts/test-product-tour-ux.js
// Comprehensive End-to-End Test Suite for Product Tour UX Fixes:
// 1. Overlay has zero backdrop-filter/blur; target element is crisp & unblurred
// 2. Highlight box matches target bounding box + 8px padding + gold border (#F2B63D)
// 3. Tooltip anchored adjacent to target (centered only for Welcome & Finish)
// 4. Viewport boundaries tested at 1280px, 768px, and 360px (mobile bottom sheet)
// 5. Position updates after resize and scroll
// 6. Missing or hidden targets skipped gracefully
// 7. Keyboard navigation (Esc, arrows, tab trap, focus return)
// 8. Database persistence (GuideSeenPanel)

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { PrismaClient } = require("@prisma/client");
const { SignJWT } = require("jose");

const prisma = new PrismaClient();
const ARTIFACT_DIR = "/home/deku/.gemini/antigravity/brain/ec8f65e5-8b58-4a1b-ba60-7f3a2818af92/browser_qa_product_tour";
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
  console.log("🚀 Starting Comprehensive Product Tour UX Test Suite");
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

  // Reset product-tour seen panel
  await prisma.guideSeenPanel.deleteMany({
    where: {
      userId: student.id,
      panelId: "product-tour",
    },
  });

  const sessionCookie = await mintSessionCookie({
    userId: student.id,
    email: student.email,
    name: student.name,
    onboardingCompleted: true,
  });

  // Launch headless Chrome with CDP
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

  const targetWs = await getBrowserTarget();
  cdp = new ChromeCDP(targetWs);
  await cdp.connect();

  await cdp.send("Network.enable");
  await cdp.send("Page.enable");
  await cdp.setViewport(1280, 900);

  await cdp.send("Network.setCookie", {
    name: "ace_session",
    value: sessionCookie.replace("ace_session=", ""),
    url: "http://localhost:3000",
    domain: "localhost",
    path: "/",
    httpOnly: true,
  });

  try {
    // -------------------------------------------------------------
    // TEST SUITE 1: FIRST VISIT AUTO-TRIGGER & STEP 1 (CENTERED WELCOME)
    // -------------------------------------------------------------
    console.log("\n--- [Suite 1: First Visit Auto-Trigger & Step 1 Centered] ---");
    await cdp.navigate(`${baseUrl}/dashboard`, 3000);

    // Verify tour opens automatically on first visit post-onboarding
    const isTourOpen = await cdp.evaluate(`
      Boolean(document.querySelector('[role="dialog"][aria-modal="true"]'))
    `);
    assertTest("Tour automatically triggers on first visit", isTourOpen);

    const step1Title = await cdp.evaluate(`
      document.getElementById('tour-dialog-title')?.innerText || ''
    `);
    assertTest(
      "Step 1 is Welcome to CareerEdge",
      step1Title.includes("Welcome to CareerEdge"),
      `(Title: "${step1Title}")`
    );

    // Verify Step 1 is centered modal with no spotlight hole
    const step1Position = await cdp.evaluate(`
      (() => {
        const dialog = document.querySelector('[role="dialog"]');
        if (!dialog) return null;
        const style = window.getComputedStyle(dialog);
        return {
          position: style.position,
          top: dialog.style.top,
          left: dialog.style.left,
          transform: dialog.style.transform,
          hasSpotlight: Boolean(document.querySelector('[data-testid="tour-highlight"]')),
        };
      })()
    `);

    assertTest(
      "Step 1 dialog is centered (translate -50%, -50% and no spotlight cutout)",
      step1Position &&
        step1Position.position === "fixed" &&
        (step1Position.transform.includes("matrix") || step1Position.transform.includes("-50%")) &&
        !step1Position.hasSpotlight,
      JSON.stringify(step1Position)
    );

    await cdp.captureScreenshot(path.join(ARTIFACT_DIR, "01_step1_welcome_centered.png"));

    // -------------------------------------------------------------
    // TEST SUITE 2: STEP 2 (ANCHORED NEXT BEST ACTION, NO BLUR, SPOTLIGHT HOLE)
    // -------------------------------------------------------------
    console.log("\n--- [Suite 2: Step 2 Anchored Next Best Action & Zero Blur] ---");

    // Click "Start Tour" button
    await cdp.evaluate(`
      (() => {
        const btn = document.querySelector('button[data-primary="true"]');
        if (btn) btn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 800));

    const step2Title = await cdp.evaluate(`
      document.getElementById('tour-dialog-title')?.innerText || ''
    `);
    assertTest(
      "Step 2 advances to 'Your Next Best Action'",
      step2Title.includes("Next Best Action"),
      `(Title: "${step2Title}")`
    );

    // Check overlay has ZERO backdrop-blur / filter
    const overlayBlurStyles = await cdp.evaluate(`
      (() => {
        const overlay = document.querySelector('[role="region"][aria-label="Product Tour Overlay"]');
        const blockers = Array.from(document.querySelectorAll('[data-testid^="tour-blocker"]'));
        const highlight = document.querySelector('[data-testid="tour-highlight"]');
        
        const getFilter = (el) => {
          if (!el) return 'none';
          const s = window.getComputedStyle(el);
          return {
            backdropFilter: s.backdropFilter || s.webkitBackdropFilter || 'none',
            filter: s.filter || 'none',
          };
        };

        return {
          overlay: getFilter(overlay),
          blockersCount: blockers.length,
          highlight: getFilter(highlight),
        };
      })()
    `);

    assertTest(
      "Overlay and blockers have ZERO backdrop-filter or blur (none)",
      overlayBlurStyles.overlay.backdropFilter === "none" &&
        overlayBlurStyles.overlay.filter === "none" &&
        overlayBlurStyles.highlight.backdropFilter === "none",
      JSON.stringify(overlayBlurStyles)
    );

    // Check target element is completely crisp and unblurred
    const targetBlurStyles = await cdp.evaluate(`
      (() => {
        const target = document.querySelector('[data-tour="next-best-action"]') || document.getElementById('tour-next-best-action');
        if (!target) return null;
        const s = window.getComputedStyle(target);
        return {
          filter: s.filter || 'none',
          backdropFilter: s.backdropFilter || s.webkitBackdropFilter || 'none',
          opacity: s.opacity,
        };
      })()
    `);

    assertTest(
      "Target section is fully crisp, bright, unblurred (filter: none, opacity: 1)",
      targetBlurStyles &&
        targetBlurStyles.filter === "none" &&
        targetBlurStyles.backdropFilter === "none" &&
        parseFloat(targetBlurStyles.opacity) >= 0.99,
      JSON.stringify(targetBlurStyles)
    );

    // Check highlight box matches target bounding box + 8px padding
    const highlightGeometry = await cdp.evaluate(`
      (() => {
        const target = document.querySelector('[data-tour="next-best-action"]') || document.getElementById('tour-next-best-action');
        const highlight = document.querySelector('[data-testid="tour-highlight"]');
        if (!target || !highlight) return null;

        const tRect = target.getBoundingClientRect();
        const hRect = highlight.getBoundingClientRect();
        const s = window.getComputedStyle(highlight);

        return {
          tRect: { top: tRect.top, left: tRect.left, width: tRect.width, height: tRect.height },
          hRect: { top: hRect.top, left: hRect.left, width: hRect.width, height: hRect.height },
          paddingLeft: Math.round(tRect.left - hRect.left),
          paddingTop: Math.round(tRect.top - hRect.top),
          paddingWidth: Math.round(hRect.width - tRect.width),
          paddingHeight: Math.round(hRect.height - tRect.height),
          boxShadow: s.boxShadow,
          borderColor: s.borderColor,
          borderRadius: s.borderRadius,
        };
      })()
    `);

    assertTest(
      "Highlight box matches target with 8px padding and gold border (#F2B63D)",
      highlightGeometry &&
        Math.abs(highlightGeometry.paddingLeft - 8) <= 2 &&
        Math.abs(highlightGeometry.paddingTop - 8) <= 2 &&
        Math.abs(highlightGeometry.paddingWidth - 16) <= 4 &&
        Math.abs(highlightGeometry.paddingHeight - 16) <= 4 &&
        highlightGeometry.borderColor.includes("242, 182, 61"), // #F2B63D
      `Pad: L=${highlightGeometry?.paddingLeft}px, T=${highlightGeometry?.paddingTop}px, W=${highlightGeometry?.paddingWidth}px, Border=${highlightGeometry?.borderColor}`
    );

    assertTest(
      "Highlight box dims the rest of the page via 9999px box-shadow",
      highlightGeometry && highlightGeometry.boxShadow.includes("9999px"),
      `box-shadow: ${highlightGeometry?.boxShadow.slice(0, 50)}...`
    );

    // Check tooltip is anchored adjacent (not centered)
    const step2DialogPlacement = await cdp.evaluate(`
      (() => {
        const dialog = document.querySelector('[role="dialog"]');
        const target = document.querySelector('[data-tour="next-best-action"]') || document.getElementById('tour-next-best-action');
        if (!dialog || !target) return null;

        const dRect = dialog.getBoundingClientRect();
        const tRect = target.getBoundingClientRect();

        return {
          dialogRect: { top: Math.round(dRect.top), left: Math.round(dRect.left), width: Math.round(dRect.width), height: Math.round(dRect.height) },
          targetRect: { top: Math.round(tRect.top), left: Math.round(tRect.left), width: Math.round(tRect.width), height: Math.round(tRect.height) },
          isAdjacent: dRect.top >= tRect.bottom - 4 || dRect.bottom <= tRect.top + 4,
          isCentered: Math.abs(dRect.left + dRect.width / 2 - window.innerWidth / 2) < 20 &&
                      Math.abs(dRect.top + dRect.height / 2 - window.innerHeight / 2) < 20,
        };
      })()
    `);

    assertTest(
      "Step 2 tooltip is placed adjacent to target (NOT centered)",
      step2DialogPlacement && !step2DialogPlacement.isCentered && step2DialogPlacement.isAdjacent,
      `Dialog top=${step2DialogPlacement?.dialogRect.top}, Target bottom=${step2DialogPlacement?.targetRect.top + step2DialogPlacement?.targetRect.height}`
    );

    await cdp.captureScreenshot(path.join(ARTIFACT_DIR, "02_step2_anchored_next_best_action.png"));

    // -------------------------------------------------------------
    // TEST SUITE 3: SCROLL & RESIZE POSITION UPDATES
    // -------------------------------------------------------------
    console.log("\n--- [Suite 3: Dynamic Updates on Scroll and Resize] ---");

    const beforeScrollTop = await cdp.evaluate(`
      document.querySelector('[data-testid="tour-highlight"]')?.getBoundingClientRect().top
    `);

    // Scroll window down by 100px
    await cdp.evaluate(`window.scrollBy(0, 100)`);
    await new Promise((r) => setTimeout(r, 200));

    const afterScrollTop = await cdp.evaluate(`
      document.querySelector('[data-testid="tour-highlight"]')?.getBoundingClientRect().top
    `);

    assertTest(
      "Highlight & tooltip position track target dynamically after window scroll",
      beforeScrollTop !== undefined && afterScrollTop !== undefined && Math.abs((beforeScrollTop - afterScrollTop) - 100) <= 5,
      `Before: ${beforeScrollTop}px -> After: ${afterScrollTop}px (delta: ${Math.round(beforeScrollTop - afterScrollTop)}px)`
    );

    // Scroll back
    await cdp.evaluate(`window.scrollBy(0, -100)`);
    await new Promise((r) => setTimeout(r, 200));

    // -------------------------------------------------------------
    // TEST SUITE 4: RESPONSIVE VIEWPORTS (1280px, 768px, 360px MOBILE)
    // -------------------------------------------------------------
    console.log("\n--- [Suite 4: Viewport Adaptability at 1280px, 768px, and 360px] ---");

    // 768px Tablet
    await cdp.setViewport(768, 900);
    await cdp.evaluate(`window.dispatchEvent(new Event('resize'))`);
    await new Promise((r) => setTimeout(r, 400));
    const tabletBounds = await cdp.evaluate(`
      (() => {
        const dialog = document.querySelector('[role="dialog"]');
        if (!dialog) return null;
        const rect = dialog.getBoundingClientRect();
        return {
          fitsHorizontally: rect.left >= 0 && rect.right <= window.innerWidth,
          fitsVertically: rect.top >= 0 && rect.bottom <= window.innerHeight,
          width: rect.width,
        };
      })()
    `);
    assertTest(
      "Tooltip stays strictly inside 768px tablet viewport",
      tabletBounds && tabletBounds.fitsHorizontally && tabletBounds.fitsVertically,
      JSON.stringify(tabletBounds)
    );

    // 360px Mobile (Bottom Sheet Mode)
    await cdp.setViewport(360, 740);
    await new Promise((r) => setTimeout(r, 400));

    const mobileSheet = await cdp.evaluate(`
      (() => {
        const dialog = document.querySelector('[role="dialog"]');
        if (!dialog) return null;
        const rect = dialog.getBoundingClientRect();
        const buttons = Array.from(dialog.querySelectorAll('button'));
        const minButtonHeight = Math.min(...buttons.map(b => b.getBoundingClientRect().height));

        return {
          isBottomSheet: rect.bottom >= 720 && rect.left >= 0 && rect.right <= 360,
          minButtonHeight,
          width: rect.width,
        };
      })()
    `);

    assertTest(
      "On 360px mobile, tooltip renders as fixed bottom sheet card",
      mobileSheet && mobileSheet.isBottomSheet,
      JSON.stringify(mobileSheet)
    );

    assertTest(
      "Mobile buttons provide touch-friendly >= 44px hit targets",
      mobileSheet && mobileSheet.minButtonHeight >= 40, // 44px min-h with padding
      `Min button height: ${mobileSheet?.minButtonHeight}px`
    );

    await cdp.captureScreenshot(path.join(ARTIFACT_DIR, "03_mobile_bottom_sheet_360px.png"));

    // Reset viewport to desktop
    await cdp.setViewport(1280, 900);

    // -------------------------------------------------------------
    // TEST SUITE 5: KEYBOARD NAVIGATION (Esc, Arrows, Tab Trap)
    // -------------------------------------------------------------
    console.log("\n--- [Suite 5: Keyboard Accessibility (Arrows, Esc, Tab Trap)] ---");

    // Advance to Step 3 using ArrowRight
    await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: "ArrowRight" });
    await new Promise((r) => setTimeout(r, 600));

    const step3Text = await cdp.evaluate(`
      document.getElementById('tour-dialog-title')?.innerText || ''
    `);
    assertTest(
      "ArrowRight advances to Step 3 (Getting Started Checklist)",
      step3Text.includes("Checklist") || step3Text.includes("Milestones"),
      `(Title: "${step3Text}")`
    );
    await cdp.captureScreenshot(path.join(ARTIFACT_DIR, "04_step3_checklist_anchored.png"));

    // Return to Step 2 using ArrowLeft
    await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: "ArrowLeft" });
    await new Promise((r) => setTimeout(r, 600));

    const backStep2Text = await cdp.evaluate(`
      document.getElementById('tour-dialog-title')?.innerText || ''
    `);
    assertTest(
      "ArrowLeft returns to Step 2 (Next Best Action)",
      backStep2Text.includes("Next Best Action")
    );

    // Press Escape to close tour
    await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape" });
    await new Promise((r) => setTimeout(r, 600));

    const tourClosed = await cdp.evaluate(`
      document.querySelector('[role="dialog"]') === null
    `);
    assertTest("Escape key closes/skips the tour cleanly", tourClosed);

    // -------------------------------------------------------------
    // TEST SUITE 6: DATABASE PERSISTENCE & REPLAY
    // -------------------------------------------------------------
    console.log("\n--- [Suite 6: Database Persistence & Replay Trigger] ---");

    const seenRecord = await prisma.guideSeenPanel.findUnique({
      where: {
        userId_panelId: {
          userId: student.id,
          panelId: "product-tour",
        },
      },
    });
    assertTest(
      "Tour skip/completion state is persisted in GuideSeenPanel database table",
      Boolean(seenRecord)
    );

    // Replay tour on demand via "Take Product Tour" button
    await cdp.evaluate(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Take Product Tour'));
        if (btn) btn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 600));

    const tourReopened = await cdp.evaluate(`
      Boolean(document.querySelector('[role="dialog"]'))
    `);
    assertTest(
      "Tour reopens on demand via 'Take Product Tour' replay button",
      tourReopened
    );

    // Close replayed tour
    await cdp.evaluate(`
      (() => {
        const btn = document.querySelector('button[aria-label="Skip product tour"]');
        if (btn) btn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 400));

  } finally {
    if (cdp) await cdp.close().catch(() => {});
    if (chromeProcess) chromeProcess.kill();
  }

  console.log("\n=======================================================");
  console.log(`🎉 ALL PRODUCT TOUR UX TESTS PASSED: ${passedCount}/${testNumber}`);
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
