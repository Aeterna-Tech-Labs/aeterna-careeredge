import Link from "next/link";
import { GraduationCap } from "lucide-react";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/#features" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="page-container py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-gold">
                <GraduationCap size={23} />
              </div>
              <div>
                <p className="font-heading text-lg font-bold text-foreground">
                  Aeterna
                </p>
                <p className="text-xs text-secondary-text">CareerEdge</p>
              </div>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-secondary-text">
              Your Career. Your Future. One Passport. Empowering students to
              discover opportunities and build their professional future.
            </p>
          </div>

          <div>
            <h3 className="font-heading text-sm font-bold text-foreground">
              Explore
            </h3>
            <div className="mt-4 flex flex-col gap-3">
              {footerLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-secondary-text transition hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-heading text-sm font-bold text-foreground">
              Get Started
            </h3>
            <div className="mt-4 flex flex-col gap-3">
              <Link
                href="/login"
                className="text-sm text-secondary-text hover:text-primary"
              >
                Student Login
              </Link>
              <Link
                href="/signup"
                className="text-sm text-secondary-text hover:text-primary"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-secondary-text">
          © {new Date().getFullYear()} Aeterna CareerEdge. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
