import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Grass hill from the Cerdas Cermat hero posters. Sit the mascot on top.
 */
export function GrassStrip({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      data-slot="grass-strip"
      viewBox="0 0 1440 160"
      preserveAspectRatio="none"
      className={cn("pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full md:h-36", className)}
    >
      <defs>
        <linearGradient id="astro-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7cf0c1" />
          <stop offset="1" stopColor="#3ed08f" />
        </linearGradient>
      </defs>
      <path
        d="M0 96C260 56 520 108 760 84C1040 56 1240 104 1440 80V160H0V96Z"
        fill="url(#astro-grass)"
      />
    </svg>
  )
}
