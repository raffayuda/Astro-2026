"use client";

import { ScheduleCard, WindowCard, type ScheduleStatus } from "@/components/brand";
import { formatDateLong, toDate } from "@/lib/date";
import type { TimelineItem } from "@/types/astro";

function statusFor(item: TimelineItem, index: number, items: TimelineItem[]): ScheduleStatus {
  const date = toDate(item.date);
  if (!date) return "upcoming";
  const now = Date.now();
  if (date.getTime() < now) {
    const laterPast = items.slice(index + 1).some((next) => {
      const parsed = toDate(next.date);
      return parsed !== null && parsed.getTime() < now;
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

export default function CompetitionTimeline({ timeline }: { timeline: TimelineItem[] }) {
  if (timeline.length === 0) return null;

  return (
    <WindowCard title="Jadwal" className="h-full" bodyClassName="gap-0">
      <ol className="flex flex-col">
        {timeline.map((item, index) => (
          <li key={`${item.date}-${item.title}`}>
            <ScheduleCard
              phase={item.title}
              dateLabel={dateLabelFor(item.date)}
              detail={item.desc}
              status={statusFor(item, index, timeline)}
              isLast={index === timeline.length - 1}
            />
          </li>
        ))}
      </ol>
    </WindowCard>
  );
}
