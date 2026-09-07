import * as React from "react"
import { CheckCircle2, Circle, CircleDot } from "lucide-react"

import { cn } from "@/lib/utils"

export type ScheduleStatus = "done" | "active" | "upcoming"

const STATUS = {
  done: { Icon: CheckCircle2, color: "text-astro-gold", label: "Selesai" },
  active: { Icon: CircleDot, color: "text-astro-blue", label: "Berlangsung" },
  upcoming: { Icon: Circle, color: "text-astro-cyan-2", label: "Akan datang" },
} as const

/**
 * Event schedule card — gold header bar, white body, status icon, date and phase,
 * per the component style guide.
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
  const { Icon, color } = STATUS[status]

  return (
    <article
      data-slot="schedule-card"
      data-status={status}
      className={cn(
        "flex flex-col overflow-hidden rounded-xl bg-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft-lg",
        className
      )}
    >
      <header className="bg-linear-to-r from-amber-400 to-astro-gold px-4 py-2">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-white">
          {bannerLabel}
        </p>
      </header>

      <div className="flex items-center gap-3 border-l-4 border-astro-gold p-4">
        <Icon className={cn("size-6 shrink-0", color)} aria-hidden />
        <div className="min-w-0">
          <p className="font-masterpiece text-lg leading-tight text-astro-navy">
            {dateLabel}
          </p>
          <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {phase}
          </p>
        </div>
      </div>
    </article>
  )
}
