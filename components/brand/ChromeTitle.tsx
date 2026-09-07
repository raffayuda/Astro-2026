"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Sticker-outline display title, rendered as SVG text.
 *
 * SVG is used rather than `-webkit-text-stroke` because it supports
 * `stroke-linejoin="round"`, which is what produces the soft rounded outline
 * corners of the sticker look. `-webkit-text-stroke` always miters, so sharp
 * letterforms grow spikes, and it is poorly supported outside WebKit.
 *
 * Sizing model: glyphs are laid out at a fixed 100 user-unit font size and the
 * viewBox is fitted to the measured text, so the SVG scales to whatever width
 * its container gives it. Callers control size with the wrapper width, not a
 * font-size.
 */

const FONT_SIZE = 100

/** Stroke width as a fraction of font size. Centred, so half sits outside. */
const STROKE_RATIO = { sm: 0.18, md: 0.24, lg: 0.3 } as const

const DROP_SHADOW = {
  sm: "drop-shadow-md",
  md: "drop-shadow-lg",
  lg: "drop-shadow-xl",
} as const

export function ChromeTitle({
  children,
  depth = "md",
  align = "start",
  fill = "fill-astro-blue",
  stroke = "#ffffff",
  className,
  titleClassName,
}: {
  /** Text to render. Newlines start a new line. */
  children: string
  depth?: "sm" | "md" | "lg"
  align?: "start" | "middle"
  /** Tailwind fill utility for the glyph body. */
  fill?: string
  /** Outline colour. */
  stroke?: string
  className?: string
  titleClassName?: string
}) {
  const lines = React.useMemo(
    () => children.split("\n").map((l) => l.trim()).filter(Boolean),
    [children]
  )

  const strokeWidth = FONT_SIZE * STROKE_RATIO[depth]
  const pad = strokeWidth / 2

  // Pre-measurement estimate keeps SSR output close to final and avoids a jump.
  const longest = lines.reduce((a, b) => (b.length > a.length ? b : a), "")
  const estWidth = Math.max(longest.length * FONT_SIZE * 0.62, FONT_SIZE)
  const estHeight = lines.length * FONT_SIZE

  const [viewBox, setViewBox] = React.useState(
    () =>
      `${-pad} ${-pad} ${estWidth + strokeWidth} ${estHeight + strokeWidth}`
  )

  const groupRef = React.useRef<SVGGElement>(null)

  const measure = React.useCallback(() => {
    const g = groupRef.current
    if (!g) return
    try {
      const b = g.getBBox()
      if (b.width === 0 || b.height === 0) return
      setViewBox(
        `${b.x - pad} ${b.y - pad} ${b.width + strokeWidth} ${b.height + strokeWidth}`
      )
    } catch {
      // getBBox throws when the node is not rendered (display:none); keep the estimate.
    }
  }, [pad, strokeWidth])

  React.useLayoutEffect(() => {
    measure()
    // Web fonts land after first paint, which changes the metrics.
    let cancelled = false
    void document.fonts?.ready.then(() => {
      if (!cancelled) measure()
    })
    return () => {
      cancelled = true
    }
  }, [measure, lines])

  const anchor = align === "middle" ? "middle" : "start"
  const x = align === "middle" ? "50%" : 0

  return (
    <div
      data-slot="chrome-title"
      className={cn("w-full", DROP_SHADOW[depth], className)}
    >
      <svg
        viewBox={viewBox}
        className="block h-auto w-full overflow-visible"
        role="img"
        aria-label={lines.join(" ")}
      >
        <g ref={groupRef}>
          {lines.map((line, i) => (
            <text
              key={i}
              x={x}
              y={FONT_SIZE * (i + 1) - FONT_SIZE * 0.22}
              textAnchor={anchor}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
              strokeLinecap="round"
              paintOrder="stroke fill"
              fontSize={FONT_SIZE}
              className={cn(
                "font-title font-bold uppercase",
                fill,
                titleClassName
              )}
              style={{ letterSpacing: "-0.06em" }}
            >
              {line}
            </text>
          ))}
        </g>
      </svg>
    </div>
  )
}
