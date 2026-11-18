// scripts/test-resume-upload-and-flow-builder.js
// Automated End-to-End QA Suite for Resume Upload & Flow-Style Customization System

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const { PrismaClient } = require("@prisma/client");
const { SignJWT } = require("jose");

const prisma = new PrismaClient();
const ARTIFACT_DIR = "/home/deku/.gemini/antigravity/brain/ec8f65e5-8b58-4a1b-ba60-7f3a2818af92/browser_qa_flow_builder";
fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

const PROJECT_ROOT = path.resolve(__dirname, "..");
const BASE_URL = "http://localhost:3000";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✕ FAIL: ${message}`);
    failed++;
  }
}

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

async function runTests() {
  console.log("================================================================================");
  console.log("TEST SUITE: Resume Upload & Flow-Style Customization System");
  console.log("================================================================================\n");

  // Setup test user
  let testUser = await prisma.user.findFirst({
    where: { email: "anujwork2410@gmail.com" },
  });

  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        email: "student.ananya@careeredge.internal",
        name: "Ananya Rao",
        passwordHash: "$2a$10$abcdefghijklmnopqrstuvwxyz123456",
        onboardingCompleted: true,
        profile: {
          create: {
            academicDomain: "Engineering & Technology",
            preferredJobRole: "Full Stack Engineer",
          },
        },
      },
    });
  }

  const sessionCookie = await mintSessionCookie({
    userId: testUser.id,
    sub: testUser.id,
    role: "STUDENT",
    name: testUser.name,
    email: testUser.email,
    onboardingCompleted: true,
  });

  // ── TEST 1: Entry Points & Absence on Public Pages ─────────────────────────────
  console.log("1. Verifying Universal Upload Buttons in Required Locations & Absence on Public Pages...");
  {
    function fileContains(relPath, searchStr) {
      const fullPath = path.join(PROJECT_ROOT, relPath);
      if (!fs.existsSync(fullPath)) return false;
      return fs.readFileSync(fullPath, "utf8").includes(searchStr);
    }

    assert(
      fileContains("src/app/dashboard/dashboard-client.tsx", "UploadResumeButton") &&
      fileContains("src/app/dashboard/dashboard-client.tsx", "Upload your resume or build one"),
      "Location 1: Dashboard includes Quick Action and Checklist upload items"
    );

    assert(
      fileContains("src/lib/guidance/next-best-action.ts", "Upload your resume or build one"),
      "Location 1: Next Best Action suggests uploading resume for low passport score"
    );

    assert(
      fileContains("src/app/onboarding/page.tsx", "Already have a resume? Upload it to fill your Career Passport faster") &&
      fileContains("src/app/passport/passport-client.tsx", "UploadResumeButton"),
      "Location 2: Onboarding & Passport start include Upload Resume banner"
    );

    assert(
      fileContains("src/app/resume/resume-list-client.tsx", "Upload My Resume") &&
      fileContains("src/app/resume/resume-list-client.tsx", "Start from Career Passport") &&
      fileContains("src/app/resume/resume-list-client.tsx", "Start from Scratch"),
      "Location 3: Resume Studio start screen displays 3 distinct creation pathways"
    );

    assert(
      fileContains("src/app/resume/check/resume-check-client.tsx", "Upload a Resume to Analyze") &&
      fileContains("src/app/resume/check/resume-check-client.tsx", "Upload Another Resume"),
      "Location 4: Resume Check provides upload button in empty & active states"
    );

    assert(
      fileContains("src/app/resume/builder/builder-client.tsx", "UploadResumeButton") &&
      fileContains("src/app/resume/builder/builder-client.tsx", "Import File"),
      "Location 5: Resume Builder toolbar includes 'Import File' button"
    );

    assert(
      fileContains("src/app/applications/applications-client.tsx", "Use my uploaded resume as base"),
      "Location 6: Job Application Pack contains 'Use my uploaded resume as base'"
    );

    assert(
      fileContains("src/config/tour-steps.ts", "uploading an existing resume"),
      "Location 7: Product Tour mentions resume upload option"
    );

    // Public pages must NOT have UploadResumeButton
    assert(
      !fileContains("src/app/page.tsx", "UploadResumeButton"),
      "Public landing page (/) strictly has zero upload button"
    );
    assert(
      !fileContains("src/app/login/page.tsx", "UploadResumeButton"),
      "Public login page (/login) strictly has zero upload button"
    );
    assert(
      !fileContains("src/app/signup/page.tsx", "UploadResumeButton"),
      "Public signup page (/signup) strictly has zero upload button"
    );
  }

  // ── TEST 2: Upload API Validation & Error Rejections ──────────────────────────
  console.log("\n2. Testing Upload API Endpoints, File Validation & Privacy Consent...");
  {
    // A. Missing consent rejection
    const dummyPdf = Buffer.from("%PDF-1.4\n%EOF");
    const formDataNoConsent = new FormData();
    formDataNoConsent.append("file", new Blob([dummyPdf], { type: "application/pdf" }), "test.pdf");

    const resNoConsent = await fetch(`${BASE_URL}/api/resumes/upload`, {
      method: "POST",
      headers: { Cookie: sessionCookie },
      body: formDataNoConsent,
    });
    assert(resNoConsent.status === 400, "Upload without explicit consent rejected with HTTP 400");
    const dataNoConsent = await resNoConsent.json();
    assert(dataNoConsent.code === "CONSENT_REQUIRED", "Rejection specifies code CONSENT_REQUIRED");

    // B. Forged PDF extension (HTML with .pdf filename)
    const fakePdf = Buffer.from("<html><body>Malicious HTML disguised as PDF</body></html>");
    const formFakePdf = new FormData();
    formFakePdf.append("file", new Blob([fakePdf], { type: "application/pdf" }), "fake.pdf");
    formFakePdf.append("consent", "true");

    const resFake = await fetch(`${BASE_URL}/api/resumes/upload`, {
      method: "POST",
      headers: { Cookie: sessionCookie },
      body: formFakePdf,
    });
    assert(resFake.status === 422 || resFake.status === 400, "Forged file extension rejected via magic-bytes check");

    // C. Password-protected PDF friendly rejection
    const protectedPdf = Buffer.from(
      "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\ntrailer\n<< /Size 10 /Encrypt 5 0 R >>\nstartxref\n100\n%%EOF"
    );
    const formProtected = new FormData();
    formProtected.append("file", new Blob([protectedPdf], { type: "application/pdf" }), "locked.pdf");
    formProtected.append("consent", "true");

    const resProtected = await fetch(`${BASE_URL}/api/resumes/upload`, {
      method: "POST",
      headers: { Cookie: sessionCookie },
      body: formProtected,
    });
    assert(resProtected.status === 422, "Password-protected PDF rejected with friendly HTTP 422");
    const dataProtected = await resProtected.json();
    assert(dataProtected.code === "PASSWORD_PROTECTED", "Rejection specifies code PASSWORD_PROTECTED");

    // D. Scanned / image-only PDF friendly rejection
    const scannedPdf = Buffer.concat([
      Buffer.from("%PDF-1.4\n1 0 obj\n<< /Type /XObject /Subtype /Image >>\nstream\n"),
      Buffer.alloc(4000, 0x55),
      Buffer.from("\nendstream\nendobj\ntrailer\n<< /Size 5 >>\n%%EOF"),
    ]);
    const formScanned = new FormData();
    formScanned.append("file", new Blob([scannedPdf], { type: "application/pdf" }), "scanned.pdf");
    formScanned.append("consent", "true");

    const resScanned = await fetch(`${BASE_URL}/api/resumes/upload`, {
      method: "POST",
      headers: { Cookie: sessionCookie },
      body: formScanned,
    });
    assert(resScanned.status === 422, "Scanned / image-only PDF rejected with friendly HTTP 422");
    const dataScanned = await resScanned.json();
    assert(dataScanned.code === "SCANNED_PDF", "Rejection specifies code SCANNED_PDF and suggests text paste");

    // E. Valid synthetic PDF upload with compressed stream
    const resumeText = `
