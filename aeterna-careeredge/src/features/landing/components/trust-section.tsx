import {
  ShieldCheck,
  UserCheck,
  FileCheck2,
  LockKeyhole,
  CheckCircle2,
} from "lucide-react";

const principles = [
  {
    icon: UserCheck,
    title: "You stay in control",
    description:
      "AI suggestions are a starting point. You review, edit and approve your documents before using them.",
  },
  {
    icon: FileCheck2,
    title: "Your story stays truthful",
    description:
      "CareerEdge is designed to help present your real education, skills and experience — not invent achievements.",
  },
  {
    icon: LockKeyhole,
    title: "Guidance on your terms",
    description:
      "Counsellor contact is optional. You decide whether you want additional human guidance.",
  },
];

export function TrustSection() {
  return (
    <section id="about" className="bg-background py-20 sm:py-24 scroll-mt-24">
      <div className="page-container">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-soft text-primary">
              <ShieldCheck size={29} />
            </div>

            <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Responsible AI, always
            </p>

            <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Your future deserves a human touch.
            </h2>

            <p className="mt-5 text-base leading-7 text-secondary-text">
              Technology can make preparation easier, but your experiences,
              decisions and ambitions remain at the centre of your career
              journey.
            </p>

            <div className="mt-7 flex items-center gap-3 rounded-xl border border-border bg-white p-4">
              <CheckCircle2 className="shrink-0 text-success" size={21} />
              <p className="text-sm font-semibold text-foreground">
                Your profile. Your decisions. Your future.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {principles.map((principle, index) => {
              const Icon = principle.icon;

              return (
                <article
                  key={principle.title}
                  className="flex gap-5 rounded-2xl border border-border bg-white p-6 transition hover:shadow-md sm:p-7"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-background text-primary shadow-sm border border-gold">
                    <Icon size={23} />
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-primary/50">
                        0{index + 1}
                      </span>
                      <h3 className="font-heading text-base font-bold text-foreground sm:text-lg">
                        {principle.title}
                      </h3>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-secondary-text">
                      {principle.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
