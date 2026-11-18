// src/app/api/passport/skills/route.ts
// CRUD endpoints for Student Skills

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { recalculateAndSavePassportScore } from "@/lib/passport/score";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, category, proficiencyLevel } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Skill name is required." }, { status: 400 });
    }

    // Check if skill already exists for this user
    const existing = await db.studentSkill.findFirst({
      where: {
        userId: session.userId,
        name: { equals: name.trim() },
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        skill: existing,
        message: "Skill already exists.",
      });
    }

    const created = await db.studentSkill.create({
      data: {
        userId: session.userId,
        name: name.trim(),
        category: category || "TECHNICAL",
        proficiencyLevel: proficiencyLevel || "INTERMEDIATE",
        dataOrigin: "STUDENT_INPUT",
        isVerified: false,
      },
    });

    // Also update StudentProfile.skills serialized list
    const allSkills = await db.studentSkill.findMany({
      where: { userId: session.userId },
      select: { name: true },
    });
    await db.studentProfile.updateMany({
      where: { userId: session.userId },
      data: { skills: JSON.stringify(allSkills.map((s) => s.name)) },
    });

    const newScore = await recalculateAndSavePassportScore(session.userId);

    return NextResponse.json({
      success: true,
      skill: created,
      score: newScore,
    });
  } catch (err) {
    console.error("[Skill Create Error]", err);
    return NextResponse.json({ error: "Could not create skill." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing skill ID." }, { status: 400 });

    const existing = await db.studentSkill.findFirst({
      where: { id, userId: session.userId },
    });
    if (!existing) return NextResponse.json({ error: "Skill not found." }, { status: 404 });

    await db.studentSkill.delete({ where: { id } });

    // Update StudentProfile.skills serialized list
    const allSkills = await db.studentSkill.findMany({
      where: { userId: session.userId },
      select: { name: true },
    });
    await db.studentProfile.updateMany({
      where: { userId: session.userId },
      data: { skills: JSON.stringify(allSkills.map((s) => s.name)) },
    });

    const newScore = await recalculateAndSavePassportScore(session.userId);

    return NextResponse.json({ success: true, id, score: newScore });
  } catch (err) {
    console.error("[Skill Delete Error]", err);
    return NextResponse.json({ error: "Could not delete skill." }, { status: 500 });
  }
}
