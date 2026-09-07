'use client';

import { motion, useReducedMotion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';

import type { EventConfig, TimelineItem } from '@/types/astro';
import { toDate, formatDateLong } from '@/lib/date';
import {
  BenefitCard,
  CtaButton,
  Pill,
  PricePill,
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
      className="py-18 md:py-24"
      width="wide"
    >
      <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
        <SectionHeading
          eyebrow="Timeline & Biaya"
          title="Alur singkat untuk peserta"
          lead="Tanggal penting, benefit, dan akses pendaftaran disatukan dalam satu area yang mudah dipindai."
          align="start"
        />

        <Surface
          tone="plain"
          radius="2xl"
          pad="lg"
          className="grid gap-4 border border-white/80 bg-white/90 backdrop-blur sm:grid-cols-3"
        >
          <div>
            <Pill tone="gold" size="sm">
              Prize pool
            </Pill>
            <p className="mt-3 font-heading text-3xl font-black leading-none text-astro-navy">
              {eventConfig.totalPrizePool}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm font-semibold leading-relaxed text-ink">
              Setiap peserta mendapatkan alur pendaftaran, juknis, dan kontak
              yang jelas sebelum hari lomba.
            </p>
          </div>
        </Surface>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.45fr_0.9fr] lg:items-start">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

        <motion.aside
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex flex-col gap-6 lg:sticky lg:top-24"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <BenefitCard />
            <Surface tone="gold" radius="xl" pad="lg">
              <p className="text-10 font-black uppercase tracking-widest text-astro-navy/70">
                Biaya mulai dari
              </p>
              <div className="mt-4">
                <PricePill amount="Rp 20.000" unit="Orang" />
              </div>
              <p className="mt-4 text-sm font-semibold leading-relaxed text-astro-navy/80">
                Beberapa lomba gratis atau memiliki batch khusus. Detail biaya
                tetap tersedia di masing-masing halaman lomba.
              </p>
            </Surface>
          </div>

          <Surface
            pad="lg"
            radius="xl"
            className="grid gap-5 text-left sm:grid-cols-[auto_1fr] sm:items-center lg:grid-cols-1 lg:text-center"
          >
            <Surface tone="tint" radius="lg" pad="sm">
              <div className="rounded-md bg-white p-2">
                <QRCodeSVG
                  value={registerUrl}
                  size={128}
                  bgColor="#ffffff"
                  fgColor="#1e3a8a"
                  level="M"
                  aria-label="QR code pendaftaran ASTRO 2026"
                />
              </div>
            </Surface>
            <div className="flex flex-col gap-3">
              <div>
                <Pill tone="blue" size="sm">
                  Persistent CTA
                </Pill>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-ink">
                  Scan QR atau lanjut ke katalog lomba untuk memilih cabang yang
                  sesuai.
                </p>
              </div>

              <CtaButton href="#competitions" size="default" className="w-full">
                Daftar Segera
              </CtaButton>
            </div>
          </Surface>
        </motion.aside>
      </div>
    </SectionShell>
  );
}
