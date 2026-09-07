"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Stacked hard shadows for the glossy "chrome" treatment (the big ASTRO
 * wordmarks). No Tailwind equivalent exists for a multi-layer text-shadow, so
 * this stays inline style, owned by this one component.
 */
const CHROME_DEPTH = {
  sm: "0 1px 0 #ffffff, 0 3px 0 #93c5fd, 0 5px 0 #3b82f6, 0 7px 0 #1e3a8a, 0 10px 14px rgba(30,58,138,0.3)",
  md: "0 2px 0 #ffffff, 0 4px 0 #93c5fd, 0 7px 0 #3b82f6, 0 10px 0 #1e3a8a, 0 14px 20px rgba(30,58,138,0.32)",
  lg: "0 3px 0 #ffffff, 0 6px 0 #93c5fd, 0 10px 0 #3b82f6, 0 13px 0 #1e3a8a, 0 18px 26px rgba(30,58,138,0.35)",
} as const

/**
 * Stroke widths in `em`, not `px`, so the outline stays proportional from a
 * 2rem heading up to the 162px hero. The outline variant is calibrated to the
 * reference (8px stroke at ~72px type) rather than the thinner chrome stroke.
 */
const CHROME_STROKE = { sm: "0.03em", md: "0.045em", lg: "0.06em" } as const
const OUTLINE_STROKE = { sm: "0.08em", md: "0.11em", lg: "0.13em" } as const

const DROP_SHADOW = {
  sm: "drop-shadow-sm",
  md: "drop-shadow-md",
  lg: "drop-shadow-lg",
} as const

export type ChromeTextProps<T extends React.ElementType = "span"> = {
  as?: T
  /**
   * `chrome`  — stacked gloss layers, for the big hero wordmarks.
   * `outline` — solid blue fill, thick white outline, single drop shadow. This
   *             is the committee-card name treatment; `drop-shadow` is used
   *             rather than `text-shadow` because it follows the glyph *and*
   *             its stroke, giving a true sticker silhouette.
   */
  variant?: "chrome" | "outline"
  depth?: "sm" | "md" | "lg"
  className?: string
  children?: React.ReactNode
}

/**
 * Display type in Alexandria.
 *
 * Size, weight, line-height and tracking come from the `text-title`,
 * `text-title-sm` and `text-subtitle` theme tokens.
 */
export function ChromeText<T extends React.ElementType = "span">({
  as,
  variant = "chrome",
  depth = "md",
  className,
  children,
  ...rest
}: ChromeTextProps<T> &
  Omit<React.ComponentPropsWithoutRef<T>, keyof ChromeTextProps<T>>) {
  const Comp = (as ?? "span") as React.ElementType
  const isOutline = variant === "outline"

  return (
    <Comp
      data-slot="chrome-text"
      data-variant={variant}
      className={cn(
        "font-title uppercase",
        isOutline
          ? cn("font-black tracking-tight text-astro-blue", DROP_SHADOW[depth])
          : "text-sky-bottom",
        className
      )}
      style={
        isOutline
          ? {
              WebkitTextStroke: `${OUTLINE_STROKE[depth]} #ffffff`,
              paintOrder: "stroke fill",
            }
          : {
              WebkitTextStroke: `${CHROME_STROKE[depth]} #ffffff`,
              paintOrder: "stroke fill",
              textShadow: CHROME_DEPTH[depth],
            }
      }
      {...rest}
    >
      {children}
    </Comp>
  )
}

/**
 * The raw inline style, for elements that cannot be swapped for `ChromeText`
 * itself — motion components, for instance, where the element type is fixed.
 * Pair it with `font-title uppercase text-sky-bottom` (or, for the outline
 * variant, `font-title font-black uppercase text-astro-blue drop-shadow-lg`).
 */
export function chromeTextStyle(
  variant: "chrome" | "outline" = "chrome",
  depth: "sm" | "md" | "lg" = "md"
): React.CSSProperties {
  if (variant === "outline") {
    return {
      WebkitTextStroke: `${OUTLINE_STROKE[depth]} #ffffff`,
      paintOrder: "stroke fill",
    }
  }
  return {
    WebkitTextStroke: `${CHROME_STROKE[depth]} #ffffff`,
    paintOrder: "stroke fill",
    textShadow: CHROME_DEPTH[depth],
  }
}
