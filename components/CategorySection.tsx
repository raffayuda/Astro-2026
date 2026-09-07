'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Gamepad2, GraduationCap, Trophy } from 'lucide-react';

import type { Competition } from '@/types/astro';
import { cn } from '@/lib/utils';
import { Pill, SectionHeading, SectionShell } from '@/components/brand';

const EASE = [0.16, 1, 0.3, 1] as const;

/** Per-category presentation. Keys match Competition['category']. */
const CATEGORIES = [
  {
    id: 'akademik' as const,
    label: 'Akademik',
    blurb: 'Uji nalar, riset dan kemampuan analitismu.',
    icon: GraduationCap,
    face: 'from-astro-blue to-astro-navy',
  },
  {
    id: 'olahraga' as const,
    label: 'Olahraga',
    blurb: 'Adu sportivitas, strategi dan ketangguhan fisik.',
    icon: Trophy,
    face: 'from-pastel-orange to-orange-400',
  },
  {
    id: 'esports' as const,
    label: 'Esports',
    blurb: 'Bawa timmu menuju panggung grand final.',
    icon: Gamepad2,
    face: 'from-astro-pink to-pink-400',
  },
];

interface Props {
  competitions: Competition[];
}

export default function CategorySection({ competitions }: Props) {
  const reduce = useReducedMotion();

  const countFor = (id: (typeof CATEGORIES)[number]['id']) =>
    competitions.filter((c) => c.category === id).length;

  return (
    <SectionShell
      id="categories"
      ribbon
      sky="bright"
      bubbles="corners"
      className="py-20 md:py-24"
    >
      <SectionHeading
        eyebrow="Kategori"
        title="Pilih Arenamu"
        lead="Tiga kategori, satu panggung. Temukan cabang lomba yang paling kamu kuasai."
      />

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {CATEGORIES.map((cat, i) => {
          const total = countFor(cat.id);
          return (
            <motion.div
              key={cat.id}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: EASE }}
            >
              <Link
                href="#competitions"
                className="group flex h-full flex-col gap-4 rounded-xl bg-white p-6 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-soft-lg"
              >
                <span
                  aria-hidden
                  className={cn(
                    'grid size-14 place-items-center rounded-xl bg-linear-to-br text-white shadow-soft-sm',
                    cat.face
                  )}
                >
                  <cat.icon className="size-7" />
                </span>

                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-title text-2xl font-bold uppercase tracking-tight text-astro-navy">
                      {cat.label}
                    </h3>
                    <Pill tone="white" size="sm">
                      {total} lomba
                    </Pill>
                  </div>
                  <p className="text-sm font-medium text-ink">{cat.blurb}</p>
                </div>

                <span className="flex items-center gap-1.5 text-11 font-black uppercase tracking-widest text-astro-blue">
                  Lihat cabang
                  <ArrowRight
                    aria-hidden
                    className="size-3.5 transition-transform group-hover:translate-x-1"
                  />
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </SectionShell>
  );
}
