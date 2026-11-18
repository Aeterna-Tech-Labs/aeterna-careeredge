// src/app/truth-check/page.tsx
// Truth Check Verification Page (Day 2 Addendum Section B2)

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { TruthCheckClient } from "./truth-check-client";

export default async function TruthCheckPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      profile: {
        select: {
          academicDomain: true,
          preferredJobRole: true,
          course: true,
          institution: true,
        },
      },
      skills: {
        select: { id: true, name: true },
      },
      resumes: {
        select: {
          id: true,
          title: true,
          targetRole: true,
          atsScore: true,
          structuredData: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
      },
      truthCheckResults: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <TruthCheckClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        academicDomain: user.profile?.academicDomain || "Multi-Domain",
        preferredJobRole: user.profile?.preferredJobRole || undefined,
      }}
      resumes={user.resumes}
      skills={user.skills}
      recentChecks={user.truthCheckResults}
    />
  );
}
