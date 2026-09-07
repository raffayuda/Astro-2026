"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type SponsorTier = {
  tier: string
  price?: string
  /** Tailwind gradient utilities for the bubble face. */
  face: string
}

export const SPONSOR_TIERS: SponsorTier[] = [
  { tier: "Platinum", face: "from-slate-50 to-slate-300" },
  { tier: "Gold", face: "from-amber-200 to-astro-gold" },
  { tier: "Silver", face: "from-zinc-100 to-zinc-300" },
  { tier: "Bronze", face: "from-orange-200 to-pastel-orange" },
]

/**
 * Skeuomorphic 90s CRT monitor housing the sponsorship package selector, per
 * sponsorship slide 3. The inset screen shading is an inline style because it is
 * a one-off shadow recipe; everything else is plain Tailwind.
 */
export function RetroMonitorWidget({
  tiers = SPONSOR_TIERS,
  selected,
  onSelect,
  className,
}: {
  tiers?: SponsorTier[]
  selected?: string
  onSelect?: (tier: string) => void
  className?: string
}) {
  return (
    <div
      data-slot="retro-monitor"
      className={cn("mx-auto w-full max-w-2xl", className)}
    >
      <div className="rounded-2xl bg-linear-to-b from-zinc-100 to-zinc-300 p-5 shadow-soft-lg ring-1 ring-inset ring-white/70">
        <div
          className="relative overflow-hidden rounded-xl bg-linear-to-b from-astro-blue to-astro-cyan-2 p-5"
          style={{ boxShadow: "var(--shadow-inset-screen)" }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(255,255,255,0.07) 0px, transparent 2px, transparent 4px)",
            }}
          />

          <div className="relative grid grid-cols-2 gap-3">
            {tiers.map((t) => {
              const isSelected = selected === t.tier
              const isButton = typeof onSelect === "function"
              const Comp = isButton ? "button" : "div"

              return (
                <Comp
                  key={t.tier}
                  type={isButton ? "button" : undefined}
                  aria-pressed={isButton ? isSelected : undefined}
                  onClick={isButton ? () => onSelect?.(t.tier) : undefined}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-full bg-linear-to-b px-4 py-3 text-astro-navy shadow-soft transition-all duration-200",
                    t.face,
                    isButton && "cursor-pointer hover:-translate-y-0.5 hover:shadow-soft-lg",
                    isSelected && "ring-3 ring-white"
                  )}
                >
                  <span className="font-title text-base uppercase leading-none">
                    {t.tier}
                  </span>
                  {t.price && (
                    <span className="text-2xs font-bold uppercase tracking-wide opacity-80">
                      {t.price}
                    </span>
                  )}
                </Comp>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto h-5 w-28 rounded-b-xl bg-zinc-300 shadow-soft" />
      <div className="mx-auto h-2 w-44 rounded-full bg-zinc-400/70" />
    </div>
  )
}
