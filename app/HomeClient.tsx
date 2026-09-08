"use client";

import { Suspense } from "react";
import nextDynamic from "next/dynamic";
import type { AstroData } from "@/types/astro";
import HeroSection from "@/components/HeroSection";
import StatsBar from "@/components/StatsBar";
import ScheduleAndPricing from "@/components/ScheduleAndPricing";
import CategorySection from "@/components/CategorySection";
import { FloatingCta, PageShell } from "@/components/brand";

const AboutSection = nextDynamic(() => import("@/components/AboutSection"), { ssr: true });
const SponsorSection = nextDynamic(() => import("@/components/SponsorSection"), { ssr: true });
const FAQSection = nextDynamic(() => import("@/components/FAQSection"), { ssr: true });

function SectionFallback() {
  return <div className="py-20 md:py-28" aria-hidden="true" />;
}

export default function HomeClient({ data }: { data: AstroData }) {
  return (
    <PageShell>
      <HeroSection
        eventConfig={data.eventConfig}
        competitionCount={data.competitions.length}
      />
      <StatsBar data={data} />
      <CategorySection competitions={data.competitions} />
      <ScheduleAndPricing timeline={data.timeline} eventConfig={data.eventConfig} />
      <Suspense fallback={<SectionFallback />}>
        <AboutSection competitions={data.competitions} />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <FAQSection faqs={data.faqs} />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <SponsorSection />
      </Suspense>
      <FloatingCta />
    </PageShell>
  );
}
