// src/app/counselling/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { StudentLayout } from "@/components/layouts/student-layout";
import { CalendarDays, UserCheck } from "lucide-react";
import Link from "next/link";

export default async function CounsellingPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <StudentLayout userName={session.name || "Student"}>
      <div className="min-h-screen bg-[#FFF8F0]/40 p-6 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-xs text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF9ED] text-[#7A0F1F] border border-[#EBDDD1]">
              <CalendarDays size={28} />
            </div>
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#7A0F1F]/10 text-[#7A0F1F]">
                <UserCheck size={12} />
                1-on-1 Guidance
              </span>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">Career & Placement Counselling</h1>
              <p className="text-xs text-stone-600 max-w-md mx-auto">
                Schedule personal mentorship sessions with domain industry specialists and alumni placement advisors.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-[#7A0F1F] px-4 py-2 text-xs font-bold text-white hover:bg-[#600C18] transition"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
