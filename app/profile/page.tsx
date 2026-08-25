"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
} from "motion/react";
import {
  ArrowRight,
  Calendar,
  Users,
  Sparkles,
  Award,
  ShieldCheck,
  Eye,
  Target,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CommitteeSection from "@/components/CommitteeSection";
import EventGallerySection from "@/components/EventGallerySection";
import SocialMediaSection from "@/components/SocialMediaSection";
import ProfileHero from "@/components/ProfileHero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useJourneys } from "@/src/lib/hooks/use-queries";
import SponsorSection from "@/components/SponsorSection";

const MotionImage = motion.create(Image);

/* ─── Journey (now fetched from API) ─── */

export default function ProfilePage() {
  const reduce = useReducedMotion();
  const router = useRouter();
  const [showAllJourney, setShowAllJourney] = useState(false);
  const { data: journeysData } = useJourneys();
  const journey = useMemo(
    () =>
      (journeysData || []).map((j: any) => ({
        year: j.year || j.id,
        theme: j.theme,
        participants: j.participants || 0,
        date: j.date || "",
        competitions: j.competitionsCount || 0,
        achievement: j.achievement || "",
        description: j.description || "",
        highlights: j.highlights || [],
      })),
    [journeysData],
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ════════════ 1. HERO — CINEMATIC SPLIT ════════════ */}
      <ProfileHero />

      {/* ════════════ 2. ABOUT ASTRO ════════════ */}
      <section
        id="about-event"
        className="relative py-20 md:py-28 bg-gradient-to-b from-sky-100 via-sky-200 to-sky-200 overflow-hidden"
      >
        {/* Floating blobs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Image
            src="/assets/blob-round.png"
            alt=""
            width={112}
            height={112}
            className="absolute top-[2%] right-[2%] w-12 h-12 md:w-40 md:h-40 md:top-[8%] md:right-[12%] object-contain pointer-events-none select-none z-10"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <Image
            src="/assets/blob-round.png"
            alt=""
            width={96}
            height={96}
            className="absolute top-[30%] left-[1%] w-12 h-12 md:w-36 md:h-36 md:top-[35%] md:left-[2%] object-contain pointer-events-none select-none z-10"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Image
            src="/assets/blob-round.png"
            alt=""
            width={64}
            height={64}
            className="absolute top-[60%] right-[1%] w-10 h-10 md:w-24 md:h-24 md:top-[55%] md:right-[3%] object-contain pointer-events-none select-none z-10"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Image
            src="/assets/blob-round.png"
            alt=""
            width={80}
            height={80}
            className="absolute bottom-[2%] left-[2%] w-10 h-10 md:w-32 md:h-32 md:bottom-[10%] md:left-[10%] object-contain pointer-events-none select-none z-10"
          />
        </motion.div>

        {/* Earth decorative */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-[5%] right-[5%] md:top-[12%] md:right-[4%] z-10 pointer-events-none select-none"
        >
          <MotionImage
            src="/assets/earth.png"
            alt=""
            width={280}
            height={280}
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="w-15 h-15 md:w-[280px] md:h-[280px] object-contain"
          />
        </motion.div>

        {/* Awan decorative */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-[32%] left-[1%] md:top-[12%] md:left-[3%] z-10 pointer-events-none select-none"
        >
          <MotionImage
            src="/assets/awan1.png"
            alt=""
            width={160}
            height={160}
            animate={{ x: [0, 15, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="w-10 h-10 md:w-[160px] md:h-[160px] object-contain"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-[8%] right-[1%] md:bottom-[15%] md:right-[3%] z-10 pointer-events-none select-none"
        >
          <MotionImage
            src="/assets/awan2.png"
            alt=""
            width={200}
            height={200}
            animate={{ x: [0, -12, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
            className="w-10 h-10 md:w-[200px] md:h-[200px] object-contain"
          />
        </motion.div>

        <div className="relative z-30 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* ── Left Column: Title, Desc, Key Features ── */}
            <div className="lg:col-span-7 flex flex-col justify-between h-full">
              <div>
                <motion.div
                  initial={reduce ? false : { opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="accent-line mb-3" />
                  <h2 className="font-masterpiece text-5xl md:text-6xl lg:text-7xl text-slate-900 leading-tight">
                    Tentang <br />
                    <span className="text-astro-cyan">ASTRO 2026</span>
                  </h2>
                </motion.div>

                <motion.p
                  initial={reduce ? false : { opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-sm md:text-base text-slate-650 mt-6 leading-relaxed font-normal max-w-2xl"
                >
                  ASTRO adalah program kerja tahunan BEM STT-NF yang telah
                  berlangsung sejak BEM dibentuk, yang awalnya hanya sebatas
                  classmeet dan berkembang hingga seperti sekarang. Dengan
                  target partisipan yang lebih luas, baik dari internal hingga
                  eksternal kampus.
                  <br />
                  <br />
                  ASTRO 2026 menghadirkan kompetisi dan festival pendidikan,
                  seni dan olahraga bagi pelajar SMA/SMK serta mahasiswa/i.
                  Acara ini menjadi wadah pengembangan kreativitas,
                  keterampilan, dan sportivitas generasi muda.
                </motion.p>
              </div>

              {/* Key Features Grid */}
              <div className="mt-14 grid sm:grid-cols-2 gap-8 max-w-xl">
                {[
                  {
                    icon: Sparkles,
                    title: "Multi-Disiplin Lomba",
                    desc: "Menggabungkan kategori akademik, olahraga, dan esports secara seimbang.",
                  },
                  {
                    icon: Award,
                    title: "Hadiah Fantastis",
                    desc: "Penghargaan resmi dan dana pembinaan bernilai jutaan rupiah untuk para pemenang.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Juri Profesional",
                    desc: "Sistem penilaian yang objektif, transparan, dan terpercaya oleh para ahli.",
                  },
                  {
                    icon: Users,
                    title: "Komunitas Pelajar",
                    desc: "Membangun jaringan relasi dan persahabatan positif antar peserta.",
                  },
                ].map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={feature.title}
                      initial={reduce ? false : { opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: i * 0.08,
                        duration: 0.4,
                        ease: [0.16, 1, 0.3, 1] as const,
                      }}
                      className="flex flex-col gap-3"
                    >
                      <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-200/40 flex items-center justify-center text-astro-cyan flex-shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                          {feature.title}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {feature.desc}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* ── Right Column: Visi & Misi Cards ── */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Visi Kami */}
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-astro-cyan flex items-center justify-center shrink-0">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Visi Kami
                    </h3>
                  </div>
                  <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                    Menjadikan ASTRO 2026 sebagai festival mahasiswa yang
                    mengintegrasikan olahraga, pendidikan, dan kesenian dalam
                    semangat pelestarian budaya Nusantara guna menciptakan
                    generasi yang berprestasi, kreatif, dan berkarakter.
                  </p>
                </div>
              </motion.div>

              {/* Misi Kami */}
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-full bg-astro-cyan flex items-center justify-center shrink-0">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Misi Kami
                    </h3>
                  </div>
                  <ol className="space-y-4">
                    {[
                      "Menghadirkan rangkaian kegiatan yang inovatif, kompetitif, dan edukatif sebagai wadah pengembangan potensi mahasiswa.",
                      "Meningkatkan apresiasi terhadap budaya dan kesenian Nusantara melalui konsep acara yang relevan dengan generasi muda.",
                      "Membangun kolaborasi dan kebersamaan antar mahasiswa melalui kegiatan yang menjunjung sportivitas, kreativitas, dan rasa kekeluargaan.",
                      "Menciptakan pengalaman acara yang profesional, berkesan, dan berdampak positif bagi seluruh partisipan.",
                      "Menjadikan ASTRO 2026 sebagai wadah untuk mengembangkan potensi, kreativitas, dan prestasi mahasiswa secara berkelanjutan.",
                    ].map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-4 text-sm text-slate-600 leading-relaxed"
                      >
                        <span className="w-6 h-6 rounded-full bg-astro-cyan/10 text-astro-cyan text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ol>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ 4. ASTRO JOURNEY — CINEMATIC BENTO ════════════ */}
      <section
        id="journey"
        className="relative py-28 md:py-36 overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-sky-200"
      >
        {/* Ambient radial glow */}
        <div className="absolute top-1/3 -left-[20%] w-[40%] h-[50%] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 -right-[10%] w-[30%] h-[40%] bg-sky-500/5 blur-[100px] rounded-full pointer-events-none" />

        {/* Floating clouds */}
        <MotionImage
          src="/assets/awan1.png"
          alt=""
          width={200}
          height={140}
          animate={reduce ? undefined : { x: [0, 18, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[6%] left-[2%] w-28 h-auto md:w-52 md:h-auto object-contain pointer-events-none select-none z-0 opacity-30"
        />
        <MotionImage
          src="/assets/awan2.png"
          alt=""
          width={240}
          height={160}
          animate={reduce ? undefined : { x: [0, -18, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[18%] -right-4 w-32 h-auto md:w-56 md:h-auto object-contain pointer-events-none select-none z-0 opacity-25"
        />
        <MotionImage
          src="/assets/awan1.png"
          alt=""
          width={160}
          height={110}
          animate={reduce ? undefined : { x: [0, 12, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[15%] left-[4%] w-20 h-auto md:w-40 md:h-auto object-contain pointer-events-none select-none z-0 opacity-20"
        />

        <div className="relative z-10 max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
          {/* Section Header — centered */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-20 md:mb-28"
          >
            <span className="text-[10px] font-extrabold tracking-[0.25em] uppercase text-slate-400 mb-4 block">
              Milestones
            </span>
            <h2 className="font-masterpiece text-5xl md:text-7xl lg:text-8xl text-slate-900 leading-[0.9] mb-5">
              ASTRO
              <br />
              <span className="text-astro-cyan">Journey</span>
            </h2>
            <p className="text-sm md:text-base text-slate-500 font-light max-w-lg mx-auto">
              Setiap tahun adalah babak baru dalam perjalanan menuju inovasi
              tanpa batas.
            </p>
          </motion.div>

          {/* Journey Grid — bento style alternating */}
          <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-12 md:gap-6 lg:gap-8">
            {journey.map((j, idx) => {
              const isFuture = idx === journey.length - 1;
              const isLarge = idx % 2 === 0;

              return (
                <motion.div
                  key={j.year}
                  initial={reduce ? false : { opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    delay: idx * 0.12,
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={`${isLarge ? "md:col-span-7" : "md:col-span-5"} ${idx === 2 ? "md:col-start-1" : ""} ${idx === 3 ? "md:col-start-8" : ""}`}
                >
                  <button
                    onClick={() => router.push(`/profile/journey/${j.year}`)}
                    className="block h-full w-full text-left group"
                  >
                    <div
                      className={`relative h-full bg-white border border-slate-200/80 hover:border-astro-cyan/30 p-8 md:p-10 transition-all duration-500 hover:shadow-xl hover:shadow-cyan-500/5 hover:-translate-y-1 overflow-hidden cursor-pointer ${
                        isFuture
                          ? "border-astro-cyan/20 bg-gradient-to-br from-white to-cyan-50/30"
                          : ""
                      }`}
                      style={{
                        clipPath: isLarge
                          ? "polygon(20px 0, 100% 0, calc(100% - 20px) 100%, 0 100%)"
                          : "polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)",
                      }}
                    >
                      {/* Year watermark */}
                      <div className="absolute -top-4 -right-2 text-[clamp(5rem,10vw,9rem)] font-black text-slate-900/[0.03] leading-none pointer-events-none select-none">
                        {j.year}
                      </div>

                      {/* Year badge */}
                      <div className="flex items-center gap-3 mb-6">
                        <span
                          className={`inline-flex items-center justify-center px-4 h-10 text-base font-black tracking-tight ${
                            isFuture
                              ? "bg-astro-cyan text-white shadow-md shadow-cyan-500/20"
                              : "bg-slate-100 text-slate-700 group-hover:bg-astro-cyan group-hover:text-white"
                          } transition-colors duration-300`}
                          style={{
                            clipPath:
                              "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                          }}
                        >
                          {j.year}
                        </span>
                        {isFuture && (
                          <span
                            className="text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1"
                            style={{
                              clipPath:
                                "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                            }}
                          >
                            Latest Edition
                          </span>
                        )}
                      </div>

                      {/* Theme */}
                      <h3
                        className={`font-bold text-slate-900 leading-tight mb-4 ${
                          isLarge
                            ? "text-2xl md:text-3xl"
                            : "text-xl md:text-2xl"
                        }`}
                      >
                        {j.theme}
                      </h3>

                      {/* Achievement */}
                      <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-6 max-w-lg">
                        {j.achievement}
                      </p>

                      {/* Stats + CTA */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          <Users className="w-3.5 h-3.5 text-astro-cyan" />
                          {j.participants > 0
                            ? `${j.participants.toLocaleString()}+ Peserta`
                            : "Coming Soon"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-astro-cyan group-hover:gap-2.5 transition-all duration-300">
                          <span>Lihat Detail</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>

                      {/* Corner accent */}
                      <div
                        className={`absolute top-0 ${isLarge ? "right-0" : "left-0"} w-12 h-1 bg-gradient-to-r from-astro-cyan to-transparent opacity-60`}
                      />
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* View All Trigger Button */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mt-12 md:mt-16"
          >
            <Button
              onClick={() => setShowAllJourney(true)}
              size="lg"
              className="clip-angled bg-slate-900 text-xs font-bold uppercase tracking-wider text-white hover:-translate-y-0.5 hover:bg-slate-800 active:scale-[0.97]"
            >
              <Calendar data-icon="inline-start" />
              <span>Lihat Semua Perjalanan</span>
              <ArrowRight data-icon="inline-end" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ═══ JOURNEY FULL OVERLAY ═══ */}
      <Dialog open={showAllJourney} onOpenChange={setShowAllJourney}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-hidden p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>ASTRO Journey</DialogTitle>
            <DialogDescription>Jelajahi setiap babak perjalanan ASTRO.</DialogDescription>
          </DialogHeader>

          {/* Overlay header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-sky-500 via-cyan-500 to-sky-600 p-8 md:p-12">
            <div className="absolute top-0 right-0 size-40 rounded-full bg-white/10 blur-[60px]" />
            <div className="absolute bottom-0 left-0 size-60 rounded-full bg-white/5 blur-[80px]" />
            <h2 className="font-masterpiece relative z-10 text-3xl leading-tight text-white md:text-5xl">
              ASTRO <span className="text-cyan-200">Journey</span>
            </h2>
            <p className="relative z-10 mt-2 max-w-lg text-sm text-white/70">
              Jelajahi setiap babak perjalanan ASTRO dari awal hingga sekarang.
            </p>
          </div>

          {/* Overlay content — all journeys full details */}
          <div className="max-h-[70vh] space-y-8 overflow-y-auto p-6 md:p-10">
            {journey.map((j, idx) => {
              return (
                <motion.div
                  key={j.year}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.4 }}
                  className="border-l-4 border-border py-4 pl-5 transition-all duration-300 md:pl-8"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <Badge className={j.year === "2026" ? "clip-angled-sm bg-primary text-primary-foreground" : "clip-angled-sm bg-muted text-foreground"}>
                      {j.year}
                    </Badge>
                    <span className="text-sm font-bold text-foreground">
                      {j.theme}
                    </span>
                    {j.year === "2026" && (
                      <Badge variant="outline" className="clip-angled-sm border-emerald-200 bg-emerald-50 text-[8px] font-bold uppercase tracking-[0.1em] text-emerald-700">
                        Latest
                      </Badge>
                    )}
                  </div>

                  <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                    {j.description}
                  </p>

                  {/* Highlights */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    {j.highlights.map((h, i) => (
                      <Badge key={i} variant="secondary" className="clip-angled-sm bg-muted text-[10px] font-semibold text-muted-foreground">
                        {h}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats row */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="size-3.5 text-primary" />
                      {j.participants > 0 ? `${j.participants}+` : "-"}{" "}
                      Peserta
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5 text-primary" />
                      {j.date || "-"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="size-3.5 text-primary" />
                      {j.competitions} Cabang Lomba
                    </span>
                    <Button asChild variant="link" size="sm" className="ml-auto gap-1 font-bold text-primary hover:gap-1.5">
                      <a href={`/profile/journey/${j.year}`}>
                        Detail <ArrowRight className="size-3" />
                      </a>
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* ════════════ 5. EVENT GALLERY ════════════ */}
      <EventGallerySection />

      {/* ════════════ 6. SOCIAL MEDIA ════════════ */}
      <SocialMediaSection />

      {/* ════════════ 9. COMMITTEE ════════════ */}
      <CommitteeSection />

      <SponsorSection />

      <Footer />
    </div>
  );
}
