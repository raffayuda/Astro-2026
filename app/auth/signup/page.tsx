"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { authClient } from "@/src/lib/auth-client";
import { apiHelpers } from "@/src/lib/api";
import { PasswordField } from "@/components/auth/PasswordField";
import { OtpField } from "@/components/auth/OtpField";
import { useOtpCooldown } from "@/components/auth/useOtpCooldown";
import { AuthFrame } from "@/components/auth/AuthFrame";
import { CtaButton, Surface } from "@/components/brand";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type Step = "form" | "otp" | "success";

const EMAIL_ALREADY_EXISTS_CODES = ["USER_ALREADY_EXISTS", "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"];

type EmailCheck = {
  available?: boolean;
  emailVerified?: boolean;
  hasActiveOtp?: boolean;
};

function isEmailAlreadyRegistered(error?: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (error.code && EMAIL_ALREADY_EXISTS_CODES.includes(error.code)) return true;
  if (error.message?.toLowerCase().includes("already exists")) return true;
  return false;
}

export default function SignupPage() {
  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState(false);
  const { cooldown, startCooldown } = useOtpCooldown();
  const router = useRouter();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setUnverifiedEmail(false);

    try {
      try {
        const res = (await apiHelpers.auth.checkEmail(email)) as EmailCheck;
        if (!res.available) {
          if (res.emailVerified === false) {
            setStep("otp");
            setError("");
            setMessage(
              res.hasActiveOtp
                ? "Email ini sudah didaftarkan dan kode OTP masih aktif. Masukkan kode dari email, atau kirim ulang."
                : "Email ini sudah didaftarkan tetapi belum diverifikasi. Masukkan kode OTP terakhir atau kirim ulang.",
            );
            setLoading(false);
            return;
          }
          setError("Email sudah terdaftar. Silakan masuk, atau gunakan email lain.");
          setLoading(false);
          return;
        }
      } catch {
        // Availability probe outage should not block signup.
      }

      const { error: signUpError } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (signUpError) {
        setError(
          isEmailAlreadyRegistered(signUpError)
            ? "Email sudah terdaftar. Silakan masuk, atau gunakan email lain."
            : signUpError.message || "Gagal mengirim OTP.",
        );
        setLoading(false);
        return;
      }

      setStep("otp");
      setMessage("Kode OTP telah dikirim ke email Anda.");
      startCooldown();
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    }
    setLoading(false);
  };

  const handleResendOTP = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { error: resendError } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });

      if (resendError) {
        setError(resendError.message || "Gagal mengirim ulang OTP.");
      } else {
        setMessage("Kode OTP baru telah dikirim.");
        startCooldown();
      }
    } catch {
      setError("Terjadi kesalahan.");
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError("Masukkan 6 digit kode OTP.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: verifyError } = await authClient.emailOtp.verifyEmail({
        email,
        otp,
      });

      if (verifyError) {
        setError(verifyError.message || "Kode OTP tidak valid.");
        setLoading(false);
        return;
      }

      setStep("success");
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch {
      setError("Terjadi kesalahan.");
    }
    setLoading(false);
  };

  if (step === "success") {
    return (
      <AuthFrame title="Berhasil">
        <p className="text-sm leading-relaxed text-ink/75">
          Akun siap. Silakan masuk dengan email dan kata sandi baru.
        </p>
        <CtaButton href="/auth/login" className="mt-6 w-full" showChevron={false}>
          Masuk sekarang
        </CtaButton>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame
      title={step === "otp" ? "Periksa emailmu" : "Buat akun ASTRO"}
      description={
        step === "otp"
          ? "Verifikasi email untuk menyelesaikan pembuatan akun."
          : "Simpan dan pantau pendaftaran lombamu dalam satu akun."
      }
      activeTab={step === "form" ? "signup" : undefined}
    >
      {step === "otp" && (
        <Button
          type="button"
          variant="link"
          onClick={() => {
            setStep("form");
            setError("");
            setMessage("");
            setOtp("");
          }}
          className="mb-4 h-auto gap-1 p-0 text-xs font-bold text-ink/70"
        >
          <ArrowLeft data-icon="inline-start" className="size-3.5" /> Ganti email
        </Button>
      )}

      {step === "form" ? (
        <>
          {error ? (
            <Alert variant="destructive" className="mb-5">
              <AlertDescription className="text-xs font-medium leading-relaxed">
                {error}
              </AlertDescription>
              {unverifiedEmail ? (
                <div className="mt-3">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setStep("otp");
                      setError("");
                      setMessage("Masukkan kode OTP atau kirim ulang kode baru.");
                      void handleResendOTP();
                    }}
                  >
                    Masukkan kode OTP
                  </Button>
                </div>
              ) : null}
            </Alert>
          ) : null}

          <form onSubmit={handleSendOTP} className="flex flex-col gap-5">
            <FieldGroup className="gap-5">
              <Field>
                <FieldLabel htmlFor="name" required>
                  Nama lengkap
                </FieldLabel>
                <Input
                  className="h-11"
                  id="name"
                  autoComplete="name"
                  placeholder="Nama sesuai identitas"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email" required>
                  Email
                </FieldLabel>
                <Input
                  className="h-11"
                  id="email"
                  placeholder="nama@email.com"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <PasswordField
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Buat kata sandi"
                minLength={6}
                required
                description="Gunakan minimal 6 karakter."
              />
            </FieldGroup>

            <CtaButton type="submit" disabled={loading} className="w-full" showChevron={!loading}>
              {loading ? "Mengirim..." : "Kirim kode OTP"}
            </CtaButton>
          </form>
        </>
      ) : (
        <>
          <p className="mb-2 text-sm text-ink/70">Masukkan kode yang dikirim ke</p>
          <p className="mb-5 break-all text-sm font-bold text-astro-navy">{email}</p>

          {message ? (
            <Surface tone="tint" radius="lg" pad="sm" className="mb-5">
              <p className="text-xs font-medium text-astro-navy">{message}</p>
            </Surface>
          ) : null}

          {error ? (
            <Alert variant="destructive" className="mb-5">
              <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
            </Alert>
          ) : null}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleVerifyOTP();
            }}
            className="flex flex-col gap-5"
          >
            <OtpField id="signup-otp" value={otp} onChange={setOtp} disabled={loading} />

            <CtaButton
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full"
              showChevron={!loading}
            >
              {loading ? "Memverifikasi..." : "Verifikasi dan daftar"}
            </CtaButton>
          </form>

          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={handleResendOTP}
              disabled={loading || cooldown > 0}
              className="text-xs font-bold text-astro-blue"
            >
              {cooldown > 0 ? (
                <span className="flex items-center justify-center gap-1">
                  <Clock className="size-3" /> Kirim ulang ({cooldown}s)
                </span>
              ) : (
                "Kirim ulang OTP"
              )}
            </Button>
          </div>
        </>
      )}
    </AuthFrame>
  );
}
