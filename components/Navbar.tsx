'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LogIn, ChevronDown, LogOut, LayoutDashboard, Menu, Search, Trophy, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useSession, signOut } from '@/src/lib/auth-client';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const userRole = session?.user?.role ?? null;

  const isProfilePage = pathname.startsWith('/profile');

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setIsMobileOpen(false);

    // Full route (starts with /) → navigate directly
    if (href.startsWith('/')) {
      router.push(href);
      return;
    }

    // Hash anchor → scroll on current page or navigate first
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        const basePath = isProfilePage ? '/profile' : '/';
        router.push(basePath + href);
      }
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  const handleDaftar = () => {
    if (isLoggedIn) {
      scrollTo(isProfilePage ? '/#competitions' : '#competitions');
    } else {
      router.push('/login');
    }
  };

  // Section links specific to Company Profile page vs Competition Home page
  const sectionLinks = isProfilePage
    ? [
        { label: 'TENTANG', href: '#about-event' },
        { label: 'JOURNEY', href: '#journey' },
        { label: 'GALLERY', href: '#gallery' },
        { label: 'MEDIA', href: '#social' },
        { label: 'PANITIA', href: '#committee' },
        { label: 'PENGUMUMAN', href: '/announcements' },
      ]
    : [
        { label: 'KOMPETISI', href: '#competitions' },
        { label: 'PENGUMUMAN', href: '/announcements' },
        { label: 'TIMELINE', href: '#timeline' },
        { label: 'FAQ', href: '#faq' },
      ];

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between transition-all duration-300 md:h-[72px]',
          isScrolled
            ? 'rounded-full bg-white shadow-soft-sm mx-4 mt-3 border-white/80 bg-white/75 shadow-[0_10px_28px_rgba(49,87,255,0.18)] md:mx-8'
            : 'mt-0 rounded-none border-transparent bg-transparent'
        )}
      >
        {/* Left: Logo */}
        <div className="flex h-full items-center pl-4 md:pl-6">
          <button
            onClick={() => scrollTo(isProfilePage ? '/profile' : '#home')}
            className="group flex cursor-pointer items-center gap-3"
          >
            <Image
              src="/assets/logo-astro.png"
              alt="ASTRO Logo"
              width={44}
              height={44}
              className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105 md:h-11"
            />
            <span className={cn('font-title text-sm tracking-wide transition-colors duration-300 md:text-base', isScrolled ? 'text-[#3157ff]' : 'text-foreground md:text-white')}>
              ASTRO 2026
            </span>
          </button>
        </div>

        {/* Middle: Desktop Navigation Links + Portal Switcher Pill */}
        <div className="hidden h-full items-center gap-2 md:flex">
          <div className="mx-1 flex items-center gap-1">
            {sectionLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href)}
                className={cn(
                  'relative flex h-9 items-center rounded-[14px] px-3.5 text-[11px] font-extrabold uppercase tracking-[0.12em] transition-all duration-200',
                  isScrolled
                    ? 'text-[#3157ff]/75 hover:bg-[#e8f8ff] hover:text-[#3157ff]'
                    : 'text-slate-800 hover:bg-white/20 hover:text-white md:text-white/90'
                )}
              >
                {link.label}
              </button>
            ))}
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={() => router.push(isProfilePage ? '/' : '/profile')}
            className="rounded-[16px] border-2 border-white/70 text-[10px] font-black uppercase tracking-wider shadow-md hover:shadow-cyan-500/30 active:scale-95"
            title={isProfilePage ? 'Ke Halaman Utama Portal Lomba ASTRO' : 'Ke Halaman Company Profile ASTRO'}
          >
            {isProfilePage ? <Trophy className="text-slate-950" /> : <Building2 className="text-slate-950" />}
            {isProfilePage ? 'PORTAL LOMBA' : 'COMPANY PROFILE'}
          </Button>
        </div>

        {/* Right: CTA + Mobile */}
        <div className="flex h-full items-center gap-2 pr-4 md:pr-6">
          {isLoggedIn ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'hidden gap-1.5 text-[10px] font-bold uppercase tracking-wider md:flex',
                    !isScrolled && 'md:text-white/80 md:hover:text-white'
                  )}
                >
                  <LogIn className="size-3.5" /> Akun <ChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => router.push('/check-registration')}>
                  <Search /> Cek Pendaftaran
                </DropdownMenuItem>
                {userRole === 'admin' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                      <LayoutDashboard /> Dashboard
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/login')}
              className={cn(
                'hidden gap-1.5 text-[10px] font-bold uppercase tracking-wider md:flex',
                !isScrolled && 'md:text-white/80 md:hover:text-white'
              )}
            >
              <LogIn className="size-3" /> Masuk
            </Button>
          )}

          <Button
            variant="default"
            size="sm"
            onClick={handleDaftar}
            className="rounded-[16px] border-2 border-white/70 text-[11px] font-black uppercase tracking-wider shadow-md active:scale-95"
          >
            Daftar
          </Button>

          {/* Mobile menu trigger */}
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn('md:hidden', !isScrolled && 'text-slate-900 md:text-white')}
                aria-label="Menu Navigasi"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-[#effaff]/95 p-0 backdrop-blur-2xl">
              <SheetHeader className="border-b border-border p-5">
                <div className="flex items-center gap-2">
                  <Image src="/assets/logo-astro.png" alt="ASTRO Logo" width={32} height={32} className="h-8 w-auto object-contain" />
                  <SheetTitle className="font-title text-xs">ASTRO 2026</SheetTitle>
                </div>
                <SheetDescription className="sr-only">Menu navigasi ASTRO 2026</SheetDescription>
              </SheetHeader>

              <div className="flex flex-col gap-4 overflow-y-auto p-6">
                {/* Portal Switcher */}
                <div className="border-b border-border pb-3">
                  <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Pindah Web Portal</p>
                  <Button
                    variant="default"
                    className="rounded-[16px] w-full items-center justify-between px-4 py-3 text-xs font-black uppercase tracking-wider shadow-md"
                    onClick={() => {
                      router.push(isProfilePage ? '/' : '/profile');
                      setIsMobileOpen(false);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      {isProfilePage ? <Trophy className="size-4 text-slate-950" /> : <Building2 className="size-4 text-slate-950" />}
                      {isProfilePage ? 'Ke Portal Lomba Acara' : 'Ke Company Profile'}
                    </span>
                    <span className="text-[10px] font-black text-slate-950">↗</span>
                  </Button>
                </div>

                {/* Section Links */}
                <div className="flex flex-col gap-1">
                  <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Navigasi Halaman</p>
                  {sectionLinks.map((link) => (
                    <button
                      key={link.label}
                      onClick={() => scrollTo(link.href)}
                      className="group flex items-center justify-between rounded-[16px] px-4 py-3 text-left text-xs font-extrabold tracking-wider text-muted-foreground transition-all hover:bg-white hover:text-[#3157ff]"
                    >
                      <span>{link.label}</span>
                      <span className="size-1.5 rounded-sm bg-primary opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  ))}
                </div>

                <div className="mt-auto">
                  <Separator className="mb-4" />
                  <div className="rounded-xl bg-white shadow-soft flex flex-col gap-0.5 p-2">
                    {isLoggedIn ? (
                      <>
                        <Button variant="ghost" className="justify-start gap-3 px-3.5 py-3 text-xs font-bold tracking-wider" onClick={() => { router.push('/check-registration'); setIsMobileOpen(false); }}>
                          <Search className="size-4 text-muted-foreground" /> Cek Pendaftaran
                        </Button>
                        {userRole === 'admin' && (
                          <Button variant="ghost" className="justify-start gap-3 px-3.5 py-3 text-xs font-bold tracking-wider" onClick={() => { router.push('/dashboard'); setIsMobileOpen(false); }}>
                            <LayoutDashboard className="size-4 text-muted-foreground" /> Dashboard
                          </Button>
                        )}
                        <Button variant="ghost" className="justify-start gap-3 px-3.5 py-3 text-xs font-bold tracking-wider text-destructive" onClick={handleLogout}>
                          <LogOut className="size-4" /> Logout
                        </Button>
                      </>
                    ) : (
                      <Button variant="ghost" className="justify-start gap-3 px-3.5 py-3 text-xs font-bold tracking-wider" onClick={() => { router.push('/login'); setIsMobileOpen(false); }}>
                        <LogIn className="size-4 text-muted-foreground" /> Masuk
                      </Button>
                    )}
                  </div>

                  <Button
                    variant="default"
                    className="mt-3 w-full rounded-[16px] py-3.5 text-xs font-black uppercase tracking-wider shadow-md active:scale-95"
                    onClick={handleDaftar}
                  >
                    Daftar Sekarang
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
}
