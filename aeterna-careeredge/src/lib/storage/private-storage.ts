// src/lib/storage/private-storage.ts
// Private Object Storage & Authorization Manager
// Ensures student documents are NEVER exposed through public URLs

import { db } from "@/lib/db";
import crypto from "crypto";
import { getStorageProvider } from "./provider";

export interface StoredFileMetadata {
  id: string;
  originalFileName: string;
  storageKey: string;
  mimeType: string;
  fileSizeBytes: number;
  category: string;
  userId: string;
}

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
  "application/msword", // doc
  "image/png",
  "image/jpeg",
];

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Validates ownership before granting access to a stored file.
 * Returns null if the authenticated user does not own the document.
 */
export async function authorizeDocumentAccess(
  documentId: string,
  authenticatedUserId: string
): Promise<StoredFileMetadata | null> {
  const doc = await db.storedDocument.findUnique({
    where: { id: documentId },
  });

  if (!doc) {
    return null;
  }

  // Strict ownership check
  if (doc.userId !== authenticatedUserId) {
    console.warn(
      `[SECURITY AUDIT] Unauthorized file access attempt: User ${authenticatedUserId} tried to access Document ${documentId} owned by User ${doc.userId}`
    );
    return null;
  }

  return {
    id: doc.id,
    originalFileName: doc.originalFileName,
    storageKey: doc.storageKey,
    mimeType: doc.mimeType,
    fileSizeBytes: doc.fileSizeBytes,
    category: doc.category,
    userId: doc.userId,
  };
}

/**
 * Generates an opaque, unpredictable storage key for private storage.
 */
export function generatePrivateStorageKey(
  userId: string,
  fileName: string
): string {
  const randomSalt = crypto.randomBytes(16).toString("hex");
  const extension = fileName.includes(".")
    ? fileName.slice(fileName.lastIndexOf("."))
    : "";
  return `private/students/${userId}/${Date.now()}-${randomSalt}${extension}`;
}

/**
 * Saves a student document to private storage and registers it in the database.
 */
export async function storeStudentDocument({
  userId,
  fileName,
  mimeType,
  buffer,
  category = "OTHER",
}: {
  userId: string;
  fileName: string;
  mimeType: string;
  buffer: Buffer;
  category?: string;
}): Promise<StoredFileMetadata> {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error(
      `Unsupported file type: ${mimeType}. Allowed formats are PDF, DOCX, PNG, and JPG.`
    );
  }

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File size (${(buffer.length / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowed limit of 5 MB.`
    );
  }

  const storageKey = generatePrivateStorageKey(userId, fileName);
  const provider = getStorageProvider();

  // Save via active storage provider (outside public/)
  await provider.upload(storageKey, buffer, mimeType);

  // Register metadata in database
  const record = await db.storedDocument.create({
    data: {
      userId,
      originalFileName: fileName,
      storageKey,
      mimeType,
      fileSizeBytes: buffer.length,
      category,
      isPrivate: true,
      storageEngine: provider.name,
    },
  });

  return {
    id: record.id,
    originalFileName: record.originalFileName,
    storageKey: record.storageKey,
    mimeType: record.mimeType,
    fileSizeBytes: record.fileSizeBytes,
    category: record.category,
    userId: record.userId,
  };
}
