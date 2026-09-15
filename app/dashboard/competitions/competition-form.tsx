"use client";

import type * as React from "react";
import { Plus, Trash2, X } from "lucide-react";
import GuidebookSectionsBuilder from "@/components/admin/GuidebookSectionsBuilder";
import CustomFieldsBuilder from "@/components/admin/CustomFieldsBuilder";
import {
  FormActions,
  RupiahField,
  SectionCard,
  SegmentedControl,
  formatRupiah,
} from "@/components/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { CompetitionCustomField, CompetitionGuidebookSection } from "@/src/db/schema";
import { isFlagOn, type FlagLike } from "@/lib/flags";
import { toDateInputValue, toIsoOrNull } from "@/lib/date";
import { apiHelpers } from "@/src/lib/api";

export type Competition = Awaited<ReturnType<typeof apiHelpers.competitions.list>>[number];

type CompetitionExtras = {
  isFree?: FlagLike;
  hasBatches?: FlagLike;
  playerPhotoRequired?: FlagLike;
  isActive?: FlagLike;
  origin?: string;
  batches?: CompetitionBatchItem[];
  prizes?: { label: string; value: string }[];
  guidebookSections?: CompetitionGuidebookSection[];
  customFields?: CompetitionCustomField[];
};

export function compExtras(comp: Competition): CompetitionExtras {
  return comp as unknown as CompetitionExtras;
}

export interface CategoryOption {
  id: string;
  label: string;
}

export interface CompetitionBatchItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  fee: number;
  feeDisplay?: string;
}

export const emptyCompetitionForm = {
  id: "",
  title: "",
  category: "akademik",
  type: "individual",
  maxTeamMembers: 5,
  minTeamMembers: 3,
  membersRequired: "required",
  tagline: "",
  description: "",
  fee: 0,
  hasBatches: false,
  batches: [] as CompetitionBatchItem[],
  maxSlots: 0,
  filledSlots: 0,
  scheduleDate: "",
  location: "",
  prizes: [] as { label: string; value: string }[],
  rulesSummary: "",
  rulebookUrl: "",
  guidebookSections: [] as CompetitionGuidebookSection[],
  customFields: [] as CompetitionCustomField[],
  contactName: "",
  contactWhatsapp: "",
  isActive: true,
  feeDisplay: "",
  isFree: false,
  origin: "internal",
  playerPhotoRequired: false,
};

export type CompetitionForm = typeof emptyCompetitionForm;

export function parseRupiah(val: string | number) {
  return Number(String(val ?? "").replace(/\D/g, "")) || 0;
}

export function competitionToForm(comp: Competition): CompetitionForm {
  const extras = compExtras(comp);
  const isFreeBool = isFlagOn(extras.isFree);
  const hasBatchesBool = isFlagOn(extras.hasBatches);

  return {
    id: comp.id,
    title: comp.title,
    category: comp.category,
    type: comp.type || "individual",
    maxTeamMembers: comp.maxTeamMembers || 5,
    minTeamMembers: comp.minTeamMembers || 1,
    membersRequired: comp.membersRequired || "optional",
    playerPhotoRequired: isFlagOn(extras.playerPhotoRequired),
    tagline: comp.tagline || "",
    description: comp.description || "",
    fee: isFreeBool ? 0 : comp.fee || 0,
    hasBatches: hasBatchesBool,
    batches: Array.isArray(extras.batches)
      ? extras.batches.map((b) => ({
          ...b,
          feeDisplay: b.fee ? formatRupiah(String(b.fee)) : "",
        }))
      : [],
    maxSlots: comp.maxSlots || 0,
    filledSlots: comp.filledSlots || 0,
    scheduleDate: toDateInputValue(comp.scheduleDate),
    location: comp.location || "",
    prizes: extras.prizes?.length
      ? extras.prizes
      : [
          ...(comp.prizesFirst ? [{ label: "Juara 1", value: comp.prizesFirst }] : []),
          ...(comp.prizesSecond ? [{ label: "Juara 2", value: comp.prizesSecond }] : []),
          ...(comp.prizesThird ? [{ label: "Juara 3", value: comp.prizesThird }] : []),
        ],
    rulesSummary: Array.isArray(comp.rulesSummary)
      ? comp.rulesSummary.join("\n")
      : comp.rulesSummary || "",
    rulebookUrl: comp.rulebookUrl || "",
    guidebookSections: extras.guidebookSections || [],
    customFields: extras.customFields || [],
    contactName: comp.contactName || "",
    contactWhatsapp: comp.contactWhatsapp || "",
    feeDisplay: isFreeBool ? "0" : comp.fee ? formatRupiah(String(comp.fee)) : "",
    isFree: isFreeBool,
    isActive: extras.isActive === undefined ? true : isFlagOn(extras.isActive),
    origin: (extras.origin || (comp as { origin?: string }).origin || "internal") as string,
  };
}

