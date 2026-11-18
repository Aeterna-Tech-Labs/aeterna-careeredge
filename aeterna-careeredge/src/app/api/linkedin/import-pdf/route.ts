// src/app/api/linkedin/import-pdf/route.ts
// LinkedIn Profile PDF Upload & Import API (Day 2 Part 4.2)
// Uses private storage; never exposes uploaded files to public/.

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getStorageProvider } from "@/lib/storage/provider";
import { MAX_FILE_SIZE_BYTES } from "@/lib/storage/private-storage";
import { parseLinkedInProfileText } from "@/lib/linkedin/parser";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Invalid file type. Only official LinkedIn PDF exports are supported." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File exceeds 5 MB size limit." },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const storageProvider = getStorageProvider();
    const storageKey = `linkedin_${session.userId}_${Date.now()}.pdf`;

    // 1. Save strictly to private storage
    await storageProvider.upload(storageKey, bytes, file.type);

    // 2. Save StoredDocument record
    const storedDoc = await prisma.storedDocument.create({
      data: {
        userId: session.userId,
        originalFileName: file.name,
        storageKey,
        mimeType: file.type,
        fileSizeBytes: file.size,
        category: "RESUME",
        isPrivate: true,
      },
    });

    // 3. Extract text from PDF buffer
    // LinkedIn PDF exports store clean text streams with BT / ET markers or plain strings
    const rawContent = bytes.toString("latin1");
    const textMatches: string[] = [];
    const textRegex = /\(([^)]+)\)\s*Tj/g;
    let match;
    while ((match = textRegex.exec(rawContent)) !== null) {
      textMatches.push(match[1]);
    }

    const extractedText = textMatches.length > 10 ? textMatches.join("\n") : rawContent.replace(/[\x00-\x1F\x7F-\xFF]/g, " ");
    const parsed = parseLinkedInProfileText(extractedText, "LINKEDIN_PDF");

    // 4. Save staged import in LinkedInProfile
    await prisma.linkedInProfile.upsert({
      where: { userId: session.userId },
      update: {
        importedRawJson: JSON.stringify(parsed),
      },
      create: {
        userId: session.userId,
        importedRawJson: JSON.stringify(parsed),
      },
    });

    return NextResponse.json({
      success: true,
      documentId: storedDoc.id,
      parsed,
      message: "LinkedIn PDF parsed successfully. Review extracted data before saving to Career Passport.",
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to process LinkedIn PDF." },
      { status: 500 }
    );
  }
}
