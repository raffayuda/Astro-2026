"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Bot,
  Send,
  Trash2,
  StopCircle,
  Loader2,
  Trophy,
  TrendingUp,
  PlusCircle,
  ShieldCheck,
  RotateCcw,
  FileSpreadsheet,
  BarChart3,
  FileText,
  UploadCloud,
  Settings,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AiSettingsModal } from "@/components/dashboard/AiSettingsModal";
import { AiChatMessageItem } from "@/components/dashboard/AiChatMessageItem";
import {
  AiFileAttachmentBar,
  AiUploadTriggerButton,
  type AiFileAttachmentBarRef,
} from "@/components/dashboard/AiFileAttachmentBar";
import { useAiChat } from "@/components/dashboard/AiChatContext";
import type { PublicAiConfig } from "@/src/server/ai/config";

const QUICK_PROMPTS = [
  {
    icon: FileText,
    label: "Analisis Juknis (.md / .pdf)",
    prompt: "Lampirkan berkas Juknis/GuideBook lomba (misal: GuideBook Futsal / Cerdas Cermat format .md atau .pdf), lalu klik kirim untuk dibuatkan proposal lomba secara otomatis.",
  },
  {
    icon: PlusCircle,
    label: "Input Lomba Manual",
    prompt: "Tolong buatkan proposal cabang lomba baru dari informasi berikut:\nNama: Desain Poster Digital\nKategori: kesenian\nBiaya: 35000\nKuota: 20 tim\nTanggal: 25 Oktober 2026\nLokasi: Lab Komputer STT-NF\nCP: Kak Citra (081298765432)\nHadiah: Juara 1 Rp 1.000.000 + E-Sertifikat",
  },
  {
    icon: BarChart3,
    label: "Statistik Kuota Lomba",
    prompt: "Tolong tampilkan ringkasan sisa kuota dan persentase keterisian untuk seluruh cabang lomba ASTRO 2026 saat ini.",
  },
  {
    icon: ShieldCheck,
    label: "Verifikasi Pembayaran",
    prompt: "Tolong carikan pendaftar yang statusnya pending, lalu ajukan verifikasi status pembayarannya menjadi paid karena sudah kirim bukti transfer.",
  },
  {
    icon: FileSpreadsheet,
    label: "Ekspor Data CSV",
    prompt: "Tolong buatkan berkas ekspor CSV untuk seluruh data pendaftar yang sudah berstatus lunas (paid).",
  },
  {
    icon: Trophy,
    label: "Laporan Eksekutif",
    prompt: "Tolong susunkan laporan audit eksekutif menyeluruh mengenai kuota lomba, konversi, revenue, dan rekomendasi panitia untuk rapat.",
  },
  {
    icon: TrendingUp,
    label: "Tetapkan Juara",
    prompt: "Tolong bantu saya menetapkan juara lomba Cerdas Cermat untuk Juara 1, 2, dan 3.",
  },
];

