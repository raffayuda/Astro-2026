"use client"

import * as React from "react"
import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { Bubbles } from "./Bubbles"

const MotionImage = motion.create(Image)

const CLOUDS = [
  { src: "/assets/awan1.png", w: 220, position: "left-4 top-16", drift: 18, duration: 13 },
  { src: "/assets/awan2.png", w: 170, position: "right-6 top-28", drift: -14, duration: 16 },
  { src: "/assets/cloud.png", w: 200, position: "right-1/4 bottom-16", drift: 12, duration: 15 },
]

/**
 * Sky gradient ground plus drifting clouds and bubbles.
 *
 * Replaces the old `.bg-linear-to-b from-sky-top via-sky-mid to-white` / `.bg-linear-to-b from-sky-bottom via-white to-white` / `.astro-bubble-field`
 * global classes. The gradient is plain Tailwind utilities over theme colors.
 * Parent must be `relative`.
 */
export function SkyBackdrop({
  tone = "bright",
  clouds = true,
  bubbles = "sparse",
  className,
}: {
  tone?: "bright" | "soft" | "none"
  clouds?: boolean
  bubbles?: "sparse" | "dense" | "corners" | "none"
  className?: string
}) {
  const reduce = useReducedMotion()

  return (
    <div
      aria-hidden
      data-slot="sky-backdrop"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {tone === "bright" && (
        <div className="absolute inset-0 bg-linear-to-b from-sky-top via-sky-mid to-white" />
      )}
      {tone === "soft" && (
        <div className="absolute inset-0 bg-linear-to-b from-sky-bottom via-white to-white" />
      )}

      {clouds &&
        CLOUDS.map((c) => (
          <MotionImage
            key={c.src}
            src={c.src}
            alt=""
            width={c.w}
            height={Math.round(c.w * 0.6)}
            aria-hidden
            className={cn("absolute opacity-80", c.position)}
            animate={reduce ? undefined : { x: [0, c.drift, 0] }}
            transition={{ duration: c.duration, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

      {bubbles !== "none" && <Bubbles preset={bubbles} />}
    </div>
  )
}
