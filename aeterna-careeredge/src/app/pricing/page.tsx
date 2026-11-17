// src/app/pricing/page.tsx
// Transparent Value-Based Pricing & Plans

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { PricingClient } from "./pricing-client";

export default async function PricingPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return <PricingClient studentName={session.name || "Student"} />;
}
