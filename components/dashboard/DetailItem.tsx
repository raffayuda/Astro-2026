import type * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Label-over-value pair used across admin detail views. Keeps the label
 * micro-caps treatment and the value weight consistent instead of repeating
 * the same two spans at every field.
 */
function DetailItem({
  label,
  icon,
  children,
  className,
}: {
  label: React.ReactNode
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-0.5", className)}>
      <span className="flex items-center gap-1 text-10 font-bold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </span>
      <div className="text-sm font-medium text-foreground">{children}</div>
    </div>
  )
}

export { DetailItem }
