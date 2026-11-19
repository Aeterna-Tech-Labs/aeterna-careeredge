# Aeterna CareerEdge — Staging Deployment Guide

This document outlines the staging deployment architecture, database migration strategy, object storage configuration, PDF generation setup, and pre-flight smoke testing for **Aeterna CareerEdge**.

---

## 1. Hosting Architecture & Infrastructure Topology

CareerEdge is built on Next.js 16 (App Router), React 19, TypeScript, and Prisma.

### Recommended Staging Providers

| Provider | Type | Database Strategy | PDF Generation | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| **Railway / Render** | Docker / Persistent Container | Persistent Volume SQLite OR Managed PostgreSQL | Full Chromium binary supported | **Recommended (100% feature fidelity)** |
| **Vercel** | Serverless Lambdas | Neon / Supabase Serverless Postgres | Requires `@sparticuz/chromium` (50MB lambda limit) | Supported with external Postgres + S3 |
| **Fly.io** | MicroVM Container | Attached volume (`/data/careeredge.db`) | Containerized Chromium | Excellent for low-cost staging |

---

## 2. Database Migration Strategy

### SQLite vs PostgreSQL Configuration

1. **Development (Default):**
   - Connection: `DATABASE_URL="file:./dev.db"`
   - Zero infrastructure dependencies, fast local tests.

2. **Staging / Production (PostgreSQL):**
   - In `prisma/schema.prisma`, switch datasource:
     ```prisma
     datasource db {
       provider = "postgresql"
       url      = env("DATABASE_URL")
     }
     ```
   - Run Prisma migration:
     ```bash
     npx prisma db push
     # or for versioned migrations:
     npx prisma migrate deploy
     ```
   - Seed reference data, plans, and default quotas:
     ```bash
     node scripts/seed-db.js
     ```

---

## 3. Private File Storage Configuration

Student resumes, certificates, and ID documents must **never** be served from public static folders.

### Staging Cloud Object Storage (Cloudflare R2 / AWS S3)

Set the following environment variables in your staging host:

```ini
STORAGE_PROVIDER="s3"
AWS_S3_BUCKET="careeredge-staging-private-docs"
AWS_REGION="ap-south-1"
AWS_ACCESS_KEY_ID="your-iam-access-key"
AWS_SECRET_ACCESS_KEY="your-iam-secret-key"
```

- When using **Cloudflare R2**, configure the S3-compatible endpoint:
  ```ini
  AWS_ENDPOINT="https://<account-id>.r2.cloudflarestorage.com"
  ```
- All file access is mediated through authenticated proxy endpoints (`/api/documents/[id]/download`) which verify ownership before streaming bytes.

---

## 4. Headless PDF Generation

CareerEdge generates print-ready, ATS-compliant A4 PDF resumes.

1. **Container Hosts (Railway / Docker):**
   Install standard Chromium libraries:
   ```dockerfile
   RUN apt-get update && apt-get install -y \
       chromium \
       fonts-noto-cjk \
       fonts-noto-color-emoji \
       fonts-liberation \
       libnss3 \
       libatk-bridge2.0-0 \
       libx11-xcb1 \
       libxcomposite1 \
       libxdamage1 \
       libxrandr2 \
       libgbm1 \
       libasound2
   ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium"
   ```

2. **Serverless (Vercel):**
   Use `@sparticuz/chromium` bundled binary with `--no-sandbox` flags.

---

## 5. Complete Staging Environment Variables Checklist

Ensure these variables are added in your staging hosting dashboard:

```ini
# ── App Environment ──
NODE_ENV="production"
APP_ENV="staging"
NEXTAUTH_URL="https://staging.careeredge.aeterna.io"

# ── Monetization Entitlement Bypass (Disable limits during QA) ──
# "off" = unlimited testing; "soft" = warnings only; "on" = enforce quotas
ENTITLEMENT_ENFORCEMENT="off"

# ── Authentication ──
# Generate with: openssl rand -base64 32
AUTH_SECRET="your-32-byte-staging-auth-secret"

# ── Database ──
DATABASE_URL="postgresql://user:pass@host:5432/careeredge_staging?schema=public"

# ── AI Provider & Intelligence ──
AI_PROVIDER="gemini"
GEMINI_API_KEY="your-gemini-api-key"
AI_MODEL_FAST="gemini-3.5-flash-lite"
AI_MODEL_QUALITY="gemini-3.5-flash-lite"

# ── Private Storage ──
STORAGE_PROVIDER="s3"
AWS_S3_BUCKET="careeredge-staging-uploads"
AWS_REGION="ap-south-1"
AWS_ACCESS_KEY_ID="your-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-key"

# ── LinkedIn Integration (Staging OAuth App) ──
LINKEDIN_CLIENT_ID="your-staging-linkedin-id"
LINKEDIN_CLIENT_SECRET="your-staging-linkedin-secret"

# ── Razorpay Test Mode ──
RAZORPAY_KEY_ID="rzp_test_yourkey"
RAZORPAY_KEY_SECRET="your-test-secret"
```

---

## 6. Pre-Flight Staging Smoke Test Script

Run this verification script on your staging deployment or local simulation:

```bash
# 1. Typecheck the entire project
npx tsc --noEmit

# 2. Run unit and integration tests
npm test

# 3. Test production build
npm run build

# 4. Run synthetic API check against staging URL
curl -fsS https://staging.careeredge.aeterna.io/api/system/enforcement
# Expected response: {"appEnv":"staging","enforcement":"off","isTestingMode":true}
```
