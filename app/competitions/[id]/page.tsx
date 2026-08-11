'use client';

import { useMemo } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RegisterSection from './RegisterSection';
import CompetitionTimeline from './CompetitionTimeline';
import SponsorSection from '@/components/SponsorSection';
import {
  Trophy,
  CalendarDays,
  MapPin,
  Coins,
  Users,
  ArrowLeft,
  FileText,
  MessageCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useCompetition, useCompetitionTimeline } from '@/src/lib/hooks/use-queries';

const MotionImage = motion.create(Image);

function toCompetition(c: any) {
  return {
    id: c.id,
    title: c.title,
    category: c.category as 'akademik' | 'olahraga' | 'esports',
    tagline: c.tagline || '',
    description: c.description || '',
    fee: c.fee,
    maxSlots: c.maxSlots,
    filledSlots: c.filledSlots,
    scheduleDate: c.scheduleDate?.toISOString?.() || c.scheduleDate || '',
    location: c.location || '',
    prizes: c.prizes?.length
      ? c.prizes
      : [
          ...(c.prizesFirst ? [{ label: 'Juara 1', value: c.prizesFirst }] : []),
          ...(c.prizesSecond ? [{ label: 'Juara 2', value: c.prizesSecond }] : []),
          ...(c.prizesThird ? [{ label: 'Juara 3', value: c.prizesThird }] : []),
        ],
    rulesSummary: c.rulesSummary || [],
    rulebookUrl: c.rulebookUrl || '',
    registrationUrl: '',
    type: c.type || 'individual',
    maxTeamMembers: c.maxTeamMembers || 1,
    minTeamMembers: c.minTeamMembers || 1,
    contactPerson: { name: c.contactName || '', whatsapp: c.contactWhatsapp || '' },
    timeline: c.timeline || [],
    isFree: c.isFree === '1' || c.isFree === true,
    origin: c.origin || 'internal',
  };
}

const categoryConfig = {
  akademik: {
    label: 'AKADEMIK',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    accent: 'bg-emerald-500',
    accentLight: 'bg-emerald-500/10',
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-500/20',
    iconBg: 'bg-emerald-50 text-emerald-600',
    iconBorder: 'border-emerald-200',
    hex: '#10b981',
  },
  olahraga: {
    label: 'OLAHRAGA',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    accent: 'bg-orange-500',
    accentLight: 'bg-orange-500/10',
    dot: 'bg-orange-500',
    ring: 'ring-orange-500/20',
    iconBg: 'bg-orange-50 text-orange-600',
    iconBorder: 'border-orange-200',
    hex: '#f97316',
  },
  esports: {
    label: 'ESPORTS',
    color: 'text-cyan-700',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    accent: 'bg-cyan-500',
    accentLight: 'bg-cyan-500/10',
    dot: 'bg-cyan-500',
    ring: 'ring-cyan-500/20',
    iconBg: 'bg-cyan-50 text-cyan-600',
    iconBorder: 'border-cyan-200',
    hex: '#06b6d4',
  },
} as const;

