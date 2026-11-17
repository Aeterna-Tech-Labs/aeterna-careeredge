// src/app/applications/page.tsx
// Job Application Tracker & Tailored Application Pack

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ApplicationsClient } from "./applications-client";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const initialJobTitle = typeof resolvedParams.jobTitle === "string" ? resolvedParams.jobTitle : undefined;
  const initialCompany = typeof resolvedParams.company === "string" ? resolvedParams.company : undefined;
  const initialRefId = typeof resolvedParams.refId === "string" ? resolvedParams.refId : undefined;

  return (
    <ApplicationsClient
      studentName={session.name || "Student"}
      initialJobTitle={initialJobTitle}
      initialCompany={initialCompany}
      initialRefId={initialRefId}
    />
  );
}
