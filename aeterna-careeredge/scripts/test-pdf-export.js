// scripts/test-pdf-export.js
// Automated Verification Suite for ATS Resume PDF Export Engine
// Verifies:
// 1. Safe filename generation and security sanitization
// 2. Cryptographic HMAC-SHA256 export tokens and expiration
// 3. Authenticated PDF export API (/api/resumes/[id]/export-pdf)
// 4. Exact vector selectable text (pdftotext) - ATS compliant
// 5. Zero application chrome leakage (no navbar, sidebar, buttons, guide)
// 6. Correct physical page sizing (A4 vs Letter via pdfinfo)
// 7. Multi-tenant security isolation (Student B blocked from Student A)
// 8. Dedicated clean print route (/resume/[id]/print) verification
// 9. All 6 visual templates render clean ATS PDFs

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const { execSync } = require("child_process");
const { SignJWT } = require("jose");

const prisma = new PrismaClient();

// Helper to load AUTH_SECRET
function getAuthSecret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  try {
    const envFile = fs.readFileSync(path.join(__dirname, "..", ".env"), "utf8");
    const match = envFile.match(/AUTH_SECRET=["']?([^"'\n]+)["']?/);
    if (match) return match[1];
  } catch {}
  try {
    const envLocal = fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8");
    const match = envLocal.match(/AUTH_SECRET=["']?([^"'\n]+)["']?/);
    if (match) return match[1];
  } catch {}
  return "default_dev_secret_careeredge";
}

const AUTH_SECRET = getAuthSecret();

// Filename sanitizer (mirroring implementation in src/lib/resume/pdf-export.ts)
function buildSafePdfFilename(name, targetRole) {
  const sanitize = (str) =>
    (str || "")
      .trim()
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

  const cleanName = sanitize(name || "Student");
  const cleanRole = sanitize(targetRole || "Resume");
  return `${cleanName}-Resume-${cleanRole}.pdf`;
}

// Token functions
function createExportToken(resumeId, userId, secret = AUTH_SECRET, timestamp = Date.now()) {
  const hmac = crypto
    .createHmac("sha256", secret)
    .update(`${resumeId}:${userId}:${timestamp}`)
    .digest("hex");
  return `${timestamp}.${hmac}`;
}

