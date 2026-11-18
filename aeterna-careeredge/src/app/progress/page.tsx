// src/app/progress/page.tsx
// Immutable Student Progress Ledger & Audit History

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ProgressClient } from "./progress-client";

export default async function ProgressPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return <ProgressClient studentName={session.name || "Student"} />;
}
