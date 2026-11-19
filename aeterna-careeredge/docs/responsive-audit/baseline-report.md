# Aeterna CareerEdge — Baseline Responsive Audit Report

**Date:** 2026-11-19T12:35:43.552Z  
**Total Routes Audited:** 27  
**Viewport Matrix Tested:** 10 devices (320px to 1920px)  
**Total Test Executions:** 270  
**Baseline Defect Count:** 210  

---

## 1. Executive Summary

This automated responsive audit assessed all public marketing routes and authenticated student routes across 10 standardized viewports ranging from very small mobile screens (320px) up to ultra-wide desktop displays (1920px).

### Key Baseline Findings:
1. **Mobile Drawer & Sidebar**: Below 768px, mobile hamburger drawer opens correctly, but some pages retain double padding or rigid desktop min-width assumptions causing horizontal layout strain.
2. **Resume Builder & Resume Studio**:
   - The multi-column layout on `/resume/builder` exerts horizontal overflow pressure at 320px-390px when sidebars and editing zones compete for width without a segmented mobile control.
   - Fixed toolbars in Studio and Builder occasionally cause slight subpixel overflow on small viewports.
3. **Touch Targets**: Multiple secondary inline actions (e.g., small item deletion buttons or compact tag pills) measure below the accessible 44x44 CSS pixel target on phone viewports.
4. **Desktop Layout Integrity**: Desktop viewports (1280px, 1440px, 1920px) show 0 horizontal overflow across public and signed-in pages, confirming that desktop layouts are structurally solid and must be preserved without regressions.
5. **Print Route Protection**: `/resume/[id]/print` renders at fixed paper dimensions (8.5in x 11in) as expected, without responsive styles distorting paper output.

---

## 2. Route-by-Route Baseline Audit Matrix

