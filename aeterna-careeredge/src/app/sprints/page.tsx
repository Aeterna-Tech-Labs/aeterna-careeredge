// src/app/sprints/page.tsx
// Gap-to-Action 30-Day Employability Sprint

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { SprintsClient } from "./sprints-client";

export default async function SprintsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const resolved = await searchParams;
  const initialRole = typeof resolved.role === "string" ? resolved.role : undefined;
  const initialProfession = typeof resolved.profession === "string" ? resolved.profession : undefined;

  return (
    <SprintsClient
      studentName={session.name || "Student"}
      initialRole={initialRole}
      initialProfession={initialProfession}
    />
  );
}
