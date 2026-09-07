"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type ChromeTextProps<T extends React.ElementType = "span"> = {
  as?: T
  /** `blue` for emphasis on light grounds, `white` on saturated sky. */
  tone?: "blue" | "navy" | "white" | "gold"
  className?: string
  children?: React.ReactNode
}

const TONE = {
  blue: "text-astro-blue",
  navy: "text-astro-navy",
  white: "text-white",
  gold: "text-astro-gold",
} as const

/**
 * Inline display emphasis — the highlighted word inside a heading, as in
 * "Our <ChromeText>Committee</ChromeText>".
 *
 * Deliberately plain: display face, heavier weight, accent colour. The previous
 * stacked text-shadow "chrome" treatment was removed because layered offsets
 * muddy the letterforms at body-heading sizes and read as dated. The outlined
 * sticker look now lives only in ChromeTitle, where the size carries it.
 */
export function ChromeText<T extends React.ElementType = "span">({
  as,
  tone = "blue",
  className,
  children,
  ...rest
}: ChromeTextProps<T> &
  Omit<React.ComponentPropsWithoutRef<T>, keyof ChromeTextProps<T>>) {
  const Comp = (as ?? "span") as React.ElementType

  return (
    <Comp
      data-slot="chrome-text"
      className={cn("font-title font-bold", TONE[tone], className)}
      {...rest}
    >
      {children}
    </Comp>
  )
}
