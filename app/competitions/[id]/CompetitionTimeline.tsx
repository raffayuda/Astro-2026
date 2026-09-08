'use client';

import { motion, useReducedMotion } from 'motion/react';
import { CalendarDays, Clock } from 'lucide-react';
import type { TimelineItem } from '@/types/astro';
import { SectionHeading } from "@/components/brand/SectionHeading";
import { SectionShell } from "@/components/brand/SectionShell";

interface Props {
  timeline: TimelineItem[];
  lineColor: string;
  categoryColors: {
    accent: string;
    dot: string;
    ring: string;
    iconBg: string;
    iconBorder: string;
    hex: string;
  };
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export default function CompetitionTimeline({ timeline, lineColor, categoryColors }: Props) {
  const reduce = useReducedMotion();

  return (
    <SectionShell band="none" space="md">
      <SectionHeading
        title="Timeline lomba"
        lead="Jadwal rangkaian acara dari awal sampai akhir."
      />

      <div className="relative mt-10">
          {/* Vertical line — Desktop: centered, Mobile: 26px from left */}
          <div
            className="absolute top-0 bottom-0 w-[3px] z-0 hidden md:block left-1/2 -translate-x-1/2 rounded-full"
            style={{
              background: `linear-gradient(to bottom, #d9f64a, ${lineColor}, #3157ff)`,
            }}
          />
          <div
            className="absolute top-0 bottom-0 w-[3px] z-0 md:hidden left-[26px] -translate-x-1/2 rounded-full"
            style={{
              background: `linear-gradient(to bottom, #d9f64a, ${lineColor}, #3157ff)`,
            }}
          />

          {/* Mobile Layout */}
          <div className="md:hidden">
            <div className="grid grid-cols-[52px_1fr] gap-x-3 gap-y-10">
              {timeline.map((item, idx) => (
                <div key={`mobile-tl-${idx}`} className="contents">
                  {/* Diamond node */}
                  <motion.div
                    custom={idx}
                    variants={reduce ? undefined : fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    className="flex justify-center items-start pt-5 z-10"
                  >
                    <div className={`size-6 rounded-full ${categoryColors.dot} ring-4 ${categoryColors.ring} ring-2 ring-astro-blue`} />
                  </motion.div>

                  {/* Card */}
                  <motion.div
                    custom={idx}
                    variants={reduce ? undefined : fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                  >
                    <TimelineCard item={item} idx={idx} categoryColors={categoryColors} align="left" />
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:block">
            <div className="grid grid-cols-[1fr_52px_1fr] gap-x-6">
              {timeline.map((item, idx) => (
                <div key={`desktop-tl-${idx}`} className="contents">
                  {/* Column 1: Card for even idx, empty for odd */}
                  <motion.div
                    custom={idx}
                    variants={reduce ? undefined : fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                  >
                    {idx % 2 === 0 ? (
                      <div className="flex justify-end">
                        <TimelineCard item={item} idx={idx} categoryColors={categoryColors} align="right" />
                      </div>
                    ) : (
                      <div />
                    )}
                  </motion.div>

                  {/* Column 2: Diamond node */}
                  <motion.div
                    custom={idx}
                    variants={reduce ? undefined : fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    className="flex justify-center items-start pt-5 z-10"
                  >
                    <div className={`size-6 rounded-full ${categoryColors.dot} ring-4 ${categoryColors.ring} ring-2 ring-astro-blue`} />
                  </motion.div>

                  {/* Column 3: Card for odd idx, empty for even */}
                  <motion.div
                    custom={idx}
                    variants={reduce ? undefined : fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                  >
                    {idx % 2 !== 0 ? (
                      <TimelineCard item={item} idx={idx} categoryColors={categoryColors} align="left" />
                    ) : (
                      <div />
                    )}
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>
    </SectionShell>
  );
}

/* ── Timeline Card Sub-component ── */
function TimelineCard({
  item,
  idx,
  categoryColors,
  align,
}: {
  item: TimelineItem;
  idx: number;
  categoryColors: { accent: string; dot: string; ring: string; iconBg: string; iconBorder: string; hex: string };
  align: 'left' | 'right';
}) {
  return (
    <div
      className={`rounded-xl bg-white shadow-soft transition-all duration-200 w-full max-w-md relative group hover:shadow-soft-lg ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      {/* Corner accent — uses category color */}
      <div
        className={`absolute -top-[1px] -left-[1px] w-8 h-8 ${categoryColors.accent}`}
        style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
      />

      <div className="p-5 md:p-6">
        {/* Step number badge */}
        <div
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-10 font-bold uppercase tracking-wider border ${categoryColors.iconBg} ${categoryColors.iconBorder} ${
            align === 'right' ? 'float-right ml-auto' : ''
          }`}
        >
          <Clock className="w-3 h-3" />
          Tahap {idx + 1}
        </div>

        <div className="clear-both" />

        {/* Date */}
        <div className={`flex items-center gap-1.5 mt-3 mb-2 ${align === 'right' ? 'justify-end' : ''}`}>
          <CalendarDays className="w-3.5 h-3.5 text-astro-blue/55 flex-shrink-0" />
          <span className="text-11 font-bold text-astro-blue/75 uppercase tracking-wider">
            {item.date}
          </span>
        </div>

        {/* Title */}
        <h3
          className={`text-base md:text-lg font-black text-astro-navy uppercase tracking-tight mb-1 ${
            align === 'right' ? 'text-right' : 'text-left'
          }`}
        >
          {item.title}
        </h3>

        {/* Accent line */}
        <div
          className={`w-10 h-[4px] rounded-full bg-astro-gold mb-2 ${
            align === 'right' ? 'ml-auto' : 'mr-auto'
          }`}
          style={{ clipPath: 'polygon(2px 0, 100% 0, calc(100% - 2px) 100%, 0 100%)' }}
        />

        {/* Description */}
        <p
          className={`text-sm text-astro-navy/72 leading-relaxed ${
            align === 'right' ? 'text-right' : 'text-left'
          }`}
        >
          {item.desc}
        </p>
      </div>
    </div>
  );
}
