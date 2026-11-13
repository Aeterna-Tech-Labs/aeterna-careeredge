import type { ReactNode } from "react";
import { MarketingNavbar } from "@/components/navigation/marketing-navbar";
import { MarketingFooter } from "@/components/navigation/marketing-footer";

interface MarketingLayoutProps {
  children: ReactNode;
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNavbar />

      <main>{children}</main>

      <MarketingFooter />
    </div>
  );
}
