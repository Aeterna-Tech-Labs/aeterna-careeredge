import { MarketingLayout } from "@/components/layouts/marketing-layout";

import { HeroSection } from "@/features/landing/components/hero-section";
import { FeaturesSection } from "@/features/landing/components/features-section";
import { HowItWorksSection } from "@/features/landing/components/how-it-works-section";
import { DestinationsSection } from "@/features/landing/components/destinations-section";
import { SampleOutputSection } from "@/features/landing/components/sample-output-section";
import { TrustSection } from "@/features/landing/components/trust-section";
import { CollegesSection } from "@/features/landing/components/colleges-section";
import { LeadCaptureSection } from "@/features/landing/components/lead-capture-section";
import { FAQSection } from "@/features/landing/components/faq-section";

export default function Home() {
  return (
    <MarketingLayout>
      <HeroSection />
      <DestinationsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SampleOutputSection />
      <TrustSection />
      <CollegesSection />
      <LeadCaptureSection />
      <FAQSection />
    </MarketingLayout>
  );
}
