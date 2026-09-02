'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  ArrowLeft,
  Receipt,
  Clock,
  ExternalLink,
  AlertCircle,
  XCircle,
  MessageCircle,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import type { Competition } from '@/types/astro';
import { useRegistration } from '@/src/lib/hooks/use-queries';

interface Props {
  competition: Competition;
  registrationId: string;
  paymentReference: string;
  paymentLinkUrl: string | null;
  paymentExpiresAt: string | null;
  onBack: () => void;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

// Poll while the outcome is still undecided — the actual status change is
// driven server-side by the SumoPod webhook, this just picks it up.
const POLL_INTERVAL_MS = 4000;

export default function PaymentStep({ competition, registrationId, paymentReference, paymentLinkUrl, paymentExpiresAt, onBack }: Props) {
  const router = useRouter();

  const { data: reg } = useRegistration(registrationId, { refetchInterval: POLL_INTERVAL_MS });
  const paymentStatus: string = (reg as any)?.paymentStatus ?? 'pending';
  const resolvedLinkUrl = (reg as any)?.paymentLinkUrl ?? paymentLinkUrl;
  const resolvedExpiresAt = (reg as any)?.paymentExpiresAt ?? paymentExpiresAt;

  const expiresLabel = useMemo(() => {
    if (!resolvedExpiresAt) return null;
    const d = new Date(resolvedExpiresAt);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  }, [resolvedExpiresAt]);

  const waNumber = (competition.contactPerson?.whatsapp || '').replace(/\D/g, '');
  const waHref = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(`Halo, saya butuh bantuan pembayaran pendaftaran ${competition.title} dengan referensi ${paymentReference}.`)}`
    : undefined;

  return (
    <div className="space-y-8">
      <AnimatePresence mode="wait">
        {paymentStatus === 'paid' ? (
          /* ─── PAID STATE ─── */
          <motion.div
            key="paid"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div className="text-center space-y-3">
              <motion.div
                className="flex justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.15 }}
              >
                <div className="p-4 bg-emerald-50 border border-emerald-200"
                  style={{ clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)' }}
                >
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </div>
              </motion.div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
                Pembayaran Berhasil!
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto font-light">
                Pendaftaran dan pembayaran kamu telah diterima.
              </p>
              <div className="flex justify-center">
                <div className="accent-line" />
              </div>
            </div>

            <Button
              onClick={() => router.push('/check-registration')}
              size="lg"
              className="clip-angled w-full text-sm font-black uppercase tracking-wider active:scale-95"
            >
              <CheckCircle2 data-icon="inline-start" />
              Lihat Status Pendaftaran
            </Button>
          </motion.div>
        ) : paymentStatus === 'failed' || paymentStatus === 'expired' ? (
          /* ─── FAILED / EXPIRED STATE ─── */
          <motion.div
            key="failed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 text-center"
          >
            <div className="flex justify-center">
              <div className="p-4 bg-red-50 border border-red-200"
                style={{ clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)' }}
              >
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
              {paymentStatus === 'expired' ? 'Link Pembayaran Kadaluarsa' : 'Pembayaran Gagal'}
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto font-light">
              Hubungi panitia melalui WhatsApp untuk mendapatkan link pembayaran baru.
            </p>
            {waHref && (
              <Button asChild size="lg" className="clip-angled w-full text-sm font-black uppercase tracking-wider">
                <a href={waHref} target="_blank" rel="noopener noreferrer">
                  <MessageCircle data-icon="inline-start" />
                  Hubungi Panitia
                </a>
              </Button>
            )}
            <Button variant="outline" size="lg" onClick={onBack} className="clip-angled w-full text-xs font-bold uppercase tracking-wider">
              <ArrowLeft data-icon="inline-start" />
              Kembali ke Form Pendaftaran
            </Button>
          </motion.div>
        ) : (
          /* ─── PENDING STATE ─── */
          <motion.div
            key="payment-flow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-white border border-slate-200"
                  style={{ clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)' }}
                >
                  <Receipt className="w-12 h-12 text-astro-cyan" />
                </div>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
                Selesaikan Pembayaran
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto font-light">
                Lakukan pembayaran sebesar{' '}
                <strong className="text-slate-900">{formatCurrency(competition.fee)}</strong>{' '}
                untuk mengamankan slot di <strong>{competition.title}</strong>.
              </p>
              <div className="flex justify-center">
                <div className="accent-line" />
              </div>
            </div>

            <div
              className="bg-white border border-slate-200 relative max-w-lg mx-auto"
              style={{ clipPath: 'polygon(14px 0, 100% 0, calc(100% - 14px) 100%, 0 100%)' }}
            >
              <div
                className="absolute -top-[1px] -left-[1px] w-8 h-8 bg-astro-cyan"
                style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
              />

              <div className="p-6 md:p-8 space-y-6">
                <div className="text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Referensi
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-700 mt-0.5 tracking-wide">
                    {paymentReference}
                  </p>
                </div>

                {resolvedLinkUrl ? (
                  <>
                    <Button asChild size="lg" className="clip-angled w-full text-sm font-black uppercase tracking-wider active:scale-95">
                      <a href={resolvedLinkUrl} target="_blank" rel="noopener noreferrer">
                        Bayar Sekarang
                        <ExternalLink data-icon="inline-end" />
                      </a>
                    </Button>

                    {expiresLabel && (
                      <p className="text-center text-[11px] text-slate-500">
                        Link berlaku sampai <strong>{expiresLabel}</strong>
                      </p>
                    )}

                    <Alert className="clip-angled border-sky-200 bg-sky-50/40 text-sky-800">
                      <AlertDescription className="flex items-center gap-1.5 text-[11px] font-medium">
                        <Spinner className="size-3" />
                        Halaman ini akan otomatis memperbarui status setelah pembayaran diterima.
                      </AlertDescription>
                    </Alert>
                  </>
                ) : (
                  <Alert className="clip-angled border-amber-200 bg-amber-50/40 text-amber-800">
                    <AlertDescription className="flex items-center gap-1.5 text-[11px] font-medium">
                      <AlertCircle className="size-3.5" />
                      Pendaftaran tercatat, menunggu konfirmasi panitia.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Clock className="size-3" />
                  Menunggu Pembayaran
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="lg"
              onClick={onBack}
              className="clip-angled w-full text-xs font-bold uppercase tracking-wider"
            >
              <ArrowLeft data-icon="inline-start" />
              Kembali ke Form Pendaftaran
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
