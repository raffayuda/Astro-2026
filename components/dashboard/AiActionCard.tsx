"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trophy,
  PlusCircle,
  Pencil,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export interface ActionProposalData {
  type: "ACTION_PROPOSAL";
  actionId: string;
  actionType: "CREATE_COMPETITION" | "UPDATE_COMPETITION" | "UPDATE_REGISTRATION_STATUS" | "SET_WINNERS";
  title: string;
  summary: string;
  payload: Record<string, unknown>;
  preview?: { label: string; value: string }[];
  diff?: { field: string; label: string; oldVal: string; newVal: string }[];
  winnersList?: { rank: string; registrationId: string; name: string; institution?: string }[];
}

export function AiActionCard({ proposal }: { proposal: ActionProposalData }) {
  const [status, setStatus] = useState<"pending" | "executing" | "success" | "cancelled" | "error">("pending");
  const [resultMessage, setResultMessage] = useState("");
  const [detailUrl, setDetailUrl] = useState<string | null>(null);

  const handleExecute = async () => {
    setStatus("executing");
    try {
      const res = await fetch("/api/dashboard/ai/action/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: proposal.actionType,
          payload: proposal.payload,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal menerapkan aksi ke database");
      }

      setStatus("success");
      setResultMessage(data.message || "Perubahan berhasil diterapkan ke database!");
      if (data.detailUrl) setDetailUrl(data.detailUrl);
      toast.success(data.message || "Aksi AI berhasil dieksekusi!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setStatus("error");
      setResultMessage(msg);
      toast.error(msg);
    }
  };

  const handleCancel = () => {
    setStatus("cancelled");
    toast.info("Proposal aksi dibatalkan.");
  };

  const getActionBadge = () => {
    switch (proposal.actionType) {
      case "CREATE_COMPETITION":
        return {
          icon: PlusCircle,
          label: "Tambah Cabang Lomba",
          style: "bg-emerald-50 text-emerald-700 border-emerald-300",
        };
      case "UPDATE_COMPETITION":
        return {
          icon: Pencil,
          label: "Pembaruan Kompetisi",
          style: "bg-sky-50 text-sky-700 border-sky-300",
        };
      case "UPDATE_REGISTRATION_STATUS":
        return {
          icon: ShieldCheck,
          label: "Verifikasi Pendaftaran",
          style: "bg-amber-50 text-amber-700 border-amber-300",
        };
      case "SET_WINNERS":
        return {
          icon: Trophy,
          label: "Penetapan Juara",
          style: "bg-purple-50 text-purple-700 border-purple-300",
        };
      default:
        return {
          icon: ShieldCheck,
          label: "Proposal Aksi",
          style: "bg-slate-50 text-slate-700 border-slate-300",
        };
    }
  };

  const badgeInfo = getActionBadge();
  const BadgeIcon = badgeInfo.icon;

  return (
    <div className="my-3 rounded-2xl border-2 border-astro-cyan-2/80 bg-linear-to-b from-white to-sky-50/50 shadow-soft overflow-hidden animate-in fade-in-0 duration-200">
      {/* Header */}
      <div className="p-3.5 bg-sky-bottom/60 border-b border-astro-cyan-2/40 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`text-[11px] font-bold py-0.5 px-2.5 flex items-center gap-1.5 ${badgeInfo.style}`}>
            <BadgeIcon className="size-3.5" />
            <span>{badgeInfo.label}</span>
          </Badge>
          <span className="text-[10px] text-muted-foreground font-mono">
            {proposal.actionId.split("-").slice(0, 2).join("-")}
          </span>
        </div>
        <Badge variant="outline" className="text-[10px] bg-white text-astro-navy border-slate-200">
          Konfirmasi Admin
        </Badge>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3.5">
        <div>
          <h4 className="font-bold text-sm text-astro-navy font-title flex items-center gap-1.5">
            {proposal.title}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {proposal.summary}
          </p>
        </div>

        {/* Content Type: CREATE_COMPETITION Preview Grid */}
        {proposal.actionType === "CREATE_COMPETITION" && proposal.preview && (
          <div className="rounded-xl border border-slate-200 bg-white p-3 divide-y divide-slate-100">
            {proposal.preview.map((item, idx) => (
              <div key={idx} className="py-1.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs gap-3">
                <span className="text-muted-foreground shrink-0">{item.label}</span>
                <span className="font-semibold text-astro-navy text-right truncate">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Content Type: UPDATE_COMPETITION / UPDATE_REGISTRATION_STATUS Diff Table */}
        {(proposal.actionType === "UPDATE_COMPETITION" || proposal.actionType === "UPDATE_REGISTRATION_STATUS") &&
          proposal.diff && (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-sky-50/70 text-astro-navy font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2">Parameter</th>
                    <th className="px-3 py-2 text-rose-600">Sebelum</th>
                    <th className="px-3 py-2 text-emerald-600">Menjadi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {proposal.diff.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2 font-medium text-slate-700">{d.label}</td>
                      <td className="px-3 py-2 text-slate-500 line-through">{d.oldVal}</td>
                      <td className="px-3 py-2 font-bold text-emerald-700 flex items-center gap-1">
                        <ArrowRight className="size-3 shrink-0 text-emerald-500" />
                        <span>{d.newVal}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        {/* Content Type: SET_WINNERS Podium */}
        {proposal.actionType === "SET_WINNERS" && proposal.winnersList && (
          <div className="space-y-1.5">
            {proposal.winnersList.map((w, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 rounded-xl border border-purple-200 bg-purple-50/40 text-xs gap-2"
              >
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-white border border-purple-200 font-bold text-purple-700 flex items-center justify-center shrink-0">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                  </div>
                  <div>
                    <p className="font-bold text-astro-navy">{w.name}</p>
                    <p className="text-[11px] text-muted-foreground">{w.institution}</p>
                  </div>
                </div>
                <Badge className="bg-purple-600 text-white text-[10px] font-bold">
                  {w.rank}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Status: SUCCESS */}
        {status === "success" && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />
              <span className="text-xs font-semibold">{resultMessage}</span>
            </div>
            {detailUrl && (
              <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 shrink-0">
                <Link href={detailUrl} target="_blank">
                  <span>Lihat di Dashboard</span>
                  <ExternalLink className="size-3 ml-1" />
                </Link>
              </Button>
            )}
          </div>
        )}

        {/* Status: ERROR */}
        {status === "error" && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 text-rose-600 shrink-0" />
              <span className="text-xs font-medium">{resultMessage}</span>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleExecute}
              className="text-xs h-7 border-rose-300 text-rose-700 hover:bg-rose-100"
            >
              Coba Lagi
            </Button>
          </div>
        )}

        {/* Status: CANCELLED */}
        {status === "cancelled" && (
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs flex items-center gap-2">
            <XCircle className="size-4 text-slate-400 shrink-0" />
            <span>Proposal aksi dibatalkan oleh admin. Tidak ada perubahan yang disimpan.</span>
          </div>
        )}

        {/* Footer Actions when PENDING or EXECUTING */}
        {(status === "pending" || status === "executing") && (
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={status === "executing"}
              onClick={handleCancel}
              className="text-xs text-muted-foreground hover:text-foreground h-8 cursor-pointer"
            >
              Batalkan
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={status === "executing"}
              onClick={handleExecute}
              className="bg-astro-navy hover:bg-astro-blue text-white text-xs font-bold h-8 px-3.5 shadow-xs cursor-pointer"
            >
              {status === "executing" ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  <span>Menerapkan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3.5 mr-1.5 text-emerald-400" />
                  <span>Setujui & Terapkan</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
