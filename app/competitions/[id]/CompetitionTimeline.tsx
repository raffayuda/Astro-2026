'use client';

import { motion, useReducedMotion } from 'motion/react';
import { CalendarDays, Clock } from 'lucide-react';
import type { TimelineItem } from '@/types/astro';
import { Bubbles, ChromeText, Pattern } from "@/components/brand";

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
    <section className="bg-linear-to-b from-sky-bottom via-white to-white relative overflow-hidden py-16 md:py-20">
      <Bubbles preset="sparse" />
      <Pattern className="absolute inset-0 z-0 opacity-25" />
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 size-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-astro-cyan-2/12 blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        {/* ─── Section header ─── */}
        <motion.div
          className="text-center mb-12 md:mb-14"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <div className="flex justify-center mb-3">
            <div
              className="h-1.5 w-12 rounded-full bg-astro-gold shadow-[0_3px_0_rgba(49,87,255,0.22)]"
            />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-astro-navy uppercase tracking-tight mb-2">
            Timeline <ChromeText>Lomba</ChromeText>
          </h2>
          <p className="text-sm md:text-base text-astro-blue/75 font-semibold leading-relaxed max-w-lg mx-auto">
            Jadwal lengkap rangkaian acara lomba ini dari awal hingga akhir
          </p>
        </motion.div>

        {/* ─── Timeline ─── */}
        <div className="relative">
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
                    <div className={`size-6 rounded-full ${categoryColors.dot} ring-4 ${categoryColors.ring} shadow-[0_0_0_2px_#3157ff]`} />
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
                    <div className={`size-6 rounded-full ${categoryColors.dot} ring-4 ${categoryColors.ring} shadow-[0_0_0_2px_#3157ff]`} />
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
      </div>
    </section>
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
      className={`rounded-xl bg-white shadow-soft transition-all duration-200 w-full max-w-md relative group hover:border-astro-blue/45 ${
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
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border ${categoryColors.iconBg} ${categoryColors.iconBorder} ${
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
          <span className="text-[11px] font-bold text-astro-blue/75 uppercase tracking-wider">
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
