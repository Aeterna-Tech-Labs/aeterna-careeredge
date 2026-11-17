// src/app/api/jobs/search/route.ts
// Job Search API supporting multi-domain filtering, location, and pagination

import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { jobProvider } from "@/lib/jobs/provider";
import type { EmploymentType, JobDomain } from "@/lib/jobs/types";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || undefined;
    const location = searchParams.get("location") || undefined;
    const domain = (searchParams.get("domain") as JobDomain) || "ALL";
    const employmentType = (searchParams.get("type") as EmploymentType) || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "12", 10);

    const result = await jobProvider.searchJobs({
      query,
      location,
      domain,
      employmentType,
      page,
      pageSize,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error searching jobs:", error);
    return NextResponse.json(
      { error: "Failed to search job listings" },
      { status: 500 }
    );
  }
}
