import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Window card from the ASTRO 2026 brand kit (Why Partner / Brand Exposure
 * slides): white plate, blue gradient title bar, optional red close dot.
 *
 * Use this for stats grids, FAQ stacks, and any panel that should read as a
 * UI window sitting on the sky.
 */
const PAD = {
  default: "p-4 sm:p-6",
  compact: "p-4",
} as const;

export function WindowCard({
  title,
  close = true,
  onClose,
  pad = "default",
  className,
  bodyClassName,
  children,
}: {
  title: React.ReactNode;
  /** Decorative close control from the kit. Interactive only when `onClose` is set. */
  close?: boolean;
  onClose?: () => void;
  /** Listing cards use compact so the body hugs content. */
  pad?: keyof typeof PAD;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-slot="window-card"
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl bg-white shadow-soft-lg ring-1 ring-white/80 sm:rounded-3xl",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 bg-linear-to-r from-astro-navy via-astro-blue to-astro-sky px-4 py-2.5 sm:px-5">
        <h2 className="min-w-0 truncate font-heading text-sm font-black tracking-tight text-white sm:text-base">
          {title}
        </h2>
        {close && onClose && (
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="size-5 shrink-0 rounded-full bg-[#ff4d4d] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] ring-2 ring-white/70"
          />
        )}
      </div>
      <div className={cn("flex min-h-0 flex-1 flex-col", PAD[pad], bodyClassName)}>{children}</div>
    </div>
  );
}
