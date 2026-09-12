"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { AuthFrame } from "@/components/auth/AuthFrame";
import { CenteredShell, CtaButton, Pill } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { signIn } from "@/src/lib/auth-client";
import { apiHelpers } from "@/src/lib/api";

type Invitation = {
  token: string;
  email: string | null;
  role: string;
  expiresAt: string | Date;
};

type VerifyResult = {
  valid?: boolean;
  data?: Invitation;
  error?: string;
};

export default function InviteAcceptPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  const router = useRouter();

  const [verifying, setVerifying] = useState(true);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [errorReason, setErrorReason] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function verify() {
      try {
        const res = (await apiHelpers.invitations.verify(token)) as VerifyResult;
        if (res?.valid && res.data) {
          setInvitation(res.data);
          if (res.data.email) setEmail(res.data.email);
        } else {
          setErrorReason(res?.error || "Tautan undangan tidak valid.");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "";
        setErrorReason(
          message || "Tautan undangan tidak valid, sudah kadaluarsa, atau telah dibatalkan.",
        );
      } finally {
        setVerifying(false);
      }
    }

    if (token) verify();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetEmail = invitation?.email || email;
    if (!targetEmail) {
      toast.error("Email wajib diisi.");
      return;
    }
    if (!name.trim()) {
      toast.error("Nama lengkap wajib diisi.");
      return;
    }
    if (password.length < 6) {
      toast.error("Kata sandi minimal 6 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Konfirmasi kata sandi tidak cocok.");
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
      toast.success("Akun berhasil diaktifkan. Sedang masuk...");

      try {
        const loginRes = await signIn.email({
          email: targetEmail,
          password,
        });

        if (loginRes?.error) {
          toast.info("Silakan masuk dengan email dan kata sandi baru.");
          router.push("/auth/login");
          return;
        }

        if (invitation?.role === "admin") {
          router.push("/dashboard");
        } else {
          router.push("/");
        }
      } catch {
        router.push("/auth/login");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal mengaktifkan akun undangan.";
      toast.error(message);
      setSubmitting(false);
    }
  };

  if (verifying) {
    return (
      <CenteredShell>
        <AuthFrame title="Undangan">
          <div className="flex flex-col items-center gap-3 py-6">
            <Spinner className="size-6 text-astro-blue" />
            <p className="text-sm font-medium text-ink/75">Memverifikasi tautan undangan...</p>
          </div>
        </AuthFrame>
      </CenteredShell>
    );
  }

  if (errorReason) {
    return (
      <CenteredShell>
        <AuthFrame title="Undangan">
          <p className="text-sm leading-relaxed text-ink/75">{errorReason}</p>
          <CtaButton href="/" className="mt-6 w-full" showChevron={false}>
            Kembali ke beranda
          </CtaButton>
        </AuthFrame>
      </CenteredShell>
    );
  }

  if (!invitation) return null;

  return (
    <CenteredShell>
      <AuthFrame title="Aktifkan akun">
        <Pill tone={invitation.role === "admin" ? "navy" : "blue"} size="sm" className="mb-4">
          {invitation.role === "admin" ? "Undangan panitia" : "Undangan peserta"}
        </Pill>
        <p className="mb-5 text-sm leading-relaxed text-ink/70">
          Lengkapi data untuk mengaktifkan akun. Panitia masuk ke dasbor, peserta ke beranda.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <FieldGroup className="gap-5">
            <Field>
              <FieldLabel required>Email akun</FieldLabel>
              <InputGroup className="h-10">
                <InputGroupAddon align="inline-start">
                  <Mail className="size-4 text-ink/50" />
                </InputGroupAddon>
                <InputGroupInput
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!!invitation.email || submitting || success}
                  placeholder="nama@email.com"
                  required
                />
              </InputGroup>
              {invitation.email ? (
                <p className="mt-1 text-xs text-ink/55">Email ini sudah ditetapkan pengundang.</p>
              ) : null}
            </Field>

            <Field>
              <FieldLabel required>Nama lengkap</FieldLabel>
              <InputGroup className="h-10">
                <InputGroupAddon align="inline-start">
                  <User className="size-4 text-ink/50" />
                </InputGroupAddon>
                <InputGroupInput
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting || success}
                  placeholder="Nama lengkap"
                  required
                />
              </InputGroup>
            </Field>

            <Field>
              <FieldLabel required>Kata sandi baru</FieldLabel>
              <InputGroup className="h-10">
                <InputGroupAddon align="inline-start">
                  <Lock className="size-4 text-ink/50" />
                </InputGroupAddon>
                <InputGroupInput
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting || success}
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                />
              </InputGroup>
            </Field>

            <Field>
              <FieldLabel required>Konfirmasi kata sandi</FieldLabel>
              <InputGroup className="h-10">
                <InputGroupAddon align="inline-start">
                  <Lock className="size-4 text-ink/50" />
                </InputGroupAddon>
                <InputGroupInput
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={submitting || success}
                  placeholder="Ulangi kata sandi"
                  required
                />
              </InputGroup>
            </Field>
          </FieldGroup>

          <CtaButton
            type="submit"
            disabled={submitting || success}
            className="w-full"
            showChevron={!submitting && !success}
          >
            {submitting ? "Mengaktifkan..." : success ? "Berhasil" : "Aktifkan dan masuk"}
          </CtaButton>
        </form>

        <p className="mt-5 text-center text-xs text-ink/55">
          Akun dari tautan ini langsung aktif.{" "}
          <Button asChild variant="link" className="h-auto p-0 text-xs font-bold">
            <Link href="/auth/login">Masuk di sini</Link>
          </Button>
        </p>
      </AuthFrame>
    </CenteredShell>
  );
}
