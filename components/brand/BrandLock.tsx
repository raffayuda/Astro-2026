import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

const SIZE = {
  sm: { pod: "h-11 gap-2 px-3", bem: 28, astro: 26 },
  md: { pod: "h-14 gap-3 px-4", bem: 38, astro: 34 },
  lg: { pod: "h-[85px] gap-4 px-5", bem: 56, astro: 50 },
} as const;

/**
 * The organiser lock-up: BEM STT-NF crest beside the ASTRO mark.
 *
 * `pod` is the white pill from the poster kit. `plain` is just the two marks,
 * for chrome that already has a glass surface (the navbar).
 */
export function BrandLock({
  size = "md",
  tone = "pod",
  className,
}: {
  size?: keyof typeof SIZE;
  tone?: "pod" | "plain";
  className?: string;
}) {
  const s = SIZE[size];

  return (
    <span
      data-slot="brand-lock"
      data-tone={tone}
      className={cn(
        "inline-flex w-fit shrink-0 items-center",
        tone === "pod" && [
          "rounded-full border border-white",
          "bg-linear-to-b from-white via-white/50 to-white shadow-soft-sm",
          s.pod,
        ],
        tone === "plain" && "gap-2",
        className,
      )}
    >
      <Image
        src="/assets/agt/logo-astro-agt.png"
        alt="ASTRO 2026"
        width={s.astro}
        height={Math.round(s.astro * 0.73)}
        className={cn(
          "w-auto object-contain mt-2",
          tone === "plain" ? "h-full" : "h-2/3",
        )}
      />
    </span>
  );
}
