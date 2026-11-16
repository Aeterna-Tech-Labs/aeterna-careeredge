"use client";

// src/app/dashboard/dashboard-client.tsx
// Client-side dashboard shell — receives user data from server component

import { useRouter } from "next/navigation";
import { StudentLayout } from "@/components/layouts/student-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BriefcaseBusiness, FileText, Target, TrendingUp, LogOut } from "lucide-react";

interface DashboardUser {
  id: string;
  name: string;
  email: string;
  profile: {
    academicDomain: string | null;
    specialization: string | null;
    educationLevel: string | null;
    institution: string | null;
    course: string | null;
    gradingType: string | null;
    gradeValue: string | null;
    careerInterests: string | null;
    preferredJobRole: string | null;
    targetIndustry: string | null;
    passportScore: number | null;
  } | null;
}

interface DashboardClientProps {
  user: DashboardUser;
}

export function DashboardClient({ user }: DashboardClientProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const firstName = user.name.split(" ")[0];
  const careerInterests = user.profile?.careerInterests
    ? (JSON.parse(user.profile.careerInterests) as string[])
    : [];

  const score = user.profile?.passportScore || (user.profile ? 75 : 10);

  const stats = [
    {
      title: "Profile Completion",
      value: `${score}%`,
      icon: Target,
      description: "Complete your Career Passport",
    },
    {
      title: "Applications",
      value: "0",
      icon: BriefcaseBusiness,
      description: "Jobs you're tracking",
    },
    {
      title: "Resume Score",
      value: "—",
      icon: FileText,
      description: "Build your resume to get a score",
    },
    {
      title: "Career Readiness",
      value: user.profile ? `${Math.round(score * 0.7)}%` : "5%",
      icon: TrendingUp,
      description: "Based on your verified profile",
    },
  ];

  return (
    <StudentLayout
      title={`Welcome back, ${firstName}!`}
      description="Here's your career progress overview."
      onLogout={handleLogout}
    >
      <div className="space-y-8">
        {/* Stats grid */}
        <section>
          <div className="mb-5">
            <h2 className="font-heading text-lg font-bold text-foreground">
              Your Overview
            </h2>
            <p className="mt-1 text-sm text-secondary-text">
              Keep track of your career development journey.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-secondary-text">
                        {stat.title}
                      </p>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-soft text-primary">
                        <Icon size={20} />
                      </div>
                    </div>

                    <p className="mt-4 font-heading text-3xl font-bold text-foreground">
                      {stat.value}
                    </p>

                    <p className="mt-2 text-xs text-secondary-text">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Profile & Status */}
        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Career Passport</CardTitle>
              <p className="text-sm text-secondary-text">
                Your profile completion progress.
              </p>
            </CardHeader>

            <CardContent>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Profile completion
                </span>
                <span className="text-sm font-bold text-primary">
                  {score}%
                </span>
              </div>

              <Progress value={score} />

              <div className="mt-4 space-y-2 text-sm text-secondary-text">
                {user.profile?.academicDomain && (
                  <p>
                    <span className="font-medium text-foreground">
                      Academic Domain:{" "}
                    </span>
                    <span className="font-semibold text-primary">{user.profile.academicDomain}</span>
                  </p>
                )}
                {user.profile?.institution && (
                  <p>
                    <span className="font-medium text-foreground">
                      Institution:{" "}
                    </span>
                    {user.profile.institution}
                  </p>
                )}
                {user.profile?.course && (
                  <p>
                    <span className="font-medium text-foreground">Course &amp; Degree: </span>
                    {user.profile.course}
                    {user.profile.specialization && ` (${user.profile.specialization})`}
                  </p>
                )}
                {user.profile?.gradeValue && (
                  <p>
                    <span className="font-medium text-foreground">Performance: </span>
                    {user.profile.gradeValue} {user.profile.gradingType && `(${user.profile.gradingType})`}
                  </p>
                )}
                {user.profile?.preferredJobRole && (
                  <p>
                    <span className="font-medium text-foreground">
                      Target Role:{" "}
                    </span>
                    {user.profile.preferredJobRole}
                    {user.profile.targetIndustry && ` • ${user.profile.targetIndustry}`}
                  </p>
                )}
              </div>

              {careerInterests.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {careerInterests.map((interest) => (
                    <span
                      key={interest}
                      className="rounded-full bg-gold-soft px-2.5 py-1 text-xs font-medium text-primary"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Career Status</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <Badge variant="success" dot>
                Profile active
              </Badge>

              <div>
                <p className="text-sm font-semibold text-foreground">
                  Your next step
                </p>
                <p className="mt-1 text-sm text-secondary-text">
                  Build your resume and explore career opportunities tailored to
                  your profile.
                </p>
              </div>

              {/* Logout */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="mt-4 flex w-full items-center gap-2"
              >
                <LogOut size={14} />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </StudentLayout>
  );
}
