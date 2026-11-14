import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { Libre_Baskerville } from "next/font/google";

const brandFont = Libre_Baskerville({
  subsets: ["latin"],
  weight: "700",
});

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

const accountLinks = [
  { label: "Student Login", href: "/login" },
  { label: "Create Account", href: "/signup" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use", href: "/terms" },
];

const linkClass =
  "w-fit rounded-sm text-sm text-white/75 transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-primary-dark";
function HoysalaBorder() {
  return (
    <Image
      src={"/assets/images/landing-footer/hoysala-border.svg"}
      alt={""}
      width={40}
      height={5}
      className="w-full h-11"
    />
  );
}

export function MarketingFooter() {
  return (
    <footer className="relative isolate overflow-hidden bg-primary-dark">
      {/* Top border */}
      <div>
        <HoysalaBorder />
      </div>

      <div className="page-container pb-8 pt-14">
        {/* CTA band */}
        <div className="flex flex-col gap-6 rounded-3xl border border-gold/25 bg-white/5 p-6 backdrop-blur-sm sm:p-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 className="font-heading text-xl font-bold text-white sm:text-2xl">
              Ready to build your career?
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/70 sm:text-base">
              Take the free career assessment and get your roadmap in minutes.
            </p>
          </div>

          <Link
            href="/signup"
            className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3 text-sm font-bold text-primary-dark shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold-soft hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-primary-dark active:translate-y-0 active:scale-[0.98]"
          >
            Get Started
            <ArrowRight
              size={16}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
            />
          </Link>
        </div>

        {/* Link columns */}
        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
          <div>
            <Link
              href="/"
              aria-label="Aeterna CareerEdge home"
              className="inline-flex items-center gap-2"
            >
              <Image
                src="/assets/logos/company-logo.webp"
                alt=""
                width={60}
                height={60}
                className="h-10 w-10 shrink-0 object-contain"
              />
              <div className="flex flex-col justify-center">
                <span
                  className={`${brandFont.className} bg-gradient-to-b from-[#FFD83D] via-[#F6B51C] to-[#E58F0C] bg-clip-text text-xl font-bold uppercase leading-none tracking-tight text-transparent`}
                >
                  Aeterna
                </span>
                <span className="mt-1.5 text-[10px] font-medium leading-none tracking-[0.3em] text-white/90">
                  CareerEdge
                </span>
              </div>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-6 text-white/70">
              Your Career. Your Future. One Passport. Empowering students to
              discover opportunities and build their professional future.
            </p>
          </div>

          <nav aria-label="Explore">
            <h3 className="font-heading text-sm font-bold text-gold">
              Explore
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Get started">
            <h3 className="font-heading text-sm font-bold text-gold">
              Get Started
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {accountLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="font-heading text-sm font-bold text-gold">
              Contact
            </h3>
            <ul className="mt-4 flex flex-col gap-3.5 text-sm text-white/75">
              <li className="flex items-start gap-2.5">
                <Mail
                  size={16}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-gold"
                />
                <a
                  href="mailto:info@aeternatechlabs.com"
                  className="transition-colors hover:text-gold"
                >
                  info@aeternatechlabs.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone
                  size={16}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-gold"
                />
                <a
                  href="tel:+919886109955"
                  className="transition-colors hover:text-gold"
                >
                  +91 98861 09955
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin
                  size={16}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-gold"
                />
                <span>Bengaluru · Mysuru · Belagavi</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/60 sm:flex-row">
          <p>
            © {new Date().getFullYear()} Aeterna CareerEdge. All rights
            reserved.
          </p>

          <ul className="flex items-center gap-5">
            {legalLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-gold"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
