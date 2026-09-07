import * as React from "react"
import { Check, Circle, Dot } from "lucide-react"

import { cn } from "@/lib/utils"
import { Surface } from "./Surface"

export type ScheduleStatus = "done" | "active" | "upcoming"

const STATUS = {
  done: {
    Icon: Check,
    label: "Selesai",
    chip: "bg-astro-gold text-white",
    ring: "ring-astro-gold/40",
    date: "text-astro-navy",
  },
  active: {
    Icon: Dot,
    label: "Berlangsung",
    chip: "bg-astro-blue text-white",
    ring: "ring-astro-blue/40",
    date: "text-astro-blue",
  },
  upcoming: {
    Icon: Circle,
    label: "Akan datang",
    chip: "bg-sky-mid text-astro-navy",
    ring: "ring-astro-cyan-2/50",
    date: "text-astro-navy",
  },
} as const

/**
 * Event schedule card — gold header band, status chip, date and phase.
 *
 * The header is full-bleed via `overflow-hidden` on the card rather than a
 * border, so it can never leave a stray sliver where the corner radius cuts.
 */
export function ScheduleCard({
  phase,
  dateLabel,
  bannerLabel = "Event Schedule",
  status = "upcoming",
  className,
}: {
  phase: string
  dateLabel: string
  bannerLabel?: string
  status?: ScheduleStatus
  className?: string
}) {
  const s = STATUS[status]

  return (
    <Surface
      data-slot="schedule-card"
      data-status={status}
      tone="plain"
      radius="xl"
      pad="none"
      interactive
      className={cn(
        "flex h-full flex-col overflow-hidden",
        className
      )}
    >
      <header className="bg-linear-to-r from-amber-400 to-astro-gold px-4 py-2.5">
        <p className="text-center text-10 font-black uppercase tracking-widest text-white">
          {bannerLabel}
        </p>
      </header>

      <div className="flex flex-1 items-center gap-3.5 p-4">
        <span
          aria-hidden
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-full ring-4",
            s.chip,
            s.ring
          )}
        >
          <s.Icon
            className={cn("size-4", status === "active" && "size-6")}
            strokeWidth={status === "done" ? 3.5 : 2}
          />
        </span>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "font-heading text-lg font-extrabold leading-tight tracking-tight",
              s.date
            )}
          >
            {dateLabel}
          </p>
          <p className="mt-0.5 truncate text-10 font-bold uppercase tracking-widest text-muted-foreground">
            {phase}
          </p>
        </div>
      </div>

      <footer className="flex items-center justify-between gap-2 border-t border-astro-cyan-2/30 bg-sky-bottom px-4 py-2">
        <span className="text-9 font-black uppercase tracking-widest text-astro-navy/60">
          {s.label}
        </span>
        <span
          aria-hidden
          className={cn(
            "h-1.5 w-10 rounded-full",
            status === "done" && "bg-astro-gold",
            status === "active" && "bg-astro-blue",
            status === "upcoming" && "bg-astro-cyan-2/60"
          )}
        />
      </footer>
    </Surface>
  )
}