export default function AiAssistantPage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [config, setConfig] = useState<PublicAiConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [input, setInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const [visibleCount, setVisibleCount] = useState(25);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrolledUpRef = useRef(false);
  const attachmentBarRef = useRef<AiFileAttachmentBarRef>(null);

  const {
    messages,
    sendMessage,
    isLoading,
    stop,
    clearChat,
    attachedFiles,
    uploadAndAttachFile,
    isUploadingFile,
  } = useAiChat();

  const hasEarlierMessages = messages.length > visibleCount;
  const visibleMessages = hasEarlierMessages ? messages.slice(-visibleCount) : messages;

  const loadConfig = () => {
    setConfigLoading(true);
    fetch("/api/dashboard/ai/settings")
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat pengaturan");
        return res.json();
      })
      .then((data: PublicAiConfig) => setConfig(data))
      .catch((err) => console.error(err))
      .finally(() => setConfigLoading(false));
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    isUserScrolledUpRef.current = !isAtBottom;
  };

  useEffect(() => {
    if (isUserScrolledUpRef.current) return;
    const el = messagesContainerRef.current;
    if (!el) return;
    if (isLoading) {
      // Instant layout update during streaming without smooth scroll queue thrashing
      el.scrollTop = el.scrollHeight;
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isUploadingFile) return;

    let text = input.trim();
    if (!text && attachedFiles.length > 0) {
      text = "Tolong analisa berkas yang saya lampirkan dan berikan usulan langkah operasional (proposal cabang lomba / verifikasi data / penetapan pemenang).";
    }

    if (!text) return;
    setInput("");
    await sendMessage({ text });
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      setIsDragging(false);
      dragCounter.current = 0;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i];
        if (file) {
          await uploadAndAttachFile(file);
        }
      }
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setInput(promptText);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-6xl mx-auto">
      {/* Top Header Card */}
      <div className="shrink-0 mb-4 p-4 md:p-5 rounded-2xl bg-white border border-astro-cyan-2/60 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-xl bg-linear-to-tr from-astro-navy via-astro-blue to-astro-sky flex items-center justify-center shadow-xs border border-white/20">
            <Bot className="size-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold font-title text-astro-navy">
                ASTRO Copilot
              </h1>
              <Badge className="bg-astro-cyan-2/30 text-astro-navy border-astro-cyan-2/70 text-[10px] font-bold">
                Asisten Operasional
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Analisis data kompetisi, ekspor CSV, dan laporan eksekutif.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Model indicator */}
          <div className="px-3 py-1.5 rounded-lg bg-sky-50 border border-astro-cyan-2/40 text-[11px] flex items-center gap-2">
            <span
              className={`size-2 rounded-full ${
                config?.hasApiKey && config?.isEnabled ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <span className="font-semibold text-astro-navy font-mono">
              {config?.model || "AI Active"}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
            className="h-9 px-3 text-xs rounded-lg border-astro-cyan-2/70 hover:bg-sky-bottom font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="size-3.5 text-astro-navy" />
            <span>Chat Baru</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSettingsOpen(true)}
            className="h-9 px-3 text-xs rounded-lg border-astro-cyan-2/70 hover:bg-sky-bottom font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Settings className="size-3.5 text-astro-navy" />
            <span>Pengaturan AI</span>
          </Button>
        </div>
      </div>

      {/* Alert if API Key is not set */}
      {!configLoading && !config?.hasApiKey && (
        <div className="shrink-0 mb-4 p-4 rounded-xl border border-amber-200 bg-amber-50/90 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-900">Kunci API Belum Dikonfigurasi</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Silakan masukkan API Key di menu pengaturan agar AI Copilot dapat memproses analisis data.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setSettingsOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs shrink-0 rounded-lg shadow-xs"
          >
            Buka Pengaturan
          </Button>
        </div>
      )}

      {/* Main Chat Container */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="relative flex-1 flex flex-col min-h-0 rounded-2xl bg-white border border-astro-cyan-2/60 shadow-soft overflow-hidden"
      >
        {/* Drag & Drop Visual Overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-astro-navy/85 backdrop-blur-xs text-white p-6 border-2 border-dashed border-astro-cyan-2 m-2 rounded-2xl pointer-events-none animate-in fade-in-0 duration-150">
            <div className="size-16 rounded-2xl bg-white/10 flex items-center justify-center mb-3">
              <UploadCloud className="size-8 text-astro-cyan-2 animate-bounce" />
            </div>
            <p className="font-bold text-base font-title">Lepaskan Berkas di Sini</p>
            <p className="text-xs text-white/80 mt-1 max-w-sm text-center">
              ASTRO Copilot akan membaca seluruh isi berkas (.md, .pdf, .docx, .xlsx, .csv) untuk dianalisa
            </p>
          </div>
        )}

        {/* Messages Feed */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto">
              <div className="size-14 rounded-2xl bg-linear-to-b from-sky-50 to-astro-cyan-2/20 border border-astro-cyan-2/50 flex items-center justify-center mb-4 shadow-xs">
                <Sparkles className="size-7 text-astro-blue" />
              </div>
              <h3 className="font-bold text-base text-astro-navy font-title">
                Halo, Panitia ASTRO 2026!
              </h3>
              <p className="text-xs text-muted-foreground mt-1 mb-6 leading-relaxed">
                Tanyakan apa pun seputar data pendaftaran, sisa kuota lomba, status pembayaran tim, analisis keuangan, atau unggah berkas Juknis/GuideBook.
              </p>

              {/* Quick Prompts */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {QUICK_PROMPTS.map((qp, i) => {
                  const Icon = qp.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => handleQuickPrompt(qp.prompt)}
                      className="p-3 rounded-xl border border-astro-cyan-2/40 bg-sky-50/40 hover:bg-sky-bottom hover:border-astro-blue/50 text-left transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="size-3.5 text-astro-blue group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-astro-navy">{qp.label}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {qp.prompt}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {hasEarlierMessages && (
                <div className="flex justify-center pb-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setVisibleCount((prev) => Math.min(messages.length, prev + 25))}
                    className="text-[11px] h-7 px-3.5 rounded-full bg-white/95 border-astro-cyan-2/70 text-astro-navy hover:bg-sky-bottom shadow-2xs font-semibold cursor-pointer"
                  >
                    Tampilkan {Math.min(25, messages.length - visibleCount)} pesan sebelumnya ({messages.length - visibleCount} tersimpan)
                  </Button>
                </div>
              )}

              {visibleMessages.map((message, index) => {
                const isLast = index === visibleMessages.length - 1;
                return (
                  <AiChatMessageItem
                    key={message.id}
                    message={message}
                    isStreaming={isLoading && isLast && message.role === "assistant"}
                  />
                );
              })}
            </>
          )}

          {/* Streaming Indicator */}
          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-xl bg-linear-to-tr from-astro-navy to-astro-blue flex items-center justify-center text-white shrink-0 shadow-xs">
                <Loader2 className="size-4 animate-spin" />
              </div>
              <div className="rounded-2xl rounded-tl-xs bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-muted-foreground flex items-center gap-2">
                <span className="size-2 rounded-full bg-astro-blue animate-ping" />
                <span>ASTRO Copilot sedang menganalisa data database...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <div className="p-3 md:p-4 border-t border-slate-100 bg-slate-50/50 space-y-2">
          {/* File Attachment Bar & Chips */}
          <AiFileAttachmentBar ref={attachmentBarRef} />

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            {messages.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearChat}
                title="Bersihkan riwayat chat"
                className="text-muted-foreground hover:text-destructive shrink-0 size-9 rounded-xl cursor-pointer"
              >
                <Trash2 className="size-4" />
              </Button>
            )}

            <AiUploadTriggerButton
              onClick={() => attachmentBarRef.current?.triggerUpload()}
              disabled={isLoading || isUploadingFile}
            />

            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  attachedFiles.length > 0
                    ? `Berkas terlampir (${attachedFiles.length}). Ketik instruksi atau langsung kirim...`
                    : "Tanyakan data pendaftaran atau lampirkan berkas Juknis/GuideBook..."
                }
                disabled={isLoading}
                className="w-full rounded-xl border border-astro-cyan-2/70 bg-white px-4 py-2.5 text-xs text-astro-navy shadow-xs placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-astro-blue disabled:opacity-50"
              />
            </div>

            {isLoading ? (
              <Button
                type="button"
                size="icon"
                onClick={() => stop()}
                className="bg-rose-500 hover:bg-rose-600 text-white shrink-0 size-9 rounded-xl shadow-xs"
                title="Hentikan respons"
              >
                <StopCircle className="size-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                disabled={
                  (!input.trim() && attachedFiles.length === 0) ||
                  (!config?.hasApiKey && !configLoading) ||
                  isUploadingFile
                }
                className="bg-astro-navy hover:bg-astro-blue text-white shrink-0 size-9 rounded-xl shadow-xs transition-all disabled:opacity-40 cursor-pointer"
                title="Kirim pesan"
              >
                <Send className="size-4" />
              </Button>
            )}
          </form>
        </div>
      </div>

      {/* Settings Modal */}
      <AiSettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onConfigUpdated={(updated) => setConfig(updated)}
      />
    </div>
  );
}
