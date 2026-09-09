import { db } from '@/src/db';
import { registrations, competitions } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Coins,
  ExternalLink,
  FileText,
  Globe,
  Mail,
  Phone,
  Tag,
  User,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DetailItem, SectionCard } from '@/components/dashboard';
import { asStringRecord } from '@/lib/flags';
import { isSafeUrl, safeHref } from '@/lib/urls';
import { cn } from '@/lib/utils';
import PaymentStatusUpdate from './PaymentStatusUpdate';
import RegistrationDetailActions from './RegistrationDetailActions';

const statusConfig: Record<
  string,
  { label: string; color: string; icon: LucideIcon }
> = {
  pending: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: XCircle },
  detecting: { label: 'Detecting', color: 'bg-sky-bottom text-astro-navy border-astro-cyan-2', icon: XCircle },
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
      leaderGameId: registrations.leaderGameId,
      leaderPhotoUrl: registrations.leaderPhotoUrl,
      members: registrations.members,
      memberDetails: registrations.memberDetails,
      institution: registrations.institution,
      email: registrations.email,
      whatsapp: registrations.whatsapp,
      customFields: registrations.customFields,
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
      competitionCustomFields: competitions.customFields,
    })
    .from(registrations)
    .innerJoin(competitions, eq(registrations.competitionId, competitions.id))
    .where(eq(registrations.id, id));

  if (!reg) {
    notFound();
  }

  const status = statusConfig[reg.paymentStatus] ?? statusConfig.pending;
  const StatusIcon = status.icon;
  const customFields = asStringRecord(reg.customFields);
  const customFieldDefs = Array.isArray(reg.competitionCustomFields)
    ? (reg.competitionCustomFields as { id: string; label?: string }[])
    : [];

  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >
            <Link href="/dashboard/registrations">
              <ArrowLeft className="size-3.5" /> Kembali
            </Link>
          </Button>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">
            Detail Pendaftaran
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant="outline"
            className={cn(
              'gap-1.5 rounded-md border text-10 font-bold uppercase tracking-wider',
              status.color,
            )}
          >
            <StatusIcon className="size-3.5" />
            {status.label}
          </Badge>

          <RegistrationDetailActions
            registration={{
              id: reg.id,
              paymentReference: reg.paymentReference || reg.id.slice(0, 8),
              paymentStatus: reg.paymentStatus,
              paymentMethod: reg.paymentMethod,
              paymentAmount: reg.paymentAmount || 0,
              type: reg.type,
              fullName: reg.fullName,
              teamName: reg.teamName,
              leaderName: reg.leaderName,
              institution: reg.institution || '—',
              email: reg.email,
              whatsapp: reg.whatsapp,
              members: reg.members,
              memberDetails: reg.memberDetails,
              customFields,
              competitionName: reg.competitionName,
              competitionCategory: reg.competitionCategory,
              createdAt: reg.createdAt,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard
            icon={<User className="size-4 text-primary" />}
            title={reg.type === 'team' ? 'Data Tim' : 'Data Peserta'}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {reg.type === 'team' ? (
                <>
                  <DetailItem label="Nama Tim">{reg.teamName}</DetailItem>
                  <DetailItem label="Ketua Tim">{reg.leaderName}</DetailItem>
                  <DetailItem label="Identitas Ketua">{reg.leaderIdentity}</DetailItem>
                  {reg.leaderGameId && (
                    <DetailItem label="ID Akun Ketua">
                      <code className="font-mono text-xs font-bold">
                        {reg.leaderGameId}
                      </code>
                    </DetailItem>
                  )}
                  {isSafeUrl(reg.leaderPhotoUrl) && (
                    <DetailItem label="Foto Ketua">
                      <a
                        href={safeHref(reg.leaderPhotoUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 block w-20 overflow-hidden rounded-md border border-border"
                      >
                        <Image
                          src={reg.leaderPhotoUrl}
                          alt={reg.leaderName || 'Foto ketua'}
                          width={80}
                          height={80}
                          className="size-20 object-cover"
                        />
                      </a>
                    </DetailItem>
                  )}
                  {reg.memberDetails?.length ? (
                    <DetailItem label="Anggota Tim" className="sm:col-span-2">
                      <div className="mt-2 flex flex-wrap gap-3">
                        {reg.memberDetails.map((m, i) => (
                          <div key={`${m.name}-${i}`} className="w-20">
                            {isSafeUrl(m.photoUrl) ? (
                              <a
                                href={safeHref(m.photoUrl)}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <Image
                                  src={m.photoUrl}
                                  alt={m.name}
                                  width={80}
                                  height={80}
                                  className="size-20 rounded-md border border-border object-cover"
                                />
                              </a>
                            ) : (
                              <div className="flex size-20 items-center justify-center rounded-md border border-dashed border-border text-10 text-muted-foreground">
                                Tanpa foto
                              </div>
                            )}
                            <p className="mt-1 text-11 font-semibold leading-tight text-foreground">
                              {m.name}
                            </p>
                            {m.gameId && (
                              <p className="text-10 leading-tight text-muted-foreground">
                                ID: <code className="font-mono">{m.gameId}</code>
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </DetailItem>
                  ) : reg.members ? (
                    <DetailItem label="Anggota Tim" className="sm:col-span-2">
                      <span className="whitespace-pre-line">{reg.members}</span>
                    </DetailItem>
                  ) : null}
                </>
              ) : (
                <>
                  <DetailItem label="Nama Lengkap">{reg.fullName}</DetailItem>
                  <DetailItem label="Nomor Identitas">{reg.identityNumber}</DetailItem>
                  {reg.leaderGameId && (
                    <DetailItem label="ID Akun Pemain">
                      <code className="font-mono text-xs font-bold">
                        {reg.leaderGameId}
                      </code>
                    </DetailItem>
                  )}
                </>
              )}
              <DetailItem
                label="Sekolah / Instansi"
                icon={<Building2 className="size-3" />}
              >
                {reg.institution}
              </DetailItem>
            </div>
          </SectionCard>

          {Object.keys(customFields).length > 0 && (
            <SectionCard
              icon={<FileText className="size-4 text-primary" />}
              title="Berkas & Data Khusus Lomba"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Object.entries(customFields).map(([key, val]) => {
                  const label =
                    customFieldDefs.find((f) => f.id === key)?.label || key;
                  // Only a safe http(s) target is treated as a viewable file.
                  const isImg = isSafeUrl(val);

                  if (!isImg) {
                    return (
                      <DetailItem key={key} label={label}>
                        <span className="whitespace-pre-line">{val || '-'}</span>
                      </DetailItem>
                    );
                  }

                  return (
                    <DetailItem key={key} label={label} className="sm:col-span-2">
                      <div className="mt-1.5 flex items-center gap-3">
                        <a
                          href={safeHref(val)}
                          target="_blank"
                          rel="noreferrer"
                          className="relative block size-24 shrink-0 overflow-hidden rounded-md border border-border bg-muted transition-opacity hover:opacity-90"
                        >
                          <Image src={val} alt={label} fill sizes="96px" className="object-cover" />
                        </a>
                        <div className="space-y-1">
                          <a
                            href={safeHref(val)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                          >
                            <ExternalLink className="size-3.5" />
                            Buka berkas ukuran penuh
                          </a>
                          <p className="text-11 font-normal text-muted-foreground">
                            Berkas diunggah oleh pendaftar saat registrasi
                          </p>
                        </div>
                      </div>
                    </DetailItem>
                  );
                })}
              </div>
            </SectionCard>
          )}

          <SectionCard title="Kontak">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailItem label="Email" icon={<Mail className="size-3" />}>
                {reg.email}
              </DetailItem>
              <DetailItem label="WhatsApp" icon={<Phone className="size-3" />}>
                {reg.whatsapp}
              </DetailItem>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard icon={<Tag className="size-4 text-primary" />} title="Lomba">
            <div className="space-y-4">
              <p className="text-sm font-bold text-foreground">{reg.competitionName}</p>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-9 font-bold uppercase tracking-wider">
                  {reg.competitionCategory}
                </Badge>
                <Badge
                  variant="outline"
                  className="gap-1 border-astro-cyan-2 bg-sky-bottom text-9 font-bold uppercase tracking-wider text-astro-navy"
                >
                  <Globe className="size-2.5" />
                  {reg.competitionOrigin === 'external' ? 'Eksternal' : 'Internal'}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-9 font-bold uppercase tracking-wider',
                    reg.competitionIsFree === '1'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-amber-200 bg-amber-50 text-amber-700',
                  )}
                >
                  {reg.competitionIsFree === '1' ? 'Gratis' : 'Berbayar'}
                </Badge>
              </div>
              {reg.competitionFee > 0 && (
                <div className="border-t border-border pt-3">
                  <DetailItem label="Biaya">
                    <span className="font-bold">
                      Rp {reg.competitionFee.toLocaleString('id-ID')}
                    </span>
                  </DetailItem>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard
            icon={<Coins className="size-4 text-primary" />}
            title="Pembayaran"
            bodyClassName="space-y-4"
          >
            <DetailItem label="Referensi">
              <code className="font-mono text-xs font-bold">
                {reg.paymentReference || '—'}
              </code>
            </DetailItem>
            <DetailItem label="Jumlah">
              <span className="text-lg font-black text-primary">
                Rp {reg.paymentAmount.toLocaleString('id-ID')}
              </span>
            </DetailItem>
            <DetailItem label="Metode">
              <span className="capitalize">{reg.paymentMethod || '—'}</span>
            </DetailItem>
            <DetailItem label="Didaftarkan" icon={<CalendarDays className="size-3" />}>
              {reg.createdAt
                ? new Date(reg.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '—'}
            </DetailItem>

            <PaymentStatusUpdate
              registrationId={reg.id}
              currentStatus={reg.paymentStatus}
            />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
