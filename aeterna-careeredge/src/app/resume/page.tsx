// src/app/resume/page.tsx
// Resume Builder Overview & Version Manager (Day 2 Part 3)

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { ResumeListClient } from "./resume-list-client";

export default async function ResumeOverviewPage() {
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
      resumes: {
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <ResumeListClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        academicDomain: user.profile?.academicDomain || "Multi-Domain",
        preferredJobRole: user.profile?.preferredJobRole || undefined,
        course: user.profile?.course || undefined,
      }}
      initialResumes={user.resumes}
    />
  );
}
