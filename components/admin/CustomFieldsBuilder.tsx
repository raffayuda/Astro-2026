"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Type,
  AlignLeft,
  List,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import type { CompetitionCustomField } from "@/types/astro";

interface Props {
  fields: CompetitionCustomField[];
  onChange: (fields: CompetitionCustomField[]) => void;
}

const FIELD_TYPES = [
  { value: "text", label: "Teks Singkat", icon: Type },
  { value: "textarea", label: "Teks Panjang (Textarea)", icon: AlignLeft },
  { value: "select", label: "Pilihan Dropdown (Select)", icon: List },
  { value: "image", label: "Unggah Gambar / Berkas", icon: ImageIcon },
] as const;

export default function CustomFieldsBuilder({ fields, onChange }: Props) {
  const addField = (type: CompetitionCustomField["type"] = "text") => {
    const nextId = `field_${Date.now()}`;
    const newField: CompetitionCustomField = {
      id: nextId,
      label: type === "image" ? "Unggah Berkas" : "Field Baru",
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

  // Quick Preset Handlers
  const applyPresetSttnf = () => {
    const preset: CompetitionCustomField[] = [
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
        description: "Tangkapan layar (screenshot) bukti telah mengikuti akun Instagram resmi",
      },
    ];
    onChange(preset);
  };

  const applyPresetTalent = () => {
    const preset: CompetitionCustomField[] = [
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
        description: "Pilih jenis pertunjukan atau bakat utama yang akan ditampilkan",
      },
      {
        id: "performance_title",
        label: "Judul / Konsep Penampilan",
        type: "text",
        placeholder: "Contoh: Cover Lagu Bendera - Cokelat",
        required: true,
        description: "Nama atau judul aksi penampilan panggung Anda",
      },
      {
        id: "stage_property",
        label: "Kebutuhan Properti & Alat Panggung",
        type: "textarea",
        placeholder: "Tuliskan alat yang dibawa sendiri (contoh: 1 gitar akustik, stand kanvas, dll)",
        required: false,
        description: "Panitia menyediakan sound system, laptop operator, dan 2 mic wireless. Properti lain dibawa sendiri.",
      },
      {
        id: "ktm_url",
        label: "Foto KTM / Bukti Mahasiswa STT-NF",
        type: "image",
        required: true,
        description: "Foto KTM ketua atau pendaftar sebagai bukti mahasiswa aktif STT-NF",
      },
    ];
    onChange(preset);
  };

  return (
    <div className="space-y-4">
      {/* Header & Preset Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-astro-cyan-2">
        <div>
          <h4 className="text-xs font-black text-astro-navy uppercase tracking-wider">
            Form Pendaftaran Kustom ({fields.length} Field)
          </h4>
          <p className="text-11 text-ink font-light">
            Sesuaikan formulir khusus untuk cabang lomba ini (berkas upload, dropdown, dsb).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-10 font-bold text-ink uppercase tracking-wider">
            Preset Cepat:
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={applyPresetSttnf}
            className="h-7 text-10 font-bold text-ink hover:text-astro-cyan gap-1"
          >
            <Sparkles className="size-3 text-astro-cyan" />
            STT-NF + Berkas
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={applyPresetTalent}
            className="h-7 text-10 font-bold text-ink hover:text-purple-600 gap-1"
          >
            <Sparkles className="size-3 text-purple-500" />
            Seni / Bakat (AGT)
          </Button>
        </div>
      </div>

      {/* Field List */}
      {fields.length === 0 ? (
        <div className="p-6 text-center rounded-lg border border-dashed border-astro-cyan-2 bg-surface/50">
          <p className="text-xs text-ink">
            Belum ada field kustom untuk lomba ini (formulir hanya meminta data umum standar).
          </p>
          <p className="text-11 text-ink mt-1">
            Gunakan tombol preset di atas atau klik tombol &quot;Tambah Field&quot; di bawah.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, idx) => (
            <div
              key={field.id || idx}
              className="p-3.5 bg-surface border border-astro-cyan-2 rounded-lg space-y-3 relative group transition-colors hover:border-astro-cyan-2"
            >
              {/* Field Header Row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="flex items-center justify-center size-5 rounded bg-astro-cyan-2 text-ink text-10 font-black shrink-0">
                    {idx + 1}
                  </span>
                  <Badge variant="outline" className="text-10 font-bold uppercase shrink-0">
                    {field.type}
                  </Badge>
                  <span className="text-xs font-bold text-astro-navy truncate">
                    {field.label || "Field Tanpa Nama"}
                  </span>
                  {field.required && (
                    <span className="text-10 font-extrabold text-red-500 uppercase shrink-0">
                      *Wajib
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    disabled={idx === 0}
                    onClick={() => moveField(idx, "up")}
                    aria-label="Pindah ke atas"
                  >
                    <ChevronUp className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    disabled={idx === fields.length - 1}
                    onClick={() => moveField(idx, "down")}
                    aria-label="Pindah ke bawah"
                  >
                    <ChevronDown className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeField(idx)}
                    className="text-ink hover:text-red-600"
                    aria-label="Hapus field"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>

              {/* Edit Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1">
                {/* Label */}
                <div className="sm:col-span-6">
                  <label className="text-10 font-bold uppercase tracking-wider text-ink block mb-1">
                    Label Pertanyaan / Dokumen
                  </label>
                  <Input
                    type="text"
                    value={field.label}
                    onChange={(e) => updateField(idx, { label: e.target.value })}
                    placeholder="Contoh: Foto Kartu Tanda Mahasiswa"
                    className="h-8 text-xs bg-white"
                  />
                </div>

                {/* Tipe Field */}
                <div className="sm:col-span-3">
                  <label className="text-10 font-bold uppercase tracking-wider text-ink block mb-1">
                    Tipe Input
                  </label>
                  <select
                    value={field.type}
                    onChange={(e) =>
                      updateField(idx, {
                        type: e.target.value as CompetitionCustomField["type"],
                      })
                    }
                    className="h-8 w-full text-xs bg-white border border-astro-cyan-2 rounded px-2 text-astro-navy"
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Switch Required */}
                <div className="sm:col-span-3 flex items-center justify-between sm:justify-end gap-2 pt-4 sm:pt-6">
                  <span className="text-10 font-bold text-ink uppercase tracking-wider">
                    Wajib Diisi:
                  </span>
                  <Switch
                    checked={field.required}
                    onCheckedChange={(val) => updateField(idx, { required: val })}
                  />
                </div>

                {/* Placeholder (for text/textarea) */}
                {(field.type === "text" || field.type === "textarea") && (
                  <div className="sm:col-span-6">
                    <label className="text-10 font-bold uppercase tracking-wider text-ink block mb-1">
                      Placeholder (Petunjuk di dalam kotak)
                    </label>
                    <Input
                      type="text"
                      value={field.placeholder || ""}
                      onChange={(e) => updateField(idx, { placeholder: e.target.value })}
                      placeholder="Contoh: Masukkan judul karya"
                      className="h-8 text-xs bg-white"
                    />
                  </div>
                )}

                {/* Options (for select) */}
                {field.type === "select" && (
                  <div className="sm:col-span-12">
                    <label className="text-10 font-bold uppercase tracking-wider text-ink block mb-1">
                      Pilihan Dropdown (Pisahkan dengan tanda koma `,`)
                    </label>
                    <Input
                      type="text"
                      value={(field.options || []).join(", ")}
                      onChange={(e) =>
                        updateField(idx, {
                          options: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="Pilihan 1, Pilihan 2, Pilihan 3"
                      className="h-8 text-xs bg-white"
                    />
                  </div>
                )}

                {/* Description / Helper Text */}
                <div className="sm:col-span-12">
                  <label className="text-10 font-bold uppercase tracking-wider text-ink block mb-1">
                    Deskripsi / Panduan Peserta (Opsional)
                  </label>
                  <Input
                    type="text"
                    value={field.description || ""}
                    onChange={(e) => updateField(idx, { description: e.target.value })}
                    placeholder="Contoh: Format file PNG atau JPG, pastikan terbaca jelas"
                    className="h-8 text-xs bg-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Field Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addField("text")}
          className="text-xs font-bold gap-1"
        >
          <Plus className="size-3.5" />
          Tambah Teks
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addField("select")}
          className="text-xs font-bold gap-1"
        >
          <Plus className="size-3.5" />
          Tambah Dropdown
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addField("image")}
          className="text-xs font-bold gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
        >
          <Plus className="size-3.5" />
          Tambah Berkas Gambar
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addField("textarea")}
          className="text-xs font-bold gap-1"
        >
          <Plus className="size-3.5" />
          Tambah Teks Panjang
        </Button>
      </div>
    </div>
  );
}
