// src/app/truth-check/page.tsx
// Truth Check has been decommissioned per user direction. Redirects to /dashboard.

import { redirect } from "next/navigation";

export default function TruthCheckPage() {
  redirect("/dashboard");
}
