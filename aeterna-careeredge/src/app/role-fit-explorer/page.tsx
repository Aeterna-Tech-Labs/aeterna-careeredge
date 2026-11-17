// src/app/role-fit-explorer/page.tsx
// Role Fit Explorer based on Official Occupational Standards

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { RoleFitClient } from "./role-fit-client";

export default async function RoleFitExplorerPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return <RoleFitClient studentName={session.name || "Student"} />;
}
