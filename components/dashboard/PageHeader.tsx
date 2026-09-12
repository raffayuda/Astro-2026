import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Title block every dashboard route opens with. Keeps the h1 scale, the
 * description tone, and the action alignment identical across pages so the
 * routes stop drifting apart (`text-2xl` vs `text-3xl`, `font-light` vs not).
 */
function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export { PageHeader };
