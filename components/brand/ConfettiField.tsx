"use client"

import * as React from "react"
import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

/**
 * The decorative layer behind the ASTRO GOT TALENT poster: two ribbon swirls,
 * outlined rings, glass bubbles and the two performance glyphs.
 *
 * The artwork is exported straight from Figma frame 795:2 rather than redrawn,
 * because the swirls are hand-drawn ribbons with per-point gradients that no
 * amount of CSS reproduces. They are served `unoptimized` since the project has
 * not enabled `dangerouslyAllowSVG`, and they are vectors, so the optimizer had
 * nothing to add anyway.
 *
 * Placement is re-composed for a landscape hero. The poster is 4:5 and pushes
 * its swirls off the short edges; at 16:9 the same coordinates would leave the
 * middle bare, so the pieces are pinned to the corners the title does not use.
 *
 * Parent must be `relative`.
 */

type Piece = {
  src: string
  /** Tailwind position + size utilities. */
  className: string
  width: number
  height: number
  /** Vertical drift in px. 0 leaves the piece still. */
  drift: number
  duration: number
  delay?: number
}

const RIBBONS: Piece[] = [
  {
    src: "/assets/agt/swirl-left.svg",
    className: "-left-24 top-[12%] w-64 -scale-x-100 md:w-96",
    width: 384,
    height: 384,
    drift: 10,
    duration: 17,
  },
  {
    src: "/assets/agt/swirl-right.svg",
    className: "-right-24 top-[8%] w-64 md:w-96",
    width: 384,
    height: 384,
    drift: -12,
    duration: 21,
    delay: -6,
  },
]

const RINGS: Piece[] = [
  {
    src: "/assets/agt/ring-lg.svg",
    className: "-left-10 top-[6%] w-28 md:w-40",
    width: 160,
    height: 160,
    drift: 8,
    duration: 14,
  },
  {
    src: "/assets/agt/ring-sm.svg",
    className: "left-[14%] top-[3%] w-14 md:w-20",
    width: 80,
    height: 80,
    drift: -7,
    duration: 12,
    delay: -3,
  },
  {
    src: "/assets/agt/ring-xs.svg",
    className: "right-[6%] top-[52%] hidden w-12 sm:block md:w-14",
    width: 56,
    height: 56,
    drift: 9,
    duration: 15,
    delay: -5,
  },
  {
    src: "/assets/agt/ring-md.svg",
    className: "-right-8 top-[62%] hidden w-32 sm:block md:w-44",
    width: 176,
    height: 176,
    drift: -10,
    duration: 19,
    delay: -8,
  },
]

const BUBBLES: Piece[] = [
  {
    src: "/assets/agt/bubble.png",
    className: "left-[5%] top-[42%] w-20 md:w-28",
    width: 112,
    height: 140,
    drift: -14,
    duration: 11,
  },
  {
    src: "/assets/agt/bubble.png",
    className: "right-[16%] top-[24%] hidden w-16 blur-[3px] md:block md:w-24",
    width: 96,
    height: 120,
    drift: 12,
    duration: 13,
    delay: -4,
  },
]

const GLYPHS: Piece[] = [
  {
    src: "/assets/agt/icon-dancer.svg",
    className: "left-[8%] top-[62%] w-14 -rotate-[22deg] md:w-20",
    width: 80,
    height: 80,
    drift: -9,
    duration: 9,
  },
  {
    src: "/assets/agt/icon-mic.svg",
    className: "right-[10%] top-[16%] hidden w-14 rotate-12 sm:block md:w-20",
    width: 80,
    height: 80,
    drift: 9,
    duration: 10,
    delay: -3,
  },
]

function Float({ piece, still }: { piece: Piece; still: boolean }) {
  return (
    <motion.div
      className={cn("absolute", piece.className)}
      animate={still || piece.drift === 0 ? undefined : { y: [0, piece.drift, 0] }}
      transition={{
        duration: piece.duration,
        delay: piece.delay ?? 0,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <Image
        src={piece.src}
        alt=""
        width={piece.width}
        height={piece.height}
        unoptimized
        className="h-auto w-full"
      />
    </motion.div>
  )
}

export function ConfettiField({
  /** Drop the ribbon swirls when the hero already has a busy edge. */
  ribbons = true,
  glyphs = true,
  className,
}: {
  ribbons?: boolean
  glyphs?: boolean
  className?: string
}) {
  const reduce = useReducedMotion() ?? false

  const pieces = [
    ...(ribbons ? RIBBONS : []),
    ...RINGS,
    ...BUBBLES,
    ...(glyphs ? GLYPHS : []),
  ]

  return (
    <div
      aria-hidden
      data-slot="confetti-field"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {pieces.map((piece, i) => (
        <Float key={`${piece.src}-${i}`} piece={piece} still={reduce} />
      ))}
    </div>
  )
}
