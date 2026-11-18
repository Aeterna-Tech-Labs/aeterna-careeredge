// src/app/jobs/page.tsx
// Job Discovery & Multi-Domain Market Exploration

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { JobsClient } from "./jobs-client";

export default async function JobsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return <JobsClient studentName={session.name || "Student"} />;
}
