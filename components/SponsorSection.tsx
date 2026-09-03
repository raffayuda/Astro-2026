'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { MessageSquare, ArrowRight, ExternalLink, Sparkles, Handshake, Phone, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSponsors, useMediaPartners } from '@/src/lib/hooks/use-queries';

const MotionImage = motion.create(Image);

interface SponsorItem {
  id: number;
  name: string;
  tier?: string;
  website?: string | null;
  logo?: string | null;
  isCurrent?: boolean;
}

interface MediaPartnerItem {
  id: number;
  name: string;
  website?: string | null;
  logo?: string | null;
  isCurrent?: boolean;
}

interface SponsorSectionProps {
  /**
   * 'home': Halaman utama atau detail lomba. Menampilkan sponsor & media partner resmi yang aktif (isCurrent === true).
   * 'profile': Halaman profil ASTRO. Menampilkan rekam jejak kemitraan terdahulu beserta sponsor saat ini.
   * 'all': Menampilkan seluruh sponsor dan media partner tanpa memisahkan.
   */
  variant?: 'home' | 'profile' | 'all';
  id?: string;
}

const SPONSOR_CP = {
  name: 'Muhammad Syafiq Arrafif',
  phone: '+62 851-5711-9650',
  waLink:
    'https://wa.me/6285157119650?text=Halo%20Syafiq,%20saya%20tertarik%20untuk%20bekerja%20sama%20sebagai%20Sponsor%20ASTRO%202026.',
  email: 'astro@nurulfikri.ac.id',
  emailLink:
    'mailto:astro@nurulfikri.ac.id?subject=Penawaran%20Kerja%20Sama%20Sponsorship%20ASTRO%202026',
};

const MEDPART_CP = [
  {
    name: 'Resna',
    phone: '+62 813-8468-1275',
    waLink:
      'https://wa.me/6281384681275?text=Halo%20Kak%20Resna,%20saya%20tertarik%20mengajukan%20kerja%20sama%20Media%20Partner%20ASTRO%202026.',
  },
  {
    name: 'Audy',
    phone: '+62 882-9337-9555',
    waLink:
      'https://wa.me/6288293379555?text=Halo%20Kak%20Audy,%20saya%20tertarik%20mengajukan%20kerja%20sama%20Media%20Partner%20ASTRO%202026.',
  },
];

