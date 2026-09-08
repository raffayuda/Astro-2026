"use client";

import { motion, useReducedMotion } from "motion/react";
import { Award, Gift, Sparkles } from "lucide-react";

import type { EventConfig, TimelineItem } from "@/types/astro";
import { toDate, formatDateLong } from "@/lib/date";
import {
  CtaButton,
  PricePill,
  ScheduleCard,
  SectionHeading,
  SectionShell,
  Surface,
  WindowCard,
  type ScheduleStatus,
} from "@/components/brand";

const EASE = [0.16, 1, 0.3, 1] as const;

const BENEFITS = [
  { icon: Award, label: "Sertifikat resmi" },
  { icon: Gift, label: "Hadiah tiap kategori" },
  { icon: Sparkles, label: "Pengalaman panggung" },
];

interface Props {
  timeline: TimelineItem[];
  eventConfig: EventConfig;
}

function statusFor(item: TimelineItem, index: number, items: TimelineItem[]): ScheduleStatus {
  const date = toDate(item.date);
  if (!date) return "upcoming";
  const now = Date.now();
  if (date.getTime() < now) {
    const laterPast = items.slice(index + 1).some((n) => {
      const d = toDate(n.date);
      return d !== null && d.getTime() < now;
    });
    return laterPast ? "done" : "active";
  }
  return "upcoming";
}

function dateLabelFor(date: string) {
  const formatted = formatDateLong(date);
  if (formatted) return formatted;
  const trimmed = date.trim();
  if (/^tba/i.test(trimmed)) return "Segera diumumkan";
  return trimmed || "Segera diumumkan";
}

/**
 * Timeline + registration: dates, fee, and the daftar CTA.
 */
export default function ScheduleAndPricing({ timeline }: Props) {
  const reduce = useReducedMotion();

  return (
    <SectionShell id="timeline" band="pink" space="md" ribbon>
      <SectionHeading
        eyebrow="Timeline"
        pillTone="pink"
        title="Alur singkat untuk peserta"
        lead="Tanggal penting, benefit, dan akses pendaftaran dalam satu area."
        align="start"
      />

      <div className="mt-6 grid items-stretch gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-2">
        <WindowCard title="Jadwal" className="lg:h-full" bodyClassName="gap-0 lg:h-full">
          <ol className="flex flex-col lg:h-full lg:flex-1 lg:justify-between">
            {timeline.map((item, i) => (
              <motion.li
                key={`${item.date}-${item.title}`}
                initial={reduce ? false : { y: 8 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.04, duration: 0.35, ease: EASE }}
              >
                <ScheduleCard
                  phase={item.title}
                  dateLabel={dateLabelFor(item.date)}
                  status={statusFor(item, i, timeline)}
                  isLast={i === timeline.length - 1}
                />
              </motion.li>
            ))}
          </ol>
        </WindowCard>

        <WindowCard title="Pendaftaran" className="lg:h-full" bodyClassName="gap-4 sm:gap-5 lg:h-full">
          <div>
            <p className="text-10 font-black uppercase tracking-[0.22em] text-astro-navy/60">
              Biaya mulai dari
            </p>
            <div className="mt-3">
              <PricePill amount="Rp 20.000" unit="Orang" />
            </div>
          </div>

          <Surface tone="tint" radius="xl" pad="md">
            <ul className="flex flex-col gap-3">
              {BENEFITS.map((benefit) => (
                <li
                  key={benefit.label}
                  className="flex items-center gap-2.5 text-sm font-semibold text-astro-navy"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-astro-blue shadow-soft-sm">
                    <benefit.icon aria-hidden className="size-4" />
                  </span>
                  {benefit.label}
                </li>
              ))}
            </ul>
          </Surface>

          <div className="mt-auto">
            <CtaButton href="#competitions" size="default" className="w-full">
              Daftar segera
            </CtaButton>
          </div>
        </WindowCard>
      </div>
    </SectionShell>
  );
}
