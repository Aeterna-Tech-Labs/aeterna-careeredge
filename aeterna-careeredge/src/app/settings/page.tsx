// src/app/settings/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { StudentLayout } from "@/components/layouts/student-layout";
import { Settings, User } from "lucide-react";
import Link from "next/link";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: { profile: true },
  });

  if (!user) redirect("/login");

  return (
    <StudentLayout userName={user.name}>
      <div className="min-h-screen bg-[#FFF8F0]/40 p-6 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7A0F1F]">
            <Settings size={16} />
            <span>Account & Preferences</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>

          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6 shadow-xs">
            <h2 className="text-sm font-bold text-gray-900 border-b border-stone-100 pb-3 flex items-center gap-2">
              <User size={16} className="text-[#7A0F1F]" />
              <span>Student Profile Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
                <span className="text-stone-400 font-medium">Full Name</span>
                <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
                <span className="text-stone-400 font-medium">Email Address</span>
                <p className="font-semibold text-gray-900 text-sm">{user.email}</p>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
                <span className="text-stone-400 font-medium">Academic Domain</span>
                <p className="font-semibold text-gray-900 text-sm">
                  {user.profile?.academicDomain || "Multi-Domain"}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
                <span className="text-stone-400 font-medium">Target Professional Role</span>
                <p className="font-semibold text-gray-900 text-sm">
                  {user.profile?.preferredJobRole || "Not specified"}
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Link
                href="/onboarding?from=dashboard"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#7A0F1F] px-4 py-2 text-xs font-bold text-white hover:bg-[#600C18] transition"
              >
                Update Profile & Academic Info
              </Link>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
