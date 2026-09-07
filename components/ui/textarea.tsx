import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-md border-2 border-astro-cyan-2 bg-white px-3 py-2 text-base text-ink shadow-soft-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-astro-blue focus-visible:ring-3 focus-visible:ring-astro-blue/40 disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
