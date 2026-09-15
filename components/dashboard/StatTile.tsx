import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const statToneVariants = cva("flex size-9 shrink-0 items-center justify-center rounded-lg border", {
  variants: {
    tone: {
      blue: "border-sky-200 bg-sky-50 text-sky-700",
      emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
      green: "border-green-200 bg-green-50 text-green-700",
      amber: "border-amber-200 bg-amber-50 text-amber-700",
      rose: "border-rose-200 bg-rose-50 text-rose-700",
      neutral: "border-border bg-muted text-muted-foreground",
    },
  },
  defaultVariants: { tone: "blue" },
});

/**
 * Metric tile for admin overviews. Product chrome only - not brand StatCard.
 */
function StatTile({
  label,
  value,
  icon,
  tone,
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  icon?: React.ReactNode;
  tone?: VariantProps<typeof statToneVariants>["tone"];
  className?: string;
}) {
  return (
    <Card size="sm" className={cn("shadow-none", className)}>
      <CardContent className="flex items-start gap-3">
        {icon ? (
          <div className={cn(statToneVariants({ tone }), "[&_svg]:size-4")}>{icon}</div>
        ) : null}
        <div className="min-w-0 space-y-0.5">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="truncate text-xl font-semibold tracking-tight text-foreground tabular-nums">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export { StatTile, statToneVariants };
