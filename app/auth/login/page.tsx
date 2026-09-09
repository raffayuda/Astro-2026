"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/src/lib/auth-client";
import Link from "next/link";
import { KeyRound, ArrowLeft, RefreshCw, CheckCircle2, Mail, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/auth/PasswordField";
import { OtpField } from "@/components/auth/OtpField";
import { useOtpCooldown } from "@/components/auth/useOtpCooldown";
import { AuthFrame } from "@/components/auth/AuthFrame";
import { CtaButton, Surface } from "@/components/brand";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifiedParam = searchParams.get("verified") === "true";

  const [mode, setMode] = useState<"login" | "verify-otp">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState(
    verifiedParam ? "Email berhasil diverifikasi! Silakan masuk dengan kata sandi Anda." : "",
  );

  // OTP Verification state
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpResending, setOtpResending] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const { cooldown, startCooldown } = useOtpCooldown();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    const { error: authError } = await authClient.signIn.email({
      email,
      password,
    });

    if (authError) {
      if (
        authError.code === "EMAIL_NOT_VERIFIED" ||
        authError.message?.toLowerCase().includes("not verified")
      ) {
        setMode("verify-otp");
        setOtpError("");
        setOtpMessage(
          "Email akun ini belum diverifikasi. Silakan masukkan kode OTP yang telah dikirim ke email Anda sebelum kadaluarsa, atau klik kirim ulang kode baru di bawah.",
        );
        setLoading(false);
        return;
      } else if (
        authError.code === "INVALID_EMAIL_OR_PASSWORD" ||
        authError.message?.toLowerCase().includes("invalid")
      ) {
        setError("Email atau password salah");
      } else {
        setError(authError.message || "Terjadi kesalahan saat masuk");
      }
      setLoading(false);
      return;
    }

    // Check role from session
    const { data: session } = await authClient.getSession();
    const isAdmin = session?.user?.role === "admin";

    if (isAdmin) {
      router.replace("/dashboard");
    } else {
      router.replace("/");
    }
  };

  const handleResendOTP = async () => {
    if (cooldown > 0) return;
    if (!email || !email.includes("@")) {
      setOtpError("Masukkan alamat email yang valid.");
      return;
    }

    setOtpResending(true);
    setOtpError("");
    setOtpMessage("");

    try {
      const { error: resendError } = await authClient.emailOtp.sendVerificationOtp({
        email: email.trim().toLowerCase(),
        type: "email-verification",
      });

      if (resendError) {
        setOtpError(resendError.message || "Gagal mengirim ulang OTP");
      } else {
        setOtpMessage("Kode OTP baru telah dikirim ke email Anda.");
        startCooldown();
      }
    } catch {
      setOtpError("Terjadi kesalahan saat mengirim ulang OTP.");
    } finally {
      setOtpResending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setOtpError("Email akun tidak valid.");
      return;
    }

    if (otp.length !== 6) {
      setOtpError("Masukkan 6 digit kode OTP lengkap.");
      return;
    }

    setOtpLoading(true);
    setOtpError("");
    setOtpMessage("");

    try {
      const { error: verifyError } = await authClient.emailOtp.verifyEmail({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      if (verifyError) {
        setOtpError(verifyError.message || "Kode OTP tidak valid atau sudah kadaluarsa.");
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
          if (session?.user?.role === "admin") {
            router.replace("/dashboard");
          } else {
            router.replace("/");
          }
          return;
        }
      }

      // If no password or auto-login failed, switch back to login with success message
      setMode("login");
      setError("");
      setSuccessMsg("Email berhasil diverifikasi! Silakan masuk dengan kata sandi Anda.");
    } catch {
      setOtpError("Terjadi kesalahan saat memverifikasi kode OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <AuthFrame
      title={mode === "login" ? "Selamat datang kembali" : "Verifikasi email"}
      description={
        mode === "login"
          ? "Masuk untuk melihat dan mengelola pendaftaran lombamu."
          : "Satu langkah lagi untuk mengaktifkan akunmu."
      }
      activeTab={mode === "login" ? "login" : undefined}
    >
      {/* ─── MODE: LOGIN ─── */}
      {mode === "login" && (
        <>
          {successMsg && (
            <Surface tone="tint" radius="lg" pad="sm" className="mb-5 flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-astro-blue" />
              <p className="text-xs font-medium text-astro-navy">{successMsg}</p>
            </Surface>
          )}

          {error && (
            <Alert variant="destructive" className="mb-5">
              <AlertCircle className="size-4 mr-1" />
              <AlertDescription className="text-xs font-medium leading-relaxed">
                {error}
              </AlertDescription>
              {error.includes("belum diverifikasi") && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setMode("verify-otp");
                      setOtpError("");
                      setOtpMessage("");
                    }}
                  >
                    <KeyRound className="size-3.5 mr-1" /> Masukkan kode OTP
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
                  className="h-11"
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                />
              </Field>

              <PasswordField
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Masukkan kata sandi"
                required
              />
            </FieldGroup>

            <CtaButton type="submit" disabled={loading} className="w-full" showChevron={!loading}>
              {loading ? "Memproses..." : "Masuk"}
            </CtaButton>
          </form>

          <div className="mt-5 flex flex-col items-center gap-2 text-center text-xs text-ink/60">
            <Link
              href={`/auth/verify-otp${email ? `?email=${encodeURIComponent(email)}` : ""}`}
              className="font-medium text-ink/70 hover:text-astro-blue hover:underline"
            >
              Email belum aktif? Verifikasi akun
            </Link>
          </div>
        </>
      )}

      {/* ─── MODE: VERIFY OTP ─── */}
      {mode === "verify-otp" && (
        <>
          <Button
            type="button"
            variant="link"
            onClick={() => setMode("login")}
            className="mb-4 gap-1 p-0 text-xs font-bold text-ink/70 hover:text-astro-blue"
          >
            <ArrowLeft data-icon="inline-start" className="size-3.5" /> Kembali ke masuk
          </Button>

          <p className="mb-5 text-sm text-ink/70">
            Masukkan 6 digit kode OTP yang dikirim ke email Anda
          </p>

          {otpError && (
            <Alert variant="destructive" className="mb-5">
              <AlertDescription className="text-xs font-medium">{otpError}</AlertDescription>
            </Alert>
          )}

          {otpMessage && (
            <Surface tone="tint" radius="lg" pad="sm" className="mb-5">
              <p className="text-xs font-medium text-astro-navy">{otpMessage}</p>
            </Surface>
          )}

          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="otp-email" required>
                  Email akun
                </FieldLabel>
                <InputGroup className="h-11">
                  <InputGroupAddon align="inline-start">
                    <Mail className="size-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="otp-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    required
                  />
                </InputGroup>
              </Field>

              <OtpField id="login-otp" value={otp} onChange={setOtp} disabled={otpLoading} />
            </FieldGroup>

            <CtaButton
              type="submit"
              disabled={otpLoading || otp.length !== 6}
              className="w-full"
              showChevron={!otpLoading}
            >
              {otpLoading ? "Memverifikasi..." : "Verifikasi dan masuk"}
            </CtaButton>

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
                  `Kirim ulang (${cooldown}s)`
                ) : (
                  <>
                    <RefreshCw className="size-3 mr-1" /> Kirim ulang kode OTP
                  </>
                )}
              </Button>
            </div>
          </form>
        </>
      )}
    </AuthFrame>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthFrame title="Masuk">
          <Spinner className="mx-auto size-6 text-astro-blue" />
        </AuthFrame>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
