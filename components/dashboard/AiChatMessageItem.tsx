"use client";

import React, { memo, useMemo } from "react";
import type { UIMessage } from "ai";
import { Bot, User, Paperclip, CheckCircle2, Loader2 } from "lucide-react";
import { AiMarkdownRenderer } from "@/components/dashboard/AiMarkdownRenderer";
import { AiActionCard } from "@/components/dashboard/AiActionCard";
import { AiCsvExportCard } from "@/components/dashboard/AiCsvExportCard";
import { formatUserMessageDisplay } from "@/components/dashboard/AiFileAttachmentBar";
import {
  getMessageText,
  getActionProposals,
  getCsvExports,
  cleanDisplayAssistantText,
} from "@/components/dashboard/AiChatContext";

export interface AiChatMessageItemProps {
  message: UIMessage;
  isStreaming?: boolean;
  compact?: boolean;
}

interface ToolBadgeInfo {
  id: string;
  name: string;
  label: string;
  state: "running" | "completed";
}

const TOOL_LABELS: Record<string, string> = {
  searchRegistrations: "Mencari data pendaftar",
  getRegistrationDetail: "Mengambil rincian pendaftar",
  getCompetitionDetail: "Membaca detail lengkap cabang lomba",
  getCompetitionsList: "Membaca daftar cabang lomba",
  getCompetitionStats: "Menganalisis statistik lomba & kuota",
  getFinancialAnalytics: "Menghitung analitik keuangan & konversi",
  getDashboardSchemaCatalog: "Memeriksa kamus skema data",
  getSponsorsList: "Membaca data sponsor & partner",
  getCommitteeList: "Membaca struktur panitia BEM",
  getFaqsList: "Membaca data FAQ",
  proposeCreateCompetition: "Menyusun formulir lomba baru",
  proposeUpdateCompetition: "Menyusun perubahan data lomba",
  proposeBatchAddCustomField: "Menyiapkan penambahan field lomba masal",
  proposeUpdateRegistrationStatus: "Menyiapkan verifikasi pendaftaran",
  proposeSetWinners: "Menyiapkan penetapan pemenang",
  generateExecutiveReport: "Menyusun laporan audit eksekutif",
  generateDataExport: "Membuat berkas ekspor CSV",
};

export function getToolBadges(message: UIMessage): ToolBadgeInfo[] {
  if (!Array.isArray(message.parts)) return [];

  const badges: ToolBadgeInfo[] = [];

  for (let i = 0; i < message.parts.length; i++) {
    const part: any = message.parts[i];
    if (!part) continue;

    const invocation = part.toolInvocation;
    if (invocation) {
      const toolName = invocation.toolName || invocation.name || "Aksi Sistem";
      const isCompleted =
        invocation.state === "result" ||
        invocation.result !== undefined ||
        invocation.output !== undefined;
      badges.push({
        id: invocation.toolCallId || `tool-${i}`,
        name: toolName,
        label: TOOL_LABELS[toolName] || toolName,
        state: isCompleted ? "completed" : "running",
      });
      continue;
    }

    if (
      part.type === "tool-invocation" ||
      part.type === "tool-call" ||
      part.type === "tool-result"
    ) {
      const toolName = part.toolName || part.name || "Aksi Sistem";
      const isCompleted =
        part.type === "tool-result" || part.result !== undefined || part.output !== undefined;
      badges.push({
        id: part.toolCallId || part.id || `tool-${i}`,
        name: toolName,
        label: TOOL_LABELS[toolName] || toolName,
        state: isCompleted ? "completed" : "running",
      });
    }
  }

  return badges;
}

function arePropsEqual(
  prevProps: AiChatMessageItemProps,
  nextProps: AiChatMessageItemProps
): boolean {
  if (prevProps.message.id !== nextProps.message.id) return false;
  if (prevProps.isStreaming !== nextProps.isStreaming) return false;
  if (prevProps.compact !== nextProps.compact) return false;
  if (prevProps.message.role !== nextProps.message.role) return false;

  // If currently streaming, re-render to display live tokens
  if (nextProps.isStreaming) return false;

  // If not streaming and reference is identical, skip
  if (prevProps.message === nextProps.message) return true;

  // Compare proposals
  const prevProposals = getActionProposals(prevProps.message);
  const nextProposals = getActionProposals(nextProps.message);
  if (prevProposals.length !== nextProposals.length) return false;
  for (let i = 0; i < prevProposals.length; i++) {
    if (prevProposals[i].actionId !== nextProposals[i].actionId) return false;
  }

  // Compare tool badges
  const prevBadges = getToolBadges(prevProps.message);
  const nextBadges = getToolBadges(nextProps.message);
  if (prevBadges.length !== nextBadges.length) return false;
  for (let i = 0; i < prevBadges.length; i++) {
    if (prevBadges[i].state !== nextBadges[i].state) return false;
  }

  const prevExports = getCsvExports(prevProps.message);
  const nextExports = getCsvExports(nextProps.message);
  if (prevExports.length !== nextExports.length) return false;

  const prevText = getMessageText(prevProps.message);
  const nextText = getMessageText(nextProps.message);
  return prevText === nextText;
}

