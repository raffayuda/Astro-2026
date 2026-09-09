"use client"

import { Search } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

/**
 * Single search control for every admin list. Call sites used to re-assemble
 * the InputGroup by hand with drifting heights and radii.
 */
function SearchField({
  value,
  onValueChange,
  placeholder = "Cari...",
  className,
  "aria-label": ariaLabel,
}: {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  "aria-label"?: string
}) {
  return (
    <InputGroup className={cn("h-10 rounded-lg", className)}>
      <InputGroupAddon align="inline-start">
        <Search className="size-3.5 text-muted-foreground" />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="text-xs font-medium"
      />
    </InputGroup>
  )
}

export { SearchField }
