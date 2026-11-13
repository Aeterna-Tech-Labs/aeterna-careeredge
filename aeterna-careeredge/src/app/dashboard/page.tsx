import { StudentLayout } from "@/components/layouts/student-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BriefcaseBusiness, FileText, Target, TrendingUp } from "lucide-react";

const stats = [
  {
    title: "Profile Completion",
    value: "75%",
    icon: Target,
    description: "Complete your Career Passport",
  },
  {
    title: "Applications",
    value: "12",
    icon: BriefcaseBusiness,
    description: "Jobs you're tracking",
  },
  {
    title: "Resume Score",
    value: "82/100",
    icon: FileText,
    description: "Your latest resume score",
  },
  {
    title: "Career Readiness",
    value: "68%",
    icon: TrendingUp,
    description: "Based on your profile",
  },
];

export default function DashboardPage() {
  return (
    <StudentLayout
      title="Dashboard"
      description="Welcome back! Here's your career progress."
    >
      <div className="space-y-8">
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
                <span className="text-sm font-bold text-primary">75%</span>
              </div>

              <Progress value={75} />

              <p className="mt-4 text-sm text-secondary-text">
                Add your skills, education and experience to complete your
                Career Passport.
              </p>
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
                  Improve your resume and explore career opportunities.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </StudentLayout>
  );
}
