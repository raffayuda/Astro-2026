'use client';

import React, { useState, useEffect, useId } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, Check, ExternalLink, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Props {
  paymentCode: string;
  paymentCodeType?: string | null;
  amount: number;
  paymentReference: string;
  expiresAt?: string | Date | null;
  paymentLinkUrl?: string | null;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export default function QrisDisplay({
  paymentCode,
  amount,
  paymentReference,
  expiresAt,
  paymentLinkUrl,
}: Props) {
  const qrContainerId = useId();
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  // Countdown timer calculation
  useEffect(() => {
    if (!expiresAt) return;
    const target = new Date(expiresAt).getTime();
    if (Number.isNaN(target)) return;

    const updateTimer = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft('Kadaluarsa');
        setIsExpired(true);
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours} jam ${minutes} menit ${seconds} dtk`);
      } else {
        setTimeLeft(`${minutes} menit ${seconds} dtk`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(paymentCode);
      setCopied(true);
      toast.success('Kode QRIS berhasil disalin');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Gagal menyalin kode');
    }
  };

  const handleDownloadQr = () => {
    try {
      const svg = document.getElementById(qrContainerId)?.querySelector('svg');
      if (!svg) {
        toast.error('Gagal mengunduh QR Code');
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const qrImg = new Image();

      qrImg.onload = () => {
        const padding = 36;
        const headerHeight = 100;
        const footerHeight = 50;
        canvas.width = qrImg.width + padding * 2;
        canvas.height = qrImg.height + headerHeight + footerHeight;

        if (ctx) {
          // White background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Top red band
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(0, 0, canvas.width, 6);

          // Header title
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 18px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('ASTRO 2026 • QRIS', canvas.width / 2, 38);

          ctx.fillStyle = '#0284c7';
          ctx.font = 'bold 22px sans-serif';
          ctx.fillText(formatCurrency(amount), canvas.width / 2, 68);

          ctx.fillStyle = '#64748b';
          ctx.font = '11px monospace';
          ctx.fillText(`Ref: ${paymentReference}`, canvas.width / 2, 88);

          // Draw QR Code
          const qrX = padding;
          const qrY = headerHeight;
          ctx.drawImage(qrImg, qrX, qrY);

          // Draw logo in center of QR
          const logo = new Image();
          logo.crossOrigin = 'anonymous';
          const drawFooterAndDownload = () => {
            // Footer
            ctx.fillStyle = '#64748b';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Scan dengan aplikasi m-Banking atau e-Wallet apa saja', canvas.width / 2, canvas.height - 20);

            const pngFile = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.download = `QRIS-ASTRO-${paymentReference}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
            toast.success('QRIS berhasil diunduh');
          };

          logo.onload = () => {
            const logoW = 48;
            const logoH = 35;
            const logoX = qrX + (qrImg.width - logoW) / 2;
            const logoY = qrY + (qrImg.height - logoH) / 2;
            ctx.drawImage(logo, logoX, logoY, logoW, logoH);
            drawFooterAndDownload();
          };
          logo.onerror = () => {
            drawFooterAndDownload();
          };
          logo.src = '/assets/logo-astro.png';
        }
      };

      qrImg.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengunduh gambar QRIS');
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-3">
      {/* ─── CARD CONTAINER ─── */}
      <div
        id={qrContainerId}
        className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm text-center space-y-5"
      >
        {/* Header: Astro 2026 & Ref */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs font-semibold text-slate-500">
          <span className="text-slate-900 font-bold uppercase tracking-wider">Astro 2026</span>
          <span className="font-mono text-[11px] text-slate-400">{paymentReference}</span>
        </div>

        {/* Total Pembayaran */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Pembayaran
          </span>
          <div className="text-3xl font-black text-slate-950 tracking-tight">
            {formatCurrency(amount)}
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-3">
          <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-xs inline-block">
            <QRCodeSVG
              value={paymentCode}
              size={220}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: '/assets/logo-astro.png',
                height: 36,
                width: 48,
                excavate: true,
              }}
              className="rounded-lg"
            />
          </div>

          {/* Sisa Waktu */}
          {expiresAt && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
              <Clock className="size-3.5 text-amber-600" />
              <span>Sisa waktu:</span>
              <span className={`font-mono font-bold ${isExpired ? 'text-rose-600' : 'text-slate-800'}`}>
                {timeLeft || 'Memuat...'}
              </span>
            </div>
          )}
        </div>

        {/* Primary Action Button */}
        <div className="space-y-2 pt-1">
          <Button
            type="button"
            size="lg"
            onClick={handleDownloadQr}
            className="w-full text-xs font-bold uppercase tracking-wider gap-2 shadow-sm active:scale-95"
          >
            <Download className="size-4" /> Unduh Gambar QR
          </Button>
        </div>

        {/* Subtext 1 baris */}
        <div className="pt-2 border-t border-slate-100">
          <p className="text-[11px] text-slate-400">
            Scan dengan aplikasi m-Banking atau e-Wallet apa saja
          </p>
        </div>
      </div>

      {/* Fallback checkout link if available */}
      {paymentLinkUrl && (
        <div className="text-center pt-0.5">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-[11px] text-slate-400 hover:text-cyan-700 hover:bg-transparent h-auto py-1"
          >
            <a href={paymentLinkUrl} target="_blank" rel="noopener noreferrer">
              Kendala scan? Buka Halaman Checkout <ExternalLink className="size-3 ml-1" />
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
