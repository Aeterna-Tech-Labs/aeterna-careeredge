# Aeterna CareerEdge — Integrations & Infrastructure Status

## 1. Classification Methodology

To maintain engineering clarity and avoid unverified assumptions, all integration components are classified under one of four statuses:

1. **Confirmed Decision (Active):** Approved, implemented, and fully operational in code.
2. **Development Integration (Active):** Complete integration architecture active with a safe, strictly isolated local development implementation. Production ready to switch via environment variables.
3. **Pending Production Credentials (Staged):** Adapter and contract fully implemented; waiting for production keys/secrets from the company/partner.
4. **Planned (Roadmap):** Scheduled for future implementation phases (Day 2+).

---

## 2. Master Integrations Status Table

| Subsystem / Integration | Status | Type | Technical Implementation | Production Transition Path |
|---|---|---|---|---|
| **Database (Dev)** | **Active** | Confirmed Decision | SQLite (`prisma/dev.db`) with Prisma ORM v6.19.3. 17 relational models. | Zero config needed locally. |
| **Database (Prod)** | **Ready** | Recommended Architecture | PostgreSQL target via Prisma schema. 100% schema parity with dev. | Supply PostgreSQL `DATABASE_URL` and run `npx prisma migrate deploy`. |
| **Authentication & Sessions** | **Active** | Confirmed Decision | Custom JWT session via `jose` in `httpOnly` cookie (`ace_session`). Passwords hashed with `bcryptjs`. | Set production `AUTH_SECRET` (openssl rand -base64 32). |
| **Password Reset** | **Active (Dev Delivery)** | Completed Integration | Cryptographic 256-bit token, SHA-256 hash storage, 1-hour expiry, single-use invalidation, anti-enumeration. Dev delivery logs to console & UI helper. | Configure SMTP/SMS credentials; dev logs & helper automatically disabled in production. |
| **Google Sign-In** | **Active (Dev Simulation)** | Completed Integration | Real OAuth 2.0 architecture with CSRF state verification, `/api/auth/oauth/google`, callback handler, account matching/linking (null `passwordHash`). Local dev simulation active at `/api/auth/oauth/dev-mock`. | Set `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`; `/api/auth/oauth/dev-mock` is hard-locked to 404 in production. |
| **Aeterna One CRM** | **Active (Local Mock)** | Completed Integration | Outbound lead contract, HMAC-SHA256 signature, idempotency key, AbortSignal timeout (5s), 3 bounded retries with backoff. Webhook receiver at `/api/dev/mock-crm-webhook`. Status logged as `DEV_MOCK_SYNCED`. | Set `AETERNA_ONE_CRM_WEBHOOK_URL`, `API_KEY`, and `SECRET`. Status becomes `SYNCED` only upon real external CRM delivery. |
| **Private File Storage** | **Active (Local Provider)** | Completed Integration | `StorageProvider` abstraction (`src/lib/storage/provider.ts`). Files stored outside `public/` in `/storage/private_uploads/`. MIME & 5MB size limits, path traversal defenses, authenticated ownership check in `/api/documents/[id]/download`. | Set `STORAGE_PROVIDER=s3` and supply `AWS_S3_BUCKET` and AWS credentials. |
| **Route Protection** | **Active** | Confirmed Decision | Next.js 16 `proxy.ts` protecting dashboard, onboarding, and student routes. | Zero config needed. |
| **Student Career Passport** | **Active** | Confirmed Decision | Single Source of Student Truth in `student_profiles` + 8 multi-domain relational timeline models. | Fully operational. |
| **AI Intelligence Engine** | **Pending Credentials** | Day 2 Scope | Server-side abstraction `src/lib/ai/provider.ts` with strict guardrails against hallucination. | Supply `GEMINI_API_KEY` (or `ANTHROPIC_API_KEY` / `OPENAI_API_KEY`). |

---

## 3. Temporary Development Integrations Architecture

### A. Password Reset Flow
- **Security:** Plaintext tokens are NEVER stored in the database. Only SHA-256 hashes are persisted in the `password_reset_tokens` table.
- **Anti-Enumeration:** Requesting a reset link for an unregistered email returns a generic success message and creates 0 database records.
- **Single-Use Enforcement:** Upon successful reset, the token record is marked with a timestamp in `usedAt`. Any subsequent reuse attempt is rejected.
- **Development Delivery:** Reset URLs are output to the server terminal and displayed in a developer sandbox box on `/forgot-password` strictly when `NODE_ENV !== "production"`.

### B. Google OAuth Architecture & Dev Simulation
- **Architecture:** Complete RFC 6749 authorization code flow.
- **State Validation:** Generates 256-bit cryptographic CSRF token stored in `httpOnly` cookie (`ace_oauth_state`) with 10-minute expiry. Mismatched or forged states trigger immediate 400 rejection.
- **Account Linking:** Matches verified Google emails against existing users without duplicate account creation. For new Google users, creates user record with `passwordHash: null`.
- **Development Simulation:** When Google credentials are unset in development, requests route to `/api/auth/oauth/dev-mock`, allowing 1-click test sign-in with a mock student identity.
- **Production Guard:** `/api/auth/oauth/dev-mock` strictly returns 404 in production mode.

### C. Aeterna One CRM Outbound Integration
- **Architectural Boundary:** Direct database access to Aeterna One is **strictly prohibited**. All communication occurs via authenticated webhooks.
- **Payload Contract:** Structured event payload (`lead.counselling.requested`) including `eventId`, `timestamp`, `idempotencyKey`, and student lead details.
- **Security & Integrity:** Headers include `x-aeterna-signature: sha256=<hmac>` and `x-idempotency-key`.
- **Resilience:** AbortSignal with 5-second timeout and bounded exponential backoff retries (3 attempts).
- **Delivery Integrity:** Deliveries to the local development mock receiver (`/api/dev/mock-crm-webhook`) are persistently tracked as `DEV_MOCK_SYNCED`. At no point is a simulated delivery marked as real `SYNCED`.
- **Production Guard:** `/api/dev/mock-crm-webhook` returns 404 in production mode.

### D. Private File Storage Abstraction
- **Storage Boundary:** Uploaded documents are saved strictly outside the web-accessible `public/` folder in `/storage/private_uploads/`.
- **Upload Validation:** Strict whitelist of MIME types (PDF, DOCX, DOC, PNG, JPG) and strict file size cap of 5 MB.
- **Path Traversal Defense:** Storage keys are sanitized and verified against base directory boundary to prevent traversal attacks.
- **Ownership Enforcement:** Access via `/api/documents/[id]/download` requires an active session and verifies that `doc.userId === session.userId`. Unauthorized students receive 403 Forbidden.
- **S3/R2 Readiness:** `S3StorageProvider` is implemented in `src/lib/storage/provider.ts` and can be activated via environment variables without code modifications.
