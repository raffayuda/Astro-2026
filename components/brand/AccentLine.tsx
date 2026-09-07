import * as React from "react"

import { cn } from "@/lib/utils"

/** Short gradient rule used under section headings. */
export function AccentLine({
  wide = false,
  className,
}: {
  wide?: boolean
  className?: string
}) {
  return (
    <span
      aria-hidden
      data-slot="accent-line"
      className={cn(
        "block rounded-full bg-gradient-to-r from-astro-gold via-astro-lime2 to-astro-blue",
        wide ? "h-1.5 w-35" : "h-1.5 w-18",
        className
      )}
    />
  )
}
