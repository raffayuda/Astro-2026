import { Suspense } from 'react';
import { db } from '@/src/db';
import { competitions, faqs as faqsTable } from '@/src/db/schema';
import { desc } from 'drizzle-orm';
import dynamic from 'next/dynamic';
import type { AstroData } from '@/types/astro';
import { toIsoString } from '@/lib/date';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import StatsBar from '@/components/StatsBar';
import Footer from '@/components/Footer';
import astroData from '@/data/astro-data.json';

const AboutSection = dynamic(() => import('@/components/AboutSection'), { ssr: true });
const TimelineSection = dynamic(() => import('@/components/TimelineSection'), { ssr: true });
const SponsorSection = dynamic(() => import('@/components/SponsorSection'), { ssr: true });
const FAQSection = dynamic(() => import('@/components/FAQSection'), { ssr: true });

const fallbackData = astroData as AstroData;

function SectionFallback({ className }: { className: string }) {
  return <div className={className} aria-hidden="true" />;
}

export default async function Home() {
  // Try fetching from DB, fallback to JSON
  let dbCompetitions: any[] = [];
  let dbFaqs: any[] = [];

  try {
    dbCompetitions = await db.select().from(competitions);
    dbFaqs = await db.select().from(faqsTable).orderBy(desc(faqsTable.sortOrder));
  } catch {
    // DB not available, use JSON
  }

  const hasDbData = dbCompetitions.length > 0;

  // Transform DB competitions to match Competition type
  const data: AstroData = hasDbData ? {
    ...fallbackData,
    competitions: dbCompetitions.map((c) => ({
      id: c.id,
      title: c.title,
      category: c.category as 'akademik' | 'olahraga' | 'esports',
      tagline: c.tagline || '',
      description: c.description || '',
      fee: c.fee,
      maxSlots: c.maxSlots,
      filledSlots: c.filledSlots,
      scheduleDate: toIsoString(c.scheduleDate),
      location: c.location || '',
      prizes: c.prizes?.length
        ? c.prizes
        : [
            ...(c.prizesFirst ? [{ label: 'Juara 1', value: c.prizesFirst }] : []),
            ...(c.prizesSecond ? [{ label: 'Juara 2', value: c.prizesSecond }] : []),
            ...(c.prizesThird ? [{ label: 'Juara 3', value: c.prizesThird }] : []),
          ],
      rulesSummary: c.rulesSummary || [],
      rulebookUrl: c.rulebookUrl || '',
      registrationUrl: '',
      contactPerson: {
        name: c.contactName || '',
        whatsapp: c.contactWhatsapp || '',
      },
      isFree: c.isFree === '1',
      origin: c.origin || 'internal',
    })),
    faqs: dbFaqs.map((f: any) => ({
      q: f.question,
      a: f.answer,
    })),
  } : fallbackData;

  return (
    <>
      <Navbar />
      <main>
        <HeroSection eventConfig={data.eventConfig} />
        <StatsBar data={data} />
        <Suspense fallback={<SectionFallback className="py-24 md:py-32" />}>
          <AboutSection competitions={data.competitions} />
        </Suspense>
        <Suspense fallback={<SectionFallback className="py-24 md:py-32" />}>
          <TimelineSection timeline={data.timeline} />
        </Suspense>
        <Suspense fallback={<SectionFallback className="py-24 md:py-32" />}>
          <FAQSection faqs={data.faqs} />
        </Suspense>
        <Suspense fallback={<SectionFallback className="py-24 md:py-32" />}>
          <SponsorSection />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
