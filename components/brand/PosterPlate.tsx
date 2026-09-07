import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * The cream title plate from the ASTRO GOT TALENT poster.
 *
 * Figma frame 795:2 draws a 702x635 `#fff2d0` panel carrying an inset bottom
 * shadow, with a pink banner pinned to its top edge that overhangs the panel by
 * roughly 1.6% on each side. The overhang is what makes the banner read as a
 * separate ribbon laid over the plate rather than a header row inside it, so it
 * is reproduced as a percentage and survives any width the plate is given.
 */
export function PosterPlate({
  banner,
  children,
  className,
  contentClassName,
}: {
  /** Text for the ribbon across the top edge. Omit for a plain plate. */
  banner?: React.ReactNode
  children: React.ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <div
      data-slot="poster-plate"
      className={cn(
        "relative rounded-xl bg-agt-cream shadow-plate",
        banner ? "pt-14 md:pt-16" : "pt-6",
        className,
      )}
    >
      {banner && (
        <div
          className={cn(
            "absolute inset-x-[-1.6%] top-0 grid h-12 place-items-center rounded-xl md:h-14",
            "bg-linear-to-b from-pink-400 to-agt-pink shadow-inset-top",
          )}
        >
          <span className="font-title text-xl font-bold uppercase tracking-[0.18em] text-white md:text-2xl">
            {banner}
          </span>
        </div>
      )}

      <div className={cn("px-5 pb-6 sm:px-8 md:pb-8", contentClassName)}>{children}</div>
    </div>
  )
}
