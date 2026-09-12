import * as React from "react";
import { Check, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Surface } from "./Surface";

/**
 * Metric / channel tile.
 *
 * Nested inside a WindowCard the tiles stay on standard ink/tint so the
 * gradient lives only in the window header. `checked` is the exposure grid.
 */
export function StatCard({
  icon: Icon,
  metric,
  label,
  hint,
  checked = false,
  className,
}: {
  icon?: LucideIcon;
  metric?: string;
  label: string;
  hint?: string;
  checked?: boolean;
  className?: string;
}) {
  if (checked) {
    return (
      <Surface
        data-slot="stat-card"
        tone="plain"
        radius="xl"
        pad="md"
        interactive
        className={cn("flex h-full flex-col items-center gap-2 text-center", className)}
      >
        <span
          aria-hidden
          className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-astro-lime2 text-white"
        >
          <Check className="size-3" />
        </span>
        {Icon && (
          <span className="grid size-11 place-items-center rounded-full bg-sky-bottom text-astro-blue">
            <Icon aria-hidden className="size-5" />
          </span>
        )}
        <p className="text-10 font-bold uppercase tracking-wide text-ink sm:text-xs">{label}</p>
        {hint && <p className="text-11 font-medium leading-relaxed text-ink/70">{hint}</p>}
      </Surface>
    );
  }

  return (
    <Surface
      data-slot="stat-card"
      tone="tint"
      radius="xl"
      pad="md"
      className={cn("flex h-full flex-col items-center gap-2 text-center", className)}
    >
      {Icon && (
        <span className="grid size-11 place-items-center rounded-full bg-white text-astro-blue shadow-soft-sm">
          <Icon aria-hidden className="size-5" />
        </span>
      )}
      {metric && (
        <p className="font-title text-2xl leading-none text-astro-navy sm:text-3xl">{metric}</p>
      )}
      <p className="text-10 font-bold uppercase tracking-wide text-ink sm:text-xs">{label}</p>
      {hint && <p className="text-11 font-medium leading-relaxed text-ink/70">{hint}</p>}
    </Surface>
  );
}
