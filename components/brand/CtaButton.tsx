"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button, type buttonVariants } from "@/components/ui/button"
import type { VariantProps } from "class-variance-authority"

type Tone = NonNullable<VariantProps<typeof buttonVariants>["variant"]>

/**
 * Primary call-to-action — "DAFTAR SEGERA >" from the component style guide.
 *
 * A gradient pill with a white ring and a circled chevron. Renders as a Next
 * `Link` when `href` is given, otherwise a button, so the same visual is reused
 * for navigation and for submits.
 */
export function CtaButton({
  children,
  href,
  tone = "default",
  size = "lg",
  showChevron = true,
  className,
  ...props
}: {
  children: React.ReactNode
  href?: string
  tone?: Tone
  size?: "default" | "lg" | "xl"
  showChevron?: boolean
  className?: string
} & Omit<React.ComponentProps<"button">, "children" | "className">) {
  const content = (
    <>
      <span className="uppercase tracking-wide">{children}</span>
      {showChevron && (
        <span
          aria-hidden
          className="grid size-5 place-items-center rounded-full bg-white/25 ring-1 ring-inset ring-white/60"
        >
          <ChevronRight className="size-4" />
        </span>
      )}
    </>
  )

  const classes = cn(
    "ring-3 ring-white/70 shadow-gloss transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.97]",
    className,
  )

  if (href) {
    return (
      <Button asChild variant={tone} size={size} className={classes}>
        <Link href={href} data-icon="inline-end">
          {content}
        </Link>
      </Button>
    )
  }

  return (
    <Button
      variant={tone}
      size={size}
      className={classes}
      data-icon="inline-end"
      {...props}
    >
      {content}
    </Button>
  )
}