export const AiChatMessageItem = memo(function AiChatMessageItem({
  message,
  compact = false,
}: AiChatMessageItemProps) {
  const isAssistant = message.role === "assistant";

  const text = useMemo(() => getMessageText(message), [message]);

  const proposals = useMemo(
    () => (isAssistant ? getActionProposals(message) : []),
    [isAssistant, message]
  );

  const csvExports = useMemo(
    () => (isAssistant ? getCsvExports(message) : []),
    [isAssistant, message]
  );

  const toolBadges = useMemo(
    () => (isAssistant ? getToolBadges(message) : []),
    [isAssistant, message]
  );

  const displayText = useMemo(
    () => (isAssistant ? cleanDisplayAssistantText(text, proposals.length > 0) : text),
    [isAssistant, text, proposals.length]
  );

  const userFormatted = useMemo(
    () => (!isAssistant ? formatUserMessageDisplay(text) : null),
    [isAssistant, text]
  );

  return (
    <div className={`flex ${compact ? "gap-2" : "gap-3"} ${isAssistant ? "justify-start" : "justify-end"}`}>
      {isAssistant && (
        <div
          className={`${
            compact
              ? "size-6 rounded-md text-white bg-astro-navy shrink-0 mt-0.5"
              : "size-8 rounded-xl bg-linear-to-tr from-astro-navy to-astro-blue text-white shrink-0 shadow-xs mt-1"
          } flex items-center justify-center`}
        >
          <Bot className={compact ? "size-3" : "size-4"} />
        </div>
      )}

      <div
        className={`${
          compact ? "max-w-[85%] rounded-xl p-2.5 text-xs shadow-2xs" : "max-w-[85%] md:max-w-[78%] rounded-2xl p-4 text-xs shadow-xs"
        } leading-relaxed ${
          isAssistant
            ? compact
              ? "bg-white border border-slate-200 text-slate-800 rounded-tl-xs"
              : "bg-slate-50/90 border border-slate-200 text-slate-800 rounded-tl-xs"
            : "bg-astro-navy text-white rounded-tr-xs"
        }`}
      >
        {isAssistant ? (
          <div className={compact ? "space-y-2" : "space-y-3"}>
            {toolBadges.length > 0 && (
              <div className={`flex flex-wrap ${compact ? "gap-1" : "gap-1.5"} mb-1`}>
                {toolBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 ${
                      compact ? "text-[10px]" : "text-[11px]"
                    } font-medium transition-all ${
                      badge.state === "running"
                        ? "border-astro-blue/40 bg-astro-blue/10 text-astro-blue animate-pulse"
                        : "border-slate-200 bg-white text-slate-700 shadow-2xs"
                    }`}
                  >
                    {badge.state === "running" ? (
                      <Loader2 className={`${compact ? "size-2.5" : "size-3"} animate-spin text-astro-blue`} />
                    ) : (
                      <CheckCircle2 className={`${compact ? "size-2.5" : "size-3"} text-emerald-600`} />
                    )}
                    <span>{badge.label}</span>
                  </div>
                ))}
              </div>
            )}
            {displayText ? <AiMarkdownRenderer content={displayText} compact={compact} /> : null}
            {proposals.map((prop, idx) => (
              <AiActionCard key={prop.actionId || `prop-${idx}`} proposal={prop} />
            ))}
            {csvExports.map((csv, idx) => (
              <AiCsvExportCard key={`csv-${idx}`} exportData={csv} />
            ))}
          </div>
        ) : (
          userFormatted && (
            <div>
              {userFormatted.attachedFiles.length > 0 && (
                <div className={`flex flex-wrap ${compact ? "gap-1 mb-1.5" : "gap-1.5 mb-2"}`}>
                  {userFormatted.attachedFiles.map((af, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-1.5 rounded-md bg-white/15 ${
                        compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]"
                      } font-medium text-white/95`}
                    >
                      <Paperclip className={compact ? "size-2.5" : "size-3"} />
                      <span className={compact ? "max-w-[130px] truncate" : "max-w-[180px] truncate"}>
                        {af.fileName}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider opacity-80">
                        ({af.fileType})
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <p className="whitespace-pre-wrap">{userFormatted.text}</p>
            </div>
          )
        )}
      </div>

      {!isAssistant && (
        <div
          className={`${
            compact
              ? "size-6 rounded-md bg-astro-cyan-2 text-astro-navy shrink-0 mt-0.5"
              : "size-8 rounded-xl bg-astro-cyan-2/40 border border-astro-cyan-2 text-astro-navy shrink-0 shadow-xs mt-1"
          } flex items-center justify-center`}
        >
          <User className={compact ? "size-3" : "size-4"} />
        </div>
      )}
    </div>
  );
}, arePropsEqual);
