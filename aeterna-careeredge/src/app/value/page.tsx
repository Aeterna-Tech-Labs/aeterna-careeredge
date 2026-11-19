// src/app/value/page.tsx
// Value & Impact Dashboard has been decommissioned per user direction. Redirects to /dashboard.

import { redirect } from "next/navigation";

export default function ValuePage() {
  redirect("/dashboard");
}
