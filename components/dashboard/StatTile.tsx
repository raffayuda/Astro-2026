import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const statToneVariants = cva("rounded-lg border p-3", {
  variants: {
    tone: {
      blue: "border-astro-cyan-2 bg-sky-bottom text-astro-blue",
      emerald: "border-emerald-200 bg-emerald-50 text-emerald-600",
      green: "border-green-200 bg-green-50 text-green-600",
      amber: "border-amber-200 bg-amber-50 text-amber-600",
      rose: "border-rose-200 bg-rose-50 text-rose-600",
      neutral: "border-border bg-muted text-muted-foreground",
    },
  },
  defaultVariants: { tone: "blue" },
})

/**
 * Metric tile for admin overviews. Marketing pages use `StatCard` from
 * `@/components/brand`; this is its product-chrome counterpart so the
 * dashboard never reaches into the brand kit.
 */
function StatTile({
  label,
  value,
  icon,
  tone,
  className,
}: {
  label: React.ReactNode
  value: React.ReactNode
  icon?: React.ReactNode
  tone?: VariantProps<typeof statToneVariants>["tone"]
  className?: string
}) {
  return (
    <Card className={cn("bg-white", className)}>
      <CardContent className="flex items-start gap-4">
        {icon ? (
          <div className={cn(statToneVariants({ tone }), "[&_svg]:size-5")}>
            {icon}
          </div>
        ) : null}
        <div className="min-w-0">
          <p className="text-10 font-black uppercase tracking-[0.15em] text-astro-blue/70">
            {label}
          </p>
          <p className="mt-1 truncate text-2xl font-black text-astro-navy">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export { StatTile, statToneVariants }
