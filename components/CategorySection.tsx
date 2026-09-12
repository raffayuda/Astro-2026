"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Gamepad2, GraduationCap, Trophy } from "lucide-react";

import type { Competition } from "@/types/astro";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/brand/SectionHeading";
import { SectionShell } from "@/components/brand/SectionShell";
import { WindowCard } from "@/components/brand/WindowCard";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Per-category presentation. Keys match Competition['category']. */
const CATEGORIES = [
  {
    id: "akademik" as const,
    label: "Akademik",
    blurb: "Uji nalar, riset dan kemampuan analitismu.",
    icon: GraduationCap,
    face: "bg-astro-blue",
  },
  {
    id: "olahraga" as const,
    label: "Olahraga",
    blurb: "Adu sportivitas, strategi dan ketangguhan fisik.",
    icon: Trophy,
    face: "bg-pastel-orange",
  },
  {
    id: "esports" as const,
    label: "Esports",
    blurb: "Bawa timmu menuju panggung grand final.",
    icon: Gamepad2,
    face: "bg-astro-pink",
  },
];

interface Props {
  competitions: Competition[];
}

export default function CategorySection({ competitions }: Props) {
  const reduce = useReducedMotion();

  const countFor = (id: (typeof CATEGORIES)[number]["id"]) =>
    competitions.filter((c) => c.category === id).length;

  return (
    <SectionShell id="categories" band="mid" space="md">
      <SectionHeading
        eyebrow="Kategori"
        pillTone="blue"
        title="Pilih arenamu"
        lead="Tiga kategori, satu panggung. Temukan cabang lomba yang paling kamu kuasai."
        align="start"
      />

      <div className="mt-6 grid items-stretch gap-3 sm:mt-8 sm:gap-5 md:grid-cols-3">
        {CATEGORIES.map((cat, i) => {
          const total = countFor(cat.id);
          return (
            <motion.div
              key={cat.id}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: i * 0.07, duration: 0.5, ease: EASE }}
              className="h-full"
            >
              <WindowCard
                title={cat.label}
                close={false}
                pad="compact"
                className="h-full transition-transform duration-200 hover:-translate-y-0.5"
              >
                <Link href="#competitions" className="group flex h-full flex-col gap-4">
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-11 place-items-center rounded-xl text-white",
                      cat.face,
                    )}
                  >
                    <cat.icon className="size-5" />
                  </span>

                  <p className="text-sm font-medium leading-relaxed text-ink/75">{cat.blurb}</p>

                  <span className="mt-auto flex items-center justify-between gap-2 border-t border-astro-cyan-2/35 pt-3 text-sm font-bold text-astro-blue">
                    {total} lomba
                    <ArrowRight
                      aria-hidden
                      className="size-4 transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              </WindowCard>
            </motion.div>
          );
        })}
      </div>
    </SectionShell>
  );
}
