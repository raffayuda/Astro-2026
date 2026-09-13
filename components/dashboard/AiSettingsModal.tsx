"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Bot,
  ExternalLink,
  ShieldCheck,
  Activity,
  Sliders,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import type { PublicAiConfig } from "@/src/server/ai/config";

interface AiSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigUpdated?: (config: PublicAiConfig) => void;
}

const MODEL_PRESETS = [
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash (Recommended)", desc: "Sangat cepat & akurat untuk tools" },
  { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash", desc: "Stabil & hemat kuota token" },
  { id: "gpt-4o-mini", label: "GPT-4o Mini", desc: "Performa seimbang dari OpenAI" },
  { id: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet", desc: "Kemampuan penalaran tinggi" },
  { id: "deepseek-chat", label: "DeepSeek Chat", desc: "Model open-weights hemat" },
];

export function AiSettingsModal({
  open,
  onOpenChange,
  onConfigUpdated,
}: AiSettingsModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [config, setConfig] = useState<PublicAiConfig | null>(null);

  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [baseUrl, setBaseUrl] = useState("https://api.9router.com/v1");
  const [model, setModel] = useState("gemini-2.0-flash");
  const [temperature, setTemperature] = useState("0.7");
  const [isEnabled, setIsEnabled] = useState(true);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "security">("general");

  // Fetch current DB settings on open
  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    setLoading(true);
    setTestResult(null);

    fetch("/api/dashboard/ai/settings")
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil konfigurasi");
        return res.json();
      })
      .then((data: PublicAiConfig) => {
        if (!isMounted) return;
        setConfig(data);
        setBaseUrl(data.baseUrl || "https://api.9router.com/v1");
        setModel(data.model || "gemini-2.0-flash");
        setTemperature(data.temperature || "0.7");
        setIsEnabled(data.isEnabled ?? true);
        setApiKeyInput("");
      })
      .catch((err) => {
        console.error(err);
        toast.error("Gagal memuat pengaturan AI");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open]);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/dashboard/ai/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          apiKey: apiKeyInput.trim() || undefined,
          baseUrl: baseUrl.trim(),
          model: model.trim(),
        }),
      });

      const data = await res.json();
      setTestResult(data);

      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message || "Koneksi ke layanan AI gagal");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menguji koneksi";
      setTestResult({ success: false, message: msg });
      toast.error(msg);
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/dashboard/ai/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "9router",
          apiKey: apiKeyInput.trim() || undefined,
          baseUrl: baseUrl.trim(),
          model: model.trim(),
          temperature,
          isEnabled,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal menyimpan konfigurasi");
      }

      const resData = await res.json();
      toast.success("Pengaturan AI berhasil disimpan ke database!");
      if (resData.data) {
        setConfig(resData.data);
        onConfigUpdated?.(resData.data);
      }
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden bg-white border border-astro-cyan-2/60 shadow-xl rounded-2xl">
        {/* Header with ASTRO Branding */}
        <div className="bg-linear-to-r from-astro-navy to-astro-blue p-6 text-white relative">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <Bot className="size-6 text-astro-cyan-2" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                Pengaturan AI Copilot
                <Sparkles className="size-4 text-amber-300 fill-amber-300" />
              </DialogTitle>
              <DialogDescription className="text-white/80 text-xs mt-0.5">
                Kelola API Key, pilihan model kecerdasan buatan, dan preferensi asisten.
              </DialogDescription>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="size-8 animate-spin text-astro-blue" />
            <p className="text-sm">Memuat pengaturan dari database...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-4">
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 gap-2 pb-0 -mt-2">
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "general"
                    ? "border-astro-blue text-astro-navy"
                    : "border-transparent text-muted-foreground hover:text-slate-800"
                }`}
              >
                <Sliders className="size-3.5" />
                <span>Konfigurasi Model</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "security"
                    ? "border-astro-blue text-astro-navy"
                    : "border-transparent text-muted-foreground hover:text-slate-800"
                }`}
              >
                <ShieldCheck className="size-3.5 text-emerald-600" />
                <span>Keamanan & Telemetri</span>
                {Boolean(config?.telemetry?.totalThreatsBlocked) && (
                  <Badge className="ml-1 text-[9px] px-1.5 py-0 bg-emerald-100 text-emerald-800 border-emerald-300">
                    {config?.telemetry?.totalThreatsBlocked} Blokir
                  </Badge>
                )}
              </button>
            </div>

            {activeTab === "general" ? (
              <div className="space-y-4 pt-1">
                {/* Status Status Badge */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-astro-cyan-2/40 bg-sky-bottom/50">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`size-3 rounded-full ${
                        config?.hasApiKey && isEnabled
                          ? "bg-emerald-500 animate-pulse"
                          : "bg-amber-500"
                      }`}
                    />
                    <div>
                      <p className="text-xs font-bold text-astro-navy">Status AI Assistant</p>
                      <p className="text-[11px] text-muted-foreground">
                        {config?.hasApiKey
                          ? `Terkonfigurasi (${config.maskedApiKey})`
                          : "Kunci API belum diisi"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="ai-toggle" className="text-xs font-medium cursor-pointer">
                      {isEnabled ? "Aktif" : "Nonaktif"}
                    </Label>
                    <Switch
                      id="ai-toggle"
                      checked={isEnabled}
                      onCheckedChange={setIsEnabled}
                    />
                  </div>
                </div>

                {/* API Key */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="api-key" className="text-xs font-bold text-astro-navy">
                      API Key <span className="text-rose-500">*</span>
                    </Label>
                    {config?.hasApiKey && (
                      <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300">
                        <CheckCircle2 className="size-3 mr-1" /> Tersimpan
                      </Badge>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="api-key"
                      type={showApiKey ? "text" : "password"}
                      placeholder={
                        config?.hasApiKey
                          ? `Ganti kunci saat ini (${config.maskedApiKey})`
                          : "Masukkan API Key Anda"
                      }
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      className="pr-10 rounded-lg text-sm border-astro-cyan-2/60 focus-visible:ring-astro-blue"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showApiKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Kunci API disimpan secara aman di database dan hanya dapat diakses oleh administrator.
                  </p>
                </div>

                {/* Gateway Base URL */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="base-url" className="text-xs font-bold text-astro-navy">
                      Gateway URL (Opsional)
                    </Label>
                    {baseUrl.startsWith("http") && (
                      <a
                        href={baseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-astro-blue hover:underline"
                      >
                        <span>Cek URL</span>
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                  <Input
                    id="base-url"
                    type="url"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="https://api.example.com/v1"
                    className="rounded-lg text-sm border-astro-cyan-2/60 focus-visible:ring-astro-blue"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Alamat endpoint gateway penyedia layanan AI.
                  </p>
                </div>

                {/* Model Selection */}
                <div className="space-y-2">
                  <Label htmlFor="model-select" className="text-xs font-bold text-astro-navy">
                    Pilihan Model AI
                  </Label>
                  <Input
                    id="model-select"
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="gemini-2.0-flash"
                    className="rounded-lg text-sm border-astro-cyan-2/60 focus-visible:ring-astro-blue font-mono text-xs"
                  />

                  {/* Quick Presets */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {MODEL_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setModel(preset.id)}
                        className={`text-[11px] px-2.5 py-1 rounded-md border transition-all ${
                          model === preset.id
                            ? "bg-astro-blue text-white border-astro-blue font-semibold shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:border-astro-blue/50"
                        }`}
                      >
                        {preset.id}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Test Result Callout */}
                {testResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                      testResult.success
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : "bg-rose-50 border-rose-200 text-rose-800"
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="size-4 shrink-0 text-rose-600 mt-0.5" />
                    )}
                    <span className="leading-relaxed">{testResult.message}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3.5 pt-1">
                {/* Security Status Banner */}
                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 text-emerald-900 flex items-start gap-2.5">
                  <ShieldCheck className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-emerald-950">Enterprise Guardrails Aktif</h4>
                      <Badge className="bg-emerald-600 text-white text-[9px] px-1.5 py-0 font-mono">11 Guards</Badge>
                    </div>
                    <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                      Sistem pertahanan berlapis memproteksi Copilot dari jailbreak, injeksi prompt, koding arbitrer, dan serangan indirect injection secara real-time.
                    </p>
                  </div>
                </div>

                {/* Telemetry Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/80">
                    <p className="text-[10px] text-muted-foreground">Request Diperiksa</p>
                    <p className="text-base font-bold text-astro-navy mt-0.5">
                      {config?.telemetry?.totalRequestsChecked ?? 0}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/80">
                    <p className="text-[10px] text-muted-foreground">Ancaman Diblokir</p>
                    <p className="text-base font-bold text-emerald-600 mt-0.5">
                      {config?.telemetry?.totalThreatsBlocked ?? 0}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/80">
                    <p className="text-[10px] text-muted-foreground">Circuit Lockout</p>
                    <p className="text-base font-bold text-amber-600 mt-0.5">
                      {config?.telemetry?.circuitBreakerTrips ?? 0}
                    </p>
                  </div>
                </div>

                {/* Breakdown of Threats */}
                <div className="space-y-1.5 p-3 rounded-xl border border-slate-200 bg-white">
                  <p className="text-xs font-bold text-astro-navy flex items-center gap-1.5">
                    <Activity className="size-3.5 text-astro-blue" />
                    Rincian Ancaman Digagalkan
                  </p>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-700 pt-1">
                    <div className="flex justify-between py-0.5 border-b border-slate-100">
                      <span>Koding Arbitrer</span>
                      <strong className="font-mono text-astro-navy">{config?.telemetry?.threatsByType?.ARBITRARY_CODING ?? 0}</strong>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-100">
                      <span>Jailbreak & DAN</span>
                      <strong className="font-mono text-astro-navy">{config?.telemetry?.threatsByType?.PROMPT_INJECTION_OR_JAILBREAK ?? 0}</strong>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-100">
                      <span>Eksfiltrasi Prompt</span>
                      <strong className="font-mono text-astro-navy">{config?.telemetry?.threatsByType?.PROMPT_EXFILTRATION ?? 0}</strong>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-100">
                      <span>Cipher / Base64</span>
                      <strong className="font-mono text-astro-navy">{config?.telemetry?.threatsByType?.OBFUSCATION_CIPHER ?? 0}</strong>
                    </div>
                  </div>
                </div>

                {/* Active Guards List */}
                <div className="space-y-1 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                  <p className="text-xs font-bold text-astro-navy flex items-center gap-1.5">
                    <Lock className="size-3.5 text-slate-700" />
                    Protokol Keamanan Aktif
                  </p>
                  <div className="text-[10px] text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
                    <span className="flex items-center gap-1">✅ Normalisasi Unicode NFKC</span>
                    <span className="flex items-center gap-1">✅ Zero-Width Stripping</span>
                    <span className="flex items-center gap-1">✅ Rate Limit (15 req/m)</span>
                    <span className="flex items-center gap-1">✅ Circuit Breaker 3-Strike</span>
                    <span className="flex items-center gap-1">✅ Anti-Indirect Injection</span>
                    <span className="flex items-center gap-1">✅ Zero Direct Writes (HitL)</span>
                    <span className="flex items-center gap-1">✅ Anti-Halusinasi Grounding</span>
                    <span className="flex items-center gap-1">✅ Output Secret Sanitizer</span>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="flex sm:justify-between items-center gap-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={testing || (!config?.hasApiKey && !apiKeyInput.trim())}
                className="text-xs rounded-lg border-astro-cyan-2/80 hover:bg-sky-bottom"
              >
                {testing ? (
                  <>
                    <Loader2 className="size-3.5 mr-1.5 animate-spin" /> Menguji...
                  </>
                ) : (
                  "Test Connection"
                )}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="text-xs rounded-lg"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={saving}
                  className="text-xs rounded-lg bg-astro-navy hover:bg-astro-blue text-white shadow-sm font-semibold"
                >
                  {saving ? (
                    <>
                      <Loader2 className="size-3.5 mr-1.5 animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    "Simpan Pengaturan"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