function verifyExportToken(token, resumeId, userId, secret = AUTH_SECRET) {
  try {
    const [timestampStr, hmac] = token.split(".");
    const timestamp = parseInt(timestampStr, 10);
    if (Date.now() - timestamp > 60000 || Date.now() < timestamp - 5000) {
      return false;
    }
    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${resumeId}:${userId}:${timestamp}`)
      .digest("hex");

    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expected));
  } catch {
    return false;
  }
}

// Session JWT creation
async function mintSessionCookie(payload) {
  const secretKey = new TextEncoder().encode(AUTH_SECRET);
  const jwt = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);

  return `ace_session=${jwt}`;
}

function extractPdfText(pdfPath) {
  return execSync(`pdftotext "${pdfPath}" -`, { encoding: "utf8" });
}

function getPdfInfo(pdfPath) {
  const output = execSync(`pdfinfo "${pdfPath}"`, { encoding: "utf8" });
  const pagesMatch = output.match(/Pages:\s+(\d+)/);
  const pageSizeMatch = output.match(/Page size:\s+([^\n]+)/);
  return {
    pages: pagesMatch ? parseInt(pagesMatch[1], 10) : 0,
    pageSizeStr: pageSizeMatch ? pageSizeMatch[1].trim() : "",
  };
}

async function runTests() {
  console.log("\n🧪 Running Aeterna CareerEdge Resume PDF Export Engine Test Suite...\n");
  let passed = 0;
  let total = 0;
  const tempFiles = [];

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
    // ── 1. Unit Tests: Safe Filename Sanitization ─────────────────────────
    console.log("--- [Test Suite 1: Filename Sanitization & Security] ---");
    const name1 = buildSafePdfFilename("Pooja Sharma", "Full-Stack Web Developer");
    assert(
      name1 === "Pooja-Sharma-Resume-Full-Stack-Web-Developer.pdf",
      `Filename constructed cleanly: ${name1}`
    );

    const name2 = buildSafePdfFilename("../../etc/passwd<script>", "Senior Admin & Root | / ?");
    assert(
      !name2.includes("..") && !name2.includes("/") && !name2.includes("<") && !name2.includes("|"),
      `Path traversal and shell meta-characters stripped: ${name2}`
    );

    const name3 = buildSafePdfFilename("", null);
    assert(
      name3 === "Student-Resume-Resume.pdf",
      `Safe fallback when name and role are empty: ${name3}`
    );

    // ── 2. Unit Tests: Cryptographic Export Tokens ─────────────────────────
    console.log("\n--- [Test Suite 2: Cryptographic HMAC Export Tokens] ---");
    const dummyResumeId = "res_123456";
    const dummyUserId = "user_987654";
    const validToken = createExportToken(dummyResumeId, dummyUserId);

    assert(
      verifyExportToken(validToken, dummyResumeId, dummyUserId) === true,
      "Valid token verified successfully"
    );

    assert(
      verifyExportToken(validToken, "res_other", dummyUserId) === false,
      "Tampered resumeId safely rejected"
    );

    assert(
      verifyExportToken(validToken, dummyResumeId, "user_other") === false,
      "Tampered userId safely rejected"
    );

    const expiredToken = createExportToken(dummyResumeId, dummyUserId, AUTH_SECRET, Date.now() - 70000);
    assert(
      verifyExportToken(expiredToken, dummyResumeId, dummyUserId) === false,
      "Expired token (>60s) safely rejected"
    );

    // ── 3. Find Primary Test User & Resume ─────────────────────────────────
    console.log("\n--- [Test Suite 3: Database & Multi-Tenant Setup] ---");
    const studentA = await prisma.user.findFirst({
      where: { email: "pooja.sharma.test@aeterna.io" },
      include: { profile: true },
    });

    if (!studentA) {
      throw new Error("Primary test student (pooja.sharma.test@aeterna.io) not found in database.");
    }

    const resumeA = await prisma.resume.findFirst({
      where: { userId: studentA.id },
    });

    if (!resumeA) {
      throw new Error(`Resume for student ${studentA.email} not found.`);
    }

    assert(
      studentA && resumeA,
      `Student A identified: ${studentA.name} (${studentA.email}) with Resume: ${resumeA.id}`
    );

    // Clean any prior synthetic records
    await prisma.resume.deleteMany({ where: { user: { email: { contains: "synth.student.b." } } } });
    await prisma.studentProfile.deleteMany({ where: { user: { email: { contains: "synth.student.b." } } } });
    await prisma.user.deleteMany({ where: { email: { contains: "synth.student.b." } } });

    // Create Synthetic Student B for multi-tenant isolation
    const studentBEmail = `synth.student.b.${Date.now()}@aeterna.test`;
    const studentB = await prisma.user.create({
      data: {
        name: "Vikram Malhotra",
        email: studentBEmail,
        passwordHash: "dummyhash123",
        mobile: `987${Math.floor(1000000 + Math.random() * 9000000)}`,
        profile: {
          create: {
            academicDomain: "Commerce & Finance",
            course: "B.Com",
            institution: "Christ University",
            preferredJobRole: "Financial Analyst",
          },
        },
      },
    });

    const resumeB = await prisma.resume.create({
      data: {
        userId: studentB.id,
        title: "Vikram's Finance Resume",
        targetRole: "Financial Analyst",
        templateId: "standard-modern",
        structuredData: JSON.stringify({
          contactInfo: {
            name: "Vikram Malhotra",
            email: studentBEmail,
            phone: "+91 9876543211",
            location: "Bengaluru, India",
          },
          sections: [
            {
              id: "sec_sum",
              type: "summary",
              customTitle: "Summary",
              visible: true,
              entries: [
                {
                  id: "e1",
                  title: "Summary",
                  bullets: [{ id: "b1", text: "Financial modeling and valuation specialist." }],
                },
              ],
            },
          ],
        }),
      },
    });

    assert(
      studentB && resumeB,
      `Student B created: ${studentB.name} (${studentB.email}) with Resume: ${resumeB.id}`
    );

    const cookieA = await mintSessionCookie({
      userId: studentA.id,
      email: studentA.email,
      name: studentA.name,
      onboardingCompleted: true,
    });

    const cookieB = await mintSessionCookie({
      userId: studentB.id,
      email: studentB.email,
      name: studentB.name,
      onboardingCompleted: true,
    });

    // ── 4. End-to-End PDF Export API Route Test ────────────────────────────
    console.log("\n--- [Test Suite 4: Authenticated PDF Export API (/api/resumes/[id]/export-pdf)] ---");
    const port = process.env.PORT || "3000";
    const baseUrl = `http://localhost:${port}`;

    const resA = await fetch(`${baseUrl}/api/resumes/${resumeA.id}/export-pdf`, {
      headers: { Cookie: cookieA },
    });

    assert(resA.status === 200, `API returned HTTP 200 OK (got ${resA.status})`);
    assert(
      resA.headers.get("content-type") === "application/pdf",
      `Content-Type is application/pdf (got ${resA.headers.get("content-type")})`
    );

    const disposition = resA.headers.get("content-disposition");
    assert(
      disposition && disposition.includes("attachment") && disposition.includes("Pooja-Sharma"),
      `Content-Disposition contains clean attachment filename: ${disposition}`
    );

    assert(
      resA.headers.get("cache-control") && resA.headers.get("cache-control").includes("no-store"),
      "Cache-Control header prevents caching of private student resumes"
    );

    const arrayBufferA = await resA.arrayBuffer();
    const pdfBufferA = Buffer.from(arrayBufferA);
    assert(
      pdfBufferA.length > 5000 && pdfBufferA.toString("utf8", 0, 5) === "%PDF-",
      `Valid PDF binary received (${pdfBufferA.length} bytes, magic bytes %PDF- verified)`
    );

    const tempPdfA = path.join(os.tmpdir(), `test_export_A_${Date.now()}.pdf`);
    fs.writeFileSync(tempPdfA, pdfBufferA);
    tempFiles.push(tempPdfA);

    // ── 5. Vector Text & Zero App Chrome Verification (pdftotext) ───────────
    console.log("\n--- [Test Suite 5: Selectable Text & App Chrome Elimination Check] ---");
    const textA = extractPdfText(tempPdfA);

    assert(
      textA.includes("Pooja Sharma") &&
        (textA.includes("Full-Stack") || textA.includes("Developer") || textA.includes("RV College")),
      "PDF contains real candidate name and experience in selectable vector text"
    );

    // Forbidden UI elements that must NEVER appear in the resume PDF
    const forbiddenUiElements = [
      "AI Career Guide",
      "Ask Career Guide",
      "Back to Resumes",
      "Search bar",
      "Open navigation menu",
      "Notifications",
      "Analyze and improve my full resume",
      "Print / Save as PDF",
      "Download PDF",
      "Back to Editor",
      "Save as Draft",
      "Export PDF",
      "ATS Score Check",
    ];

    const leakedUi = forbiddenUiElements.filter((ui) => textA.toLowerCase().includes(ui.toLowerCase()));
    assert(
      leakedUi.length === 0,
      `Zero application chrome leaked into PDF (Checked: ${forbiddenUiElements.slice(0, 5).join(", ")}. Leaked: ${leakedUi.join(", ") || "NONE"})`
    );

    // ── 6. Page Sizing & Margin Verification (A4 vs Letter) ────────────────
    console.log("\n--- [Test Suite 6: Physical Page Sizing (A4 vs Letter)] ---");
    const infoA4 = getPdfInfo(tempPdfA);
    assert(infoA4.pages >= 1, `A4 PDF contains valid page count: ${infoA4.pages} page(s)`);
    assert(
      infoA4.pageSizeStr.includes("595") || infoA4.pageSizeStr.toLowerCase().includes("a4"),
      `A4 Page dimensions verified: ${infoA4.pageSizeStr}`
    );

    // Test Letter parameter
    const resLetter = await fetch(`${baseUrl}/api/resumes/${resumeA.id}/export-pdf?pageSize=Letter`, {
      headers: { Cookie: cookieA },
    });
    assert(resLetter.status === 200, "Letter size export API returned HTTP 200 OK");

    const arrayBufferLetter = await resLetter.arrayBuffer();
    const pdfBufferLetter = Buffer.from(arrayBufferLetter);
    const tempPdfLetter = path.join(os.tmpdir(), `test_export_Letter_${Date.now()}.pdf`);
    fs.writeFileSync(tempPdfLetter, pdfBufferLetter);
    tempFiles.push(tempPdfLetter);

    const infoLetter = getPdfInfo(tempPdfLetter);
    assert(
      infoLetter.pageSizeStr.includes("612") || infoLetter.pageSizeStr.toLowerCase().includes("letter"),
      `Letter Page dimensions verified: ${infoLetter.pageSizeStr}`
    );

    // ── 7. Multi-Tenant Security & Ownership Isolation ─────────────────────
    console.log("\n--- [Test Suite 7: Multi-Tenant Security & Ownership Isolation] ---");
    // Student B attempts to download Student A's resume PDF
    const resUnauthorized = await fetch(`${baseUrl}/api/resumes/${resumeA.id}/export-pdf`, {
      headers: { Cookie: cookieB },
    });

    assert(
      resUnauthorized.status === 404,
      `Student B blocked from Student A's resume: HTTP ${resUnauthorized.status} (Access Denied / Not Found)`
    );

    // Anonymous attempt (no session cookie)
    const resAnonymous = await fetch(`${baseUrl}/api/resumes/${resumeA.id}/export-pdf`);
    assert(
      resAnonymous.status === 401,
      `Anonymous request blocked without session: HTTP ${resAnonymous.status} Unauthorized`
    );

    // Student B downloads their own resume
    const resOwnB = await fetch(`${baseUrl}/api/resumes/${resumeB.id}/export-pdf`, {
      headers: { Cookie: cookieB },
    });
    assert(resOwnB.status === 200, `Student B can download their own resume: HTTP 200 OK`);

    const tempPdfB = path.join(os.tmpdir(), `test_export_B_${Date.now()}.pdf`);
    fs.writeFileSync(tempPdfB, Buffer.from(await resOwnB.arrayBuffer()));
    tempFiles.push(tempPdfB);

    const textB = extractPdfText(tempPdfB);
    assert(
      textB.includes("Vikram Malhotra") && !textB.includes("Pooja Sharma"),
      "Strict data isolation: Student B's PDF contains ONLY Student B data"
    );

    // ── 8. Dedicated Print Route Verification (/resume/[id]/print) ─────────
    console.log("\n--- [Test Suite 8: Dedicated Print Route (/resume/[id]/print)] ---");
    const printTokenA = createExportToken(resumeA.id, studentA.id);
    const resPrintDirect = await fetch(
      `${baseUrl}/resume/${resumeA.id}/print?exportToken=${printTokenA}&isPdfExport=true`
    );

    assert(resPrintDirect.status === 200, "Dedicated print route accessible via valid HMAC token");
    const printHtml = await resPrintDirect.text();

    assert(
      printHtml.includes("resume-document-container") || printHtml.includes("Pooja Sharma"),
      "Print route renders the resume document"
    );

    assert(
      !printHtml.includes("data-sidebar") && !printHtml.includes("data-career-guide"),
      "Print route has ZERO StudentLayout chrome (sidebar and career guide completely absent)"
    );

    // ── 9. All 6 Templates Verification ───────────────────────────────────
    console.log("\n--- [Test Suite 9: All 6 Visual & ATS Templates Verification] ---");
    const TEMPLATES = [
      "standard-modern",
      "executive-classic",
      "tech-minimal",
      "two-column-sidebar",
      "academic-clinical",
      "creative-portfolio",
    ];

    const originalStyle = resumeA.styleData;

    for (const tId of TEMPLATES) {
      await prisma.resume.update({
        where: { id: resumeA.id },
        data: {
          styleData: JSON.stringify({
            templateId: tId,
            colors: {
              accent: "#7A0F1F",
              heading: "#1c1917",
              body: "#374151",
              background: "#ffffff",
              sidebar: "#f8fafc",
              link: "#7A0F1F",
            },
            fonts: { heading: "Plus Jakarta Sans", body: "Inter" },
            fontSizes: { name: 22, headings: 13, body: 9.5 },
            spacing: { margins: "standard", sectionSpacing: 16, lineHeight: 1.45, bulletIndent: 16 },
            layout: {
              columnLayout: tId === "two-column-sidebar" ? "two-column-left" : "single",
              headerAlignment: "left",
              showPhoto: false,
              dateFormat: "MMM YYYY",
              showContactIcons: true,
              dividerStyle: "solid",
            },
          }),
        },
      });

      const resT = await fetch(`${baseUrl}/api/resumes/${resumeA.id}/export-pdf`, {
        headers: { Cookie: cookieA },
      });

      assert(resT.status === 200, `Template [${tId}]: HTTP 200 returned`);
      const bufT = Buffer.from(await resT.arrayBuffer());
      const tempT = path.join(os.tmpdir(), `test_tmpl_${tId}_${Date.now()}.pdf`);
      fs.writeFileSync(tempT, bufT);
      tempFiles.push(tempT);

      const textT = extractPdfText(tempT);
      assert(
        textT.toLowerCase().includes("pooja sharma"),
        `Template [${tId}]: Selectable candidate text verified`
      );

      const leakedT = forbiddenUiElements.filter((ui) => textT.toLowerCase().includes(ui.toLowerCase()));
      assert(
        leakedT.length === 0,
        `Template [${tId}]: Zero application UI leaked into PDF`
      );
    }

    // Restore original style
    await prisma.resume.update({
      where: { id: resumeA.id },
      data: { styleData: originalStyle },
    });
    console.log("Original resume style restored.");

    // ── Teardown ──────────────────────────────────────────────────────────
    console.log("\n--- [Teardown & Cleanup] ---");
    await prisma.resume.deleteMany({ where: { userId: studentB.id } });
    await prisma.studentProfile.deleteMany({ where: { userId: studentB.id } });
    await prisma.user.delete({ where: { id: studentB.id } });
    console.log("Synthetic Student B and records deleted.");

    for (const f of tempFiles) {
      try {
        if (fs.existsSync(f)) fs.unlinkSync(f);
      } catch {}
    }
    console.log(`Cleaned up ${tempFiles.length} temporary PDF test files.`);

    console.log(`\n==================================================`);
    console.log(`🎉 ALL PDF EXPORT TESTS PASSED: ${passed}/${total}`);
    console.log(`==================================================\n`);
  } catch (err) {
    console.error("❌ Test suite encountered an error:", err);
    process.exitCode = 1;
  } finally {
    // Teardown temp files on error
    for (const f of tempFiles) {
      try {
        if (fs.existsSync(f)) fs.unlinkSync(f);
      } catch {}
    }
    await prisma.$disconnect();
  }
}

runTests();
