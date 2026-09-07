'use client';

import { motion, useReducedMotion } from 'motion/react';
import { Trophy, Users, Gamepad2, CalendarCheck } from 'lucide-react';
import type { AstroData } from '@/types/astro';
import { toDate } from '@/lib/date';
import { ChevronRibbon, Pill, StatCard, Surface } from '@/components/brand';

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
    { icon: Trophy, value: String(data.competitions.length), label: 'Cabang Lomba' },
    { icon: Users, value: `${filled}/${totalSlots}`, label: 'Partisipan' },
    { icon: Gamepad2, value: String(cats), label: 'Kategori' },
    { icon: CalendarCheck, value: calcEventDays(data), label: 'Hari Event' },
  ];
};

export default function StatsBar({ data }: Props) {
  const reduce = useReducedMotion();
  const items = stats(data);

  return (
    <section className="relative z-20 bg-sky-bottom py-4">
      <ChevronRibbon edge="top" />
      <ChevronRibbon edge="bottom" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <motion.div
          className="grid gap-4 rounded-2xl bg-white/72 p-3 shadow-soft backdrop-blur md:grid-cols-[0.7fr_1.3fr]"
          initial={reduce ? undefined : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <Surface
            tone="blue"
            radius="xl"
            pad="lg"
            className="flex min-h-40 flex-col justify-between overflow-hidden"
          >
            <Pill tone="glass" size="sm">
              Event snapshot
            </Pill>
            <div>
              <p className="font-heading text-3xl font-black leading-tight text-white">
                Data lomba yang siap dipindai.
              </p>
              <p className="mt-2 max-w-sm text-sm font-medium text-white/80">
                Kuota, kategori, dan hari pelaksanaan diringkas tanpa mengganggu
                alur pendaftaran.
              </p>
            </div>
          </Surface>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {items.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
              >
                <StatCard icon={stat.icon} metric={stat.value} label={stat.label} className="h-full" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
