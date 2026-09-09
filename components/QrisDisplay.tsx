'use client';

import { Clock, Download, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import React, { useEffect, useId, useState } from 'react';
import { toast } from 'sonner';
import { Pill } from '@/components/brand/Pill';
import { Surface } from '@/components/brand/Surface';
import { Button } from '@/components/ui/button';

interface Props {
  paymentCode: string;
  /** Gateway's marker for what kind of code `paymentCode` holds, e.g. `QR_TEXT`. */
  paymentCodeType?: string | null;
  amount: number;
  /**
   * Registration fee before the gateway's fee. When the gateway passes its fee
   * on to the payer, `amount` exceeds this and the difference is shown, so this
   * screen does not appear to contradict the fee quoted on the summary card.
   */
  baseAmount?: number | null;
  paymentReference: string;
  expiresAt?: string | Date | null;
  paymentLinkUrl?: string | null;
}

const QR_SIZE = 208;

/** Brand tokens, duplicated as literals for the canvas export below. */
const EXPORT_COLORS = {
  navy: '#1E3A8A',
  blue: '#3B82F6',
  ink: '#1F2937',
  white: '#FFFFFF',
} as const;

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

/**
 * Countdown copy. Seconds are dropped above an hour: at that range they are
 * noise, and the label is calmer without a digit changing every tick.
 */
function formatTimeLeft(msLeft: number) {
  const hours = Math.floor(msLeft / 3_600_000);
  const minutes = Math.floor((msLeft % 3_600_000) / 60_000);
  const seconds = Math.floor((msLeft % 60_000) / 1000);
  if (hours > 0) return `${hours} jam ${minutes} menit`;
  if (minutes > 0) return `${minutes} menit ${seconds} dtk`;
  return `${seconds} dtk`;
}

export default function QrisDisplay({
  paymentCode,
  paymentCodeType,
  amount,
  baseAmount,
  paymentReference,
  expiresAt,
  paymentLinkUrl,
}: Props) {
  // `QR_TEXT` is the only type the gateway has returned so far; anything else
  // is surfaced verbatim rather than mislabelled as QRIS.
  const schemeLabel = !paymentCodeType || paymentCodeType === 'QR_TEXT' ? 'QRIS' : paymentCodeType;

  const serviceFee = baseAmount && baseAmount > 0 ? amount - baseAmount : 0;

  const qrContainerId = useId();
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;
    const target = new Date(expiresAt).getTime();
    if (Number.isNaN(target)) return;

    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft('Kadaluarsa');
        setIsExpired(true);
        return;
      }
      setTimeLeft(formatTimeLeft(diff));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  /**
   * Flatten the rendered QR into a branded PNG so participants can save it or
   * send it to whoever is paying. Drawn on a canvas rather than screenshotting
   * the DOM so the export carries its own header and stays legible.
   */
  const handleDownloadQr = () => {
    const svg = document.getElementById(qrContainerId)?.querySelector('svg');
    if (!svg) {
      toast.error('Gagal mengunduh gambar QR');
      return;
    }

    const blob = new Blob([new XMLSerializer().serializeToString(svg)], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const qrImg = new Image();

    qrImg.onload = () => {
      URL.revokeObjectURL(url);
      const pad = 40;
      const header = 104;
      const footer = 52;
      const canvas = document.createElement('canvas');
      canvas.width = qrImg.width + pad * 2;
      canvas.height = qrImg.height + header + footer;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        toast.error('Gagal mengunduh gambar QR');
        return;
      }

      ctx.fillStyle = EXPORT_COLORS.white;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = EXPORT_COLORS.navy;
      ctx.fillRect(0, 0, canvas.width, 8);

      ctx.textAlign = 'center';
      ctx.fillStyle = EXPORT_COLORS.navy;
      ctx.font = 'bold 17px sans-serif';
      ctx.fillText(`ASTRO 2026 · ${schemeLabel}`, canvas.width / 2, 44);

      ctx.fillStyle = EXPORT_COLORS.blue;
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(formatCurrency(amount), canvas.width / 2, 78);

      ctx.fillStyle = EXPORT_COLORS.ink;
      ctx.font = '11px monospace';
      ctx.fillText(paymentReference, canvas.width / 2, 96);

      ctx.drawImage(qrImg, pad, header);

      const save = () => {
        ctx.fillStyle = EXPORT_COLORS.ink;
        ctx.font = '11px sans-serif';
        ctx.fillText(
          'Scan pakai m-Banking atau e-Wallet apa saja',
          canvas.width / 2,
          canvas.height - 22,
        );

        const link = document.createElement('a');
        link.download = `QRIS-ASTRO-${paymentReference}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast.success('Gambar QR tersimpan');
      };

      // The SVG's embedded logo does not always survive serialisation, so the
      // mark is redrawn here. A missing logo must not block the download.
      const logo = new Image();
      const logoW = 48;
      const logoH = 35;
      logo.onload = () => {
        ctx.drawImage(
          logo,
          pad + (qrImg.width - logoW) / 2,
          header + (qrImg.height - logoH) / 2,
          logoW,
          logoH,
        );
        save();
      };
      logo.onerror = save;
      logo.src = '/assets/logo-astro.png';
    };

    qrImg.onerror = () => {
      URL.revokeObjectURL(url);
      toast.error('Gagal mengunduh gambar QR');
    };
    qrImg.src = url;
  };

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <Surface
        tone="tint"
        radius="2xl"
        pad="md"
        className="flex w-full max-w-sm flex-col items-center gap-4 text-center"
      >
        <div>
          <p className="text-11 font-bold uppercase tracking-wider text-ink/60">
            Total pembayaran
          </p>
          <p className="font-heading text-3xl font-black tracking-tight text-astro-navy">
            {formatCurrency(amount)}
          </p>
          {serviceFee > 0 && (
            <p className="text-11 text-ink/60">
              Termasuk biaya layanan {formatCurrency(serviceFee)}
            </p>
          )}
          <p className="mt-1 font-mono text-11 text-ink/55">{paymentReference}</p>
        </div>

        <div id={qrContainerId} className="rounded-xl bg-white p-3 shadow-soft-sm">
          <QRCodeSVG
            value={paymentCode}
            size={QR_SIZE}
            level="H"
            marginSize={4}
            title={`${schemeLabel} pembayaran ${formatCurrency(amount)}`}
            imageSettings={{
              src: '/assets/logo-astro.png',
              height: 35,
              width: 48,
              excavate: true,
            }}
          />
        </div>

        {expiresAt && timeLeft && (
          <Pill tone={isExpired ? 'pink' : 'gold'} size="sm" className="normal-case tracking-normal">
            <Clock aria-hidden />
            {isExpired ? 'Kadaluarsa' : `Berlaku ${timeLeft} lagi`}
          </Pill>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={handleDownloadQr}
          className="w-full rounded-full"
        >
          <Download data-icon="inline-start" />
          Unduh gambar QR
        </Button>

        <p className="text-11 leading-relaxed text-ink/60">
          Scan pakai m-Banking atau e-Wallet apa saja
        </p>
      </Surface>

      {paymentLinkUrl && (
        <a
          href={paymentLinkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-11 font-semibold text-ink/60 transition-colors hover:text-astro-navy"
        >
          Kendala scan? Buka halaman checkout
          <ExternalLink className="size-3" aria-hidden />
        </a>
      )}
    </div>
  );
}
