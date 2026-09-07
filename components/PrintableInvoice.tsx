'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { CheckCircle2, Clock, XCircle, ShieldCheck, QrCode } from 'lucide-react';

export interface PrintableInvoiceData {
  id: string;
  paymentReference?: string | null;
  paymentStatus: string;
  paymentMethod?: string | null;
  paymentAmount: number;
  batchName?: string | null;
  type: 'individual' | 'team' | string;
  fullName?: string | null;
  teamName?: string | null;
  leaderName?: string | null;
  institution: string;
  email: string;
  whatsapp: string;
  members?: string | null;
  memberDetails?: { name: string; photoUrl?: string | null }[] | null;
  customFields?: Record<string, any> | null;
  competitionName: string;
  competitionCategory?: string | null;
  competitionContactName?: string | null;
  competitionContactWhatsapp?: string | null;
  createdAt?: string | Date | null;
}

interface Props {
  data: PrintableInvoiceData;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string | Date | null | undefined) {
  if (!date) return '—';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCustomFieldKey(key: string) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * PrintPortal attaches directly to `document.body` under `#astro-print-portal`.
 * When window.print() is called, app/globals.css hides all other body children
 * and reveals only this portal, ensuring zero layout clipping or blank screens.
 */
export function PrintPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === 'undefined') return null;

  let portalEl = document.getElementById('astro-print-portal');
  if (!portalEl) {
    portalEl = document.createElement('div');
    portalEl.id = 'astro-print-portal';
    document.body.appendChild(portalEl);
  }

  return createPortal(children, portalEl);
}

