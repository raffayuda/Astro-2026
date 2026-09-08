"use client";

import type { AstroData } from "@/types/astro";
import { toDate } from "@/lib/date";
import { SectionShell } from "@/components/brand/SectionShell";
import { StatCard } from "@/components/brand/StatCard";
import { WindowCard } from "@/components/brand/WindowCard";

interface Props {
  data: AstroData;
}

function calcEventDays(data: AstroData) {
  const dates = data.competitions
    .map((c) => toDate(c.scheduleDate))
    .filter((d): d is Date => d !== null)
    .map((d) => d.toISOString().split("T")[0]);

  if (dates.length === 0) return "0";

  const unique = [...new Set(dates)].sort();
  const start = new Date(unique[0]);
  const end = new Date(unique[unique.length - 1]);
  const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return String(Math.max(1, days));
}

export default function StatsBar({ data }: Props) {
  const totalSlots = data.competitions.reduce((sum, c) => sum + c.maxSlots, 0);
  const filled = data.competitions.reduce((sum, c) => sum + c.filledSlots, 0);
  const cats = new Set(data.competitions.map((c) => c.category)).size;

  const items = [
    { value: String(data.competitions.length), label: "Cabang lomba" },
    { value: `${filled}/${totalSlots}`, label: "Partisipan" },
    { value: String(cats), label: "Kategori" },
    { value: calcEventDays(data), label: "Hari event" },
  ];

  return (
    <SectionShell id="kenapa" band="white" space="sm">
      <WindowCard title="Kenapa ASTRO 2026?">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {items.map((stat) => (
            <StatCard key={stat.label} metric={stat.value} label={stat.label} className="p-3 sm:p-5" />
          ))}
        </div>
      </WindowCard>
    </SectionShell>
  );
}
