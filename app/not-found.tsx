"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { Home, Trophy, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Bubbles, ChevronRibbon, ChromeTitle, Pattern } from "@/components/brand";

const MotionImage = motion.create(Image);

export default function NotFound() {
  const reduce = useReducedMotion();

  return (
    <div className="relative bg-linear-to-b from-sky-top via-sky-mid to-white min-h-screen flex flex-col overflow-hidden">
      <Bubbles preset="sparse" />
      <ChevronRibbon edge="top" />
      <ChevronRibbon edge="bottom" />
      <Pattern className="absolute inset-0 opacity-35" />
      <Navbar />

      <main className="relative flex-1 flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        {/* ─── CLOUD & DECORATIVE ASSETS ─── */}
        <MotionImage
          src="/assets/cloud.png"
          alt=""
          width={320}
          height={220}
          animate={reduce ? undefined : { x: [0, 25, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[12%] -left-12 w-64 md:w-80 h-auto opacity-60 pointer-events-none select-none z-0"
        />

        <MotionImage
          src="/assets/cloud.png"
          alt=""
          width={360}
          height={240}
          animate={reduce ? undefined : { x: [0, -20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[18%] -right-16 w-72 md:w-96 h-auto opacity-55 pointer-events-none select-none z-0"
        />

        <MotionImage
          src="/assets/awan1.png"
          alt=""
          width={180}
          height={140}
          animate={reduce ? undefined : { x: [0, 15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[10%] left-[4%] w-24 md:w-40 h-auto opacity-75 pointer-events-none select-none z-0"
        />

        <MotionImage
          src="/assets/awan2.png"
          alt=""
          width={200}
          height={160}
          animate={reduce ? undefined : { x: [0, -12, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[14%] right-[4%] w-28 md:w-48 h-auto opacity-70 pointer-events-none select-none z-0"
        />

        {/* Floating Earth */}
        <MotionImage
          src="/assets/earth.png"
          alt=""
          width={200}
          height={200}
          animate={reduce ? undefined : { y: [0, -16, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] right-[10%] md:right-[18%] w-16 h-16 md:w-28 md:h-28 object-contain opacity-70 pointer-events-none select-none z-0"
        />

        {/* Floating Blobs */}
        <MotionImage
          src="/assets/blob-round.png"
          alt=""
          width={80}
          height={80}
          animate={reduce ? undefined : { y: [0, 14, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[22%] left-[12%] w-10 h-10 md:w-16 md:h-16 object-contain opacity-60 pointer-events-none select-none z-0"
        />

        {/* ─── 404 CONTENT CARD ─── */}
        <div className="relative z-10 max-w-xl mx-auto text-center">
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-xl bg-white shadow-soft flex flex-col gap-6 p-8"
          >
            <ChromeTitle depth="lg" align="middle" className="mx-auto max-w-sm">
              404
            </ChromeTitle>

            {/* Description */}
            <div className="mx-auto flex max-w-md flex-col gap-2">
              <h2 className="text-xl font-black uppercase tracking-tight text-astro-navy sm:text-2xl">
                Halaman Tidak Ditemukan
              </h2>
              <p className="text-sm font-medium leading-relaxed text-astro-navy/72 sm:text-base">
                Sepertinya rute atau koordinat yang Anda tuju telah berpindah
                atau berada di luar orbit sistem ASTRO 2026.
              </p>
            </div>

            {/* Accent divider */}
            <div className="flex justify-center py-1">
              <div className="h-1 w-14 rounded-full bg-astro-gold shadow-sticker-sm" />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                asChild
                size="lg"
                className="w-full rounded-xl px-6 text-xs font-black uppercase tracking-wider sm:w-auto"
              >
                <Link href="/">
                  <Home className="size-4" /> Kembali ke Beranda
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full rounded-xl border-white/80 bg-white/80 px-6 text-xs font-bold uppercase tracking-wider text-astro-navy shadow-sm hover:bg-white hover:text-astro-navy sm:w-auto"
              >
                <Link href="/#competitions">
                  <Trophy className="size-4 text-amber-500" /> Lihat Cabang
                  Lomba
                </Link>
              </Button>

              <Button
                asChild
                variant="ghost"
                size="lg"
                className="w-full sm:w-auto text-ink hover:text-astro-navy hover:bg-white/40 text-xs font-bold uppercase tracking-wider px-4"
              >
                <Link href="/check-registration">
                  <Search className="size-4" /> Cek Tiket
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
