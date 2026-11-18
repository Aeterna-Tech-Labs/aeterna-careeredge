// src/lib/resume/extractor.ts
// Industry-Standard Hybrid PDF & DOCX Text Extraction Engine
// Powered by unpdf (Mozilla pdf.js engine) with native literal/hex stream fallbacks.
// Validates magic bytes, detects password encryption, detects scanned/image-only PDFs,
// and extracts clean candidate text.

import zlib from "zlib";
import { extractText as extractPdfText } from "unpdf";

export interface ExtractedDocumentResult {
  text: string;
  isScanned: boolean;
  isEncrypted: boolean;
  format: "pdf" | "docx" | "txt";
  pageCountEstimate?: number;
}

export const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export class ResumeValidationError extends Error {
  code:
    | "FILE_TOO_LARGE"
    | "UNSUPPORTED_TYPE"
    | "PASSWORD_PROTECTED"
    | "CORRUPT_FILE"
    | "EMPTY_FILE"
    | "SCANNED_PDF";

  constructor(
    message: string,
    code:
      | "FILE_TOO_LARGE"
      | "UNSUPPORTED_TYPE"
      | "PASSWORD_PROTECTED"
      | "CORRUPT_FILE"
      | "EMPTY_FILE"
      | "SCANNED_PDF"
  ) {
    super(message);
    this.name = "ResumeValidationError";
    this.code = code;
  }
}

/**
 * Normalizes common misencoded Latin-1 / UTF-8 artifact sequences
 * such as en-dashes, em-dashes, bullets, and smart quotes.
 */
export function normalizeTextEncoding(str: string): string {
  if (!str) return "";
  const unixLf = str.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return unixLf
    .replace(/â€“/g, "–")
    .replace(/â€”/g, "—")
    .replace(/â€¢/g, "•")
    .replace(/â€˜/g, "‘")
    .replace(/â€™/g, "’")
    .replace(/â€œ/g, "“")
    .replace(/â€[s]/g, "”");
}

/**
 * Normalizes all bullet glyph variations to a uniform marker "• ".
 */
export function normalizeBulletGlyphs(text: string): string {
  const clean = normalizeTextEncoding(text);
  return clean
    // Replace non-standard bullet characters at the beginning of lines
    .replace(/(^|\n)[ \t]*[▪▫◦◆◇►▸›∙⁃✓✔][ \t]*/g, "$1• ")
    .replace(/(^|\n)[ \t]*[\u2022\u2023\u25E6\u2043\u2219\u25AA\u25AB][ \t]*/g, "$1• ")
    .replace(/(^|\n)[ \t]*â€¢[ \t]*/g, "$1• ")
    // Convert numbered list items like "1. ", "(1) ", "1) " to standard bullet marker
    .replace(/(^|\n)[ \t]*(?:\(?\d+[\.\)]|\(\w\))[ \t]+/g, "$1• ");
}

/**
 * Deterministically merges wrapped lines back into their parent bullet or sentence.
 * If a line continues the previous thought (starts with lowercase, conjunction, or previous line ended mid-sentence),
 * it is joined to the previous line instead of splitting into an orphan entry.
 */
export function joinWrappedLines(rawText: string): string {
  const normalized = normalizeBulletGlyphs(normalizeTextEncoding(rawText));
  const rawLines = normalized.split("\n");
  const processed: string[] = [];

  const sectionHeaderRegex = /^(?:EDUCATION|EXPERIENCE|WORK\s+EXPERIENCE|PROJECTS|KEY\s+PROJECTS|SKILLS|TECHNICAL\s+SKILLS|CERTIFICATIONS|ACHIEVEMENTS|AWARDS|PUBLICATIONS|SUMMARY|PROFILE|OBJECTIVE)\b/i;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (!line) {
      if (processed.length > 0 && processed[processed.length - 1] !== "") {
        processed.push("");
      }
      continue;
    }

    if (processed.length === 0) {
      processed.push(line);
      continue;
    }

    const prev = processed[processed.length - 1];

    const isBullet = line.startsWith("• ") || /^[-*]\s+/.test(line);
    const isHeader = sectionHeaderRegex.test(line.replace(/[:\-–—]+$/, "").trim());
    const isUrl = /(?:https?:\/\/|github\.com|github\s*[:-])/i.test(line);
    const isDateRange = /^(?:\d{1,2}\/\d{4}|\w+\s+\d{4}|\d{4})\s*[-–—to]/i.test(line);

    if (prev === "") {
      processed.push(line);
      continue;
    }

    const prevIsBullet = prev.startsWith("• ") || /^[-*]\s+/.test(prev);
    const startsWithLower = /^[a-z]/.test(line);
    const startsWithContinuation = /^(?:and|or|with|to|in|for|on|by|at|from|via|including|achieving|resulting|reducing|increasing|enabling|built|developed|using|across|into)\b/i.test(line);
    const isCapitalizedHeading =
      /^[A-Z0-9]/.test(line) &&
      line.split(/\s+/).length <= 7 &&
      !startsWithContinuation &&
      !startsWithLower &&
      !/[.:;!?]$/.test(line);
    const prevEndedMidSentence = !/[.:;!?]$/.test(prev.trim());

    const isContinuation =
      !isBullet &&
      !isHeader &&
      !isUrl &&
      !isDateRange &&
      !isCapitalizedHeading &&
      (
        startsWithLower ||
        (prevIsBullet && (startsWithContinuation || prevEndedMidSentence))
      );

    if (isContinuation) {
      processed[processed.length - 1] = `${prev} ${line}`;
    } else {
      processed.push(line);
    }
  }

  return processed.join("\n").trim();
}

