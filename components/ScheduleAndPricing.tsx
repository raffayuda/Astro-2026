'use client';

import { motion, useReducedMotion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';

import type { EventConfig, TimelineItem } from '@/types/astro';
import { toDate, formatDateLong } from '@/lib/date';
import {
  BenefitCard,
  CtaButton,
  Pill,
  ScheduleCard,
  SectionHeading,
  SectionShell,
  Surface,
  type ScheduleStatus,
} from '@/components/brand';

const EASE = [0.16, 1, 0.3, 1] as const;

interface Props {
  timeline: TimelineItem[];
  eventConfig: EventConfig;
  /** Absolute URL encoded into the QR code. */
  registerUrl?: string;
}

/** Derive card status from the item's date relative to now. */
function statusFor(item: TimelineItem, index: number, items: TimelineItem[]): ScheduleStatus {
  const date = toDate(item.date);
  if (!date) return 'upcoming';
  const now = Date.now();
  if (date.getTime() < now) {
    // the most recent past item is the one currently in progress
    const laterPast = items.slice(index + 1).some((n) => {
      const d = toDate(n.date);
      return d !== null && d.getTime() < now;
    });
    return laterPast ? 'done' : 'active';
  }
  return 'upcoming';
}

export default function ScheduleAndPricing({
  timeline,
  eventConfig,
  registerUrl = 'https://astro.nurulfikri.ac.id/#competitions',
}: Props) {
  const reduce = useReducedMotion();

  return (
    <SectionShell
      id="timeline"
      sky="soft"
      clouds={false}
      bubbles="none"
      className="py-20 md:py-28"
    >
      <SectionHeading
        eyebrow="Timeline & Biaya"
        title="Jadwal Acara"
        lead="Catat tanggalnya dan siapkan pendaftaranmu. Semua tahapan ASTRO 2026 ada di bawah ini."
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        {/* ─── Schedule ─── */}
        <div className="grid gap-4 sm:grid-cols-2">
          {timeline.map((item, i) => (
            <motion.div
              key={`${item.date}-${item.title}`}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: i * 0.06, duration: 0.45, ease: EASE }}
            >
              <ScheduleCard
                phase={item.title}
                dateLabel={formatDateLong(item.date) || item.date}
                status={statusFor(item, i, timeline)}
              />
            </motion.div>
          ))}
        </div>

        {/* ─── Benefit + pricing ─── */}
        <motion.aside
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex flex-col gap-6 lg:sticky lg:top-24"
        >
          <BenefitCard />

          <Surface pad="lg" radius="xl" className="flex flex-col items-center gap-4 text-center">
            <Pill tone="blue" size="sm">
              Total Hadiah
            </Pill>
            <p className="font-heading text-3xl font-extrabold leading-none text-astro-navy">
              {eventConfig.totalPrizePool}
            </p>

            <div className="rounded-lg bg-white p-3 shadow-soft-sm">
              <QRCodeSVG
                value={registerUrl}
                size={128}
                bgColor="#ffffff"
                fgColor="#1e3a8a"
                level="M"
                aria-label="QR code pendaftaran ASTRO 2026"
              />
            </div>
            <p className="text-10 font-bold uppercase tracking-widest text-muted-foreground">
              Scan untuk daftar
            </p>

            <CtaButton href="#competitions" size="default" className="w-full">
              Daftar Segera
            </CtaButton>
          </Surface>
        </motion.aside>
      </div>
    </SectionShell>
  );
}
