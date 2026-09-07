"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const DEPTH = {
  sm: "0 1px 0 #ffffff, 0 3px 0 #93c5fd, 0 5px 0 #3b82f6, 0 7px 0 #1e3a8a, 0 10px 14px rgba(30,58,138,0.3)",
  md: "0 2px 0 #ffffff, 0 4px 0 #93c5fd, 0 7px 0 #3b82f6, 0 10px 0 #1e3a8a, 0 14px 20px rgba(30,58,138,0.32)",
  lg: "0 3px 0 #ffffff, 0 6px 0 #93c5fd, 0 10px 0 #3b82f6, 0 13px 0 #1e3a8a, 0 18px 26px rgba(30,58,138,0.35)",
} as const

const STROKE = { sm: "2px", md: "2px", lg: "3px" } as const

export type ChromeTextProps<T extends React.ElementType = "span"> = {
  as?: T
  depth?: keyof typeof DEPTH
  className?: string
  children?: React.ReactNode
}

/**
 * Glossy stacked-chrome display type — the "ASTRO GOT TALENT" / "Contact Person"
 * headline treatment from the source artwork.
 *
 * Stacked text-shadow layers and -webkit-text-stroke have no Tailwind utility
 * equivalent, so they are applied as inline style here. That keeps the recipe in
 * one component instead of a global CSS class or a bracket soup at each call site.
 */
export function ChromeText<T extends React.ElementType = "span">({
  as,
  depth = "md",
  className,
  children,
  ...rest
}: ChromeTextProps<T> &
  Omit<React.ComponentPropsWithoutRef<T>, keyof ChromeTextProps<T>>) {
  const Comp = (as ?? "span") as React.ElementType

  return (
    <Comp
      data-slot="chrome-text"
      className={cn(
        "font-masterpiece uppercase leading-none text-sky-bottom",
        className
      )}
      style={{
        WebkitTextStroke: `${STROKE[depth]} #ffffff`,
        paintOrder: "stroke fill",
        textShadow: DEPTH[depth],
      }}
      {...rest}
    >
      {children}
    </Comp>
  )
}
