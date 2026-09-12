import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border-2 border-transparent px-2.5 py-0.5 text-11 font-bold uppercase tracking-wide whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "border-white bg-astro-blue text-white shadow-sticker-sm [a]:hover:brightness-110",
        secondary:
          "border-astro-navy bg-astro-gold text-astro-navy shadow-sticker-sm [a]:hover:brightness-105",
        destructive:
          "border-red-400 bg-red-50 text-red-700 focus-visible:ring-destructive/20 [a]:hover:bg-red-100",
        outline: "border-astro-navy bg-white text-astro-navy [a]:hover:bg-sky-bottom",
        ghost: "hover:bg-white/70 hover:text-astro-blue",
        link: "text-astro-blue underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
