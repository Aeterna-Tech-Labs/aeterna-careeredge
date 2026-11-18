// src/app/interview-prep/page.tsx
// Proof-Backed Domain Interview Prep Kits

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { InterviewPrepClient } from "./interview-prep-client";

export default async function InterviewPrepPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const resolved = await searchParams;
  const initialJobTitle = typeof resolved.jobTitle === "string" ? resolved.jobTitle : undefined;
  const initialCompany = typeof resolved.company === "string" ? resolved.company : undefined;
  const initialDomain = typeof resolved.domain === "string" ? resolved.domain : undefined;

  return (
    <InterviewPrepClient
      studentName={session.name || "Student"}
      initialJobTitle={initialJobTitle}
      initialCompany={initialCompany}
      initialDomain={initialDomain}
    />
  );
}
