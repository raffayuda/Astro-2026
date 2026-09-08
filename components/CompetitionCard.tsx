"use client";

import { motion, useReducedMotion } from "motion/react";
import { Users, Coins, CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";
import type { Competition } from "@/types/astro";
import { formatDateShort } from "@/lib/date";
import { getEffectiveCompetitionFee } from "@/src/lib/competitions";
import { CtaButton } from "@/components/brand/CtaButton";
import { Pill, type PillProps } from "@/components/brand/Pill";
import { WindowCard } from "@/components/brand/WindowCard";
import { Button } from "@/components/ui/button";

const CATEGORY_PILL: Record<string, { label: string; tone: NonNullable<PillProps["tone"]> }> = {
  akademik: { label: "Akademik", tone: "blue" },
  olahraga: { label: "Olahraga", tone: "orange" },
  esports: { label: "Esports", tone: "navy" },
  "kesenian-/-seni": { label: "Kesenian", tone: "pink" },
};

function toIdr(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

interface Props {
  competition: Competition;
  index: number;
}

export default function CompetitionCard({ competition, index }: Props) {
  const reduce = useReducedMotion();
  const category = CATEGORY_PILL[competition.category] ?? CATEGORY_PILL.akademik;
  const left = competition.maxSlots - competition.filledSlots;
  const effective = getEffectiveCompetitionFee(competition);
  const isOpen = competition.isActive !== false;
  const isFull = left <= 0;

  const feeLabel = competition.isFree
    ? "Gratis"
    : effective.fee > 0
      ? toIdr(effective.fee)
      : "TBA";

  const meta = [
    { id: "fee", icon: Coins, label: feeLabel },
    { id: "place", icon: MapPin, label: competition.location || "TBA" },
    { id: "date", icon: CalendarDays, label: formatDateShort(competition.scheduleDate) || "TBA" },
    {
      id: "slots",
      icon: Users,
      label:
        competition.maxSlots > 0
          ? `${competition.filledSlots}/${competition.maxSlots}`
          : "Kuota TBA",
    },
  ] as const;

  const actionLabel = !isOpen ? "Ditutup" : isFull ? "Penuh" : "Daftar";

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] as const }}
      className="h-full"
    >
      <WindowCard
        title={competition.title}
        close={false}
        pad="compact"
        className="h-full"
        bodyClassName="gap-3"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <Pill tone={category.tone} size="sm" className="shadow-gloss">
            {category.label}
          </Pill>
          <Pill tone="glass" size="sm">
            {competition.origin === "external" ? "Eksternal" : "Internal"}
          </Pill>
          {!isOpen && (
            <Pill tone="pink" size="sm" className="shadow-gloss">
              Ditutup
            </Pill>
          )}
          {isOpen && isFull && (
            <Pill tone="gold" size="sm">
              Penuh
            </Pill>
          )}
        </div>

        <p className="line-clamp-1 text-sm font-medium text-ink/75">
          {competition.tagline || "Informasi lomba segera diumumkan."}
        </p>

        <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs font-semibold text-ink">
          {meta.map((item) => (
            <li key={item.id} className="flex min-w-0 items-center gap-2">
              <item.icon className="size-3.5 shrink-0 text-astro-blue" aria-hidden />
              <span className="truncate">{item.label}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-center gap-2 pt-1">
          <Button asChild variant="outline" size="sm" className="h-10 flex-1 rounded-full sm:h-8">
            <Link href={`/competitions/${competition.id}`}>Detail</Link>
          </Button>
          {!isOpen || isFull ? (
            <Button disabled size="sm" className="h-10 flex-1 rounded-full sm:h-8">
              {actionLabel}
            </Button>
          ) : (
            <CtaButton
              href={`/register/${competition.id}`}
              size="default"
              showChevron={false}
              className="h-10 flex-1 px-3 text-xs sm:h-8"
            >
              Daftar
            </CtaButton>
          )}
        </div>
      </WindowCard>
    </motion.div>
  );
}
