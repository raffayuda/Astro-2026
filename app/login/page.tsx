'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authClient } from '@/src/lib/auth-client';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  LogIn,
  Eye,
  EyeOff,
  KeyRound,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Clock,
  Mail,
  AlertCircle,
} from 'lucide-react';
import Image from 'next/image';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Spinner } from '@/components/ui/spinner';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifiedParam = searchParams.get('verified') === 'true';

  const [mode, setMode] = useState<'login' | 'verify-otp'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(
    verifiedParam ? 'Email berhasil diverifikasi! Silakan masuk dengan kata sandi Anda.' : '',
  );

  // OTP Verification state
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpResending, setOtpResending] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    const { error: authError } = await authClient.signIn.email({
      email,
      password,
    });

    if (authError) {
      if (
        authError.code === 'EMAIL_NOT_VERIFIED' ||
        authError.message?.toLowerCase().includes('not verified')
      ) {
        setMode('verify-otp');
        setOtpError('');
        setOtpMessage(
          'Email akun ini belum diverifikasi. Silakan masukkan kode OTP yang telah dikirim ke email Anda sebelum kadaluarsa, atau klik kirim ulang kode baru di bawah.',
        );
        setLoading(false);
        return;
      } else if (
        authError.code === 'INVALID_EMAIL_OR_PASSWORD' ||
        authError.message?.toLowerCase().includes('invalid')
      ) {
        setError('Email atau password salah');
      } else {
        setError(authError.message || 'Terjadi kesalahan saat masuk');
      }
      setLoading(false);
      return;
    }

    // Check role from session
    const { data: session } = await authClient.getSession();
    const isAdmin = session?.user?.role === 'admin';

    if (isAdmin) {
      router.replace('/dashboard');
    } else {
      router.replace('/');
    }
  };

  const handleResendOTP = async () => {
    if (cooldown > 0) return;
    if (!email || !email.includes('@')) {
      setOtpError('Masukkan alamat email yang valid.');
      return;
    }

    setOtpResending(true);
    setOtpError('');
    setOtpMessage('');

    try {
      const { error: resendError } = await authClient.emailOtp.sendVerificationOtp({
        email: email.trim().toLowerCase(),
        type: 'email-verification',
      });

      if (resendError) {
        setOtpError(resendError.message || 'Gagal mengirim ulang OTP');
      } else {
        setOtpMessage('Kode OTP baru telah dikirim ke email Anda.');
        startCooldown();
      }
    } catch {
      setOtpError('Terjadi kesalahan saat mengirim ulang OTP.');
    } finally {
      setOtpResending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setOtpError('Email akun tidak valid.');
      return;
    }

    if (otp.length !== 6) {
      setOtpError('Masukkan 6 digit kode OTP lengkap.');
      return;
    }

    setOtpLoading(true);
    setOtpError('');
    setOtpMessage('');

    try {
      const { error: verifyError } = await authClient.emailOtp.verifyEmail({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      if (verifyError) {
        setOtpError(verifyError.message || 'Kode OTP tidak valid atau sudah kadaluarsa.');
        setOtpLoading(false);
        return;
      }

      // If password was already entered, auto-login
      if (password) {
        const { error: loginErr } = await authClient.signIn.email({
          email: email.trim().toLowerCase(),
          password,
        });

        if (!loginErr) {
          const { data: session } = await authClient.getSession();
          if (session?.user?.role === 'admin') {
            router.replace('/dashboard');
          } else {
            router.replace('/');
          }
          return;
        }
      }

      // If no password or auto-login failed, switch back to login with success message
      setMode('login');
      setError('');
      setSuccessMsg('Email berhasil diverifikasi! Silakan masuk dengan kata sandi Anda.');
    } catch {
      setOtpError('Terjadi kesalahan saat memverifikasi kode OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <Card className="clip-angled-lg border border-white/40 bg-background/80 p-8 backdrop-blur-xl md:p-10">
      <CardContent className="p-0">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <Image
            src="/assets/logo-astro.png"
            alt="ASTRO"
            width={64}
            height={64}
            priority
            className="size-12 object-contain md:size-16"
          />
        </div>

        {/* ─── MODE: LOGIN ─── */}
        {mode === 'login' && (
          <>
            <h1 className="mb-1 text-center text-xl font-black uppercase tracking-tight text-foreground md:text-2xl">
              Dashboard ASTRO
            </h1>
            <p className="mb-6 text-center text-sm font-light text-muted-foreground">
              Masuk untuk mengelola pendaftaran
            </p>

            {successMsg && (
              <Alert className="clip-angled mb-5 border-emerald-300 bg-emerald-50 text-emerald-800">
                <CheckCircle2 className="size-4 text-emerald-600 mr-1" />
                <AlertDescription className="text-xs font-medium">{successMsg}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="clip-angled mb-5 border-border">
                <AlertCircle className="size-4 mr-1" />
                <AlertDescription className="text-xs font-medium leading-relaxed">
                  {error}
                </AlertDescription>
                {error.includes('belum diverifikasi') && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setMode('verify-otp');
                        setOtpError('');
                        setOtpMessage('');
                      }}
                      className="clip-angled-sm text-xs font-bold uppercase bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      <KeyRound className="size-3.5 mr-1" /> Masukkan Kode OTP
                    </Button>
                  </div>
                )}
              </Alert>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <FieldGroup className="gap-5">
                <Field>
                  <FieldLabel htmlFor="email" required>
                    Email
                  </FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="password" required>
                    Password
                  </FieldLabel>
                  <InputGroup className="clip-angled-sm h-10 border-border bg-background">
                    <InputGroupInput
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <InputGroupAddon align="inline-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                        aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                </Field>
              </FieldGroup>

              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="clip-angled text-sm font-black uppercase tracking-wider active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <LogIn data-icon="inline-start" />
                    Masuk
                  </>
                )}
              </Button>
            </form>

            <div className="mt-5 flex flex-col items-center gap-2 text-center text-xs text-muted-foreground">
              <p>
                Belum punya akun?{' '}
                <Link href="/auth/signup" className="font-bold text-primary hover:underline">
                  Daftar di sini
                </Link>
              </p>
              <Link
                href={`/auth/verify-otp${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                className="text-[11px] font-medium text-slate-500 hover:text-primary hover:underline"
              >
                Sudah daftar tapi belum verifikasi OTP? Verifikasi di sini
              </Link>
            </div>
          </>
        )}

        {/* ─── MODE: VERIFY OTP ─── */}
        {mode === 'verify-otp' && (
          <>
            <Button
              type="button"
              variant="link"
              onClick={() => setMode('login')}
              className="mb-4 gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary p-0"
            >
              <ArrowLeft data-icon="inline-start" className="size-3.5" /> Kembali ke Login
            </Button>

            <h1 className="mb-1 text-center text-xl font-black uppercase tracking-tight text-foreground md:text-2xl">
              Verifikasi Kode OTP
            </h1>
            <p className="mb-6 text-center text-sm font-light text-muted-foreground">
              Masukkan 6 digit kode OTP yang dikirimkan ke email Anda
            </p>

            {otpError && (
              <Alert variant="destructive" className="clip-angled mb-5 border-border">
                <AlertDescription className="text-xs font-medium">{otpError}</AlertDescription>
              </Alert>
            )}

            {otpMessage && (
              <Alert className="clip-angled mb-5 border-emerald-300 bg-emerald-50 text-emerald-800">
                <AlertDescription className="text-xs font-medium">{otpMessage}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="otp-email" required>
                    Email Akun
                  </FieldLabel>
                  <InputGroup className="h-10 bg-background border-border">
                    <InputGroupAddon align="inline-start">
                      <Mail className="size-4 text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="otp-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      required
                      className="text-xs font-medium"
                    />
                  </InputGroup>
                </Field>

                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="login-otp" required>
                      Kode OTP (6 Digit)
                    </FieldLabel>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3" /> Berlaku 10 menit
                    </span>
                  </div>
                  <div className="flex justify-center py-2">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp} id="login-otp">
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

              <Button
                type="submit"
                disabled={otpLoading || otp.length !== 6}
                className="clip-angled text-xs font-black uppercase tracking-wider"
              >
                {otpLoading ? (
                  <>
                    <Spinner data-icon="inline-start" /> Memverifikasi...
                  </>
                ) : (
                  <>
                    <KeyRound data-icon="inline-start" /> Verifikasi & Masuk
                  </>
                )}
              </Button>

              <div className="flex flex-col items-center gap-1 text-center pt-2">
                <span className="text-xs text-muted-foreground">
                  Tidak menerima kode atau kode kadaluarsa?
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={cooldown > 0 || otpResending}
                  onClick={handleResendOTP}
                  className="text-xs font-bold text-primary hover:bg-primary/10"
                >
                  {otpResending ? (
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
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-sky-400 via-sky-300 to-sky-100">
      {/* Floating blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Image
          src="/assets/blob-round.png"
          alt=""
          width={120}
          height={120}
          className="absolute top-[10%] -left-[2%] size-20 object-contain opacity-30 md:size-32"
        />
        <Image
          src="/assets/blob-round.png"
          alt=""
          width={80}
          height={80}
          className="absolute top-[30%] -right-[2%] size-14 object-contain opacity-30 md:size-24"
        />
        <Image
          src="/assets/blob-round.png"
          alt=""
          width={100}
          height={100}
          className="absolute bottom-[20%] left-[5%] size-16 object-contain opacity-30 md:size-28"
        />
      </div>

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
            <LoginForm />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}
