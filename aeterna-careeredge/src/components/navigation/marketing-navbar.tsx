"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Libre_Baskerville } from "next/font/google";

const brandFont = Libre_Baskerville({
  subsets: ["latin"],
  weight: "700",
});

const links = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "About", href: "/#about" },
];

export function MarketingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState("/");

  useEffect(() => {
    const updateActiveLink = () => {
      const sectionLinks = links.filter((link) => link.href.includes("#"));

      const activeSection = sectionLinks
        .map((link) => ({
          href: link.href,
          top: document
            .querySelector(link.href.slice(1))
            ?.getBoundingClientRect().top,
        }))
        .filter((section) => section.top !== undefined && section.top <= 120)
        .at(-1);

      setActiveHref(activeSection?.href ?? "/");
    };

    updateActiveLink();
    window.addEventListener("scroll", updateActiveLink, { passive: true });
    window.addEventListener("hashchange", updateActiveLink);

    return () => {
      window.removeEventListener("scroll", updateActiveLink);
      window.removeEventListener("hashchange", updateActiveLink);
    };
  }, []);

  const navLinkClass = (href: string) =>
    `text-sm transition-colors hover:text-gold ${
      activeHref === href
        ? "font-bold text-gold underline underline-offset-8"
        : "font-medium text-white/85"
    }`;

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-[#5C0914]/95 via-[#7A0F1F]/95 to-[#9A1B2E]/95 shadow-lg shadow-black/20 backdrop-blur-md">
      {/* Soft gold glow, top right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(246,181,28,0.18),transparent_55%)]"
      />

      {/* Gold line that fades out at both ends (replaces border-b) */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent"
      />

      <div className="page-container flex h-20 items-center justify-between gap-5">
        <Link
          href="/"
          aria-label="CareerEdge home"
          className="group inline-flex shrink-0 items-center gap-2"
        >
          <Image
            src="/assets/logos/company-logo.webp"
            alt=""
            width="60"
            height="60"
            priority
            className="h-10 w-10 shrink-0 object-contain"
          />
          <div className="flex min-w-0 flex-col justify-center">
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

        <nav className="hidden flex-1 items-center justify-center gap-7 md:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={navLinkClass(link.href)}
              aria-current={activeHref === link.href ? "location" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-6 md:flex">
          <Link
            href="/login"
            className="rounded-md text-sm font-semibold text-white/90 transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-primary-dark"
          >
            Log in
          </Link>

          <Link
            href="/signup"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-primary-dark shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold-soft hover:shadow-md active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-primary-dark"
          >
            Get Started
            <ArrowRight
              size={16}
              aria-hidden="true"
              className="transition-transform duration-200 motion-reduce:transition-none group-hover:translate-x-1 group-focus-visible:translate-x-1"
            />
          </Link>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition hover:bg-white/10 md:hidden"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <nav className="border-t border-gold/20 bg-gradient-to-b from-[#7A0F1F] to-[#5C0914] px-6 py-5 md:hidden">
          <div className="flex flex-col gap-5">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={navLinkClass(link.href)}
                aria-current={activeHref === link.href ? "location" : undefined}
              >
                {link.label}
              </Link>
            ))}

            <Link href="/login" onClick={() => setMenuOpen(false)}>
              <Button variant="outline" fullWidth>
                Log in
              </Button>
            </Link>

            <Link href="/signup" onClick={() => setMenuOpen(false)}>
              <Button
                className="border-2 border-border-strong font-bold text-[#7A0F1F] hover:bg-amber-200"
                fullWidth
              >
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
