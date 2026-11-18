// src/app/resume/builder/page.tsx
// Interactive Multi-Domain Resume Builder Page (Day 2 Part 3.5)

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { BuilderClient } from "./builder-client";

export default async function ResumeBuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const rawSession = session as unknown as Record<string, unknown>;
  const sessionUserId =
    session.userId ||
    (typeof rawSession.id === "string" ? rawSession.id : undefined) ||
    (typeof rawSession.sub === "string" ? rawSession.sub : undefined);

  const { id } = await searchParams;
  let targetResumeId = id;
  if (!targetResumeId) {
    const latestResume = await db.resume.findFirst({
      where: sessionUserId ? { userId: sessionUserId } : undefined,
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    });
    if (latestResume) {
      targetResumeId = latestResume.id;
    } else {
      redirect("/resume");
    }
  }

  const resume = await db.resume.findFirst({
    where: sessionUserId ? { id: targetResumeId, userId: sessionUserId } : { id: targetResumeId },
  });

  if (!resume) {
    redirect("/resume");
  }

  const targetUserId = sessionUserId || resume.userId;
  const user = await db.user.findUnique({
    where: { id: targetUserId },
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
      evidenceItems: {
        select: {
          id: true,
          title: true,
          type: true,
          relatedSkill: true,
          url: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <BuilderClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        academicDomain: user.profile?.academicDomain || "Multi-Domain",
        preferredJobRole: user.profile?.preferredJobRole || undefined,
      }}
      resume={resume}
      evidenceItems={user.evidenceItems}
    />
  );
}