/* ─── Animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const fadeUpLight = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function CompetitionDetailPage() {
  const reduce = useReducedMotion();
  const params = useParams();
  const id = params.id as string;
  const { data: rawCompetition, isLoading: loading, isError } = useCompetition(id);
  const { data: timeline = [] } = useCompetitionTimeline(id);
  const competition = useMemo(
    () => (rawCompetition ? toCompetition(rawCompetition) : null),
    [rawCompetition],
  );

  if (loading) return <DetailSkeleton />;

  if (isError || !competition) {
    notFound();
  }

  const cat =
    categoryConfig[competition.category as keyof typeof categoryConfig] ||
    categoryConfig.akademik;
  const leftSlots = competition.maxSlots - competition.filledSlots;
  const ratio = Math.min(
    (competition.filledSlots / competition.maxSlots) * 100,
    100,
  );

  /* ─── Floating blobs — reusable preset ─── */
  const blobs = [
    { src: '/assets/blob-round.png', w: 112, h: 112, className: 'absolute top-[6%] -left-[2%] w-14 h-14 md:w-28 md:h-28 object-contain pointer-events-none select-none z-0', dur: 7, delay: 0 },
    { src: '/assets/blob-round.png', w: 96, h: 96, className: 'absolute top-[12%] -right-[2%] w-12 h-12 md:w-24 md:h-24 object-contain pointer-events-none select-none z-0', dur: 9, delay: 0.15 },
    { src: '/assets/blob-round.png', w: 80, h: 80, className: 'absolute bottom-[18%] left-[4%] w-10 h-10 md:w-20 md:h-20 object-contain pointer-events-none select-none z-0', dur: 6, delay: 0.3 },
    { src: '/assets/blob-round.png', w: 128, h: 128, className: 'absolute bottom-[8%] right-[3%] w-16 h-16 md:w-32 md:h-32 object-contain pointer-events-none select-none z-0', dur: 10, delay: 0.1 },
  ];

  const infoCards = [
    {
      icon: Coins,
      label: 'Biaya Pendaftaran',
      value: competition.isFree ? 'Gratis' : 'Rp ' + competition.fee.toLocaleString('id-ID'),
    },
    {
      icon: CalendarDays,
      label: 'Jadwal Pelaksanaan',
      value: new Date(competition.scheduleDate).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    },
    {
      icon: MapPin,
      label: 'Lokasi Venue',
      value: competition.location,
    },
    {
      icon: Users,
      label: competition.type === 'team' ? 'Kuota Tim' : competition.type === 'both' ? 'Kuota Peserta / Tim' : 'Kuota Peserta',
      value: `${competition.filledSlots} / ${competition.maxSlots} Terisi`,
      sub: leftSlots > 0 ? `Sisa ${leftSlots} slot` : 'Penuh',
      isLow: leftSlots <= 5,
      ratio,
    },
  ];

  const prizeStyles = [
    { style: 'border-amber-200 bg-amber-50/40', accentLine: 'bg-amber-500', iconColor: 'text-amber-600 bg-amber-50 border-amber-200' },
    { style: 'border-slate-200 bg-slate-50/40', accentLine: 'bg-slate-400', iconColor: 'text-slate-500 bg-slate-50 border-slate-200' },
    { style: 'border-amber-200/60 bg-amber-50/20', accentLine: 'bg-amber-700', iconColor: 'text-amber-800 bg-amber-50 border-amber-200/60' },
    { style: 'border-cyan-100 bg-cyan-50/30', accentLine: 'bg-cyan-400', iconColor: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
    { style: 'border-violet-100 bg-violet-50/30', accentLine: 'bg-violet-400', iconColor: 'text-violet-600 bg-violet-50 border-violet-200' },
  ];
  const prizes = competition.prizes.map((p: { label: string; value: string }, i: number) => ({
    rank: p.label,
    prize: p.value,
    ...(prizeStyles[i] || prizeStyles[prizeStyles.length - 1]),
  }));

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex flex-col justify-between bg-white">
        <main className="flex-grow">
          {/* ════════════════════════════════════════
              1. HERO
              ════════════════════════════════════════ */}
          <section className="relative pt-36 pb-20 bg-gradient-to-b from-sky-400 via-sky-300 to-sky-100 md:pt-40 md:pb-28 overflow-hidden">

            {/* ─── FLOATING BLOBS ─── */}
            {blobs.map((b, i) => (
              <MotionImage
                key={`blob-hero-${i}`}
                src={b.src}
                alt=""
                width={b.w}
                height={b.h}
                animate={reduce ? undefined : { y: [0, -14, 0] }}
                transition={{
                  duration: b.dur,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: b.delay,
                }}
                className={b.className}
              />
            ))}

            {/* ─── FLOATING CLOUDS ─── */}
            <MotionImage
              src="/assets/awan1.png"
              alt=""
              width={160}
              height={120}
              animate={reduce ? undefined : { x: [0, 15, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-[10%] left-[2%] w-16 h-auto md:w-40 md:h-auto object-contain pointer-events-none select-none z-0 opacity-40"
            />
            <MotionImage
              src="/assets/awan2.png"
              alt=""
              width={200}
              height={140}
              animate={reduce ? undefined : { x: [0, -12, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-[30%] right-[3%] w-20 h-auto md:w-48 md:h-auto object-contain pointer-events-none select-none z-0 opacity-35"
            />

            {/* ─── HERO CONTENT ─── */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="lg:w-10/12 xl:w-3/4">
                {/* Back link */}
                <motion.div
                  variants={reduce ? undefined : fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="mb-8"
                >
                  <Button asChild variant="link" className="mb-8 gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary">
                    <Link href="/#competitions">
                      <ArrowLeft data-icon="inline-start" /> Kembali ke Lomba
                    </Link>
                  </Button>
                </motion.div>

                {/* Category badge + origin/free badges */}
                <motion.div
                  variants={reduce ? undefined : fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 }}
                  className="mb-5 flex flex-wrap items-center gap-1.5"
                >
                  <Badge variant="outline" className={cn('clip-angled-sm border px-2.5 py-1 text-[10px] font-bold tracking-[0.15em] uppercase', cat.bg, cat.color, cat.border)}>
                    {cat.label}
                  </Badge>
                  <Badge variant="outline" className="clip-angled-sm border-sky-200 bg-sky-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-sky-700">
                    {competition.origin === 'external' ? 'Eksternal' : 'Internal'}
                  </Badge>
                  <Badge variant="outline" className={cn('clip-angled-sm border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em]',
                    competition.isFree ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700')}>
                    {competition.isFree ? 'Gratis' : 'Berbayar'}
                  </Badge>
                  <Badge variant="outline" className="clip-angled-sm border-purple-200 bg-purple-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-purple-700">
                    {competition.type === 'both' ? 'Tim & Individu' : competition.type === 'team' ? 'Tim' : 'Individu'}
                  </Badge>
                </motion.div>

                {/* Title */}
                <motion.h1
                  variants={reduce ? undefined : fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-display mb-4 bg-gradient-to-r from-sky-900 via-cyan-800 to-slate-800 bg-clip-text text-transparent"
                >
                  {competition.title}
                </motion.h1>

                {/* Tagline */}
                {competition.tagline && (
                  <motion.p
                    variants={reduce ? undefined : fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 }}
                    className="text-base md:text-lg text-slate-700 font-light mb-6"
                  >
                    {competition.tagline}
                  </motion.p>
                )}

                {/* Accent line */}
                <motion.div
                  variants={reduce ? undefined : fadeUpLight}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="accent-line mb-6"
                />

                {/* Description */}
                <motion.div
                  variants={reduce ? undefined : fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: 0.25 }}
                  className="text-sm md:text-base text-slate-600 leading-relaxed"
                >
                  <p>{competition.description}</p>
                </motion.div>
              </div>
            </div>

          </section>

          {/* ════════════════════════════════════════
              2. DETAILS
              ════════════════════════════════════════ */}
          <section className="relative bg-gradient-to-b from-sky-100 via-sky-50 to-white py-12 md:py-16 overflow-hidden">
            {/* Subtle floating blobs in details section */}
            <MotionImage
              src="/assets/blob-round.png"
              alt=""
              width={80}
              height={80}
              animate={reduce ? undefined : { y: [0, -10, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-[8%] -left-[1%] w-10 h-10 md:w-20 md:h-20 object-contain pointer-events-none select-none z-0 opacity-30"
            />
            <MotionImage
              src="/assets/blob-round.png"
              alt=""
              width={96}
              height={96}
              animate={reduce ? undefined : { y: [0, -12, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-[20%] -right-[1%] w-12 h-12 md:w-24 md:h-24 object-contain pointer-events-none select-none z-0 opacity-30"
            />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                {/* ── LEFT COLUMN ── */}
                <div className="lg:col-span-7 space-y-12">
                  {/* Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {infoCards.map((card, idx) => (
                      <motion.div
                        key={card.label}
                        initial={
                          reduce ? false : { opacity: 0, y: 24 }
                        }
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          delay: idx * 0.08,
                          duration: 0.5,
                          ease: [0.16, 1, 0.3, 1] as const,
                        }}
                        className="bg-white border border-slate-200 p-5 flex items-start gap-4 transition-all hover:border-slate-300 group"
                        style={{
                          clipPath:
                            'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)',
                        }}
                      >
                        <div
                          className={`p-3 ${cat.iconBg} ${cat.iconBorder} border`}
                          style={{
                            clipPath:
                              'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)',
                          }}
                        >
                          <card.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">
                            {card.label}
                          </span>
                          <span className="block text-lg font-black text-slate-900 mt-1 truncate">
                            {card.value}
                          </span>
                          {/* Slot bar + sub text for Kuota card */}
                          {card.sub !== undefined && (
                            <>
                              <Progress value={card.ratio} className={cn('mt-2 h-1 bg-slate-100', cat.accent === 'bg-emerald-500' && '[&>div]:bg-emerald-500', cat.accent === 'bg-orange-500' && '[&>div]:bg-orange-500', cat.accent === 'bg-cyan-500' && '[&>div]:bg-cyan-500')} />
                              <span
                                className={`block text-[10px] font-bold uppercase tracking-wider mt-1 ${
                                  card.isLow
                                    ? 'text-destructive'
                                    : 'text-muted-foreground'
                                }`}
                              >
                                {card.sub}
                              </span>
                            </>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* ── Prizes ── */}
                  <div className="space-y-6">
                    <motion.div
                      initial={reduce ? false : { opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
                      className="flex items-center gap-3"
                    >
                      <div className="accent-line" />
                      <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
                        Hadiah Pemenang
                      </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {prizes.map((item: { rank: string; prize: string; style: string; accentLine: string; iconColor: string }, idx: number) => (
                        <motion.div
                          key={item.rank}
                          initial={
                            reduce ? false : { opacity: 0, y: 20 }
                          }
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{
                            delay: idx * 0.1,
                            duration: 0.5,
                            ease: [0.16, 1, 0.3, 1] as const,
                          }}
                          className="bg-white border border-slate-200 p-5 transition-all hover:border-slate-300 group"
                          style={{
                            clipPath:
                              'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
                          }}
                        >
                          {/* Top accent */}
                          <div
                            className={`h-1 w-8 ${item.accentLine} mb-4`}
                            style={{
                              clipPath:
                                'polygon(2px 0, 100% 0, calc(100% - 2px) 100%, 0 100%)',
                            }}
                          />
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 border ${item.iconColor}`}
                              style={{
                                clipPath:
                                  'polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)',
                              }}
                            >
                              <Trophy className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">
                                {item.rank}
                              </div>
                              <div className="text-sm font-black text-slate-900 mt-0.5">
                                {item.prize}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── RIGHT COLUMN: Rules ── */}
                <div className="lg:col-span-5 space-y-6 lg:border-l lg:border-slate-200 lg:pl-10">
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
                    className="flex items-center gap-3"
                  >
                    <div className="accent-line" />
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
                      Peraturan Lomba
                    </h2>
                  </motion.div>

                  <ul className="space-y-4">
                    {competition.rulesSummary.map((rule: string, idx: number) => (
                      <motion.li
                        key={idx}
                        initial={reduce ? false : { opacity: 0, x: 16 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          delay: idx * 0.06,
                          duration: 0.4,
                          ease: [0.16, 1, 0.3, 1] as const,
                        }}
                        className="flex items-start gap-4 text-sm md:text-base"
                      >
                        <span
                          className={`flex-shrink-0 w-7 h-7 text-xs flex items-center justify-center font-black ${cat.iconBg} ${cat.iconBorder} border`}
                          style={{
                            clipPath:
                              'polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)',
                          }}
                        >
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="leading-relaxed text-slate-600">
                          {rule}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════
              3. TIMELINE LOMBA
              ════════════════════════════════════════ */}
          {timeline.length > 0 && (
            <CompetitionTimeline
              timeline={timeline}
              lineColor={cat.hex}
              categoryColors={{
                accent: cat.accent,
                dot: cat.dot,
                ring: cat.ring,
                iconBg: cat.iconBg,
                iconBorder: cat.iconBorder,
                hex: cat.hex,
              }}
            />
          )}

          {/* ════════════════════════════════════════
              4. CTA
              ════════════════════════════════════════ */}
          <section className="relative bg-gradient-to-b from-white via-sky-50 to-slate-50 py-16 md:py-20 overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-astro-cyan/3 blur-[120px] rounded-full pointer-events-none" />

            {/* Floating decor in CTA */}
            <MotionImage
              src="/assets/blob-round.png"
              alt=""
              width={100}
              height={100}
              animate={reduce ? undefined : { y: [0, -12, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-[12%] left-[4%] w-14 h-14 md:w-28 md:h-28 object-contain pointer-events-none select-none z-0 opacity-25"
            />
            <MotionImage
              src="/assets/blob-round.png"
              alt=""
              width={120}
              height={120}
              animate={reduce ? undefined : { y: [0, -16, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-[8%] right-[3%] w-16 h-16 md:w-32 md:h-32 object-contain pointer-events-none select-none z-0 opacity-25"
            />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
                className="max-w-xl mx-auto space-y-4"
              >
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">
                  Siap untuk Berkompetisi?
                </h2>
                <p className="text-sm md:text-base text-slate-500 leading-relaxed font-light">
                  Daftarkan tim Anda sekarang sebelum kuota penuh. Pastikan Anda
                  telah membaca dan memahami rulebook perlombaan.
                </p>
                {/* Accent line centered */}
                <div className="flex justify-center">
                  <div className="accent-line" />
                </div>
              </motion.div>

              <motion.div
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
                className="flex flex-col items-center gap-6"
              >
                <RegisterSection competition={competition} />

                <div className="flex w-full max-w-md flex-col justify-center gap-3 sm:flex-row">
                  <Button asChild variant="outline" className="clip-angled w-full text-xs font-bold uppercase tracking-wider sm:w-1/2">
                    <a href={competition.rulebookUrl} target="_blank" rel="noopener noreferrer">
                      <FileText data-icon="inline-start" /> Baca Rulebook
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="clip-angled w-full text-xs font-bold uppercase tracking-wider hover:border-emerald-500 hover:text-emerald-700 sm:w-1/2">
                    <a href={`https://wa.me/${competition.contactPerson.whatsapp}`} target="_blank" rel="noopener noreferrer">
                      <MessageCircle data-icon="inline-start" /> Hubungi CP
                    </a>
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Diagonal transition */}
            <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none">
              <svg
                viewBox="0 0 1440 64"
                preserveAspectRatio="none"
                className="w-full h-full"
                aria-hidden="true"
              >
                <polygon points="0,64 1440,0 1440,64" fill="white" />
              </svg>
            </div>
          </section>

          {/* ════════════════════════════════════════
              5. SPONSOR SECTION
              ════════════════════════════════════════ */}
          <SponsorSection />
        </main>

        <Footer />
      </div>
    </>
  );
}

/* ─── Skeleton Loading ─── */
function DetailSkeleton() {
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col justify-between bg-background">
        <main className="flex-grow">
          {/* Skeleton Hero */}
          <section className="relative overflow-hidden bg-gradient-to-b from-sky-400 via-sky-300 to-sky-100 pt-36 pb-20 md:pt-40 md:pb-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="space-y-6 lg:w-10/12 xl:w-3/4">
                <Skeleton className="h-3 w-32 bg-white/40" />
                <Skeleton className="clip-angled-sm h-4 w-24 bg-white/40" />
                <Skeleton className="h-12 w-3/4 bg-white/30" />
                <Skeleton className="h-4 w-1/2 bg-white/30" />
                <Skeleton className="h-0.5 w-10 bg-white/30" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full bg-white/20" />
                  <Skeleton className="h-3 w-5/6 bg-white/20" />
                  <Skeleton className="h-3 w-2/3 bg-white/20" />
                </div>
              </div>
            </div>
          </section>

          {/* Skeleton Details */}
          <section className="bg-gradient-to-b from-sky-100 via-sky-50 to-white py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
                <div className="space-y-12 lg:col-span-7">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="clip-angled flex items-start gap-4 border border-border/50 bg-background/60 p-5">
                        <Skeleton className="clip-angled-sm size-11 border border-border bg-muted" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-5 w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <Skeleton className="h-5 w-40" />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="clip-angled border border-border/50 bg-background/60 p-5">
                          <Skeleton className="mb-4 h-1 w-8" />
                          <div className="flex items-center gap-3">
                            <Skeleton className="clip-angled-sm size-8 border border-border bg-muted" />
                            <div className="space-y-1">
                              <Skeleton className="h-3 w-12" />
                              <Skeleton className="h-4 w-28" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-4 lg:col-span-5 lg:border-l lg:border-border lg:pl-10">
                  <Skeleton className="h-5 w-36" />
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-start gap-4">
                        <Skeleton className="clip-angled-sm size-7" />
                        <Skeleton className="h-4 flex-1" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Skeleton CTA */}
          <section className="bg-gradient-to-b from-white via-sky-50 to-slate-50 py-16 md:py-20">
            <div className="mx-auto max-w-7xl space-y-6 px-4 text-center sm:px-6 lg:px-8">
              <div className="mx-auto max-w-xl space-y-4">
                <Skeleton className="mx-auto h-8 w-72" />
                <Skeleton className="mx-auto h-4 w-96" />
                <div className="flex justify-center"><Skeleton className="h-0.5 w-10" /></div>
              </div>
              <div className="flex flex-col items-center gap-4">
                <Skeleton className="clip-angled h-12 w-64" />
                <div className="flex w-full max-w-md justify-center gap-3">
                  <Skeleton className="clip-angled h-10 w-1/2" />
                  <Skeleton className="clip-angled h-10 w-1/2" />
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
