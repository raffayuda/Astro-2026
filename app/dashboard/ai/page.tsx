"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Bot,
  User,
  Send,
  Settings,
  Trash2,
  StopCircle,
  AlertTriangle,
  Loader2,
  Trophy,
  TrendingUp,
  PlusCircle,
  ShieldCheck,
  RotateCcw,
  FileSpreadsheet,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AiSettingsModal } from "@/components/dashboard/AiSettingsModal";
import { AiActionCard } from "@/components/dashboard/AiActionCard";
import { AiCsvExportCard } from "@/components/dashboard/AiCsvExportCard";
import { AiMarkdownRenderer } from "@/components/dashboard/AiMarkdownRenderer";
import {
  useAiChat,
  getMessageText,
  getActionProposals,
  getCsvExports,
} from "@/components/dashboard/AiChatContext";
import type { PublicAiConfig } from "@/src/server/ai/config";

const QUICK_PROMPTS = [
  {
    icon: PlusCircle,
    label: "Input Lomba Baru",
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    sendMessage,
    isLoading,
    stop,
    clearChat,
  } = useAiChat();

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput("");
    await sendMessage({ text });
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
      <div className="flex-1 flex flex-col min-h-0 rounded-2xl bg-white border border-astro-cyan-2/60 shadow-soft overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto">
              <div className="size-14 rounded-2xl bg-linear-to-b from-sky-50 to-astro-cyan-2/20 border border-astro-cyan-2/50 flex items-center justify-center mb-4 shadow-xs">
                <Sparkles className="size-7 text-astro-blue" />
              </div>
              <h3 className="font-bold text-base text-astro-navy font-title">
                Halo, Panitia ASTRO 2026!
              </h3>
              <p className="text-xs text-muted-foreground mt-1 mb-6 leading-relaxed">
                Tanyakan apa pun seputar data pendaftaran, sisa kuota lomba, status pembayaran tim, analisis keuangan, atau ekspor CSV.
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
            messages.map((message) => {
              const isAssistant = message.role === "assistant";
              const text = getMessageText(message);
              const proposals = isAssistant ? getActionProposals(message) : [];
              const csvExports = isAssistant ? getCsvExports(message) : [];
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isAssistant ? "justify-start" : "justify-end"}`}
                >
                  {isAssistant && (
                    <div className="size-8 rounded-xl bg-linear-to-tr from-astro-navy to-astro-blue flex items-center justify-center text-white shrink-0 shadow-xs mt-1">
                      <Bot className="size-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] md:max-w-[78%] rounded-2xl p-4 text-xs shadow-xs leading-relaxed ${
                      isAssistant
                        ? "bg-slate-50/90 border border-slate-200 text-slate-800 rounded-tl-xs"
                        : "bg-astro-navy text-white rounded-tr-xs"
                    }`}
                  >
                    {isAssistant ? (
                      <div className="space-y-3">
                        {text && <AiMarkdownRenderer content={text} />}
                        {proposals.map((prop, idx) => (
                          <AiActionCard key={prop.actionId || `prop-${idx}`} proposal={prop} />
                        ))}
                        {csvExports.map((csv, idx) => (
                          <AiCsvExportCard key={`csv-${idx}`} exportData={csv} />
                        ))}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{text}</p>
                    )}
                  </div>

                  {!isAssistant && (
                    <div className="size-8 rounded-xl bg-astro-cyan-2/40 border border-astro-cyan-2 flex items-center justify-center text-astro-navy shrink-0 shadow-xs mt-1">
                      <User className="size-4" />
                    </div>
                  )}
                </div>
              );
            })
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
        <div className="p-3 md:p-4 border-t border-slate-100 bg-slate-50/50">
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

            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanyakan status pendaftaran, sisa slot lomba, atau data peserta..."
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
                disabled={!input.trim() || (!config?.hasApiKey && !configLoading)}
                className="bg-astro-navy hover:bg-astro-blue text-white shrink-0 size-9 rounded-xl shadow-xs transition-all disabled:opacity-40"
                title="Kirim pesan"
              >
                <Send className="size-4" />
              </Button>
            )}
          </form>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground px-2 pt-2">
            <span>💡 Data yang disajikan berasal langsung dari database ASTRO 2026.</span>
            <span>Aman & Terverifikasi</span>
          </div>
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
