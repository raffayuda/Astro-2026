import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Label-over-value pair for admin detail views.
 */
function DetailItem({
  label,
  icon,
  children,
  className,
}: {
  label: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </span>
      <div className="text-sm font-medium text-foreground">{children}</div>
    </div>
  );
}

export { DetailItem };
