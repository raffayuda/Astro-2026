'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, Users, Award, Target, ArrowRight, Camera, X, Calendar } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useJourneys, useJourneyPhotos } from '@/src/lib/hooks/use-queries';

const MotionImage = motion.create(Image);

/* Fallback color per year (DB doesn't store colors).
   Semua pakai biru sama seperti First Step (2023): cyan → sky. */
const yearColors: Record<string, string> = {
  '2023': 'from-cyan-500 to-sky-500',
  '2024': 'from-cyan-500 to-sky-500',
  '2025': 'from-cyan-500 to-sky-500',
  '2026': 'from-cyan-500 to-sky-500',
};

export default function JourneyDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const reduce = useReducedMotion();
  const [lightbox, setLightbox] = useState<string | null>(null);

  const { data: journeysData, isLoading: loadingJourneys } = useJourneys();

  const row = (journeysData || []).find((j: { id: string; year?: string | null }) => j.id === id || j.year === id);
  const { data: photosData } = useJourneyPhotos(row?.id ?? '');

  const data = useMemo(() => {
    if (!row) return null;
    return {
      year: row.year || row.id,
      theme: row.theme,
      participants: row.participants || 0,
      date: row.date || '',
      competitions: row.competitionsCount || 0,
      achievement: row.achievement || '',
      description: row.description || '',
      highlights: row.highlights || [],
      color: yearColors[row.year || row.id] || 'from-cyan-500 to-sky-500',
    };
  }, [row]);

  const photos: { id: number; url: string; caption: string | null }[] = photosData ?? [];

  if (!loadingJourneys && !data) {
    notFound();
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
  };

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
          <span className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-astro-cyan" />
          Memuat...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ═══ HERO BANNER ═══ */}
      <section className={`relative pt-28 pb-28 md:pt-36 md:pb-36 bg-gradient-to-br ${data.color} overflow-hidden`}>
        {/* Radial glow */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-[10%] w-[40%] h-[50%] bg-white/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-1/4 -right-[10%] w-[40%] h-[50%] bg-white/10 blur-[100px] rounded-full" />
        </div>

        {/* Floating clouds */}
        <MotionImage
          src="/assets/awan1.png" alt="" width={180} height={120}
          animate={reduce ? undefined : { x: [0, 18, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[6%] left-[2%] w-28 h-auto md:w-48 md:h-auto object-contain pointer-events-none select-none z-0 opacity-30"
        />
        <MotionImage
          src="/assets/awan2.png" alt="" width={220} height={150}
          animate={reduce ? undefined : { x: [0, -16, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[15%] -right-4 w-32 h-auto md:w-56 md:h-auto object-contain pointer-events-none select-none z-0 opacity-25"
        />
        <MotionImage
          src="/assets/awan1.png" alt="" width={140} height={100}
          animate={reduce ? undefined : { x: [0, 14, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[10%] left-[4%] w-20 h-auto md:w-36 md:h-auto object-contain pointer-events-none select-none z-0 opacity-20"
        />

        {/* Floating blobs */}
        <MotionImage
          src="/assets/blob-round.png" alt="" width={80} height={80}
          animate={reduce ? undefined : { y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[20%] right-[15%] w-12 h-12 md:w-20 md:h-20 object-contain pointer-events-none select-none z-0 opacity-25"
        />
        <MotionImage
          src="/assets/blob-round.png" alt="" width={64} height={64}
          animate={reduce ? undefined : { y: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute bottom-[15%] right-[6%] w-10 h-10 md:w-16 md:h-16 object-contain pointer-events-none select-none z-0 opacity-20"
        />

        <div className="relative z-10 max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            {/* Back */}
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white text-[11px] font-bold uppercase tracking-wider mb-10 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to Journey
            </Link>

            <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-end">
              {/* Title */}
              <div className="lg:col-span-8">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/90 bg-white/15 border border-white/25 backdrop-blur-sm mb-5"
                  style={{ clipPath: 'polygon(5px 0, 100% 0, calc(100% - 5px) 100%, 0 100%)' }}
                >
                  ASTRO {data.year}
                </span>
                <h1 className="font-masterpiece text-4xl md:text-6xl lg:text-7xl text-white leading-[0.95] drop-shadow-lg">
                  {data.theme}
                </h1>
              </div>

              {/* Stats row */}
              <div className="lg:col-span-4 flex gap-3 flex-wrap">
                {data.participants > 0 && (
                  <div className="flex-1 min-w-[100px] bg-white/10 backdrop-blur-sm border border-white/15 p-4 text-center"
                    style={{ clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)' }}
                  >
                    <div className="text-2xl md:text-3xl font-black text-white font-space-grotesk">{data.participants}+</div>
                    <div className="text-[9px] font-bold text-white/60 uppercase tracking-wider mt-1">Peserta</div>
                  </div>
                )}
                {data.date && (
                  <div className="flex-1 min-w-[100px] bg-white/10 backdrop-blur-sm border border-white/15 p-4 text-center"
                    style={{ clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)' }}
                  >
                    <div className="text-sm md:text-base font-black text-white font-space-grotesk leading-tight">{data.date}</div>
                    <div className="text-[9px] font-bold text-white/60 uppercase tracking-wider mt-1">Hari Pelaksanaan</div>
                  </div>
                )}
                <div className="flex-1 min-w-[100px] bg-white/10 backdrop-blur-sm border border-white/15 p-4 text-center"
                  style={{ clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)' }}
                >
                  <div className="text-2xl md:text-3xl font-black text-white font-space-grotesk">{data.competitions}</div>
                  <div className="text-[9px] font-bold text-white/60 uppercase tracking-wider mt-1">Cabang Lomba</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-white" />
      </section>

      {/* ═══ CONTENT ═══ */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
            {/* Left — Description & Highlights */}
            <div className="lg:col-span-7">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <div className="w-16 h-[3px] bg-astro-cyan mb-5" />
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[0.95] mb-6">
                  Tentang ASTRO
                  <br />
                  <span className="text-astro-cyan">{data.year}</span>
                </h2>

                <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-10 max-w-2xl">
                  {data.description}
                </p>

                <h3 className="text-[11px] font-black uppercase tracking-[0.18em] text-astro-cyan mb-5">Highlights</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {data.highlights.map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 text-sm text-slate-700 bg-slate-50 border border-slate-200/60 px-4 py-3"
                      style={{ clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)' }}
                    >
                      <span className="w-5 h-5 rounded-full bg-astro-cyan/10 text-astro-cyan flex items-center justify-center shrink-0">
                        <Target className="w-3 h-3" />
                      </span>
                      {h}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right — Sidebar achievement card */}
            <div className="lg:col-span-5">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="sticky top-28"
              >
                <div className="bg-gradient-to-br from-cyan-50 to-sky-50 border border-cyan-100/80 p-8"
                  style={{ clipPath: 'polygon(16px 0, 100% 0, calc(100% - 16px) 100%, 0 100%)' }}
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-astro-cyan flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Pencapaian</h3>
                  </div>

                  {/* Achievement block */}
                  <div className="bg-white/80 border border-cyan-100/80 p-5 mb-5"
                    style={{ clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)' }}
                  >
                    <div className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-sm font-bold text-slate-900">{data.achievement}</p>
                    </div>
                  </div>

                  {/* Mini stats grid */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-white/80 border border-cyan-100/70 p-4 text-center"
                      style={{ clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)' }}
                    >
                      <Users className="w-4 h-4 text-astro-cyan mx-auto mb-1" />
                      <p className="text-lg font-black text-slate-900">{data.participants > 0 ? data.participants.toLocaleString() : '-'}</p>
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Peserta</p>
                    </div>
                    <div className="bg-white/80 border border-cyan-100/70 p-4 text-center"
                      style={{ clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)' }}
                    >
                      <Calendar className="w-4 h-4 text-astro-cyan mx-auto mb-1" />
                      <p className="text-sm font-black text-slate-900 leading-tight">{data.date || '-'}</p>
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Hari Pelaksanaan</p>
                    </div>
                    <div className="bg-white/80 border border-cyan-100/70 p-4 text-center"
                      style={{ clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)' }}
                    >
                      <Target className="w-4 h-4 text-astro-cyan mx-auto mb-1" />
                      <p className="text-lg font-black text-slate-900">{data.competitions}</p>
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Lomba</p>
                    </div>
                  </div>

                  {/* Navigation between years */}
                  <div className="flex justify-between items-center pt-5 border-t border-cyan-200/60">
                    {parseInt(data.year) > 2023 ? (
                      <Link
                        href={`/profile/journey/${String(parseInt(data.year) - 1)}`}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-astro-cyan transition-colors group"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                        {parseInt(data.year) - 1}
                      </Link>
                    ) : <div />}
                    {parseInt(data.year) < 2026 ? (
                      <Link
                        href={`/profile/journey/${String(parseInt(data.year) + 1)}`}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-astro-cyan transition-colors group"
                      >
                        {parseInt(data.year) + 1}
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    ) : <div />}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* ═══ Documentation Gallery ═══ */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-20 md:mt-28"
          >
            <div className="text-center mb-12">
              <div className="w-16 h-[3px] bg-astro-cyan mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-2">
                Dokumentasi
              </h2>
              <p className="text-sm text-slate-500 font-light">Momen-momen berharga selama perjalanan ASTRO {data.year}</p>
            </div>

            {photos.length === 0 ? (
              <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center"
                style={{ clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)' }}>
                <Camera className="mb-3 size-8 text-slate-300" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Belum ada foto dokumentasi untuk ASTRO {data.year}
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {photos.map((doc, i) => (
                  <motion.button
                    key={doc.id}
                    type="button"
                    onClick={() => setLightbox(doc.url)}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={reduce ? {} : { y: -6 }}
                    className="group relative block aspect-[4/3] cursor-pointer overflow-hidden border border-slate-200/80 bg-slate-100 hover:border-astro-cyan/40 text-left"
                    style={{ clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={doc.url}
                      alt={doc.caption || `Dokumentasi ASTRO ${data.year}`}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {doc.caption && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-8">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white">{doc.caption}</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-white/0 transition-all duration-300 group-hover:bg-astro-cyan/20 flex items-end justify-end p-4">
                      <span className="flex items-center gap-1 text-[9px] font-black text-astro-600 uppercase tracking-wider opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <Camera className="size-3" /> Lihat
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ═══ Lightbox ═══ */}
          {lightbox && (
            <div
              onClick={() => setLightbox(null)}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            >
              <button
                onClick={() => setLightbox(null)}
                aria-label="Tutup"
                className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <X className="size-5" />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightbox}
                alt="Dokumentasi ASTRO"
                className="max-h-[85vh] max-w-[90vw] object-contain shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
