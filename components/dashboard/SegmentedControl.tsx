"use client";

import type * as React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

type Option = {
  value: string;
  label: React.ReactNode;
};

/**
 * Quiet segmented control for dashboard forms.
 * Avoids the marketing pill/gradient Toggle styling.
 */
function SegmentedControl({
  value,
  onValueChange,
  options,
  className,
  fullWidth = true,
  size = "sm",
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  className?: string;
  fullWidth?: boolean;
  size?: "sm" | "default";
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => {
        if (v) onValueChange(v);
      }}
      spacing={0}
      size={size}
      className={cn(
        "rounded-md border border-border bg-muted/40 p-0.5",
        fullWidth && "w-full",
        className,
      )}
    >
      {options.map((opt) => (
        <ToggleGroupItem
          key={opt.value}
          value={opt.value}
          className={cn(
            "rounded-sm border-0 bg-transparent font-medium shadow-none",
            "hover:bg-transparent hover:text-foreground",
            "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-xs",
            "data-[state=on]:bg-none aria-pressed:bg-none",
            "data-[state=on]:from-transparent data-[state=on]:to-transparent",
            fullWidth && "flex-1",
          )}
        >
          {opt.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

export { SegmentedControl };
