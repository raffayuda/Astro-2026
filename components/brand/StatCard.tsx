import * as React from "react"
import { Check, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Surface } from "./Surface"

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
    <Surface
      data-slot="stat-card"
      tone="plain"
      radius="xl"
      pad="md"
      interactive
      className={cn(
        "flex h-full flex-col items-center gap-2 text-center",
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

      <p className="text-10 font-bold uppercase tracking-wide text-ink sm:text-xs">
        {label}
      </p>
    </Surface>
  )
}
