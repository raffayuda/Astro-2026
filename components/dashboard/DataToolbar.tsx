"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";
import { SearchField } from "./SearchField";

/**
 * Search + filter row for list pages. Search is optional; put selects/buttons in children.
 */
function DataToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Cari...",
  children,
  className,
}: {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center",
        className,
      )}
    >
      {onSearchChange ? (
        <SearchField
          value={search ?? ""}
          onValueChange={onSearchChange}
          placeholder={searchPlaceholder}
          className="w-full sm:max-w-sm sm:flex-1"
        />
      ) : null}
      {children ? (
        <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">
          {children}
        </div>
      ) : null}
    </div>
  );
}

export { DataToolbar };
