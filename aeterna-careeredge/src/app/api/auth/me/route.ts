// src/app/api/auth/me/route.ts
// GET /api/auth/me — returns the current user's public info (session-gated)

import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";

export async function GET(): Promise<NextResponse> {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      onboardingCompleted: true,
      profile: {
        select: {
          city: true,
          state: true,
          academicDomain: true,
          specialization: true,
          educationLevel: true,
          institution: true,
          course: true,
          graduationYear: true,
          gradingType: true,
          gradeValue: true,
          skills: true,
          projects: true,
          experience: true,
          achievements: true,
          certifications: true,
          careerInterests: true,
          preferredJobRole: true,
          targetIndustry: true,
          higherEducationGoal: true,
          shortTermGoal: true,
          longTermGoal: true,
          studyAbroadCountries: true,
          passportScore: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ user });
}
