"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Outlined display title, rendered as SVG text.
 *
 * SVG rather than `-webkit-text-stroke` because only SVG supports
 * `stroke-linejoin="round"`, which is what keeps the outline corners soft;
 * `-webkit-text-stroke` always miters, so sharp letterforms sprout spikes.
 *
 * One clean white outline and a single soft drop shadow. No layered offsets.
 *
 * Sizing is container-driven: glyphs lay out at a fixed 100 user-unit font size
 * and the viewBox is fitted to the measured text, so the title scales to
 * whatever width its container gives it.
 */

const FONT_SIZE = 100

/** Outline width as a fraction of font size. Centred, so half sits outside. */
const STROKE_RATIO = { sm: 0.1, md: 0.14, lg: 0.18 } as const

const DROP_SHADOW = {
  sm: "drop-shadow-sm",
  md: "drop-shadow-md",
  lg: "drop-shadow-lg",
} as const

export function ChromeTitle({
  children,
  depth = "md",
  align = "left",
  fill = "fill-astro-blue",
  stroke = "#ffffff",
  outline = true,
  className,
}: {
  /** Text to render. Newlines start a new line. */
  children: string
  depth?: "sm" | "md" | "lg"
  /** `left`/`center`/`right`; `start`/`middle` accepted as SVG-flavoured aliases. */
  align?: "left" | "center" | "right" | "start" | "middle"
  /** Tailwind fill utility for the glyph body. */
  fill?: string
  /** Outline colour. */
  stroke?: string
  /** Set false for a flat title with no outline at all. */
  outline?: boolean
  className?: string
}) {
  const lines = React.useMemo(
    () =>
      children
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
    [children]
  )

  const strokeWidth = outline ? FONT_SIZE * STROKE_RATIO[depth] : 0
  const pad = Math.max(strokeWidth / 2, 2)

  // Pre-measurement estimate keeps SSR close to final and avoids a visible jump.
  const longest = lines.reduce((a, b) => (b.length > a.length ? b : a), "")
  const estWidth = Math.max(longest.length * FONT_SIZE * 0.6, FONT_SIZE)
  const estHeight = lines.length * FONT_SIZE * 0.98

  const [viewBox, setViewBox] = React.useState(
    () => `${-pad} ${-pad} ${estWidth + pad * 2} ${estHeight + pad * 2}`
  )

  const groupRef = React.useRef<SVGGElement>(null)

  const measure = React.useCallback(() => {
    const g = groupRef.current
    if (!g) return
    try {
      const b = g.getBBox()
      if (b.width === 0 || b.height === 0) return
      setViewBox(
        `${b.x - pad} ${b.y - pad} ${b.width + pad * 2} ${b.height + pad * 2}`
      )
    } catch {
      // getBBox throws for nodes that are not rendered; keep the estimate.
    }
  }, [pad])

  React.useLayoutEffect(() => {
    measure()
    // Web fonts land after first paint and change the metrics.
    let cancelled = false
    void document.fonts?.ready.then(() => {
      if (!cancelled) measure()
    })
    return () => {
      cancelled = true
    }
  }, [measure, lines])

  const anchor =
    align === "middle" || align === "center"
      ? "middle"
      : align === "right"
        ? "end"
        : "start"
  const x = anchor === "middle" ? "50%" : anchor === "end" ? "100%" : 0

  return (
    <div
      data-slot="chrome-title"
      className={cn("w-full", outline && DROP_SHADOW[depth], className)}
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
              key={`${i}-${line}`}
              x={x}
              y={FONT_SIZE * 0.78 + i * FONT_SIZE * 0.98}
              textAnchor={anchor}
              stroke={outline ? stroke : undefined}
              strokeWidth={strokeWidth || undefined}
              strokeLinejoin="round"
              strokeLinecap="round"
              paintOrder="stroke fill"
              fontSize={FONT_SIZE}
              className={cn("font-title font-bold uppercase", fill)}
              style={{ letterSpacing: "-0.045em" }}
            >
              {line}
            </text>
          ))}
        </g>
      </svg>
    </div>
  )
}
