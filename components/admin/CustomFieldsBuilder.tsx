"use client";

import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import type { CompetitionCustomField } from "@/types/astro";

interface Props {
  fields: CompetitionCustomField[];
  onChange: (fields: CompetitionCustomField[]) => void;
}

const FIELD_TYPES = [
  { value: "text", label: "Teks singkat" },
  { value: "textarea", label: "Teks panjang" },
  { value: "select", label: "Dropdown" },
  { value: "image", label: "Unggah berkas" },
] as const;

const TYPE_LABEL: Record<CompetitionCustomField["type"], string> = {
  text: "Teks",
  textarea: "Panjang",
  select: "Dropdown",
  image: "Berkas",
};

export default function CustomFieldsBuilder({ fields, onChange }: Props) {
  const addField = (type: CompetitionCustomField["type"] = "text") => {
    const newField: CompetitionCustomField = {
      id: `field_${Date.now()}`,
      label: type === "image" ? "Unggah berkas" : "Field baru",
      type,
      placeholder: "",
      options: type === "select" ? ["Pilihan 1", "Pilihan 2"] : [],
      required: true,
      description: "",
    };
    onChange([...fields, newField]);
  };

  const updateField = (index: number, patch: Partial<CompetitionCustomField>) => {
    const next = [...fields];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const removeField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  const moveField = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= fields.length) return;
    const next = [...fields];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onChange(next);
  };

  const applyPresetSttnf = () => {
    onChange([
      {
        id: "major",
        label: "Program Studi & Angkatan",
        type: "select",
        options: [
          "Teknik Informatika 2024",
          "Teknik Informatika 2025",
          "Teknik Informatika 2026",
          "Sistem Informasi 2024",
          "Sistem Informasi 2025",
          "Sistem Informasi 2026",
          "Bisnis Digital 2024",
          "Bisnis Digital 2025",
          "Bisnis Digital 2026",
          "Lainnya",
        ],
        required: true,
        description: "Pilih program studi dan tahun angkatan aktif di STT-NF",
      },
      {
        id: "ktm_url",
        label: "Foto Kartu Tanda Mahasiswa (KTM)",
        type: "image",
        required: true,
        description: "Unggah foto KTM aktif atau tangkapan layar SIAK STT-NF",
      },
      {
        id: "profile_photo_url",
        label: "Foto Profil Publikasi",
        type: "image",
        required: true,
        description: "Foto portrait peserta untuk poster & materi publikasi lomba",
      },
      {
        id: "instagram_proof_url",
        label: "Bukti Follow Instagram @bemsttnf & @astrosttnf",
        type: "image",
        required: true,
        description: "Tangkapan layar bukti mengikuti akun Instagram resmi",
      },
    ]);
  };

  const applyPresetTalent = () => {
    onChange([
      {
        id: "talent_category",
        label: "Kategori Bakat",
        type: "select",
        options: [
          "Bernyanyi (Vokal / Solo / Duo)",
          "Dance / Seni Tari",
          "Teater / Monolog / Puisi",
          "Sulap / Magic Performance",
          "Akustik / Musik Instrumen",
          "Melukis / Speed Painting",
          "Lainnya",
        ],
        required: true,
        description: "Jenis pertunjukan atau bakat utama",
      },
      {
        id: "performance_title",
        label: "Judul / Konsep Penampilan",
        type: "text",
        placeholder: "Contoh: Cover Lagu Bendera - Cokelat",
        required: true,
        description: "Nama atau judul aksi penampilan",
      },
      {
        id: "stage_property",
        label: "Kebutuhan Properti & Alat Panggung",
        type: "textarea",
        placeholder: "Tuliskan alat yang dibawa sendiri",
        required: false,
        description: "Sound system dan mic disediakan panitia. Properti lain dibawa sendiri.",
      },
      {
        id: "ktm_url",
        label: "Foto KTM / Bukti Mahasiswa STT-NF",
        type: "image",
        required: true,
        description: "Foto KTM ketua atau pendaftar",
      },
    ]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {fields.length} field · pertanyaan tambahan di formulir daftar
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={applyPresetSttnf}>
            Preset STT-NF
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={applyPresetTalent}>
            Preset seni / bakat
          </Button>
        </div>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          Belum ada field kustom. Pakai preset atau tambah field di bawah.
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, idx) => (
            <div key={field.id || idx} className="space-y-3 rounded-lg border border-border p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="text-xs tabular-nums text-muted-foreground">{idx + 1}</span>
                  <Badge variant="outline">{TYPE_LABEL[field.type] ?? field.type}</Badge>
                  {field.required ? (
                    <span className="text-xs text-muted-foreground">Wajib</span>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    disabled={idx === 0}
                    onClick={() => moveField(idx, "up")}
                    aria-label="Pindah ke atas"
                  >
                    <ChevronUp />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    disabled={idx === fields.length - 1}
                    onClick={() => moveField(idx, "down")}
                    aria-label="Pindah ke bawah"
                  >
                    <ChevronDown />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeField(idx)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Hapus field"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>

              <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field className="sm:col-span-2">
                  <FieldLabel>Label</FieldLabel>
                  <Input
                    value={field.label}
                    onChange={(e) => updateField(idx, { label: e.target.value })}
                    placeholder="Contoh: Foto KTM"
                  />
                </Field>
                <Field>
                  <FieldLabel>Tipe</FieldLabel>
                  <Select
                    value={field.type}
                    onValueChange={(value) =>
                      updateField(idx, { type: value as CompetitionCustomField["type"] })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {FIELD_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Wajib diisi</FieldLabel>
                  <div className="flex h-9 items-center">
                    <Switch
                      checked={field.required}
                      onCheckedChange={(val) => updateField(idx, { required: val })}
                    />
                  </div>
                </Field>
                {(field.type === "text" || field.type === "textarea") && (
                  <Field className="sm:col-span-2">
                    <FieldLabel>Placeholder</FieldLabel>
                    <Input
                      value={field.placeholder || ""}
                      onChange={(e) => updateField(idx, { placeholder: e.target.value })}
                      placeholder="Petunjuk di dalam kotak"
                    />
                  </Field>
                )}
                {field.type === "select" && (
                  <Field className="sm:col-span-2">
                    <FieldLabel>Opsi (pisah koma)</FieldLabel>
                    <Input
                      value={(field.options || []).join(", ")}
                      onChange={(e) =>
                        updateField(idx, {
                          options: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="Pilihan 1, Pilihan 2"
                    />
                  </Field>
                )}
                <Field className="sm:col-span-2">
                  <FieldLabel>Deskripsi</FieldLabel>
                  <Input
                    value={field.description || ""}
                    onChange={(e) => updateField(idx, { description: e.target.value })}
                    placeholder="Panduan singkat untuk peserta"
                  />
                </Field>
              </FieldGroup>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => addField("text")}>
          <Plus data-icon="inline-start" /> Teks
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => addField("select")}>
          <Plus data-icon="inline-start" /> Dropdown
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => addField("image")}>
          <Plus data-icon="inline-start" /> Berkas
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => addField("textarea")}>
          <Plus data-icon="inline-start" /> Teks panjang
        </Button>
      </div>
    </div>
  );
}
