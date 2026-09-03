'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, MessageCircle, Copy, Check } from 'lucide-react';
import { ResponsiveModal } from '@/components/responsive-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import type { Competition } from '@/types/astro';
import { apiHelpers } from '@/src/lib/api';

interface Props {
  competition: Competition | null;
  onClose: () => void;
}

const bankInfo = {
  bankName: 'Bank Central Asia (BCA)',
  accountNumber: '1234567890',
  accountHolder: 'Panitia ASTRO 2026',
};

export default function RegistrationModal({ competition, onClose }: Props) {
  const [formData, setFormData] = useState({
    fullName: '',
    teamName: '',
    institution: '',
    identityNumber: '',
    leaderName: '',
    leaderIdentity: '',
    email: '',
    whatsapp: '',
    members: '',
  });
  const [regType, setRegType] = useState<'team' | 'individual'>('individual');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (competition) {
      setFormData({
        fullName: '',
        teamName: '',
        institution: '',
        identityNumber: '',
        leaderName: '',
        leaderIdentity: '',
        email: '',
        whatsapp: '',
        members: '',
      });
      setRegType(competition.type === 'team' ? 'team' : 'individual');
      setErrors({});
      setIsSuccess(false);
      setLoading(false);
      setCopied(false);
    }
  }, [competition]);

  if (!competition) return null;

  const canChooseType = competition.type === 'both';
  const isTeam = canChooseType ? regType === 'team' : competition.type === 'team';

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (isTeam) {
      if (!formData.teamName.trim()) newErrors.teamName = 'Nama tim wajib diisi';
      if (!formData.leaderName.trim()) newErrors.leaderName = 'Nama ketua wajib diisi';
      if (!formData.leaderIdentity.trim()) newErrors.leaderIdentity = 'Nomor identitas ketua wajib diisi';
      const memberCount = formData.members ? formData.members.split('\n').filter(Boolean).length : 0;
      const minMembers = (competition as any).minTeamMembers || 1;
      if (memberCount < minMembers) newErrors.members = `Minimal ${minMembers} anggota wajib diisi`;
    } else {
      if (!formData.fullName.trim()) newErrors.fullName = 'Nama lengkap wajib diisi';
      if (!formData.identityNumber.trim()) newErrors.identityNumber = 'Nomor identitas wajib diisi';
    }

    if (!formData.institution.trim()) newErrors.institution = 'Nama sekolah/instansi wajib diisi';

    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'Nomor WhatsApp wajib diisi';
    } else if (formData.whatsapp.trim().length < 9) {
      newErrors.whatsapp = 'Nomor WhatsApp tidak valid (minimal 9 digit)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      await apiHelpers.registrations.create({
        competitionId: competition.id,
        type: regType,
        fullName: formData.fullName || null,
        identityNumber: formData.identityNumber || null,
        teamName: formData.teamName || null,
        leaderName: formData.leaderName || null,
        leaderIdentity: formData.leaderIdentity || null,
        members: formData.members || null,
        institution: formData.institution,
        email: formData.email,
        whatsapp: formData.whatsapp,
      });

      setLoading(false);
      setIsSuccess(true);
    } catch {
      setLoading(false);
      alert('Gagal mengirim pendaftaran. Silakan coba lagi.');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(bankInfo.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getWhatsAppLink = () => {
    const phone = competition.contactPerson.whatsapp;
    const name = competition.contactPerson.name;
    let message = '';

    if (isTeam) {
      message = `Halo ${name}, saya ingin mengonfirmasi pembayaran pendaftaran ASTRO 2026 untuk lomba: *${competition.title}*.

Detail Pendaftaran:
- Nama Tim: ${formData.teamName}
- Asal Sekolah/Instansi: ${formData.institution}
- Nama Ketua: ${formData.leaderName}
- Email Ketua: ${formData.email}
- Nomor WhatsApp: ${formData.whatsapp}
- Anggota Tim: ${formData.members.split('\n').filter(Boolean).join(', ')}

Terima kasih.`;
    } else {
      message = `Halo ${name}, saya ingin mengonfirmasi pembayaran pendaftaran ASTRO 2026 untuk lomba: *${competition.title}*.

Detail Pendaftaran:
- Nama Lengkap: ${formData.fullName}
- Asal Sekolah/Instansi: ${formData.institution}
- Email: ${formData.email}
- Nomor WhatsApp: ${formData.whatsapp}

Terima kasih.`;
    }

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const update = (key: keyof typeof formData, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const memberCount = competition.maxTeamMembers || 5;
  const membersArr = formData.members ? formData.members.split('\n') : [];

  return (
    <ResponsiveModal
      open={!!competition}
      onOpenChange={(next) => !next && onClose()}
      title="Pendaftaran"
      description={`${competition.title} (${isTeam ? 'Kategori Tim' : 'Kategori Individu'})`}
      titleClassName="text-xl uppercase tracking-tight"
      descriptionClassName="font-bold uppercase tracking-wider text-primary"
      contentClassName="max-w-xl"
    >
      {!isSuccess ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {canChooseType && (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  Pilih Kategori:
                </span>
                <div className="flex overflow-hidden rounded-full border border-border bg-muted/50">
                  {(['individual', 'team'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setRegType(t);
                        setFormData((prev) => ({
                          ...prev,
                          fullName: '',
                          identityNumber: '',
                          teamName: '',
                          leaderName: '',
                          leaderIdentity: '',
                          members: '',
                        }));
                        setErrors({});
                      }}
                      className={`px-4 py-1.5 text-[11px] font-black uppercase tracking-wider transition-colors ${
                        regType === t
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      {t === 'team' ? 'Tim' : 'Individu'}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <FieldGroup className="gap-4">
              {isTeam ? (
                <>
                  <Field data-invalid={!!errors.teamName}>
                    <FieldLabel htmlFor="teamName">Nama Tim</FieldLabel>
                    <Input
                      id="teamName"
                      value={formData.teamName}
                      onChange={(e) => update('teamName', e.target.value)}
                      placeholder="Masukkan nama tim Anda"
                      disabled={loading}
                      aria-invalid={!!errors.teamName}
                    />
                    {errors.teamName && <FieldError>{errors.teamName}</FieldError>}
                  </Field>

                  <Field data-invalid={!!errors.institution}>
                    <FieldLabel htmlFor="institution">Sekolah / Instansi</FieldLabel>
                    <Input
                      id="institution"
                      value={formData.institution}
                      onChange={(e) => update('institution', e.target.value)}
                      placeholder="Asal sekolah atau instansi"
                      disabled={loading}
                      aria-invalid={!!errors.institution}
                    />
                    {errors.institution && <FieldError>{errors.institution}</FieldError>}
                  </Field>

                  <Field data-invalid={!!errors.leaderName}>
                    <FieldLabel htmlFor="leaderName">Nama Ketua Tim</FieldLabel>
                    <Input
                      id="leaderName"
                      value={formData.leaderName}
                      onChange={(e) => update('leaderName', e.target.value)}
                      placeholder="Nama lengkap ketua tim"
                      disabled={loading}
                      aria-invalid={!!errors.leaderName}
                    />
                    {errors.leaderName && <FieldError>{errors.leaderName}</FieldError>}
                  </Field>

                  <Field data-invalid={!!errors.leaderIdentity}>
                    <FieldLabel htmlFor="leaderIdentity">Nomor Identitas Ketua (NIM / Kartu Pelajar)</FieldLabel>
                    <Input
                      id="leaderIdentity"
                      value={formData.leaderIdentity}
                      onChange={(e) => update('leaderIdentity', e.target.value.replace(/\D/g, ''))}
                      placeholder="Nomor identitas ketua"
                      disabled={loading}
                      aria-invalid={!!errors.leaderIdentity}
                    />
                    {errors.leaderIdentity && <FieldError>{errors.leaderIdentity}</FieldError>}
                  </Field>
                </>
              ) : (
                <>
                  <Field data-invalid={!!errors.fullName}>
                    <FieldLabel htmlFor="fullName">Nama Lengkap</FieldLabel>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => update('fullName', e.target.value)}
                      placeholder="Nama lengkap pendaftar"
                      disabled={loading}
                      aria-invalid={!!errors.fullName}
                    />
                    {errors.fullName && <FieldError>{errors.fullName}</FieldError>}
                  </Field>

                  <Field data-invalid={!!errors.identityNumber}>
                    <FieldLabel htmlFor="identityNumber">Nomor Identitas (NIM / Kartu Pelajar)</FieldLabel>
                    <Input
                      id="identityNumber"
                      value={formData.identityNumber}
                      onChange={(e) => update('identityNumber', e.target.value.replace(/\D/g, ''))}
                      placeholder="Nomor identitas pendaftar"
                      disabled={loading}
                      aria-invalid={!!errors.identityNumber}
                    />
                    {errors.identityNumber && <FieldError>{errors.identityNumber}</FieldError>}
                  </Field>

                  <Field data-invalid={!!errors.institution}>
                    <FieldLabel htmlFor="institution">Sekolah / Instansi</FieldLabel>
                    <Input
                      id="institution"
                      value={formData.institution}
                      onChange={(e) => update('institution', e.target.value)}
                      placeholder="Asal sekolah atau instansi"
                      disabled={loading}
                      aria-invalid={!!errors.institution}
                    />
                    {errors.institution && <FieldError>{errors.institution}</FieldError>}
                  </Field>
                </>
              )}

              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Alamat Email {isTeam && 'Ketua'}</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="contoh@email.com"
                  disabled={loading}
                  aria-invalid={!!errors.email}
                />
                {errors.email && <FieldError>{errors.email}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.whatsapp}>
                <FieldLabel htmlFor="whatsapp">Nomor WhatsApp {isTeam && 'Ketua'}</FieldLabel>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => update('whatsapp', e.target.value.replace(/\D/g, ''))}
                  placeholder="62812XXXXXXXX"
                  disabled={loading}
                  aria-invalid={!!errors.whatsapp}
                />
                {errors.whatsapp && <FieldError>{errors.whatsapp}</FieldError>}
              </Field>

              {isTeam && (
                <Field data-invalid={!!errors.members}>
                  <FieldLabel htmlFor="members">Anggota Tim (Min. {(competition as any).minTeamMembers || 1})</FieldLabel>
                  {Array.from({ length: memberCount }, (_, i) => (
                    <Input
                      key={i}
                      value={membersArr[i] || ''}
                      onChange={(e) => {
                        const arr = [...membersArr];
                        arr[i] = e.target.value;
                        update('members', arr.filter(Boolean).join('\n'));
                      }}
                      placeholder={`Anggota ${i + 1}`}
                      disabled={loading}
                      aria-invalid={!!errors.members}
                    />
                  ))}
                  {errors.members && <FieldError>{errors.members}</FieldError>}
                </Field>
              )}
            </FieldGroup>

            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="clip-angled w-full text-base shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              {loading ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Memproses Pendaftaran...
                </>
              ) : (
                `Daftar Sekarang - Rp ${competition.fee.toLocaleString('id-ID')}`
              )}
            </Button>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex flex-col items-center">
              <CheckCircle2 className="mb-4 size-16 text-emerald-500" />
              <h2 className="text-xl font-black uppercase tracking-tight text-foreground md:text-2xl">
                Pendaftaran Berhasil!
              </h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Terima kasih telah mendaftar di *{competition.title}*. Silakan selesaikan pembayaran Anda untuk mengamankan slot kompetisi.
              </p>
            </div>

            <div className="w-full rounded-xl border border-slate-100 bg-muted/50 p-5 text-left">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Instruksi Pembayaran Bank Transfer
              </h3>

              <div className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div>
                  <div className="text-xs font-medium text-muted-foreground">Bank Penerima</div>
                  <div className="font-bold text-foreground">{bankInfo.bankName}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground">Atas Nama</div>
                  <div className="font-bold text-foreground">{bankInfo.accountHolder}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-xs font-medium text-muted-foreground">Nomor Rekening</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-mono text-base font-bold tracking-wider text-foreground">
                      {bankInfo.accountNumber}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={handleCopy}
                      aria-label="Salin nomor rekening"
                    >
                      {copied ? <Check className="text-emerald-500" /> : <Copy />}
                    </Button>
                    {copied && (
                      <Badge variant="secondary" className="text-[10px] font-bold text-emerald-600">
                        Tersalin
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground">Jumlah Transfer</div>
                  <div className="text-base font-bold text-primary">
                    Rp {competition.fee.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-left text-xs leading-relaxed text-muted-foreground">
              <span className="font-bold text-foreground">Penting:</span> Simpan bukti transfer Anda. Setelah melakukan pembayaran, Anda wajib melakukan konfirmasi dengan mengirimkan bukti transfer ke Contact Person melalui WhatsApp menggunakan tombol di bawah ini.
            </div>

            <Button asChild size="lg" className="clip-angled w-full bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400">
              <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                <MessageCircle data-icon="inline-start" />
                Konfirmasi Pembayaran (WhatsApp)
              </a>
            </Button>
          </div>
        )}
    </ResponsiveModal>
  );
}