export function validateCompetitionForm(form: CompetitionForm): string | null {
  if (!form.title.trim()) return "Judul wajib diisi";
  if (!form.id.trim()) return "ID (slug) wajib diisi";

  const isFree = !!form.isFree;
  const feeNum = isFree ? 0 : parseRupiah(String(form.feeDisplay ?? form.fee)) || 0;

  if (!isFree && !form.hasBatches && feeNum > 0 && feeNum < 1000) {
    return "Biaya berbayar minimal Rp 1.000. Jika gratis, pilih opsi Gratis.";
  }

  if (!isFree && form.hasBatches) {
    if (!form.batches?.length) {
      return "Tambah minimal 1 batch, atau nonaktifkan opsi batch.";
    }
    for (let i = 0; i < form.batches.length; i++) {
      const b = form.batches[i];
      if (!b.name?.trim()) return `Nama gelombang #${i + 1} wajib diisi`;
      if (!b.startDate || !b.endDate) return `Tanggal gelombang #${i + 1} wajib diisi`;
      const batchFee = parseRupiah(String(b.feeDisplay ?? b.fee)) || 0;
      if (batchFee > 0 && batchFee < 1000) {
        return `Biaya gelombang #${i + 1} minimal Rp 1.000`;
      }
    }
  }

  return null;
}

export function buildCompetitionPayload(form: CompetitionForm) {
  const { feeDisplay: _feeDisplay, ...submitData } = form;
  const isFree = !!form.isFree;
  const feeNum = isFree ? 0 : parseRupiah(String(form.feeDisplay ?? form.fee)) || 0;

  let cleanedBatches: CompetitionBatchItem[] = [];
  if (!isFree && form.hasBatches) {
    cleanedBatches = form.batches.map((b) => ({
      id: b.id || crypto.randomUUID(),
      name: b.name.trim(),
      startDate: b.startDate,
      endDate: b.endDate,
      fee: parseRupiah(String(b.feeDisplay ?? b.fee)) || 0,
    }));
  }

  const rules =
    typeof form.rulesSummary === "string"
      ? form.rulesSummary.split("\n").filter((s) => s.trim())
      : Array.isArray(form.rulesSummary)
        ? form.rulesSummary
        : [];

  return {
    ...submitData,
    fee: feeNum,
    hasBatches: !isFree && !!form.hasBatches,
    batches: cleanedBatches,
    isFree,
    maxSlots: parseInt(String(form.maxSlots), 10) || 0,
    filledSlots: parseInt(String(form.filledSlots), 10) || 0,
    maxTeamMembers: parseInt(String(form.maxTeamMembers), 10) || 1,
    minTeamMembers: parseInt(String(form.minTeamMembers), 10) || 1,
    rulesSummary: rules,
    scheduleDate: toIsoOrNull(form.scheduleDate),
    prizes: Array.isArray(form.prizes)
      ? form.prizes.filter((p) => p && p.label && p.value)
      : [],
  };
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <SectionCard title={title} description={description} bodyClassName="space-y-4">
      {children}
    </SectionCard>
  );
}

