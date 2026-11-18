// src/app/api/resumes/uploaded-documents/route.ts
// Lists authenticated student's uploaded resume documents strictly with ownership filtering.

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const docs = await prisma.storedDocument.findMany({
      where: {
        userId: session.userId,
        category: "RESUME",
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        originalFileName: true,
        mimeType: true,
        fileSizeBytes: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ documents: docs }, { status: 200 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to list documents." },
      { status: 500 }
    );
  }
}
