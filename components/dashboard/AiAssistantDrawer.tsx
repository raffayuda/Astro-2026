"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Bot,
  User,
  Send,
  X,
  Maximize2,
  Trash2,
  StopCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiActionCard } from "@/components/dashboard/AiActionCard";
import { AiCsvExportCard } from "@/components/dashboard/AiCsvExportCard";
import { AiMarkdownRenderer } from "@/components/dashboard/AiMarkdownRenderer";
import {
  AiFileAttachmentBar,
  AiUploadTriggerButton,
  type AiFileAttachmentBarRef,
  formatUserMessageDisplay,
} from "@/components/dashboard/AiFileAttachmentBar";
import {
  useAiChat,
  getMessageText,
  getActionProposals,
  getCsvExports,
  cleanDisplayAssistantText,
} from "@/components/dashboard/AiChatContext";

export function AiAssistantDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const pathname = usePathname();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const attachmentBarRef = useRef<AiFileAttachmentBarRef>(null);

  // If already on the dedicated /dashboard/ai page, hide the floating button to avoid redundancy
  const isAiPage = pathname === "/dashboard/ai";

  const {
    messages,
    sendMessage,
    isLoading,
    stop,
    clearChat,
    attachedFiles,
    isUploadingFile,
  } = useAiChat();

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isUploadingFile) return;

    let text = input.trim();
    if (!text && attachedFiles.length > 0) {
      text = "Tolong analisa berkas yang saya lampirkan dan berikan usulan langkah operasional.";
    }

    if (!text) return;
    setInput("");
    await sendMessage({ text });
  };

  if (isAiPage) return null;

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            type="button"
            onClick={() => setIsOpen(true)}
            className="h-12 px-4 rounded-full bg-linear-to-r from-astro-navy to-astro-blue text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20 flex items-center gap-2.5 font-bold text-xs cursor-pointer"
            aria-label="Buka AI Copilot"
          >
            <div className="size-6 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="size-3.5 text-astro-cyan-2" />
            </div>
            <span>Tanya AI Copilot</span>
          </Button>
        </div>
      )}

      {/* Slide-out Floating Widget Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] rounded-2xl bg-white border border-astro-cyan-2/80 shadow-2xl flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Widget Header */}
          <div className="p-3.5 bg-linear-to-r from-astro-navy to-astro-blue text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                <Bot className="size-4.5 text-astro-cyan-2" />
              </div>
              <div>
                <h3 className="text-xs font-bold flex items-center gap-1.5">
                  ASTRO Copilot
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[10px] text-white/80">Asisten Pendaftaran & Kompetisi</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href="/dashboard/ai"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title="Buka halaman penuh"
              >
                <Maximize2 className="size-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Tutup"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50/50">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="size-10 rounded-xl bg-astro-cyan-2/30 flex items-center justify-center mb-2.5">
                  <Sparkles className="size-5 text-astro-blue" />
                </div>
                <p className="text-xs font-bold text-astro-navy">Ada yang bisa dibantu?</p>
                <p className="text-[11px] text-muted-foreground mt-1 max-w-[260px] leading-relaxed">
                  Tanyakan peserta yang belum bayar, cek kuota lomba, atau cari data registrasi.
                </p>
                <div className="mt-4 space-y-1.5 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setInput("Tampilkan pendaftar yang belum bayar");
                    }}
                    className="w-full text-left text-[11px] p-2 rounded-lg border border-slate-200 bg-white hover:bg-sky-50 transition-colors text-astro-navy font-medium cursor-pointer"
                  >
                    🔍 Pendaftar yang belum bayar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInput("Bagaimana sisa kuota lomba saat ini?");
                    }}
                    className="w-full text-left text-[11px] p-2 rounded-lg border border-slate-200 bg-white hover:bg-sky-50 transition-colors text-astro-navy font-medium cursor-pointer"
                  >
                    🏆 Cek sisa kuota lomba
                  </button>
                </div>
              </div>
            ) : (
              messages.map((m) => {
                const isAssistant = m.role === "assistant";
                const text = getMessageText(m);
                const proposals = isAssistant ? getActionProposals(m) : [];
                const csvExports = isAssistant ? getCsvExports(m) : [];
                return (
                  <div
                    key={m.id}
                    className={`flex gap-2 ${isAssistant ? "justify-start" : "justify-end"}`}
                  >
                    {isAssistant && (
                      <div className="size-6 rounded-md bg-astro-navy flex items-center justify-center text-white shrink-0 mt-0.5">
                        <Bot className="size-3" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-xl p-2.5 text-xs leading-relaxed shadow-2xs ${
                        isAssistant
                          ? "bg-white border border-slate-200 text-slate-800 rounded-tl-xs"
                          : "bg-astro-navy text-white rounded-tr-xs"
                      }`}
                    >
                      {isAssistant ? (
                        <>
                        {(() => {
                          const displayText = cleanDisplayAssistantText(text, proposals.length > 0);
                          return displayText ? <AiMarkdownRenderer content={displayText} compact /> : null;
                        })()}
                        {proposals.map((prop, idx) => (
                          <AiActionCard key={prop.actionId || `prop-${idx}`} proposal={prop} />
                        ))}
                        {csvExports.map((csv, idx) => (
                          <AiCsvExportCard key={`csv-${idx}`} exportData={csv} />
                        ))}
                      </>
                      ) : (
                        (() => {
                          const formatted = formatUserMessageDisplay(text);
                          return (
                            <div>
                              {formatted.attachedFiles.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-1.5">
                                  {formatted.attachedFiles.map((af, i) => (
                                    <div
                                      key={i}
                                      className="flex items-center gap-1 rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-medium text-white/95"
                                    >
                                      <span className="max-w-[130px] truncate">{af.fileName}</span>
                                      <span className="text-[8px] uppercase opacity-75">({af.fileType})</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <p className="whitespace-pre-wrap">{formatted.text}</p>
                            </div>
                          );
                        })()
                      )}
                    </div>
                    {!isAssistant && (
                      <div className="size-6 rounded-md bg-astro-cyan-2 flex items-center justify-center text-astro-navy shrink-0 mt-0.5">
                        <User className="size-3" />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white p-2 rounded-lg border border-slate-200">
                <Loader2 className="size-3.5 animate-spin text-astro-blue" />
                <span>Mencari data...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Widget Input Bar */}
          <div className="p-2.5 bg-white border-t border-slate-100 space-y-1.5">
            {/* Attached file chips */}
            <AiFileAttachmentBar ref={attachmentBarRef} compact />

            <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clearChat}
                  className="p-1.5 text-muted-foreground hover:text-destructive transition-colors cursor-pointer rounded-lg"
                  title="Bersihkan chat"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
              <AiUploadTriggerButton
                compact
                onClick={() => attachmentBarRef.current?.triggerUpload()}
                disabled={isLoading || isUploadingFile}
              />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  attachedFiles.length > 0
                    ? `Lampiran (${attachedFiles.length}). Kirim...`
                    : "Ketik pertanyaan / lampirkan berkas..."
                }
                disabled={isLoading}
                className="flex-1 text-xs px-3 py-2 rounded-lg border border-astro-cyan-2/60 focus:outline-hidden focus:ring-1 focus:ring-astro-blue"
              />
              {isLoading ? (
                <Button
                  type="button"
                  size="icon-sm"
                  onClick={() => stop()}
                  className="size-8 bg-rose-500 hover:bg-rose-600 text-white rounded-lg cursor-pointer"
                >
                  <StopCircle className="size-3.5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon-sm"
                  disabled={(!input.trim() && attachedFiles.length === 0) || isUploadingFile}
                  className="size-8 bg-astro-navy hover:bg-astro-blue text-white rounded-lg disabled:opacity-40 cursor-pointer"
                >
                  <Send className="size-3.5" />
                </Button>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
