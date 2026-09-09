"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMotionValueEvent, useScroll } from "motion/react";
import {
  LogIn,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Menu,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "@/src/lib/auth-client";
import { BrandLock } from "@/components/brand/BrandLock";
import { CtaButton } from "@/components/brand/CtaButton";

type NavItem = { label: string; href: string };

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { scrollY } = useScroll();

  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const userRole = session?.user?.role ?? null;
  const isProfilePage = pathname.startsWith("/profile");

  useMotionValueEvent(scrollY, "change", (y) => {
    setIsScrolled(y > 16);
  });

  const scrollTo = (href: string) => {
    setIsMobileOpen(false);

    if (href.startsWith("/")) {
      router.push(href);
      return;
    }

    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        router.push((isProfilePage ? "/profile" : "/") + href);
      }
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/auth/login");
  };

  const handleDaftar = () => {
    if (isLoggedIn) {
      scrollTo(isProfilePage ? "/#competitions" : "#competitions");
    } else {
      router.push("/auth/login");
    }
  };

  const sectionLinks: NavItem[] = isProfilePage
    ? [
        { label: "Tentang", href: "#about-event" },
        { label: "Journey", href: "#journey" },
        { label: "Galeri", href: "#gallery" },
        { label: "Panitia", href: "#committee" },
        { label: "Lomba", href: "/" },
      ]
    : [
        { label: "Kompetisi", href: "#competitions" },
        { label: "Pengumuman", href: "/announcements" },
        { label: "Timeline", href: "#timeline" },
        { label: "FAQ", href: "#faq" },
        { label: "Profil", href: "/profile" },
      ];

  const isActive = (href: string) => {
    if (href === "/profile") return pathname.startsWith("/profile");
    if (href === "/announcements") return pathname.startsWith("/announcements");
    if (href === "/") return pathname === "/";
    return false;
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
      <div
        className={cn(
          "pointer-events-auto mx-auto grid h-14 w-full max-w-6xl grid-cols-[1fr_auto] items-center gap-3 rounded-full px-3 ring-1 backdrop-blur-md transition-all duration-300 sm:px-4 lg:grid-cols-[1fr_auto_1fr]",
          isScrolled
            ? "bg-white/90 shadow-soft ring-white/80"
            : "bg-white/55 shadow-soft-sm ring-white/70",
        )}
      >
        <button
          type="button"
          onClick={() => scrollTo(isProfilePage ? "/profile" : "#home")}
          className="cursor-pointer justify-self-start"
          aria-label="ASTRO 2026 beranda"
        >
          <BrandLock size="md" tone="plain" />
        </button>

        <nav
          className="hidden items-center justify-center gap-7 lg:flex"
          aria-label="Utama"
        >
          {sectionLinks.map((link) => (
            <NavLink
              key={link.label}
              label={link.label}
              active={isActive(link.href)}
              onClick={() => scrollTo(link.href)}
            />
          ))}
        </nav>

        <div className="flex items-center justify-end gap-1 justify-self-end sm:gap-2">
          {isLoggedIn ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="hidden items-center gap-1 px-2 py-1 text-sm font-semibold text-astro-navy/70 transition-colors hover:text-astro-navy md:inline-flex"
                >
                  Akun
                  <ChevronDown className="size-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onClick={() => router.push("/check-registration")}
                >
                  <Search /> Cek pendaftaran
                </DropdownMenuItem>
                {userRole === "admin" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                      <LayoutDashboard /> Dashboard
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut /> Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              type="button"
              onClick={() => router.push("/auth/login")}
              className="hidden items-center gap-1.5 px-2 py-1 text-sm font-semibold text-astro-navy/70 transition-colors hover:text-astro-navy md:inline-flex"
            >
              <LogIn className="size-3.5" aria-hidden />
              Masuk
            </button>
          )}

          <CtaButton
            onClick={handleDaftar}
            size="default"
            className="hidden h-9 px-4 text-xs sm:inline-flex"
          >
            Daftar
          </CtaButton>

          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="lg:hidden text-astro-navy"
                aria-label="Menu navigasi"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex h-full w-80 flex-col bg-white p-0"
            >
              <SheetHeader className="border-b border-sky-mid/60 p-5">
                <BrandLock size="sm" />
                <SheetTitle className="sr-only">ASTRO 2026</SheetTitle>
                <SheetDescription className="sr-only">
                  Menu navigasi ASTRO 2026
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-col gap-1 p-4">
                {sectionLinks.map((link) => (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => scrollTo(link.href)}
                    className={cn(
                      "rounded-full px-4 py-3 text-left text-sm font-semibold",
                      isActive(link.href)
                        ? "bg-sky-bottom text-astro-navy"
                        : "text-astro-navy/80 hover:bg-sky-bottom",
                    )}
                  >
                    {link.label}
                  </button>
                ))}
              </div>

              <div className="mt-auto flex flex-col gap-2 border-t border-sky-mid/60 p-4">
                {isLoggedIn ? (
                  <>
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => {
                        router.push("/check-registration");
                        setIsMobileOpen(false);
                      }}
                    >
                      <Search /> Cek pendaftaran
                    </Button>
                    {userRole === "admin" && (
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={() => {
                          router.push("/dashboard");
                          setIsMobileOpen(false);
                        }}
                      >
                        <LayoutDashboard /> Dashboard
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      className="justify-start text-destructive"
                      onClick={handleLogout}
                    >
                      <LogOut /> Keluar
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => {
                      router.push("/auth/login");
                      setIsMobileOpen(false);
                    }}
                  >
                    <LogIn /> Masuk
                  </Button>
                )}
                <CtaButton onClick={handleDaftar} className="w-full">
                  Daftar
                </CtaButton>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function NavLink({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative py-1 text-sm font-semibold tracking-tight transition-colors",
        active ? "text-astro-navy" : "text-astro-navy/60 hover:text-astro-navy",
      )}
    >
      {label}
      {active && (
        <span
          aria-hidden
          className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-astro-blue"
        />
      )}
    </button>
  );
}
