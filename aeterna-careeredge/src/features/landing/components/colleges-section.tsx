import {
  GraduationCap,
  Users,
  ClipboardCheck,
  BrainCircuit,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

const benefits = [
  {
    icon: Users,
    title: "Student career readiness",
    description:
      "Give students a structured space to organise their skills, education and career goals.",
  },
  {
    icon: ClipboardCheck,
    title: "Career Passport",
    description:
      "Help students build a professional profile they can develop throughout their academic journey.",
  },
  {
    icon: BrainCircuit,
    title: "AI-powered preparation",
    description:
      "Introduce students to resume building, profile preparation and career discovery tools.",
  },
  {
    icon: MessageCircle,
    title: "Guided support",
    description:
      "Create opportunities for students to seek additional career guidance when they need it.",
  },
];

export function CollegesSection() {
  return (
    <section className="overflow-hidden bg-primary-dark py-20 text-white sm:py-24">
      <div className="page-container">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-gold">
              <GraduationCap size={29} />
            </div>

            <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-gold">
              For colleges and institutions
            </p>

            <h2 className="mt-4 max-w-xl font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Help your students become career-ready.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-white/75">
              CareerEdge brings career preparation, employability tools and
              structured student profiles together in one platform. Support
              students as they prepare for their next step.
            </p>

            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-3 rounded-lg bg-gold px-6 py-3.5 text-sm font-bold text-primary-dark transition hover:bg-white"
            >
              Explore College Solutions
              <ArrowRight size={17} />
            </Link>

            <p className="mt-4 text-xs text-white/55">
              Interested in exploring CareerEdge for your institution?
            </p>
          </div>

          <div className="relative">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />

            <div className="relative rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
              <div className="flex items-center gap-3 border-b border-white/10 pb-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold text-primary-dark">
                  <GraduationCap size={22} />
                </div>

                <div>
                  <p className="font-heading font-bold">
                    Career readiness framework
                  </p>
                  <p className="mt-1 text-xs text-white/55">
                    A structured student journey
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;

                  return (
                    <div key={benefit.title} className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-gold">
                        <Icon size={20} />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-gold" />
                          <h3 className="text-sm font-semibold">
                            {benefit.title}
                          </h3>
                        </div>

                        <p className="mt-1 text-xs leading-5 text-white/60">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-7 rounded-xl border border-gold/20 bg-gold/10 p-4">
                <p className="text-xs font-semibold text-gold">
                  A more connected student journey
                </p>
                <p className="mt-1 text-xs leading-5 text-white/70">
                  From understanding career interests to preparing for
                  opportunities, help students take meaningful next steps.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
