"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#7A0F1F]/95 shadow-md shadow-black/10">
      <div className="page-container flex h-20 items-center justify-between">
        <div className="inline-flex items-center rounded-xl px-3 py-2">
          <Link
            href="/"
            aria-label="CareerEdge home"
            className="group inline-flex items-center gap-2"
          >
            <Image
              src="/assets/logos/company-logo.webp"
              alt=""
              width={44}
              height={44}
              priority
              className="h-10 w-10 shrink-0 object-contain"
            />

            <div className="flex flex-col justify-center gap-1">
              <Image
                src="/assets/logos/company-name-logo.webp"
                alt="Company name"
                width={180}
                height={42}
                priority
                className="block h-9 w-auto object-contain object-left"
              />

              <span className="text-[11px] font-medium leading-none tracking-wide text-white/75">
                CareerEdge
              </span>
            </div>
          </Link>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
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

        <div className="hidden items-center gap-5 md:flex">
          <Link
            href="/login"
            className="text-sm font-semibold text-white transition hover:text-gold"
          >
            Log in
          </Link>

          <Link href="/signup">
            <Button size="md">Get Started</Button>
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
        <nav className="border-t border-white/10 bg-[#7A0F1F] px-6 py-5 md:hidden">
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
                className="border-2 border-amber-300 bg-amber-300 font-bold text-[#7A0F1F] hover:bg-amber-200"
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
