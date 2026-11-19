# Aeterna CareerEdge — Responsive Engineering Guidelines

## 1. Core Principles

1. **Mobile-First Responsive Design**:
   - Begin with a single-column, touch-friendly, readable layout for 320px–639px.
   - Progressively enhance to comfortable tablet layouts (768px–1023px) and rich multi-zone desktop layouts (1024px+).
   - "Responsive does not mean shrinking the desktop interface to fit a phone. It means adapting the layout and interaction model to the available screen space."

2. **No Unintended Page Overflow**:
   - \`document.documentElement.scrollWidth === window.innerWidth\` across all viewports.
   - Rigid containers with fixed \`min-w-[...]\` are strictly forbidden unless inside an intentional, scroll-indicated component (e.g. data table with horizontal scroll indicator).
   - All flex children receiving variable text must include \`min-w-0\` and word-break rules to prevent content-driven blowout.

3. **Touch Targets & Accessibility**:
   - All interactive controls (buttons, navigation items, dropdown triggers, modal close icons) must meet or exceed **44 × 44 CSS pixels** of interactive hit area.
   - Where visual design calls for a compact icon (e.g., 28px–32px), negative margin hit-area padding (\`p-2.5 -m-1.5\` or \`::after\` hit area) is employed.

4. **Multi-Domain Inclusivity**:
   - Interfaces accommodate diverse student qualification names, institutions, and career streams across India (Nursing, Law, Commerce, Engineering, Agriculture, Vocational, etc.).
   - Text containers wrap gracefully with comfortable line-heights without clipping credentials.

---

## 2. Standard Breakpoint Matrix

Tailwind CSS v4 standard mobile-first breakpoints:

| Token | Min Width | Target Devices & Context |
|---|---|---|
| *(base)* | 0px | Mobile phones in portrait (320px–639px). Single-column, vertical stacking, full-width touch targets. |
| \`sm:\` | 640px | Large phones & small phablets (640px–767px). 2-column metric cards, responsive wrapping. |
| \`md:\` | 768px | Tablet portrait & phone landscape (768px–1023px). Icon-rail sidebar (w-20) or drawer, 2-zone workspaces. |
| \`lg:\` | 1024px | Tablet landscape & laptops (1024px–1279px). Expanded sidebar (w-64), 3-zone workspaces, desktop navigation. |
| \`xl:\` | 1280px | Standard desktop displays (1280px–1535px). Generous max-w containers (1400px–1600px). |
| \`2xl:\` | 1536px | Large widescreen displays (1536px+). Balanced line-lengths and centered executive layouts. |

---

## 3. Application Shell & Navigation Strategy

### Desktop (1024px and above):
- Sidebar remains visible, defaulting to expanded (256px / \`w-64\`) or collapsed icon rail (80px / \`w-20\`).
- Main content occupies remaining fluid width (\`md:pl-64\` or \`md:pl-20\`).
- Header displays page title, user initials, and Sign Out action.

### Tablet (768px–1023px):
- Desktop layouts squeezed into tablet viewports are eliminated.
- Sidebar defaults to collapsed icon rail (\`w-20\`) on \`md:\` screens (768px–1023px) unless explicitly expanded by user, reserving 688px+ for comfortable content rendering.
- Complex 3-column workspaces (Resume Builder) switch to a focused 2-zone layout with slide-over drawers for secondary tools.

### Mobile (Below 768px):
- Sidebar transforms into an off-canvas slide-in navigation drawer.
- Triggered by header hamburger icon (\`Menu\`).
- Smooth entry/exit transition via \`motion\`.
- Escape key listener, backdrop tap, and focus trapping.
- Body scroll locked while mobile drawer is open.
- Safe-area bottom padding respected for modern edge-to-edge mobile displays:
  \`\`\`css
  padding-bottom: env(safe-area-inset-bottom);
  \`\`\`

---

## 4. Complex Workflow Adapters

### 4.1 Resume Builder (\`/resume/builder\`)
- **Desktop (1024px+)**: 3-zone workstation (Section Editor, Live Document Preview, AI Review/Customize Drawer).
- **Tablet (768px–1023px)**: 2-zone workstation (Editor + Floating Preview Drawer).
- **Mobile (<768px)**: Segmented View Switcher:
  - **Content** (Default: Section Editor)
  - **Preview** (Fit-to-width scalable resume canvas with pinch/zoom)
  - **Customize** (Typography, layout density, margins)
  - **AI Review** (Section analysis, bullets, readiness score)

### 4.2 Resume Studio (\`/resume/studio\`)
- Viewport unit uses \`100dvh\` / \`min-h-dvh\` to prevent soft-keyboard blowout on Android & iOS.
- Prompt composer sticks above keyboard with safe-area padding.
- Comparison cards stack vertically on screens <768px.

### 4.3 Data Tables (Jobs & Application Tracker)
- On screens <768px, dense tabular data converts into status-aware cards.
- Status badges, dates, and primary CTAs remain prominent and tap-accessible.
- Desktop tables (>768px) preserve dense scanability with sticky column headers.

---

## 5. Public Page Pixel-Diff Protection

- Marketing Landing (\`/\`), Login (\`/login\`), Signup (\`/signup\`), Forgot Password, Reset Password.
- **Strict Rule**: At desktop widths of 1280px, 1440px, and 1920px, public pages must remain **100% pixel-identical** to their baseline appearance.
- Mobile fixes (<768px) on public pages address only verified responsive defects (overflow, wrapping, touch targets) without altering visual design language.

---

## 6. Print & PDF Protection

- \`/resume/[id]/print\` must remain unaffected by responsive layout modifications.
- Standard fixed-paper print styles (8.5in × 11in, \`@media print\`) are preserved.
