import {
  FileText,
  BookOpen,
  UserRound,
  Compass,
  BriefcaseBusiness,
  ClipboardList,
  ArrowUpRight,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "AI Resume Builder",
    description:
      "Create a professional resume using your education, skills and experience.",
    benefit: "Build your resume",
  },
  {
    icon: BookOpen,
    title: "SOP Writer",
    description:
      "Write a clear personal statement for your university applications.",
    benefit: "Tell your story",
  },
  {
    icon: UserRound,
    title: "LinkedIn Builder",
    description:
      "Create a strong LinkedIn profile that shows who you are and what you can do.",
    benefit: "Build your profile",
  },
  {
    icon: Compass,
    title: "Career Discovery",
    description: "Find career options that match your interests and skills.",
    benefit: "Explore careers",
  },
  {
    icon: BriefcaseBusiness,
    title: "Job & Interview Prep",
    description:
      "Explore job opportunities and practise answering interview questions.",
    benefit: "Prepare for jobs",
  },
  {
    icon: ClipboardList,
    title: "Application Tracker",
    description:
      "Keep track of your job and university applications in one place.",
    benefit: "Stay organised",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-white py-20 sm:py-24">
      <div className="page-container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Everything in one place
          </p>

          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Tools to help you move forward.
          </h2>

          <p className="mt-4 text-base leading-7 text-secondary-text">
            From your first resume to your next opportunity, get the tools you
            need to prepare for your future.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="group rounded-2xl border border-border bg-background p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-soft text-primary">
                    <Icon size={23} />
                  </div>

                  <span className="text-sm font-semibold text-primary/30">
                    0{index + 1}
                  </span>
                </div>

                <h3 className="mt-6 font-heading text-lg font-bold text-foreground">
                  {feature.title}
                </h3>

                <p className="mt-2 min-h-[48px] text-sm leading-6 text-secondary-text">
                  {feature.description}
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary">
                  {feature.benefit}
                  <ArrowUpRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
