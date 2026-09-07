import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const pillVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-2 rounded-full font-bold whitespace-nowrap [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        white: "bg-white text-astro-navy shadow-soft-sm",
        blue: "bg-linear-to-r from-astro-blue to-cyan-400 text-white shadow-soft-sm",
        navy: "bg-astro-navy text-white shadow-soft-sm",
        gold: "bg-linear-to-r from-amber-400 to-astro-gold text-astro-navy shadow-soft-sm",
        pink: "bg-linear-to-r from-astro-pink to-pink-400 text-white shadow-soft-sm",
        orange:
          "bg-linear-to-r from-pastel-orange to-orange-300 text-white shadow-soft-sm",
        glass: "bg-white/70 text-astro-navy ring-1 ring-inset ring-white",
      },
      size: {
        sm: "px-3 py-1 text-xs uppercase tracking-wide [&_svg]:size-3",
        md: "px-4 py-1.5 text-sm [&_svg]:size-4",
        lg: "px-6 py-2.5 text-base [&_svg]:size-5",
      },
    },
    defaultVariants: { tone: "white", size: "md" },
  }
)

export type PillProps = React.ComponentProps<"span"> &
  VariantProps<typeof pillVariants>

/** Rounded label chip. Replaces the old `.astro-pill` global class. */
export function Pill({ className, tone, size, ...props }: PillProps) {
  return (
    <span
      data-slot="pill"
      className={cn(pillVariants({ tone, size }), className)}
      {...props}
    />
  )
}

export { pillVariants }