/**
 * Validates file size, extension, and magic bytes before any processing.
 */
export function validateResumeFile(
  buffer: Buffer,
  fileName: string,
  declaredMimeType?: string
): { format: "pdf" | "docx" | "txt" } {
  if (!buffer || buffer.length === 0) {
    throw new ResumeValidationError(
      "The uploaded file is empty (0 bytes). Please choose a valid resume.",
      "EMPTY_FILE"
    );
  }

  if (buffer.length > MAX_RESUME_SIZE_BYTES) {
    const sizeMb = (buffer.length / (1024 * 1024)).toFixed(1);
    throw new ResumeValidationError(
      `File size (${sizeMb} MB) exceeds the 5 MB limit. Please upload a smaller PDF or DOCX resume.`,
      "FILE_TOO_LARGE"
    );
  }

  const ext = fileName.toLowerCase().slice(fileName.lastIndexOf("."));

  // Check PDF Magic Bytes: %PDF-
  if (
    buffer.length >= 5 &&
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  ) {
    return { format: "pdf" };
  }

  // Check DOCX / ZIP Magic Bytes: PK\x03\x04
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    buffer[2] === 0x03 &&
    buffer[3] === 0x04
  ) {
    if (ext === ".docx" || declaredMimeType?.includes("wordprocessingml")) {
      return { format: "docx" };
    }
  }

  // Plain Text fallback
  if (ext === ".txt" || declaredMimeType === "text/plain") {
    return { format: "txt" };
  }

  throw new ResumeValidationError(
    "Unsupported file format. Please upload a standard PDF (.pdf) or Microsoft Word (.docx) resume.",
    "UNSUPPORTED_TYPE"
  );
}

/**
 * Decodes standard PDF literal string escape sequences.
 */
function decodePdfLiteralString(str: string): string {
  return str
    .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
    .replace(/\\r/g, "\r")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\b/g, "\b")
    .replace(/\\f/g, "\f")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\");
}

