"use client";

import { useMemo, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { FileText } from "lucide-react";
import { CtaButton } from "@/components/brand/CtaButton";
import { TalentCategoryCard, talentMeta } from "@/components/brand/TalentCategoryCard";
import { WindowCard } from "@/components/brand/WindowCard";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  setFormData: (data: RegistrationFormValues) => void;
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
        gameId: formData.memberDetails?.[i]?.gameId ?? "",
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
      setFormData(current);
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
  }, [form, competition?.id, regType, setFormData]);

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
          <Field data-invalid={!!err} className={opts?.className}>
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
      className="flex flex-col gap-6"
    >
      <WindowCard title="Data pendaftaran" bodyClassName="gap-6">
          <p className="text-sm text-ink/70">
            Isi data dengan benar untuk lomba <strong>{competition.title}</strong>.
          </p>
          <FieldGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {isTeam ? (
              <>
                {renderField(
                  "teamName",
                  "Nama tim",
                  "text",
                  "Masukkan nama tim",
                  { required: true, className: "sm:col-span-2" },
                )}
                {renderField(
                  "leaderName",
                  "Nama ketua",
                  "text",
                  "Nama lengkap ketua tim",
                  { required: true },
                )}
                {renderField(
                  "leaderIdentity",
                  "NIM / nomor pelajar ketua",
                  "text",
                  "Nomor identitas ketua",
                  { sanitize: (v) => v.replace(/\D/g, "") },
                )}
                {photoRequired &&
                  renderField(
                    "leaderGameId",
                    "ID akun ketua",
                    "text",
                    "Contoh: 123456789 (1234)",
                    { required: true },
                  )}
                {photoRequired &&
                  renderPhotoField("leaderPhotoUrl", "Foto ketua tim")}
              </>
            ) : (
              <>
                {renderField(
                  "fullName",
                  "Nama lengkap",
                  "text",
                  "Nama lengkap pendaftar",
                  { required: true },
                )}
                {renderField(
                  "identityNumber",
                  "NIM / nomor pelajar",
                  "text",
                  "Nomor identitas pendaftar",
                  { sanitize: (v) => v.replace(/\D/g, "") },
                )}
                {photoRequired &&
                  renderField(
                    "leaderGameId",
                    "ID akun pemain",
                    "text",
                    "Contoh: 123456789 (1234)",
                    { required: true },
                  )}
                {photoRequired &&
                  renderPhotoField("leaderPhotoUrl", "Foto peserta")}
              </>
            )}

            {renderField(
              "institution",
              "Sekolah / instansi",
              "text",
              "Asal sekolah atau instansi",
              { required: true, className: "sm:col-span-2" },
            )}

            {renderField(
              "email",
              `Alamat email${isTeam ? " ketua" : ""}`,
              "email",
              "contoh@email.com",
              { required: true },
            )}

            {renderField(
              "whatsapp",
              `Nomor WhatsApp${isTeam ? " ketua" : ""}`,
              "tel",
              "62812XXXXXXXX",
              { sanitize: (v) => v.replace(/\D/g, ""), required: true },
            )}
          </FieldGroup>

          {/* Anggota Tim (team only) */}
          {isTeam && (
            <FieldSet>
              <FieldLegend variant="label">
                Anggota tim (min. {requiredMembers} selain ketua)
              </FieldLegend>
              {photoRequired && (
                <p className="text-11 font-light text-muted-foreground">
                  Setiap pemain wajib mengisi ID akun dan melampirkan foto. Foto
                  formal atau non-formal keduanya diterima.
                </p>
              )}
              {Array.from({ length: memberSlots }, (_, i) => {
                const isRequiredSlot = i < requiredMembers;
                const nameId = `member-${i}-name`;
                const gameIdId = `member-${i}-game-id`;
                return (
                  <div
                    key={i}
                    className={
                      photoRequired
                        ? "flex flex-col gap-4 rounded-xl border border-astro-cyan-2/60 bg-white/60 p-4"
                        : undefined
                    }
                  >
                    {photoRequired && (
                      <p className="text-11 font-black uppercase tracking-wider text-astro-navy">
                        Anggota {i + 1}
                        <span className="ml-1.5 font-medium normal-case tracking-normal text-ink/60">
                          {isRequiredSlot ? "(wajib)" : "(opsional)"}
                        </span>
                      </p>
                    )}

                    <form.Field
                      name={`memberDetails[${i}].name` as never}
                      children={(field) => {
                        const err = field.state.meta.errors?.[0] as
                          | { message?: string }
                          | undefined;
                        return (
                          <Field data-invalid={!!err}>
                            <FieldLabel htmlFor={nameId} required={isRequiredSlot}>
                              {photoRequired
                                ? "Nama lengkap"
                                : `Nama anggota ${i + 1}${isRequiredSlot ? "" : " (opsional)"}`}
                            </FieldLabel>
                            <Input
                              id={nameId}
                              type="text"
                              value={(field.state.value as string) ?? ""}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value as never)
                              }
                              placeholder="Nama sesuai identitas"
                              aria-invalid={!!err}
                            />
                            {err ? <FieldError>{err.message}</FieldError> : null}
                          </Field>
                        );
                      }}
                    />

                    {photoRequired && (
                      <form.Field
                        name={`memberDetails[${i}].gameId` as never}
                        children={(field) => {
                          const err = field.state.meta.errors?.[0] as
                            | { message?: string }
                            | undefined;
                          return (
                            <Field data-invalid={!!err}>
                              <FieldLabel htmlFor={gameIdId} required>
                                ID akun
                              </FieldLabel>
                              <Input
                                id={gameIdId}
                                type="text"
                                value={(field.state.value as string) ?? ""}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                  field.handleChange(e.target.value as never)
                                }
                                placeholder="Contoh: 123456789 (1234)"
                                aria-invalid={!!err}
                              />
                              {err ? <FieldError>{err.message}</FieldError> : null}
                            </Field>
                          );
                        }}
                      />
                    )}

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
                              required
                              label="Foto pemain"
                              value={(field.state.value as string) ?? ""}
                              onChange={(url) => field.handleChange(url as never)}
                              error={err?.message}
                            />
                          );
                        }}
                      />
                    )}
                  </div>
                );
              })}
              <form.Field
                name="memberDetails"
                children={(field) => {
                  const err = field.state.meta.errors?.[0] as
                    | { message?: string }
                    | undefined;
                  return err ? <FieldError>{err.message}</FieldError> : null;
                }}
              />
            </FieldSet>
          )}

          {/* ─── FIELD KHUSUS KOMPETISI (DYNAMIC) ─── */}
          {customFields && customFields.length > 0 && (
            <div className="flex flex-col gap-5 border-t border-sky-mid/50 pt-6">
              <div>
                <h3 className="flex items-center gap-2 font-heading text-sm font-bold text-astro-navy">
                  <FileText className="size-4 text-astro-blue" />
                  {customFields.some((field) => field.id === "talent_category")
                    ? "Aksi di panggung"
                    : "Berkas khusus lomba"}
                </h3>
                <p className="mt-0.5 text-xs text-ink/65">
                  Lengkapi sesuai ketentuan guidebook <strong>{competition.title}</strong>.
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
                                <p className="text-11 font-normal text-muted-foreground -mt-1">
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

                  if (field.type === "select" && field.id === "talent_category") {
                    return (
                      <form.Field
                        key={field.id}
                        name={fieldName as never}
                        children={(subField) => {
                          const err = subField.state.meta.errors?.[0] as
                            | { message?: string }
                            | undefined;
                          const value = (subField.state.value as string) ?? "";
                          return (
                            <Field data-invalid={!!err}>
                              <FieldLabel required={field.required}>{field.label}</FieldLabel>
                              {field.description && (
                                <p className="text-xs text-ink/65">{field.description}</p>
                              )}
                              <div className="grid grid-cols-2 gap-3 min-[400px]:grid-cols-3 sm:grid-cols-4">
                                {(field.options || []).map((opt) => {
                                  const meta = talentMeta(opt);
                                  return (
                                    <TalentCategoryCard
                                      key={opt}
                                      id={meta.id}
                                      label={meta.label}
                                      size="mini"
                                      selected={value === opt}
                                      onSelect={() => subField.handleChange(opt as never)}
                                    />
                                  );
                                })}
                              </div>
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
                                <p className="text-11 font-normal text-muted-foreground -mt-1">
                                  {field.description}
                                </p>
                              )}
                              <select
                                id={fieldId}
                                value={(subField.state.value as string) ?? ""}
                                onBlur={subField.handleBlur}
                                onChange={(e) => subField.handleChange(e.target.value as never)}
                                aria-invalid={!!err}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
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
                              <p className="text-11 font-normal text-muted-foreground -mt-1">
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
      </WindowCard>

      <form.Subscribe
        selector={(s) => ({ isSubmitting: s.isSubmitting })}
        children={({ isSubmitting }) => (
          <CtaButton type="submit" disabled={isSubmitting} size="lg" className="w-full sm:ml-auto sm:w-auto">
            {isSubmitting ? "Memproses" : "Lanjut ke pembayaran"}
          </CtaButton>
        )}
      />
    </form>
  );
}
