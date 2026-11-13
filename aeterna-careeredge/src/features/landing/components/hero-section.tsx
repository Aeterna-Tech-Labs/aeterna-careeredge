import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="page-container grid min-h-[650px] items-center gap-12 py-16 lg:grid-cols-2 lg:py-20">
        {/* Hero content */}
        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-primary">
            <span className="h-2 w-2 rounded-full bg-gold" />
            Your future starts here
          </div>

          <h1 className="max-w-2xl font-heading text-4xl font-extrabold leading-[1.15] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Build your career.
            <span className="mt-1 block text-primary">Study abroad.</span>
            <span className="mt-1 block">Get hired.</span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-8 text-secondary-text sm:text-lg">
            One profile. AI-powered resume, SOP, LinkedIn and career roadmap —
            made for students across India.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" fullWidth>
                Take Free Career Assessment
                <ArrowRight size={18} />
              </Button>
            </Link>

            <Link href="#how-it-works">
              <Button variant="outline" size="lg" fullWidth>
                See how it works
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-4">
            <div className="flex items-center gap-2 text-sm text-secondary-text">
              <CheckCircle2 size={17} className="text-success" />
              Free to start
            </div>

            <div className="flex items-center gap-2 text-sm text-secondary-text">
              <ShieldCheck size={17} className="text-success" />
              Your data stays private
            </div>

            <div className="flex items-center gap-2 text-sm text-secondary-text">
              <MapPin size={17} className="text-primary" />
              Bengaluru · Mysuru · Belagavi
            </div>
          </div>
        </div>

        {/* Hero visual */}
        <div className="relative mx-auto w-full max-w-xl">
          {/* Subtle architectural backdrop */}
          <div className="absolute -right-8 -top-8 h-64 w-64 rounded-full bg-gold-soft/70 blur-3xl" />

          <div className="relative overflow-hidden rounded-3xl border border-border bg-white p-3 shadow-xl">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src="/assets/images/hero-students.webp"
                alt="Indian college students collaborating on their career goals"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/50 via-transparent to-transparent" />

              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="font-heading text-xl font-bold">
                  Your Career. Your Future.
                </p>
                <p className="mt-1 text-sm text-white/85">
                  One Passport. Many Possibilities.
                </p>
              </div>
            </div>

            {/* Product preview strip */}
            <div className="grid grid-cols-3 gap-2 p-3">
              <div className="rounded-xl bg-surface-muted p-3">
                <p className="text-[10px] font-medium text-secondary-text">
                  CAREER
                </p>
                <p className="mt-1 text-xs font-bold text-primary">Passport</p>
              </div>

              <div className="rounded-xl bg-surface-muted p-3">
                <p className="text-[10px] font-medium text-secondary-text">
                  AI
                </p>
                <p className="mt-1 text-xs font-bold text-primary">Resume</p>
              </div>

              <div className="rounded-xl bg-surface-muted p-3">
                <p className="text-[10px] font-medium text-secondary-text">
                  CAREER
                </p>
                <p className="mt-1 text-xs font-bold text-primary">Roadmap</p>
              </div>
            </div>
          </div>

          {/* Decorative Karnataka-inspired accent */}
          <div className="absolute -bottom-5 -left-5 -z-10 h-28 w-28 rounded-2xl border-2 border-gold/60" />
        </div>
      </div>
    </section>
  );
}
