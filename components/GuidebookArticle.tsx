"use client";

import React, { useState } from "react";

import { Pill } from "@/components/brand/Pill";
import { Surface } from "@/components/brand/Surface";
import { cn } from "@/lib/utils";
import type { CompetitionGuidebookSection } from "@/src/db/schema";

interface Props {
  sections: CompetitionGuidebookSection[];
  fallbackRules?: string[];
}

export type ContentBlock =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; lines: string[] }
  | { type: "qa"; question: string; answer: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "table"; header: string[]; rows: string[][] }
  | { type: "warning"; title?: string; text: string };

const QUESTION_REGEX = /^(?:\*\*)?(?:Q|Tanya|Pertanyaan)(?::)?(?:\*\*)?\s*[:-]?\s*/i;
const ANSWER_REGEX = /^(?:\*\*)?(?:A|Jawab|Jawaban)(?::)?(?:\*\*)?\s*[:-]?\s*/i;

export function parseSectionContent(raw: string): ContentBlock[] {
  const lines = raw.split("\n");
  const blocks: ContentBlock[] = [];

  let currentList: { ordered: boolean; items: string[] } | null = null;
  let currentTable: { header: string[]; rows: string[][] } | null = null;
  let currentParagraphLines: string[] = [];

  const flushList = () => {
    if (currentList && currentList.items.length > 0) {
      blocks.push({ type: "list", ordered: currentList.ordered, items: [...currentList.items] });
      currentList = null;
    }
  };

  const flushTable = () => {
    if (currentTable && currentTable.header.length > 0) {
      blocks.push({ type: "table", header: currentTable.header, rows: currentTable.rows });
      currentTable = null;
    }
  };

  const flushParagraph = () => {
    if (currentParagraphLines.length === 0) return;

    const linesToProcess = [...currentParagraphLines];
    currentParagraphLines = [];

    let i = 0;
    while (i < linesToProcess.length) {
      const line = linesToProcess[i];
      const nextLine = linesToProcess[i + 1];

      // Check if current line is Q and next is A
      if (QUESTION_REGEX.test(line) && nextLine && ANSWER_REGEX.test(nextLine)) {
        blocks.push({
          type: "qa",
          question: line,
          answer: nextLine,
        });
        i += 2;
        continue;
      }

      // Check if previous block was a single Q and current line is A (handles blank line between Q and A)
      const prevBlock = blocks[blocks.length - 1];
      if (
        ANSWER_REGEX.test(line) &&
        prevBlock &&
        prevBlock.type === "paragraph" &&
        prevBlock.lines.length === 1 &&
        QUESTION_REGEX.test(prevBlock.lines[0])
      ) {
        const questionText = prevBlock.lines[0];
        blocks.pop();
        blocks.push({
          type: "qa",
          question: questionText,
          answer: line,
        });
        i++;
        continue;
      }

      // Contiguous normal lines belonging to the same paragraph
      const normalLines: string[] = [];
      while (
        i < linesToProcess.length &&
        !(QUESTION_REGEX.test(linesToProcess[i]) && linesToProcess[i + 1] && ANSWER_REGEX.test(linesToProcess[i + 1]))
      ) {
        normalLines.push(linesToProcess[i]);
        i++;
      }

      if (normalLines.length > 0) {
        blocks.push({
          type: "paragraph",
          lines: normalLines,
        });
      }
    }
  };

  const flushAll = () => {
    flushList();
    flushTable();
    flushParagraph();
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Empty line = paragraph break (flushes accumulated lines)
    if (!line) {
      flushAll();
      continue;
    }

    // Markdown Table: | col1 | col2 |
    if (line.startsWith("|") && line.endsWith("|")) {
      flushParagraph();
      flushList();

      const cells = line
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());

      // Separator row: |---|---|
      if (cells.every((c) => /^:?-+:?$/.test(c))) {
        continue;
      }

      if (!currentTable) {
        currentTable = { header: cells, rows: [] };
      } else {
        currentTable.rows.push(cells);
      }
      continue;
    } else if (currentTable) {
      flushTable();
    }

    // Headings
    if (line.startsWith("### ")) {
      flushAll();
      blocks.push({ type: "heading", level: 3, text: line.replace(/^###\s+/, "") });
      continue;
    }
    if (line.startsWith("## ")) {
      flushAll();
      blocks.push({ type: "heading", level: 2, text: line.replace(/^##\s+/, "") });
      continue;
    }
    if (line.startsWith("# ")) {
      flushAll();
      blocks.push({ type: "heading", level: 1, text: line.replace(/^#\s+/, "") });
      continue;
    }

    // Warning / Notice Callouts
    const isWarningLine =
      line.startsWith("> [!WARNING]") ||
      line.startsWith("> [!CAUTION]") ||
      line.startsWith("> [!NOTE]") ||
      line.startsWith("⚠️") ||
      line.toLowerCase().startsWith("perhatian:") ||
      line.toLowerCase().startsWith("catatan:") ||
      line.toLowerCase().startsWith("diskualifikasi otomatis");

    if (isWarningLine) {
      flushAll();
      const cleaned = line
        .replace(/^>\s*\[!(WARNING|CAUTION|NOTE)\]\s*/i, "")
        .replace(/^⚠️\s*/, "")
        .trim();
      blocks.push({
        type: "warning",
        title: line.toLowerCase().includes("diskualifikasi")
          ? "Diskualifikasi"
          : line.toLowerCase().includes("note")
          ? "Catatan"
          : "Perhatian",
        text: cleaned,
      });
      continue;
    }

    // Numbered list: 1. Item
    const numberedMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      flushParagraph();
      flushTable();
      if (!currentList || !currentList.ordered) {
        flushList();
        currentList = { ordered: true, items: [] };
      }
      currentList.items.push(numberedMatch[2]);
      continue;
    }

    // Bullet list: - Item, * Item, • Item
    const bulletMatch = line.match(/^([-*•])\s+(.+)$/);
    if (bulletMatch) {
      flushParagraph();
      flushTable();
      if (!currentList || currentList.ordered) {
        flushList();
        currentList = { ordered: false, items: [] };
      }
      currentList.items.push(bulletMatch[2]);
      continue;
    }

    // Normal text lines accumulating into paragraph
    flushList();
    flushTable();
    currentParagraphLines.push(line);
  }

  flushAll();
  return blocks;
}

/**
 * Parses markdown inline tokens: [link](url), **bold**, `inline code`, and *italic*.
 */
export function renderFormattedInline(text: string): React.ReactNode {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const nodes: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      nodes.push(...parseInlineStyles(text.slice(lastIdx, match.index), `pre-${lastIdx}`));
    }
    const label = match[1];
    const url = match[2];
    const isInternal = url.startsWith("/");

    nodes.push(
      <a
        key={`link-${match.index}`}
        href={url}
        target={isInternal ? undefined : "_blank"}
        rel={isInternal ? undefined : "noopener noreferrer"}
        className="inline-flex items-center gap-0.5 font-semibold text-astro-blue underline underline-offset-2 hover:text-astro-navy transition-colors"
      >
        {label}
      </a>
    );
    lastIdx = linkRegex.lastIndex;
  }

  if (lastIdx < text.length) {
    nodes.push(...parseInlineStyles(text.slice(lastIdx), `post-${lastIdx}`));
  }

  return nodes.length > 0 ? nodes : parseInlineStyles(text, "all");
}

function parseInlineStyles(text: string, baseKey: string): React.ReactNode[] {
  const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  const nodes: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      nodes.push(
        <span key={`${baseKey}-plain-${lastIdx}`}>{text.slice(lastIdx, match.index)}</span>
      );
    }

    const token = match[1];
    if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(
        <strong key={`${baseKey}-b-${match.index}`} className="font-semibold text-astro-navy">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(
        <code
          key={`${baseKey}-c-${match.index}`}
          className="rounded bg-sky-100/70 px-1.5 py-0.5 font-mono text-[12px] font-semibold text-astro-navy"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      nodes.push(
        <em key={`${baseKey}-i-${match.index}`} className="italic text-ink/90">
          {token.slice(1, -1)}
        </em>
      );
    }

    lastIdx = tokenRegex.lastIndex;
  }

  if (lastIdx < text.length) {
    nodes.push(
      <span key={`${baseKey}-plain-${lastIdx}`}>{text.slice(lastIdx)}</span>
    );
  }

  return nodes;
}

function renderQuestionText(text: string) {
  const match = text.match(/^(?:\*\*)?(Q|Tanya|Pertanyaan)(?::)?(?:\*\*)?\s*[:-]?\s*(.*)$/i);
  if (match) {
    return (
      <span className="flex items-baseline gap-1.5">
        <span className="font-extrabold text-astro-blue shrink-0">{match[1]}:</span>
        <span className="font-bold text-astro-navy">{renderFormattedInline(match[2])}</span>
      </span>
    );
  }
  return <span className="font-bold text-astro-navy">{renderFormattedInline(text)}</span>;
}

function renderAnswerText(text: string) {
  const match = text.match(/^(?:\*\*)?(A|Jawab|Jawaban)(?::)?(?:\*\*)?\s*[:-]?\s*(.*)$/i);
  if (match) {
    return (
      <span className="flex items-baseline gap-1.5">
        <span className="font-extrabold text-emerald-600 shrink-0">{match[1]}:</span>
        <span className="text-ink/85">{renderFormattedInline(match[2])}</span>
      </span>
    );
  }
  return <span className="text-ink/85">{renderFormattedInline(text)}</span>;
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
                className="rounded-full cursor-pointer"
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
                    block.level === 1 ? "pt-2 text-lg" : block.level === 2 ? "pt-1 text-base" : "text-sm",
                  )}
                >
                  {block.text}
                </h4>
              );
            }

            if (block.type === "qa") {
              return (
                <div key={index} className="space-y-1">
                  <div className="leading-snug">{renderQuestionText(block.question)}</div>
                  <div className="leading-relaxed pl-0 sm:pl-0.5">{renderAnswerText(block.answer)}</div>
                </div>
              );
            }

            if (block.type === "paragraph") {
              if (block.lines.length === 1) {
                return (
                  <p key={index} className="text-ink/80 leading-relaxed">
                    {renderFormattedInline(block.lines[0])}
                  </p>
                );
              }
              return (
                <div key={index} className="space-y-1 text-ink/80">
                  {block.lines.map((line, li) => (
                    <p key={li} className="leading-relaxed">
                      {renderFormattedInline(line)}
                    </p>
                  ))}
                </div>
              );
            }

            if (block.type === "list") {
              if (block.ordered) {
                return (
                  <ol key={index} className="list-decimal space-y-1.5 pl-5 text-ink/80">
                    {block.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{renderFormattedInline(item)}</li>
                    ))}
                  </ol>
                );
              }
              return (
                <ul key={index} className="list-disc space-y-1.5 pl-5 text-ink/80">
                  {block.items.map((item, itemIndex) => (
                    <li key={itemIndex}>{renderFormattedInline(item)}</li>
                  ))}
                </ul>
              );
            }

            if (block.type === "table") {
              return (
                <div
                  key={index}
                  className="my-3 w-full overflow-x-auto rounded-xl border border-astro-cyan-2/40 bg-white shadow-2xs"
                >
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead className="bg-sky-50 text-astro-navy border-b border-astro-cyan-2/40 font-bold">
                      <tr>
                        {block.header.map((th, thi) => (
                          <th key={thi} className="px-3.5 py-2.5 font-bold text-astro-navy">
                            {renderFormattedInline(th)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-ink/85">
                      {block.rows.map((row, ri) => (
                        <tr key={ri} className="hover:bg-slate-50/70 transition-colors">
                          {row.map((cell, ci) => (
                            <td key={ci} className="px-3.5 py-2.5">
                              {renderFormattedInline(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }

            return (
              <Surface key={index} tone="gold" radius="xl" pad="md">
                <p className="text-xs font-bold text-astro-navy">{block.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-astro-navy/80">
                  {renderFormattedInline(block.text)}
                </p>
              </Surface>
            );
          })}
        </article>
      )}
    </div>
  );
}
