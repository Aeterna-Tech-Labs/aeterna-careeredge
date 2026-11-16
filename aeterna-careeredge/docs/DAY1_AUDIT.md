# Day 1 Audit — Aeterna CareerEdge

_Audited: 2026-11-16 | Branch: `anuj-dev`_

---

## Project Overview

**Framework:** Next.js 16.4.6 (App Router)  
**React:** 19.3.0  
**Language:** TypeScript (strict)  
**Styling:** Tailwind CSS 4 (`@import "tailwindcss"`)  
**Bundler:** Turbopack  

> [!IMPORTANT]
> **Next.js 16 Breaking Change:** `middleware.ts` is renamed to `proxy.ts`. The exported function is `proxy`, not `middleware`. All route protection must use `proxy.ts`.

---

## What Is Already Working ✅

### Design System
- `globals.css` — full design token set (CSS custom properties: `--primary`, `--gold`, `--background`, etc.)
- Tailwind 4 theme mapping via `@theme inline`
- Plus Jakarta Sans, Inter, Noto Sans Kannada fonts loaded in root layout
- Reusable utilities: `.page-container`, `.card`, `.section-heading`

### UI Component Library (`src/components/ui/`)
- `button.tsx` — 4 variants (primary, secondary, outline, gold), 3 sizes, loading state
- `input.tsx` — with label, error, hint props
- `card.tsx` — CardHeader, CardContent, CardTitle
- `badge.tsx` — with dot variant and success/warning/error colours
- `progress.tsx`
- `select.tsx`
- `avatar.tsx`
- `modal.tsx`
- `skeleton.tsx`
- `tabs.tsx`
- `textarea.tsx`

### Common Components
- `BrandLogo.tsx` — logo with tone (dark/light) prop using Libre Baskerville font

### Layouts
- `auth-layout.tsx` — full two-panel design with maroon branding panel + right form panel; tab switcher for Signup/Login
- `marketing-layout.tsx` — wraps Navbar + Footer
- `student-layout.tsx` — desktop sidebar + mobile drawer + main content

### Navigation
- `marketing-navbar.tsx`
- `marketing-footer.tsx`
- `student-sidebar.tsx` — full nav groups, active state, logo
- `student-header.tsx` — sticky, with search, notifications, user avatar

### Landing Page (`src/features/landing/`)
- `hero-section.tsx`
- `features-section.tsx`
- `how-it-works-section.tsx`
- `destinations-section.tsx`
- `sample-output-section.tsx`
- `trust-section.tsx`
- `colleges-section.tsx`
- `lead-capture-section.tsx`
- `faq-section.tsx`

### Pages
- `/` — full marketing landing page
- `/dashboard` — student dashboard with stats cards, progress, career status (static/mock)

### Auth Pages (UI Only)
- `/signup` — full form UI with motion animations, password show/hide, password mismatch validation; **no backend connection**
- `/login` — basic form UI; **no AuthLayout** (renders its own plain card); no backend connection

### Assets
- Company logo, name logo
- Auth background (`auth-bg.webp`)
- Destination images (Australia, Canada, Germany, Ireland, UK, USA)
- Hero section images
- Student images, avatar

---

## What Is Incomplete / Missing ❌

### Authentication Backend
- No auth API route handlers
- No password hashing
- No session management
- No JWT or cookie-based sessions

### Database
- No database configured (no Prisma schema, no .env, no DB URL)
- No User or StudentProfile models

### Route Protection
- No `proxy.ts` (Next.js 16 replacement for middleware)
- Dashboard is publicly accessible to anyone

### Login Page
- Not using `AuthLayout` (inconsistent with signup)
- No backend connection
- Missing mobile number login option

### Signup Page
- Counsellor contact consent checkbox missing
- Mobile number lacks `+91` prefix UI treatment
- No backend connection

### Onboarding
- No onboarding flow exists

### Environment
- No `.env` or `.env.example`
- No documented setup

---

## Implementation Plan for Day 1

1. **Database** — Prisma + SQLite (dev, zero-credential) → PostgreSQL-ready schema
2. **Auth API** — `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
3. **Session** — JWT stored in `httpOnly` cookie via `jose`
4. **Proxy (route protection)** — `src/proxy.ts` protecting `/dashboard` and `/onboarding`
5. **Login page** — migrate to `AuthLayout`, add mobile login, wire backend
6. **Signup page** — add counsellor consent, wire backend
7. **Onboarding** — 5-step flow at `/onboarding`
8. **Env files** — `.env`, `.env.example`, `docs/ENVIRONMENT_SETUP.md`
9. **Types** — shared TypeScript types
10. **Build & lint** — fix errors, verify build

---

## Architecture Decisions

| Decision | Rationale |
|---|---|
| **Prisma + SQLite** (dev) | Zero credential requirement for Day 1; schema is PostgreSQL-compatible for production |
| **Custom JWT auth** | No NextAuth needed; keeps deps minimal; jose is edge-compatible |
| **`httpOnly` cookie session** | Secure; not accessible from JS; works with Next.js proxy |
| **`proxy.ts`** (not `middleware.ts`) | Required by Next.js 16 API |
| **Feature folders** | `src/features/auth/`, `src/features/onboarding/` for logic separation |
