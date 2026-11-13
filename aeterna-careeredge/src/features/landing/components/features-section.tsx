import {
  FileText,
  BookOpen,
  Network,
  Compass,
  BriefcaseBusiness,
  ClipboardList,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

const features = [
  {
    number: "01",
    title: "AI Resume Builder",
    description:
      "Create a professional resume that highlights your education, skills and experience.",
    icon: FileText,
    className: "lg:col-span-2",
    preview: "resume",
  },
  {
    number: "02",
    title: "SOP & Personal Statement",
    description:
      "Organise your academic journey and communicate your goals with clarity.",
    icon: BookOpen,
    className: "",
    preview: "sop",
  },
  {
    number: "03",
    title: "LinkedIn Profile Builder",
    description:
      "Build a professional presence with a stronger headline, summary and skills.",
    icon: Network,
    className: "",
    preview: "linkedin",
  },
  {
    number: "04",
    title: "Career Discovery",
    description:
      "Explore career paths that connect your interests, education and strengths.",
    icon: Compass,
    className: "",
    preview: "career",
  },
  {
    number: "05",
    title: "Job Match & Interview Coach",
    description:
      "Prepare for opportunities and practise presenting your skills confidently.",
    icon: BriefcaseBusiness,
    className: "lg:col-span-2",
    preview: "jobs",
  },
  {
    number: "06",
    title: "Application Tracker",
    description:
      "Keep your applications organised and follow your progress in one place.",
    icon: ClipboardList,
    className: "lg:col-span-3",
    preview: "tracker",
  },
];

function FeaturePreview({ type }: { type: string }) {
  if (type === "resume") {
    return (
      <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <div className="h-3 w-28 rounded bg-primary/80" />
            <div className="mt-2 h-2 w-20 rounded bg-border" />
          </div>
          <FileText size={25} className="text-primary" />
        </div>
        <div className="mt-4 space-y-3">
          <div className="h-2 w-2/3 rounded bg-border" />
          <div className="h-2 w-full rounded bg-border" />
          <div className="h-2 w-5/6 rounded bg-border" />
          <div className="mt-4 h-2 w-1/3 rounded bg-gold" />
          <div className="h-2 w-full rounded bg-border" />
          <div className="h-2 w-4/5 rounded bg-border" />
        </div>
      </div>
    );
  }

  if (type === "sop") {
    return (
      <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-primary">
          <BookOpen size={20} />
          <span className="text-xs font-semibold">Personal Statement</span>
        </div>
        <div className="mt-4 space-y-3">
          <div className="h-2 w-3/4 rounded bg-border" />
          <div className="h-2 w-full rounded bg-border" />
          <div className="h-2 w-5/6 rounded bg-border" />
          <div className="rounded-lg bg-gold-soft p-3 text-xs text-primary">
            <Sparkles size={14} className="mb-1" />
            Structure your story with clarity.
          </div>
        </div>
      </div>
    );
  }

  if (type === "linkedin") {
    return (
      <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-soft font-bold text-primary">
            S
          </div>
          <div className="flex-1">
            <div className="h-2.5 w-24 rounded bg-foreground/70" />
            <div className="mt-2 h-2 w-32 rounded bg-border" />
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-surface-muted p-3">
          <p className="text-xs font-semibold text-foreground">About</p>
          <div className="mt-2 h-2 w-full rounded bg-border" />
          <div className="mt-2 h-2 w-4/5 rounded bg-border" />
        </div>
      </div>
    );
  }

  if (type === "career") {
    return (
      <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold text-foreground">
          Explore pathways
        </p>
        <div className="mt-4 space-y-3">
          {["Technology", "Business", "Creative fields"].map((item, index) => (
            <div key={item} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gold-soft" />
              <span className="flex-1 text-xs font-medium text-secondary-text">
                {item}
              </span>
              <ArrowUpRight size={15} className="text-primary" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "jobs") {
    return (
      <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-foreground">
            Opportunity workspace
          </p>
          <BriefcaseBusiness size={19} className="text-primary" />
        </div>
        <div className="mt-4 flex gap-2">
          <div className="flex-1 rounded-lg bg-surface-muted p-3">
            <p className="text-[10px] text-secondary-text">Job matching</p>
            <p className="mt-2 text-xs font-semibold text-primary">
              Explore roles
            </p>
          </div>
          <div className="flex-1 rounded-lg bg-gold-soft p-3">
            <p className="text-[10px] text-secondary-text">
              Interview practice
            </p>
            <p className="mt-2 text-xs font-semibold text-primary">
              Build confidence
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-foreground">
          Application progress
        </p>
        <ClipboardList size={20} className="text-primary" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {["Applied", "In review", "Interview"].map((item, index) => (
          <div key={item} className="rounded-lg bg-surface-muted p-3">
            <div className="h-2 w-10 rounded bg-primary/60" />
            <p className="mt-3 text-[10px] text-secondary-text">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="bg-white py-20 sm:py-24">
      <div className="page-container">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            One Career Passport
          </p>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to move your career forward.
          </h2>
          <p className="mt-5 text-base leading-7 text-secondary-text">
            From building your professional profile to preparing for
            opportunities, bring your career journey together in one place.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.number}
                className={`group rounded-2xl border border-border bg-background p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg ${feature.className}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-soft text-primary">
                    <Icon size={21} />
                  </div>
                  <span className="text-xs font-semibold text-text-muted">
                    {feature.number}
                  </span>
                </div>

                <div className="mt-5">
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-secondary-text">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-6">
                  <FeaturePreview type={feature.preview} />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
