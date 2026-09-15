"use client";

import type * as React from "react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

/**
 * Consistent page frame for every dashboard route.
 */
function PageShell({
  children,
  className,
  narrow,
  loading,
}: {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn("mx-auto w-full space-y-6", narrow ? "max-w-2xl" : "max-w-7xl", className)}>
      {children}
    </div>
  );
}

export { PageShell };
