"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trophy, Check, Mail, Download } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState, PageHeader, SectionCard } from "@/components/dashboard";
import Pagination from "@/components/Pagination";
import {
  useCompetitions,
  useRegistrations,
  useCertificateGenerate,
  queryKeys,
} from "@/src/lib/hooks/use-queries";
import { apiHelpers } from "@/src/lib/api";
import { isFlagOn } from "@/lib/flags";
import { unwrapList } from "@/lib/lists";
import { cn } from "@/lib/utils";

interface Registration {
  id: string;
  type: string;
  fullName: string | null;
  teamName: string | null;
  leaderName: string | null;
  email: string;
  isWinner: string;
  winnerRank: string | null;
  certificateSent: string;
}

const PAGE_SIZE = 10;

export default function SertifikatPage() {
  const qc = useQueryClient();
  const [selectedComp, setSelectedComp] = useState<string>("");
  const [page, setPage] = useState(1);
  const [sending, setSending] = useState(false);

  const { data: compsData, isLoading: loading } = useCompetitions();
  const competitions = (compsData ?? []).filter((c) => isFlagOn(c.certificateEnabled));

  const generateAllMut = useCertificateGenerate(selectedComp);

  const { data: regPage } = useRegistrations(
    selectedComp ? { competitionId: selectedComp, pageSize: 100 } : {},
  );
  const registrations = selectedComp
    ? unwrapList<Registration & { paymentStatus: string }>(regPage).filter(
        (r) => r.paymentStatus === "paid",
      )
    : [];

  const invalidate = () =>
    qc.invalidateQueries({
      queryKey: queryKeys.registrations.list({ competitionId: selectedComp }),
    });

  const winnerMutation = useMutation({
    mutationFn: ({ regId, rank }: { regId: string; rank: string | null }) =>
      apiHelpers.registrations.update(regId, {
        isWinner: rank ? "1" : "0",
        winnerRank: rank,
      }),
    onSuccess: (_d, v) => {
      toast.success(v.rank ? "Ditandai sebagai juara " + v.rank : "Juara dibatalkan");
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const sendMutation = useMutation({
    mutationFn: (regId: string) =>
      apiHelpers.certificates.send({ registrationId: regId, competitionId: selectedComp }),
    onSuccess: (_d, regId) => {
      const reg = registrations.find((r: any) => r.id === regId);
      toast.success("Sertifikat dikirim ke " + (reg?.email ?? ""));
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleWinner = async (regId: string, rank: string | null) => {
    try {
      await winnerMutation.mutateAsync({ regId, rank });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
    }
  };

  const sendCertificate = async (reg: Registration) => {
    setSending(true);
    try {
      await sendMutation.mutateAsync(reg.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengirim sertifikat");
    }
    setSending(false);
  };

  const handleGenerateAll = async () => {
    if (!window.confirm("Generate otomatis semua sertifikat untuk juara 1/2/3?")) return;
    try {
      const result = await generateAllMut.mutateAsync({ competitionId: selectedComp });
      toast.success(
        `${result.generated} sertifikat berhasil digenerate, ${result.skipped} dilewati`,
      );
      if (result.errors?.length) {
        toast.error(`${result.errors.length} error`, { description: result.errors.join(", ") });
      }
      qc.invalidateQueries({ queryKey: ["registrations"] });
    } catch (err: any) {
      toast.error("Generate gagal: " + (err?.message || "unknown error"));
    }
  };

  const paginated = registrations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner className="size-6 text-primary" />
      </div>
    );

  return (
    <div className="space-y-6">
      <PageHeader title="Sertifikat" description="Kelola pemenang dan kirim sertifikat" />

      {competitions.length === 0 ? (
        <EmptyState
          icon={<Trophy />}
          title="Belum ada lomba dengan sertifikat aktif."
          description="Aktifkan sertifikat di menu Kompetisi terlebih dahulu."
        />
      ) : (
        <SectionCard title="Pilih Lomba">
          <div className="max-w-md">
            <Field>
              <FieldLabel
                className="text-10 font-bold uppercase tracking-wider text-muted-foreground"
                required
              >
                Lomba
              </FieldLabel>
              <Select
                value={selectedComp}
                onValueChange={(v) => {
                  setSelectedComp(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="rounded-md h-10 w-full bg-background">
                  <SelectValue placeholder="-- Pilih Lomba --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="">-- Pilih Lomba --</SelectItem>
                    {competitions.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title} ({c.certificateType === "all" ? "Semua" : "Juara Saja"})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </SectionCard>
      )}

      {selectedComp && (
        <>
          <SectionCard
            title="Generate Otomatis"
            description="Hasilkan PDF sertifikat dari gambar template untuk semua pemenang."
            actions={
              <Button
                onClick={handleGenerateAll}
                disabled={generateAllMut.isPending}
                className="rounded-md gap-1.5 text-10 font-black uppercase tracking-wider"
              >
                {generateAllMut.isPending ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <Download data-icon="inline-start" />
                )}
                {generateAllMut.isPending ? "Menggenerate..." : "Generate Semua"}
              </Button>
            }
          >
            <p className="text-xs text-muted-foreground">
              Sertifikat memakai template yang diunggah pada lomba ini.
            </p>
          </SectionCard>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{registrations.length} peserta (lunas)</p>
            <span className="text-10 font-bold uppercase text-muted-foreground">
              {competitions.find((c) => c.id === selectedComp)?.certificateType === "all"
                ? "Semua peserta dapat sertifikat"
                : "Hanya juara (1/2/3)"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {paginated.map((reg) => {
              const name = reg.fullName || reg.teamName || reg.leaderName || "-";
              return (
                <Card key={reg.id} className="rounded-lg relative border-border p-4">
                  <CardContent className="flex items-center justify-between gap-4 p-0">
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-bold text-foreground">{name}</span>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="size-3" /> {reg.email}
                        <span className="text-border">|</span>
                        {reg.type === "team" ? "Tim" : "Individu"}
                        {reg.isWinner === "1" && (
                          <Badge
                            variant="outline"
                            className="rounded-md gap-1 border-emerald-200 bg-emerald-50 font-bold text-emerald-600"
                          >
                            <Trophy className="size-3" /> Juara {reg.winnerRank}
                          </Badge>
                        )}
                        {reg.certificateSent === "1" && (
                          <Badge
                            variant="outline"
                            className="rounded-md gap-1 border-astro-cyan-2 bg-sky-bottom font-bold text-astro-blue"
                          >
                            <Check className="size-3" /> Sertifikat terkirim
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-1.5">
                      {["1", "2", "3"].map((rank) => (
                        <Button
                          key={rank}
                          variant={
                            reg.isWinner === "1" && reg.winnerRank === rank ? "default" : "outline"
                          }
                          size="icon-sm"
                          className={cn(
                            "text-10 font-black",
                            reg.isWinner === "1" &&
                              reg.winnerRank === rank &&
                              "border-amber-400 bg-amber-400 text-amber-950 shadow-sm hover:bg-amber-400",
                          )}
                          onClick={() =>
                            toggleWinner(
                              reg.id,
                              reg.isWinner === "1" && reg.winnerRank === rank ? null : rank,
                            )
                          }
                          title={`Tandai juara ${rank}`}
                          aria-label={`Tandai juara ${rank}`}
                        >
                          {rank}
                        </Button>
                      ))}
                      {(competitions.find((c) => c.id === selectedComp)?.certificateType ===
                        "all" ||
                        reg.isWinner === "1") && (
                        <Button
                          onClick={() => sendCertificate(reg)}
                          disabled={sending || reg.certificateSent === "1"}
                          className={cn(
                            "rounded-md text-10 font-bold uppercase tracking-wider",
                            reg.certificateSent === "1" &&
                              "border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-50",
                          )}
                          size="sm"
                        >
                          {reg.certificateSent === "1" ? "Terkirim" : "Kirim"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {registrations.length === 0 && (
              <EmptyState
                icon={<Trophy />}
                title="Belum ada peserta lunas untuk lomba ini."
                description="Sertifikat hanya bisa dikirim ke peserta dengan pembayaran lunas."
              />
            )}
          </div>
          <Pagination
            currentPage={page}
            totalItems={registrations.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
