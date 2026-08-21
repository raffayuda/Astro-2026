'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Trophy, Heart, FileText, ExternalLink, Medal, Download, Printer, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ResponsiveModal } from '@/components/responsive-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useCertificateGenerateSingle } from '@/src/lib/hooks/use-queries';

interface CertItem {
  name: string;
  url: string;
}

interface RegistrationWinner {
  id: string;
  type: string;
  fullName: string | null;
  teamName: string | null;
  leaderName: string | null;
  email: string;
  winnerRank: string | null;
  certificates: CertItem[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  competitionTitle: string;
  competitionId: string;
  category: string;
  type: string | null;
  winners: RegistrationWinner[];
  certHolders: RegistrationWinner[];
  prizes: { label: string; value: string }[];
  loading?: boolean;
}

function CertModal({
  allCerts,
  onClose,
}: {
  allCerts: { name: string; certs: CertItem[]; rank?: string }[];
  onClose: () => void;
}) {
  return (
    <ResponsiveModal
      open
      onOpenChange={(next) => !next && onClose()}
      title="Sertifikat"
      description="Unduh sertifikat peserta lomba ini."
      contentClassName="max-w-lg"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Download />
        </div>
        <div>
          <span className="block text-sm font-black uppercase tracking-tight text-foreground">Sertifikat</span>
          <span className="text-[11px] text-muted-foreground">Unduh sertifikat peserta lomba ini.</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {allCerts.map((group, gi) => (
          <div key={gi}>
            {group.rank && (
              <div className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                {group.rank}
              </div>
            )}
            <div className="mb-1.5 text-xs font-bold text-foreground">{group.name}</div>
            <div className="flex flex-col gap-1.5 pl-2">
              {group.certs.map((c, ci) => (
                <a key={ci} href={c.url} target="_blank" rel="noopener noreferrer"
                  className="group/cert flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 transition-all hover:border-primary hover:bg-primary/5"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <FileText className="size-4 flex-shrink-0 text-muted-foreground transition-colors group-hover/cert:text-primary" />
                    <span className="truncate text-[12px] font-bold text-muted-foreground transition-colors group-hover/cert:text-foreground">
                      {c.name}
                    </span>
                  </div>
                  <ExternalLink className="size-3.5 flex-shrink-0 text-muted-foreground transition-colors group-hover/cert:text-primary" />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {allCerts.length === 0 && (
        <div className="py-10 text-center text-sm italic text-muted-foreground">
          Belum ada sertifikat yang diupload.
        </div>
      )}
    </ResponsiveModal>
  );
}

export default function WinnersModal({
  isOpen,
  onClose,
  competitionTitle,
  competitionId,
  category,
  winners,
  certHolders,
  prizes = [],
  loading = false,
}: Props) {
  const [showCertModal, setShowCertModal] = useState(false);
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  const [localCerts, setLocalCerts] = useState<Record<string, CertItem[]>>({});
  const generateSingle = useCertificateGenerateSingle();

  useEffect(() => {
    if (!isOpen) return;
    setGeneratingIds(new Set());
    setLocalCerts({});
  }, [isOpen]);

  function getCertsFor(regId: string): CertItem[] {
    const winner = winners.find((w) => w.id === regId);
    if (winner && winner.certificates && winner.certificates.length > 0) {
      return winner.certificates;
    }
    return localCerts[regId] || [];
  }

  async function handlePrintCertificate(regId: string) {
    setGeneratingIds((prev) => new Set(prev).add(regId));
    try {
      const result = await generateSingle.mutateAsync({
        competitionId,
        registrationId: regId,
      });
      if (result && Array.isArray(result)) {
        setLocalCerts((prev) => ({
          ...prev,
          [regId]: result.map((r: { name: string; url: string }) => ({
            name: r.name,
            url: r.url,
          })),
        }));
      }
    } catch (err) {
      console.error('Generate certificate failed:', err);
    } finally {
      setGeneratingIds((prev) => {
        const next = new Set(prev);
        next.delete(regId);
        return next;
      });
    }
  }


  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        zIndex: 200,
      });

      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) { clearInterval(interval); return; }
        const particleCount = 40 * (timeLeft / duration);

        confetti({
          particleCount,
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#2563eb', '#3b82f6', '#f59e0b', '#06b6d4', '#ec4899', '#ffffff'],
          zIndex: 200,
        });
        confetti({
          particleCount,
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#2563eb', '#3b82f6', '#f59e0b', '#06b6d4', '#ec4899', '#ffffff'],
          zIndex: 200,
        });
      }, 250);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const grouped = {
    '1': winners.filter((w) => w.winnerRank === '1'),
    '2': winners.filter((w) => w.winnerRank === '2'),
    '3': winners.filter((w) => w.winnerRank === '3'),
  };

  const getWinnerName = (w: RegistrationWinner) =>
    w.fullName || w.teamName || w.leaderName || 'Peserta';

  /** Split a prize value string into a clean list of items. */
  const splitPrizeItems = (value: string) =>
    value
      .split(/[;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

  const categoryFormatted =
    category === 'akademik' ? 'Akademik & Sains' :
    category === 'olahraga' ? 'Olahraga' :
    category === 'esports' ? 'Esports & Gaming' : category;

  // Collect all certificates for the cert modal
  const allCertGroups = [
    ...(grouped['1'].length > 0 ? [{ name: 'Juara 1', certs: grouped['1'].flatMap((w) => getCertsFor(w.id)), rank: '🥇 Juara 1' }] : []),
    ...(grouped['2'].length > 0 ? [{ name: 'Juara 2', certs: grouped['2'].flatMap((w) => getCertsFor(w.id)), rank: '🥈 Juara 2' }] : []),
    ...(grouped['3'].length > 0 ? [{ name: 'Juara 3', certs: grouped['3'].flatMap((w) => getCertsFor(w.id)), rank: '🥉 Juara 3' }] : []),
    ...certHolders.map((ch) => ({
      name: getWinnerName(ch),
      certs: ch.certificates || [],
      rank: undefined as string | undefined,
    })),
  ].filter((g) => g.certs.length > 0);

  const totalCerts = allCertGroups.reduce((sum, g) => sum + g.certs.length, 0);

  // Winners that don't yet have certificates — eligible for on-demand generate
  const winnersWithoutCerts = winners.filter(
    (w) => getCertsFor(w.id).length === 0 && !generatingIds.has(w.id),
  );
  const anyGenerating = winnersWithoutCerts.length === 0 && winners.some((w) => generatingIds.has(w.id));

  return (
    <>
      <ResponsiveModal
        open={isOpen}
        onOpenChange={(next) => !next && onClose()}
        title="Pengumuman Juara"
        description={competitionTitle}
        titleClassName="sr-only"
        descriptionClassName="sr-only"
        contentClassName="max-w-5xl gap-0 border border-border bg-gradient-to-b from-blue-50/50 via-white to-white p-6 sm:p-8 md:p-10"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <Spinner className="size-8 text-primary" />
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Memuat data pemenang...
            </p>
          </div>
        ) : (
          <>
        {/* Header & Trophy */}
        <div className="mb-6 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex-1 text-left">
            <Badge variant="outline" className="mb-3 gap-2 border-astro-cyan/20 bg-astro-cyan/10 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-astro-cyan">
              <span className="text-sm">📢</span> PENGUMUMAN JUARA
            </Badge>
            <h2 className="text-3xl font-black leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Selamat kepada <br className="hidden sm:inline" />
              <span className="text-astro-cyan">Para Pemenang!</span>
            </h2>
            <p className="mt-2.5 max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm md:text-base">
              Terima kasih kepada seluruh peserta yang telah berpartisipasi dan menunjukkan karya terbaiknya.
            </p>
          </div>
          <div className="relative flex flex-shrink-0 items-center justify-center pt-2 md:pt-0">
            <div className="absolute size-44 rounded-full bg-amber-300/30 blur-2xl" />
            <div className="relative size-36 sm:size-44 md:size-52">
              <Image src="/assets/piala.png" alt="Piala Pemenang" fill className="object-contain drop-shadow-xl" priority />
            </div>
          </div>
        </div>

        {/* Info Bar */}
        <div className="mb-8 grid grid-cols-1 gap-3 rounded-2xl border border-astro-cyan/20 bg-astro-cyan/5 p-3.5 sm:grid-cols-2 md:p-4">
          <div className="flex items-center gap-3 px-2">
            <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-xl bg-astro-cyan/10 text-astro-cyan shadow-xs">
              <Trophy />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nama Lomba</span>
              <span className="block truncate text-xs font-extrabold text-foreground sm:text-sm">{competitionTitle}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2">
            <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-xl bg-astro-cyan/10 text-astro-cyan shadow-xs">
              <Medal />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Kategori</span>
              <span className="block truncate text-xs font-extrabold text-foreground sm:text-sm">{categoryFormatted}</span>
            </div>
          </div>
        </div>

        {/* Podium Cards */}
        {winners.length > 0 && (
          <div className="mb-6 grid grid-cols-1 items-end gap-6 pt-4 md:grid-cols-3 md:gap-4">
            {grouped['2'].length > 0 && (
              <div className="relative flex h-full min-h-[200px] flex-col justify-between rounded-2xl border border-astro-cyan/20 bg-muted/40 px-4 pt-10 pb-5 text-center shadow-xs">
                <div className="absolute -top-7 left-1/2 size-14 -translate-x-1/2 drop-shadow-md">
                  <Image src="/assets/medali2.png" alt="Medali Juara 2" fill className="object-contain" />
                </div>
                <div>
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Juara 2</span>
                  {grouped['2'].map((w) => (
                    <h3 key={w.id} className="text-base font-black leading-snug text-foreground sm:text-lg">{getWinnerName(w)}</h3>
                  ))}
                </div>
                {prizes.find((p) => p.label.toLowerCase().includes('2') || p.label === 'Juara 2') && (
                  <div className="mt-3 border-t border-slate-200/60 pt-3">
                    <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Hadiah</span>
                    <ul className="space-y-1">
                      {splitPrizeItems(prizes.find((p) => p.label.toLowerCase().includes('2') || p.label === 'Juara 2')?.value || '').map((item, i) => (
                        <li key={i} className="flex items-start justify-center gap-1.5 text-left">
                          <Check className="mt-0.5 size-3 flex-shrink-0 text-astro-cyan" />
                          <span className="text-[11px] font-bold leading-snug text-slate-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {grouped['1'].length > 0 && (
              <div className="relative flex h-full min-h-[220px] flex-col justify-between rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-amber-50/80 to-amber-100/40 px-4 pt-11 pb-6 text-center shadow-md ring-4 ring-amber-400/10 md:-translate-y-1">
                <div className="absolute -top-9 left-1/2 size-16 -translate-x-1/2 drop-shadow-lg">
                  <Image src="/assets/medali1.png" alt="Medali Juara 1" fill className="object-contain" />
                </div>
                <div>
                  <span className="mb-1 block text-xs font-black uppercase tracking-widest text-amber-700">Juara 1</span>
                  {grouped['1'].map((w) => (
                    <h3 key={w.id} className="text-lg font-black leading-snug text-foreground sm:text-xl">{getWinnerName(w)}</h3>
                  ))}
                </div>
                {prizes.find((p) => p.label.toLowerCase().includes('1') || p.label === 'Juara 1') && (
                  <div className="mt-3 border-t border-amber-200/80 pt-3">
                    <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Hadiah</span>
                    <ul className="space-y-1">
                      {splitPrizeItems(prizes.find((p) => p.label.toLowerCase().includes('1') || p.label === 'Juara 1')?.value || '').map((item, i) => (
                        <li key={i} className="flex items-start justify-center gap-1.5 text-left">
                          <Check className="mt-0.5 size-3 flex-shrink-0 text-amber-600" />
                          <span className="text-xs font-bold leading-snug text-amber-900">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {grouped['3'].length > 0 && (
              <div className="relative flex h-full min-h-[200px] flex-col justify-between rounded-2xl border border-orange-200/80 bg-orange-50/30 px-4 pt-10 pb-5 text-center shadow-xs">
                <div className="absolute -top-7 left-1/2 size-14 -translate-x-1/2 drop-shadow-md">
                  <Image src="/assets/medali3.png" alt="Medali Juara 3" fill className="object-contain" />
                </div>
                <div>
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-amber-900/70">Juara 3</span>
                  {grouped['3'].map((w) => (
                    <h3 key={w.id} className="text-base font-black leading-snug text-foreground sm:text-lg">{getWinnerName(w)}</h3>
                  ))}
                </div>
                {prizes.find((p) => p.label.toLowerCase().includes('3') || p.label === 'Juara 3') && (
                  <div className="mt-3 border-t border-orange-200/60 pt-3">
                    <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Hadiah</span>
                    <ul className="space-y-1">
                      {splitPrizeItems(prizes.find((p) => p.label.toLowerCase().includes('3') || p.label === 'Juara 3')?.value || '').map((item, i) => (
                        <li key={i} className="flex items-start justify-center gap-1.5 text-left">
                          <Check className="mt-0.5 size-3 flex-shrink-0 text-orange-500" />
                          <span className="text-[11px] font-bold leading-snug text-orange-900">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tombol: Dapatkan / Cetak Sertifikat */}
        {(totalCerts > 0 || winnersWithoutCerts.length > 0 || anyGenerating) && (
          <div className="border-t border-border pt-4 pb-2">
            {totalCerts > 0 ? (
              <Button
                onClick={() => setShowCertModal(true)}
                className="h-11 w-full gap-2 text-sm font-semibold"
              >
                <Download className="size-4" />
                Dapatkan Sertifikat
                <span className="ml-auto rounded-full bg-primary-foreground/15 px-2 py-0.5 text-xs font-medium">
                  {totalCerts}
                </span>
              </Button>
            ) : (
              <Button
                onClick={() => {
                  winnersWithoutCerts.forEach((w) => handlePrintCertificate(w.id));
                }}
                disabled={generateSingle.isPending}
                className="h-11 w-full gap-2 text-sm font-semibold"
              >
                {generateSingle.isPending ? <Spinner className="size-4" /> : <Printer className="size-4" />}
                Cetak Sertifikat
              </Button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-center gap-1.5 pt-4 text-xs font-semibold text-muted-foreground sm:text-sm">
          <Heart className="size-4 fill-astro-cyan text-astro-cyan" />
          <span>Teruslah berkarya dan sampai jumpa di kompetisi berikutnya!</span>
        </div>
          </>
        )}
      </ResponsiveModal>

      {/* Sub-modal Sertifikat */}
      {showCertModal && (
        <CertModal
          allCerts={allCertGroups}
          onClose={() => setShowCertModal(false)}
        />
      )}
    </>
  );
}