export function CompetitionFormFields({
  form,
  setForm,
  isAdd,
  categories,
}: {
  form: CompetitionForm;
  setForm: React.Dispatch<React.SetStateAction<CompetitionForm>>;
  isAdd?: boolean;
  categories: CategoryOption[];
}) {
  function update<K extends keyof CompetitionForm>(field: K, value: CompetitionForm[K]): void;
  function update(updates: Partial<CompetitionForm>): void;
  function update(fieldOrObj: keyof CompetitionForm | Partial<CompetitionForm>, value?: unknown) {
    setForm((prev) => {
      const updates =
        typeof fieldOrObj === "string"
          ? ({ [fieldOrObj]: value } as Partial<CompetitionForm>)
          : fieldOrObj;
      const next = { ...prev, ...updates };
      if (isAdd && "title" in updates) {
        next.id = String(updates.title || "")
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
      }
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <FormSection title="Informasi dasar" description="Identitas utama lomba di katalog.">
        <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {isAdd ? (
            <Field>
              <FieldLabel required>ID (slug)</FieldLabel>
              <Input
                value={form.id}
                readOnly
                className="cursor-not-allowed bg-muted text-muted-foreground"
              />
              <FieldDescription>Dibuat otomatis dari judul.</FieldDescription>
            </Field>
          ) : null}
          <Field className={isAdd ? undefined : "sm:col-span-2"}>
            <FieldLabel htmlFor="comp-title" required>
              Judul
            </FieldLabel>
            <Input
              id="comp-title"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel required>Kategori</FieldLabel>
            <Select value={form.category} onValueChange={(v) => update("category", v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Tipe peserta</FieldLabel>
            <SegmentedControl
              value={form.type}
              onValueChange={(v) => update("type", v)}
              options={[
                { value: "individual", label: "Individu" },
                { value: "team", label: "Tim" },
                { value: "both", label: "Keduanya" },
              ]}
            />
            {form.type === "both" ? (
              <FieldDescription>Peserta bisa daftar individu atau tim.</FieldDescription>
            ) : null}
          </Field>
          {form.type !== "individual" ? (
            <>
              <Field>
                <FieldLabel required>Min. anggota tim</FieldLabel>
                <Input
                  type="number"
                  min={1}
                  max={form.maxTeamMembers}
                  value={form.minTeamMembers}
                  onChange={(e) => update("minTeamMembers", parseInt(e.target.value) || 1)}
                />
              </Field>
              <Field>
                <FieldLabel required>Maks. anggota tim</FieldLabel>
                <Input
                  type="number"
                  min={1}
                  value={form.maxTeamMembers}
                  onChange={(e) => update("maxTeamMembers", parseInt(e.target.value) || 1)}
                />
              </Field>
              <Field className="sm:col-span-2">
                <FieldLabel>Anggota tambahan</FieldLabel>
                <SegmentedControl
                  value={form.membersRequired}
                  onValueChange={(v) => update("membersRequired", v)}
                  options={[
                    { value: "required", label: "Wajib diisi" },
                    { value: "optional", label: "Opsional" },
                  ]}
                />
                <FieldDescription>
                  Apakah data anggota tim wajib dilengkapi saat daftar.
                </FieldDescription>
              </Field>
            </>
          ) : null}
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="comp-tagline">Tagline</FieldLabel>
            <Input
              id="comp-tagline"
              value={form.tagline}
              onChange={(e) => update("tagline", e.target.value)}
            />
          </Field>
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="comp-desc">Deskripsi</FieldLabel>
            <Textarea
              id="comp-desc"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={4}
            />
          </Field>
        </FieldGroup>
      </FormSection>

      <FormSection title="Pendaftaran" description="Status, asal peserta, dan persyaratan.">
        <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel>Status</FieldLabel>
            <SegmentedControl
              value={form.isActive ? "active" : "inactive"}
              onValueChange={(v) => update("isActive", v === "active")}
              options={[
                { value: "active", label: "Dibuka" },
                { value: "inactive", label: "Ditutup" },
              ]}
            />
          </Field>
          <Field>
            <FieldLabel>Asal lomba</FieldLabel>
            <SegmentedControl
              value={form.origin}
              onValueChange={(v) => update("origin", v)}
              options={[
                { value: "internal", label: "Internal" },
                { value: "external", label: "Eksternal" },
              ]}
            />
          </Field>
          <Field>
            <FieldLabel>Foto & ID pemain</FieldLabel>
            <SegmentedControl
              value={form.playerPhotoRequired ? "required" : "optional"}
              onValueChange={(v) => update("playerPhotoRequired", v === "required")}
              options={[
                { value: "optional", label: "Tidak perlu" },
                { value: "required", label: "Wajib" },
              ]}
            />
            {form.playerPhotoRequired ? (
              <FieldDescription>
                Setiap pemain wajib isi ID akun game dan foto (cocok untuk esports).
              </FieldDescription>
            ) : null}
          </Field>
          <Field>
            <FieldLabel required>
              {form.type === "team"
                ? "Kuota tim"
                : form.type === "both"
                  ? "Kuota peserta / tim"
                  : "Kuota peserta"}
            </FieldLabel>
            <Input
              type="number"
              value={form.maxSlots}
              onChange={(e) => update("maxSlots", Number(e.target.value))}
            />
          </Field>
        </FieldGroup>
      </FormSection>

      <FormSection title="Biaya" description="Gratis, berbayar, atau beberapa gelombang harga.">
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel>Mode biaya</FieldLabel>
            <SegmentedControl
              value={form.isFree ? "free" : "paid"}
              onValueChange={(v) => {
                const free = v === "free";
                if (free) {
                  update({ isFree: true, fee: 0, feeDisplay: "0" });
                } else {
                  update({
                    isFree: false,
                    fee: form.fee || 0,
                    feeDisplay: form.fee ? formatRupiah(String(form.fee)) : "",
                  });
                }
              }}
              options={[
                { value: "paid", label: "Berbayar" },
                { value: "free", label: "Gratis" },
              ]}
            />
          </Field>

          {!form.isFree ? (
            <>
              <Field>
                <FieldLabel>Biaya dasar</FieldLabel>
                <RupiahField
                  value={form.fee}
                  display={form.feeDisplay ?? undefined}
                  onValueChange={(fee, feeDisplay) => update({ fee, feeDisplay })}
                  aria-label="Biaya pendaftaran"
                />
                <FieldDescription>Minimal Rp 1.000 jika tidak memakai batch.</FieldDescription>
              </Field>

              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="toggle-has-batches" className="text-sm font-medium">
                      Batch pendaftaran
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Pecah jadi Early Bird, Batch 1, Reguler, dengan harga berbeda.
                    </p>
                  </div>
                  <Switch
                    id="toggle-has-batches"
                    checked={!!form.hasBatches}
                    onCheckedChange={(checked) => {
                      if (checked && (!form.batches || form.batches.length === 0)) {
                        const now = new Date();
                        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                        update({
                          hasBatches: true,
                          batches: [
                            {
                              id: crypto.randomUUID(),
                              name: "Early Bird",
                              startDate: now.toISOString().slice(0, 16),
                              endDate: nextWeek.toISOString().slice(0, 16),
                              fee: form.fee || 35000,
                              feeDisplay: form.fee
                                ? formatRupiah(String(form.fee))
                                : "35.000",
                            },
                          ],
                        });
                      } else {
                        update({ hasBatches: checked });
                      }
                    }}
                  />
                </div>

                {form.hasBatches ? (
                  <div className="space-y-3 border-t border-border pt-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">
                        {form.batches?.length || 0} gelombang
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentBatches = form.batches || [];
                          const lastBatch = currentBatches[currentBatches.length - 1];
                          let startDate = new Date().toISOString().slice(0, 16);
                          if (lastBatch?.endDate) startDate = lastBatch.endDate;
                          const endDate = new Date(
                            new Date(startDate).getTime() + 14 * 24 * 60 * 60 * 1000,
                          )
                            .toISOString()
                            .slice(0, 16);
                          update({
                            batches: [
                              ...currentBatches,
                              {
                                id: crypto.randomUUID(),
                                name: `Batch ${currentBatches.length + 1}`,
                                startDate,
                                endDate,
                                fee: form.fee || 50000,
                                feeDisplay: form.fee
                                  ? formatRupiah(String(form.fee))
                                  : "50.000",
                              },
                            ],
                          });
                        }}
                      >
                        <Plus data-icon="inline-start" /> Tambah batch
                      </Button>
                    </div>

                    {(form.batches || []).map((batch, idx) => {
                      const now = new Date();
                      const isOngoing =
                        batch.startDate &&
                        batch.endDate &&
                        now >= new Date(batch.startDate) &&
                        now <= new Date(batch.endDate);
                      const isPast = batch.endDate && now > new Date(batch.endDate);
                      const isUpcoming = batch.startDate && now < new Date(batch.startDate);

                      return (
                        <div
                          key={batch.id || idx}
                          className="space-y-3 rounded-lg border border-border bg-background p-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">Batch #{idx + 1}</span>
                              {isOngoing ? (
                                <Badge variant="secondary">Aktif</Badge>
                              ) : isUpcoming ? (
                                <Badge variant="outline">Mendatang</Badge>
                              ) : isPast ? (
                                <Badge variant="outline" className="text-muted-foreground">
                                  Berakhir
                                </Badge>
                              ) : null}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() =>
                                update({
                                  batches: form.batches.filter((_, i) => i !== idx),
                                })
                              }
                              className="text-muted-foreground hover:text-destructive"
                              aria-label="Hapus batch"
                            >
                              <Trash2 />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <Field>
                              <FieldLabel>Nama</FieldLabel>
                              <Input
                                value={batch.name}
                                onChange={(e) => {
                                  const next = [...form.batches];
                                  next[idx] = { ...next[idx], name: e.target.value };
                                  update({ batches: next });
                                }}
                                placeholder="Early Bird"
                              />
                            </Field>
                            <Field>
                              <FieldLabel>Biaya</FieldLabel>
                              <RupiahField
                                value={batch.fee}
                                display={batch.feeDisplay}
                                placeholder="35.000"
                                aria-label="Biaya gelombang"
                                onValueChange={(fee, feeDisplay) => {
                                  const next = [...form.batches];
                                  next[idx] = { ...next[idx], fee, feeDisplay };
                                  update({ batches: next });
                                }}
                              />
                            </Field>
                            <Field>
                              <FieldLabel>Mulai</FieldLabel>
                              <Input
                                type="datetime-local"
                                value={
                                  batch.startDate
                                    ? batch.startDate.includes("T")
                                      ? batch.startDate.slice(0, 16)
                                      : `${batch.startDate}T00:00`
                                    : ""
                                }
                                onChange={(e) => {
                                  const next = [...form.batches];
                                  next[idx] = { ...next[idx], startDate: e.target.value };
                                  update({ batches: next });
                                }}
                              />
                            </Field>
                            <Field>
                              <FieldLabel>Selesai</FieldLabel>
                              <Input
                                type="datetime-local"
                                value={
                                  batch.endDate
                                    ? batch.endDate.includes("T")
                                      ? batch.endDate.slice(0, 16)
                                      : `${batch.endDate}T23:59`
                                    : ""
                                }
                                onChange={(e) => {
                                  const next = [...form.batches];
                                  next[idx] = { ...next[idx], endDate: e.target.value };
                                  update({ batches: next });
                                }}
                              />
                            </Field>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </FieldGroup>
      </FormSection>

      <FormSection title="Jadwal & lokasi">
        <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="comp-date">Tanggal</FieldLabel>
            <Input
              id="comp-date"
              type="date"
              value={form.scheduleDate}
              onChange={(e) => update("scheduleDate", e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="comp-location">Lokasi</FieldLabel>
            <Input
              id="comp-location"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
            />
          </Field>
        </FieldGroup>
      </FormSection>

      <FormSection title="Hadiah & aturan">
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel>Hadiah</FieldLabel>
            <div className="space-y-2">
              {form.prizes.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-5 shrink-0 text-xs text-muted-foreground tabular-nums">
                    {i + 1}
                  </span>
                  <Input
                    value={p.label}
                    onChange={(e) => {
                      const next = [...form.prizes];
                      next[i] = { ...next[i], label: e.target.value };
                      update("prizes", next);
                    }}
                    placeholder="Juara 1"
                    className="min-w-0 flex-1"
                  />
                  <Input
                    value={p.value}
                    onChange={(e) => {
                      const next = [...form.prizes];
                      next[i] = { ...next[i], value: e.target.value };
                      update("prizes", next);
                    }}
                    placeholder="Hadiah"
                    className="min-w-0 flex-[2]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      update(
                        "prizes",
                        form.prizes.filter((_, j) => j !== i),
                      )
                    }
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    aria-label="Hapus hadiah"
                  >
                    <X />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  update("prizes", [
                    ...form.prizes,
                    { label: `Juara ${form.prizes.length + 1}`, value: "" },
                  ])
                }
              >
                <Plus data-icon="inline-start" /> Tambah hadiah
              </Button>
            </div>
          </Field>
          <Field>
            <FieldLabel htmlFor="comp-rules">Aturan ringkas</FieldLabel>
            <Textarea
              id="comp-rules"
              value={form.rulesSummary}
              onChange={(e) => update("rulesSummary", e.target.value)}
              rows={3}
              placeholder="Satu baris = satu aturan"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="comp-rulebook">Link guidebook</FieldLabel>
            <Input
              id="comp-rulebook"
              type="url"
              value={form.rulebookUrl}
              onChange={(e) => update("rulebookUrl", e.target.value)}
              placeholder="https://..."
            />
            <FieldDescription>PDF / Google Drive untuk tombol Buka Guidebook.</FieldDescription>
          </Field>
        </FieldGroup>
      </FormSection>

      <FormSection
        title="Bagian guidebook"
        description="Konten terstruktur di halaman lomba (opsional)."
      >
        <GuidebookSectionsBuilder
          sections={form.guidebookSections || []}
          onChange={(sections) => update("guidebookSections", sections)}
        />
      </FormSection>

      <FormSection
        title="Field kustom"
        description="Pertanyaan tambahan pada formulir pendaftaran."
      >
        <CustomFieldsBuilder
          fields={form.customFields || []}
          onChange={(fields) => update("customFields", fields)}
        />
      </FormSection>

      <FormSection title="Kontak panitia">
        <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="comp-contact-name" required>
              Nama
            </FieldLabel>
            <Input
              id="comp-contact-name"
              value={form.contactName}
              onChange={(e) => update("contactName", e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="comp-contact-wa" required>
              WhatsApp
            </FieldLabel>
            <Input
              id="comp-contact-wa"
              type="tel"
              inputMode="numeric"
              value={form.contactWhatsapp}
              onChange={(e) => update("contactWhatsapp", e.target.value.replace(/\D/g, ""))}
              placeholder="62812XXXXXXXX"
            />
          </Field>
        </FieldGroup>
      </FormSection>
    </div>
  );
}

export function CompetitionFormFooter({
  saving,
  onCancel,
  saveLabel,
}: {
  saving?: boolean;
  onCancel: () => void;
  saveLabel?: string;
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 border-t bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6 supports-backdrop-filter:bg-background/80">
      <FormActions onCancel={onCancel} saving={saving} saveLabel={saveLabel} />
    </div>
  );
}
