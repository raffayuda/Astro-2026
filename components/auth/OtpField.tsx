"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export function OtpField({
  id,
  value,
  onChange,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <Field data-disabled={disabled}>
      <FieldLabel htmlFor={id} required>
        Kode verifikasi
      </FieldLabel>
      <InputOTP
        id={id}
        maxLength={6}
        pattern={REGEXP_ONLY_DIGITS}
        value={value}
        onChange={onChange}
        disabled={disabled}
        inputMode="numeric"
        autoComplete="one-time-code"
        aria-describedby={`${id}-help`}
        containerClassName="w-full"
        required
      >
        <InputOTPGroup className="w-full">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <InputOTPSlot key={index} index={index} className="h-12 min-w-0 flex-1" />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <FieldDescription id={`${id}-help`}>
        Masukkan 6 digit kode. Berlaku selama 10 menit.
      </FieldDescription>
    </Field>
  );
}
