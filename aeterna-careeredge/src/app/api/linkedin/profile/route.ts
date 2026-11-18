// src/app/api/linkedin/profile/route.ts
// LinkedIn Profile Status & Analysis API (Day 2 Part 4.3 & 4.4)

import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { analyzeLinkedInProfile } from "@/lib/linkedin/analysis";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user, profile] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.userId },
        include: {
          profile: true,
          skills: true,
          experiences: true,
          certifications: true,
        },
      }),
      prisma.linkedInProfile.findUnique({
        where: { userId: session.userId },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const academicDomain = user.profile?.academicDomain || "General";
    const targetRole = user.profile?.preferredJobRole || "Professional";

    let parsedImport = null;
    if (profile?.importedRawJson) {
      try {
        parsedImport = JSON.parse(profile.importedRawJson);
      } catch {
        // Ignored
      }
    }

    let savedSections = null;
    if (profile?.sectionsJson) {
      try {
        savedSections = JSON.parse(profile.sectionsJson);
      } catch {
        // Ignored
      }
    }

    const analysisReport = await analyzeLinkedInProfile({
      userId: session.userId,
      domain: academicDomain,
      targetRole,
      headline: profile?.headlineSuggestion || parsedImport?.headline || "",
      about: profile?.summarySuggestion || parsedImport?.about || "",
      skills: user.skills.map((s) => s.name),
      experiencesCount: user.experiences.length,
      certificationsCount: user.certifications.length,
    });

    // Save optimization score in database
    if (profile) {
      await prisma.linkedInProfile.update({
        where: { userId: session.userId },
        data: { optimizationScore: analysisReport.overallScore },
      });
    }

    return NextResponse.json({
      profile,
      parsedImport,
      savedSections,
      analysisReport,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to load LinkedIn profile." },
      { status: 500 }
    );
  }
}
