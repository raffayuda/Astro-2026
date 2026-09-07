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
  Edit3,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
    const newSection: CompetitionGuidebookSection = {
      id: crypto.randomUUID(),
      title: `Bagian ${sections.length + 1}`,
      content: "",
    };
    onChange([...sections, newSection]);
  };

  const updateSection = (id: string, field: "title" | "content", val: string) => {
    onChange(
      sections.map((s) => (s.id === id ? { ...s, [field]: val } : s))
    );
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

  // Helper to insert formatting tags at cursor position
  const insertFormat = (id: string, currentText: string, prefix: string, suffix = "") => {
    const newText = currentText ? `${currentText}\n${prefix}${suffix}` : `${prefix}${suffix}`;
    updateSection(id, "content", newText);
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-astro-blue" />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            Artikel / Bagian Guidebook ({sections.length})
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addSection}
          className="rounded-md h-7 gap-1 border-astro-blue/40 text-xs font-bold uppercase tracking-wider text-astro-navy hover:bg-astro-blue/10"
        >
          <Plus className="size-3.5" /> Tambah Bagian
        </Button>
      </div>

      <p className="text-11 text-muted-foreground">
        Tambahkan bagian panduan interaktif (misal: Tahapan Babak, Kriteria Penilaian, Tata Tertib, Fasilitas). Bagian ini akan dirender sebagai Tab panduan resmi di halaman detail lomba.
      </p>

      {sections.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
          Belum ada bagian artikel guidebook. Klik &quot;Tambah Bagian&quot; di atas untuk membuat panduan modular.
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((sec, idx) => {
            const isPreview = !!activePreview[sec.id];
            return (
              <div
                key={sec.id || idx}
                className="rounded-lg border border-border bg-card p-3.5 shadow-xs space-y-3"
              >
                {/* Header: Title, Ordering, Controls */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <Badge variant="outline" className="text-10 font-mono shrink-0">
                      #{idx + 1}
                    </Badge>
                    <Input
                      value={sec.title}
                      onChange={(e) => updateSection(sec.id, "title", e.target.value)}
                      placeholder="Judul Bagian (misal: Kriteria Penilaian)"
                      className="h-8 text-xs font-bold flex-1"
                    />
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Move Controls */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      disabled={idx === 0}
                      onClick={() => moveSection(idx, "up")}
                      title="Pindah ke atas"
                    >
                      <ChevronUp className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      disabled={idx === sections.length - 1}
                      onClick={() => moveSection(idx, "down")}
                      title="Pindah ke bawah"
                    >
                      <ChevronDown className="size-3.5" />
                    </Button>

                    {/* Preview Switcher */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => togglePreview(sec.id)}
                      className="h-7 text-10 font-bold uppercase gap-1"
                    >
                      {isPreview ? (
                        <>
                          <Edit3 className="size-3" /> Tulis
                        </>
                      ) : (
                        <>
                          <Eye className="size-3" /> Pratinjau
                        </>
                      )}
                    </Button>

                    {/* Delete */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeSection(sec.id)}
                      className="text-muted-foreground hover:text-destructive"
                      title="Hapus Bagian"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Content Editor / Live Preview */}
                {!isPreview ? (
                  <div className="space-y-1.5">
                    {/* Mini formatting toolbar */}
                    <div className="flex items-center gap-1 border-b border-border/60 pb-1.5 text-muted-foreground">
                      <span className="text-10 font-bold uppercase tracking-wider text-muted-foreground/80 mr-1">
                        Format:
                      </span>
                      <button
                        type="button"
                        onClick={() => insertFormat(sec.id, sec.content, "**Teks Tebal**")}
                        className="rounded px-1.5 py-0.5 text-10 font-bold hover:bg-muted hover:text-foreground"
                        title="Teks Tebal"
                      >
                        <Bold className="size-3 inline mr-0.5" /> Bold
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormat(sec.id, sec.content, "*Teks Miring*")}
                        className="rounded px-1.5 py-0.5 text-10 font-bold hover:bg-muted hover:text-foreground"
                        title="Teks Miring"
                      >
                        <Italic className="size-3 inline mr-0.5" /> Italic
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormat(sec.id, sec.content, "- Poin syarat...")}
                        className="rounded px-1.5 py-0.5 text-10 font-bold hover:bg-muted hover:text-foreground"
                        title="List Poin"
                      >
                        <List className="size-3 inline mr-0.5" /> List
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormat(sec.id, sec.content, "1. Langkah/Babak...")}
                        className="rounded px-1.5 py-0.5 text-10 font-bold hover:bg-muted hover:text-foreground"
                        title="Penomoran"
                      >
                        <ListOrdered className="size-3 inline mr-0.5" /> 1,2,3
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormat(sec.id, sec.content, "⚠️ Catatan Penting / Diskualifikasi: ...")}
                        className="rounded px-1.5 py-0.5 text-10 font-bold text-amber-600 hover:bg-amber-500/10"
                        title="Peringatan / Diskualifikasi"
                      >
                        <AlertTriangle className="size-3 inline mr-0.5" /> Warning
                      </button>
                    </div>

                    <Textarea
                      value={sec.content}
                      onChange={(e) => updateSection(sec.id, "content", e.target.value)}
                      placeholder="Tuliskan detail ketentuan untuk bagian ini..."
                      rows={4}
                      className="text-xs leading-relaxed font-mono"
                    />
                  </div>
                ) : (
                  <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-xs leading-relaxed">
                    <p className="font-bold text-astro-blue uppercase text-11 mb-2 border-b border-border/40 pb-1">
                      {sec.title || "Tanpa Judul"}
                    </p>
                    <div className="whitespace-pre-line text-foreground/90">
                      {sec.content || <span className="italic text-muted-foreground">Belum ada konten ditulis.</span>}
                    </div>
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
