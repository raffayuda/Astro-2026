"use client";

import { useState } from "react";
import {
  FileText,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  Layers,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CompetitionGuidebookSection } from "@/src/db/schema";

interface Props {
  sections: CompetitionGuidebookSection[];
  fallbackRules?: string[];
  description?: string;
  rulebookUrl?: string;
  contactPerson?: {
    name?: string;
    whatsapp?: string;
  };
  accentColor?: string;
}

/**
 * Format markdown-like inline bold and high-priority tags.
 */
function renderFormattedText(text: string) {
  // Split by bold (**text**)
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const inner = part.slice(2, -2);
      // Highlight score/percentage tokens inside bold
      if (/\+?\d+\s*(%|poin|point)/i.test(inner)) {
        return (
          <span
            key={i}
            className="inline-block rounded bg-astro-blue/15 px-1.5 py-0.5 font-mono text-xs font-bold text-astro-navy dark:text-astro-cyan-2 border border-astro-blue/30 mx-0.5"
          >
            {inner}
          </span>
        );
      }
      return (
        <strong key={i} className="font-bold text-foreground">
          {inner}
        </strong>
      );
    }
    return part;
  });
}

/**
 * Parses a block of content into structured elements: paragraphs, lists, and callout warnings.
 */
function parseSectionContent(raw: string) {
  const lines = raw.split("\n");
  const blocks: Array<
    | { type: "paragraph"; text: string }
    | { type: "list"; items: string[] }
    | { type: "warning"; title?: string; text: string }
    | { type: "heading"; level: number; text: string }
  > = [];

  let currentList: string[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      blocks.push({ type: "list", items: [...currentList] });
      currentList = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]?.trim() ?? "";
    if (!line) {
      flushList();
      continue;
    }

    // Heading (### or ##)
    if (line.startsWith("### ")) {
      flushList();
      blocks.push({ type: "heading", level: 3, text: line.replace(/^###\s+/, "") });
      continue;
    }
    if (line.startsWith("## ")) {
      flushList();
      blocks.push({ type: "heading", level: 2, text: line.replace(/^##\s+/, "") });
      continue;
    }

    // Warning / Notice / Diskualifikasi callouts
    const isWarningLine =
      line.startsWith("> [!WARNING]") ||
      line.startsWith("> [!CAUTION]") ||
      line.startsWith("⚠️") ||
      line.toLowerCase().startsWith("perhatian:") ||
      line.toLowerCase().startsWith("catatan:") ||
      line.toLowerCase().startsWith("diskualifikasi otomatis");

    if (isWarningLine) {
      flushList();
      const cleaned = line
        .replace(/^>\s*\[!(WARNING|CAUTION)\]\s*/i, "")
        .replace(/^⚠️\s*/, "")
        .trim();
      blocks.push({
        type: "warning",
        title: line.toLowerCase().includes("diskualifikasi")
          ? "Peringatan & Diskualifikasi"
          : "Catatan Penting",
        text: cleaned,
      });
      continue;
    }

    // Bullet or numbered list
    const isBullet = /^([-*•]|\d+\.)\s+/.test(line);
    if (isBullet) {
      const itemText = line.replace(/^([-*•]|\d+\.)\s+/, "");
      currentList.push(itemText);
      continue;
    }

    // Normal text
    flushList();
    blocks.push({ type: "paragraph", text: line });
  }

  flushList();
  return blocks;
}

export default function GuidebookArticle({
  sections,
  fallbackRules = [],
  description = "",
  rulebookUrl = "",
  contactPerson,
}: Props) {
  // If sections exist, use them. Otherwise create a default section from fallbackRules/description
  const activeSections =
    sections && sections.length > 0
      ? sections
      : fallbackRules.length > 0 || description
        ? [
            {
              id: "general-info",
              title: "Panduan & Peraturan Lomba",
              content: [
                description ? `${description}\n\n` : "",
                fallbackRules.length > 0 ? "### Ketentuan & Peraturan:\n" : "",
                ...fallbackRules.map((r) => `- ${r}`),
              ].join("\n"),
            },
          ]
        : [];

  const [activeTab, setActiveTab] = useState(0);

  if (activeSections.length === 0 && !rulebookUrl && !contactPerson?.name) {
    return null;
  }

  const currentSection = activeSections[activeTab] || activeSections[0];
  const blocks = currentSection ? parseSectionContent(currentSection.content) : [];

  const waNumber = contactPerson?.whatsapp?.replace(/\D/g, "") || "";
  const waUrl = waNumber ? `https://wa.me/${waNumber}` : "";

  return (
    <div className="relative space-y-6">
      {/* ── Section Title & Guidebook Banner ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg border border-astro-blue/30 bg-astro-blue/10 text-astro-blue dark:text-astro-sky">
            <BookOpen className="size-4" />
          </span>
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-foreground sm:text-lg">
              Guidebook & Ketentuan Resmi
            </h2>
            <p className="text-xs text-muted-foreground">
              Dokumentasi digital aturan, alur, dan teknis pelaksanaan lomba ASTRO 2026.
            </p>
          </div>
        </div>

        {rulebookUrl && (
          <Button
            asChild
            size="sm"
            className="rounded-md gap-1.5 self-start font-bold uppercase tracking-wider bg-astro-blue hover:bg-astro-blue text-white shadow-md transition-all sm:self-auto"
          >
            <a href={rulebookUrl} target="_blank" rel="noopener noreferrer">
              <FileText className="size-3.5" />
              <span>Buka Guidebook PDF</span>
              <ExternalLink className="size-3 opacity-80" />
            </a>
          </Button>
        )}
      </div>

      {/* ── Tabs Navigation (if more than 1 section) ── */}
      {activeSections.length > 1 && (
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto border-b border-border/80 pb-2">
          {activeSections.map((sec, idx) => {
            const isActive = activeTab === idx;
            return (
              <button
                key={sec.id || idx}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={cn(
                  "rounded-md group relative flex shrink-0 items-center gap-2 border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all",
                  isActive
                    ? "border-astro-blue/60 bg-astro-blue/15 text-astro-navy dark:text-astro-cyan-2 shadow-sm"
                    : "border-border/60 bg-muted/40 text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground"
                )}
              >
                <span className="flex size-4 items-center justify-center rounded-full bg-background/80 text-10 font-black text-muted-foreground group-hover:text-foreground">
                  {idx + 1}
                </span>
                <span>{sec.title}</span>
                {isActive && (
                  <span className="absolute -bottom-[9px] left-1/2 size-1.5 -translate-x-1/2 rotate-45 border-b border-r border-astro-blue bg-astro-blue" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Active Section Article Card ── */}
      {currentSection && (
        <div className="relative rounded-2xl border border-border/80 bg-card/80 p-5 shadow-xs backdrop-blur-sm sm:p-7">
          {/* Cyberpunk corner accents */}
          <div className="pointer-events-none absolute top-0 left-0 size-3 border-t-2 border-l-2 border-astro-blue/60" />
          <div className="pointer-events-none absolute top-0 right-0 size-3 border-t-2 border-r-2 border-astro-blue/60" />
          <div className="pointer-events-none absolute bottom-0 left-0 size-3 border-b-2 border-l-2 border-astro-blue/60" />
          <div className="pointer-events-none absolute bottom-0 right-0 size-3 border-b-2 border-r-2 border-astro-blue/60" />

          {/* Section Heading */}
          <div className="mb-5 flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-md bg-muted text-xs font-black text-foreground">
                0{activeTab + 1}
              </span>
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground sm:text-base">
                {currentSection.title}
              </h3>
            </div>
            <Badge variant="outline" className="text-10 font-bold uppercase tracking-wider text-muted-foreground">
              Bab #{activeTab + 1} of {activeSections.length}
            </Badge>
          </div>

          {/* Render Parsed Blocks */}
          <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
            {blocks.map((block, bIdx) => {
              if (block.type === "heading") {
                return (
                  <h4
                    key={bIdx}
                    className={cn(
                      "font-black uppercase tracking-wider text-foreground pt-2",
                      block.level === 2 ? "text-base text-astro-blue dark:text-astro-sky" : "text-sm"
                    )}
                  >
                    {block.text}
                  </h4>
                );
              }

              if (block.type === "paragraph") {
                return (
                  <p key={bIdx} className="text-sm leading-relaxed text-muted-foreground dark:text-zinc-300">
                    {renderFormattedText(block.text)}
                  </p>
                );
              }

              if (block.type === "list") {
                return (
                  <ul key={bIdx} className="space-y-2.5 pl-1">
                    {block.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-2.5 text-sm text-foreground/90">
                        <span className="mt-1 flex size-4 shrink-0 items-center justify-center rounded-full bg-astro-blue/15 text-astro-blue dark:text-astro-sky">
                          <ChevronRight className="size-3" />
                        </span>
                        <div className="flex-1 leading-snug">
                          {renderFormattedText(item)}
                        </div>
                      </li>
                    ))}
                  </ul>
                );
              }

              if (block.type === "warning") {
                return (
                  <div
                    key={bIdx}
                    className="my-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 dark:bg-amber-950/20"
                  >
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="size-4 shrink-0" />
                      <span className="text-xs font-black uppercase tracking-wider">
                        {block.title || "Perhatian Khusus"}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-amber-900/90 dark:text-amber-200">
                      {renderFormattedText(block.text)}
                    </p>
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      )}

      {/* ── Footer Contact Person & Download Bar ── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Contact Person Card */}
        {contactPerson?.name && (
          <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 p-4 transition-colors hover:border-border">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <MessageCircle className="size-5" />
              </span>
              <div>
                <p className="text-10 font-bold uppercase tracking-wider text-muted-foreground">
                  Contact Person Resmi
                </p>
                <p className="text-xs font-black text-foreground">
                  {contactPerson.name}
                </p>
                {contactPerson.whatsapp && (
                  <p className="text-11 font-mono text-muted-foreground">
                    +{contactPerson.whatsapp}
                  </p>
                )}
              </div>
            </div>
            {waUrl && (
              <Button asChild size="sm" variant="outline" className="rounded-md border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs font-bold">
                <a href={waUrl} target="_blank" rel="noopener noreferrer">
                  Chat WA
                </a>
              </Button>
            )}
          </div>
        )}

        {/* Guidebook Download Reminder */}
        {rulebookUrl ? (
          <div className="flex items-center justify-between rounded-xl border border-astro-blue/30 bg-astro-blue/5 p-4 transition-colors hover:border-astro-blue/50">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-astro-blue/15 text-astro-blue dark:text-astro-sky">
                <FileText className="size-5" />
              </span>
              <div>
                <p className="text-10 font-bold uppercase tracking-wider text-astro-blue dark:text-astro-sky">
                  Dokumen Lengkap
                </p>
                <p className="text-xs font-black text-foreground">
                  Guidebook Teknis (PDF)
                </p>
                <p className="text-11 text-muted-foreground">
                  Unduh / baca via Google Drive
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="rounded-md bg-astro-blue hover:bg-astro-blue text-white text-xs font-bold uppercase tracking-wider">
              <a href={rulebookUrl} target="_blank" rel="noopener noreferrer">
                Buka <ExternalLink className="size-3 ml-1" />
              </a>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-border/70 p-4 text-muted-foreground">
            <Sparkles className="size-4 text-astro-blue" />
            <p className="text-xs">
              Guidebook versi PDF dapat diakses melalui tombol di atas atau melalui narahubung panitia.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
