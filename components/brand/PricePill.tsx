import * as React from "react"

import { cn } from "@/lib/utils"

/** Large gold price badge, e.g. "Rp 20.000/Orang". */
export function PricePill({
  amount,
  unit,
  className,
}: {
  amount: string
  unit?: string
  className?: string
}) {
  return (
    <span
      data-slot="price-pill"
      className={cn(
        "inline-flex w-fit items-baseline gap-1 rounded-full bg-linear-to-r from-amber-400 to-astro-gold px-6 py-2.5 text-astro-navy shadow-soft ring-3 ring-white/70",
        className
      )}
    >
      <span className="font-masterpiece text-2xl leading-none">{amount}</span>
      {unit && (
        <span className="text-sm font-bold uppercase tracking-wide">/{unit}</span>
      )}
    </span>
  )
}
