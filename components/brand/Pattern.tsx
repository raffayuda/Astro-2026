import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Dotted + diagonal-stripe texture overlay.
 *
 * Three layered gradients with a fixed tile size, which has no Tailwind utility
 * equivalent, so the recipe lives here as inline style instead of a global CSS
 * class. Parent must be `relative`.
 */
export function Pattern({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      data-slot="pattern"
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundImage: [
          "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.32) 0 0.35rem, transparent 0.38rem)",
          "linear-gradient(135deg, rgba(147,197,253,0.18) 25%, transparent 25%)",
          "linear-gradient(225deg, rgba(59,130,246,0.12) 25%, transparent 25%)",
        ].join(", "),
        backgroundSize: "2.8rem 2.8rem, 4rem 4rem, 4rem 4rem",
      }}
    />
  );
}
