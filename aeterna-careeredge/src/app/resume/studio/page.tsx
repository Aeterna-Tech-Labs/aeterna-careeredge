// src/app/resume/studio/page.tsx
// AI Resume Studio: Multi-Strategy Resume Generation & Gap Analysis

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { StudentLayout } from "@/components/layouts/student-layout";
import { ResumeStudioClient } from "./studio-client";

export default async function ResumeStudioPage() {
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
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <StudentLayout
      userName={user.name}
      userInitial={user.name ? user.name.charAt(0).toUpperCase() : "S"}
      studentDomain={user.profile?.academicDomain || undefined}
      targetRole={user.profile?.preferredJobRole || undefined}
    >
      <ResumeStudioClient />
    </StudentLayout>
  );
}
