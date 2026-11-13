import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Noto_Sans_Kannada } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoKannada = Noto_Sans_Kannada({
  variable: "--font-noto-kannada",
  subsets: ["kannada"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aeterna CareerEdge",
  description:
    "Your Career. Your Future. One Passport. An AI-powered career and employability platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakarta.variable} ${inter.variable} ${notoKannada.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
