// aeterna-careeredge/scripts/test-print-header-suppression.js
// Verification script: Ensure Print/Save as PDF has zero browser headers (no timestamp, no company name)

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function createExportToken(resumeId, userId) {
  const secret = process.env.AUTH_SECRET || "default_dev_secret_careeredge";
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${resumeId}:${userId}:${timestamp}`)
    .digest("hex");
  return `${timestamp}.${signature}`;
}

async function run() {
  console.log("=== VERIFYING PRINT HEADER & TIMESTAMP SUPPRESSION ===");

  const resume = await prisma.resume.findFirst({
    include: { user: true },
  });

  if (!resume) {
    console.error("No test resume found.");
    process.exit(1);
  }

  console.log(`Using test resume: ${resume.id} (${resume.title}) for user: ${resume.user?.name}`);

  const token = createExportToken(resume.id, resume.userId);
  const printUrl = `http://localhost:3000/resume/${resume.id}/print?exportToken=${token}`;

  // 1. Fetch raw HTML from local dev server
  const response = await fetch(printUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch print page: HTTP ${response.status}`);
  }
  const html = await response.text();

  // Verify HTML contains @page margin 0mm
  if (!html.includes("margin: 0mm !important")) {
    throw new Error("HTML does not contain @page { margin: 0mm !important }");
  }
  console.log("✓ HTML contains @page { margin: 0mm !important; }");

  // Verify document title does not say "Aeterna CareerEdge"
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const pageTitle = titleMatch ? titleMatch[1] : "";
  console.log(`✓ Page Title in SSR HTML: "${pageTitle}"`);
  if (pageTitle.toLowerCase().includes("careeredge")) {
    throw new Error(`Document title should NOT include CareerEdge: "${pageTitle}"`);
  }

  // 2. Render to PDF using Google Chrome WITHOUT --no-pdf-header-footer
  // This accurately replicates user pressing Ctrl+P or clicking "Print / Save as PDF" in Chrome
  const tempPdfPath = path.join("/tmp", `test_browser_print_${Date.now()}.pdf`);
  try {
    execFileSync("google-chrome-stable", [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      `--print-to-pdf=${tempPdfPath}`,
      printUrl,
    ]);

    console.log(`✓ Rendered PDF via Chrome: ${tempPdfPath}`);

    // 3. Extract text from generated PDF
    const pdfText = execFileSync("pdftotext", [tempPdfPath, "-"]).toString();

    console.log("\n--- Sample Extracted PDF Text (first 300 chars) ---");
    console.log(pdfText.slice(0, 300));
    console.log("---------------------------------------------------\n");

    // 4. Assertions
    const hasCareerEdge = /CareerEdge/i.test(pdfText);
    const hasTimestamp = /\b\d{1,2}:\d{2}\s*(?:AM|PM)?\b/i.test(pdfText);
    const hasFileOrHttpUrl = /(?:http:\/\/localhost|file:\/\/)/i.test(pdfText);
    const hasCandidateName = resume.user?.name ? pdfText.includes(resume.user.name) : true;

    console.log(`Assertion 1: Does NOT contain "CareerEdge" header? ${!hasCareerEdge ? "PASSED" : "FAILED"}`);
    console.log(`Assertion 2: Does NOT contain timestamp (e.g. 5:30 PM)? ${!hasTimestamp ? "PASSED" : "FAILED"}`);
    console.log(`Assertion 3: Does NOT contain URL in footer? ${!hasFileOrHttpUrl ? "PASSED" : "FAILED"}`);
    console.log(`Assertion 4: Contains candidate's resume content? ${hasCandidateName ? "PASSED" : "FAILED"}`);

    if (hasCareerEdge || hasTimestamp || hasFileOrHttpUrl || !hasCandidateName) {
      throw new Error("One or more print header suppression assertions failed!");
    }

    console.log("\n🎉 ALL PRINT HEADER SUPPRESSION CHECKS PASSED!");
  } finally {
    if (fs.existsSync(tempPdfPath)) {
      fs.unlinkSync(tempPdfPath);
    }
    await prisma.$disconnect();
  }
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
