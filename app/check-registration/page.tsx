"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { motion } from "motion/react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  LogIn,
  Building2,
  Phone,
  Mail,
  User,
  CalendarDays,
  Coins,
  FileText,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/src/lib/auth-client";
import { useRegistrations, useRegistration } from "@/src/lib/hooks/use-queries";
import Navbar from "@/components/Navbar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveModal } from "@/components/responsive-modal";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const MotionImage = motion.create(Image);

interface RegDetail {
  id: string;
  type: string;
  fullName: string | null;
  identityNumber: string | null;
  teamName: string | null;
  leaderName: string | null;
  leaderIdentity: string | null;
  leaderPhotoUrl: string | null;
  members: string | null;
  memberDetails: { name: string; photoUrl: string | null }[] | null;
  institution: string;
  email: string;
  whatsapp: string;
  paymentStatus: string;
  paymentMethod: string | null;
  paymentAmount: number;
  paymentReference: string | null;
  createdAt: string;
  updatedAt: string;
  competitionName: string;
  competitionId: string;
  competitionCategory: string;
  competitionFee: number;
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  pending: {
    label: "Menunggu Pembayaran",
    color: "border-amber-200 bg-amber-50 text-amber-700",
    icon: Clock,
  },
  detecting: {
    label: "Diverifikasi",
    color: "border-blue-200 bg-blue-50 text-blue-700",
    icon: AlertCircle,
  },
  paid: {
    label: "Disetujui ✓",
    color: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },
  failed: {
    label: "Gagal",
    color: "border-red-200 bg-red-50 text-red-700",
    icon: XCircle,
  },
};

