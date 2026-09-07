import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const surfaceVariants = cva("relative", {
  variants: {
    tone: {
      /** Default white card, per the component style guide. */
      plain: "bg-white text-ink shadow-soft",
      /** Pale sky tint, for nested/secondary surfaces. */
      tint: "bg-sky-bottom text-astro-navy shadow-soft-sm",
      /** Blue gradient panel — inverted, for page headers. */
      blue: "bg-gradient-to-br from-astro-navy via-astro-blue to-blue-400 text-white shadow-soft-lg",
      /** Pink gradient panel — the "Event Detail / Benefit" card. */
      pink: "bg-gradient-to-br from-astro-pink to-pink-300 text-white shadow-glow-pink",
      /** Orange, for talent/category surfaces. */
      orange:
        "bg-gradient-to-br from-pastel-orange to-orange-300 text-white shadow-glow-orange",
      /** Gold, for price and highlight surfaces. */
      gold: "bg-gradient-to-br from-amber-400 to-astro-gold text-astro-navy shadow-soft",
      /** Poster-style hard sticker outline. */
      sticker: "border-2 border-astro-navy bg-white text-ink shadow-sticker",
    },
    radius: {
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      "2xl": "rounded-2xl",
      full: "rounded-full",
    },
    pad: {
      none: "",
      sm: "p-3",
      md: "p-5",
      lg: "p-6 sm:p-8",
      xl: "p-8 sm:p-10",
    },
    interactive: {
      true: "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft-lg",
      false: "",
    },
  },
  defaultVariants: {
    tone: "plain",
    radius: "xl",
    pad: "md",
    interactive: false,
  },
})

export type SurfaceProps = React.ComponentProps<"div"> &
  VariantProps<typeof surfaceVariants> & { asChild?: boolean }

/** The single card/panel primitive. Replaces the old `.astro-card` global class. */
export function Surface({
  className,
  tone,
  radius,
  pad,
  interactive,
  ...props
}: SurfaceProps) {
  return (
    <div
      data-slot="surface"
      data-tone={tone ?? "plain"}
      className={cn(
        surfaceVariants({ tone, radius, pad, interactive }),
        className
      )}
      {...props}
    />
  )
}

export { surfaceVariants }