/**
 * Parses PDF streams and extracts selectable text.
 * Uses Mozilla pdf.js (pdf-parse) as primary engine, with native stream & hex fallbacks.
 * Flags password-protected and true scanned/image-only documents.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<ExtractedDocumentResult> {
  const rawString = buffer.toString("latin1");

  // 1. Password Protection Check: presence of /Encrypt dictionary
  if (/\/Encrypt\s+\d+\s+\d+\s+R/.test(rawString) || /\/Encrypt\s*<<[\s\S]*?>>/.test(rawString)) {
    throw new ResumeValidationError(
      "This PDF is password-protected. Please upload an unprotected copy so we can read your resume details.",
      "PASSWORD_PROTECTED"
    );
  }

  let pdfExtractedText = "";
  let pageCount = 0;

  // 2. Try High-Fidelity unpdf Engine (Mozilla pdf.js without external worker requirement)
  try {
    const res = await extractPdfText(new Uint8Array(buffer));
    if (res?.text) {
      const joined = Array.isArray(res.text) ? res.text.join("\n\n").trim() : String(res.text).trim();
      pdfExtractedText = normalizeTextEncoding(joined);
    }
    if (res?.totalPages) {
      pageCount = res.totalPages;
    }
  } catch (parseErr: any) {
    if (parseErr?.name === "PasswordException") {
      throw new ResumeValidationError(
        "This PDF is password-protected. Please upload an unprotected copy so we can read your resume details.",
        "PASSWORD_PROTECTED"
      );
    }
    console.warn("[unpdf execution notice]:", parseErr?.message || parseErr);
  }

  // If unpdf succeeded and found substantive text, return immediately
  if (pdfExtractedText.length >= 40) {
    return {
      text: pdfExtractedText,
      isScanned: false,
      isEncrypted: false,
      format: "pdf",
      pageCountEstimate: pageCount || 1,
    };
  }

  // 3. Native Fallback: Extract streams (both uncompressed and /FlateDecode compressed)
  const collectedLines: string[] = [];
  if (pdfExtractedText.length > 0) {
    collectedLines.push(pdfExtractedText);
  }

  if (pageCount === 0) {
    const pageMatches = rawString.match(/\/Type\s*\/Page[^s]/g);
    if (pageMatches) pageCount = pageMatches.length;
  }

  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let streamMatch: RegExpExecArray | null;

  while ((streamMatch = streamRegex.exec(rawString)) !== null) {
    const streamStart = streamMatch.index;
    const dictHeader = rawString.slice(Math.max(0, streamStart - 300), streamStart);
    const isFlate = /\/Filter\s*(\/FlateDecode|\[\s*\/FlateDecode\s*\])/.test(dictHeader);

    let streamBytes: Buffer;
    const rawStreamContent = streamMatch[1];

    if (isFlate) {
      try {
        const streamBuffer = Buffer.from(rawStreamContent, "latin1");
        streamBytes = zlib.inflateSync(streamBuffer);
      } catch {
        try {
          const streamBuffer = Buffer.from(rawStreamContent, "latin1");
          streamBytes = zlib.inflateRawSync(streamBuffer);
        } catch {
          continue;
        }
      }
    } else {
      streamBytes = Buffer.from(rawStreamContent, "latin1");
    }

    const streamText = streamBytes.toString("latin1");

    // Extract text blocks: BT ... ET
    const btRegex = /BT([\s\S]*?)ET/g;
    let btMatch: RegExpExecArray | null;

    while ((btMatch = btRegex.exec(streamText)) !== null) {
      const block = btMatch[1];

      // Match simple text operator: (text) Tj
      const tjRegex = /\(((?:\\\(|\\\)|[^)])*)\)\s*Tj/g;
      let tjMatch: RegExpExecArray | null;
      while ((tjMatch = tjRegex.exec(block)) !== null) {
        const decoded = decodePdfLiteralString(tjMatch[1]).trim();
        if (decoded) collectedLines.push(decoded);
      }

      // Match hex text operator: <00410042> Tj
      const hexTjRegex = /<([0-9a-fA-F]+)>\s*Tj/g;
      let hexMatch: RegExpExecArray | null;
      while ((hexMatch = hexTjRegex.exec(block)) !== null) {
        const hex = hexMatch[1];
        let decoded = "";
        if (hex.length >= 4 && hex.length % 4 === 0) {
          for (let i = 0; i < hex.length; i += 4) {
            const code = parseInt(hex.slice(i, i + 4), 16);
            if (code >= 32 && code <= 126) decoded += String.fromCharCode(code);
            else if (code === 10 || code === 13) decoded += "\n";
            else if (code > 126) decoded += String.fromCharCode(code);
          }
        } else if (hex.length % 2 === 0) {
          for (let i = 0; i < hex.length; i += 2) {
            const code = parseInt(hex.slice(i, i + 2), 16);
            if (code >= 32 && code <= 126) decoded += String.fromCharCode(code);
          }
        }
        if (decoded.trim()) collectedLines.push(decoded.trim());
      }

      // Match array text operator: [(text) 123 (more text)] TJ
      const tjArrayRegex = /\[(.*?)\]\s*TJ/g;
      let tjArrMatch: RegExpExecArray | null;
      while ((tjArrMatch = tjArrayRegex.exec(block)) !== null) {
        const arrayBody = tjArrMatch[1];
        const innerStrRegex = /\(((?:\\\(|\\\)|[^)])*)\)/g;
        let innerMatch: RegExpExecArray | null;
        const joinedPieces: string[] = [];
        while ((innerMatch = innerStrRegex.exec(arrayBody)) !== null) {
          joinedPieces.push(decodePdfLiteralString(innerMatch[1]));
        }
        const combined = joinedPieces.join("").trim();
        if (combined) collectedLines.push(combined);
      }

      // Match single quote operator: (text) '
      const sqRegex = /\(((?:\\\(|\\\)|[^)])*)\)\s*'/g;
      let sqMatch: RegExpExecArray | null;
      while ((sqMatch = sqRegex.exec(block)) !== null) {
        const decoded = decodePdfLiteralString(sqMatch[1]).trim();
        if (decoded) collectedLines.push(decoded);
      }
    }
  }

  // 4. Fallback: literal text matches across entire document
  if (collectedLines.length < 5) {
    const fallbackRegex = /\(([^)]{3,})\)\s*Tj/g;
    let fbMatch: RegExpExecArray | null;
    while ((fbMatch = fallbackRegex.exec(rawString)) !== null) {
      const clean = decodePdfLiteralString(fbMatch[1]).trim();
      if (clean && !clean.startsWith("/") && clean.length > 2) {
        collectedLines.push(clean);
      }
    }
  }

  const fullText = collectedLines.join("\n").trim();

  // 5. Scanned / Image-Only Check:
  // Only flag as scanned if file has substantial bytes (> 3KB) but fewer than 30 characters of selectable text
  if (fullText.length < 30 && buffer.length > 3000) {
    const hasImageSubtype = /\/Subtype\s*\/Image/.test(rawString);
    if (hasImageSubtype || fullText.length < 15) {
      return {
        text: fullText,
        isScanned: true,
        isEncrypted: false,
        format: "pdf",
        pageCountEstimate: pageCount || 1,
      };
    }
  }

  return {
    text: fullText,
    isScanned: false,
    isEncrypted: false,
    format: "pdf",
    pageCountEstimate: pageCount || 1,
  };
}

/**
 * Parses DOCX files by reading `word/document.xml` from the PKZIP archive.
 */
