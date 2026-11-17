// src/app/api/linkedin/merge-to-passport/route.ts
// Student-Approved Merge from LinkedIn Import into Career Passport (Day 2 Part 4.2)
// Sets explicit dataOrigin and provenance; never overwrites existing records without student approval.

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

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

    // 1. Merge Approved Skills
    for (const skillName of approvedSkills) {
      const clean = (skillName as string).trim();
      if (!clean) continue;

      const existing = await prisma.studentSkill.findFirst({
        where: { userId: session.userId, name: clean },
      });

      if (!existing) {
        await prisma.studentSkill.create({
          data: {
            userId: session.userId,
            name: clean,
            category: "Technical / Core",
            proficiencyLevel: "INTERMEDIATE",
            dataOrigin: provenance,
          },
        });
        mergedCount++;
      }
    }

    // 2. Merge Approved Educations
    for (const edu of approvedEducations) {
      if (!edu.institution || !edu.degree) continue;

      const existing = await prisma.educationRecord.findFirst({
        where: {
          userId: session.userId,
          institution: edu.institution,
          degree: edu.degree,
        },
      });

      if (!existing) {
        await prisma.educationRecord.create({
          data: {
            userId: session.userId,
            level: "UG",
            institution: edu.institution,
            degree: edu.degree,
            dataOrigin: provenance,
          },
        });
        mergedCount++;
      }
    }

    // 3. Merge Approved Experiences
    for (const exp of approvedExperiences) {
      if (!exp.company || !exp.title) continue;

      const existing = await prisma.studentExperience.findFirst({
        where: {
          userId: session.userId,
          companyName: exp.company,
          jobTitle: exp.title,
        },
      });

      if (!existing) {
        await prisma.studentExperience.create({
          data: {
            userId: session.userId,
            companyName: exp.company,
            jobTitle: exp.title,
            description: exp.description || "",
            dataOrigin: provenance,
          },
        });
        mergedCount++;
      }
    }

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
