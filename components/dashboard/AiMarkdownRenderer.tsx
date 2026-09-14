"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface AiMarkdownRendererProps {
  content: string;
  compact?: boolean;
}

/**
 * Robust markdown renderer for ASTRO Copilot responses.
 * Supports headers, tables, bullet/numbered lists, bold, inline code, links, and blockquotes.
 */
export const AiMarkdownRenderer = React.memo(function AiMarkdownRenderer({
  content,
  compact = false,
}: AiMarkdownRendererProps) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  let inTable = false;
  let tableRows: string[][] = [];
  let tableHeader: string[] = [];

  const flushTable = (key: string) => {
    if (!inTable) return;
    elements.push(
      <div
        key={key}
        className={`my-2.5 w-full overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-2xs ${
          compact ? "max-w-full text-[11px]" : "text-xs"
        }`}
      >
        <table className="w-full text-left border-collapse">
          {tableHeader.length > 0 && (
            <thead className="bg-sky-50/90 text-astro-navy border-b border-slate-200 font-bold">
              <tr>
                {tableHeader.map((th, i) => (
                  <th key={`th-${key}-${i}`} className={`font-bold ${compact ? "px-2.5 py-1.5" : "px-3 py-2"}`}>
                    {th.trim()}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-slate-100">
            {tableRows.map((row, ri) => (
              <tr key={`tr-${key}-${ri}`} className="hover:bg-slate-50/60 transition-colors">
                {row.map((cell, ci) => (
                  <td key={`td-${key}-${ri}-${ci}`} className={`${compact ? "px-2.5 py-1.5" : "px-3 py-2"}`}>
                    {parseInlineMarkdown(cell.trim(), `c-${key}-${ri}-${ci}`, compact)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
    );
    inTable = false;
    tableRows = [];
    tableHeader = [];
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Table row detection: | col1 | col2 |
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const cells = trimmed
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());

      // Separator row: |---|---| or |:---|---:|
      if (cells.every((c) => /^:?-+:?$/.test(c))) {
        return;
      }

      if (!inTable) {
        inTable = true;
        tableHeader = cells;
      } else {
        tableRows.push(cells);
      }
      return;
    } else if (inTable) {
      flushTable(`tbl-${index}`);
    }

    if (!trimmed) {
      elements.push(<div key={`sp-${index}`} className={compact ? "h-1" : "h-1.5"} />);
      return;
    }

    // Headings
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h4
          key={`h4-${index}`}
          className={`font-bold text-astro-navy mt-3 mb-1 flex items-center gap-1.5 ${
            compact ? "text-xs" : "text-sm"
          }`}
        >
          {parseInlineMarkdown(trimmed.slice(4), `h4-${index}`, compact)}
        </h4>,
      );
      return;
    }
    if (trimmed.startsWith("## ")) {
      elements.push(
        <h3
          key={`h3-${index}`}
          className={`font-bold text-astro-navy mt-3.5 mb-1.5 pb-1 border-b border-slate-200 ${
            compact ? "text-xs" : "text-base"
          }`}
        >
          {parseInlineMarkdown(trimmed.slice(3), `h3-${index}`, compact)}
        </h3>,
      );
      return;
    }
    if (trimmed.startsWith("# ")) {
      elements.push(
        <h2
          key={`h2-${index}`}
          className={`font-extrabold text-astro-navy mt-4 mb-2 ${
            compact ? "text-sm" : "text-lg"
          }`}
        >
          {parseInlineMarkdown(trimmed.slice(2), `h2-${index}`, compact)}
        </h2>,
      );
      return;
    }

    // Blockquote: > quote
    if (trimmed.startsWith("> ")) {
      elements.push(
        <div
          key={`quote-${index}`}
          className="my-1.5 pl-3 border-l-2 border-astro-blue/60 bg-sky-50/50 py-1 rounded-r-md text-slate-700 italic"
        >
          {parseInlineMarkdown(trimmed.slice(2), `quote-txt-${index}`, compact)}
        </div>,
      );
      return;
    }

    // Bullet points: - item, * item, • item
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
      elements.push(
        <div
          key={`li-${index}`}
          className={`flex items-start gap-2 ml-1 my-0.5 text-slate-800 leading-relaxed ${
            compact ? "text-[11px]" : "text-xs"
          }`}
        >
          <span className="text-astro-blue mt-1 shrink-0 font-bold">•</span>
          <span>{parseInlineMarkdown(trimmed.slice(2), `li-txt-${index}`, compact)}</span>
        </div>,
      );
      return;
    }

    // Numbered list: 1. item
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      elements.push(
        <div
          key={`num-${index}`}
          className={`flex items-start gap-2 ml-1 my-0.5 text-slate-800 leading-relaxed ${
            compact ? "text-[11px]" : "text-xs"
          }`}
        >
          <span className="text-astro-blue font-semibold shrink-0">{numberedMatch[1]}.</span>
          <span>{parseInlineMarkdown(numberedMatch[2], `num-txt-${index}`, compact)}</span>
        </div>,
      );
      return;
    }

    // Regular paragraph
    elements.push(
      <p
        key={`p-${index}`}
        className={`text-slate-800 leading-relaxed my-0.5 ${
          compact ? "text-[11px]" : "text-xs"
        }`}
      >
        {parseInlineMarkdown(line, `p-${index}`, compact)}
      </p>,
    );
  });

  if (inTable) {
    flushTable("tbl-end");
  }

  return <div className="space-y-0.5 break-words">{elements}</div>;
});

/**
 * Parses markdown inline tokens: [link](url), **bold**, `inline code`, and *italic*.
 */
function parseInlineMarkdown(text: string, baseKey = "inline", compact = false): React.ReactNode {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const nodes: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      nodes.push(
        ...parseInlineFormatting(
          text.slice(lastIdx, match.index),
          `${baseKey}-pre-${lastIdx}`,
        ),
      );
    }
    const label = match[1];
    const url = match[2];
    const isInternal = url.startsWith("/");

    nodes.push(
      <Link
        key={`${baseKey}-link-${match.index}`}
        href={url}
        className="inline-flex items-center gap-0.5 text-astro-blue font-semibold underline underline-offset-2 hover:text-astro-navy transition-colors"
        target={isInternal ? undefined : "_blank"}
      >
        {label}
        {isInternal ? <ArrowUpRight className={compact ? "size-2.5 inline" : "size-3 inline"} /> : null}
      </Link>,
    );
    lastIdx = linkRegex.lastIndex;
  }

  if (lastIdx < text.length) {
    nodes.push(
      ...parseInlineFormatting(
        text.slice(lastIdx),
        `${baseKey}-post-${lastIdx}`,
      ),
    );
  }

  return nodes.length > 0 ? nodes : parseInlineFormatting(text, `${baseKey}-all`);
}

/**
 * Handles **bold**, `code`, and *italic* formatting.
 */
function parseInlineFormatting(text: string, baseKey: string): React.ReactNode[] {
  // Regex that matches **bold**, `code`, and *italic*
  const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  const nodes: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      nodes.push(
        <span key={`${baseKey}-plain-${lastIdx}`}>
          {text.slice(lastIdx, match.index)}
        </span>,
      );
    }

    const token = match[1];
    if (token.startsWith("**") && token.endsWith("**")) {
      // Bold
      nodes.push(
        <strong key={`${baseKey}-b-${match.index}`} className="font-bold text-astro-navy">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      // Inline Code
      nodes.push(
        <code
          key={`${baseKey}-c-${match.index}`}
          className="px-1.5 py-0.5 rounded-md bg-slate-200/80 font-mono text-[11px] text-astro-navy font-semibold"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      // Italic
      nodes.push(
        <em key={`${baseKey}-i-${match.index}`} className="italic text-slate-700">
          {token.slice(1, -1)}
        </em>,
      );
    }

    lastIdx = tokenRegex.lastIndex;
  }

  if (lastIdx < text.length) {
    nodes.push(
      <span key={`${baseKey}-plain-${lastIdx}`}>
        {text.slice(lastIdx)}
      </span>,
    );
  }

  return nodes;
}
