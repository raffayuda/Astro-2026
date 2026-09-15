import type * as React from "react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Panel wrapper for dashboard sections: forms, lists, detail blocks.
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
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  const hasHeader = Boolean(title || description || actions);

  return (
    <Card className={cn("shadow-none", className)}>
      {hasHeader ? (
        <CardHeader className={cn(bodyClassName?.includes("px-0") && "border-b")}>
          {title ? (
            <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
              {icon}
              {title}
            </CardTitle>
          ) : null}
          {description ? <CardDescription>{description}</CardDescription> : null}
          {actions ? <CardAction>{actions}</CardAction> : null}
        </CardHeader>
      ) : null}
      <CardContent className={cn(hasHeader && "pt-0", bodyClassName)}>{children}</CardContent>
    </Card>
  );
}

export { SectionCard };
