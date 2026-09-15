"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Bold,
  Italic,
  List,
  ListOrdered,
  AlertTriangle,
  Eye,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import GuidebookArticle from "@/components/GuidebookArticle";
import type { CompetitionGuidebookSection } from "@/src/db/schema";

interface Props {
  sections: CompetitionGuidebookSection[];
  onChange: (sections: CompetitionGuidebookSection[]) => void;
}

export default function GuidebookSectionsBuilder({ sections, onChange }: Props) {
  const [activePreview, setActivePreview] = useState<Record<string, boolean>>({});

  const togglePreview = (id: string) => {
    setActivePreview((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const addSection = () => {
    onChange([
      ...sections,
      {
        id: crypto.randomUUID(),
        title: `Bagian ${sections.length + 1}`,
        content: "",
      },
    ]);
  };

  const updateSection = (id: string, field: "title" | "content", val: string) => {
    onChange(sections.map((s) => (s.id === id ? { ...s, [field]: val } : s)));
  };

  const removeSection = (id: string) => {
    onChange(sections.filter((s) => s.id !== id));
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    const temp = next[index];
    next[index] = next[target]!;
    next[target] = temp!;
    onChange(next);
  };

  const insertFormat = (id: string, currentText: string, prefix: string, suffix = "") => {
    const newText = currentText ? `${currentText}\n${prefix}${suffix}` : `${prefix}${suffix}`;
    updateSection(id, "content", newText);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {sections.length} bagian · ditampilkan sebagai tab panduan di halaman lomba
        </p>
        <Button type="button" variant="outline" size="sm" onClick={addSection}>
          <Plus data-icon="inline-start" /> Tambah bagian
        </Button>
      </div>

      {sections.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          Belum ada bagian guidebook.
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((sec, idx) => {
            const isPreview = !!activePreview[sec.id];
            return (
              <div key={sec.id || idx} className="space-y-3 rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {idx + 1}
                    </span>
                    <Field className="min-w-0 flex-1 gap-0">
                      <FieldLabel className="sr-only">Judul bagian</FieldLabel>
                      <Input
                        value={sec.title}
                        onChange={(e) => updateSection(sec.id, "title", e.target.value)}
                        placeholder="Judul bagian"
                      />
                    </Field>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      disabled={idx === 0}
                      onClick={() => moveSection(idx, "up")}
                      aria-label="Pindah ke atas"
                    >
                      <ChevronUp />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      disabled={idx === sections.length - 1}
                      onClick={() => moveSection(idx, "down")}
                      aria-label="Pindah ke bawah"
                    >
                      <ChevronDown />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => togglePreview(sec.id)}
                    >
                      {isPreview ? (
                        <>
                          <Pencil data-icon="inline-start" /> Edit
                        </>
                      ) : (
                        <>
                          <Eye data-icon="inline-start" /> Pratinjau
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeSection(sec.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Hapus bagian"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>

                {!isPreview ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertFormat(sec.id, sec.content, "**Teks tebal**")}
                      >
                        <Bold data-icon="inline-start" /> Tebal
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertFormat(sec.id, sec.content, "*Teks miring*")}
                      >
                        <Italic data-icon="inline-start" /> Miring
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertFormat(sec.id, sec.content, "- Poin...")}
                      >
                        <List data-icon="inline-start" /> List
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertFormat(sec.id, sec.content, "1. Langkah...")}
                      >
                        <ListOrdered data-icon="inline-start" /> Nomor
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          insertFormat(sec.id, sec.content, "Catatan penting: ...")
                        }
                      >
                        <AlertTriangle data-icon="inline-start" /> Catatan
                      </Button>
                    </div>
                    <Textarea
                      value={sec.content}
                      onChange={(e) => updateSection(sec.id, "content", e.target.value)}
                      placeholder="Isi ketentuan untuk bagian ini..."
                      rows={5}
                    />
                  </div>
                ) : (
                  <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
                    {sec.content ? (
                      <GuidebookArticle
                        sections={[
                          {
                            id: sec.id,
                            title: sec.title || "Pratinjau",
                            content: sec.content,
                          },
                        ]}
                      />
                    ) : (
                      <span className="text-muted-foreground">Belum ada konten.</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
