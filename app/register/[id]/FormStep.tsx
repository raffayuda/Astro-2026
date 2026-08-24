"use client";

import { useMemo } from "react";
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
  buildRegistrationSchema,
  type RegistrationFormValues,
} from "@/src/lib/forms/registration";
import PlayerPhotoField from "./PlayerPhotoField";

interface Props {
  competition: Competition;
  isTeam: boolean;
  regType: 'team' | 'individual';
  formData: RegistrationFormValues;
  setFormData: (data: any) => void;
  onContinue: (registrationId: string, reference: string) => void;
  existingRegId?: string | null;
  existingRef?: string | null;
  maxTeamMembers?: number;
  minTeamMembers?: number;
  /** Competition requires a photo for every player (esports, e.g. MLBB). */
  photoRequired?: boolean;
}

export default function FormStep({
  competition,
  isTeam,
  regType,
  formData,
  setFormData,
  onContinue,
  existingRegId,
  existingRef,
  maxTeamMembers = 5,
  minTeamMembers = 1,
  photoRequired = false,
}: Props) {
  const { create, update } = useRegistrationApi();

  // The leader occupies one slot, so the roster holds the remaining players.
  // Clamp the minimum to the available slots — some competitions are configured
  // with minTeamMembers > maxTeamMembers, which would make the form unsubmittable.
  const memberSlots = Math.max(maxTeamMembers - 1, 1);
  const requiredMembers = Math.min(Math.max(minTeamMembers - 1, 0), memberSlots);

  const schema = useMemo(
    () => buildRegistrationSchema({ isTeam, photoRequired, requiredMembers }),
    [isTeam, photoRequired, requiredMembers],
  );

  // tanstack-form reads defaultValues once, so pre-create every roster slot.
  const defaultValues = useMemo<RegistrationFormValues>(
    () => ({
      ...formData,
      memberDetails: Array.from({ length: memberSlots }, (_, i) => ({
        name: formData.memberDetails?.[i]?.name ?? "",
        photoUrl: formData.memberDetails?.[i]?.photoUrl ?? "",
      })),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const form = useForm({
    defaultValues,
    validators: {
      onChange: schema,
      onSubmit: schema,
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
            regType,
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
    name: Exclude<keyof RegistrationFormValues, "memberDetails">,
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

  const renderPhotoField = (name: "leaderPhotoUrl", label: string) => (
    <form.Field
      name={name}
      children={(field) => {
        const err = field.state.meta.errors?.[0] as
          | { message?: string }
          | undefined;
        return (
          <PlayerPhotoField
            label={label}
            required
            value={field.state.value ?? ""}
            onChange={(url) => field.handleChange(url)}
            error={err?.message}
          />
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
                {photoRequired &&
                  renderPhotoField("leaderPhotoUrl", "Foto Ketua Tim")}
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
                {photoRequired &&
                  renderPhotoField("leaderPhotoUrl", "Foto Pemain")}
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
              <FieldLabel required>
                Anggota Tim (Min. {requiredMembers} selain ketua)
              </FieldLabel>
              {photoRequired && (
                <p className="text-[11px] font-light text-muted-foreground">
                  Setiap pemain wajib melampirkan foto — formal atau non-formal
                  keduanya diterima.
                </p>
              )}
              {Array.from({ length: memberSlots }, (_, i) => (
                <div
                  key={i}
                  className={
                    photoRequired
                      ? "space-y-2 rounded-md border border-border/70 p-3"
                      : undefined
                  }
                >
                  <form.Field
                    name={`memberDetails[${i}].name` as never}
                    children={(field) => {
                      const err = field.state.meta.errors?.[0] as
                        | { message?: string }
                        | undefined;
                      return (
                        <>
                          <Input
                            type="text"
                            value={(field.state.value as string) ?? ""}
                            onBlur={field.handleBlur}
                            onChange={(e) =>
                              field.handleChange(e.target.value as never)
                            }
                            placeholder={`Anggota ${i + 1}${i < requiredMembers ? " (wajib)" : " (opsional)"}`}
                            aria-invalid={!!err}
                          />
                          {err ? (
                            <p className="text-xs font-medium text-destructive">
                              {err.message}
                            </p>
                          ) : null}
                        </>
                      );
                    }}
                  />
                  {photoRequired && (
                    <form.Field
                      name={`memberDetails[${i}].photoUrl` as never}
                      children={(field) => {
                        const err = field.state.meta.errors?.[0] as
                          | { message?: string }
                          | undefined;
                        return (
                          <PlayerPhotoField
                            compact
                            label={`Foto anggota ${i + 1}`}
                            value={(field.state.value as string) ?? ""}
                            onChange={(url) => field.handleChange(url as never)}
                            error={err?.message}
                          />
                        );
                      }}
                    />
                  )}
                </div>
              ))}
              <form.Field
                name="memberDetails"
                children={(field) => {
                  const err = field.state.meta.errors?.[0] as
                    | { message?: string }
                    | undefined;
                  return err ? <FieldError>{err.message}</FieldError> : null;
                }}
              />
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
