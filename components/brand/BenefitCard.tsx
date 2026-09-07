import * as React from "react"
import { Award, Gift, Sparkles, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Pill } from "./Pill"
import { Surface } from "./Surface"

export type BenefitItem = { icon?: LucideIcon; label: string }

export const DEFAULT_BENEFITS: BenefitItem[] = [
  { icon: Award, label: "Sertifikat" },
  { icon: Gift, label: "Hadiah" },
  { icon: Sparkles, label: "Pengalaman Panggung" },
]

/**
 * Event detail / benefit card — pink gradient panel with a floating "BENEFIT"
 * pill and light-pink item rows, per the component style guide.
 */
export function BenefitCard({
  label = "Benefit",
  items = DEFAULT_BENEFITS,
  className,
}: {
  label?: string
  items?: BenefitItem[]
  className?: string
}) {
  return (
    <div
      data-slot="benefit-card"
      className={cn("relative pt-4", className)}
    >
      <Pill
        tone="pink"
        size="sm"
        className="absolute left-4 top-0 z-10 shadow-soft"
      >
        {label}
      </Pill>

      <Surface tone="pink" radius="xl" pad="md" className="pt-6">
        <ul className="flex flex-col gap-2">
          {items.map((item) => {
            const Icon = item.icon ?? Sparkles
            return (
              <li
                key={item.label}
                className="flex items-center gap-2 rounded-full bg-white/35 px-3 py-1.5 ring-1 ring-inset ring-white/50"
              >
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-white/80">
                  <Icon aria-hidden className="size-3 text-astro-pink" />
                </span>
                <span className="text-sm font-semibold text-white">
                  {item.label}
                </span>
              </li>
            )
          })}
        </ul>
      </Surface>
    </div>
  )
}
