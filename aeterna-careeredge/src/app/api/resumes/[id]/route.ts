// src/app/api/resumes/[id]/route.ts
// Single Resume Operations API (Day 2 Part 3)

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const resume = await prisma.resume.findFirst({
      where: { id, userId: session.userId },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    return NextResponse.json({ resume });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to load resume." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.resume.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Resume not found or access denied." }, { status: 404 });
    }

    const body = await req.json();
    const { title, targetRole, templateId, structuredData, styleData, contentHash, atsScore, feedback, isDefault } = body;

    const updated = await prisma.resume.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        targetRole: targetRole !== undefined ? targetRole : existing.targetRole,
        templateId: templateId !== undefined ? templateId : existing.templateId,
        structuredData: structuredData !== undefined ? (typeof structuredData === "string" ? structuredData : JSON.stringify(structuredData)) : existing.structuredData,
        styleData: styleData !== undefined ? (typeof styleData === "string" ? styleData : JSON.stringify(styleData)) : existing.styleData,
        contentHash: contentHash !== undefined ? contentHash : existing.contentHash,
        atsScore: atsScore !== undefined ? atsScore : existing.atsScore,
        feedback: feedback !== undefined ? (typeof feedback === "string" ? feedback : JSON.stringify(feedback)) : existing.feedback,
        isDefault: isDefault !== undefined ? isDefault : existing.isDefault,
      },
    });

    return NextResponse.json({ resume: updated });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to update resume." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.resume.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Resume not found or access denied." }, { status: 404 });
    }

    await prisma.resume.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Resume deleted." });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to delete resume." },
      { status: 500 }
    );
  }
}
