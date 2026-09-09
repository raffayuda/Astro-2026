import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Secondary display line, set in Lexend Exa.
 *
 * The `text-subtitle` token carries the spec's weight, 100% line-height and the
 * very tight -19% tracking, so this component only picks the face and colour.
 */
export function Subtitle({
  as: Comp = "p",
  className,
  children,
  ...rest
}: {
  as?: React.ElementType;
  className?: string;
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Comp
      data-slot="subtitle"
      className={cn("font-subtitle text-subtitle uppercase text-astro-navy", className)}
      {...rest}
    >
      {children}
    </Comp>
  );
}
