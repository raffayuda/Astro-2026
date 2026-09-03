'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '@/src/lib/auth-client';
import { apiHelpers } from '@/src/lib/api';
import { motion } from 'motion/react';
import { ArrowLeft, Mail, KeyRound, CheckCircle2, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Spinner } from '@/components/ui/spinner';

type Step = 'form' | 'otp' | 'success';

const EMAIL_ALREADY_EXISTS_CODES = [
  'USER_ALREADY_EXISTS',
  'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL',
];

function isEmailAlreadyRegistered(error?: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (error.code && EMAIL_ALREADY_EXISTS_CODES.includes(error.code)) return true;
  if (error.message?.toLowerCase().includes('already exists')) return true;
  return false;
}

export default function SignupPage() {
  const [step, setStep] = useState<Step>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setUnverifiedEmail(false);

    try {
      // Pre-check: Better Auth returns a synthetic success response for an
      // existing email when requireEmailVerification is on (anti-enumeration),
      // so we detect the duplicate here before calling signUp.email.
      try {
        const res = await apiHelpers.auth.checkEmail(email);
        if (!res.available) {
          if ((res as any)?.emailVerified === false) {
            setStep('otp');
            setError('');
            if ((res as any)?.hasActiveOtp) {
              setMessage(
                'Email ini sudah pernah didaftarkan dan kode OTP Anda masih aktif! Silakan masukkan kode OTP yang telah dikirim ke email Anda sebelum kadaluarsa, atau kirim ulang kode baru.',
              );
            } else {
              setMessage(
                'Email ini sudah pernah didaftarkan tetapi belum diverifikasi. Silakan masukkan kode OTP terakhir Anda atau klik kirim ulang kode baru di bawah.',
              );
            }
            setLoading(false);
            return;
          }
          setError(
            'Email sudah terdaftar. Silakan masuk dengan akun tersebut, atau gunakan email lain.',
          );
          setLoading(false);
          return;
        }
      } catch {
        // If the pre-check endpoint fails, fall through to Better Auth below
        // so signup is never blocked by an availability probe outage.
      }

      // Better Auth: signUp.email with sendVerificationOnSignUp sends the OTP email
      const { error: signUpError } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (signUpError) {
        setError(
          isEmailAlreadyRegistered(signUpError)
            ? 'Email sudah terdaftar. Silakan masuk dengan akun tersebut, atau gunakan email lain.'
            : signUpError.message || 'Gagal mengirim OTP',
        );
        setLoading(false);
        return;
      }

      setStep('otp');
      setMessage('Kode OTP telah dikirim ke email Anda.');
      startCooldown();
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    }
    setLoading(false);
  };

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
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error: resendError } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'email-verification',
      });

      if (resendError) {
        setError(resendError.message || 'Gagal mengirim ulang OTP');
      } else {
        setMessage('Kode OTP baru telah dikirim.');
        startCooldown();
      }
    } catch {
      setError('Terjadi kesalahan.');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Masukkan 6 digit kode OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: verifyError } = await authClient.emailOtp.verifyEmail({
        email,
        otp,
      });

      if (verifyError) {
        setError(verifyError.message || 'Kode OTP tidak valid');
        setLoading(false);
        return;
      }

      setStep('success');
      setTimeout(() => router.push('/login'), 2000);
    } catch {
      setError('Terjadi kesalahan.');
    }
    setLoading(false);
  };

  // ─── SUCCESS ───
  if (step === 'success') {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-sky-400 via-sky-300 to-sky-100">
        <div className="flex flex-1 items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <Card className="clip-angled-lg border border-white/40 bg-background/80 p-8 text-center backdrop-blur-xl md:p-10">
              <CardContent className="flex flex-col items-center p-0">
                <div className="mb-4 flex size-16 items-center justify-center rounded-full border border-emerald-300 bg-emerald-100">
                  <CheckCircle2 className="size-8 text-emerald-600" />
                </div>
                <h2 className="mb-2 text-xl font-black uppercase tracking-tight text-foreground">Pendaftaran Berhasil!</h2>
                <p className="mb-6 text-sm text-muted-foreground">Silakan login dengan akun baru Anda.</p>
                <Button asChild className="clip-angled text-xs font-black uppercase tracking-wider">
                  <Link href="/login">Login Sekarang</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-sky-400 via-sky-300 to-sky-100">
      <div className="relative z-10 flex flex-1 items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <Card className="clip-angled-lg border border-white/40 bg-background/80 p-8 backdrop-blur-xl md:p-10">
            <CardContent className="p-0">
              <Button asChild variant="link" className="mb-6 gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary">
                <Link href="/login">
                  <ArrowLeft data-icon="inline-start" className="size-3.5" /> Kembali
                </Link>
              </Button>

              {/* ─── Step Form ─── */}
              {step === 'form' && (
                <>
                  <h1 className="mb-1 text-center text-xl font-black uppercase tracking-tight text-foreground md:text-2xl">
                    Daftar Akun
                  </h1>
                  <p className="mb-8 text-center text-sm font-light text-muted-foreground">
                    Buat akun untuk melacak pendaftaran
                  </p>

                  {error && (
                    <Alert variant="destructive" className="clip-angled mb-5 border-border">
                      <AlertDescription className="text-xs font-medium leading-relaxed">
                        {error}
                      </AlertDescription>
                      {unverifiedEmail && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                              setStep('otp');
                              setError('');
                              setMessage('Silakan masukkan kode OTP Anda atau kirim ulang kode baru di bawah.');
                              handleResendOTP();
                            }}
                            className="clip-angled-sm text-xs font-bold uppercase bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            <KeyRound className="size-3.5 mr-1" /> Masukkan Kode OTP Sekarang
                          </Button>
                        </div>
                      )}
                    </Alert>
                  )}

                  <form onSubmit={handleSendOTP} className="flex flex-col gap-5">
                    <FieldGroup className="gap-5">
                      <Field>
                        <FieldLabel htmlFor="name" required>Nama Lengkap</FieldLabel>
                        <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="email" required>Email</FieldLabel>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="password" required>Password</FieldLabel>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                      </Field>
                    </FieldGroup>

                    <Button type="submit" disabled={loading} size="lg" className="clip-angled text-sm font-black uppercase tracking-wider">
                      {loading ? (
                        <>
                          <Spinner data-icon="inline-start" />
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <Mail data-icon="inline-start" />
                          Kirim Kode OTP
                        </>
                      )}
                    </Button>
                  </form>
                </>
              )}

              {/* ─── Step OTP ─── */}
              {step === 'otp' && (
                <>
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => {
                      setStep('form');
                      setError('');
                      setMessage('');
                      setOtp('');
                    }}
                    className="mb-4 gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary p-0"
                  >
                    <ArrowLeft data-icon="inline-start" className="size-3.5" /> Ganti Email / Kembali
                  </Button>

                  <div className="mb-4 flex justify-center">
                    <div className="flex size-14 items-center justify-center rounded-full border border-cyan-200 bg-primary/10">
                      <KeyRound className="size-7 text-primary" />
                    </div>
                  </div>

                  <h1 className="mb-1 text-center text-xl font-black uppercase tracking-tight text-foreground md:text-2xl">
                    Verifikasi OTP
                  </h1>
                  <p className="mb-2 text-center text-sm font-light text-muted-foreground">
                    Masukkan kode yang dikirim ke
                  </p>
                  <p className="mb-6 text-center text-sm font-bold text-foreground">{email}</p>

                  {message && (
                    <Alert className="clip-angled mb-5 border-border bg-primary/5 text-primary">
                      <AlertDescription className="text-xs font-medium">{message}</AlertDescription>
                    </Alert>
                  )}

                  {error && (
                    <Alert variant="destructive" className="clip-angled mb-5 border-border">
                      <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="mb-6 flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp} pattern="\d" autoFocus>
                      <InputOTPGroup>
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                          <InputOTPSlot key={i} index={i} className="size-10 border-border text-lg font-black md:size-12" />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <Button
                    onClick={handleVerifyOTP}
                    disabled={loading || otp.length !== 6}
                    size="lg"
                    className="clip-angled w-full text-sm font-black uppercase tracking-wider"
                  >
                    {loading ? (
                      <>
                        <Spinner data-icon="inline-start" />
                        Memverifikasi...
                      </>
                    ) : (
                      <>Verifikasi & Daftar</>
                    )}
                  </Button>

                  <div className="mt-5 text-center">
                    <Button
                      variant="link"
                      onClick={handleResendOTP}
                      disabled={loading || cooldown > 0}
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary"
                    >
                      {cooldown > 0 ? (
                        <span className="flex items-center justify-center gap-1">
                          <Clock className="size-3" /> Kirim ulang ({cooldown}s)
                        </span>
                      ) : (
                        'Kirim ulang OTP'
                      )}
                    </Button>
                  </div>
                </>
              )}

              <div className="mt-5 flex flex-col items-center gap-2 text-center text-xs text-muted-foreground">
                <p>
                  Sudah punya akun?{' '}
                  <Link href="/login" className="font-bold text-primary hover:underline">
                    Masuk
                  </Link>
                </p>
                <Link
                  href={`/auth/verify-otp${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                  className="text-[11px] font-medium text-slate-500 hover:text-primary hover:underline"
                >
                  Sudah daftar tapi belum verifikasi OTP? Verifikasi di sini
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