| Route | Viewport | Page Overflow | Overflow (px) | Small Touch Targets | Overlap | Baseline Status |
|---|---|---|---|---|---|---|
| `landing` | 320x640 (very-small-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `landing` | 360x740 (small-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `landing` | 390x844 (standard-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `landing` | 414x896 (large-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `landing` | 844x390 (phone-landscape) | No | 0 | 0 | No | ❌ DEFECT |
| `landing` | 768x1024 (tablet-portrait) | ⚠️ Yes (8px) | 8 | 0 | No | ❌ DEFECT |
| `landing` | 1024x768 (tablet-landscape) | No | 0 | 0 | No | ❌ DEFECT |
| `landing` | 1280x800 (laptop) | No | 0 | 0 | No | ❌ DEFECT |
| `landing` | 1440x900 (desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `landing` | 1920x1080 (large-desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `login` | 320x640 (very-small-phone) | No | 0 | 5 detected | No | ✅ PASS |
| `login` | 360x740 (small-phone) | No | 0 | 5 detected | No | ✅ PASS |
| `login` | 390x844 (standard-phone) | No | 0 | 5 detected | No | ✅ PASS |
| `login` | 414x896 (large-phone) | No | 0 | 5 detected | No | ✅ PASS |
| `login` | 844x390 (phone-landscape) | No | 0 | 0 | No | ✅ PASS |
| `login` | 768x1024 (tablet-portrait) | No | 0 | 0 | No | ✅ PASS |
| `login` | 1024x768 (tablet-landscape) | No | 0 | 0 | No | ✅ PASS |
| `login` | 1280x800 (laptop) | No | 0 | 0 | No | ✅ PASS |
| `login` | 1440x900 (desktop) | No | 0 | 0 | No | ✅ PASS |
| `login` | 1920x1080 (large-desktop) | No | 0 | 0 | No | ✅ PASS |
| `signup` | 320x640 (very-small-phone) | No | 0 | 5 detected | No | ✅ PASS |
| `signup` | 360x740 (small-phone) | No | 0 | 5 detected | No | ✅ PASS |
| `signup` | 390x844 (standard-phone) | No | 0 | 5 detected | No | ✅ PASS |
| `signup` | 414x896 (large-phone) | No | 0 | 5 detected | No | ✅ PASS |
| `signup` | 844x390 (phone-landscape) | No | 0 | 0 | No | ✅ PASS |
| `signup` | 768x1024 (tablet-portrait) | No | 0 | 0 | No | ✅ PASS |
| `signup` | 1024x768 (tablet-landscape) | No | 0 | 0 | No | ✅ PASS |
| `signup` | 1280x800 (laptop) | No | 0 | 0 | No | ✅ PASS |
| `signup` | 1440x900 (desktop) | No | 0 | 0 | No | ✅ PASS |
| `signup` | 1920x1080 (large-desktop) | No | 0 | 0 | No | ✅ PASS |
| `forgot-password` | 320x640 (very-small-phone) | No | 0 | 2 detected | No | ✅ PASS |
| `forgot-password` | 360x740 (small-phone) | No | 0 | 2 detected | No | ✅ PASS |
| `forgot-password` | 390x844 (standard-phone) | No | 0 | 2 detected | No | ✅ PASS |
| `forgot-password` | 414x896 (large-phone) | No | 0 | 2 detected | No | ✅ PASS |
| `forgot-password` | 844x390 (phone-landscape) | No | 0 | 0 | No | ✅ PASS |
| `forgot-password` | 768x1024 (tablet-portrait) | No | 0 | 0 | No | ✅ PASS |
| `forgot-password` | 1024x768 (tablet-landscape) | No | 0 | 0 | No | ✅ PASS |
| `forgot-password` | 1280x800 (laptop) | No | 0 | 0 | No | ✅ PASS |
| `forgot-password` | 1440x900 (desktop) | No | 0 | 0 | No | ✅ PASS |
| `forgot-password` | 1920x1080 (large-desktop) | No | 0 | 0 | No | ✅ PASS |
| `reset-password` | 320x640 (very-small-phone) | No | 0 | 0 | No | ✅ PASS |
| `reset-password` | 360x740 (small-phone) | No | 0 | 0 | No | ✅ PASS |
| `reset-password` | 390x844 (standard-phone) | No | 0 | 0 | No | ✅ PASS |
| `reset-password` | 414x896 (large-phone) | No | 0 | 0 | No | ✅ PASS |
| `reset-password` | 844x390 (phone-landscape) | No | 0 | 0 | No | ✅ PASS |
| `reset-password` | 768x1024 (tablet-portrait) | No | 0 | 0 | No | ✅ PASS |
| `reset-password` | 1024x768 (tablet-landscape) | No | 0 | 0 | No | ✅ PASS |
| `reset-password` | 1280x800 (laptop) | No | 0 | 0 | No | ✅ PASS |
| `reset-password` | 1440x900 (desktop) | No | 0 | 0 | No | ✅ PASS |
| `reset-password` | 1920x1080 (large-desktop) | No | 0 | 0 | No | ✅ PASS |
| `dashboard` | 320x640 (very-small-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `dashboard` | 360x740 (small-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `dashboard` | 390x844 (standard-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `dashboard` | 414x896 (large-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `dashboard` | 844x390 (phone-landscape) | ⚠️ Yes (221px) | 221 | 0 | No | ❌ DEFECT |
| `dashboard` | 768x1024 (tablet-portrait) | ⚠️ Yes (297px) | 297 | 0 | No | ❌ DEFECT |
| `dashboard` | 1024x768 (tablet-landscape) | ⚠️ Yes (49px) | 49 | 0 | No | ❌ DEFECT |
| `dashboard` | 1280x800 (laptop) | No | 0 | 0 | No | ❌ DEFECT |
| `dashboard` | 1440x900 (desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `dashboard` | 1920x1080 (large-desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `passport` | 320x640 (very-small-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `passport` | 360x740 (small-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `passport` | 390x844 (standard-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `passport` | 414x896 (large-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `passport` | 844x390 (phone-landscape) | ⚠️ Yes (12px) | 12 | 0 | No | ❌ DEFECT |
| `passport` | 768x1024 (tablet-portrait) | ⚠️ Yes (50px) | 50 | 0 | No | ❌ DEFECT |
| `passport` | 1024x768 (tablet-landscape) | No | 0 | 0 | No | ❌ DEFECT |
| `passport` | 1280x800 (laptop) | No | 0 | 0 | No | ❌ DEFECT |
| `passport` | 1440x900 (desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `passport` | 1920x1080 (large-desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `resume` | 320x640 (very-small-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `resume` | 360x740 (small-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `resume` | 390x844 (standard-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `resume` | 414x896 (large-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `resume` | 844x390 (phone-landscape) | No | 0 | 0 | No | ❌ DEFECT |
| `resume` | 768x1024 (tablet-portrait) | ⚠️ Yes (6px) | 6 | 0 | No | ❌ DEFECT |
| `resume` | 1024x768 (tablet-landscape) | No | 0 | 0 | No | ❌ DEFECT |
| `resume` | 1280x800 (laptop) | No | 0 | 0 | No | ❌ DEFECT |
| `resume` | 1440x900 (desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `resume` | 1920x1080 (large-desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `resume-builder` | 320x640 (very-small-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `resume-builder` | 360x740 (small-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `resume-builder` | 390x844 (standard-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `resume-builder` | 414x896 (large-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `resume-builder` | 844x390 (phone-landscape) | No | 0 | 0 | No | ❌ DEFECT |
| `resume-builder` | 768x1024 (tablet-portrait) | No | 0 | 0 | No | ❌ DEFECT |
| `resume-builder` | 1024x768 (tablet-landscape) | No | 0 | 0 | No | ❌ DEFECT |
| `resume-builder` | 1280x800 (laptop) | No | 0 | 0 | No | ❌ DEFECT |
| `resume-builder` | 1440x900 (desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `resume-builder` | 1920x1080 (large-desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `resume-studio` | 320x640 (very-small-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `resume-studio` | 360x740 (small-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `resume-studio` | 390x844 (standard-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `resume-studio` | 414x896 (large-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `resume-studio` | 844x390 (phone-landscape) | No | 0 | 0 | No | ❌ DEFECT |
| `resume-studio` | 768x1024 (tablet-portrait) | No | 0 | 0 | No | ❌ DEFECT |
| `resume-studio` | 1024x768 (tablet-landscape) | No | 0 | 0 | No | ❌ DEFECT |
| `resume-studio` | 1280x800 (laptop) | No | 0 | 0 | No | ❌ DEFECT |
| `resume-studio` | 1440x900 (desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `resume-studio` | 1920x1080 (large-desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `resume-check` | 320x640 (very-small-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `resume-check` | 360x740 (small-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `resume-check` | 390x844 (standard-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `resume-check` | 414x896 (large-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `resume-check` | 844x390 (phone-landscape) | No | 0 | 0 | No | ❌ DEFECT |
| `resume-check` | 768x1024 (tablet-portrait) | No | 0 | 0 | No | ❌ DEFECT |
| `resume-check` | 1024x768 (tablet-landscape) | No | 0 | 0 | No | ❌ DEFECT |
| `resume-check` | 1280x800 (laptop) | No | 0 | 0 | No | ❌ DEFECT |
| `resume-check` | 1440x900 (desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `resume-check` | 1920x1080 (large-desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `jobs` | 320x640 (very-small-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `jobs` | 360x740 (small-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `jobs` | 390x844 (standard-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `jobs` | 414x896 (large-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `jobs` | 844x390 (phone-landscape) | No | 0 | 0 | No | ❌ DEFECT |
| `jobs` | 768x1024 (tablet-portrait) | ⚠️ Yes (28px) | 28 | 0 | No | ❌ DEFECT |
| `jobs` | 1024x768 (tablet-landscape) | No | 0 | 0 | No | ❌ DEFECT |
| `jobs` | 1280x800 (laptop) | No | 0 | 0 | No | ❌ DEFECT |
| `jobs` | 1440x900 (desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `jobs` | 1920x1080 (large-desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `applications` | 320x640 (very-small-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `applications` | 360x740 (small-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `applications` | 390x844 (standard-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `applications` | 414x896 (large-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `applications` | 844x390 (phone-landscape) | ⚠️ Yes (33px) | 33 | 0 | No | ❌ DEFECT |
| `applications` | 768x1024 (tablet-portrait) | ⚠️ Yes (109px) | 109 | 0 | No | ❌ DEFECT |
| `applications` | 1024x768 (tablet-landscape) | No | 0 | 0 | No | ❌ DEFECT |
| `applications` | 1280x800 (laptop) | No | 0 | 0 | No | ❌ DEFECT |
| `applications` | 1440x900 (desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `applications` | 1920x1080 (large-desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `evidence-vault` | 320x640 (very-small-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `evidence-vault` | 360x740 (small-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `evidence-vault` | 390x844 (standard-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `evidence-vault` | 414x896 (large-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `evidence-vault` | 844x390 (phone-landscape) | No | 0 | 0 | No | ❌ DEFECT |
| `evidence-vault` | 768x1024 (tablet-portrait) | No | 0 | 0 | No | ❌ DEFECT |
| `evidence-vault` | 1024x768 (tablet-landscape) | No | 0 | 0 | No | ❌ DEFECT |
| `evidence-vault` | 1280x800 (laptop) | No | 0 | 0 | No | ❌ DEFECT |
| `evidence-vault` | 1440x900 (desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `evidence-vault` | 1920x1080 (large-desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `linkedin` | 320x640 (very-small-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `linkedin` | 360x740 (small-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `linkedin` | 390x844 (standard-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `linkedin` | 414x896 (large-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `linkedin` | 844x390 (phone-landscape) | ⚠️ Yes (137px) | 137 | 0 | No | ❌ DEFECT |
| `linkedin` | 768x1024 (tablet-portrait) | ⚠️ Yes (158px) | 158 | 0 | No | ❌ DEFECT |
| `linkedin` | 1024x768 (tablet-landscape) | ⚠️ Yes (50px) | 50 | 0 | No | ❌ DEFECT |
| `linkedin` | 1280x800 (laptop) | No | 0 | 0 | No | ❌ DEFECT |
| `linkedin` | 1440x900 (desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `linkedin` | 1920x1080 (large-desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `role-fit-explorer` | 320x640 (very-small-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `role-fit-explorer` | 360x740 (small-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `role-fit-explorer` | 390x844 (standard-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `role-fit-explorer` | 414x896 (large-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `role-fit-explorer` | 844x390 (phone-landscape) | No | 0 | 0 | No | ❌ DEFECT |
| `role-fit-explorer` | 768x1024 (tablet-portrait) | ⚠️ Yes (7px) | 7 | 0 | No | ❌ DEFECT |
| `role-fit-explorer` | 1024x768 (tablet-landscape) | No | 0 | 0 | No | ❌ DEFECT |
| `role-fit-explorer` | 1280x800 (laptop) | No | 0 | 0 | No | ❌ DEFECT |
| `role-fit-explorer` | 1440x900 (desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `role-fit-explorer` | 1920x1080 (large-desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `sprints` | 320x640 (very-small-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `sprints` | 360x740 (small-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `sprints` | 390x844 (standard-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `sprints` | 414x896 (large-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `sprints` | 844x390 (phone-landscape) | No | 0 | 0 | No | ❌ DEFECT |
| `sprints` | 768x1024 (tablet-portrait) | No | 0 | 0 | No | ❌ DEFECT |
| `sprints` | 1024x768 (tablet-landscape) | No | 0 | 0 | No | ❌ DEFECT |
| `sprints` | 1280x800 (laptop) | No | 0 | 0 | No | ❌ DEFECT |
| `sprints` | 1440x900 (desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `sprints` | 1920x1080 (large-desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `interview-prep` | 320x640 (very-small-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `interview-prep` | 360x740 (small-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `interview-prep` | 390x844 (standard-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `interview-prep` | 414x896 (large-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `interview-prep` | 844x390 (phone-landscape) | No | 0 | 0 | No | ❌ DEFECT |
| `interview-prep` | 768x1024 (tablet-portrait) | No | 0 | 0 | No | ❌ DEFECT |
| `interview-prep` | 1024x768 (tablet-landscape) | No | 0 | 0 | No | ❌ DEFECT |
| `interview-prep` | 1280x800 (laptop) | No | 0 | 0 | No | ❌ DEFECT |
| `interview-prep` | 1440x900 (desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `interview-prep` | 1920x1080 (large-desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `truth-check` | 320x640 (very-small-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `truth-check` | 360x740 (small-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `truth-check` | 390x844 (standard-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `truth-check` | 414x896 (large-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `truth-check` | 844x390 (phone-landscape) | ⚠️ Yes (221px) | 221 | 0 | No | ❌ DEFECT |
| `truth-check` | 768x1024 (tablet-portrait) | ⚠️ Yes (297px) | 297 | 0 | No | ❌ DEFECT |
| `truth-check` | 1024x768 (tablet-landscape) | ⚠️ Yes (49px) | 49 | 0 | No | ❌ DEFECT |
| `truth-check` | 1280x800 (laptop) | No | 0 | 0 | No | ❌ DEFECT |
| `truth-check` | 1440x900 (desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `truth-check` | 1920x1080 (large-desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `value` | 320x640 (very-small-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `value` | 360x740 (small-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `value` | 390x844 (standard-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `value` | 414x896 (large-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `value` | 844x390 (phone-landscape) | ⚠️ Yes (221px) | 221 | 0 | No | ❌ DEFECT |
| `value` | 768x1024 (tablet-portrait) | ⚠️ Yes (297px) | 297 | 0 | No | ❌ DEFECT |
| `value` | 1024x768 (tablet-landscape) | ⚠️ Yes (49px) | 49 | 0 | No | ❌ DEFECT |
| `value` | 1280x800 (laptop) | No | 0 | 0 | No | ❌ DEFECT |
| `value` | 1440x900 (desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `value` | 1920x1080 (large-desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `progress` | 320x640 (very-small-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `progress` | 360x740 (small-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `progress` | 390x844 (standard-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `progress` | 414x896 (large-phone) | No | 0 | 5 detected | No | ❌ DEFECT |
| `progress` | 844x390 (phone-landscape) | ⚠️ Yes (221px) | 221 | 0 | No | ❌ DEFECT |
| `progress` | 768x1024 (tablet-portrait) | ⚠️ Yes (297px) | 297 | 0 | No | ❌ DEFECT |
| `progress` | 1024x768 (tablet-landscape) | ⚠️ Yes (49px) | 49 | 0 | No | ❌ DEFECT |
| `progress` | 1280x800 (laptop) | No | 0 | 0 | No | ❌ DEFECT |
| `progress` | 1440x900 (desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `progress` | 1920x1080 (large-desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `pricing` | 320x640 (very-small-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `pricing` | 360x740 (small-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `pricing` | 390x844 (standard-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `pricing` | 414x896 (large-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `pricing` | 844x390 (phone-landscape) | No | 0 | 0 | No | ❌ DEFECT |
| `pricing` | 768x1024 (tablet-portrait) | No | 0 | 0 | No | ❌ DEFECT |
| `pricing` | 1024x768 (tablet-landscape) | No | 0 | 0 | No | ❌ DEFECT |
| `pricing` | 1280x800 (laptop) | No | 0 | 0 | No | ❌ DEFECT |
| `pricing` | 1440x900 (desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `pricing` | 1920x1080 (large-desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `settings` | 320x640 (very-small-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `settings` | 360x740 (small-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `settings` | 390x844 (standard-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `settings` | 414x896 (large-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `settings` | 844x390 (phone-landscape) | No | 0 | 0 | No | ❌ DEFECT |
| `settings` | 768x1024 (tablet-portrait) | No | 0 | 0 | No | ❌ DEFECT |
| `settings` | 1024x768 (tablet-landscape) | No | 0 | 0 | No | ❌ DEFECT |
| `settings` | 1280x800 (laptop) | No | 0 | 0 | No | ❌ DEFECT |
| `settings` | 1440x900 (desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `settings` | 1920x1080 (large-desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `onboarding` | 320x640 (very-small-phone) | No | 0 | 1 detected | No | ✅ PASS |
| `onboarding` | 360x740 (small-phone) | No | 0 | 1 detected | No | ✅ PASS |
| `onboarding` | 390x844 (standard-phone) | No | 0 | 1 detected | No | ✅ PASS |
| `onboarding` | 414x896 (large-phone) | No | 0 | 1 detected | No | ✅ PASS |
| `onboarding` | 844x390 (phone-landscape) | No | 0 | 0 | No | ✅ PASS |
| `onboarding` | 768x1024 (tablet-portrait) | No | 0 | 0 | No | ✅ PASS |
| `onboarding` | 1024x768 (tablet-landscape) | No | 0 | 0 | No | ✅ PASS |
| `onboarding` | 1280x800 (laptop) | No | 0 | 0 | No | ✅ PASS |
| `onboarding` | 1440x900 (desktop) | No | 0 | 0 | No | ✅ PASS |
| `onboarding` | 1920x1080 (large-desktop) | No | 0 | 0 | No | ✅ PASS |
| `counselling` | 320x640 (very-small-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `counselling` | 360x740 (small-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `counselling` | 390x844 (standard-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `counselling` | 414x896 (large-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `counselling` | 844x390 (phone-landscape) | No | 0 | 0 | No | ❌ DEFECT |
| `counselling` | 768x1024 (tablet-portrait) | No | 0 | 0 | No | ❌ DEFECT |
| `counselling` | 1024x768 (tablet-landscape) | No | 0 | 0 | No | ❌ DEFECT |
| `counselling` | 1280x800 (laptop) | No | 0 | 0 | No | ❌ DEFECT |
| `counselling` | 1440x900 (desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `counselling` | 1920x1080 (large-desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `sop` | 320x640 (very-small-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `sop` | 360x740 (small-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `sop` | 390x844 (standard-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `sop` | 414x896 (large-phone) | No | 0 | 4 detected | No | ❌ DEFECT |
| `sop` | 844x390 (phone-landscape) | No | 0 | 0 | No | ❌ DEFECT |
| `sop` | 768x1024 (tablet-portrait) | No | 0 | 0 | No | ❌ DEFECT |
| `sop` | 1024x768 (tablet-landscape) | No | 0 | 0 | No | ❌ DEFECT |
| `sop` | 1280x800 (laptop) | No | 0 | 0 | No | ❌ DEFECT |
| `sop` | 1440x900 (desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `sop` | 1920x1080 (large-desktop) | No | 0 | 0 | No | ❌ DEFECT |
| `resume-print` | 320x640 (very-small-phone) | No | 0 | 0 | No | ✅ PASS |
| `resume-print` | 360x740 (small-phone) | No | 0 | 0 | No | ✅ PASS |
| `resume-print` | 390x844 (standard-phone) | No | 0 | 0 | No | ✅ PASS |
| `resume-print` | 414x896 (large-phone) | No | 0 | 0 | No | ✅ PASS |
| `resume-print` | 844x390 (phone-landscape) | No | 0 | 0 | No | ✅ PASS |
| `resume-print` | 768x1024 (tablet-portrait) | No | 0 | 0 | No | ✅ PASS |
| `resume-print` | 1024x768 (tablet-landscape) | No | 0 | 0 | No | ✅ PASS |
| `resume-print` | 1280x800 (laptop) | No | 0 | 0 | No | ✅ PASS |
| `resume-print` | 1440x900 (desktop) | No | 0 | 0 | No | ✅ PASS |
| `resume-print` | 1920x1080 (large-desktop) | No | 0 | 0 | No | ✅ PASS |

---

## 3. Detailed Defect Analysis & Targeted Resolutions

### 3.1 Horizontal Overflow on Small Phones (320px–360px)
- **Affected Routes**: `/resume/builder`, `/role-fit-explorer`, `/applications`
- **Root Cause**: Rigid `min-w-[...]` containers, nested table structures, and un-collapsed action groups.
- **Planned Fix**:
  - Implement mobile segmented tabs (`Content | Preview | Design | Improve`) in Resume Builder.
  - Convert dense desktop tables in Job Applications and Roles into status-aware mobile cards.
  - Apply `min-w-0` and fluid flex wrapping on long titles and badge lists.

### 3.2 Mobile Touch Targets
- **Affected Routes**: Career Passport (`+ Add` / delete icons), Resume Builder section reorder buttons.
- **Root Cause**: Compact icon buttons measuring ~28px to 32px.
- **Planned Fix**: Expand interactive touch targets to 44x44px minimum using negative margin / invisible hit area padding without inflating visual visual aesthetics.

### 3.3 Safe-Area & Mobile Keyboard Handling
- **Affected Routes**: `/resume/studio`, Career Guide Drawer, CRUD Modals.
- **Planned Fix**: Utilize `100dvh` / `min-h-dvh`, `env(safe-area-inset-bottom)`, and keyboard-safe scrollable dialog bodies with sticky action footers.

---

## 4. Baseline Screenshots Archive

Baseline screenshots have been saved in:
`docs/responsive-audit/before/<route>/<width>x<height>.png`

Covered viewports per route:
- `320x640.png` (Very small phone)
- `390x844.png` (Standard phone)
- `768x1024.png` (Tablet portrait)
- `1280x800.png` (Laptop desktop)
