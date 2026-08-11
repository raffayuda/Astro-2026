"use client";

import { useForm } from "@tanstack/react-form";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import type { Competition } from "@/types/astro";
import { useRegistrationApi } from "@/src/lib/hooks/use-registration";
import {
  registrationFormSchema,
  type RegistrationFormValues,
} from "@/src/lib/forms/registration";

interface Props {
  competition: Competition;
  isTeam: boolean;
  formData: RegistrationFormValues;
  setFormData: (data: any) => void;
  onContinue: (registrationId: string, reference: string) => void;
  existingRegId?: string | null;
  existingRef?: string | null;
  maxTeamMembers?: number;
  minTeamMembers?: number;
}

export default function FormStep({
  competition,
  isTeam,
  formData,
  setFormData,
  onContinue,
  existingRegId,
  existingRef,
  maxTeamMembers = 5,
  minTeamMembers = 1,
}: Props) {
  const { create, update } = useRegistrationApi();

  const form = useForm({
    defaultValues: formData as RegistrationFormValues,
    validators: {
      onChange: registrationFormSchema,
      onSubmit: registrationFormSchema,
    },
    onSubmit: async ({ value }) => {
      setFormData(value);

      try {
        if (existingRegId) {
          const reg = await update(existingRegId, value);
          if (reg) onContinue(existingRegId, existingRef || "");
        } else {
          const reg = await create(
            competition.id,
            isTeam ? "team" : "individual",
            value,
          );
          if (reg) onContinue(reg.id, reg.paymentReference ?? "");
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal menyimpan data");
      }
    },
  });

  const renderField = (
    name: keyof RegistrationFormValues,
    label: string,
    type: string,
    placeholder: string,
    opts?: { sanitize?: (v: string) => string; className?: string; required?: boolean },
  ) => (
    <form.Field
      name={name}
      children={(field) => {
        const err = field.state.meta.errors?.[0] as
          | { message?: string }
          | undefined;
        const fieldId = `field-${String(name)}`;
        return (
          <Field data-invalid={!!err}>
            <FieldLabel htmlFor={fieldId} required={opts?.required}>
              {label}
            </FieldLabel>
            <Input
              id={fieldId}
              type={type}
              value={field.state.value ?? ""}
              onBlur={field.handleBlur}
              onChange={(e) =>
                field.handleChange(
                  opts?.sanitize
                    ? opts.sanitize(e.target.value)
                    : e.target.value,
                )
              }
              placeholder={placeholder}
              aria-invalid={!!err}
            />
            {err ? (
              <FieldError>{err.message ?? "Field wajib diisi"}</FieldError>
            ) : null}
          </Field>
        );
      }}
    />
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-8"
    >
      {/* Section title */}
      <div>
        <h2 className="text-lg font-black uppercase tracking-tight text-foreground">
          Data Pendaftaran
        </h2>
        <p className="mt-1 text-xs font-light text-muted-foreground">
          Isi data dengan benar untuk pendaftaran lomba{" "}
          <strong>{competition.title}</strong>.
        </p>
      </div>

      <Card className="clip-angled relative border-border">
        <div
          className="absolute -top-px -left-px size-8 bg-primary"
          style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
        />

        <CardContent className="space-y-5 p-6 md:p-8">
          <FieldGroup className="gap-5">
            {isTeam ? (
              <>
                {renderField(
                  "teamName",
                  "Nama Tim",
                  "text",
                  "Masukkan nama tim Anda",
                  { required: true },
                )}
                {renderField(
                  "leaderName",
                  "Nama Ketua Tim",
                  "text",
                  "Nama lengkap ketua tim",
                  { required: true },
                )}
                {renderField(
                  "leaderIdentity",
                  "Nomor Identitas Ketua (NISN / KTP / Kartu Pelajar)",
                  "text",
                  "Nomor identitas ketua",
                  { sanitize: (v) => v.replace(/\D/g, "") },
                )}
              </>
            ) : (
              <>
                {renderField(
                  "fullName",
                  "Nama Lengkap",
                  "text",
                  "Nama lengkap pendaftar",
                )}
                {renderField(
                  "identityNumber",
                  "Nomor Identitas (NISN / KTP / Kartu Pelajar)",
                  "text",
                  "Nomor identitas pendaftar",
                  { sanitize: (v) => v.replace(/\D/g, "") },
                )}
              </>
            )}

            {renderField(
              "institution",
              "Sekolah / Instansi",
              "text",
              "Asal sekolah atau instansi",
              { required: true },
            )}

            {renderField(
              "email",
              `Alamat Email${isTeam ? " Ketua" : ""}`,
              "email",
              "contoh@email.com",
              { required: true },
            )}

            {renderField(
              "whatsapp",
              `Nomor WhatsApp${isTeam ? " Ketua" : ""}`,
              "tel",
              "62812XXXXXXXX",
              { sanitize: (v) => v.replace(/\D/g, ""), required: true },
            )}
          </FieldGroup>

          {/* Anggota Tim (team only) */}
          {isTeam && (
            <Field>
              <FieldLabel required>Anggota Tim (Min. {minTeamMembers})</FieldLabel>
              {Array.from({ length: maxTeamMembers }, (_, i) => (
                <form.Field
                  key={i}
                  name="members"
                  children={(field) => {
                    const arr = (field.state.value ?? "")
                      .split("\n")
                      .filter(Boolean);
                    return (
                      <Input
                        type="text"
                        value={arr[i] || ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          arr[i] = e.target.value;
                          field.handleChange(arr.filter(Boolean).join("\n"));
                        }}
                        placeholder={`Anggota ${i + 1}${i < minTeamMembers ? " (wajib)" : " (opsional)"}`}
                      />
                    );
                  }}
                />
              ))}
            </Field>
          )}
        </CardContent>
      </Card>

      {/* Submit button */}
      <form.Subscribe
        selector={(s) => ({ isSubmitting: s.isSubmitting })}
        children={({ isSubmitting }) => (
          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className="clip-angled w-full text-sm font-black uppercase tracking-wider active:scale-95"
          >
            {isSubmitting ? (
              <>
                <Spinner data-icon="inline-start" />
                Memproses Pendaftaran...
              </>
            ) : (
              <>
                Lanjut ke Pembayaran
                <ChevronRight data-icon="inline-end" />
              </>
            )}
          </Button>
        )}
      />
    </form>
  );
}
