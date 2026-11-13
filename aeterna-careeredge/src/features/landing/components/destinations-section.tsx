import Image from "next/image";
import { ArrowUpRight, Globe2 } from "lucide-react";

const destinations = [
  {
    name: "United Kingdom",
    code: "UK",
    image: "/assets/images/destinations/uk.webp",
    description: "Explore universities and career opportunities.",
  },
  {
    name: "Canada",
    code: "CA",
    image: "/assets/images/destinations/canada.webp",
    description: "Discover education and professional pathways.",
  },
  {
    name: "Germany",
    code: "DE",
    image: "/assets/images/destinations/germany.webp",
    description: "Explore academic and industry opportunities.",
  },
  {
    name: "United States",
    code: "US",
    image: "/assets/images/destinations/usa.webp",
    description: "Explore a wide range of study options.",
  },
  {
    name: "Australia",
    code: "AU",
    image: "/assets/images/destinations/australia.webp",
    description: "Discover study and career possibilities.",
  },
  {
    name: "Ireland",
    code: "IE",
    image: "/assets/images/destinations/ireland.webp",
    description: "Explore education and future pathways.",
  },
];

export function DestinationsSection() {
  return (
    <section className="overflow-hidden bg-white py-20 sm:py-24">
      <div className="page-container">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Think beyond borders
            </p>

            <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Your ambitions can take you places.
            </h2>

            <p className="mt-5 text-base leading-7 text-secondary-text">
              Exploring international education? Discover destinations and start
              preparing for the opportunities ahead.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Globe2 size={19} />
            <span>Explore global possibilities</span>
          </div>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination) => (
            <article
              key={destination.code}
              className="group relative isolate min-h-[260px] overflow-hidden rounded-2xl bg-primary-dark"
            >
              <Image
                src={destination.image}
                alt={`Scenic view of ${destination.name}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/5" />

              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                      {destination.code}
                    </p>
                    <h3 className="mt-2 font-heading text-2xl font-bold">
                      {destination.name}
                    </h3>
                    <p className="mt-2 max-w-xs text-sm leading-5 text-white/80">
                      {destination.description}
                    </p>
                  </div>

                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/10 transition group-hover:bg-gold group-hover:text-primary-dark">
                    <ArrowUpRight size={19} />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-background p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-soft text-primary">
              <Globe2 size={21} />
            </div>

            <div>
              <h3 className="font-heading text-base font-bold text-foreground">
                Your career journey doesn't depend on a destination.
              </h3>
              <p className="mt-1 text-sm leading-6 text-secondary-text">
                Resume building, career discovery, LinkedIn preparation and
                employability tools are available independently of your decision
                to study abroad.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
