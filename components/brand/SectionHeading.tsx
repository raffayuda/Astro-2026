import * as React from "react";

import { cn } from "@/lib/utils";
import { Pill, type PillProps } from "./Pill";

/**
 * Section opener: optional colored pill (Timeline / Materi / Benefit from the
 * Cerdas Cermat posters), display title, optional lead.
 */
export function SectionHeading({
  eyebrow,
  pillTone = "pink",
  title,
  lead,
  align = "center",
  chrome = false,
  className,
}: {
  eyebrow?: string;
  /** Pill color when `eyebrow` is set. Matches poster section tags. */
  pillTone?: PillProps["tone"];
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: "center" | "start";
  /** Blue display title instead of navy. For poster-style pages. */
  chrome?: boolean;
  className?: string;
}) {
  return (
    <div
      data-slot="section-heading"
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "mx-auto max-w-2xl items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow && (
        <Pill tone={pillTone} size="sm" className="shadow-gloss">
          {eyebrow}
        </Pill>
      )}

      <h2
        className={cn(
          "font-heading text-2xl font-black tracking-tight text-balance sm:text-3xl md:text-4xl",
          chrome ? "text-astro-blue" : "text-astro-navy",
        )}
      >
        {title}
      </h2>

      {lead && (
        <p className="max-w-2xl text-sm font-medium leading-relaxed text-ink/75 sm:text-base">
          {lead}
        </p>
      )}
    </div>
  );
}
