"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/src/lib/auth-client";
import { Check, Save } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { PageHeader, PageShell, SectionCard } from "@/components/dashboard";

export default function ProfilePage() {
  const [user, setUser] = useState<{ email?: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    authClient.getSession().then(({ data: session }) => {
      if (session?.user) {
        setUser(session.user);
      }
      setLoading(false);
    });
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("Password baru dan konfirmasi tidak cocok");
      setMessageType("error");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Password minimal 6 karakter");
      setMessageType("error");
      return;
    }

    setSaving(true);

    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
    });

    if (error) {
      setMessage(error.message || "Password saat ini salah");
      setMessageType("error");
    } else {
      setMessage("Password berhasil diubah!");
      setMessageType("success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setSaving(false);
  };

  return (
    <PageShell narrow loading={loading}>
      <PageHeader title="Profil" description="Kelola akun dan password Anda" />

      {message ? (
        <Alert variant={messageType === "success" ? "default" : "destructive"}>
          <AlertDescription className="flex items-center gap-1.5 text-sm">
            {messageType === "success" ? <Check className="size-3.5 shrink-0" /> : null}
            {message}
          </AlertDescription>
        </Alert>
      ) : null}

      <SectionCard title="Email">
        <p className="text-xs font-medium text-muted-foreground">Email saat ini</p>
        <p className="mt-1 text-sm font-medium">{user?.email || "-"}</p>
      </SectionCard>

      <SectionCard title="Ubah Password">
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="current-password" required>
                Password Saat Ini
              </FieldLabel>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="new-password" required>
                  Password Baru
                </FieldLabel>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirm-password" required>
                  Konfirmasi Password Baru
                </FieldLabel>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </Field>
            </div>
          </FieldGroup>

          <Button type="submit" disabled={saving}>
            {saving ? <Spinner data-icon="inline-start" /> : <Save data-icon="inline-start" />}
            {saving ? "Menyimpan..." : "Simpan Password"}
          </Button>
        </form>
      </SectionCard>
    </PageShell>
  );
}
