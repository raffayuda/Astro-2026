"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type Bubble = {
  /** Tailwind size utility, e.g. "size-32". */
  size: string
  /** Tailwind position utilities, e.g. "-left-8 top-1/4". */
  position: string
  delay: number
  duration: number
}

const PRESETS: Record<"sparse" | "dense" | "corners", Bubble[]> = {
  sparse: [
    { size: "size-32", position: "-left-8 top-1/4", delay: 0, duration: 9 },
    { size: "size-26", position: "-right-6 bottom-1/6", delay: -4, duration: 11 },
  ],
  dense: [
    { size: "size-32", position: "-left-8 top-1/5", delay: 0, duration: 9 },
    { size: "size-20", position: "left-1/4 top-8", delay: -2, duration: 12 },
    { size: "size-26", position: "-right-6 bottom-1/4", delay: -4, duration: 11 },
    { size: "size-14", position: "right-1/3 bottom-10", delay: -6, duration: 8 },
  ],
  corners: [
    { size: "size-24", position: "-left-6 -top-6", delay: 0, duration: 10 },
    { size: "size-20", position: "-right-5 -bottom-5", delay: -5, duration: 12 },
  ],
}

/**
 * Floating glass bubbles with a specular highlight — the recurring decorative
 * motif across the ASTRO artwork. Renders real elements (not CSS pseudo-elements)
 * so count, size and placement are props rather than a fixed global rule.
 *
 * Parent needs `relative`. Respects prefers-reduced-motion.
 */
export function Bubbles({
  preset = "sparse",
  className,
}: {
  preset?: keyof typeof PRESETS
  className?: string
}) {
  const reduce = useReducedMotion()

  return (
    <div
      aria-hidden
      data-slot="bubbles"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      {PRESETS[preset].map((b, i) => (
        <motion.span
          key={i}
          className={cn(
            "absolute rounded-full bg-white/40 shadow-soft ring-1 ring-inset ring-white/70",
            b.size,
            b.position
          )}
          animate={reduce ? undefined : { y: [0, -18, 0], scale: [1, 1.04, 1] }}
          transition={{
            duration: b.duration,
            delay: b.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <span className="absolute left-1/5 top-1/5 size-1/4 rounded-full bg-white/90 blur-sm" />
        </motion.span>
      ))}
    </div>
  )
}
