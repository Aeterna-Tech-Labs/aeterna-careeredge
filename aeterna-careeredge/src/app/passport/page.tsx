// src/app/passport/page.tsx
// Career Passport - Single Source of Truth Aggregate View

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { PassportClient } from "./passport-client";

export default async function PassportPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      profile: true,
      educations: { orderBy: { startYear: "desc" } },
      skills: true,
      projects: true,
      experiences: { orderBy: { startDate: "desc" } },
      certifications: true,
      storedDocuments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <PassportClient
      user={{
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        profile: user.profile,
        educations: user.educations.map((e) => ({
          id: e.id,
          institution: e.institution,
          degree: e.degree || e.level,
          fieldOfStudy: e.fieldOfStudy,
          startDate: e.startYear ? String(e.startYear) : "N/A",
          endDate: e.endYear ? String(e.endYear) : e.isCurrent ? "Present" : null,
          score: e.scoreOrGrade,
        })),
        skills: user.skills,
        projects: user.projects,
        experiences: user.experiences.map((exp) => ({
          id: exp.id,
          jobTitle: exp.jobTitle,
          companyName: exp.companyName,
          startDate: exp.startDate ? new Date(exp.startDate).toLocaleDateString() : "N/A",
          endDate: exp.endDate ? new Date(exp.endDate).toLocaleDateString() : exp.isCurrent ? "Present" : null,
          description: exp.description,
        })),
        certifications: user.certifications.map((c) => ({
          id: c.id,
          name: c.title,
          issuingOrg: c.issuingOrganization,
          issueDate: c.issueDate ? new Date(c.issueDate).toLocaleDateString() : null,
          credentialUrl: c.credentialUrl,
        })),
        documentCount: user.storedDocuments.length,
      }}
    />
  );
}
