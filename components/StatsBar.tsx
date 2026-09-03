'use client';

import { motion, useReducedMotion } from 'motion/react';
import { Trophy, Users, Gamepad2, CalendarCheck } from 'lucide-react';
import type { AstroData } from '@/types/astro';
import { toDate } from '@/lib/date';

interface Props {
  data: AstroData;
}

function calcEventDays(data: AstroData) {
  const dates = data.competitions
    .map((c) => toDate(c.scheduleDate))
    .filter((d): d is Date => d !== null)
    .map((d) => d.toISOString().split('T')[0]);

  if (dates.length === 0) return '0';

  const unique = [...new Set(dates)].sort();
  const start = new Date(unique[0]);
  const end = new Date(unique[unique.length - 1]);
  const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return String(Math.max(1, days));
}

const stats = (data: AstroData) => {
  const totalSlots = data.competitions.reduce((s, c) => s + c.maxSlots, 0);
  const filled = data.competitions.reduce((s, c) => s + c.filledSlots, 0);
  const cats = new Set(data.competitions.map((c) => c.category)).size;
  return [
    { icon: Trophy, value: String(data.competitions.length), label: 'CABANG LOMBA' },
    { icon: Users, value: `${filled}/${totalSlots}`, label: 'PARTISIPAN' },
    { icon: Gamepad2, value: String(cats), label: 'KATEGORI' },
    { icon: CalendarCheck, value: calcEventDays(data), label: 'HARI EVENT' },
  ];
};

export default function StatsBar({ data }: Props) {
  const reduce = useReducedMotion();
  const items = stats(data);

  return (
    <section className="relative z-20 bg-slate-50 border-y border-slate-200/65">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200"
          initial={reduce ? undefined : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          {items.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
                className="bg-white px-6 py-6 md:py-8 text-center group hover:bg-slate-50 transition-colors duration-200 ease-in-out"
              >
                <Icon className="w-4 h-4 text-astro-cyan mx-auto mb-2 opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-[10px] font-bold tracking-[0.2em] text-slate-600 mt-1 uppercase">
                  {stat.label}
                </div>
              </motion.div> 
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