export default function PrintableInvoice({ data }: Props) {
  const isPaid = data.paymentStatus === 'paid';
  const isPending = data.paymentStatus === 'pending';

  const participantTitle =
    data.type === 'team'
      ? data.teamName || 'Nama Tim'
      : data.fullName || data.leaderName || 'Nama Peserta';

  return (
    <div
      id="printable-invoice-content"
      className="mx-auto w-full max-w-3xl bg-white text-slate-900 font-sans p-6 sm:p-10 border border-slate-200 rounded-xl shadow-xs print:border-none print:p-2 print:shadow-none"
      style={{ boxSizing: 'border-box' }}
    >
      {/* ─── HEADER INVOICE ─── */}
      <div className="flex flex-row items-center justify-between pb-5 border-b-2 border-slate-900 gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative size-14 shrink-0 rounded-lg bg-slate-950 p-2 flex items-center justify-center">
            <Image
              src="/assets/logo-astro.png"
              alt="ASTRO 2026"
              width={48}
              height={48}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-950 leading-none">
              ASTRO 2026
            </h1>
            <p className="text-11 font-bold text-cyan-700 uppercase tracking-widest mt-1">
              ajang kompetisi dan kreativitas bergengsi
            </p>
            <p className="text-10 text-slate-600">
              BEM STT Terpadu Nurul Fikri • Depok, Indonesia
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-block bg-slate-900 text-white text-10 font-black uppercase px-2.5 py-0.5 tracking-widest rounded-xs mb-1">
            BUKTI PENDAFTARAN RESMI
          </span>
          <p className="font-mono text-sm font-black text-slate-900">
            {data.paymentReference || 'INV-ASTRO-2026'}
          </p>
          <p className="text-11 text-slate-600">
            Terbit: {formatDate(data.createdAt || new Date())}
          </p>
        </div>
      </div>

      {/* ─── STATUS STAMP BAR ─── */}
      <div className="my-4 p-3.5 rounded-lg flex flex-row items-center justify-between gap-3 border border-slate-200 bg-slate-50">
        <div className="flex items-center gap-3">
          {isPaid ? (
            <div className="size-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-5" />
            </div>
          ) : isPending ? (
            <div className="size-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="size-5" />
            </div>
          ) : (
            <div className="size-9 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <XCircle className="size-5" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-11 font-black uppercase tracking-wider px-2 py-0.5 rounded-xs ${
                  isPaid
                    ? 'bg-emerald-600 text-white'
                    : isPending
                    ? 'bg-amber-500 text-white'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {isPaid ? 'LUNAS / VERIFIED' : isPending ? 'MENUNGGU PEMBAYARAN' : 'GAGAL / EXPIRED'}
              </span>
              {data.paymentMethod && (
                <span className="text-11 font-mono font-bold text-slate-600 uppercase">
                  • Metode: {data.paymentMethod}
                </span>
              )}
            </div>
            <p className="text-10 text-slate-600 mt-0.5">
              {isPaid
                ? 'Pembayaran telah terverifikasi secara otomatis oleh Payment Gateway ASTRO 2026.'
                : isPending
                ? 'Harap selesaikan pembayaran sebelum batas waktu berakhir untuk mengamankan kuota lomba.'
                : 'Transaksi tidak berhasil atau waktu pembayaran telah kedaluwarsa.'}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-10 font-bold text-slate-600 uppercase tracking-wider block">
            Total Biaya
          </span>
          <span className="text-base font-black text-slate-950">
            {data.paymentAmount > 0 ? formatCurrency(data.paymentAmount) : 'GRATIS'}
          </span>
        </div>
      </div>

      {/* ─── DATA PESERTA & KOMPETISI GRID ─── */}
      <div className="grid grid-cols-2 gap-4 my-4">
        {/* Kolom Kiri: Identitas Peserta */}
        <div className="border border-slate-200 rounded-lg p-3.5 bg-white">
          <h2 className="text-10 font-black uppercase tracking-wider text-cyan-800 pb-1.5 border-b border-slate-100 flex items-center justify-between">
            <span>Identitas Pendaftar</span>
            <span className="text-9 text-slate-600 font-normal">
              Kategori: {data.type === 'team' ? 'Tim' : 'Individu'}
            </span>
          </h2>
          <dl className="mt-2.5 space-y-1.5 text-xs">
            <div>
              <dt className="text-9 text-slate-600 uppercase font-semibold">
                {data.type === 'team' ? 'Nama Tim' : 'Nama Lengkap'}
              </dt>
              <dd className="font-bold text-slate-900 text-sm mt-0.5">
                {participantTitle}
              </dd>
            </div>

            {data.type === 'team' && data.leaderName && (
              <div>
                <dt className="text-9 text-slate-600 uppercase font-semibold">
                  Ketua Tim
                </dt>
                <dd className="font-medium text-slate-800 mt-0.5">
                  {data.leaderName}
                </dd>
              </div>
            )}

            <div>
              <dt className="text-9 text-slate-600 uppercase font-semibold">
                Asal Instansi / Sekolah / Kampus
              </dt>
              <dd className="font-semibold text-slate-800 mt-0.5">
                {data.institution || '—'}
              </dd>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <div>
                <dt className="text-9 text-slate-600 uppercase font-semibold">Email</dt>
                <dd className="font-medium text-slate-800 truncate mt-0.5">
                  {data.email}
                </dd>
              </div>
              <div>
                <dt className="text-9 text-slate-600 uppercase font-semibold">WhatsApp</dt>
                <dd className="font-mono font-medium text-slate-800 mt-0.5">
                  {data.whatsapp}
                </dd>
              </div>
            </div>
          </dl>
        </div>

        {/* Kolom Kanan: Rincian Kompetisi */}
        <div className="border border-slate-200 rounded-lg p-3.5 bg-white">
          <h2 className="text-10 font-black uppercase tracking-wider text-cyan-800 pb-1.5 border-b border-slate-100 flex items-center justify-between">
            <span>Kompetisi Terdaftar</span>
            <span className="text-9 font-mono text-slate-600 uppercase">
              Ref: {data.id.slice(0, 8)}
            </span>
          </h2>
          <dl className="mt-2.5 space-y-1.5 text-xs">
            <div>
              <dt className="text-9 text-slate-600 uppercase font-semibold">Nama Lomba</dt>
              <dd className="font-black text-slate-900 text-sm mt-0.5">
                {data.competitionName}
              </dd>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <dt className="text-9 text-slate-600 uppercase font-semibold">Kategori Bidang</dt>
                <dd className="font-bold text-slate-800 uppercase mt-0.5">
                  {data.competitionCategory || 'Umum'}
                </dd>
              </div>
              <div>
                <dt className="text-9 text-slate-600 uppercase font-semibold">Gelombang</dt>
                <dd className="font-bold text-cyan-700 uppercase mt-0.5">
                  {data.batchName || 'Reguler'}
                </dd>
              </div>
            </div>

            {data.competitionContactName && (
              <div className="pt-1.5 border-t border-slate-100">
                <dt className="text-9 text-slate-600 uppercase font-semibold">Contact Person Panitia</dt>
                <dd className="text-slate-800 font-medium mt-0.5">
                  {data.competitionContactName}{' '}
                  {data.competitionContactWhatsapp && (
                    <span className="font-mono text-slate-600 text-10">
                      ({data.competitionContactWhatsapp})
                    </span>
                  )}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* ─── ANGGOTA TIM (JIKA KATEGORI TIM) ─── */}
      {data.type === 'team' &&
        data.memberDetails &&
        data.memberDetails.length > 0 && (
          <div className="my-4 border border-slate-200 rounded-lg p-3.5 bg-white">
            <h3 className="text-10 font-black uppercase tracking-wider text-slate-900 pb-1.5 border-b border-slate-100">
              Susunan Anggota Tim ({data.memberDetails.length} Pemain)
            </h3>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {data.memberDetails.map((m, idx) => (
                <div
                  key={idx}
                  className="p-1.5 bg-slate-50 border border-slate-100 rounded text-xs flex items-center gap-2"
                >
                  <span className="size-4 rounded-full bg-slate-200 text-slate-700 font-bold text-9 flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-slate-800 truncate text-11">
                    {m.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* ─── DATA TAMBAHAN / CUSTOM FIELDS (JIKA ADA) ─── */}
      {data.customFields &&
        Object.keys(data.customFields).length > 0 && (
          <div className="my-4 border border-slate-200 rounded-lg p-3.5 bg-white">
            <h3 className="text-10 font-black uppercase tracking-wider text-slate-900 pb-1.5 border-b border-slate-100">
              Data Khusus & Persyaratan Lomba
            </h3>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              {Object.entries(data.customFields).map(([key, val]) => {
                const isUrl = typeof val === 'string' && val.startsWith('http');
                return (
                  <div key={key} className="p-2 rounded bg-slate-50 border border-slate-100">
                    <span className="text-9 font-bold uppercase text-slate-600 block">
                      {formatCustomFieldKey(key)}
                    </span>
                    {isUrl ? (
                      <span className="text-cyan-700 font-semibold text-10 inline-flex items-center gap-1 mt-0.5">
                        ✓ Berkas Terunggah (Valid)
                      </span>
                    ) : (
                      <span className="font-bold text-slate-900 text-xs block mt-0.5">
                        {String(val || '—')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      {/* ─── TABEL RINCIAN TRANSAKSI ─── */}
      <div className="my-4 border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white uppercase text-10 font-black tracking-wider">
              <th className="py-2 px-3.5">Deskripsi Registrasi</th>
              <th className="py-2 px-3.5 text-center">Tipe</th>
              <th className="py-2 px-3.5 text-right">Biaya</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            <tr>
              <td className="py-2.5 px-3.5">
                <p className="font-bold text-slate-900">
                  {data.competitionName}
                </p>
                <p className="text-10 text-slate-600">
                  Gelombang: {data.batchName || 'Reguler'} • Ref: {data.paymentReference}
                </p>
              </td>
              <td className="py-2.5 px-3.5 text-center font-medium text-slate-700 uppercase text-10">
                {data.type === 'team' ? 'Tim' : 'Individu'}
              </td>
              <td className="py-2.5 px-3.5 text-right font-mono font-bold text-slate-900">
                {data.paymentAmount > 0 ? formatCurrency(data.paymentAmount) : 'Rp 0'}
              </td>
            </tr>
            <tr className="bg-slate-50/80 font-bold">
              <td colSpan={2} className="py-2 px-3.5 text-slate-700 uppercase text-10">
                Total Pembayaran
              </td>
              <td className="py-2 px-3.5 text-right font-mono text-sm font-black text-slate-950">
                {data.paymentAmount > 0 ? formatCurrency(data.paymentAmount) : 'Rp 0 (GRATIS)'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ─── FOOTER RESMI & DISCLAIMER ─── */}
      <div className="pt-3 border-t border-slate-200 flex flex-row items-center justify-between gap-4 text-10 text-slate-600">
        <div className="space-y-0.5 max-w-md">
          <p className="font-bold text-slate-800 flex items-center gap-1 text-11">
            <ShieldCheck className="size-3.5 text-emerald-600" /> Dokumen Otentik Terverifikasi Sistem ASTRO
          </p>
          <p className="text-9 leading-relaxed text-slate-600">
            Bukti pendaftaran resmi diterbitkan oleh Panitia ASTRO 2026. Tunjukkan bukti ini saat verifikasi dan registrasi ulang lomba.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="text-right">
            <span className="text-8 font-mono text-slate-600 uppercase block">
              Kode Verifikasi
            </span>
            <span className="font-mono text-11 font-bold text-slate-900">
              {data.paymentReference?.replace('INV-', '') || data.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <div className="size-11 border border-slate-300 rounded p-1 flex items-center justify-center bg-slate-50 text-slate-700">
            <QrCode className="size-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
