import * as React from "react"

import { cn } from "@/lib/utils"
import { ChevronRibbon } from "./ChevronRibbon"
import { SkyBackdrop } from "./SkyBackdrop"

/**
 * Standard page-section wrapper: sky ground, optional chevron ribbon frame,
 * decorative bubbles/clouds, and a centered content container.
 *
 * Every public section composes this instead of repeating the old
 * `bg-linear-to-b from-sky-top via-sky-mid to-white astro-frame-y astro-bubble-field` class trio.
 */
export function SectionShell({
  id,
  sky = "bright",
  ribbon = false,
  clouds = true,
  bubbles = "sparse",
  width = "default",
  className,
  containerClassName,
  children,
}: {
  id?: string
  sky?: "bright" | "soft" | "none"
  ribbon?: boolean
  clouds?: boolean
  bubbles?: "sparse" | "dense" | "corners" | "none"
  width?: "default" | "narrow" | "wide" | "full"
  className?: string
  containerClassName?: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      data-slot="section-shell"
      className={cn("relative isolate overflow-hidden", className)}
    >
      {sky !== "none" && (
        <SkyBackdrop tone={sky} clouds={clouds} bubbles={bubbles} />
      )}

      {ribbon && (
        <>
          <ChevronRibbon edge="top" />
          <ChevronRibbon edge="bottom" />
        </>
      )}

      <div
        className={cn(
          "relative z-10 mx-auto w-full px-4 sm:px-6",
          width === "narrow" && "max-w-3xl",
          width === "default" && "max-w-6xl",
          width === "wide" && "max-w-7xl",
          containerClassName
        )}
      >
        {children}
      </div>
    </section>
  )
}
