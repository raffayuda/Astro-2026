import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Zigzag chevron ribbon — the lime/blue/gold banded frame that runs along the top
 * and bottom edges of the artwork panels.
 *
 * The repeating triangle pattern is a layered CSS gradient with no Tailwind
 * utility equivalent, so it lives in this component's inline style rather than a
 * global class.
 */
export function ChevronRibbon({
  edge = "top",
  className,
}: {
  edge?: "top" | "bottom";
  className?: string;
}) {
  return (
    <div
      aria-hidden
      data-slot="chevron-ribbon"
      className={cn(
        "pointer-events-none absolute inset-x-0 z-20 h-3.5 bg-astro-blue",
        edge === "top" ? "top-0" : "bottom-0",
        className,
      )}
      style={{
        backgroundImage:
          "linear-gradient(135deg, #a3e635 25%, transparent 25%), linear-gradient(225deg, #a3e635 25%, transparent 25%)",
        backgroundSize: "22px 22px",
        boxShadow: edge === "top" ? "inset 0 -3px 0 #facc15" : "inset 0 3px 0 #facc15",
      }}
    />
  );
}
