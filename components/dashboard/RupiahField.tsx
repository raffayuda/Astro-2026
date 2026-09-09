"use client";

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

/** Digits only, grouped the Indonesian way (35.000). */
function formatRupiah(value: string | number) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat("id-ID").format(Number(digits));
}

/**
 * Money input with an `Rp` addon. Reports both the numeric amount and the
 * grouped display string so callers can keep the raw value in their form
 * state without re-implementing the formatting on every fee field.
 */
function RupiahField({
  value,
  display,
  onValueChange,
  placeholder = "50.000",
  className,
  inputClassName,
  "aria-label": ariaLabel = "Nominal rupiah",
}: {
  value: number;
  display?: string;
  onValueChange: (amount: number, display: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  "aria-label"?: string;
}) {
  const shown = display ?? (value ? formatRupiah(value) : "");

  return (
    <InputGroup className={cn("h-10 rounded-md", className)}>
      <InputGroupAddon align="inline-start">
        <span className="text-sm font-bold text-muted-foreground">Rp</span>
      </InputGroupAddon>
      <InputGroupInput
        type="text"
        inputMode="numeric"
        aria-label={ariaLabel}
        value={shown}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, "");
          onValueChange(digits ? Number.parseInt(digits, 10) : 0, formatRupiah(digits));
        }}
        placeholder={placeholder}
        className={cn("font-semibold", inputClassName)}
      />
    </InputGroup>
  );
}

export { RupiahField, formatRupiah };
