// src/app/progress/page.tsx
// Progress Ledger has been decommissioned per user direction. Redirects to /dashboard.

import { redirect } from "next/navigation";

export default function ProgressPage() {
  redirect("/dashboard");
}
