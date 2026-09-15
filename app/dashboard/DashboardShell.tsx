"use client";

import Link from "next/link";
import Image from "next/image";
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
  Sparkles,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AiAssistantDrawer } from "@/components/dashboard/AiAssistantDrawer";
import { AiChatProvider } from "@/components/dashboard/AiChatContext";
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
  icon: LucideIcon;
}

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/ai": "ASTRO Copilot",
  "/dashboard/registrations": "Pendaftaran",
  "/dashboard/users": "User",
  "/dashboard/competitions": "Kompetisi",
  "/dashboard/competitions/new": "Tambah Lomba",
  "/dashboard/faq": "FAQ",
  "/dashboard/sponsor": "Sponsor",
  "/dashboard/journey": "Journey",
  "/dashboard/gallery": "Gallery",
  "/dashboard/committee": "Committee",
  "/dashboard/certificates": "Sertifikat",
  "/dashboard/export": "Export Data",
  "/dashboard/profile": "Profil",
  "/dashboard/my-registrations": "Pendaftaran Saya",
};

function resolvePageTitle(pathname: string) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/dashboard/registrations/")) return "Detail Pendaftaran";
  if (/^\/dashboard\/competitions\/[^/]+\/edit\/?$/.test(pathname)) return "Edit Lomba";
  const match = Object.keys(PAGE_TITLES)
    .filter((k) => k !== "/dashboard" && pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];
  return match ? PAGE_TITLES[match] : "Dashboard";
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
      className={cn("size-9 shrink-0", className)}
    >
      {isOpen ? <X className="size-4" /> : <Menu className="size-4" />}
    </Button>
  );
}

function DashboardSidebarHeader() {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarHeader className="border-b border-sidebar-border">
      <div className="flex items-center justify-between gap-2 px-2 py-1">
        <Link
          href="/dashboard"
          className="flex min-w-0 items-center gap-2.5"
          onClick={() => {
            if (isMobile) setOpenMobile(false);
          }}
        >
          <Image
            src="/assets/logo-astro.png"
            alt="ASTRO"
            width={32}
            height={32}
            className="size-8 object-contain"
          />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold">ASTRO 2026</p>
            <p className="truncate text-xs text-muted-foreground">Admin</p>
          </div>
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setOpenMobile(false)}
          aria-label="Tutup sidebar"
          className="md:hidden"
        >
          <X className="size-4" />
        </Button>
      </div>
    </SidebarHeader>
  );
}

function NavGroup({
  label,
  items,
  isActive,
}: {
  label: string;
  items: NavItem[];
  isActive: (href: string) => boolean;
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  if (items.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.href)}
                  tooltip={item.label}
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
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function DashboardSidebarFooter({
  userName,
  userEmail,
  role,
  onLogout,
}: {
  userName: string;
  userEmail: string;
  role: string;
  onLogout: () => void;
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  const initials =
    userName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "U";

  return (
    <SidebarFooter>
      <Separator className="mb-2" />
      <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary text-xs font-medium text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{userName}</p>
          <p className="truncate text-xs text-muted-foreground">{userEmail || role}</p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            if (isMobile) setOpenMobile(false);
            onLogout();
          }}
          className="text-muted-foreground hover:text-destructive"
          title="Keluar"
          aria-label="Keluar"
        >
          <LogOut />
        </Button>
      </div>
    </SidebarFooter>
  );
}

export default function DashboardShell({ children, role, userName, userEmail }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.replace("/auth/login");
  };

  const mainNav: NavItem[] = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/ai", label: "ASTRO Copilot", icon: Sparkles },
    { href: "/dashboard/registrations", label: "Pendaftaran", icon: ClipboardList },
    { href: "/dashboard/users", label: "User", icon: Users },
    { href: "/dashboard/competitions", label: "Kompetisi", icon: Trophy },
  ];

  const contentNav: NavItem[] =
    role === "admin"
      ? [
          { href: "/dashboard/faq", label: "FAQ", icon: HelpCircle },
          { href: "/dashboard/sponsor", label: "Sponsor", icon: Star },
          { href: "/dashboard/journey", label: "Journey", icon: Calendar },
          { href: "/dashboard/gallery", label: "Gallery", icon: ImageIcon },
          { href: "/dashboard/committee", label: "Committee", icon: Users },
          { href: "/dashboard/certificates", label: "Sertifikat", icon: Award },
        ]
      : [];

  const toolsNav: NavItem[] =
    role === "admin"
      ? [{ href: "/dashboard/export", label: "Export Data", icon: Download }]
      : [];

  const accountNav: NavItem[] = [{ href: "/dashboard/profile", label: "Profil", icon: User }];

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <AiChatProvider>
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <DashboardSidebarHeader />

          <SidebarContent>
            <NavGroup label="Utama" items={mainNav} isActive={isActive} />
            <NavGroup label="Konten" items={contentNav} isActive={isActive} />
            <NavGroup label="Alat" items={toolsNav} isActive={isActive} />
            <NavGroup label="Akun" items={accountNav} isActive={isActive} />
          </SidebarContent>

          <DashboardSidebarFooter
            userName={userName}
            userEmail={userEmail}
            role={role}
            onLogout={handleLogout}
          />
          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80 md:px-6">
            <DashboardSidebarTrigger className="md:hidden" />
            <SidebarTrigger className="hidden md:inline-flex" />
            <Separator orientation="vertical" className="mr-1 hidden h-4 sm:block" />
            <p className="min-w-0 flex-1 truncate text-sm font-medium">
              {resolvePageTitle(pathname)}
            </p>
            <Button variant="ghost" size="sm" asChild className="hidden text-muted-foreground sm:inline-flex">
              <Link href="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink data-icon="inline-start" />
                Website
              </Link>
            </Button>
          </header>

          <main className="flex-1 overflow-auto bg-muted/30 p-4 md:p-6">{children}</main>
          <AiAssistantDrawer />
        </SidebarInset>
      </SidebarProvider>
    </AiChatProvider>
  );
}
