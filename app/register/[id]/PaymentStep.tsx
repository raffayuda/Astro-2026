'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  ArrowLeft,
  Receipt,
  AlertCircle,
  XCircle,
  MessageCircle,
} from 'lucide-react';
import { CtaButton } from '@/components/brand/CtaButton';
import { Surface } from '@/components/brand/Surface';
import { WindowCard } from '@/components/brand/WindowCard';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import type { Competition } from '@/types/astro';
import { useRegistration } from '@/src/lib/hooks/use-queries';
import QrisDisplay from '@/components/QrisDisplay';
import PrintableInvoice, {
  PrintPortal,
  usePrintInvoice,
  type PrintableInvoiceData,
} from '@/components/PrintableInvoice';

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
  const { target: printTarget, print } = usePrintInvoice<PrintableInvoiceData>();

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
    leaderGameId: (reg as any)?.leaderGameId,
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
    <div className="w-full min-w-0">
      <AnimatePresence mode="wait">
        {paymentStatus === 'paid' ? (
          <motion.div
            key="paid"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <WindowCard title="Pembayaran" bodyClassName="gap-4">
              <CheckCircle2 className="size-10 text-astro-blue" aria-hidden />
              <h2 className="font-heading text-2xl font-black text-astro-navy">
                Pembayaran terverifikasi
              </h2>
              <p className="text-sm leading-relaxed text-ink/75">
                Pendaftaran diterima. Kuota lomba sudah terkunci.
              </p>
              <CtaButton onClick={() => print(invoiceData)} size="lg" className="w-full" showChevron={false}>
                Cetak invoice
              </CtaButton>
              <Button
                onClick={() => router.push(`/check-registration?regId=${registrationId}`)}
                variant="outline"
                size="lg"
                className="w-full rounded-full"
              >
                Cek pendaftaran
              </Button>
              <Button onClick={onBack} variant="ghost" size="sm" className="w-full">
                Daftar peserta lain
              </Button>
            </WindowCard>
          </motion.div>
        ) : paymentStatus === 'failed' || paymentStatus === 'expired' ? (
          <motion.div
            key="failed"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <WindowCard title="Pembayaran" bodyClassName="gap-4">
              <XCircle className="size-10 text-astro-pink" aria-hidden />
              <h2 className="font-heading text-2xl font-black text-astro-navy">
                {paymentStatus === 'expired'
                  ? 'Batas waktu habis'
                  : 'Pembayaran gagal'}
              </h2>
              <p className="text-sm leading-relaxed text-ink/75">
                {paymentStatus === 'expired'
                  ? 'Kode QRIS sudah kadaluarsa. Ulangi pendaftaran atau hubungi panitia.'
                  : 'Transaksi dibatalkan di gateway. Kamu bisa mengulang pembayaran dari formulir.'}
              </p>
              <CtaButton onClick={onBack} size="lg" className="w-full" showChevron={false}>
                Ulangi pendaftaran
              </CtaButton>
              {waHref && (
                <Button asChild variant="outline" size="lg" className="w-full rounded-full">
                  <a href={waHref} target="_blank" rel="noopener noreferrer">
                    <MessageCircle data-icon="inline-start" />
                    Hubungi panitia
                  </a>
                </Button>
              )}
            </WindowCard>
          </motion.div>
        ) : (
          <motion.div
            key="payment-flow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4"
          >
            <WindowCard title="Pembayaran" bodyClassName="gap-4">
              <Receipt className="size-8 text-astro-blue" aria-hidden />
              <h2 className="font-heading text-2xl font-black text-astro-navy">
                Selesaikan pembayaran
              </h2>
              <p className="text-sm leading-relaxed text-ink/75">
                Amankan kuotamu di <strong>{competition.title}</strong>.
              </p>

              {paymentCode ? (
                <QrisDisplay
                  paymentCode={paymentCode}
                  paymentCodeType={paymentCodeType}
                  amount={paymentAmount}
                  baseAmount={competition.fee}
                  paymentReference={paymentReference}
                  expiresAt={resolvedExpiresAt}
                  paymentLinkUrl={resolvedLinkUrl}
                />
              ) : resolvedLinkUrl ? (
                <Surface tone="tint" radius="xl" pad="md" className="text-center">
                  <p className="text-xs text-ink/55">Referensi</p>
                  <p className="mt-0.5 break-all font-mono text-sm font-semibold text-astro-navy">
                    {paymentReference}
                  </p>
                  <CtaButton
                    href={resolvedLinkUrl}
                    size="default"
                    className="mt-4 w-full"
                    showChevron={false}
                  >
                    Bayar sekarang
                  </CtaButton>
                </Surface>
              ) : (
                <Surface tone="gold" radius="xl" pad="md">
                  <p className="flex items-center gap-2 text-sm">
                    <AlertCircle className="size-4 shrink-0" aria-hidden />
                    Pendaftaran tercatat. Menunggu konfirmasi gateway.
                  </p>
                </Surface>
              )}

              <p className="flex items-center justify-center gap-2 text-xs text-ink/60">
                <Spinner className="size-3.5 shrink-0" />
                Menunggu pembayaran, halaman berganti otomatis.
              </p>

              <Button variant="ghost" size="sm" onClick={onBack} className="w-full">
                <ArrowLeft data-icon="inline-start" />
                Kembali ke formulir
              </Button>
            </WindowCard>
          </motion.div>
        )}
      </AnimatePresence>

      {printTarget && (
        <PrintPortal>
          <PrintableInvoice data={printTarget} />
        </PrintPortal>
      )}
    </div>
  );
}
