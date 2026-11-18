// src/lib/storage/provider.ts
// Abstract Storage Provider with Local Private implementation and S3/R2 readiness

import fs from "fs";
import path from "path";

export interface StorageProvider {
  name: string;
  upload(key: string, buffer: Buffer, mimeType: string): Promise<string>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

/**
 * Local Private Storage Provider
 * Saves files strictly outside of public/ in an isolated directory
 * Accessible only via authenticated server route handlers.
 */
export class LocalPrivateStorageProvider implements StorageProvider {
  name = "LOCAL_PRIVATE";
  private baseDir: string;

  constructor(customBaseDir?: string) {
    this.baseDir =
      customBaseDir ||
      process.env.PRIVATE_STORAGE_PATH ||
      path.resolve(process.cwd(), "storage", "private_uploads");

    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  private resolveSafePath(key: string): string {
    // Prevent directory traversal attacks
    const sanitizedKey = key.replace(/\.\./g, "").replace(/^\/+/, "");
    const fullPath = path.resolve(this.baseDir, sanitizedKey);

    if (!fullPath.startsWith(this.baseDir)) {
      throw new Error("Invalid storage key: directory traversal attempt.");
    }

    return fullPath;
  }

  async upload(key: string, buffer: Buffer, _mimeType: string): Promise<string> {
    const fullPath = this.resolveSafePath(key);
    const parentDir = path.dirname(fullPath);

    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    await fs.promises.writeFile(fullPath, buffer);
    return key;
  }

  async download(key: string): Promise<Buffer> {
    const fullPath = this.resolveSafePath(key);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found at storage key: ${key}`);
    }

    return fs.promises.readFile(fullPath);
  }

  async delete(key: string): Promise<void> {
    const fullPath = this.resolveSafePath(key);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  }

  async exists(key: string): Promise<boolean> {
    const fullPath = this.resolveSafePath(key);
    return fs.existsSync(fullPath);
  }
}

/**
 * Production S3/R2 Storage Provider Placeholder
 * Easily plugged in with AWS SDK / @aws-sdk/client-s3 once cloud credentials are provided.
 */
export class S3StorageProvider implements StorageProvider {
  name = "S3";
  private bucket: string;

  constructor() {
    this.bucket = process.env.AWS_S3_BUCKET || "";
    if (!this.bucket) {
      throw new Error("AWS_S3_BUCKET environment variable is missing.");
    }
  }

  async upload(_key: string, _buffer: Buffer, _mimeType: string): Promise<string> {
    // S3 PutObjectCommand will be executed here when credentials are configured
    throw new Error("S3 provider is waiting for AWS credentials from operations team.");
  }

  async download(_key: string): Promise<Buffer> {
    // S3 GetObjectCommand will be executed here
    throw new Error("S3 provider is waiting for AWS credentials from operations team.");
  }

  async delete(_key: string): Promise<void> {
    throw new Error("S3 provider is waiting for AWS credentials from operations team.");
  }

  async exists(_key: string): Promise<boolean> {
    throw new Error("S3 provider is waiting for AWS credentials from operations team.");
  }
}

let activeStorageProvider: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (activeStorageProvider) {
    return activeStorageProvider;
  }

  const configuredProvider = process.env.STORAGE_PROVIDER?.toLowerCase();

  if (configuredProvider === "s3" && process.env.AWS_S3_BUCKET) {
    try {
      activeStorageProvider = new S3StorageProvider();
      return activeStorageProvider;
    } catch {
      console.warn("⚠️ [STORAGE] Failed to initialize S3 provider, falling back to LocalPrivateStorageProvider.");
    }
  }

  activeStorageProvider = new LocalPrivateStorageProvider();
  return activeStorageProvider;
}
