"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/src/lib/auth-client";
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
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
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
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  role: string;
  userName: string;
  userEmail: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

function DashboardSidebarTrigger({ className }: { className?: string }) {
  const { toggleSidebar, openMobile, isMobile, open } = useSidebar();
  const isOpen = isMobile ? openMobile : open;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggleSidebar}
      aria-label={isOpen ? "Tutup menu sidebar" : "Buka menu sidebar"}
      aria-expanded={isOpen}
      className={cn(
        "size-9 shrink-0 rounded-lg border-astro-cyan-2/70 bg-white/95 text-astro-navy shadow-2xs hover:bg-sky-bottom hover:text-astro-blue focus-visible:ring-2 focus-visible:ring-astro-blue transition-all active:scale-95",
        className,
      )}
    >
      {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
    </Button>
  );
}

function DashboardSidebarHeader() {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarHeader className="border-b border-astro-cyan-2/55 bg-white/60">
      <div className="flex items-center justify-between px-2 py-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
          onClick={() => {
            if (isMobile) setOpenMobile(false);
          }}
        >
          <Image
            src="/assets/logo-astro.png"
            alt="ASTRO"
            width={36}
            height={36}
            className="size-8 object-contain"
          />
          <span className="font-title text-lg text-sidebar-foreground">ASTRO 2026</span>
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setOpenMobile(false)}
          aria-label="Tutup sidebar"
          className="size-8 rounded-lg text-sidebar-foreground/70 hover:bg-astro-cyan-2/20 hover:text-astro-navy md:hidden"
        >
          <X className="size-4.5" />
        </Button>
      </div>
    </SidebarHeader>
  );
}

function DashboardNavMenu({
  navItems,
  isActive,
}: {
  navItems: NavItem[];
  isActive: (href: string) => boolean;
}) {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarMenu className="gap-1.5">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive(item.href)}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                isActive(item.href) &&
                  "border border-astro-cyan-2/70 bg-linear-to-b from-astro-blue/15 to-astro-blue/10 text-astro-blue hover:bg-sky-bottom hover:text-astro-blue font-semibold shadow-xs",
              )}
            >
              <Link
                href={item.href}
                onClick={() => {
                  if (isMobile) setOpenMobile(false);
                }}
              >
                <Icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

function DashboardSidebarFooter({
  userName,
  role,
  onLogout,
}: {
  userName: string;
  role: string;
  onLogout: () => void;
}) {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
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
          onClick={() => {
            if (isMobile) setOpenMobile(false);
            onLogout();
          }}
          className="text-sidebar-foreground/70 hover:text-destructive"
          title="Keluar"
          aria-label="Keluar"
        >
          <LogOut />
        </Button>
      </div>
    </SidebarFooter>
  );
}

export default function DashboardShell({ children, role, userName }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [todayString, setTodayString] = useState<string>("");

  useEffect(() => {
    const now = new Date();
    setTodayString(
      now.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    );
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.replace("/auth/login");
  };

  const navItems: NavItem[] = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    ...(role === "admin"
      ? [
          { href: "/dashboard/registrations", label: "Pendaftaran", icon: ClipboardList },
          { href: "/dashboard/users", label: "User", icon: Users },
          { href: "/dashboard/competitions", label: "Kompetisi", icon: Trophy },
          { href: "/dashboard/faq", label: "FAQ", icon: HelpCircle },
          { href: "/dashboard/sponsor", label: "Sponsor", icon: Star },
          { href: "/dashboard/journey", label: "Journey", icon: Calendar },
          { href: "/dashboard/gallery", label: "Gallery", icon: ImageIcon },
          { href: "/dashboard/committee", label: "Committee", icon: Users },
          { href: "/dashboard/certificates", label: "Sertifikat", icon: Award },
          { href: "/dashboard/export", label: "Export Data", icon: Download },
        ]
      : []),
    { href: "/dashboard/profile", label: "Profil", icon: User },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas" className="border-r border-astro-cyan-2/55 bg-sky-bottom/95">
        <DashboardSidebarHeader />

        <SidebarContent>
          <SidebarGroup className="px-3 py-2">
            <SidebarGroupLabel className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/70">
              Menu
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <DashboardNavMenu navItems={navItems} isActive={isActive} />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <DashboardSidebarFooter userName={userName} role={role} onLogout={handleLogout} />
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 items-center justify-between gap-3 border-b border-astro-cyan-2/55 bg-white/80 px-4 shadow-soft-sm backdrop-blur-xl sm:gap-4 lg:px-6">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Hamburger button on mobile */}
            <DashboardSidebarTrigger className="md:hidden" />
            {/* Desktop collapsible trigger */}
            <SidebarTrigger className="hidden md:flex text-sidebar-foreground/70 hover:text-astro-navy hover:bg-sky-bottom" />

            {todayString ? (
              <div className="flex items-center gap-2 rounded-full border border-astro-cyan-2/50 bg-sky-bottom/50 px-3 py-1.5 text-xs text-muted-foreground shadow-2xs sm:px-3.5">
                <Calendar className="size-3.5 text-astro-blue shrink-0" />
                <span className="truncate">
                  Today is{" "}
                  <strong className="font-bold text-astro-navy">{todayString}</strong>
                </span>
              </div>
            ) : (
              <div className="h-7 w-36 sm:w-48 rounded-full bg-sky-bottom/40 animate-pulse" />
            )}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/"
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
            >
              Lihat Website
            </Link>
          </div>
        </header>

        <main className="bg-linear-to-b from-sky-bottom via-white to-white flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
