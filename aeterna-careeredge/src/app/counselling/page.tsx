// src/app/counselling/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ComingSoonPage } from "@/components/ui/coming-soon-page";
import { FEATURE_REGISTRY } from "@/config/features";

export default async function CounsellingPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const feature = FEATURE_REGISTRY["career-counselling"];

  return <ComingSoonPage studentName={session.name || "Student"} feature={feature} />;
}
