import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, BadgeCheck, Network, ShieldCheck } from "lucide-react";
import { BrandLogo } from "../common/BrandLogo";

interface AuthLayoutProps {
  children: ReactNode;
  activeTab: "signup" | "login";
  backHref?: string;
  backLabel?: string;
}

const highlights = [
  {
    icon: BadgeCheck,
    title: "AI Resume & SOP calibrated for VTU",
    description:
      "Tailored grading algorithms benchmarked against Karnataka autonomous universities & tier-1 criteria.",
  },
  {
    icon: Network,
    title: "Bangalore Tech & Global Academics",
    description:
      "Direct access to 420+ vetted GCCs, IT parks in Whitefield/ORR, and prestigious overseas institutions.",
  },
  {
    icon: ShieldCheck,
    title: "100% Student-Controlled Privacy",
    description:
      "Zero spam, zero data selling. Recruiter profile unlocking strictly on your explicit consent.",
  },
];

export default function AuthLayout({
  children,
  activeTab,
  backHref = "/",
  backLabel = "Back to Home",
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-[#FFF8F6] lg:grid lg:grid-cols-[40%_60%]">
      {/* Left branding panel */}
      <aside className="relative isolate hidden min-h-screen flex-col overflow-hidden bg-[#7A0F1F] px-10 py-12 text-white lg:flex xl:px-[60px] xl:py-[60px]">
        {/* Background image */}
        <Image
          src="/assets/images/auth/auth-bg.webp"
          alt=""
          aria-hidden="true"
          fill
          sizes="(min-width: 1024px) 40vw, 0px"
          className="-z-20 object-cover"
        />

        {/* Maroon tint: lower the numbers to show more of the image */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[#7A0F1F]/80 via-[#7A0F1F]/85 to-[#5D0B18]/92"
        />

        {/* Brand */}
        <div className="relative z-10">
          <BrandLogo tone="dark" />
        </div>

        {/* Main content */}
        <div className="relative z-10 mt-16 max-w-xl">
          <div className="inline-flex items-center gap-2.5 rounded-full bg-[#5D0B18] px-4 py-1.5 text-xs font-medium text-[#FFE5A8]">
            <span className="h-2 w-2 rounded-full bg-[#F2B63D]" />
            Admissions &amp; Placement Cohort 2025–26
          </div>

          <h1 className="mt-4 text-5xl font-extrabold leading-[1.1] tracking-tight xl:text-6xl">
            Your career,
            <span className="block">
              <span className="relative inline-block text-[#FFD78A]">
                one profile away.
                {/* Wavy underline */}
                <svg
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-2.5 h-2.5 w-full opacity-50"
                >
                  <defs>
                    <pattern
                      id="auth-squiggle"
                      width="14"
                      height="10"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M0 5 Q3.5 0 7 5 T14 5"
                        fill="none"
                        stroke="#F2B63D"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#auth-squiggle)" />
                </svg>
              </span>
            </span>
          </h1>

          <p className="mt-7 max-w-lg text-base leading-relaxed text-[#F5D9D9]">
            The ethical, verifiable digital career identity designed
            specifically for students across VTU, autonomous institutions, and
            colleges across Karnataka.
          </p>

          {/* Highlights */}
          <div className="mt-[72px] space-y-6">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="flex gap-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#5D0B18]/90 text-[#F2B63D]">
                    <Icon size={20} aria-hidden="true" />
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold leading-6 tracking-tight text-white">
                      {item.title}
                    </h2>
                    <p className="mt-1 max-w-md text-sm leading-[22px] text-[#EAC2C5]">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Right authentication panel */}
      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-8 lg:px-10 xl:px-14">
        {/* Mobile brand */}
        <div className="mb-7 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#7A0F1F] text-lg font-bold text-white">
              A
            </div>
            <div>
              <p className="text-lg font-extrabold text-[#7A0F1F]">AETERNA</p>
              <p className="text-[10px] font-bold tracking-wider text-[#A34A57]">
                CAREEREDGE KARNATAKA
              </p>
            </div>
          </Link>
        </div>

        {/* Main form area */}
        <div className="mx-auto flex w-full max-w-[620px] flex-1 flex-col justify-center py-8">
          {/* Back button */}
          <div className="mb-5">
            <Link
              href={backHref}
              className="group inline-flex items-center gap-2 rounded-xl border border-[#EBDDD1] bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#765F5D] shadow-xs transition hover:border-[#7A0F1F]/40 hover:bg-[#FDF7F5] hover:text-[#7A0F1F]"
            >
              <ArrowLeft
                size={16}
                className="transition-transform group-hover:-translate-x-1 text-[#9A8580] group-hover:text-[#7A0F1F]"
              />
              <span>{backLabel}</span>
            </Link>
          </div>

          {/* Signup / Login navigation */}
          <div className="mb-7 grid grid-cols-2 rounded-2xl bg-[#FCE9E8] p-1.5">
            <Link
              href="/signup"
              className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-base font-semibold transition-colors ${
                activeTab === "signup"
                  ? "bg-white text-[#570B15] shadow-sm"
                  : "text-[#765F5D] hover:text-[#570B15]"
              }`}
            >
              Sign Up
            </Link>

            <Link
              href="/login"
              className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-base font-semibold transition-colors ${
                activeTab === "login"
                  ? "bg-white text-[#570B15] shadow-sm"
                  : "text-[#765F5D] hover:text-[#570B15]"
              }`}
            >
              Login
            </Link>
          </div>

          {children}
        </div>
      </section>
    </main>
  );
}
