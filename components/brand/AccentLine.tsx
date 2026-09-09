import * as React from "react";

import { cn } from "@/lib/utils";

/** Short gradient rule used under section headings. */
export function AccentLine({ wide = false, className }: { wide?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      data-slot="block h-1.5 w-18 rounded-full bg-linear-to-r from-astro-gold via-astro-lime2 to-astro-blue"
      className={cn(
        "block rounded-full bg-linear-to-r from-astro-gold via-astro-lime2 to-astro-blue",
        wide ? "h-1.5 w-35" : "h-1.5 w-18",
        className,
      )}
    />
  );
}
