import Image from "next/image";
import Link from "next/link";
import { Libre_Baskerville } from "next/font/google";

const brandFont = Libre_Baskerville({
  subsets: ["latin"],
  weight: "700",
});

type BrandLogoProps = {
  /** "dark" = for maroon/dark backgrounds, "light" = for white/light backgrounds */
  tone?: "dark" | "light";
  href?: string;
  className?: string;
};

export function BrandLogo({
  tone = "dark",
  href = "/",
  className = "",
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      aria-label="Aeterna CareerEdge home"
      className={`inline-flex shrink-0 items-center gap-2 ${className}`}
    >
      <Image
        src="/assets/logos/company-logo.webp"
        alt=""
        width={60}
        height={60}
        priority
        className="h-10 w-10 shrink-0 object-contain"
      />

      <div className="flex min-w-0 flex-col justify-center">
        <span
          className={`${brandFont.className} ${
            tone === "dark"
              ? "bg-gradient-to-b from-[#FFD83D] via-[#F6B51C] to-[#E58F0C]"
              : "bg-gradient-to-b from-[#B45309] via-[#D97706] to-[#78350F]"
          } bg-clip-text text-lg sm:text-xl font-bold uppercase leading-none tracking-tight text-transparent`}
        >
          Aeterna
        </span>
        <span
          className={`mt-1 text-[9px] sm:text-[10px] font-semibold leading-none tracking-[0.25em] sm:tracking-[0.3em] ${
            tone === "dark" ? "text-white/90" : "text-slate-800"
          }`}
        >
          CareerEdge
        </span>
      </div>
    </Link>
  );
}
