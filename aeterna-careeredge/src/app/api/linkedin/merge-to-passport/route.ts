// src/app/api/linkedin/merge-to-passport/route.ts
// Student-Approved Merge from LinkedIn Import into Career Passport (Day 2 Part 4.2)
// Sets explicit dataOrigin and provenance; never overwrites existing records without student approval.

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  upsertEducationRecord,
  upsertSkillRecord,
  upsertExperienceRecord,
} from "@/lib/passport/deduplication";
import { recalculateAndSavePassportScore } from "@/lib/passport/score";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      approvedSkills = [],
      approvedEducations = [],
      approvedExperiences = [],
      provenance = "LINKEDIN_PDF",
    } = body;

    let mergedCount = 0;

    // 1. Merge Approved Skills (Deduplicated)
    for (const skillName of approvedSkills) {
      const clean = (skillName as string).trim();
      if (!clean) continue;

      await upsertSkillRecord(session.userId, {
        name: clean,
        category: "Technical / Core",
        proficiencyLevel: "INTERMEDIATE",
        dataOrigin: provenance,
      });
      mergedCount++;
    }

    // 2. Merge Approved Educations (Deduplicated)
    for (const edu of approvedEducations) {
      if (!edu.institution || !edu.degree) continue;

      await upsertEducationRecord(session.userId, {
        institution: edu.institution,
        degree: edu.degree,
        level: "UG",
        dataOrigin: provenance,
      });
      mergedCount++;
    }

    // 3. Merge Approved Experiences (Deduplicated)
    for (const exp of approvedExperiences) {
      if (!exp.company || !exp.title) continue;

      await upsertExperienceRecord(session.userId, {
        companyName: exp.company,
        jobTitle: exp.title,
        description: exp.description || "",
        dataOrigin: provenance,
      });
      mergedCount++;
    }

    await recalculateAndSavePassportScore(session.userId);

    return NextResponse.json({
      success: true,
      mergedCount,
      message: `Successfully merged ${mergedCount} verified records into your Career Passport.`,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Merge operation failed." },
      { status: 500 }
    );
  }
}
