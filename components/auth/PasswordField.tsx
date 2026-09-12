"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

export function PasswordField({
  id,
  description,
  ...props
}: Omit<ComponentProps<typeof InputGroupInput>, "type"> & { id: string; description?: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <Field data-disabled={props.disabled}>
      <FieldLabel htmlFor={id} required={props.required}>
        Kata sandi
      </FieldLabel>
      <InputGroup className="h-11">
        <InputGroupInput
          {...props}
          id={id}
          type={visible ? "text" : "password"}
          aria-describedby={description ? `${id}-help` : undefined}
        />
        <InputGroupAddon align="inline-end">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={props.disabled}
            aria-label={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            aria-pressed={visible}
            onClick={() => setVisible((current) => !current)}
          >
            {visible ? <EyeOff /> : <Eye />}
          </Button>
        </InputGroupAddon>
      </InputGroup>
      {description && <FieldDescription id={`${id}-help`}>{description}</FieldDescription>}
    </Field>
  );
}
