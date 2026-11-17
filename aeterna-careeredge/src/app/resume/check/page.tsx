// src/app/resume/check/page.tsx
// Resume Check & Job Description Alignment Analysis (Day 2 Part 3.4)

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { ResumeCheckClient } from "./resume-check-client";

export default async function ResumeCheckPage({
  searchParams,
}: {
  searchParams: Promise<{ resumeId?: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { resumeId } = await searchParams;

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
        },
      },
      resumes: {
        select: {
          id: true,
          title: true,
          targetRole: true,
          atsScore: true,
          structuredData: true,
          feedback: true,
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <ResumeCheckClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        academicDomain: user.profile?.academicDomain || "Multi-Domain",
        preferredJobRole: user.profile?.preferredJobRole || undefined,
      }}
      resumes={user.resumes}
      initialResumeId={resumeId}
    />
  );
}