export function extractTextFromDocx(buffer: Buffer): ExtractedDocumentResult {
  let pos = 0;
  let xmlString = "";

  // Walk ZIP local file records
  while (pos < buffer.length - 30) {
    // Check local file header signature: 0x04034b50
    if (buffer.readUInt32LE(pos) === 0x04034b50) {
      const compMethod = buffer.readUInt16LE(pos + 8);
      const compSize = buffer.readUInt32LE(pos + 18);
      const nameLen = buffer.readUInt16LE(pos + 26);
      const extraLen = buffer.readUInt16LE(pos + 28);

      const name = buffer.toString("utf8", pos + 30, pos + 30 + nameLen);
      const dataStart = pos + 30 + nameLen + extraLen;
      const dataEnd = dataStart + compSize;

      if (name === "word/document.xml") {
        const rawData = buffer.subarray(dataStart, dataEnd);
        try {
          xmlString =
            compMethod === 8
              ? zlib.inflateRawSync(rawData).toString("utf8")
              : rawData.toString("utf8");
        } catch (err) {
          throw new ResumeValidationError(
            "Could not decompress DOCX document. The file may be corrupt or encrypted.",
            "CORRUPT_FILE"
          );
        }
        break;
      }
      pos = dataEnd;
    } else {
      pos++;
    }
  }

  if (!xmlString) {
    throw new ResumeValidationError(
      "Invalid Microsoft Word file: missing word/document.xml.",
      "CORRUPT_FILE"
    );
  }

  // Parse paragraphs and text runs
  // Replace <w:p> tags with newlines
  const paragraphBlocks = xmlString
    .replace(/<w:p[^>]*>/g, "\n[PARA_START]")
    .replace(/<\/w:p>/g, "[PARA_END]\n");

  const lines: string[] = [];
  const paragraphs = paragraphBlocks.split("[PARA_START]");

  for (const p of paragraphs) {
    if (!p.trim()) continue;
    const isListParagraph =
      /<w:numPr[\s>]/.test(p) ||
      /<w:pStyle[^>]*w:val="ListParagraph"/.test(p) ||
      /<w:pStyle[^>]*w:val="Bullet"/.test(p);

    const textMatches = p.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || [];
    let paragraphText = textMatches
      .map((tag) => tag.replace(/<[^>]+>/g, ""))
      .join("")
      .trim();

    if (paragraphText) {
      if (isListParagraph && !/^[•\-*▪▫◦►▸›]/.test(paragraphText)) {
        paragraphText = `• ${paragraphText}`;
      }
      lines.push(paragraphText);
    }
  }

  const fullText = lines.join("\n").trim();

  return {
    text: fullText,
    isScanned: false,
    isEncrypted: false,
    format: "docx",
  };
}

/**
 * Universal text extractor for resumes (PDF, DOCX, TXT).
 */
export async function extractResumeText(
  buffer: Buffer,
  fileName: string,
  declaredMimeType?: string
): Promise<ExtractedDocumentResult> {
  const { format } = validateResumeFile(buffer, fileName, declaredMimeType);

  let result: ExtractedDocumentResult;
  if (format === "pdf") {
    result = await extractTextFromPdf(buffer);
  } else if (format === "docx") {
    result = extractTextFromDocx(buffer);
  } else {
    result = {
      text: buffer.toString("utf8").trim(),
      isScanned: false,
      isEncrypted: false,
      format: "txt",
    };
  }

  if (result.text && !result.isScanned) {
    result.text = joinWrappedLines(result.text);
  }

  return result;
}
