"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/** Stacked hard shadows for the glossy "chrome" treatment. */
const CHROME_DEPTH = {
  sm: "0 1px 0 #ffffff, 0 3px 0 #93c5fd, 0 5px 0 #3b82f6, 0 7px 0 #1e3a8a, 0 10px 14px rgba(30,58,138,0.3)",
  md: "0 2px 0 #ffffff, 0 4px 0 #93c5fd, 0 7px 0 #3b82f6, 0 10px 0 #1e3a8a, 0 14px 20px rgba(30,58,138,0.32)",
  lg: "0 3px 0 #ffffff, 0 6px 0 #93c5fd, 0 10px 0 #3b82f6, 0 13px 0 #1e3a8a, 0 18px 26px rgba(30,58,138,0.35)",
} as const

/** Soft single drop shadow for the outlined treatment. */
const OUTLINE_DEPTH = {
  sm: "0 3px 6px rgba(30,58,138,0.25)",
  md: "0 5px 10px rgba(30,58,138,0.28)",
  lg: "0 8px 16px rgba(30,58,138,0.3)",
} as const

const STROKE = { sm: "3px", md: "5px", lg: "7px" } as const

/**
 * The raw inline style, for elements that cannot be swapped for `ChromeText`
 * itself — motion components, for instance, where the element type is fixed.
 * Pair it with `font-title uppercase text-sky-bottom` (or `text-astro-blue`
 * for the outline variant).
 */
export function chromeTextStyle(
  variant: "chrome" | "outline" = "chrome",
  depth: "sm" | "md" | "lg" = "md"
): React.CSSProperties {
  return {
    WebkitTextStroke: `${STROKE[depth]} #ffffff`,
    paintOrder: "stroke fill",
    textShadow: variant === "outline" ? OUTLINE_DEPTH[depth] : CHROME_DEPTH[depth],
  }
}

export type ChromeTextProps<T extends React.ElementType = "span"> = {
  as?: T
  /**
   * `chrome`  — stacked gloss layers, for the big hero wordmarks.
   * `outline` — solid blue fill with a thick white outline, for names and
   *             section heroes (the committee-card treatment).
   */
  variant?: "chrome" | "outline"
  depth?: "sm" | "md" | "lg"
  className?: string
  children?: React.ReactNode
}

/**
 * Display type in Alexandria.
 *
 * Stacked text-shadow layers and -webkit-text-stroke have no Tailwind utility
 * equivalent, so they are applied as inline style here. That keeps the recipe in
 * one component rather than a global CSS class or bracket soup at each call site.
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
        isOutline ? "text-astro-blue" : "text-sky-bottom",
        className
      )}
      style={{
        WebkitTextStroke: `${STROKE[depth]} #ffffff`,
        paintOrder: "stroke fill",
        textShadow: isOutline ? OUTLINE_DEPTH[depth] : CHROME_DEPTH[depth],
      }}
      {...rest}
    >
      {children}
    </Comp>
  )
}
