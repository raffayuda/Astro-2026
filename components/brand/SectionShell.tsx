import * as React from "react";

import { cn } from "@/lib/utils";
import { ChevronRibbon } from "./ChevronRibbon";
import { Pattern } from "./Pattern";
import { SkyBackdrop } from "./SkyBackdrop";

/** Section bands. Tint/mid are sky washes. Pink and gold follow poster tags. Never cream. */
const BAND = {
  none: "",
  white: "bg-white/80 backdrop-blur-md",
  tint: "bg-sky-bottom/80 backdrop-blur-md",
  mid: "bg-sky-mid/75 backdrop-blur-md",
  pink: "bg-astro-pink/12",
  gold: "bg-astro-gold/30",
  navy: "bg-astro-navy text-white",
} as const;

/** The single vertical rhythm scale. Replaces ad-hoc py-10/py-18/py-20/py-32. */
const SPACE = {
  none: "",
  sm: "py-10 md:py-14",
  md: "py-14 md:py-20",
  lg: "py-20 md:py-28",
} as const;

/**
 * Standard page-section wrapper: one band, one rhythm step, one container.
 *
 * Page sky lives on PageShell. A section asks for extra sky, pattern, bubbles,
 * or a chevron ribbon only when that section is a poster-style set piece.
 */
export function SectionShell({
  id,
  band = "none",
  space = "md",
  sky = "none",
  ribbon = false,
  clouds = false,
  bubbles = "none",
  pattern = false,
  width = "default",
  className,
  containerClassName,
  children,
}: {
  id?: string;
  /** Band fill. White/tint/mid are sky washes. Pink and gold match poster tags. */
  band?: keyof typeof BAND;
  /** Vertical rhythm step. */
  space?: keyof typeof SPACE;
  /** Extra sky wash for a hero or set-piece. */
  sky?: "bright" | "soft" | "none";
  ribbon?: boolean;
  clouds?: boolean;
  bubbles?: "sparse" | "dense" | "corners" | "none";
  pattern?: boolean;
  width?: "default" | "narrow" | "wide" | "full";
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      data-slot="section-shell"
      data-band={band}
      className={cn(
        "relative isolate scroll-mt-24",
        BAND[band],
        SPACE[space],
        (ribbon || sky !== "none" || pattern) && "overflow-hidden",
        className,
      )}
    >
      {sky !== "none" && <SkyBackdrop tone={sky} clouds={clouds} bubbles={bubbles} />}
      {pattern && <Pattern />}

      {ribbon && (
        <>
          <ChevronRibbon edge="top" />
          <ChevronRibbon edge="bottom" />
        </>
      )}

      <div
        className={cn(
          "relative z-10 mx-auto w-full px-4 sm:px-8",
          width === "narrow" && "max-w-3xl",
          width === "default" && "max-w-6xl",
          width === "wide" && "max-w-7xl",
          containerClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}
