'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { CtaButton } from "@/components/brand/CtaButton";
import { SectionHeading } from "@/components/brand/SectionHeading";
import { SectionShell } from "@/components/brand/SectionShell";
import { WindowCard } from "@/components/brand/WindowCard";

const MotionImage = motion.create(Image);

export default function SocialMediaSection({
  priority = false,
}: {
  priority?: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <SectionShell id="social" band="none" space="sm" className={priority ? "pt-24" : undefined}>
      <SectionHeading
        eyebrow="Kanal"
        pillTone="blue"
        title="Lebih dekat dengan ASTRO"
        lead="Kanal resmi Instagram, dokumentasi, dan press kit ASTRO 2026."
      />

      <div className="mt-10 flex flex-col items-center">

        {/* ── 2. PRODUCT IMAGE (Aligned exactly to the width of the spec grid) ── */}
        <div className="relative w-full max-w-7xl mb-12 md:mb-16 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full flex justify-center items-center"
          >
            {/* Tablet Image — desktop/tablet */}
            <MotionImage
              src="/assets/IG-Tablet.png"
              alt="ASTRO Instagram Hub Showcase"
              width={1207}
              height={1303}
              sizes="(max-width: 1024px) 90vw, 1200px"
              animate={reduce ? undefined : { y: [0, -8, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
              className="hidden sm:block w-full h-auto object-contain select-none z-0"
              style={{
                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 96%)',
                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 96%)',
              }}
              priority={priority}
            />
          </motion.div>
        </div>

        {/* ── 2B. MOBILE PHONE IMAGE — full bleed edge to edge ── */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="block sm:hidden relative w-screen -mx-4 mb-12 flex justify-center"
        >
          <MotionImage
            src="/assets/IG-Phone-front.png"
            alt="ASTRO Instagram Hub Mobile"
            width={800}
            height={1600}
            animate={reduce ? undefined : { y: [0, -6, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-full h-auto object-contain select-none z-0"
            style={{
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 92%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 92%)',
            }}
            priority={priority}
          />
        </motion.div>

        {/* ── 3. SPEC GRID (Shares exact container alignment) ── */}
        <WindowCard title="Kenapa ikuti kanal ini" className="z-20 w-full max-w-6xl">
          <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <h3 className="font-heading text-sm font-bold tracking-tight text-astro-navy md:text-base">
                Highlights dan dokumentasi
              </h3>
              <p className="text-sm font-medium leading-relaxed text-astro-navy/70">
                Liputan cabang kompetisi, momen panggung utama, dan galeri kegiatan ASTRO 2026.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-heading text-sm font-bold tracking-tight text-astro-navy md:text-base">
                Update pendaftaran
              </h3>
              <p className="text-sm font-medium leading-relaxed text-astro-navy/70">
                Informasi kuota, jadwal pengumuman, dan konsultasi cepat lewat DM panitia.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-heading text-sm font-bold tracking-tight text-astro-navy md:text-base">
                Komunitas pelajar
              </h3>
              <p className="text-sm font-medium leading-relaxed text-astro-navy/70">
                Menghubungkan inovator muda dari sekolah dan kampus se-Indonesia.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-heading text-sm font-bold tracking-tight text-astro-navy md:text-base">
                Press kit resmi
              </h3>
              <p className="text-sm font-medium leading-relaxed text-astro-navy/70">
                Logo, materi publikasi, dan aset visual untuk mitra media.
              </p>
            </div>
          </div>
        </WindowCard>

        <div className="z-20 mt-10 text-center md:mt-12">
          <CtaButton href="https://instagram.com/astrosttnf" size="lg" showChevron={false}>
            Ikuti @astrosttnf
          </CtaButton>
        </div>

      </div>
    </SectionShell>
  );
}
