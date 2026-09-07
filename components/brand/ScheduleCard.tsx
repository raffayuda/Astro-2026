import * as React from "react";
import { Check, Circle, Dot } from "lucide-react";

import { cn } from "@/lib/utils";

export type ScheduleStatus = "done" | "active" | "upcoming";

const STATUS = {
  done: {
    Icon: Check,
    label: "Selesai",
    dot: "bg-astro-gold text-white",
    date: "text-astro-navy/55",
  },
  active: {
    Icon: Dot,
    label: "Berlangsung",
    dot: "bg-astro-blue text-white",
    date: "text-astro-blue",
  },
  upcoming: {
    Icon: Circle,
    label: "Akan datang",
    dot: "bg-sky-mid text-astro-navy",
    date: "text-ink/55",
  },
} as const;

/**
 * One timeline step: status dot, phase, date. Meant to sit in a tight column
 * so the window reads as a single list, not a stack of cards.
 */
export function ScheduleCard({
  phase,
  dateLabel,
  detail,
  status = "upcoming",
  isLast = true,
  className,
}: {
  phase: string;
  dateLabel: string;
  detail?: string;
  status?: ScheduleStatus;
  isLast?: boolean;
  className?: string;
}) {
  const s = STATUS[status];

  return (
    <article
      data-slot="schedule-card"
      data-status={status}
      className={cn("relative flex gap-3 py-2.5 first:pt-0 last:pb-0", className)}
    >
      {!isLast && (
        <span
          aria-hidden
          className="absolute top-3 bottom-0 left-[11px] w-px bg-astro-cyan-2/55"
        />
      )}

      <span
        aria-hidden
        className={cn(
          "relative z-10 mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ring-[3px] ring-white",
          s.dot,
        )}
      >
        <s.Icon
          className={cn("size-3", status === "active" && "size-4")}
          strokeWidth={status === "done" ? 3.5 : 2}
        />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-heading text-sm font-extrabold tracking-tight text-astro-navy sm:text-base">
            {phase}
          </h3>
          <span className="sr-only">{s.label}</span>
        </div>
        <p className={cn("text-xs font-semibold", s.date)}>{dateLabel}</p>
        {detail && (
          <p className="mt-0.5 text-sm leading-relaxed text-ink/70">{detail}</p>
        )}
      </div>
    </article>
  );
}
