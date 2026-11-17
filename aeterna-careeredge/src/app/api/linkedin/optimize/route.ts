// src/app/api/linkedin/optimize/route.ts
// LinkedIn Section-by-Section Optimization API (Day 2 Part 4.5)

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { checkEntitlement } from "@/lib/monetization/entitlements";
import { optimizeLinkedInSection, type LinkedInSectionType } from "@/lib/linkedin/optimizer";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check Entitlement Quota
    const entitlement = await checkEntitlement(session.userId, "LINKEDIN_OPTIMIZATION");
    if (!entitlement.allowed) {
      return NextResponse.json(
        {
          error: "You have reached your monthly LinkedIn Optimization limit.",
          quotaExhausted: true,
          planName: entitlement.plan.displayName,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { sectionType = "HEADLINE", currentText } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        profile: true,
        skills: true,
        evidenceItems: {
          take: 3,
          select: { title: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const domain = user.profile?.academicDomain || "General";
    const targetRole = user.profile?.preferredJobRole || "Professional";
    const skills = user.skills.map((s) => s.name);
    const evidenceSummary = user.evidenceItems.map((e) => e.title).join(", ") || "Academic projects and lab rotations.";

    const result = await optimizeLinkedInSection({
      userId: session.userId,
      sectionType: sectionType as LinkedInSectionType,
      domain,
      targetRole,
      currentText,
      skills,
      evidenceSummary,
      institution: user.profile?.institution || undefined,
      course: user.profile?.course || undefined,
    });

    // Update LinkedInProfile record
    const updateData: Record<string, unknown> = {};
    if (sectionType === "HEADLINE") {
      updateData.headlineSuggestion = result.improvedText;
    } else if (sectionType === "ABOUT") {
      updateData.summarySuggestion = result.improvedText;
    }

    // Update sectionsJson
    const existing = await prisma.linkedInProfile.findUnique({
      where: { userId: session.userId },
    });
    let currentSections: Record<string, unknown> = {};
    if (existing?.sectionsJson) {
      try {
        currentSections = JSON.parse(existing.sectionsJson);
      } catch {
        currentSections = {};
      }
    }
    currentSections[sectionType] = result;
    updateData.sectionsJson = JSON.stringify(currentSections);

    await prisma.linkedInProfile.upsert({
      where: { userId: session.userId },
      update: updateData,
      create: {
        userId: session.userId,
        ...updateData,
      },
    });

    return NextResponse.json({ result });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Optimization failed." },
      { status: 500 }
    );
  }
}