export default function CekPendaftaranPage() {
  const [selectedRegId, setSelectedRegId] = useState<string | null>(null);
  const router = useRouter();

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
  });
  const user = session?.data?.user;
  const isLoggedIn = !!user?.email;

  const {
    data: byEmailRaw,
    isLoading: byEmailLoading,
    isError: byEmailIsError,
  } = useRegistrations(
    user?.email ? { search: user.email, pageSize: 100 } : {},
    { enabled: !!user?.email },
  );
  const { data: byUserRaw, isLoading: byUserLoading } = useRegistrations(
    user?.id ? { userId: user.id, pageSize: 100 } : {},
    { enabled: !!user?.id },
  );

  const loading =
    sessionLoading || (isLoggedIn && (byEmailLoading || (!!user?.id && byUserLoading)));

  const registrations = useMemo(() => {
    if (!isLoggedIn) return null;
    const emailList = Array.isArray(byEmailRaw) ? byEmailRaw : ((byEmailRaw as any)?.data ?? []);
    const combined = [...emailList];
    if (user?.id) {
      const userList = Array.isArray(byUserRaw) ? byUserRaw : ((byUserRaw as any)?.data ?? []);
      const ids = new Set(combined.map((r: any) => r.id));
      for (const reg of userList) {
        if (!ids.has(reg.id)) {
          combined.push(reg);
          ids.add(reg.id);
        }
      }
    }
    return combined;
  }, [isLoggedIn, byEmailRaw, byUserRaw, user?.id]);

  const error =
    !loading && !isLoggedIn
      ? "Anda belum login. Silakan login terlebih dahulu."
      : !loading && byEmailIsError
        ? "Terjadi kesalahan. Silakan coba lagi."
        : "";

  const {
    data: rawDetail,
    isLoading: detailLoading,
    isError: detailIsError,
  } = useRegistration(selectedRegId ?? "");

  const selectedReg: RegDetail | null = useMemo(() => {
    if (!rawDetail) return null;
    const regItem = registrations?.find((r: any) => r.id === selectedRegId);
    return {
      ...(rawDetail as unknown as RegDetail),
      competitionName: regItem?.competitionName || "",
      competitionId: regItem?.competitionId || "",
      competitionCategory: "",
      competitionFee: 0,
    };
  }, [rawDetail, registrations, selectedRegId]);

  const detailError = detailIsError ? "Gagal memuat detail pendaftaran." : "";

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };

  const closeDetail = () => {
    setSelectedRegId(null);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-400 via-sky-300 to-white">
      {/* Navbar */}
      <Navbar />

      {/* ─── FLOATING BLOBS ─── */}
      <MotionImage
        src="/assets/blob-round.png"
        alt=""
        width={112}
        height={112}
        animate={{ y: [0, -18, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute top-[8%] right-[6%] z-0 size-20 object-contain select-none md:size-28"
      />
      <MotionImage
        src="/assets/blob-round.png"
        alt=""
        width={96}
        height={96}
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute top-[35%] left-[3%] z-0 size-16 object-contain select-none md:size-24"
      />
      <MotionImage
        src="/assets/blob-round.png"
        alt=""
        width={72}
        height={72}
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute top-[55%] right-[3%] z-0 size-12 object-contain select-none md:size-20"
      />
      <MotionImage
        src="/assets/blob-round.png"
        alt=""
        width={88}
        height={88}
        animate={{ y: [0, -16, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute bottom-[12%] left-[4%] z-0 size-14 object-contain select-none md:size-22"
      />

      {/* ─── CLOUDS ─── */}
      <MotionImage
        src="/assets/awan1.png"
        alt=""
        width={160}
        height={120}
        animate={{ x: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute top-[10%] left-[2%] z-0 h-auto w-16 object-contain opacity-30 select-none md:w-36"
      />
      <MotionImage
        src="/assets/awan2.png"
        alt=""
        width={200}
        height={140}
        animate={{ x: [0, -12, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute top-[28%] right-[3%] z-0 h-auto w-20 object-contain opacity-25 select-none md:w-44"
      />

      <div className="relative z-10 mx-auto max-w-3xl px-4 pt-36 pb-20 md:pt-40 md:pb-28">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-3 flex justify-center">
            <div className="accent-line" />
          </div>
          <h1 className="font-masterpiece mb-3 bg-gradient-to-b from-slate-800 via-slate-900 to-black bg-clip-text text-4xl leading-tight text-transparent md:text-5xl">
            Cek Pendaftaran
          </h1>
          {user?.email && (
            <p className="text-sm font-light text-slate-600">
              Status pendaftaran untuk <strong>{user.email}</strong>
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <Spinner className="size-8 text-primary" />
          </div>
        )}

        {/* Not logged in */}
        {!loading && !isLoggedIn && (
          <Empty className="clip-angled-lg border border-border bg-background p-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <LogIn />
              </EmptyMedia>
              <EmptyTitle className="text-sm">
                Silakan login untuk melihat status pendaftaran Anda.
              </EmptyTitle>
              <EmptyContent>
                <Button
                  asChild
                  className="clip-angled text-xs font-black uppercase tracking-wider"
                >
                  <Link href="/login">
                    <LogIn data-icon="inline-start" /> Masuk
                  </Link>
                </Button>
              </EmptyContent>
            </EmptyHeader>
          </Empty>
        )}

        {/* Error */}
        {error && isLoggedIn && (
          <Alert
            variant="destructive"
            className="clip-angled mb-6 border-border"
          >
            <AlertDescription className="text-sm text-center">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Has no registrations */}
        {!loading &&
          isLoggedIn &&
          registrations &&
          registrations.length === 0 && (
            <Empty className="clip-angled-lg border border-border bg-background p-8">
              <EmptyHeader>
                <EmptyTitle className="text-sm">
                  Belum ada pendaftaran untuk akun ini.
                </EmptyTitle>
                <EmptyDescription>
                  <Link
                    href="/#competitions"
                    className="text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                  >
                    Lihat Lomba →
                  </Link>
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

        {/* Results */}
        {registrations && registrations.length > 0 && (
          <div className="space-y-4">
            {registrations.map((reg: any) => {
              const cfg =
                statusConfig[reg.paymentStatus] || statusConfig.pending;
              const Icon = cfg.icon;
              return (
                <Card
                  key={reg.id}
                  className="clip-angled relative border-border"
                >
                  <div
                    className="absolute -top-px -left-px size-8 bg-primary"
                    style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
                  />
                  <CardContent className="p-5 md:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="mb-1 truncate text-base font-black uppercase tracking-tight text-foreground">
                          {reg.competitionName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {reg.type === "team" ? reg.teamName : reg.fullName}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {reg.email}
                        </p>
                        {reg.paymentReference && (
                          <p className="mt-1 font-mono text-xs text-muted-foreground/70">
                            Ref: {reg.paymentReference}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "clip-angled-sm gap-1.5 border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider",
                            cfg.color,
                          )}
                        >
                          <Icon className="size-3" />
                          {cfg.label}
                        </Badge>
                        <div className="flex items-center gap-2">
                          {reg.paymentStatus === "pending" && (
                            <Button
                              variant="link"
                              size="sm"
                              className="gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-500"
                              onClick={() =>
                                router.push(
                                  `/register/${reg.competitionId}?regId=${reg.id}`,
                                )
                              }
                            >
                              <CreditCard className="size-3" /> Bayar
                            </Button>
                          )}
                          <Button
                            variant="link"
                            size="sm"
                            className="gap-1 text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/80"
                            onClick={() => setSelectedRegId(reg.id)}
                          >
                            <FileText className="size-3" /> Detail
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Back link + Logout */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/"
            className="text-xs font-bold uppercase tracking-wider text-slate-600 transition-colors hover:text-foreground"
          >
            ← Kembali ke Beranda
          </Link>
          {isLoggedIn && (
            <Button
              variant="link"
              size="sm"
              onClick={handleLogout}
              className="text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-400"
            >
              Logout
            </Button>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <ResponsiveModal
        open={!!selectedReg || detailLoading}
        onOpenChange={(next) => !next && closeDetail()}
        title="Detail Pendaftaran"
        description="Detail pendaftaran lomba"
        titleClassName="text-sm font-black uppercase tracking-tight"
        descriptionClassName="sr-only"
        contentClassName="md:max-w-lg"
      >
        {detailLoading && (
          <div className="flex justify-center py-12">
            <Spinner className="size-8 text-primary" />
          </div>
        )}

        {detailError && (
          <Alert variant="destructive" className="clip-angled border-border">
            <AlertDescription className="text-sm text-center">
              {detailError}
            </AlertDescription>
          </Alert>
        )}

        {selectedReg && !detailLoading && (
          <div className="space-y-5">
            {/* Competition Name */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Lomba
              </span>
              <p className="mt-0.5 text-sm font-black text-foreground">
                {selectedReg.competitionName}
              </p>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              {(() => {
                const cfg =
                  statusConfig[selectedReg.paymentStatus] ||
                  statusConfig.pending;
                const StatusIcon = cfg.icon;
                return (
                  <Badge
                    variant="outline"
                    className={cn(
                      "clip-angled-sm gap-1.5 border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider",
                      cfg.color,
                    )}
                  >
                    <StatusIcon className="size-3" />
                    {cfg.label}
                  </Badge>
                );
              })()}
            </div>

            <Separator />

            {/* Identity */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                <User className="size-3.5" />
                {selectedReg.type === "team" ? "Data Tim" : "Data Peserta"}
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {selectedReg.type === "team" ? (
                  <>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Nama Tim
                      </span>
                      <p className="mt-0.5 text-sm font-bold text-foreground">
                        {selectedReg.teamName}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Ketua Tim
                      </span>
                      <p className="mt-0.5 text-sm font-bold text-foreground">
                        {selectedReg.leaderName}
                      </p>
                    </div>
                    {selectedReg.leaderPhotoUrl && (
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Foto Ketua
                        </span>
                        <Image
                          src={selectedReg.leaderPhotoUrl}
                          alt={selectedReg.leaderName || "Foto ketua"}
                          width={72}
                          height={72}
                          className="mt-1 size-18 rounded-md border border-border object-cover"
                        />
                      </div>
                    )}
                    {selectedReg.memberDetails?.length ? (
                      <div className="sm:col-span-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Anggota
                        </span>
                        <div className="mt-2 flex flex-wrap gap-3">
                          {selectedReg.memberDetails.map((m, i) => (
                            <div key={`${m.name}-${i}`} className="w-18">
                              {m.photoUrl ? (
                                <Image
                                  src={m.photoUrl}
                                  alt={m.name}
                                  width={72}
                                  height={72}
                                  className="size-18 rounded-md border border-border object-cover"
                                />
                              ) : (
                                <div className="flex size-18 items-center justify-center rounded-md border border-dashed border-border text-[10px] text-muted-foreground">
                                  Tanpa foto
                                </div>
                              )}
                              <p className="mt-1 text-[11px] leading-tight text-muted-foreground">
                                {m.name}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : selectedReg.members ? (
                      <div className="sm:col-span-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Anggota
                        </span>
                        <p className="mt-0.5 text-sm whitespace-pre-line text-muted-foreground">
                          {selectedReg.members}
                        </p>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Nama Lengkap
                      </span>
                      <p className="mt-0.5 text-sm font-bold text-foreground">
                        {selectedReg.fullName}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        No. Identitas
                      </span>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {selectedReg.identityNumber}
                      </p>
                    </div>
                  </>
                )}
                <div>
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <Building2 className="size-3" /> Instansi
                  </span>
                  <p className="mt-0.5 text-sm font-medium text-foreground">
                    {selectedReg.institution}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                Kontak
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="size-4 text-muted-foreground" />
                <span className="text-foreground">{selectedReg.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="size-4 text-muted-foreground" />
                <span className="text-foreground">{selectedReg.whatsapp}</span>
              </div>
            </div>

            <Separator />

            {/* Payment */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                <Coins className="size-3.5" /> Pembayaran
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Referensi
                </span>
                <span className="font-mono text-xs font-bold text-foreground">
                  {selectedReg.paymentReference || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Biaya
                </span>
                <span className="text-base font-black text-primary">
                  Rp {selectedReg.paymentAmount.toLocaleString("id-ID")}
                </span>
              </div>
              {selectedReg.paymentMethod && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Metode
                  </span>
                  <span className="text-sm capitalize text-foreground">
                    {selectedReg.paymentMethod}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <CalendarDays className="size-3" /> Didaftarkan
                </span>
                <span className="text-xs text-muted-foreground">
                  {selectedReg.createdAt
                    ? new Date(selectedReg.createdAt).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )
                    : "—"}
                </span>
              </div>
            </div>

            {/* CTA for pending */}
            {selectedReg.paymentStatus === "pending" && (
              <div className="pt-2">
                <Button
                  onClick={() => {
                    closeDetail();
                    router.push(
                      `/register/${selectedReg.competitionId}?regId=${selectedReg.id}`,
                    );
                  }}
                  size="lg"
                  className="clip-angled w-full bg-emerald-500 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-400"
                >
                  <CreditCard data-icon="inline-start" /> Lanjutkan Pembayaran
                </Button>
              </div>
            )}
          </div>
        )}
      </ResponsiveModal>
    </div>
  );
}
