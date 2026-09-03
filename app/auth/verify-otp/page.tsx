'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ArrowLeft, Mail, KeyRound, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { authClient } from '@/src/lib/auth-client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Spinner } from '@/components/ui/spinner';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const startCooldown = () => {
    setCooldown(60);
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOTP = async () => {
    if (cooldown > 0) return;
    if (!email || !email.includes('@')) {
      setError('Masukkan alamat email yang valid.');
      return;
    }

    setResending(true);
    setError('');
    setMessage('');

    try {
      const { error: resendError } = await authClient.emailOtp.sendVerificationOtp({
        email: email.trim().toLowerCase(),
        type: 'email-verification',
      });

      if (resendError) {
        setError(resendError.message || 'Gagal mengirim ulang OTP');
      } else {
        setMessage('Kode OTP baru telah dikirim ke email Anda.');
        startCooldown();
      }
    } catch {
      setError('Terjadi kesalahan saat mengirim ulang OTP.');
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Masukkan email akun yang valid.');
      return;
    }

    if (otp.length !== 6) {
      setError('Masukkan 6 digit kode OTP lengkap.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error: verifyError } = await authClient.emailOtp.verifyEmail({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      if (verifyError) {
        setError(verifyError.message || 'Kode OTP tidak valid atau sudah kadaluarsa.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login?verified=true');
      }, 2000);
    } catch {
      setError('Terjadi kesalahan saat memverifikasi kode OTP.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="clip-angled-lg border border-white/40 bg-background/80 p-8 text-center backdrop-blur-xl md:p-10">
        <CardContent className="flex flex-col items-center p-0">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full border border-emerald-300 bg-emerald-100">
            <CheckCircle2 className="size-8 text-emerald-600" />
          </div>
          <h2 className="mb-2 text-xl font-black uppercase tracking-tight text-foreground">
            Verifikasi Berhasil!
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Email Anda telah berhasil diverifikasi. Mengalihkan ke halaman login...
          </p>
          <Button asChild className="clip-angled text-xs font-black uppercase tracking-wider">
            <Link href="/login">Login Sekarang</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="clip-angled-lg border border-white/40 bg-background/80 p-8 backdrop-blur-xl md:p-10">
      <CardContent className="p-0">
        <Button
          asChild
          variant="link"
          className="mb-6 gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary p-0"
        >
          <Link href="/login">
            <ArrowLeft data-icon="inline-start" className="size-3.5" /> Kembali ke Login
          </Link>
        </Button>

        {/* Logo */}
        <div className="mb-4 flex justify-center">
          <Image
            src="https://abhshprulipnmetfumrt.supabase.co/storage/v1/object/public/assets/logo-astro.png"
            alt="ASTRO"
            width={64}
            height={64}
            priority
            className="size-12 object-contain md:size-14"
          />
        </div>

        <h1 className="mb-1 text-center text-xl font-black uppercase tracking-tight text-foreground md:text-2xl">
          Verifikasi Kode OTP
        </h1>
        <p className="mb-6 text-center text-sm font-light text-muted-foreground">
          Masukkan 6 digit kode yang dikirimkan ke email akun Anda
        </p>

        {error && (
          <Alert variant="destructive" className="clip-angled mb-5 border-border">
            <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {message && (
          <Alert className="clip-angled mb-5 border-emerald-300 bg-emerald-50 text-emerald-800">
            <AlertDescription className="text-xs font-medium">{message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleVerifyOTP} className="flex flex-col gap-5">
          <FieldGroup>
            {/* Email Field */}
            <Field>
              <FieldLabel htmlFor="verify-email" required>
                Email Akun
              </FieldLabel>
              <InputGroup className="h-10 bg-background border-border">
                <InputGroupAddon align="inline-start">
                  <Mail className="size-4 text-muted-foreground" />
                </InputGroupAddon>
                <InputGroupInput
                  id="verify-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  className="text-xs font-medium"
                />
              </InputGroup>
            </Field>

            {/* OTP Code Field */}
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="otp-input" required>
                  Kode OTP (6 Digit)
                </FieldLabel>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3" /> Berlaku 10 menit
                </span>
              </div>
              <div className="flex justify-center py-2">
                <InputOTP maxLength={6} value={otp} onChange={setOtp} id="otp-input">
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </Field>
          </FieldGroup>

          {/* Verify Button */}
          <Button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="clip-angled text-xs font-black uppercase tracking-wider"
          >
            {loading ? (
              <>
                <Spinner data-icon="inline-start" /> Memverifikasi...
              </>
            ) : (
              <>
                <KeyRound data-icon="inline-start" /> Verifikasi Akun
              </>
            )}
          </Button>

          {/* Resend OTP button */}
          <div className="flex flex-col items-center gap-1 text-center pt-2">
            <span className="text-xs text-muted-foreground">Tidak menerima kode atau kode kadaluarsa?</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={cooldown > 0 || resending}
              onClick={handleResendOTP}
              className="text-xs font-bold text-primary hover:bg-primary/10"
            >
              {resending ? (
                <>
                  <Spinner className="size-3 mr-1" /> Mengirim...
                </>
              ) : cooldown > 0 ? (
                `Kirim Ulang (${cooldown}s)`
              ) : (
                <>
                  <RefreshCw className="size-3 mr-1" /> Kirim Ulang Kode OTP
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-sky-400 via-sky-300 to-sky-100">
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <Suspense
            fallback={
              <Card className="clip-angled-lg border border-white/40 bg-background/80 p-8 text-center backdrop-blur-xl">
                <Spinner className="size-6 text-primary mx-auto" />
              </Card>
            }
          >
            <VerifyOtpContent />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}
