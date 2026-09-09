"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Building2,
  Phone,
  Mail,
  Search,
  ExternalLink,
  MessageCircle,
  Printer,
  CreditCard,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { authClient } from "@/src/lib/auth-client";
import { useRegistrations } from "@/src/lib/hooks/use-queries";
import { apiHelpers } from "@/src/lib/api";
import PrintableInvoice, { PrintPortal, usePrintInvoice } from "@/components/PrintableInvoice";
import {
  CtaButton,
  PageShell,
  Pill,
  ScheduleCard,
  SectionHeading,
  SectionShell,
  Surface,
  WindowCard,
  type PillProps,
} from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Spinner } from "@/components/ui/spinner";
import { asStringRecord } from "@/lib/flags";
import { isSafeUrl, safeHref } from "@/lib/urls";
import { unwrapList } from "@/lib/lists";
import type { CompetitionCustomField } from "@/types/astro";

interface RegistrationItem {
  id: string;
  type: string;
  fullName: string | null;
  identityNumber: string | null;
  teamName: string | null;
  leaderName: string | null;
  leaderIdentity: string | null;
  leaderGameId: string | null;
  leaderPhotoUrl: string | null;
  members: string | null;
  memberDetails: { name: string; gameId: string | null; photoUrl: string | null }[] | null;
  institution: string;
  email: string;
  whatsapp: string;
  customFields: Record<string, unknown> | null;
  paymentStatus: string;
  paymentMethod: string | null;
  paymentAmount: number;
  batchName?: string | null;
  paymentReference: string | null;
  createdAt: string;
  competitionName: string;
  competitionId: string;
  competitionCategory?: string;
  competitionContactName?: string | null;
  competitionContactWhatsapp?: string | null;
  competitionCustomFields?: CompetitionCustomField[] | null;
}

const STATUS: Record<
  string,
  { label: string; tone: NonNullable<PillProps["tone"]>; icon: typeof Clock; desc: string }
> = {
  pending: {
    label: "Menunggu pembayaran",
    tone: "gold",
    icon: Clock,
    desc: "Selesaikan pembayaran untuk mengamankan kuota.",
  },
  detecting: {
    label: "Diverifikasi",
    tone: "blue",
    icon: AlertCircle,
    desc: "Pembayaran sedang dicek oleh sistem.",
  },
  paid: {
    label: "Lunas",
    tone: "blue",
    icon: CheckCircle2,
    desc: "Pendaftaran aktif.",
  },
  failed: {
    label: "Gagal",
    tone: "pink",
    icon: XCircle,
    desc: "Pembayaran gagal atau dibatalkan.",
  },
  expired: {
    label: "Kadaluarsa",
    tone: "pink",
    icon: Clock,
    desc: "Batas waktu pembayaran sudah habis.",
  },
};

function statusOf(key: string) {
  return STATUS[key] ?? STATUS.pending;
}

function CheckRegistrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [searchResults, setSearchResults] = useState<RegistrationItem[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedReg, setSelectedReg] = useState<RegistrationItem | null>(null);
  const { target: printTarget, print } = usePrintInvoice<RegistrationItem>();

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
  });
  const user = session?.data?.user;
  const isLoggedIn = !!user?.email;

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
    const combined = unwrapList<RegistrationItem>(byEmailRaw);
    const ids = new Set(combined.map((reg) => reg.id));
    if (user?.id) {
      for (const reg of unwrapList<RegistrationItem>(byUserRaw)) {
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

  const executeSearch = async (searchTerm: string) => {
    const term = searchTerm.trim();
    if (!term) return;

    setSearchLoading(true);
    setSearchError(null);
    setSubmittedQuery(term);

    try {
      const res = await apiHelpers.registrations.check(term);
      setSearchResults(unwrapList<RegistrationItem>(res));
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Gagal mencari data pendaftaran");
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const ref =
      searchParams.get("regId") ||
      searchParams.get("ref") ||
      searchParams.get("q") ||
      searchParams.get("query");
    if (ref && ref.trim()) {
      setQuery(ref.trim());
      void executeSearch(ref.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void executeSearch(query);
  };

  const handleClearSearch = () => {
    setQuery("");
    setSubmittedQuery("");
    setSearchResults(null);
    setSearchError(null);
  };

  return (
    <PageShell>
      <SectionShell band="none" space="lg" className="pt-24">
        <SectionHeading
          eyebrow="Status"
          pillTone="blue"
          title="Cek pendaftaran"
          lead="Cari dengan nomor invoice atau email. Masuk akun untuk melihat semua lomba yang kamu daftarkan."
          align="start"
        />

        <WindowCard title="Cari" className="mt-8">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink/45"
                aria-hidden
              />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="INV-ASTRO-... atau email"
                className="h-12 rounded-full border-sky-mid bg-white pl-10"
              />
            </div>
            <CtaButton
              type="submit"
              disabled={searchLoading || !query.trim()}
              size="default"
              showChevron={false}
              className="h-12 sm:w-auto"
            >
              {searchLoading ? "Mencari" : "Cek status"}
            </CtaButton>
          </form>
          <p className="mt-3 text-xs font-medium text-ink/60">
            Tanpa login. Contoh invoice: INV-ASTRO-2026-96885985
          </p>
        </WindowCard>

        {searchError && (
          <Surface tone="pink" radius="xl" pad="md" className="mt-4">
            <p className="text-sm font-medium">{searchError}</p>
          </Surface>
        )}

        {searchResults !== null && (
          <div className="mt-8">
            <div className="mb-4 flex items-end justify-between gap-3">
              <h2 className="font-heading text-lg font-bold text-astro-navy">
                Hasil ({searchResults.length})
              </h2>
              <button
                type="button"
                onClick={handleClearSearch}
                className="text-sm font-semibold text-astro-navy/70 hover:text-astro-navy"
              >
                Reset
              </button>
            </div>

            {searchResults.length === 0 ? (
              <Surface tone="plain" radius="2xl" pad="lg" className="text-center">
                <p className="font-heading text-lg font-bold text-astro-navy">Tidak ditemukan</p>
                <p className="mx-auto mt-2 max-w-md text-sm text-ink/70">
                  Tidak ada pendaftaran untuk “{submittedQuery}”. Pastikan invoice atau email sama
                  dengan saat mengisi formulir.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <Button variant="outline" className="rounded-full" onClick={handleClearSearch}>
                    Coba kata lain
                  </Button>
                  <CtaButton href="/#competitions" size="default" showChevron={false}>
                    Daftar lomba
                  </CtaButton>
                </div>
              </Surface>
            ) : (
              <div className="grid gap-3">
                {searchResults.map((reg) => (
                  <RegistrationCard
                    key={reg.id}
                    reg={reg}
                    onOpenDetail={() => setSelectedReg(reg)}
                    onPrint={() => print(reg)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {isLoggedIn && (
          <WindowCard title="Pendaftaran akun" className="mt-10">
            <p className="text-sm text-ink/70">
              Terdaftar dengan {user.email}. {accountRegistrations.length} lomba.
            </p>
            {accountLoading ? (
              <div className="flex justify-center py-10">
                <Spinner className="size-6 text-astro-navy" />
              </div>
            ) : accountRegistrations.length === 0 ? (
              <Surface tone="tint" radius="xl" pad="lg" className="text-center">
                <p className="font-heading font-bold text-astro-navy">Belum ada pendaftaran</p>
                <p className="mt-1 text-sm text-ink/70">Akun ini belum punya riwayat lomba.</p>
                <CtaButton
                  href="/#competitions"
                  size="default"
                  className="mt-4"
                  showChevron={false}
                >
                  Pilih lomba
                </CtaButton>
              </Surface>
            ) : (
              <div className="mt-4 grid gap-3">
                {accountRegistrations.map((reg) => (
                  <RegistrationCard
                    key={reg.id}
                    reg={reg}
                    onOpenDetail={() => setSelectedReg(reg)}
                    onPrint={() => print(reg)}
                  />
                ))}
              </div>
            )}
          </WindowCard>
        )}

        {!isLoggedIn && searchResults === null && (
          <WindowCard title="Cara cek" className="mt-10" bodyClassName="gap-0">
            <ol>
              <ScheduleCard
                phase="Simpan invoice"
                dateLabel="Langkah 1"
                detail="Kode referensi muncul setelah kamu mengirim formulir."
                status="done"
                isLast={false}
              />
              <ScheduleCard
                phase="Cek kapan saja"
                dateLabel="Langkah 2"
                detail="Ketik invoice atau email di kotak pencarian."
                status="active"
                isLast={false}
              />
              <ScheduleCard
                phase="Masuk akun"
                dateLabel="Langkah 3"
                detail="Riwayat semua lomba muncul tanpa mengetik invoice."
                status="upcoming"
                isLast
              />
            </ol>
            <div className="mt-4 border-t border-sky-mid/60 pt-4">
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/auth/login">Masuk akun</Link>
              </Button>
            </div>
          </WindowCard>
        )}
      </SectionShell>

      <ResponsiveModal
        open={!!selectedReg}
        onOpenChange={(next) => !next && setSelectedReg(null)}
        title="Detail pendaftaran"
        description="Data pendaftar lomba ASTRO 2026"
        contentClassName="md:max-w-xl max-h-[90vh] overflow-y-auto"
      >
        {selectedReg && (
          <RegistrationDetail
            reg={selectedReg}
            onPrint={() => print(selectedReg)}
            onClose={() => setSelectedReg(null)}
            onPay={() =>
              router.push(`/register/${selectedReg.competitionId}?regId=${selectedReg.id}`)
            }
          />
        )}
      </ResponsiveModal>

      {printTarget && (
        <PrintPortal>
          <PrintableInvoice
            data={{
              ...printTarget,
              customFields: printTarget.customFields
                ? asStringRecord(printTarget.customFields)
                : null,
            }}
          />
        </PrintPortal>
      )}
    </PageShell>
  );
}

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
  const cfg = statusOf(reg.paymentStatus);

  return (
    <Surface tone="plain" radius="2xl" pad="md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-base font-bold text-astro-navy">
              {reg.competitionName}
            </h3>
            {reg.batchName && (
              <Pill tone="glass" size="sm">
                {reg.batchName}
              </Pill>
            )}
            {reg.type === "team" && (
              <Pill tone="white" size="sm">
                Tim
              </Pill>
            )}
          </div>
          <p className="mt-1 text-sm text-ink/75">
            {reg.type === "team" ? (
              <>
                Tim {reg.teamName}
                {reg.leaderName ? `. Ketua ${reg.leaderName}` : ""}
              </>
            ) : (
              <>Peserta {reg.fullName || "—"}</>
            )}
          </p>
          <p className="mt-2 text-xs font-medium text-ink/60">
            {reg.institution}
            {" · "}
            {reg.paymentReference || "Tanpa referensi"}
            {" · "}
            {reg.paymentAmount === 0 ? "Gratis" : `Rp ${reg.paymentAmount.toLocaleString("id-ID")}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
          <Pill tone={cfg.tone} size="sm">
            {cfg.label}
          </Pill>
          <div className="flex items-center gap-1.5">
            {reg.paymentStatus === "pending" && (
              <Button
                size="sm"
                className="h-8 rounded-full"
                onClick={() => router.push(`/register/${reg.competitionId}?regId=${reg.id}`)}
              >
                <CreditCard data-icon="inline-start" />
                Bayar
              </Button>
            )}
            {onPrint && (
              <Button variant="outline" size="sm" className="h-8 rounded-full" onClick={onPrint}>
                <Printer data-icon="inline-start" />
                Cetak
              </Button>
            )}
            <Button variant="outline" size="sm" className="h-8 rounded-full" onClick={onOpenDetail}>
              <FileText data-icon="inline-start" />
              Detail
            </Button>
          </div>
        </div>
      </div>
    </Surface>
  );
}

function RegistrationDetail({
  reg,
  onPrint,
  onClose,
  onPay,
}: {
  reg: RegistrationItem;
  onPrint: () => void;
  onClose: () => void;
  onPay: () => void;
}) {
  const cfg = statusOf(reg.paymentStatus);
  const Icon = cfg.icon;
  const wa = reg.competitionContactWhatsapp?.replace(/\D/g, "") ?? "";

  return (
    <div className="space-y-4 py-1">
      <Surface tone="tint" radius="xl" pad="md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-ink/60">Lomba</p>
            <h3 className="font-heading text-base font-bold text-astro-navy">
              {reg.competitionName}
            </h3>
            {reg.batchName && (
              <p className="mt-1 text-xs font-medium text-ink/70">{reg.batchName}</p>
            )}
          </div>
          <Pill tone={cfg.tone} size="sm">
            <Icon className="size-3" aria-hidden />
            {cfg.label}
          </Pill>
        </div>
      </Surface>

      <Surface tone="plain" radius="xl" pad="md">
        <p className="text-xs font-bold text-astro-navy">Pembayaran</p>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-ink/55">Referensi</dt>
            <dd className="font-mono font-semibold text-astro-navy select-all">
              {reg.paymentReference || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink/55">Biaya</dt>
            <dd className="font-semibold text-astro-navy">
              {reg.paymentAmount === 0
                ? "Gratis"
                : `Rp ${reg.paymentAmount.toLocaleString("id-ID")}`}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink/55">Waktu daftar</dt>
            <dd className="text-ink">
              {reg.createdAt
                ? new Date(reg.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink/55">Metode</dt>
            <dd className="capitalize text-ink">{reg.paymentMethod || "Gateway"}</dd>
          </div>
        </dl>

        {reg.paymentStatus === "pending" && (
          <Surface tone="gold" radius="xl" pad="md" className="mt-3">
            <p className="text-sm font-semibold">Selesaikan pembayaran untuk mengamankan kuota.</p>
            <Button onClick={onPay} size="sm" className="mt-2 w-full rounded-full">
              <CreditCard data-icon="inline-start" />
              Lanjut bayar
            </Button>
          </Surface>
        )}
        {reg.paymentStatus === "paid" && (
          <p className="mt-3 text-sm text-ink/75">{cfg.desc} Hubungi panitia untuk grup peserta.</p>
        )}
      </Surface>

      <Surface tone="plain" radius="xl" pad="md">
        <p className="text-xs font-bold text-astro-navy">
          {reg.type === "team" ? "Tim" : "Peserta"}
        </p>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          {reg.type === "team" ? (
            <>
              <div>
                <dt className="text-xs text-ink/55">Nama tim</dt>
                <dd className="font-semibold text-astro-navy">{reg.teamName}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink/55">Ketua</dt>
                <dd className="font-semibold text-astro-navy">
                  {reg.leaderName} ({reg.leaderIdentity || "—"})
                </dd>
              </div>
              {reg.leaderGameId && (
                <div>
                  <dt className="text-xs text-ink/55">ID akun ketua</dt>
                  <dd className="font-mono font-semibold text-astro-navy">{reg.leaderGameId}</dd>
                </div>
              )}
              {isSafeUrl(reg.leaderPhotoUrl) && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-ink/55">Foto ketua</dt>
                  <div className="mt-1 flex items-center gap-3">
                    <Image
                      src={reg.leaderPhotoUrl}
                      alt="Foto ketua"
                      width={54}
                      height={54}
                      className="size-14 rounded-lg object-cover"
                    />
                    <a
                      href={safeHref(reg.leaderPhotoUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-astro-blue"
                    >
                      Lihat foto <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>
              )}
              {reg.memberDetails && reg.memberDetails.length > 0 && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-ink/55">Roster ({reg.memberDetails.length})</dt>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    {reg.memberDetails.map((member, index) => (
                      <div key={`${member.name}-${index}`} className="flex items-center gap-2">
                        {member.photoUrl ? (
                          <Image
                            src={member.photoUrl}
                            alt={member.name}
                            width={36}
                            height={36}
                            className="size-9 rounded-md object-cover"
                          />
                        ) : (
                          <span className="grid size-9 place-items-center rounded-md bg-sky-bottom text-10 font-bold text-ink">
                            Foto
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-astro-navy">
                            {member.name}
                          </span>
                          {member.gameId && (
                            <span className="block truncate font-mono text-11 text-ink/60">
                              {member.gameId}
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <dt className="text-xs text-ink/55">Nama</dt>
                <dd className="font-semibold text-astro-navy">{reg.fullName}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink/55">Identitas</dt>
                <dd className="font-medium text-astro-navy">{reg.identityNumber || "—"}</dd>
              </div>
            </>
          )}
          <div>
            <dt className="text-xs text-ink/55">Instansi</dt>
            <dd className="flex items-center gap-1 font-medium text-astro-navy">
              <Building2 className="size-3" aria-hidden /> {reg.institution}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink/55">WhatsApp</dt>
            <dd className="flex items-center gap-1 font-medium text-astro-navy">
              <Phone className="size-3" aria-hidden /> {reg.whatsapp}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-ink/55">Email</dt>
            <dd className="flex items-center gap-1 font-medium text-astro-navy">
              <Mail className="size-3" aria-hidden /> {reg.email}
            </dd>
          </div>
        </dl>
      </Surface>

      {reg.customFields && Object.keys(reg.customFields).length > 0 && (
        <Surface tone="plain" radius="xl" pad="md">
          <p className="text-xs font-bold text-astro-navy">Berkas khusus</p>
          <div className="mt-3 space-y-2">
            {Object.entries(reg.customFields).map(([key, val]) => {
              const fieldDef = reg.competitionCustomFields?.find((field) => field.id === key);
              const label = fieldDef?.label ?? key;
              const isImage =
                typeof val === "string" && (val.startsWith("http") || val.startsWith("/"));
              if (!val) return null;
              return (
                <div key={key} className="text-sm">
                  <p className="text-xs text-ink/55">{label}</p>
                  {isImage ? (
                    <div className="mt-1 flex items-center gap-3">
                      <Image
                        src={String(val)}
                        alt={label}
                        width={56}
                        height={56}
                        className="size-14 rounded-lg bg-white object-cover"
                      />
                      <a
                        href={String(val)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-astro-blue"
                      >
                        Lihat berkas <ExternalLink className="size-3" />
                      </a>
                    </div>
                  ) : (
                    <p className="whitespace-pre-line font-medium text-astro-navy">{String(val)}</p>
                  )}
                </div>
              );
            })}
          </div>
        </Surface>
      )}

      {wa && (
        <Surface tone="tint" radius="xl" pad="md">
          <p className="text-xs font-bold text-astro-navy">Narahubung</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-astro-navy">
              {reg.competitionContactName || "Panitia lomba"}
            </p>
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <a
                href={`https://wa.me/${wa}?text=${encodeURIComponent(
                  `Halo Panitia ${reg.competitionName}, saya ${reg.type === "team" ? reg.teamName : reg.fullName} (Ref: ${reg.paymentReference}) ingin menanyakan pendaftaran.`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle data-icon="inline-start" />
                WhatsApp
              </a>
            </Button>
          </div>
        </Surface>
      )}

      <div className="flex items-center justify-between gap-2 pt-1">
        <Button variant="outline" size="sm" className="rounded-full" onClick={onPrint}>
          <Printer data-icon="inline-start" />
          Cetak invoice
        </Button>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Tutup
        </Button>
      </div>
    </div>
  );
}

export default function CekPendaftaranPage() {
  return (
    <Suspense
      fallback={
        <PageShell>
          <div className="flex min-h-[60svh] items-center justify-center">
            <Spinner className="size-6 text-astro-navy" />
          </div>
        </PageShell>
      }
    >
      <CheckRegistrationContent />
    </Suspense>
  );
}
