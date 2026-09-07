import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * ASTRO 2026 button.
 *
 * Every value below resolves to a real Tailwind v4 utility backed by a token in
 * app/globals.css — no arbitrary bracket classes. Variant and size names are
 * unchanged from the shadcn radix-nova originals because 49 files consume them.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border-2 border-transparent bg-clip-padding font-bold whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-white bg-gradient-to-r from-astro-navy via-astro-blue to-cyan-400 text-white shadow-glow-blue hover:brightness-110 hover:shadow-soft-lg",
        outline:
          "border-astro-cyan-2 bg-white text-astro-navy shadow-soft-sm hover:border-astro-blue hover:text-astro-blue aria-expanded:border-astro-blue aria-expanded:text-astro-blue",
        secondary:
          "border-white bg-gradient-to-r from-astro-blue to-astro-cyan-2 text-white shadow-soft hover:brightness-105",
        gold: "border-white bg-gradient-to-r from-amber-400 to-astro-gold text-astro-navy shadow-soft hover:brightness-105",
        talent:
          "border-white bg-gradient-to-r from-pastel-orange to-orange-300 text-white shadow-glow-orange hover:brightness-105",
        pink: "border-white bg-gradient-to-r from-astro-pink to-pink-400 text-white shadow-glow-pink hover:brightness-105",
        ghost:
          "text-astro-navy hover:bg-white hover:text-astro-blue hover:shadow-soft-sm aria-expanded:bg-white aria-expanded:text-astro-blue",
        destructive:
          "border-red-200 bg-red-50 text-red-700 shadow-soft-sm hover:bg-red-100 focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
        link: "border-transparent text-astro-blue underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-10 gap-2 px-5 text-sm has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-3.5 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-13 gap-2.5 px-7 text-base tracking-wide has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xl: "h-15 gap-3 px-9 text-lg tracking-wide has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-5",
        icon: "size-10",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-12 [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
