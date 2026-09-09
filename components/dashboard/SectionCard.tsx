import type * as React from "react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

/**
 * Panel wrapper for dashboard sections: inline forms, list containers, detail
 * blocks. Replaces the hand-rolled `<Card><CardContent><h2 class="text-sm
 * font-black uppercase">` stack that was copied across every admin route.
 */
function SectionCard({
  title,
  description,
  actions,
  icon,
  children,
  className,
  bodyClassName,
}: {
  title?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}) {
  const hasHeader = Boolean(title || description || actions)

  return (
    <Card className={cn("border border-border", className)}>
      {hasHeader ? (
        <CardHeader>
          {title ? (
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-tight text-foreground">
              {icon}
              {title}
            </CardTitle>
          ) : null}
          {description ? (
            <CardDescription className="text-xs">{description}</CardDescription>
          ) : null}
          {actions ? <CardAction>{actions}</CardAction> : null}
        </CardHeader>
      ) : null}
      <CardContent className={cn(hasHeader && "pt-0", bodyClassName)}>
        {children}
      </CardContent>
    </Card>
  )
}

export { SectionCard }