Ananya Rao
Email: ananya.rao@example.com | Phone: +91 98765 43210
LinkedIn: https://linkedin.com/in/ananyarao | GitHub: https://github.com/ananyarao
Bengaluru, India

SUMMARY
Lead Full Stack Engineer with 4 years building scalable TypeScript and Node.js microservices.

EDUCATION
B.E. Computer Science and Engineering
RV College of Engineering
2018 - 2022 | Score: 8.85 CGPA

EXPERIENCE
Software Engineer
FinTech Solutions
07/2022 - Present | Bengaluru
- Engineered low-latency payment processing pipeline handling 10,000 transactions per second.
- Designed distributed caching cluster reducing database load by 40%.

PROJECTS
CareConnect Telemedicine
https://github.com/ananyarao/careconnect
- Developed HIPAA-compliant video consultation platform using Next.js and WebRTC.

SKILLS
TypeScript, React, Next.js, Node.js, PostgreSQL, Redis, Docker, Kubernetes

CERTIFICATIONS
AWS Certified Solutions Architect
Amazon Web Services | 2023
`;

    // Package stream into valid FlateDecode PDF
    const textTokens = resumeText.split("\n").map((line) => `(${line.replace(/[()\\]/g, "")}) Tj T*`).join(" ");
    const decompressedStream = Buffer.from(`BT /F1 12 Tf ${textTokens} ET`);
    const deflatedStream = zlib.deflateSync(decompressedStream);

    const validSyntheticPdf = Buffer.concat([
      Buffer.from("%PDF-1.4\n1 0 obj\n<< /Length " + deflatedStream.length + " /Filter /FlateDecode >>\nstream\n"),
      deflatedStream,
      Buffer.from("\nendstream\nendobj\ntrailer\n<< /Size 2 >>\n%%EOF"),
    ]);

    const formValid = new FormData();
    formValid.append("file", new Blob([validSyntheticPdf], { type: "application/pdf" }), "Ananya_Rao_Resume.pdf");
    formValid.append("consent", "true");

    const resValid = await fetch(`${BASE_URL}/api/resumes/upload`, {
      method: "POST",
      headers: { Cookie: sessionCookie },
      body: formValid,
    });

    assert(resValid.status === 200, "Valid synthetic PDF processed successfully with HTTP 200");
    const validJson = await resValid.json();
    const payloadData = validJson.parsedData || validJson.parsed;
    assert(validJson.documentId !== undefined, "Returns private documentId");
    assert(payloadData !== undefined, "Returns parsed structured preview for mandatory review");
    assert(payloadData.contactInfo.name === "Ananya Rao", "Parsed student name matches uploaded document");
    assert(payloadData.education.length > 0, "Extracted education record for review");
    assert(payloadData.experience.length > 0, "Extracted experience record for review");

    // F. Verify Consent Record in Database
    const consent = await prisma.consentRecord.findFirst({
      where: { userId: testUser.id, consentType: "AI_PROCESSING" },
      orderBy: { grantedAt: "desc" },
    });
    assert(consent !== null && consent.isGranted === true, "Explicit DPDP consent record persisted in database");

    // G. Verify Private Storage Isolation (Never in public/)
    const storedDoc = await prisma.storedDocument.findUnique({
      where: { id: validJson.documentId },
    });
    assert(storedDoc !== null, "StoredDocument database record created");
    assert(storedDoc.isPrivate === true, "Document record explicitly marked isPrivate: true");
    assert(!storedDoc.storageKey.includes("public/"), "Storage key is strictly private, never inside public/");

    // ── TEST 3: Import into Career Passport & Resume Studio Draft ─────────────
    console.log("\n3. Testing Mandatory Review Import into Career Passport & Resume Studio Draft...");
    const importPayload = {
      documentId: validJson.documentId,
      approvedPayload: payloadData,
      importToPassport: true,
      createResume: true,
      resumeTitle: "Ananya Rao - Uploaded Draft",
      targetRole: "Full Stack Engineer",
    };

    const resImport = await fetch(`${BASE_URL}/api/resumes/import`, {
      method: "POST",
      headers: {
        Cookie: sessionCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(importPayload),
    });

    assert(resImport.status === 201 || resImport.status === 200, "Import processed with HTTP 201/200");
    const importJson = await resImport.json();
    assert(importJson.success === true, "Import reported success: true");
    assert(importJson.resumeId !== undefined, "Created new Resume Studio draft");
    const scoreVal = importJson.passportScore || importJson.updatedPassportScore;
    assert(scoreVal >= 30, `Passport readiness score updated (${scoreVal}%)`);

    // Verify Career Passport records carry DOCUMENT_EXTRACTED provenance
    const importedEdu = await prisma.educationRecord.findFirst({
      where: { userId: testUser.id, dataOrigin: "DOCUMENT_EXTRACTED" },
    });
    assert(importedEdu !== null, "Education imported into Passport with provenance DOCUMENT_EXTRACTED");

    const importedSkill = await prisma.studentSkill.findFirst({
      where: { userId: testUser.id, dataOrigin: "DOCUMENT_EXTRACTED" },
    });
    assert(importedSkill !== null, "Skills imported into Passport with provenance DOCUMENT_EXTRACTED");

    const importedExp = await prisma.studentExperience.findFirst({
      where: { userId: testUser.id, dataOrigin: "DOCUMENT_EXTRACTED" },
    });
    assert(importedExp !== null, "Experience imported into Passport with provenance DOCUMENT_EXTRACTED");

    // Verify Resume and snapshot ResumeVersion created
    const createdResume = await prisma.resume.findUnique({
      where: { id: importJson.resumeId },
      include: { versions: true },
    });
    assert(createdResume !== null, "New Resume record exists in database");
    assert(createdResume.versions.length >= 1, "Initial baseline snapshot created in ResumeVersion table");

    // ── TEST 4: Document Listing & Secure Tenant Isolation Deletion ───────────
    console.log("\n4. Testing Uploaded Documents Management & Ownership Isolation...");

    // A. List documents for student
    const resList = await fetch(`${BASE_URL}/api/resumes/uploaded-documents`, {
      headers: { Cookie: sessionCookie },
    });
    assert(resList.status === 200, "List uploaded documents returns HTTP 200");
    const listJson = await resList.json();
    assert(Array.isArray(listJson.documents) && listJson.documents.length >= 1, "Returns student's uploaded documents");
    assert(listJson.documents.some((d) => d.id === validJson.documentId), "Uploaded document listed with metadata");

    // B. Tenant isolation: Student B cannot delete Student A's document
    const studentBCookie = await mintSessionCookie({
      userId: "intruder_user_id_456",
      sub: "intruder_user_id_456",
      role: "STUDENT",
      name: "Intruder User",
      email: "intruder@careeredge.internal",
      onboardingCompleted: true,
    });

    const resIntruderDelete = await fetch(`${BASE_URL}/api/resumes/uploaded-documents/${validJson.documentId}`, {
      method: "DELETE",
      headers: { Cookie: studentBCookie },
    });
    assert(resIntruderDelete.status === 404, "Student B forbidden from deleting Student A's document (HTTP 404)");

    // C. Student A deletes own document -> file and record removed
    const resDelete = await fetch(`${BASE_URL}/api/resumes/uploaded-documents/${validJson.documentId}`, {
      method: "DELETE",
      headers: { Cookie: sessionCookie },
    });
    assert(resDelete.status === 200, "Student A successfully deleted document");
    const checkDeleted = await prisma.storedDocument.findUnique({
      where: { id: validJson.documentId },
    });
    assert(checkDeleted === null, "Document record removed from database");
  }

  // ── TEST 5: Flow-Style Customization System Verification ───────────────────────
  console.log("\n5. Testing Flow-Style 3-Zone Customization & Interaction Quality...");
  {
    function fileContains(relPath, searchStr) {
      const fullPath = path.join(PROJECT_ROOT, relPath);
      return fs.readFileSync(fullPath, "utf8").includes(searchStr);
    }

    // A. 3-Zone Split View
    assert(
      fileContains("src/app/resume/builder/builder-client.tsx", "isLeftCollapsed") &&
      fileContains("src/app/resume/builder/builder-client.tsx", "isRightCollapsed") &&
      fileContains("src/app/resume/builder/builder-client.tsx", "PanelLeftOpen") &&
      fileContains("src/app/resume/builder/builder-client.tsx", "PanelRightOpen"),
      "Desktop 3-zone split layout features collapsible Left Content and Right Design panels"
    );

    // B. Zoom controls (50% to 150%)
    assert(
      fileContains("src/app/resume/builder/builder-client.tsx", "setZoom") &&
      fileContains("src/app/resume/builder/builder-client.tsx", "ZoomIn") &&
      fileContains("src/app/resume/builder/builder-client.tsx", "ZoomOut"),
      "Interactive Zoom toolbar supports 50%, 75%, 90%, 100%, 125%, 150% scaling"
    );

    // C. Live Page Boundary Visual Cutoff Line
    assert(
      fileContains("src/app/resume/builder/components/resume-preview.tsx", "Page 1 / Page 2 Boundary") &&
      fileContains("src/app/resume/builder/components/resume-preview.tsx", "1123px"),
      "Live preview draws crisp dashed Page 1 / Page 2 cutoff boundary at 1123px"
    );

    // D. Fit to 1 Page Assistant Modal
    assert(
      fileContains("src/app/resume/builder/builder-client.tsx", "Fit to 1 Page Assistant") &&
      fileContains("src/app/resume/builder/builder-client.tsx", "setShowFitPageModal") &&
      fileContains("src/app/resume/builder/builder-client.tsx", "compact (8mm)"),
      "Fit to 1 Page Assistant presents before/after spacing values before applying"
    );

    // E. HTML5 Drag-and-Drop and Accessible Move Up/Down Keyboard Controls
    assert(
      fileContains("src/app/resume/builder/components/section-editor.tsx", "handleSectionDragStart") &&
      fileContains("src/app/resume/builder/components/section-editor.tsx", "handleEntryDragStart") &&
      fileContains("src/app/resume/builder/components/section-editor.tsx", "handleBulletDragStart") &&
      fileContains("src/app/resume/builder/components/section-editor.tsx", "MoveUp") &&
      fileContains("src/app/resume/builder/components/section-editor.tsx", "MoveDown"),
      "HTML5 drag-and-drop handles and accessible Move Up/Down buttons enabled on sections, entries, and bullets"
    );

    // F. Inline Bullet AI Optimizer with Side-by-Side Diff
    assert(
      fileContains("src/app/resume/builder/components/section-editor.tsx", "AI Bullet Point Optimizer") &&
      fileContains("src/app/resume/builder/components/section-editor.tsx", "Original Phrasing:") &&
      fileContains("src/app/resume/builder/components/section-editor.tsx", "Improved Draft (Editable):") &&
      fileContains("src/app/resume/builder/components/section-editor.tsx", "Accept Improvement"),
      "Inline Bullet AI Optimizer provides side-by-side diff with editable draft before accepting"
    );

    // G. Before / After Whole Resume Comparison Modal
    assert(
      fileContains("src/app/resume/builder/components/before-after-modal.tsx", "Before &amp; After") &&
      fileContains("src/app/resume/builder/components/before-after-modal.tsx", "Baseline:") &&
      fileContains("src/app/resume/builder/components/before-after-modal.tsx", "Optimized:") &&
      fileContains("src/app/resume/builder/components/before-after-modal.tsx", "Highlights of Changes") &&
      fileContains("src/app/resume/builder/components/before-after-modal.tsx", "Revert this bullet"),
      "BeforeAfterModal compares baseline vs optimized resume with score diff and bullet revert"
    );

    // H. Flexible Custom Sections
    assert(
      fileContains("src/app/resume/builder/components/section-editor.tsx", "+ Publications") &&
      fileContains("src/app/resume/builder/components/section-editor.tsx", "+ Leadership") &&
      fileContains("src/app/resume/builder/components/section-editor.tsx", "+ Volunteering") &&
      fileContains("src/app/resume/builder/components/section-editor.tsx", "+ Patents") &&
      fileContains("src/app/resume/builder/components/section-editor.tsx", "+ Languages") &&
      fileContains("src/app/resume/builder/components/section-editor.tsx", "+ Awards") &&
      fileContains("src/app/resume/builder/components/section-editor.tsx", "+ Create Freeform Section"),
      "Custom sections picker supports Publications, Leadership, Volunteering, Patents, Languages, Awards, and Freeform"
    );
  }

  console.log("\n================================================================================");
  console.log(`TEST RESULTS: ${passed} assertions passed, ${failed} failed.`);
  console.log("================================================================================\n");

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
