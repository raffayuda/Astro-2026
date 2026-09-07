'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from '@/src/lib/auth-client';
import {
  LayoutDashboard,
  ClipboardList,
  Download,
  LogOut,
  Trophy,
  Users,
  HelpCircle,
  Star,
  Calendar,
  ImageIcon,
  Award,
  User,
} from 'lucide-react';
import Image from 'next/image';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface Props {
  children: React.ReactNode;
  role: string;
  userName: string;
  userEmail: string;
}

export default function DashboardShell({ children, role, userName }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    ...(role === 'admin' ? [
      { href: '/dashboard/registrations', label: 'Pendaftaran', icon: ClipboardList },
      { href: '/dashboard/users', label: 'User', icon: Users },
      { href: '/dashboard/competitions', label: 'Kompetisi', icon: Trophy },
      { href: '/dashboard/faq', label: 'FAQ', icon: HelpCircle },
      { href: '/dashboard/sponsor', label: 'Sponsor', icon: Star },
      { href: '/dashboard/journey', label: 'Journey', icon: Calendar },
      { href: '/dashboard/gallery', label: 'Gallery', icon: ImageIcon },
      { href: '/dashboard/committee', label: 'Committee', icon: Users },
      { href: '/dashboard/certificates', label: 'Sertifikat', icon: Award },
      { href: '/dashboard/export', label: 'Export Data', icon: Download },
    ] : []),
    { href: '/dashboard/profile', label: 'Profil', icon: User },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas" className="border-r border-astro-cyan-2/55 bg-sky-bottom/95">
        <SidebarHeader className="border-b border-astro-cyan-2/55 bg-white/60">
          <Link href="/dashboard" className="flex items-center gap-3 px-2 py-1">
            <Image
              src="/assets/logo-astro.png"
              alt="ASTRO"
              width={36}
              height={36}
              className="size-8 object-contain"
            />
            <span className="font-title text-lg text-sidebar-foreground">
              ASTRO 2026
            </span>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href)}
                        className={cn(
                          isActive(item.href) &&
                            'border border-astro-cyan-2/70 bg-linear-to-b from-astro-blue/15 to-astro-blue/10 text-astro-blue hover:bg-sky-bottom hover:text-astro-blue'
                        )}
                      >
                        <Link href={item.href}>
                          <Icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <Separator className="mb-2" />
          <div className="rounded-xl bg-white shadow-soft flex items-center gap-3 px-4 py-3">
            <Avatar className="size-8 bg-primary text-primary-foreground">
              <AvatarFallback className="text-sm font-black">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-sidebar-foreground">{userName}</p>
              <p className="text-10 uppercase tracking-wider text-sidebar-foreground/70">{role}</p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleLogout}
              className="text-sidebar-foreground/70 hover:text-destructive"
              title="Keluar"
              aria-label="Keluar"
            >
              <LogOut />
            </Button>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 items-center gap-4 border-b border-astro-cyan-2/55 bg-white/70 px-4 shadow-sticker backdrop-blur-xl lg:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1" />
          <Link
            href="/"
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
          >
            Lihat Website
          </Link>
        </header>

        <main className="bg-linear-to-b from-sky-bottom via-white to-white flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
