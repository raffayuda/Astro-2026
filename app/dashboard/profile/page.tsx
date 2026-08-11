'use client';

import { useState, useEffect } from 'react';
import { authClient } from '@/src/lib/auth-client';
import { Check, Save } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
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
    setMessage('');

    if (newPassword !== confirmPassword) {
      setMessage('Password baru dan konfirmasi tidak cocok');
      setMessageType('error');
      return;
    }

    if (newPassword.length < 6) {
      setMessage('Password minimal 6 karakter');
      setMessageType('error');
      return;
    }

    setSaving(true);

    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
    });

    if (error) {
      setMessage(error.message || 'Password saat ini salah');
      setMessageType('error');
    } else {
      setMessage('Password berhasil diubah!');
      setMessageType('success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-6 text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl space-y-8">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">Profil</h1>
        <p className="mt-1 text-sm font-light text-muted-foreground">
          Kelola akun dan password Anda
        </p>
      </div>

      {message && (
        <Alert variant={messageType === 'success' ? 'default' : 'destructive'} className="clip-angled border-border">
          <AlertDescription className="text-xs font-medium">
            {messageType === 'success' ? <Check className="mr-1 inline size-3.5" /> : null}
            {message}
          </AlertDescription>
        </Alert>
      )}

      {/* Email */}
      <Card className="clip-angled relative overflow-hidden border-border">
        <div className="absolute -top-px -left-px size-8 bg-primary" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
        <CardContent className="space-y-5 p-6">
          <h2 className="text-sm font-black uppercase tracking-tight text-foreground">Email</h2>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Email Saat Ini
            </span>
            <p className="mt-0.5 text-sm font-medium text-foreground">{user?.email || '—'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="clip-angled border-border">
        <CardContent className="space-y-5 p-6">
          <h2 className="text-sm font-black uppercase tracking-tight text-foreground">Ubah Password</h2>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="current-password" required>Password Saat Ini</FieldLabel>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </Field>

              <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2')}>
                <Field>
                  <FieldLabel htmlFor="new-password" required>Password Baru</FieldLabel>
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
                  <FieldLabel htmlFor="confirm-password" required>Konfirmasi Password Baru</FieldLabel>
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

            <Button type="submit" disabled={saving} className="clip-angled text-xs font-black uppercase tracking-wider">
              {saving ? <Spinner data-icon="inline-start" /> : <Save data-icon="inline-start" />}
              {saving ? 'Menyimpan...' : 'Simpan Password Baru'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
