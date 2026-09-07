"use client"

import * as React from "react"
import {
  Guitar,
  MessageSquareQuote,
  Mic2,
  Music4,
  Sparkles,
  Swords,
  Wand2,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

export const TALENT_ICONS = {
  dance: Music4,
  singer: Mic2,
  magic: Wand2,
  standup: MessageSquareQuote,
  martial_arts: Swords,
  band: Guitar,
  other: Sparkles,
} satisfies Record<string, LucideIcon>

export type TalentId = keyof typeof TALENT_ICONS

/** The seven performance categories from the ASTRO GOT TALENT poster. */
export const TALENT_CATEGORIES: { id: TalentId; label: string }[] = [
  { id: "dance", label: "Tari" },
  { id: "singer", label: "Menyanyi" },
  { id: "magic", label: "Sulap" },
  { id: "standup", label: "Stand Up" },
  { id: "martial_arts", label: "Bela Diri" },
  { id: "band", label: "Band" },
  { id: "other", label: "Lainnya" },
]

/**
 * Talent category selection card — pastel orange tile with icon and uppercase
 * label, per the component style guide. `mini` is the inline variant used in the
 * registration form.
 */
export function TalentCategoryCard({
  id,
  label,
  selected = false,
  size = "default",
  onSelect,
  className,
}: {
  id: TalentId
  label: string
  selected?: boolean
  size?: "default" | "mini"
  onSelect?: (id: TalentId) => void
  className?: string
}) {
  const Icon = TALENT_ICONS[id]
  const isButton = typeof onSelect === "function"
  const Comp = isButton ? "button" : "div"

  return (
    <Comp
      data-slot="talent-category-card"
      data-selected={selected}
      type={isButton ? "button" : undefined}
      aria-pressed={isButton ? selected : undefined}
      onClick={isButton ? () => onSelect?.(id) : undefined}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-pastel-orange to-orange-300 text-center text-white shadow-soft transition-all duration-200",
        isButton && "cursor-pointer hover:-translate-y-0.5 hover:shadow-glow-orange",
        selected && "ring-3 ring-astro-blue ring-offset-2",
        size === "default" ? "p-4" : "gap-1 p-2.5",
        className
      )}
    >
      <Icon
        aria-hidden
        className={cn("shrink-0", size === "default" ? "size-8" : "size-5")}
      />
      <span
        className={cn(
          "font-bold uppercase leading-tight tracking-wide",
          size === "default" ? "text-xs" : "text-2xs"
        )}
      >
        {label}
      </span>
    </Comp>
  )
}
