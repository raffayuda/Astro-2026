"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
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
  Search,
  ExternalLink,
  MessageCircle,
  Printer,
  Sparkles,
  HelpCircle,
  Layers,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/src/lib/auth-client";
import { useRegistrations } from "@/src/lib/hooks/use-queries";
import { apiHelpers } from "@/src/lib/api";
import PrintableInvoice, { PrintPortal } from "@/components/PrintableInvoice";
import Navbar from "@/components/Navbar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import type { CompetitionCustomField } from "@/types/astro";

const MotionImage = motion.create(Image);

interface RegistrationItem {
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
  customFields: Record<string, any> | null;
  paymentStatus: string;
  paymentMethod: string | null;
  paymentAmount: number;
  batchName?: string | null;
  paymentReference: string | null;
  paymentLinkId?: string | null;
  paymentLinkUrl?: string | null;
  paymentExpiresAt?: string | null;
  isWinner?: string | null;
  winnerRank?: string | null;
  certificateSent?: string | null;
  certificates?: any[];
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
  competitionName: string;
  competitionId: string;
  competitionCategory?: string;
  competitionContactName?: string | null;
  competitionContactWhatsapp?: string | null;
  competitionCustomFields?: CompetitionCustomField[] | null;
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: any; desc: string }
> = {
  pending: {
    label: "Menunggu Pembayaran",
    color: "border-amber-300 bg-amber-50 text-amber-800",
    icon: Clock,
    desc: "Menunggu penyelesaian pembayaran tiket pendaftaran",
  },
  detecting: {
    label: "Diverifikasi",
    color: "border-blue-300 bg-blue-50 text-blue-800",
    icon: AlertCircle,
    desc: "Pembayaran sedang diverifikasi oleh sistem gateway",
  },
  paid: {
    label: "Disetujui / Lunas ✓",
    color: "border-emerald-300 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
    desc: "Pendaftaran telah disetujui & tiket resmi aktif",
  },
  failed: {
    label: "Gagal / Dibatalkan",
    color: "border-red-300 bg-red-50 text-red-800",
    icon: XCircle,
    desc: "Pembayaran gagal atau dibatalkan oleh sistem",
  },
  expired: {
    label: "Kadaluarsa",
    color: "border-rose-300 bg-rose-50 text-rose-800",
    icon: Clock,
    desc: "Batas waktu pembayaran telah berakhir",
  },
};

function CheckRegistrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search input state
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [searchResults, setSearchResults] = useState<RegistrationItem[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Modal detail
  const [selectedReg, setSelectedReg] = useState<RegistrationItem | null>(null);

  // Logged-in session
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
  });
  const user = session?.data?.user;
  const isLoggedIn = !!user?.email;

  // Account registrations (for logged-in user)
  const { data: byEmailRaw, isLoading: byEmailLoading } = useRegistrations(
    user?.email ? { search: user.email, pageSize: 100 } : {},
    { enabled: !!user?.email },
  );
  const { data: byUserRaw, isLoading: byUserLoading } = useRegistrations(
    user?.id ? { userId: user.id, pageSize: 100 } : {},
    { enabled: !!user?.id },
  );

  const accountRegistrations: RegistrationItem[] = useMemo(() => {
    if (!isLoggedIn) return [];
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

  const accountLoading =
    sessionLoading || (isLoggedIn && (byEmailLoading || (!!user?.id && byUserLoading)));

  // Search Handler
  const executeSearch = async (searchTerm: string) => {
    const term = searchTerm.trim();
    if (!term) return;

    setSearchLoading(true);
    setSearchError(null);
    setSubmittedQuery(term);

    try {
      const res = await apiHelpers.registrations.check(term);
      const list = Array.isArray(res) ? (res as unknown as RegistrationItem[]) : [];
      setSearchResults(list);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Gagal mencari data pendaftaran");
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Auto-search if ?regId=... or ?ref=... or ?q=... in URL
  useEffect(() => {
    const ref =
      searchParams.get("regId") ||
      searchParams.get("ref") ||
      searchParams.get("q") ||
      searchParams.get("query");
    if (ref && ref.trim()) {
      setQuery(ref.trim());
      executeSearch(ref.trim());
    }
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleClearSearch = () => {
    setQuery("");
    setSubmittedQuery("");
    setSearchResults(null);
    setSearchError(null);
  };

  const [printTarget, setPrintTarget] = useState<RegistrationItem | null>(null);

  const handlePrint = (reg: RegistrationItem) => {
    setPrintTarget(reg);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-b from-sky-400 via-sky-300 to-white">
      <Navbar />

      {/* Floating Blobs */}
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

      {/* Clouds */}
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

      <div className="relative z-10 mx-auto max-w-3xl px-4 pt-32 pb-20 md:pt-36 md:pb-28">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 flex justify-center">
            <div className="block h-1.5 w-18 rounded-full bg-linear-to-r from-astro-gold via-astro-lime2 to-astro-blue" />
          </div>
          <h1 className="font-title mb-2 bg-linear-to-b from-slate-800 via-slate-900 to-black bg-clip-text text-4xl leading-tight text-transparent md:text-5xl">
            Cek Pendaftaran
          </h1>
          <p className="mx-auto max-w-md text-xs md:text-sm font-normal text-slate-700">
            Periksa status verifikasi, invoice, dan berkas partisipasi lomba ASTRO 2026 Anda secara instan.
          </p>
        </div>

        {/* ─── QUICK SEARCH BOX (BISA UNTUK UMUM / TANPA LOGIN) ─── */}
        <div className="mb-8">
          <Card className="rounded-xl border-2 border-white/60 bg-white/90 p-2 shadow-xl backdrop-blur-md">
            <form onSubmit={handleSearchSubmit} className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Masukkan Nomor Invoice (INV-ASTRO-...) atau Email Pendaftar"
                  className="h-12 border-slate-200 bg-white pl-10 pr-3 text-xs md:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-cyan-500"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={searchLoading || !query.trim()}
                  className="rounded-lg h-12 gap-2 bg-cyan-600 px-6 text-xs font-black uppercase tracking-wider text-white hover:bg-cyan-500 shadow-md"
                >
                  {searchLoading ? (
                    <Spinner className="size-4 text-white" />
                  ) : (
                    <Search className="size-4" />
                  )}
                  Cek Status
                </Button>
                {submittedQuery && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearSearch}
                    className="rounded-lg h-12 border-slate-300 px-3 text-slate-600 hover:text-slate-900"
                    title="Reset Pencarian"
                  >
                    <RotateCcw className="size-4" />
                  </Button>
                )}
              </div>
            </form>
          </Card>
          <div className="mt-2 flex items-center justify-between px-2 text-[11px] text-slate-600">
            <span className="flex items-center gap-1">
              <Sparkles className="size-3 text-cyan-600" /> Bebas akses tanpa perlu login
            </span>
            <span className="font-mono text-[10px] text-slate-500">
              Contoh: INV-ASTRO-2026-96885985
            </span>
          </div>
        </div>

        {/* ─── SEARCH ERROR ALERT ─── */}
        {searchError && (
          <Alert variant="destructive" className="rounded-lg mb-6 border-red-200 bg-red-50 text-red-800">
            <AlertCircle className="size-4" />
            <AlertDescription className="text-xs font-medium">
              {searchError}
            </AlertDescription>
          </Alert>
        )}

        {/* ─── HASIL PENCARIAN ─── */}
        {searchResults !== null && (
          <div className="mb-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-300/60 pb-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Search className="size-3.5 text-cyan-600" />
                Hasil Pencarian ({searchResults.length})
              </h2>
              <span className="text-[10px] font-mono text-slate-500 truncate max-w-[200px]">
                "{submittedQuery}"
              </span>
            </div>

            {searchResults.length === 0 ? (
              <Empty className="rounded-xl border border-slate-200 bg-white/95 p-8 text-center shadow-md">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <HelpCircle className="size-8 text-amber-500" />
                  </EmptyMedia>
                  <EmptyTitle className="text-sm font-bold text-slate-800">
                    Pendaftaran Tidak Ditemukan
                  </EmptyTitle>
                  <EmptyDescription className="text-xs text-slate-600 max-w-sm mx-auto">
                    Tidak ditemukan pendaftaran dengan kata kunci <strong>"{submittedQuery}"</strong>. Pastikan Nomor Referensi Invoice atau Email sudah persis sesuai saat mengisi form pendaftaran.
                  </EmptyDescription>
                  <EmptyContent className="mt-4 flex flex-wrap justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearSearch}
                      className="rounded-lg text-xs font-bold uppercase"
                    >
                      Coba Kata Kunci Lain
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className="rounded-lg text-xs font-bold uppercase bg-cyan-600 hover:bg-cyan-500"
                    >
                      <Link href="/#competitions">
                        Daftar Lomba Baru <ArrowRight className="size-3 ml-1" />
                      </Link>
                    </Button>
                  </EmptyContent>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="space-y-3">
                {searchResults.map((reg) => (
                  <RegistrationCard
                    key={reg.id}
                    reg={reg}
                    onOpenDetail={() => setSelectedReg(reg)}
                    onPrint={() => handlePrint(reg)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── BAGIAN PENDAFTARAN AKUN (JIKA USER LOGIN) ─── */}
        {isLoggedIn && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-300/60 pb-2">
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <User className="size-3.5 text-cyan-600" />
                  Pendaftaran Akun Saya
                </h2>
                <p className="text-[11px] text-slate-600">
                  Terdaftar dengan email <strong>{user.email}</strong>
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold border-cyan-300 text-cyan-800 bg-cyan-50">
                {accountRegistrations.length} Lomba
              </Badge>
            </div>

            {accountLoading ? (
              <div className="flex justify-center py-10">
                <Spinner className="size-6 text-cyan-700" />
              </div>
            ) : accountRegistrations.length === 0 ? (
              <Empty className="rounded-xl border border-slate-200 bg-white/90 p-6 text-center shadow-sm">
                <EmptyHeader>
                  <EmptyTitle className="text-xs font-bold text-slate-800">
                    Belum Ada Pendaftaran Terhubung
                  </EmptyTitle>
                  <EmptyDescription className="text-xs text-slate-600">
                    Akun ini belum memiliki riwayat pendaftaran lomba aktif.
                  </EmptyDescription>
                  <EmptyContent className="mt-3">
                    <Button asChild size="sm" className="rounded-lg text-xs font-bold uppercase bg-cyan-600 hover:bg-cyan-500">
                      <Link href="/#competitions">Pilih & Daftar Lomba</Link>
                    </Button>
                  </EmptyContent>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="space-y-3">
                {accountRegistrations.map((reg) => (
                  <RegistrationCard
                    key={reg.id}
                    reg={reg}
                    onOpenDetail={() => setSelectedReg(reg)}
                    onPrint={() => handlePrint(reg)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── PANDUAN CEPAT BAGI YANG BELUM LOGIN & BELUM CARI ─── */}
        {!isLoggedIn && searchResults === null && (
          <div className="mt-6 rounded-xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
            <h3 className="mb-3 text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <HelpCircle className="size-3.5 text-cyan-600" /> Panduan Cek Status Pendaftaran:
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs text-slate-700">
              <div className="rounded-lg bg-sky-50/70 p-3 border border-sky-100">
                <span className="flex size-5 items-center justify-center rounded-full bg-cyan-600 text-[10px] font-bold text-white mb-1.5">1</span>
                <p className="font-bold text-slate-900">Simpan Nomor Invoice</p>
                <p className="text-[11px] text-slate-600 mt-0.5">Dapatkan kode referensi (contoh: <code>INV-ASTRO-...</code>) saat selesai submit pendaftaran.</p>
              </div>
              <div className="rounded-lg bg-sky-50/70 p-3 border border-sky-100">
                <span className="flex size-5 items-center justify-center rounded-full bg-cyan-600 text-[10px] font-bold text-white mb-1.5">2</span>
                <p className="font-bold text-slate-900">Cek Kapan Saja</p>
                <p className="text-[11px] text-slate-600 mt-0.5">Ketik invoice atau email pada kotak pencarian di atas untuk cek bukti & bayar langsung.</p>
              </div>
              <div className="rounded-lg bg-sky-50/70 p-3 border border-sky-100">
                <span className="flex size-5 items-center justify-center rounded-full bg-cyan-600 text-[10px] font-bold text-white mb-1.5">3</span>
                <p className="font-bold text-slate-900">Punya Akun?</p>
                <p className="text-[11px] text-slate-600 mt-0.5">Masuk ke akun Anda untuk melihat seluruh riwayat lomba tanpa perlu mengetik nomor invoice.</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-600">Sudah memiliki akun ASTRO?</span>
              <Button asChild size="sm" variant="outline" className="rounded-lg text-xs font-bold uppercase gap-1.5">
                <Link href="/login">
                  <LogIn className="size-3" /> Masuk Akun
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="mt-12 flex items-center justify-center gap-6">
          <Link
            href="/"
            className="text-xs font-bold uppercase tracking-wider text-slate-700 transition-colors hover:text-slate-950"
          >
            ← Kembali ke Beranda
          </Link>
          {isLoggedIn && (
            <Button
              variant="link"
              size="sm"
              onClick={handleLogout}
              className="text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-500"
            >
              Keluar (Logout)
            </Button>
          )}
        </div>
      </div>

      {/* ─── MODAL DETAIL LENGKAP & BERKAS ─── */}
      <ResponsiveModal
        open={!!selectedReg}
        onOpenChange={(next) => !next && setSelectedReg(null)}
        title="Detail Pendaftaran"
        description="Detail data pendaftar lomba ASTRO 2026"
        titleClassName="text-sm font-black uppercase tracking-tight"
        descriptionClassName="sr-only"
        contentClassName="md:max-w-xl max-h-[90vh] overflow-y-auto"
      >
        {selectedReg && (
          <div className="space-y-5 py-1">
            {/* Header Lomba & Status */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Kompetisi Lomba
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    {selectedReg.competitionName}
                  </h3>
                  {selectedReg.batchName && (
                    <Badge variant="secondary" className="mt-1 text-[10px] font-bold">
                      {selectedReg.batchName}
                    </Badge>
                  )}
                </div>
                {(() => {
                  const cfg = statusConfig[selectedReg.paymentStatus] || statusConfig.pending;
                  const Icon = cfg.icon;
                  return (
                    <Badge variant="outline" className={cn("rounded-md gap-1 border px-2.5 py-1 text-[10px] font-bold uppercase", cfg.color)}>
                      <Icon className="size-3" />
                      {cfg.label}
                    </Badge>
                  );
                })()}
              </div>
            </div>

            {/* Informasi Pembayaran */}
            <div className="space-y-2.5 rounded-lg border border-slate-200 p-4">
              <h4 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                <Coins className="size-3.5 text-cyan-600" /> Status & Pembayaran
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground">Nomor Referensi</span>
                  <p className="font-mono font-bold text-slate-900 select-all">
                    {selectedReg.paymentReference || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground">Total Biaya</span>
                  <p className="font-black text-cyan-700 text-sm">
                    {selectedReg.paymentAmount === 0 ? "Gratis" : `Rp ${selectedReg.paymentAmount.toLocaleString("id-ID")}`}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground">Waktu Pendaftaran</span>
                  <p className="text-slate-700">
                    {selectedReg.createdAt ? new Date(selectedReg.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }) : "—"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground">Metode Bayar</span>
                  <p className="capitalize text-slate-700">
                    {selectedReg.paymentMethod || "Payment Gateway (Online)"}
                  </p>
                </div>
              </div>

              {/* Action Banner for Pending */}
              {selectedReg.paymentStatus === "pending" && (
                <div className="mt-3 rounded-md bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                  <p className="font-bold flex items-center gap-1.5">
                    <Clock className="size-3.5 text-amber-600" /> Menunggu Pembayaran
                  </p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Selesaikan pembayaran Anda untuk mengamankan slot kuota pendaftaran.
                  </p>
                  <Button
                    onClick={() => router.push(`/register/${selectedReg.competitionId}?regId=${selectedReg.id}`)}
                    size="sm"
                    className="rounded-lg mt-2 w-full bg-emerald-600 text-xs font-black uppercase text-white hover:bg-emerald-500"
                  >
                    <CreditCard className="size-3.5 mr-1" /> Lanjutkan Pembayaran Sekarang
                  </Button>
                </div>
              )}

              {/* Action Banner for Paid */}
              {selectedReg.paymentStatus === "paid" && (
                <div className="mt-3 rounded-md bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-600" /> Pembayaran Telah Disetujui
                  </p>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Selamat! Tiket pendaftaran Anda resmi aktif. Silakan hubungi narahubung lomba untuk bergabung ke grup koordinasi peserta.
                  </p>
                </div>
              )}
            </div>

            {/* Identitas Peserta / Tim */}
            <div className="space-y-3 rounded-lg border border-slate-200 p-4">
              <h4 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                <User className="size-3.5 text-cyan-600" /> {selectedReg.type === "team" ? "Data Tim & Pemain" : "Data Peserta"}
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
                {selectedReg.type === "team" ? (
                  <>
                    <div>
                      <span className="text-[10px] text-muted-foreground">Nama Tim</span>
                      <p className="font-bold text-slate-900">{selectedReg.teamName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground">Ketua Tim</span>
                      <p className="font-bold text-slate-900">{selectedReg.leaderName} ({selectedReg.leaderIdentity || "No ID"})</p>
                    </div>
                    {selectedReg.leaderPhotoUrl && (
                      <div className="sm:col-span-2">
                        <span className="text-[10px] text-muted-foreground">Foto Ketua</span>
                        <div className="mt-1 flex items-center gap-3">
                          <Image
                            src={selectedReg.leaderPhotoUrl}
                            alt="Foto Ketua"
                            width={54}
                            height={54}
                            className="size-14 rounded-md border border-slate-200 object-cover"
                          />
                          <a href={selectedReg.leaderPhotoUrl} target="_blank" rel="noreferrer" className="text-xs text-cyan-600 hover:underline flex items-center gap-1 font-semibold">
                            Lihat Foto Penuh <ExternalLink className="size-3" />
                          </a>
                        </div>
                      </div>
                    )}
                    {selectedReg.memberDetails && selectedReg.memberDetails.length > 0 && (
                      <div className="sm:col-span-2">
                        <span className="text-[10px] text-muted-foreground">Roster Pemain ({selectedReg.memberDetails.length})</span>
                        <div className="mt-1.5 grid grid-cols-2 gap-2">
                          {selectedReg.memberDetails.map((m, i) => (
                            <div key={i} className="flex items-center gap-2 rounded border border-slate-100 bg-slate-50/60 p-1.5">
                              {m.photoUrl ? (
                                <Image src={m.photoUrl} alt={m.name} width={36} height={36} className="size-9 rounded object-cover border border-slate-200" />
                              ) : (
                                <div className="flex size-9 items-center justify-center rounded bg-slate-200 text-[9px] text-slate-500">Foto</div>
                              )}
                              <span className="truncate text-xs font-medium text-slate-800">{m.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-[10px] text-muted-foreground">Nama Lengkap</span>
                      <p className="font-bold text-slate-900">{selectedReg.fullName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground">Nomor Identitas (NIM/NIK)</span>
                      <p className="font-medium text-slate-900">{selectedReg.identityNumber || "—"}</p>
                    </div>
                  </>
                )}
                <div>
                  <span className="text-[10px] text-muted-foreground">Asal Sekolah / Instansi</span>
                  <p className="font-medium text-slate-900 flex items-center gap-1">
                    <Building2 className="size-3 text-slate-400" /> {selectedReg.institution}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground">Kontak WhatsApp</span>
                  <p className="font-medium text-slate-900 flex items-center gap-1">
                    <Phone className="size-3 text-slate-400" /> {selectedReg.whatsapp}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[10px] text-muted-foreground">Email Terdaftar</span>
                  <p className="font-medium text-slate-900 flex items-center gap-1">
                    <Mail className="size-3 text-slate-400" /> {selectedReg.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Informasi & Berkas Khusus Lomba (Custom Fields) */}
            {selectedReg.customFields && Object.keys(selectedReg.customFields).length > 0 && (
              <div className="space-y-3 rounded-lg border border-slate-200 p-4">
                <h4 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  <Layers className="size-3.5 text-cyan-600" /> Berkas & Informasi Khusus Lomba
                </h4>
                <div className="space-y-2.5">
                  {Object.entries(selectedReg.customFields).map(([key, val]) => {
                    // Cari label field dari competitionCustomFields jika tersedia
                    const fieldDef = selectedReg.competitionCustomFields?.find((f) => f.id === key);
                    const label = fieldDef?.label ?? key;
                    const isImage = typeof val === "string" && (val.startsWith("http") || val.startsWith("/"));

                    if (!val) return null;

                    return (
                      <div key={key} className="rounded-md border border-slate-100 bg-slate-50/50 p-2.5 text-xs">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          {label}
                        </span>
                        {isImage ? (
                          <div className="mt-1.5 flex items-center gap-3">
                            <Image
                              src={val}
                              alt={label}
                              width={56}
                              height={56}
                              className="size-14 rounded border border-slate-200 object-cover bg-white"
                            />
                            <a
                              href={val}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold text-cyan-600 hover:underline flex items-center gap-1"
                            >
                              Lihat Berkas Penuh <ExternalLink className="size-3" />
                            </a>
                          </div>
                        ) : (
                          <p className="mt-0.5 text-xs font-medium text-slate-900 whitespace-pre-line">
                            {String(val)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Kontak Panitia & Narahubung */}
            {selectedReg.competitionContactWhatsapp && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Narahubung Resmi Lomba (Contact Person)
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-900">{selectedReg.competitionContactName || "Panitia Lomba"}</p>
                    <p className="text-[11px] text-slate-600">Hubungi panitia jika ada kendala atau pertanyaan teknis.</p>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    className="rounded-lg gap-1.5 bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500 self-start sm:self-auto"
                  >
                    <a
                      href={`https://wa.me/${selectedReg.competitionContactWhatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
                        `Halo Panitia ${selectedReg.competitionName}, saya ${selectedReg.type === "team" ? selectedReg.teamName : selectedReg.fullName} (Ref: ${selectedReg.paymentReference}) ingin menanyakan terkait pendaftaran lomba.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="size-3.5" /> Chat WhatsApp Panitia
                    </a>
                  </Button>
                </div>
              </div>
            )}

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePrint(selectedReg)}
            className="rounded-lg gap-1.5 text-xs font-bold text-slate-800 hover:text-cyan-700 hover:border-cyan-400 bg-white shadow-xs"
          >
            <Printer className="size-3.5 text-cyan-600" /> Cetak Bukti Invoice
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedReg(null)}
            className="rounded-lg text-xs font-bold uppercase"
          >
            Tutup
          </Button>
        </div>
      </div>
    )}
  </ResponsiveModal>

      {/* Printable Invoice rendered directly to body via PrintPortal */}
      {printTarget && (
        <PrintPortal>
          <PrintableInvoice data={printTarget} />
        </PrintPortal>
      )}
    </div>
  );
}

// Komponen Kartu Pendaftaran Reusable
function RegistrationCard({
  reg,
  onOpenDetail,
  onPrint,
}: {
  reg: RegistrationItem;
  onOpenDetail: () => void;
  onPrint?: () => void;
}) {
  const router = useRouter();
  const cfg = statusConfig[reg.paymentStatus] || statusConfig.pending;
  const Icon = cfg.icon;

  return (
    <Card className="rounded-lg relative border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div
        className="absolute -top-px -left-px size-8 bg-cyan-600"
        style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
      />
      <CardContent className="p-4 md:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-base font-black uppercase tracking-tight text-slate-900 truncate">
                {reg.competitionName}
              </h3>
              {reg.batchName && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {reg.batchName}
                </span>
              )}
              {reg.type === "team" && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200 uppercase">
                  Tim
                </span>
              )}
            </div>

            <p className="text-xs text-slate-700 font-medium">
              {reg.type === "team" ? (
                <span>
                  Tim: <strong className="text-slate-900">{reg.teamName}</strong>
                  {reg.leaderName && ` • Ketua: ${reg.leaderName}`}
                </span>
              ) : (
                <span>
                  Peserta: <strong className="text-slate-900">{reg.fullName || "—"}</strong>
                </span>
              )}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <Building2 className="size-3 text-slate-400" /> {reg.institution}
              </span>
              <span className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
                Ref: <strong className="text-slate-800 font-semibold">{reg.paymentReference || "—"}</strong>
              </span>
              <span className="font-bold text-cyan-700">
                {reg.paymentAmount === 0 ? "Gratis" : `Rp ${reg.paymentAmount.toLocaleString("id-ID")}`}
              </span>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            <Badge
              variant="outline"
              className={cn(
                "rounded-md gap-1 border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                cfg.color,
              )}
            >
              <Icon className="size-3" />
              {cfg.label}
            </Badge>

            <div className="flex items-center gap-1.5">
              {reg.paymentStatus === "pending" && (
                <Button
                  size="sm"
                  className="rounded-lg h-8 gap-1 text-[10px] font-black uppercase bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm"
                  onClick={() => router.push(`/register/${reg.competitionId}?regId=${reg.id}`)}
                >
                  <CreditCard className="size-3" /> Bayar
                </Button>
              )}

              {onPrint && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg h-8 gap-1 text-[10px] font-bold uppercase text-slate-700 hover:text-cyan-700 hover:border-cyan-300"
                  onClick={onPrint}
                  title="Cetak Bukti Pendaftaran / Invoice"
                >
                  <Printer className="size-3" /> Cetak
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                className="rounded-lg h-8 gap-1 text-[10px] font-bold uppercase text-slate-700 hover:text-cyan-700 hover:border-cyan-300"
                onClick={onOpenDetail}
              >
                <FileText className="size-3" /> Detail
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CekPendaftaranPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-sky-300">
          <Spinner className="size-8 text-cyan-800" />
        </div>
      }
    >
      <CheckRegistrationContent />
    </Suspense>
  );
}
