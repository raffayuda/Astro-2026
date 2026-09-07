import * as React from "react"

import { cn } from "@/lib/utils"
import { AccentLine } from "./AccentLine"
import { Pill } from "./Pill"

/** Eyebrow pill + chrome display title + accent rule + optional lead paragraph. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "center",
  chrome = true,
  className,
}: {
  eyebrow?: string
  title: React.ReactNode
  lead?: React.ReactNode
  align?: "center" | "start"
  chrome?: boolean
  className?: string
}) {
  return (
    <div
      data-slot="section-heading"
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {eyebrow && (
        <Pill tone="white" size="sm">
          {eyebrow}
        </Pill>
      )}

      <h2
        className={cn(
          "font-title text-3xl font-bold uppercase tracking-tight sm:text-4xl lg:text-5xl",
          chrome ? "text-astro-blue" : "text-astro-navy"
        )}
      >
        {title}
      </h2>

      <AccentLine />

      {lead && (
        <p className="max-w-2xl text-sm font-medium text-ink sm:text-base">{lead}</p>
      )}
    </div>
  )
}
