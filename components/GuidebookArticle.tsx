"use client";

import { useState } from "react";

import { Pill } from "@/components/brand/Pill";
import { Surface } from "@/components/brand/Surface";
import { cn } from "@/lib/utils";
import type { CompetitionGuidebookSection } from "@/src/db/schema";

interface Props {
  sections: CompetitionGuidebookSection[];
  fallbackRules?: string[];
}

function renderFormattedText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-astro-navy">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

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

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      continue;
    }

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
        title: line.toLowerCase().includes("diskualifikasi") ? "Diskualifikasi" : "Catatan",
        text: cleaned,
      });
      continue;
    }

    const isBullet = /^([-*•]|\d+\.)\s+/.test(line);
    if (isBullet) {
      currentList.push(line.replace(/^([-*•]|\d+\.)\s+/, ""));
      continue;
    }

    flushList();
    blocks.push({ type: "paragraph", text: line });
  }

  flushList();
  return blocks;
}

export default function GuidebookArticle({ sections, fallbackRules = [] }: Props) {
  const activeSections =
    sections && sections.length > 0
      ? sections
      : fallbackRules.length > 0
        ? [
            {
              id: "ketentuan",
              title: "Ketentuan",
              content: fallbackRules.map((rule) => `- ${rule}`).join("\n"),
            },
          ]
        : [];

  const [activeTab, setActiveTab] = useState(0);

  if (activeSections.length === 0) return null;

  const safeTab = Math.min(activeTab, activeSections.length - 1);
  const currentSection = activeSections[safeTab];
  const blocks = currentSection ? parseSectionContent(currentSection.content) : [];

  return (
    <div className="flex flex-col gap-5">
      {activeSections.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {activeSections.map((section, index) => {
            const isActive = safeTab === index;
            return (
              <button
                key={section.id || index}
                type="button"
                onClick={() => setActiveTab(index)}
                className="rounded-full"
              >
                <Pill tone={isActive ? "blue" : "glass"} size="sm">
                  {section.title}
                </Pill>
              </button>
            );
          })}
        </div>
      )}

      {currentSection && (
        <article className="space-y-4 text-sm leading-relaxed text-ink">
          {activeSections.length === 1 && (
            <h3 className="font-heading text-lg font-bold tracking-tight text-astro-navy">
              {currentSection.title}
            </h3>
          )}

          {blocks.map((block, index) => {
            if (block.type === "heading") {
              return (
                <h4
                  key={index}
                  className={cn(
                    "font-heading font-bold tracking-tight text-astro-navy",
                    block.level === 2 ? "pt-1 text-base" : "text-sm",
                  )}
                >
                  {block.text}
                </h4>
              );
            }

            if (block.type === "paragraph") {
              return (
                <p key={index} className="text-ink/80">
                  {renderFormattedText(block.text)}
                </p>
              );
            }

            if (block.type === "list") {
              return (
                <ul key={index} className="list-disc space-y-1.5 pl-5 text-ink/80">
                  {block.items.map((item, itemIndex) => (
                    <li key={itemIndex}>{renderFormattedText(item)}</li>
                  ))}
                </ul>
              );
            }

            return (
              <Surface key={index} tone="gold" radius="xl" pad="md">
                <p className="text-xs font-bold text-astro-navy">{block.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-astro-navy/80">
                  {renderFormattedText(block.text)}
                </p>
              </Surface>
            );
          })}
        </article>
      )}
    </div>
  );
}
