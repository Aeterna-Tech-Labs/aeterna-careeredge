// src/app/value/page.tsx
// Student Value-Proof & ROI Dashboard

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ValueClient } from "./value-client";

export default async function ValuePage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return <ValueClient studentName={session.name || "Student"} />;
}
