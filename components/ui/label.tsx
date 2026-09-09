"use client";

import * as React from "react";
import { Label as LabelPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Form label.
 *
 * `variant="micro"` is the ASTRO micro-label treatment used above every field in
 * the registration and dashboard forms: 10px, black weight, wide tracking.
 */
function Label({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & {
  variant?: "default" | "micro";
}) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      data-variant={variant}
      className={cn(
        "flex items-center gap-2 leading-none select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        variant === "default" && "text-sm font-semibold text-astro-navy",
        variant === "micro" && "text-10 font-black uppercase tracking-widest text-ink",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
