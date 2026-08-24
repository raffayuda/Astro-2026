import { db } from '@/src/db';
import { registrations, competitions } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { CalendarDays, Coins, Mail, Phone, Building2, User, CheckCircle2, XCircle, Tag, Globe } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import PaymentStatusUpdate from './PaymentStatusUpdate';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: XCircle },
  detecting: { label: 'Detecting', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: XCircle },
  paid: { label: 'Lunas', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  failed: { label: 'Gagal', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
};

export const dynamic = 'force-dynamic';

export default async function RegistrationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [reg] = await db
    .select({
      id: registrations.id,
      type: registrations.type,
      fullName: registrations.fullName,
      identityNumber: registrations.identityNumber,
      teamName: registrations.teamName,
      leaderName: registrations.leaderName,
      leaderIdentity: registrations.leaderIdentity,
      leaderPhotoUrl: registrations.leaderPhotoUrl,
      members: registrations.members,
      memberDetails: registrations.memberDetails,
      institution: registrations.institution,
      email: registrations.email,
      whatsapp: registrations.whatsapp,
      paymentStatus: registrations.paymentStatus,
      paymentMethod: registrations.paymentMethod,
      paymentAmount: registrations.paymentAmount,
      paymentReference: registrations.paymentReference,
      createdAt: registrations.createdAt,
      updatedAt: registrations.updatedAt,
      competitionName: competitions.title,
      competitionCategory: competitions.category,
      competitionFee: competitions.fee,
      competitionIsFree: competitions.isFree,
      competitionOrigin: competitions.origin,
    })
    .from(registrations)
    .innerJoin(competitions, eq(registrations.competitionId, competitions.id))
    .where(eq(registrations.id, id));

  if (!reg) {
    notFound();
  }

  const StatusIcon = statusConfig[reg.paymentStatus]?.icon || statusConfig.pending.icon;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Back + Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/registrations"
            className="text-xs font-bold text-slate-500 hover:text-astro-cyan uppercase tracking-wider transition-colors inline-flex items-center gap-1"
          >
            ← Kembali
          </Link>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight mt-2">
            Detail Pendaftaran
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <StatusIcon className={`w-4 h-4 ${statusConfig[reg.paymentStatus]?.color?.split(' ')[1] || 'text-slate-500'}`} />
          <span
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider border ${statusConfig[reg.paymentStatus]?.color || statusConfig.pending.color}`}
            style={{ clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)' }}
          >
            {statusConfig[reg.paymentStatus]?.label || reg.paymentStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity */}
          <div className="bg-white border border-slate-200 relative"
            style={{ clipPath: 'polygon(14px 0, 100% 0, calc(100% - 14px) 100%, 0 100%)' }}
          >
            <div className="absolute -top-[1px] -left-[1px] w-8 h-8 bg-astro-cyan"
              style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
            />
            <div className="p-5 md:p-6 space-y-5">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <User className="w-4 h-4 text-astro-cyan" />
                {reg.type === 'team' ? 'Data Tim' : 'Data Peserta'}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {reg.type === 'team' ? (
                  <>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Tim</span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{reg.teamName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ketua Tim</span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{reg.leaderName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Identitas Ketua</span>
                      <p className="text-sm text-slate-700 mt-0.5">{reg.leaderIdentity}</p>
                    </div>
                    {reg.leaderPhotoUrl && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Foto Ketua</span>
                        <a
                          href={reg.leaderPhotoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 block w-20 overflow-hidden rounded-md border border-slate-200"
                        >
                          <Image
                            src={reg.leaderPhotoUrl}
                            alt={reg.leaderName || 'Foto ketua'}
                            width={80}
                            height={80}
                            className="h-20 w-20 object-cover"
                          />
                        </a>
                      </div>
                    )}
                    {reg.memberDetails?.length ? (
                      <div className="sm:col-span-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Anggota Tim</span>
                        <div className="mt-2 flex flex-wrap gap-3">
                          {reg.memberDetails.map((m, i) => (
                            <div key={`${m.name}-${i}`} className="w-20">
                              {m.photoUrl ? (
                                <a href={m.photoUrl} target="_blank" rel="noreferrer">
                                  <Image
                                    src={m.photoUrl}
                                    alt={m.name}
                                    width={80}
                                    height={80}
                                    className="h-20 w-20 rounded-md border border-slate-200 object-cover"
                                  />
                                </a>
                              ) : (
                                <div className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed border-slate-200 text-[10px] text-slate-400">
                                  Tanpa foto
                                </div>
                              )}
                              <p className="mt-1 text-[11px] leading-tight text-slate-700">{m.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : reg.members ? (
                      <div className="sm:col-span-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Anggota Tim</span>
                        <p className="text-sm text-slate-700 mt-0.5 whitespace-pre-line">{reg.members}</p>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{reg.fullName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nomor Identitas</span>
                      <p className="text-sm text-slate-700 mt-0.5">{reg.identityNumber}</p>
                    </div>
                  </>
                )}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Sekolah / Instansi
                  </span>
                  <p className="text-sm font-medium text-slate-900 mt-0.5">{reg.institution}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white border border-slate-200 relative"
            style={{ clipPath: 'polygon(14px 0, 100% 0, calc(100% - 14px) 100%, 0 100%)' }}
          >
            <div className="p-5 md:p-6 space-y-4">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Kontak</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email
                  </span>
                  <p className="text-sm text-slate-900 mt-0.5">{reg.email}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Phone className="w-3 h-3" /> WhatsApp
                  </span>
                  <p className="text-sm text-slate-900 mt-0.5">{reg.whatsapp}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Competition Info */}
          <div className="bg-white border border-slate-200 relative"
            style={{ clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)' }}
          >
            <div className="p-5 space-y-4">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] flex items-center gap-1">
                <Tag className="w-3 h-3" /> Lomba
              </h3>
              <p className="text-sm font-bold text-slate-900">{reg.competitionName}</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border bg-slate-50 text-slate-600 border-slate-200"
                  style={{ clipPath: 'polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)' }}
                >
                  {reg.competitionCategory}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border bg-sky-50 text-sky-700 border-sky-200"
                  style={{ clipPath: 'polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)' }}
                >
                  <Globe className="w-2.5 h-2.5 mr-1" />
                  {reg.competitionOrigin === 'external' ? 'Eksternal' : 'Internal'}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                  reg.competitionIsFree === '1'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
                  style={{ clipPath: 'polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)' }}
                >
                  {reg.competitionIsFree === '1' ? 'Gratis' : 'Berbayar'}
                </span>
              </div>
              {reg.competitionFee > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Biaya</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    Rp {reg.competitionFee.toLocaleString('id-ID')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white border border-slate-200 relative"
            style={{ clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)' }}
          >
            <div className="p-5 space-y-4">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] flex items-center gap-1">
                <Coins className="w-3 h-3" /> Pembayaran
              </h3>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Referensi</span>
                <p className="text-xs font-mono font-bold text-slate-900 mt-0.5">{reg.paymentReference || '—'}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jumlah</span>
                <p className="text-lg font-black text-astro-cyan mt-0.5">
                  Rp {reg.paymentAmount.toLocaleString('id-ID')}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Metode</span>
                <p className="text-sm text-slate-900 mt-0.5 capitalize">{reg.paymentMethod || '—'}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" /> Didaftarkan
                </span>
                <p className="text-sm text-slate-600 mt-0.5">
                  {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                </p>
              </div>

              {/* Status Update */}
              <PaymentStatusUpdate registrationId={reg.id} currentStatus={reg.paymentStatus} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
