'use client';

import { useMemo, useState, useEffect } from 'react';
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
  Printer,
  RotateCcw,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import type { Competition } from '@/types/astro';
import { useRegistration } from '@/src/lib/hooks/use-queries';
import QrisDisplay from '@/components/QrisDisplay';
import PrintableInvoice, { PrintPortal, type PrintableInvoiceData } from '@/components/PrintableInvoice';

interface Props {
  competition: Competition;
  registrationId: string;
  paymentReference: string;
  paymentLinkUrl: string | null;
  paymentExpiresAt: string | null;
  initialPaymentCode?: string | null;
  initialPaymentCodeType?: string | null;
  onBack: () => void;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

// Poll while the outcome is still undecided — active sync checks SumoPod live status
const POLL_INTERVAL_MS = 3000;

export default function PaymentStep({
  competition,
  registrationId,
  paymentReference,
  paymentLinkUrl,
  paymentExpiresAt,
  initialPaymentCode,
  initialPaymentCodeType,
  onBack,
}: Props) {
  const router = useRouter();
  const [printing, setPrinting] = useState(false);

  const [isFinalStatus, setIsFinalStatus] = useState(false);
  const [clientPaymentCode, setClientPaymentCode] = useState<string | null>(initialPaymentCode ?? null);
  const [clientPaymentCodeType, setClientPaymentCodeType] = useState<string | null>(initialPaymentCodeType ?? null);
  const [clientAmount, setClientAmount] = useState<number | null>(null);

  const { data: reg } = useRegistration(registrationId, {
    refetchInterval: isFinalStatus ? false : POLL_INTERVAL_MS,
  });

  const paymentStatus: string = (reg as any)?.paymentStatus ?? 'pending';

  useEffect(() => {
    if (paymentStatus === 'paid') {
      setIsFinalStatus(true);
      if (typeof window !== 'undefined' && competition?.id) {
        try {
          localStorage.removeItem(`astro_reg_draft_${competition.id}`);
          localStorage.removeItem(`astro_active_reg_${competition.id}`);
        } catch {}
      }
    } else if (paymentStatus === 'failed' || paymentStatus === 'expired') {
      setIsFinalStatus(true);
    }
  }, [paymentStatus, competition?.id]);

  const resolvedLinkUrl = (reg as any)?.paymentLinkUrl ?? paymentLinkUrl;
  const resolvedExpiresAt = (reg as any)?.paymentExpiresAt ?? paymentExpiresAt;
  const paymentCode = (reg as any)?.paymentCode || clientPaymentCode;
  const paymentCodeType = (reg as any)?.paymentCodeType || clientPaymentCodeType;
  const paymentAmount = clientAmount || (reg as any)?.paymentAmount || competition.fee;

  // Client-side fail-safe: if paymentCode is not yet loaded in reg, fetch directly from checkout API
  useEffect(() => {
    if (paymentCode || !resolvedLinkUrl || typeof window === 'undefined') return;
    try {
      const urlObj = new URL(resolvedLinkUrl);
      const checkoutId = urlObj.pathname.split('/').filter(Boolean).pop();
      if (checkoutId && urlObj.origin.includes('pymnt.app')) {
        fetch(`${urlObj.origin}/api/checkout/${checkoutId}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data?.paymentCode) {
              setClientPaymentCode(data.paymentCode);
              setClientPaymentCodeType(data.paymentCodeType || 'QR_TEXT');
              if (data.initiatedAmount) {
                setClientAmount(Number(data.initiatedAmount));
              }
            }
          })
          .catch(() => {});
      }
    } catch {}
  }, [paymentCode, resolvedLinkUrl]);

  const waNumber = (competition.contactPerson?.whatsapp || '').replace(/\D/g, '');
  const waHref = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(
        `Halo Panitia ${competition.title}, saya butuh bantuan terkait pembayaran pendaftaran (Ref: ${paymentReference}).`
      )}`
    : undefined;

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const invoiceData: PrintableInvoiceData = {
    id: (reg as any)?.id || registrationId,
    paymentReference: (reg as any)?.paymentReference || paymentReference,
    paymentStatus,
    paymentMethod: (reg as any)?.paymentMethod || 'QRIS',
    paymentAmount,
    batchName: (reg as any)?.batchName,
    type: (reg as any)?.type || 'individual',
    fullName: (reg as any)?.fullName,
    teamName: (reg as any)?.teamName,
    leaderName: (reg as any)?.leaderName,
    institution: (reg as any)?.institution || '',
    email: (reg as any)?.email || '',
    whatsapp: (reg as any)?.whatsapp || '',
    memberDetails: (reg as any)?.memberDetails || [],
    customFields: (reg as any)?.customFields || {},
    competitionName: competition.title,
    competitionCategory: competition.category,
    competitionContactName: competition.contactPerson?.name,
    competitionContactWhatsapp: competition.contactPerson?.whatsapp,
    createdAt: (reg as any)?.createdAt,
  };

  return (
    <div className="space-y-8">
      <AnimatePresence mode="wait">
        {paymentStatus === 'paid' ? (
          /* ─── PAID / LUNAS STATE ─── */
          <motion.div
            key="paid"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="text-center space-y-3">
              <motion.div
                className="flex justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.15 }}
              >
                <div
                  className="p-4 bg-emerald-50 border border-emerald-200"
                  style={{ clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)' }}
                >
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </div>
              </motion.div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
                Pembayaran Berhasil Diverifikasi!
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto font-light">
                Pendaftaran dan pembayaran kamu telah diterima dan kuota slot lomba telah resmi terkunci.
              </p>
              <div className="flex justify-center">
                <div className="accent-line" />
              </div>
            </div>

            <div className="max-w-md mx-auto space-y-3">
              <Button
                onClick={handlePrint}
                size="lg"
                className="clip-angled w-full text-sm font-black uppercase tracking-wider bg-slate-900 text-white hover:bg-slate-800 gap-2 shadow-md active:scale-95"
              >
                <Printer className="size-4 text-cyan-400" />
                Cetak Bukti Pendaftaran / Invoice
              </Button>

              <Button
                onClick={() => router.push(`/check-registration?regId=${registrationId}`)}
                variant="outline"
                size="lg"
                className="clip-angled w-full text-xs font-bold uppercase tracking-wider gap-2"
              >
                <CheckCircle2 className="size-4 text-emerald-600" />
                Lihat di Menu Cek Pendaftaran
              </Button>

              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className="w-full text-xs text-slate-500 hover:text-slate-900 gap-1.5 pt-2"
              >
                <RotateCcw className="size-3.5" />
                Daftarkan Peserta / Tim Lainnya
              </Button>
            </div>
          </motion.div>
        ) : paymentStatus === 'failed' || paymentStatus === 'expired' ? (
          /* ─── FAILED / CANCELED / EXPIRED STATE ─── */
          <motion.div
            key="failed"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center"
          >
            <div className="flex justify-center">
              <div
                className="p-4 bg-red-50 border border-red-200"
                style={{ clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)' }}
              >
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
                {paymentStatus === 'expired'
                  ? 'Batas Waktu Pembayaran Telah Habis'
                  : 'Pembayaran Dibatalkan / Gagal'}
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto font-light leading-relaxed">
                {paymentStatus === 'expired'
                  ? 'Link atau kode QRIS pembayaran telah kadaluarsa. Silakan buat ulang pendaftaran atau hubungi panitia.'
                  : 'Transaksi ini telah dibatalkan di Payment Gateway. Jangan khawatir, Anda dapat mengulangi proses pembayaran atau kembali ke formulir pendaftaran.'}
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-3 pt-2">
              <Button
                onClick={onBack}
                size="lg"
                className="clip-angled w-full text-xs font-black uppercase tracking-wider gap-2 bg-cyan-600 text-white hover:bg-cyan-500 active:scale-95"
              >
                <RotateCcw className="size-4" />
                Ulangi Pendaftaran & Dapatkan QRIS Baru
              </Button>

              {waHref && (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="clip-angled w-full text-xs font-bold uppercase tracking-wider gap-2 border-slate-300"
                >
                  <a href={waHref} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="size-4 text-emerald-600" />
                    Hubungi Panitia via WhatsApp
                  </a>
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          /* ─── PENDING STATE (IN-APP QRIS EMBEDDED) ─── */
          <motion.div
            key="payment-flow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div
                  className="p-4 bg-white border border-slate-200"
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
                <strong className="text-slate-900 font-bold">{formatCurrency(paymentAmount)}</strong>{' '}
                untuk mengamankan kuota slot pendaftaran di <strong>{competition.title}</strong>.
              </p>
              <div className="flex justify-center">
                <div className="accent-line" />
              </div>
            </div>

            {/* In-App QRIS Card Display */}
            {paymentCode ? (
              <QrisDisplay
                paymentCode={paymentCode}
                paymentCodeType={paymentCodeType}
                amount={paymentAmount}
                paymentReference={paymentReference}
                expiresAt={resolvedExpiresAt}
                paymentLinkUrl={resolvedLinkUrl}
              />
            ) : resolvedLinkUrl ? (
              <div
                className="bg-white border border-slate-200 relative max-w-lg mx-auto"
                style={{ clipPath: 'polygon(14px 0, 100% 0, calc(100% - 14px) 100%, 0 100%)' }}
              >
                <div
                  className="absolute -top-[1px] -left-[1px] w-8 h-8 bg-astro-cyan"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
                />
                <div className="p-6 md:p-8 space-y-6 text-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Referensi
                    </span>
                    <p className="text-xs font-mono font-bold text-slate-700 mt-0.5 tracking-wide">
                      {paymentReference}
                    </p>
                  </div>
                  <Button
                    asChild
                    size="lg"
                    className="clip-angled w-full text-sm font-black uppercase tracking-wider active:scale-95"
                  >
                    <a href={resolvedLinkUrl} target="_blank" rel="noopener noreferrer">
                      Bayar Sekarang Melalui SumoPod
                      <ExternalLink data-icon="inline-end" />
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <Alert className="clip-angled max-w-lg mx-auto border-amber-200 bg-amber-50/50 text-amber-800">
                <AlertDescription className="flex items-center gap-2 text-xs font-medium">
                  <AlertCircle className="size-4 shrink-0" />
                  Pendaftaran tercatat, menunggu konfirmasi gateway pembayaran...
                </AlertDescription>
              </Alert>
            )}

            {/* Live Auto-detection status alert */}
            <div className="max-w-md mx-auto space-y-3">
              <Alert className="clip-angled border-sky-200 bg-sky-50/50 text-sky-800">
                <AlertDescription className="flex items-center gap-2 text-[11px] font-medium">
                  <Spinner className="size-3.5 shrink-0" />
                  <span>Sistem memantau pembayaran secara otomatis. Halaman ini akan berganti seketika setelah pembayaran Anda terverifikasi.</span>
                </AlertDescription>
              </Alert>

              <Button
                variant="outline"
                size="lg"
                onClick={onBack}
                className="clip-angled w-full text-xs font-bold uppercase tracking-wider"
              >
                <ArrowLeft data-icon="inline-start" />
                Kembali ke Form Pendaftaran
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Printable Invoice Container */}
      {printing && (
        <PrintPortal>
          <PrintableInvoice data={invoiceData} />
        </PrintPortal>
      )}
    </div>
  );
}
