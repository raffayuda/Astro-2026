"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { PageShell } from "@/components/brand";
import { CtaButton } from "@/components/brand/CtaButton";
import { Surface } from "@/components/brand/Surface";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PageShell>
      <div className="flex min-h-[70svh] items-center justify-center px-5 py-24">
        <Surface tone="plain" radius="2xl" pad="xl" className="max-w-md text-center">
          <p className="font-heading text-6xl font-black tracking-tight text-astro-navy">404</p>
          <h1 className="mt-4 font-heading text-2xl font-black text-astro-navy">
            Halaman tidak ditemukan
          </h1>
          <p className="mt-2 text-sm font-medium leading-relaxed text-ink/75">
            Alamat yang kamu tuju tidak ada, sudah dipindah, atau salah ketik.
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            <CtaButton href="/" size="default" showChevron={false}>
              <Home className="size-4" /> Beranda
            </CtaButton>
            <Button asChild variant="outline">
              <Link href="/#competitions">Lihat lomba</Link>
            </Button>
          </div>
        </Surface>
      </div>
    </PageShell>
  );
}
