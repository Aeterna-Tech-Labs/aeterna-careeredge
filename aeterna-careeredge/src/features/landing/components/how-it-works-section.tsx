import {
  UserRound,
  FileText,
  Route,
  MessageCircle,
  ArrowDown,
  Check,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Create your Career Passport",
    description:
      "Build one profile with your education, interests, skills and career goals. Your journey starts with understanding where you are today.",
    icon: UserRound,
    points: ["Add your education", "Share your interests", "Set your goals"],
  },
  {
    number: "02",
    title: "Build your professional profile",
    description:
      "Use AI-powered tools to prepare your resume, personal statement and LinkedIn profile with guidance along the way.",
    icon: FileText,
    points: [
      "Create your resume",
      "Structure your SOP",
      "Improve your LinkedIn",
    ],
  },
  {
    number: "03",
    title: "Get your career roadmap",
    description:
      "Explore possible career directions, identify areas to improve and understand the next steps towards your goals.",
    icon: Route,
    points: [
      "Explore career paths",
      "Identify skill gaps",
      "Plan your next steps",
    ],
  },
  {
    number: "04",
    title: "Move forward with confidence",
    description:
      "Prepare for job opportunities, practise interviews and connect with a counsellor if you choose.",
    icon: MessageCircle,
    points: [
      "Prepare for interviews",
      "Track applications",
      "Get optional guidance",
    ],
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-background py-20 sm:py-24">
      <div className="page-container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Simple by design
          </p>

          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Your career journey, one step at a time.
          </h2>

          <p className="mt-5 text-base leading-7 text-secondary-text">
            Start with one profile. Build the tools you need. Follow a clearer
            path towards your next opportunity.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <article
                key={step.number}
                className="relative rounded-2xl border border-border bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-soft text-primary">
                    <Icon size={23} />
                  </div>

                  <span className="font-heading text-3xl font-bold text-primary/15">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-6 font-heading text-lg font-bold text-foreground">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-secondary-text">
                  {step.description}
                </p>

                <ul className="mt-5 space-y-3">
                  {step.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-center gap-2 text-xs font-medium text-foreground"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-soft text-primary">
                        <Check size={12} />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>

                {index < steps.length - 1 && (
                  <div className="absolute -bottom-5 left-1/2 z-10 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-white text-primary lg:-right-4 lg:left-auto lg:top-8 lg:translate-x-0">
                    <ArrowDown size={15} className="lg:-rotate-90" />
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-secondary-text">
          You stay in control of your profile and decide when to seek additional
          guidance.
        </p>
      </div>
    </section>
  );
}
