// src/lib/storage/provider.ts
// Abstract Storage Provider with Local Private implementation and S3/R2 readiness

import fs from "fs";
import path from "path";
import os from "os";

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
 * Automatically uses os.tmpdir() in serverless environments (Vercel / Lambda).
 */
export class LocalPrivateStorageProvider implements StorageProvider {
  name = "LOCAL_PRIVATE";
  private baseDir: string;

  constructor(customBaseDir?: string) {
    if (customBaseDir) {
      this.baseDir = customBaseDir;
    } else if (process.env.PRIVATE_STORAGE_PATH) {
      this.baseDir = process.env.PRIVATE_STORAGE_PATH;
    } else if (
      process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.LAMBDA_TASK_ROOT ||
      process.env.NODE_ENV === "production"
    ) {
      // In serverless environments (Vercel / AWS Lambda), the deployment bundle is read-only.
      // Writable scratch storage is strictly permitted under os.tmpdir() (/tmp).
      this.baseDir = path.resolve(os.tmpdir(), "careeredge_storage", "private_uploads");
    } else {
      try {
        const defaultDir = path.resolve(process.cwd(), "storage", "private_uploads");
        if (!fs.existsSync(defaultDir)) {
          fs.mkdirSync(defaultDir, { recursive: true });
        }
        this.baseDir = defaultDir;
      } catch {
        this.baseDir = path.resolve(os.tmpdir(), "careeredge_storage", "private_uploads");
      }
    }

    try {
      if (!fs.existsSync(this.baseDir)) {
        fs.mkdirSync(this.baseDir, { recursive: true });
      }
    } catch {
      // Fallback directly to os.tmpdir() if custom path cannot be written
      this.baseDir = path.resolve(os.tmpdir(), "careeredge_private_uploads");
      if (!fs.existsSync(this.baseDir)) {
        fs.mkdirSync(this.baseDir, { recursive: true });
      }
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

    try {
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      await fs.promises.writeFile(fullPath, buffer);
    } catch (err) {
      console.warn("[StorageProvider] Write to baseDir failed, attempting fallback to tmp:", err);
      const fallbackPath = path.resolve(os.tmpdir(), "careeredge_private_uploads", path.basename(fullPath));
      const fallbackDir = path.dirname(fallbackPath);
      if (!fs.existsSync(fallbackDir)) {
        fs.mkdirSync(fallbackDir, { recursive: true });
      }
      await fs.promises.writeFile(fallbackPath, buffer);
    }
    return key;
  }

  async download(key: string): Promise<Buffer> {
    const fullPath = this.resolveSafePath(key);

    if (fs.existsSync(fullPath)) {
      return fs.promises.readFile(fullPath);
    }

    // Check fallback in tmp
    const fallbackPath = path.resolve(os.tmpdir(), "careeredge_private_uploads", path.basename(fullPath));
    if (fs.existsSync(fallbackPath)) {
      return fs.promises.readFile(fallbackPath);
    }

    throw new Error(`File not found at storage key: ${key}`);
  }

  async delete(key: string): Promise<void> {
    const fullPath = this.resolveSafePath(key);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath).catch(() => {});
    }
    const fallbackPath = path.resolve(os.tmpdir(), "careeredge_private_uploads", path.basename(fullPath));
    if (fs.existsSync(fallbackPath)) {
      await fs.promises.unlink(fallbackPath).catch(() => {});
    }
  }

  async exists(key: string): Promise<boolean> {
    const fullPath = this.resolveSafePath(key);
    if (fs.existsSync(fullPath)) return true;
    const fallbackPath = path.resolve(os.tmpdir(), "careeredge_private_uploads", path.basename(fullPath));
    return fs.existsSync(fallbackPath);
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
