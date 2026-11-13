"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "About", href: "/#about" },
];

export function MarketingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="page-container flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white">
            A
          </div>
          <div>
            <p className="font-heading text-lg font-bold text-foreground">
              Aeterna
            </p>
            <p className="text-xs text-secondary-text">CareerEdge</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-secondary-text transition hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="text-sm font-semibold text-primary transition hover:text-primary-dark"
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
          className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-surface-muted md:hidden"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <nav className="border-t border-border bg-surface px-6 py-5 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-secondary-text hover:text-primary"
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
              <Button fullWidth>Get Started</Button>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
