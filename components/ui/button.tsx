import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-bold whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-[3px] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-[3px] border-white bg-gradient-to-b from-astro-blue to-astro-navy text-white shadow-[var(--shadow-sticker-lg),var(--shadow-gloss)] hover:brightness-110 hover:shadow-[0_8px_0_#1e3a8a,var(--shadow-gloss)] active:shadow-[var(--shadow-sticker-sm),var(--shadow-gloss)]",
        outline:
          "border-[3px] border-astro-navy bg-white text-astro-navy shadow-[var(--shadow-sticker-sm),var(--shadow-gloss)] hover:bg-sky-bottom hover:text-astro-blue active:shadow-none aria-expanded:bg-sky-bottom aria-expanded:text-astro-blue",
        secondary:
          "border-[3px] border-white bg-gradient-to-r from-astro-blue to-astro-cyan-2 text-white shadow-[var(--shadow-sticker),var(--shadow-gloss)] hover:brightness-105 active:shadow-[var(--shadow-sticker-sm),var(--shadow-gloss)] aria-expanded:brightness-105",
        gold: "border-[3px] border-astro-navy bg-gradient-to-b from-astro-gold to-amber-500 text-astro-navy shadow-[var(--shadow-sticker),var(--shadow-gloss)] hover:brightness-105 active:shadow-[var(--shadow-sticker-sm),var(--shadow-gloss)]",
        talent:
          "border-[3px] border-astro-navy bg-gradient-to-b from-pastel-orange to-orange-400 text-white shadow-[var(--shadow-sticker),var(--shadow-gloss)] hover:brightness-105 active:shadow-[var(--shadow-sticker-sm),var(--shadow-gloss)]",
        ghost:
          "hover:bg-white/70 hover:text-astro-blue aria-expanded:bg-white aria-expanded:text-astro-blue",
        destructive:
          "border-[3px] border-red-400 bg-red-50 text-red-700 shadow-[0_2px_0_#b91c1c] hover:bg-red-100 active:shadow-none focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
        link: "text-astro-blue underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-10 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-6 gap-1 px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 px-3 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 px-6 text-base has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        icon: "size-9",
        "icon-xs":
          "size-6 in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-10",
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
