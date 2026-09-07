import * as React from "react"
import { Check, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Metric / channel tile.
 *
 * `metric` present  -> big-number stat (audience figures).
 * `checked` present -> exposure-channel tile with a green tick.
 */
export function StatCard({
  icon: Icon,
  metric,
  label,
  checked = false,
  className,
}: {
  icon?: LucideIcon
  metric?: string
  label: string
  checked?: boolean
  className?: string
}) {
  return (
    <div
      data-slot="stat-card"
      className={cn(
        "relative flex flex-col items-center gap-2 rounded-lg bg-white p-5 text-center shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft-lg",
        className
      )}
    >
      {checked && (
        <span
          aria-hidden
          className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-astro-lime2 text-white"
        >
          <Check className="size-3" />
        </span>
      )}

      {Icon && (
        <span className="grid size-11 place-items-center rounded-full bg-sky-bottom text-astro-blue">
          <Icon aria-hidden className="size-5" />
        </span>
      )}

      {metric && (
        <p className="font-title text-3xl leading-none text-astro-navy">
          {metric}
        </p>
      )}

      <p className="text-2xs font-bold uppercase tracking-wide text-ink sm:text-xs">
        {label}
      </p>
    </div>
  )
}
