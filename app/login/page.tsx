'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/src/lib/auth-client';
import Link from 'next/link';
import { motion } from 'motion/react';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await authClient.signIn.email({
      email,
      password,
    });

    if (authError) {
      setError(
        authError.message?.toLowerCase().includes('invalid')
          ? 'Email atau password salah'
          : authError.message || 'Terjadi kesalahan',
      );
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

      <div className="relative z-10 flex flex-1 items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <Card className="clip-angled-lg border border-white/40 bg-background/80 p-8 backdrop-blur-xl md:p-10">
            <CardContent className="p-0">
              {/* Logo */}
              <div className="mb-6 flex justify-center">
                <Image
                  src="/assets/logo-astro.png"
                  alt="ASTRO"
                  width={64}
                  height={64}
                  className="size-12 object-contain md:size-16"
                />
              </div>

              <h1 className="mb-1 text-center text-xl font-black uppercase tracking-tight text-foreground md:text-2xl">
                Dashboard ASTRO
              </h1>
              <p className="mb-8 text-center text-sm font-light text-muted-foreground">
                Masuk untuk mengelola pendaftaran
              </p>

              {error && (
                <Alert variant="destructive" className="clip-angled mb-5 border-border">
                  <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleLogin} className="flex flex-col gap-5">
                <FieldGroup className="gap-5">
                  <Field>
                    <FieldLabel htmlFor="email" required>Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@astro2026.id"
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="password" required>Password</FieldLabel>
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

              <p className="mt-5 text-center text-xs text-muted-foreground">
                Belum punya akun?{' '}
                <Link href="/auth/signup" className="font-bold text-primary hover:underline">Daftar di sini</Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
