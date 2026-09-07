"use client";

import { useMemo, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import type { Competition, CompetitionCustomField } from "@/types/astro";
import { useRegistrationApi } from "@/src/lib/hooks/use-registration";
import {
  buildRegistrationSchema,
  type RegistrationFormValues,
} from "@/src/lib/forms/registration";
import PlayerPhotoField from "./PlayerPhotoField";
import CustomFieldUpload from "./CustomFieldUpload";

interface Props {
  competition: Competition;
  isTeam: boolean;
  regType: 'team' | 'individual';
  formData: RegistrationFormValues;
  setFormData: (data: any) => void;
  onContinue: (
    registrationId: string,
    reference: string,
    paymentLinkUrl?: string | null,
    paymentExpiresAt?: string | null,
    paymentCode?: string | null,
    paymentCodeType?: string | null,
  ) => void;
  existingRegId?: string | null;
  existingRef?: string | null;
  existingPaymentLinkUrl?: string | null;
  existingPaymentExpiresAt?: string | null;
  maxTeamMembers?: number;
  minTeamMembers?: number;
  /** Competition requires a photo for every player (esports, e.g. MLBB). */
  photoRequired?: boolean;
  customFields?: CompetitionCustomField[];
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
  existingPaymentLinkUrl,
  existingPaymentExpiresAt,
  maxTeamMembers = 5,
  minTeamMembers = 1,
  photoRequired = false,
  customFields = [],
}: Props) {
  const { create, update } = useRegistrationApi();

  // The leader occupies one slot, so the roster holds the remaining players.
  // Clamp the minimum to the available slots — some competitions are configured
  // with minTeamMembers > maxTeamMembers, which would make the form unsubmittable.
  const memberSlots = Math.max(maxTeamMembers - 1, 1);
  const requiredMembers = Math.min(Math.max(minTeamMembers - 1, 0), memberSlots);

  const schema = useMemo(
    () => buildRegistrationSchema({ isTeam, photoRequired, requiredMembers, customFields }),
    [isTeam, photoRequired, requiredMembers, customFields],
  );

  // tanstack-form reads defaultValues once, so pre-create every roster slot.
  const defaultValues = useMemo<RegistrationFormValues>(
    () => ({
      ...formData,
      customFields: formData.customFields ?? {},
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
          if (reg) {
            onContinue(
              existingRegId,
              existingRef || "",
              existingPaymentLinkUrl,
              existingPaymentExpiresAt,
            );
          }
        } else {
          const reg = await create(
            competition.id,
            regType,
            value,
          );
          if (reg) {
            onContinue(
              reg.id,
              reg.paymentReference ?? "",
              reg.paymentLinkUrl,
              reg.paymentExpiresAt as unknown as string | null,
              (reg as any).paymentCode ?? null,
              (reg as any).paymentCodeType ?? null,
            );
          }
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal menyimpan data");
      }
    },
  });

  // Auto-save form inputs to localStorage on any change so refresh won't lose data
  useEffect(() => {
    const sub = form.store.subscribe(() => {
      const current = form.state.values;
      if (current && competition?.id && typeof window !== "undefined") {
        try {
          localStorage.setItem(
            `astro_reg_draft_${competition.id}`,
            JSON.stringify({ values: current, regType }),
          );
        } catch {}
      }
    });
    return () => {
      if (typeof sub === "function") {
        (sub as any)();
      } else if (sub && typeof (sub as any).unsubscribe === "function") {
        (sub as any).unsubscribe();
      }
    };
  }, [form, competition?.id, regType]);

  const renderField = (
    name: Exclude<keyof RegistrationFormValues, "memberDetails" | "customFields">,
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
                  "Nomor Identitas Ketua (NIM / Kartu Pelajar)",
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
                  "Nomor Identitas (NIM / Kartu Pelajar)",
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

          {/* ─── FIELD KHUSUS KOMPETISI (DYNAMIC) ─── */}
          {customFields && customFields.length > 0 && (
            <div className="space-y-5 pt-5 border-t border-border/70">
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Informasi & Berkas Khusus Lomba
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground font-light">
                  Lengkapi data khusus di bawah ini sesuai ketentuan juknis resmi <strong>{competition.title}</strong>.
                </p>
              </div>

              <FieldGroup className="gap-5">
                {customFields.map((field) => {
                  const fieldName = `customFields.${field.id}`;
                  if (field.type === 'image') {
                    return (
                      <form.Field
                        key={field.id}
                        name={fieldName as never}
                        children={(subField) => {
                          const err = subField.state.meta.errors?.[0] as
                            | { message?: string }
                            | undefined;
                          return (
                            <CustomFieldUpload
                              label={field.label}
                              description={field.description}
                              required={field.required}
                              value={(subField.state.value as string) ?? ""}
                              onChange={(url) => subField.handleChange(url as never)}
                              error={err?.message}
                            />
                          );
                        }}
                      />
                    );
                  }

                  if (field.type === 'textarea') {
                    return (
                      <form.Field
                        key={field.id}
                        name={fieldName as never}
                        children={(subField) => {
                          const err = subField.state.meta.errors?.[0] as
                            | { message?: string }
                            | undefined;
                          const fieldId = `field-custom-${field.id}`;
                          return (
                            <Field data-invalid={!!err}>
                              <FieldLabel htmlFor={fieldId} required={field.required}>
                                {field.label}
                              </FieldLabel>
                              {field.description && (
                                <p className="text-[11px] font-normal text-muted-foreground -mt-1">
                                  {field.description}
                                </p>
                              )}
                              <Textarea
                                id={fieldId}
                                value={(subField.state.value as string) ?? ""}
                                onBlur={subField.handleBlur}
                                onChange={(e) => subField.handleChange(e.target.value as never)}
                                placeholder={field.placeholder || `Masukkan ${field.label.toLowerCase()}`}
                                aria-invalid={!!err}
                                rows={3}
                              />
                              {err ? <FieldError>{err.message}</FieldError> : null}
                            </Field>
                          );
                        }}
                      />
                    );
                  }

                  if (field.type === 'select') {
                    return (
                      <form.Field
                        key={field.id}
                        name={fieldName as never}
                        children={(subField) => {
                          const err = subField.state.meta.errors?.[0] as
                            | { message?: string }
                            | undefined;
                          const fieldId = `field-custom-${field.id}`;
                          return (
                            <Field data-invalid={!!err}>
                              <FieldLabel htmlFor={fieldId} required={field.required}>
                                {field.label}
                              </FieldLabel>
                              {field.description && (
                                <p className="text-[11px] font-normal text-muted-foreground -mt-1">
                                  {field.description}
                                </p>
                              )}
                              <select
                                id={fieldId}
                                value={(subField.state.value as string) ?? ""}
                                onBlur={subField.handleBlur}
                                onChange={(e) => subField.handleChange(e.target.value as never)}
                                aria-invalid={!!err}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm dark:bg-slate-900"
                              >
                                <option value="">-- Pilih {field.label} --</option>
                                {(field.options || []).map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                              {err ? <FieldError>{err.message}</FieldError> : null}
                            </Field>
                          );
                        }}
                      />
                    );
                  }

                  // Default: input text
                  return (
                    <form.Field
                      key={field.id}
                      name={fieldName as never}
                      children={(subField) => {
                        const err = subField.state.meta.errors?.[0] as
                          | { message?: string }
                          | undefined;
                        const fieldId = `field-custom-${field.id}`;
                        return (
                          <Field data-invalid={!!err}>
                            <FieldLabel htmlFor={fieldId} required={field.required}>
                              {field.label}
                            </FieldLabel>
                            {field.description && (
                              <p className="text-[11px] font-normal text-muted-foreground -mt-1">
                                {field.description}
                              </p>
                            )}
                            <Input
                              id={fieldId}
                              type="text"
                              value={(subField.state.value as string) ?? ""}
                              onBlur={subField.handleBlur}
                              onChange={(e) => subField.handleChange(e.target.value as never)}
                              placeholder={field.placeholder || `Masukkan ${field.label.toLowerCase()}`}
                              aria-invalid={!!err}
                            />
                            {err ? <FieldError>{err.message}</FieldError> : null}
                          </Field>
                        );
                      }}
                    />
                  );
                })}
              </FieldGroup>
            </div>
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
