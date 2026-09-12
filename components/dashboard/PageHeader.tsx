import type * as React from "react";
import { Calendar } from "lucide-react";
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
  date,
  showDate = false,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  date?: React.ReactNode;
  showDate?: boolean;
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
      {actions || showDate || date ? (
        <div className="flex flex-wrap items-center gap-2">
          {actions}
          {(showDate || date) && (
            <div className="flex items-center gap-2 rounded-lg border border-astro-cyan-2/60 bg-white/70 px-3 py-1.5 text-xs text-muted-foreground shadow-2xs">
              <Calendar className="size-3.5 text-astro-blue shrink-0" />
              <span>
                Today is{" "}
                <strong className="font-bold text-astro-navy">
                  {date ||
                    new Date().toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                </strong>
              </span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export { PageHeader };
