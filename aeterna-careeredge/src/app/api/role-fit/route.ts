// src/app/api/role-fit/route.ts
// Evaluate student role fit against occupational standards

import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { evaluateRoleFit } from "@/lib/readiness/service";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const profession = searchParams.get("profession") || "TECH";

    const result = await evaluateRoleFit(session.userId, profession);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error evaluating role fit:", error);
    return NextResponse.json(
      { error: "Failed to evaluate role fit" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const profession = body.profession || "TECH";

    const result = await evaluateRoleFit(session.userId, profession);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error evaluating role fit:", error);
    return NextResponse.json(
      { error: "Failed to evaluate role fit" },
      { status: 500 }
    );
  }
}
