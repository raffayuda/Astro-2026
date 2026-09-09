"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, RefreshCw } from "lucide-react";
import { authClient } from "@/src/lib/auth-client";
import { OtpField } from "@/components/auth/OtpField";
import { useOtpCooldown } from "@/components/auth/useOtpCooldown";
import { AuthFrame } from "@/components/auth/AuthFrame";
import { CtaButton, Surface } from "@/components/brand";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { cooldown, startCooldown } = useOtpCooldown();
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  const handleResendOTP = async () => {
    if (cooldown > 0) return;
    if (!email || !email.includes("@")) {
      setError("Masukkan alamat email yang valid.");
      return;
    }

    setResending(true);
    setError("");
    setMessage("");

    try {
      const { error: resendError } = await authClient.emailOtp.sendVerificationOtp({
        email: email.trim().toLowerCase(),
        type: "email-verification",
      });

      if (resendError) {
        setError(resendError.message || "Gagal mengirim ulang OTP.");
      } else {
        setMessage("Kode OTP baru telah dikirim ke email Anda.");
        startCooldown();
      }
    } catch {
      setError("Terjadi kesalahan saat mengirim ulang OTP.");
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Masukkan email akun yang valid.");
      return;
    }
    if (otp.length !== 6) {
      setError("Masukkan 6 digit kode OTP lengkap.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { error: verifyError } = await authClient.emailOtp.verifyEmail({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      if (verifyError) {
        setError(verifyError.message || "Kode OTP tidak valid atau sudah kadaluarsa.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login?verified=true");
      }, 2000);
    } catch {
      setError("Terjadi kesalahan saat memverifikasi kode OTP.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthFrame title="Berhasil">
        <p className="text-sm leading-relaxed text-ink/75">
          Email berhasil diverifikasi. Mengalihkan ke halaman masuk...
        </p>
        <CtaButton href="/auth/login" className="mt-6 w-full" showChevron={false}>
          Masuk sekarang
        </CtaButton>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame
      title="Verifikasi email"
      description="Aktifkan akunmu dengan kode yang dikirim melalui email."
    >
      <Button
        asChild
        variant="link"
        className="mb-4 h-auto gap-1 p-0 text-xs font-bold text-ink/70"
      >
        <Link href="/auth/login">
          <ArrowLeft data-icon="inline-start" className="size-3.5" /> Kembali ke masuk
        </Link>
      </Button>

      {error ? (
        <Alert variant="destructive" className="mb-5">
          <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
        </Alert>
      ) : null}

      {message ? (
        <Surface tone="tint" radius="lg" pad="sm" className="mb-5">
          <p className="text-xs font-medium text-astro-navy">{message}</p>
        </Surface>
      ) : null}

      <form onSubmit={handleVerifyOTP} className="flex flex-col gap-5">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="verify-email" required>
              Email akun
            </FieldLabel>
            <InputGroup className="h-11">
              <InputGroupAddon align="inline-start">
                <Mail className="size-4 text-ink/50" />
              </InputGroupAddon>
              <InputGroupInput
                id="verify-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
              />
            </InputGroup>
          </Field>

          <OtpField id="otp-input" value={otp} onChange={setOtp} disabled={loading} />
        </FieldGroup>

        <CtaButton
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full"
          showChevron={!loading}
        >
          {loading ? "Memverifikasi..." : "Verifikasi akun"}
        </CtaButton>

        <div className="flex flex-col items-center gap-1 pt-1 text-center">
          <span className="text-xs text-ink/60">Tidak menerima kode atau sudah kadaluarsa?</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={cooldown > 0 || resending}
            onClick={handleResendOTP}
            className="text-xs font-bold text-astro-blue"
          >
            {resending ? (
              <>
                <Spinner className="mr-1 size-3" /> Mengirim...
              </>
            ) : cooldown > 0 ? (
              `Kirim ulang (${cooldown}s)`
            ) : (
              <>
                <RefreshCw className="mr-1 size-3" /> Kirim ulang kode OTP
              </>
            )}
          </Button>
        </div>
      </form>
    </AuthFrame>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <AuthFrame title="Verifikasi">
          <Spinner className="mx-auto size-6 text-astro-blue" />
        </AuthFrame>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
