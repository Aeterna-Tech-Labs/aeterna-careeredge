// src/lib/resume/pdf-export.ts
// Server-Side High-Fidelity ATS PDF Export Engine
// Generates clean, vector-text selectable PDFs matching the live template with zero app chrome.

import fs from "fs/promises";
import path from "path";
import os from "os";
import crypto from "crypto";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export function buildSafePdfFilename(name: string, targetRole?: string | null): string {
  const sanitize = (str: string) =>
    (str || "")
      .trim()
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

  const cleanName = sanitize(name || "Student");
  const cleanRole = sanitize(targetRole || "Resume");
  return `${cleanName}-Resume-${cleanRole}.pdf`;
}

export function createExportToken(resumeId: string, userId: string): string {
  const timestamp = Date.now();
  const secret = process.env.AUTH_SECRET || "default_dev_secret_careeredge";
  const hmac = crypto
    .createHmac("sha256", secret)
    .update(`${resumeId}:${userId}:${timestamp}`)
    .digest("hex");
  return `${timestamp}.${hmac}`;
}

export function verifyExportToken(token: string, resumeId: string, userId: string): boolean {
  try {
    const [timestampStr, hmac] = token.split(".");
    const timestamp = parseInt(timestampStr, 10);
    // Token valid for 60 seconds
    if (Date.now() - timestamp > 60000 || Date.now() < timestamp - 5000) {
      return false;
    }
    const secret = process.env.AUTH_SECRET || "default_dev_secret_careeredge";
    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${resumeId}:${userId}:${timestamp}`)
      .digest("hex");

    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function generateResumePdf(params: {
  resumeId: string;
  userId: string;
  studentName: string;
  targetRole?: string | null;
  pageSize?: "A4" | "Letter";
}): Promise<{ buffer: Buffer; fileName: string }> {
  const { resumeId, userId, studentName, targetRole, pageSize = "A4" } = params;
  const fileName = buildSafePdfFilename(studentName, targetRole);
  const token = createExportToken(resumeId, userId);

  const tempId = crypto.randomBytes(8).toString("hex");
  const tempPdfPath = path.join(os.tmpdir(), `resume_export_${tempId}.pdf`);

  const port = process.env.PORT || "3000";
  const printUrl = `http://localhost:${port}/resume/${resumeId}/print?exportToken=${token}&pageSize=${pageSize}&isPdfExport=true`;

  try {
    await execFileAsync("google-chrome-stable", [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--no-pdf-header-footer",
      `--print-to-pdf=${tempPdfPath}`,
      printUrl,
    ]);

    const pdfBuffer = await fs.readFile(tempPdfPath);
    return { buffer: pdfBuffer, fileName };
  } finally {
    await fs.unlink(tempPdfPath).catch(() => {});
  }
}