export default function SponsorSection({ variant = 'home', id = 'sponsor' }: SponsorSectionProps) {
  const reduce = useReducedMotion();
  const { data: rawSponsors = [] } = useSponsors() as { data: SponsorItem[] };
  const { data: rawMediaPartners = [] } = useMediaPartners() as { data: MediaPartnerItem[] };

  const sponsors = Array.isArray(rawSponsors) ? rawSponsors : [];
  const mediaPartners = Array.isArray(rawMediaPartners) ? rawMediaPartners : [];

  const currentSponsors = sponsors.filter((s) => !!s.isCurrent);
  const previousSponsors = sponsors.filter((s) => !s.isCurrent);

  const currentMediaPartners = mediaPartners.filter((m) => !!m.isCurrent);
  const previousMediaPartners = mediaPartners.filter((m) => !m.isCurrent);

  const isHomeVariant = variant === 'home';
  const isProfileVariant = variant === 'profile';

  return (
    <section
      id={id}
      className="relative py-24 bg-gradient-to-b from-sky-200 via-sky-200 to-sky-300 md:py-32 overflow-hidden text-slate-900 select-none"
    >
      {/* Floating decors */}
      <MotionImage
        src="/assets/awan1.png"
        alt=""
        width={160}
        height={120}
        animate={reduce ? undefined : { x: [0, 18, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[6%] left-[3%] w-20 h-auto md:w-36 md:h-auto object-contain pointer-events-none select-none z-0 opacity-40"
      />
      <MotionImage
        src="/assets/awan2.png"
        alt=""
        width={200}
        height={140}
        animate={reduce ? undefined : { x: [0, -14, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[12%] right-[2%] w-24 h-auto md:w-44 md:h-auto object-contain pointer-events-none select-none z-0 opacity-35"
      />
      <MotionImage
        src="/assets/blob-round.png"
        alt=""
        width={80}
        height={80}
        animate={reduce ? undefined : { y: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[30%] left-[5%] w-10 h-10 md:w-16 md:h-16 object-contain pointer-events-none select-none z-0 opacity-25"
      />
      <MotionImage
        src="/assets/blob-round.png"
        alt=""
        width={96}
        height={96}
        animate={reduce ? undefined : { y: [0, -14, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[20%] right-[5%] w-12 h-12 md:w-20 md:h-20 object-contain pointer-events-none select-none z-0 opacity-25"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14 md:mb-16"
        >
          <div className="flex justify-center mb-3">
            <div className="w-[60px] h-[4px] bg-gradient-to-r from-sky-400 to-slate-900 skew-x-[-12deg]" />
          </div>
          <h2 className="font-masterpiece text-5xl md:text-6xl lg:text-7xl text-slate-900 mb-3 leading-tight">
            Didukung <span className="text-sky-500">Oleh</span>
          </h2>
          <p className="text-[11px] sm:text-xs md:text-sm font-semibold tracking-[0.25em] md:tracking-[0.35em] text-slate-700 uppercase">
            {isProfileVariant
              ? 'REKAM JEJAK MITRA & SPONSOR ASTRO'
              : 'TRUSTED BY PARTNERS AND COMMUNITIES'}
          </p>
        </motion.div>

        {/* ════════════════════════════════════════════════════
            KASUS 1: HALAMAN UTAMA / LOMBA (variant === 'home')
           ════════════════════════════════════════════════════ */}
        {isHomeVariant && (
          <div className="space-y-16">
            {/* SPONSOR SAAT INI */}
            <div>
              <div className="mb-8 flex justify-center">
                <Badge
                  variant="secondary"
                  className="border border-sky-300/60 bg-white/85 px-5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-sky-900 shadow-sm backdrop-blur-md sm:text-xs gap-1.5"
                >
                  <Sparkles className="size-3 text-amber-500" />
                  Official Sponsor ASTRO 2026
                </Badge>
              </div>

              {currentSponsors.length > 0 ? (
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16 lg:gap-20 max-w-6xl mx-auto px-4"
                >
                  {currentSponsors.map((brand) => (
                    <BrandItem key={brand.id} brand={brand} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={reduce ? false : { opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="max-w-3xl mx-auto rounded-2xl border border-sky-300/70 bg-white/80 p-6 md:p-8 text-center shadow-lg backdrop-blur-md"
                >
                  <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-sky-100 text-sky-600 shadow-xs">
                    <Handshake className="size-6" />
                  </div>
                  <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-slate-900 mb-2">
                    Mari Berkolaborasi Mendukung Generasi Muda
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed mb-5">
                    Peluang kemitraan dan sponsorship resmi ASTRO 2026 sedang dibuka. Jangkau ribuan mahasiswa dan pelajar bertalenta di seluruh Indonesia.
                  </p>

                  {/* CP Info Box */}
                  <div className="mb-6 inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-xl border border-sky-200/80 bg-sky-50/80 px-4 py-2.5 text-xs text-slate-700">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Phone className="size-3.5 text-sky-600" />
                      <span>CP Sponsorship: <strong className="font-bold text-slate-900">{SPONSOR_CP.name}</strong> ({SPONSOR_CP.phone})</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <Mail className="size-3.5 text-sky-600" />
                      <span>Email: <a href={SPONSOR_CP.emailLink} className="font-bold text-sky-700 hover:underline">{SPONSOR_CP.email}</a></span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <a
                      href={SPONSOR_CP.waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex"
                    >
                      <Button className="clip-angled-sm bg-sky-600 hover:bg-sky-700 text-white font-bold uppercase tracking-wider text-xs gap-1.5 shadow-md">
                        <MessageSquare className="size-3.5" /> Hubungi Syafiq (WhatsApp)
                      </Button>
                    </a>
                    <a
                      href={SPONSOR_CP.emailLink}
                      className="inline-flex"
                    >
                      <Button variant="outline" className="clip-angled-sm border-sky-300 bg-white/80 text-sky-800 hover:bg-sky-50 font-bold uppercase tracking-wider text-xs gap-1.5">
                        <Mail className="size-3.5" /> Kirim Email
                      </Button>
                    </a>
                    <Link href="/profile#sponsor">
                      <Button variant="ghost" className="clip-angled-sm text-slate-600 hover:text-slate-900 font-bold uppercase tracking-wider text-xs gap-1.5">
                        Lihat Mitra Terdahulu <ArrowRight className="size-3.5" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>

            {/* MEDIA PARTNER SAAT INI */}
            <div>
              <div className="relative max-w-4xl mx-auto my-10 md:my-14">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-sky-300/60" />
                </div>
                <div className="relative flex justify-center">
                  <Badge
                    variant="secondary"
                    className="border border-sky-300/70 bg-sky-200/95 px-5 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-slate-800 shadow-sm backdrop-blur-md sm:text-xs gap-1.5"
                  >
                    <Sparkles className="size-3 text-cyan-600" />
                    Official Media Partner ASTRO 2026
                  </Badge>
                </div>
              </div>

              {currentMediaPartners.length > 0 ? (
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-14 max-w-5xl mx-auto px-4"
                >
                  {currentMediaPartners.map((brand) => (
                    <BrandItem key={brand.id} brand={brand} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={reduce ? false : { opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="max-w-2xl mx-auto rounded-2xl border border-sky-300/70 bg-white/75 p-6 text-center shadow-md backdrop-blur-md"
                >
                  <p className="text-xs md:text-sm text-slate-700 max-w-lg mx-auto leading-relaxed mb-4">
                    Pendaftaran media partner resmi ASTRO 2026 sedang berlangsung. Hubungi contact person kami untuk kerja sama publikasi dan liputan media:
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {MEDPART_CP.map((cp) => (
                      <a
                        key={cp.name}
                        href={cp.waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="clip-angled-sm border-sky-300/80 bg-white/90 text-sky-900 hover:bg-sky-50 font-bold uppercase tracking-wider text-xs gap-2 shadow-xs"
                        >
                          <MessageSquare className="size-3.5 text-emerald-600" />
                          <span>Hubungi {cp.name}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">({cp.phone})</span>
                        </Button>
                      </a>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            KASUS 2: HALAMAN PROFIL (variant === 'profile')
           ════════════════════════════════════════════════════ */}
        {isProfileVariant && (
          <div className="space-y-16">
            {/* 1. Sponsor ASTRO 2026 (jika ada yang aktif) */}
            {currentSponsors.length > 0 && (
              <div>
                <div className="mb-8 flex justify-center">
                  <Badge
                    variant="secondary"
                    className="border border-sky-300/60 bg-white/90 px-5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-sky-900 shadow-sm backdrop-blur-md sm:text-xs gap-1.5"
                  >
                    <Sparkles className="size-3 text-amber-500" />
                    Official Sponsor ASTRO 2026
                  </Badge>
                </div>
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16 lg:gap-20 max-w-6xl mx-auto px-4"
                >
                  {currentSponsors.map((brand) => (
                    <BrandItem key={brand.id} brand={brand} />
                  ))}
                </motion.div>
              </div>
            )}

            {/* 2. Rekam Jejak Sponsor Periode Terdahulu */}
            {previousSponsors.length > 0 && (
              <div>
                <div className="relative max-w-4xl mx-auto my-10 md:my-14">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-sky-300/60" />
                  </div>
                  <div className="relative flex justify-center">
                    <Badge
                      variant="secondary"
                      className="border border-sky-300/70 bg-white/80 px-5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-700 shadow-sm backdrop-blur-md sm:text-xs"
                    >
                      Sponsor Periode Terdahulu
                    </Badge>
                  </div>
                </div>
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16 lg:gap-20 max-w-6xl mx-auto px-4"
                >
                  {previousSponsors.map((brand) => (
                    <BrandItem key={brand.id} brand={brand} />
                  ))}
                </motion.div>
              </div>
            )}

            {/* 3. Media Partner ASTRO 2026 (jika ada) */}
            {currentMediaPartners.length > 0 && (
              <div>
                <div className="relative max-w-4xl mx-auto my-10 md:my-14">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-sky-300/60" />
                  </div>
                  <div className="relative flex justify-center">
                    <Badge
                      variant="secondary"
                      className="border border-sky-300/70 bg-sky-200/90 px-5 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-slate-800 shadow-sm backdrop-blur-md sm:text-xs gap-1.5"
                    >
                      <Sparkles className="size-3 text-cyan-600" />
                      Official Media Partner ASTRO 2026
                    </Badge>
                  </div>
                </div>
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-14 max-w-5xl mx-auto px-4"
                >
                  {currentMediaPartners.map((brand) => (
                    <BrandItem key={brand.id} brand={brand} />
                  ))}
                </motion.div>
              </div>
            )}

            {/* 4. Rekam Jejak Media Partner Periode Terdahulu */}
            {previousMediaPartners.length > 0 && (
              <div>
                <div className="relative max-w-4xl mx-auto my-10 md:my-14">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-sky-300/60" />
                  </div>
                  <div className="relative flex justify-center">
                    <Badge
                      variant="secondary"
                      className="border border-sky-300/70 bg-sky-200/90 px-5 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-slate-700 shadow-sm backdrop-blur-md sm:text-xs"
                    >
                      Media Partner Periode Terdahulu
                    </Badge>
                  </div>
                </div>
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-14 max-w-5xl mx-auto px-4"
                >
                  {previousMediaPartners.map((brand) => (
                    <BrandItem key={brand.id} brand={brand} />
                  ))}
                </motion.div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            KASUS 3: ALL DATA (variant === 'all')
           ════════════════════════════════════════════════════ */}
        {variant === 'all' && (
          <div className="space-y-16">
            {sponsors.length > 0 && (
              <div>
                <div className="mb-8 flex justify-center">
                  <Badge variant="secondary" className="border border-sky-300/60 bg-white/80 px-5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-sky-800 shadow-sm sm:text-xs">
                    Sponsors
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-8 max-w-6xl mx-auto px-4">
                  {sponsors.map((brand) => (
                    <BrandItem key={brand.id} brand={brand} />
                  ))}
                </div>
              </div>
            )}
            {mediaPartners.length > 0 && (
              <div>
                <div className="relative max-w-4xl mx-auto my-10">
                  <div className="relative flex justify-center">
                    <Badge variant="secondary" className="border border-sky-300/70 bg-sky-200/90 px-5 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-slate-700 shadow-sm sm:text-xs">
                      Media Partners
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-6 max-w-5xl mx-auto px-4">
                  {mediaPartners.map((brand) => (
                    <BrandItem key={brand.id} brand={brand} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Arc divider */}
        <div className="relative max-w-5xl mx-auto mt-16 md:mt-24 px-2">
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[85%] h-32 md:h-44 bg-gradient-to-t from-sky-400/40 via-cyan-400/20 to-transparent blur-2xl rounded-t-[100%] pointer-events-none" />
          <svg
            viewBox="0 0 1200 100"
            className="w-full h-auto overflow-visible pointer-events-none relative z-10"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="thinArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
                <stop offset="20%" stopColor="#0284c7" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="80%" stopColor="#0284c7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M 0 90 Q 600 0 1200 90" fill="none" stroke="url(#thinArcGrad)" strokeWidth="1.2" />
          </svg>
        </div>
      </div>
    </section>
  );
}

function BrandItem({
  brand,
}: {
  brand: { name: string; website?: string | null; logo?: string | null };
}) {
  const content = (
    <div className="opacity-85 hover:opacity-100 hover:scale-105 transition-all duration-300 transform-gpu cursor-pointer flex items-center justify-center text-slate-900 gap-2">
      {brand.logo && (
        <div className="relative w-20 h-10 md:w-16 md:h-14">
          <Image
            src={brand.logo}
            alt={brand.name || 'Brand Logo'}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 96px, 128px"
          />
        </div>
      )}
      {brand.name && (
        <span className="font-bold text-lg md:text-xl text-slate-900 tracking-tight">
          {brand.name}
        </span>
      )}
    </div>
  );

  // Normalize URL: add https:// if no protocol
  const websiteUrl = brand.website
    ? brand.website.startsWith('http://') || brand.website.startsWith('https://')
      ? brand.website
      : `https://${brand.website}`
    : null;

  if (websiteUrl) {
    return (
      <a
        href={websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        title={brand.name}
        className="group focus:outline-none"
      >
        {content}
      </a>
    );
  }

  return <div>{content}</div>;
}
