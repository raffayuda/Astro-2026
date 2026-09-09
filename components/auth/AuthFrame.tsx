"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { BrandLock, WindowCard } from "@/components/brand";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

export function AuthFrame({
  title,
  description,
  activeTab,
  children,
}: {
  title: string;
  description?: string;
  activeTab?: "login" | "signup";
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
      className="flex w-full min-w-0 flex-col items-center gap-6"
    >
      <Link
        href="/"
        aria-label="Beranda ASTRO 2026"
        className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-astro-blue"
      >
        <BrandLock size="md" />
      </Link>
      <WindowCard title="Akun ASTRO 2026" className="w-full" bodyClassName="p-5 sm:p-8">
        {activeTab && (
          <nav
            aria-label="Akses akun"
            className="mb-7 grid grid-cols-2 gap-1 rounded-full bg-sky-bottom p-1"
          >
            {(
              [
                { value: "login", label: "Masuk", href: "/auth/login" },
                { value: "signup", label: "Buat akun", href: "/auth/signup" },
              ] as const
            ).map((tab) => (
              <Link
                key={tab.value}
                href={tab.href}
                aria-current={activeTab === tab.value ? "page" : undefined}
                className={cn(
                  "flex min-h-10 items-center justify-center rounded-full px-4 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-astro-blue",
                  activeTab === tab.value
                    ? "bg-astro-navy text-white shadow-gloss"
                    : "text-astro-navy/70 hover:text-astro-navy",
                )}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        )}
        <header className="mb-6 flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-astro-navy sm:text-3xl">
            {title}
          </h1>
          {description && <p className="text-sm leading-relaxed text-ink/70">{description}</p>}
        </header>
        {children}
      </WindowCard>
      <Link
        href="/"
        className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-medium text-astro-navy focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-astro-blue"
      >
        <ArrowLeft className="size-4" aria-hidden /> Kembali ke beranda
      </Link>
    </motion.div>
  );
}
