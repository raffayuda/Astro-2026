'use client';

import { use, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Shield,
  UserCheck,
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { signIn } from '@/src/lib/auth-client';
import { apiHelpers } from '@/src/lib/api';

export default function InviteAcceptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  const router = useRouter();

  const [verifying, setVerifying] = useState(true);
  const [invitation, setInvitation] = useState<{
    token: string;
    email: string | null;
    role: string;
    expiresAt: string | Date;
  } | null>(null);
  const [errorReason, setErrorReason] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Verify invitation token on load
  useEffect(() => {
    async function verify() {
      try {
        const res = await apiHelpers.invitations.verify(token);
        if ((res as any)?.valid && (res as any)?.data) {
          setInvitation((res as any).data);
          if ((res as any).data.email) {
            setEmail((res as any).data.email);
          }
        } else {
          setErrorReason((res as any)?.error || 'Tautan undangan tidak valid.');
        }
      } catch (err: any) {
        setErrorReason(
          err?.message ||
            'Tautan undangan tidak valid, sudah kadaluarsa, atau telah dibatalkan.',
        );
      } finally {
        setVerifying(false);
      }
    }

    if (token) {
      verify();
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetEmail = invitation?.email || email;
    if (!targetEmail) {
      toast.error('Email wajib diisi.');
      return;
    }
    if (!name.trim()) {
      toast.error('Nama lengkap wajib diisi.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password minimal 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Konfirmasi password tidak cocok.');
      return;
    }

    setSubmitting(true);
    try {
      await apiHelpers.invitations.accept(token, {
        name: name.trim(),
        email: targetEmail,
        password,
      });

      setSuccess(true);
      toast.success('Akun berhasil diaktifkan! Sedang masuk ke sistem...');

      // Auto sign-in
      try {
        const loginRes = await signIn.email({
          email: targetEmail,
          password,
        });

        if (loginRes?.error) {
          toast.info('Silakan login dengan email dan kata sandi baru Anda.');
          router.push('/login');
          return;
        }

        if (invitation?.role === 'admin') {
          router.push('/dashboard');
        } else {
          router.push('/');
        }
      } catch {
        router.push('/login');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Gagal mengaktifkan akun undangan.');
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[100svh] flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Sky Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-sky-400 via-sky-300 to-sky-100" />

      {/* Cloud & Planet Decorative Elements */}
      <Image
        src="/assets/cloud.png"
        alt=""
        width={320}
        height={220}
        priority
        className="absolute top-[8%] -left-12 w-64 md:w-80 h-auto opacity-60 pointer-events-none select-none"
      />
      <Image
        src="/assets/cloud.png"
        alt=""
        width={320}
        height={220}
        priority
        className="absolute bottom-[12%] -right-16 w-72 md:w-96 h-auto opacity-50 pointer-events-none select-none"
      />
      <Image
        src="/assets/earth.png"
        alt=""
        width={180}
        height={180}
        className="absolute top-[14%] right-[8%] w-16 h-16 md:w-24 md:h-24 object-contain opacity-70 pointer-events-none select-none"
      />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md z-10 my-8"
      >
        {/* Logo ASTRO */}
        <div className="flex flex-col items-center mb-6">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <Image
              src="https://i.ibb.co.com/yvSvfLK/logo-astro.png"
              alt="ASTRO 2026"
              width={140}
              height={48}
              priority
              className="h-12 w-auto object-contain drop-shadow-md"
            />
          </Link>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-800 drop-shadow-sm">
            Aktivasi Akun Undangan
          </p>
        </div>

        {/* State 1: Verifying */}
        {verifying && (
          <Card className="clip-angled border-white/60 bg-white/90 backdrop-blur-md shadow-xl p-8 text-center">
            <div className="flex flex-col items-center justify-center py-6 gap-3">
              <Spinner className="size-8 text-cyan-600" />
              <p className="text-sm font-semibold text-slate-700">
                Memverifikasi tautan undangan...
              </p>
            </div>
          </Card>
        )}

        {/* State 2: Invalid / Expired */}
        {!verifying && errorReason && (
          <Card className="clip-angled border-white/60 bg-white/90 backdrop-blur-md shadow-xl p-6 sm:p-8 text-center">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertCircle className="size-8" />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
                  Undangan Tidak Valid
                </h2>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {errorReason}
                </p>
              </div>
              <div className="pt-2 w-full">
                <Button asChild className="clip-angled w-full font-bold uppercase tracking-wider text-xs">
                  <Link href="/">Kembali ke Beranda</Link>
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* State 3: Valid & Ready to Fill */}
        {!verifying && !errorReason && invitation && (
          <Card className="clip-angled border-white/70 bg-white/95 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div
              className="absolute -top-px -left-px size-10 bg-cyan-500"
              style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
            />

            <CardContent className="p-6 sm:p-8">
              {/* Header inside card */}
              <div className="mb-6 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-[11px] font-bold uppercase tracking-wider mb-2">
                  {invitation.role === 'admin'
                    ? 'Undangan Administrator'
                    : 'Undangan Peserta'}
                </div>
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
                  Selamat Datang di ASTRO 2026
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Lengkapi data di bawah ini untuk mengaktifkan akun dan menentukan kata sandi Anda.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <FieldGroup className="space-y-3.5">
                  {/* Email */}
                  <Field>
                    <FieldLabel className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Email Akun
                    </FieldLabel>
                    <InputGroup className="h-10 bg-slate-50 border-slate-200">
                      <InputGroupAddon align="inline-start">
                        <Mail className="size-4 text-slate-400" />
                      </InputGroupAddon>
                      <InputGroupInput
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={!!invitation.email || submitting || success}
                        placeholder="nama@email.com"
                        required
                        className="text-xs font-medium text-slate-900"
                      />
                    </InputGroup>
                    {invitation.email && (
                      <p className="text-[11px] text-slate-500 mt-1">
                        * Email ini telah ditentukan oleh administrator pengundang.
                      </p>
                    )}
                  </Field>

                  {/* Nama Lengkap */}
                  <Field>
                    <FieldLabel className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Nama Lengkap
                    </FieldLabel>
                    <InputGroup className="h-10 bg-slate-50 border-slate-200">
                      <InputGroupAddon align="inline-start">
                        <User className="size-4 text-slate-400" />
                      </InputGroupAddon>
                      <InputGroupInput
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={submitting || success}
                        placeholder="Masukkan nama lengkap Anda"
                        required
                        className="text-xs font-medium text-slate-900"
                      />
                    </InputGroup>
                  </Field>

                  {/* Password Baru */}
                  <Field>
                    <FieldLabel className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Kata Sandi Baru
                    </FieldLabel>
                    <InputGroup className="h-10 bg-slate-50 border-slate-200">
                      <InputGroupAddon align="inline-start">
                        <Lock className="size-4 text-slate-400" />
                      </InputGroupAddon>
                      <InputGroupInput
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={submitting || success}
                        placeholder="Minimal 6 karakter"
                        required
                        minLength={6}
                        className="text-xs font-medium text-slate-900"
                      />
                    </InputGroup>
                  </Field>

                  {/* Konfirmasi Password */}
                  <Field>
                    <FieldLabel className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Konfirmasi Kata Sandi
                    </FieldLabel>
                    <InputGroup className="h-10 bg-slate-50 border-slate-200">
                      <InputGroupAddon align="inline-start">
                        <Lock className="size-4 text-slate-400" />
                      </InputGroupAddon>
                      <InputGroupInput
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={submitting || success}
                        placeholder="Ulangi kata sandi"
                        required
                        className="text-xs font-medium text-slate-900"
                      />
                    </InputGroup>
                  </Field>
                </FieldGroup>

                {/* Submit button */}
                <div className="pt-3">
                  <Button
                    type="submit"
                    disabled={submitting || success}
                    className="clip-angled w-full h-11 bg-slate-950 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all"
                  >
                    {submitting ? (
                      <>
                        <Spinner className="size-4 mr-2" /> Mengaktifkan Akun...
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle2 className="size-4 mr-2 text-emerald-400" /> Berhasil!
                      </>
                    ) : (
                      <>
                        Aktifkan Akun & Masuk <ArrowRight className="size-4 ml-1.5" />
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {/* Footer note */}
              <p className="mt-5 text-center text-[11px] text-slate-500">
                Akun yang dibuat melalui tautan ini langsung aktif dan terverifikasi secara resmi oleh panitia ASTRO 2026.
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
