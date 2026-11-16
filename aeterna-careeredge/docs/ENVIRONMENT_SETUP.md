# Environment Setup & Configuration — Aeterna CareerEdge

## 1. Quick Start (Development)

### Step 1: Copy environment template
```bash
cp .env.example .env
```

### Step 2: Generate a secure `AUTH_SECRET`
```bash
openssl rand -base64 32
```
Copy and paste the generated string into your `.env` as the value for `AUTH_SECRET`.

### Step 3: Run Database Migrations
The local development database uses **SQLite** at `prisma/dev.db` — requiring **zero server setup or external accounts**.
```bash
npm run db:migrate
```

### Step 4: Start the Next.js Turbopack dev server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)**.

---

## 2. Environment Variables Matrix

| Variable | Tier | Description | Current Status |
|---|---|---|---|
| `DATABASE_URL` | **Mandatory** | Database connection string. SQLite: `file:./dev.db`, Postgres: `postgresql://...` | **Configured & Active** |
| `AUTH_SECRET` | **Mandatory** | 32-byte secret for JWT signing via `jose`. | **Configured & Active** |
| `STORAGE_ENGINE` | **Optional** | `LOCAL_PRIVATE` (default) \| `S3` \| `R2`. | **Active (Local Private)** |
| `GEMINI_API_KEY` | **Optional** | Google Gemini API key for server-side AI advisory engine. | *Pending Credentials* (Gracefully mocks) |
| `ANTHROPIC_API_KEY` | **Optional** | Anthropic Claude API key for server-side AI fallback. | *Pending Credentials* |
| `AETERNA_ONE_CRM_WEBHOOK_URL`| **Optional** | Authenticated webhook endpoint for sister product Aeterna One. | *Pending Credentials* (Leads staged locally) |
| `AETERNA_ONE_CRM_API_KEY` | **Optional** | Bearer authorization key for Aeterna One CRM. | *Pending Credentials* |
| `STORAGE_BUCKET_NAME` | **Optional** | Cloud private object storage bucket name. | *Pending Credentials* |
| `STORAGE_ACCESS_KEY` | **Optional** | IAM access key for private S3 storage. | *Pending Credentials* |
| `STORAGE_SECRET_KEY` | **Optional** | IAM secret key for private S3 storage. | *Pending Credentials* |
| `GOOGLE_CLIENT_ID` | **Optional** | Google OAuth Client ID for student sign-in. | *Pending Credentials* |
| `GOOGLE_CLIENT_SECRET` | **Optional** | Google OAuth Client Secret. | *Pending Credentials* |
| `EMAIL_API_KEY` | **Optional** | Transactional email delivery (Resend / SendGrid). | *Pending Credentials* |
| `SMS_API_KEY` | **Optional** | Indian SMS gateway (Twilio / MSG91). | *Pending Credentials* |

---

## 3. Production Database (PostgreSQL)

When ready to connect to a cloud database (Supabase, Neon, AWS RDS, Railway):

1. Update `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/careeredge?schema=public"
   ```
2. In `prisma/schema.prisma`, update the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Run the deployment migration:
   ```bash
   npx prisma migrate deploy
   ```

---

## 4. Useful Development Commands

```bash
# Run local migrations
npm run db:migrate

# Launch visual database GUI (Prisma Studio)
npm run db:studio

# Run automated end-to-end test suite
npm test

# Run ESLint validation
npm run lint

# Run TypeScript compilation check
npx tsc --noEmit

# Production build
npm run build
```

---

## 5. Security & DPDP Compliance Rules

- **Zero Secret Leakage:** Never prefix secrets with `NEXT_PUBLIC_`. Variables with `NEXT_PUBLIC_` are bundled directly into client-side JavaScript.
- **Git Protection:** `.env` and `.env.local` are strictly ignored by `.gitignore`. Never commit them to version control.
- **Cookie Flags:** All session cookies (`ace_session`) are set with `httpOnly: true`, `secure: true` (in production), and `sameSite: "lax"`.
