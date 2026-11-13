"use client";

import Image from "next/image";
import { Globe2 } from "lucide-react";
import { motion, type Variants } from "motion/react";

const destinations = [
  {
    name: "United Kingdom",
    flag: "🇬🇧",
    image: "/assets/images/destinations/uk.webp",
  },
  {
    name: "Canada",
    flag: "🇨🇦",
    image: "/assets/images/destinations/canada.webp",
  },
  {
    name: "Germany",
    flag: "🇩🇪",
    image: "/assets/images/destinations/germany.webp",
  },
  {
    name: "United States",
    flag: "🇺🇸",
    image: "/assets/images/destinations/usa.webp",
  },
  {
    name: "Australia",
    flag: "🇦🇺",
    image: "/assets/images/destinations/australia.webp",
  },
  {
    name: "Ireland",
    flag: "🇮🇪",
    image: "/assets/images/destinations/ireland.webp",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function DestinationsSection() {
  return (
    <section className="overflow-hidden bg-white py-20 sm:py-24">
      <div className="page-container">
        <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Think beyond borders
            </p>

            <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Your ambitions can take you places.
            </h2>

            <p className="mt-4 text-base leading-7 text-secondary-text">
              Explore destinations and discover opportunities around the world.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Globe2 size={19} />
            <span>Explore global possibilities</span>
          </div>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {destinations.map((destination) => (
            <motion.article
              key={destination.name}
              variants={item}
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="group relative h-[180px] overflow-hidden rounded-3xl bg-primary-dark shadow-md ring-1 ring-black/5 hover:shadow-2xl sm:h-[340px]"
            >
              <Image
                src={destination.image}
                alt={`Scenic view of ${destination.name}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-2xl backdrop-blur-md ring-1 ring-white/30">
                    {destination.flag}
                  </span>
                  <h3 className="font-heading text-xl font-bold text-white sm:text-2xl">
                    {destination.name}
                  </h3>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-12 rounded-3xl border border-border bg-background p-6 sm:p-8"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-soft text-primary">
              <Globe2 size={22} />
            </div>

            <div>
              <h3 className="font-heading text-base font-bold text-foreground sm:text-lg">
                Your career journey doesn&apos;t depend on a destination.
              </h3>
              <p className="mt-1 text-sm leading-6 text-secondary-text">
                Build your resume, discover careers and prepare for
                opportunities wherever you choose to go.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
