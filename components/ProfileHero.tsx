"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const MotionImage = motion.create(Image);

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function ProfileHero() {
  const reduce = useReducedMotion();

  return (
    <section
      id="home"
      className="astro-sky astro-frame-y astro-bubble-field relative flex min-h-[100svh] flex-col items-center justify-start overflow-hidden pt-[18svh] md:pt-[15svh]"
    >
      <div className="astro-pattern absolute inset-0 z-0 opacity-55" />
      {/* ─── CLOUD IMAGES ─── */}
      {/* Big cloud top-left */}
      <MotionImage
        src="/assets/cloud.png"
        alt=""
        width={288}
        height={200}
        animate={{ x: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[8%] -left-10 w-72 h-auto opacity-65 pointer-events-none select-none z-0"
      />

      {/* Big cloud top-right */}
      <MotionImage
        src="/assets/cloud.png"
        alt=""
        width={320}
        height={220}
        animate={{ x: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[15%] -right-16 w-80 h-auto opacity-55 pointer-events-none select-none z-0"
      />

      {/* Small cloud middle-left */}
      <MotionImage
        src="/assets/cloud.png"
        alt=""
        width={192}
        height={140}
        animate={{ x: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[45%] -left-8 w-48 h-auto opacity-45 pointer-events-none select-none z-0"
      />

      {/* Small cloud right */}
      <MotionImage
        src="/assets/cloud.png"
        alt=""
        width={160}
        height={120}
        animate={{ x: [0, -12, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[55%] -right-6 w-40 h-auto opacity-40 pointer-events-none select-none z-0"
      />

      {/* ─── CHROME BLOB SHAPE (static, large, edge-placed) ─── */}
      <Image
        src="/assets/chrome-blob-shape.png"
        alt=""
        width={224}
        height={224}
        className="absolute -top-12 -right-12 w-56 h-56 md:w-[28rem] md:h-[28rem] object-contain pointer-events-none select-none z-0"
      />
      <Image
        src="/assets/chrome-blob-shape.png"
        alt=""
        width={256}
        height={256}
        className="absolute -bottom-16 -left-16 w-64 h-64 md:w-[32rem] md:h-[32rem] object-contain pointer-events-none select-none z-0"
      />
      <Image
        src="/assets/chrome-blob-shape.png"
        alt=""
        width={192}
        height={192}
        className="absolute -top-10 -left-10 w-48 h-48 md:w-[22rem] md:h-[22rem] object-contain pointer-events-none select-none z-0"
      />
      <Image
        src="/assets/chrome-blob-shape.png"
        alt=""
        width={224}
        height={224}
        className="absolute -bottom-12 -right-12 w-56 h-56 md:w-[24rem] md:h-[24rem] object-contain pointer-events-none select-none z-0"
      />

      {/* ─── FLOATING BLOB ROUND IMAGES ─── */}
      <MotionImage
        src="/assets/blob-round.png"
        alt=""
        width={112}
        height={112}
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] right-[8%] w-28 h-28 md:w-40 md:h-40 object-contain pointer-events-none select-none z-0"
      />
      <MotionImage
        src="/assets/blob-round.png"
        alt=""
        width={96}
        height={96}
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[22%] left-[4%] w-24 h-24 md:w-36 md:h-36 object-contain pointer-events-none select-none z-0"
      />
      <MotionImage
        src="/assets/blob-round.png"
        alt=""
        width={64}
        height={64}
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[38%] left-[16%] w-16 h-16 md:w-24 md:h-24 object-contain pointer-events-none select-none z-0"
      />
      <MotionImage
        src="/assets/blob-round.png"
        alt=""
        width={112}
        height={112}
        animate={{ y: [0, -18, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[15%] right-[4%] w-28 h-28 md:w-40 md:h-40 object-contain pointer-events-none select-none z-0"
      />

      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center"
        variants={reduce ? undefined : stagger}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp} className="astro-pill mx-auto mb-8 flex w-fit items-center gap-4 px-5 py-3">
          <Image
            src="/assets/logo-astro.png"
            alt="ASTRO 2026"
            width={56}
            height={56}
            className="size-12 object-contain"
            priority
          />
          <span className="text-xs font-black uppercase tracking-[0.18em] text-[#3157ff]">
            Company Profile
          </span>
        </motion.div>
        {/* ─── MAIN TITLE ─── */}
        <motion.div variants={fadeUp} className="mb-6 md:mb-0 md:-mt-6">
          <h1 className="text-massive mb-0">
            <span
              className="astro-title-chrome block"
            >
              ASTRO
            </span>
            <span
              className="astro-title-chrome block"
            >
              2026
            </span>
          </h1>

          {/* Tagline - Split Creative */}
          <p className="mt-6 font-masterpiece leading-snug drop-shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
            <span className="text-3xl sm:text-4xl md:text-5xl text-white/95 block">
              Where Innovation
            </span>
            <span className="-mt-1 block bg-linear-to-r from-[#f8ff7a] via-[#d9f64a] to-white bg-clip-text text-4xl text-transparent sm:text-5xl md:text-6xl">
              Meets the Stars
            </span>
          </p>
        </motion.div>

        {/* Accent line */}
        <motion.div
          variants={fadeUp}
          className="flex justify-center mb-8 md:mb-10"
        >
          <div className="h-[5px] w-28 rounded-full bg-[#d9f64a] shadow-[0_3px_0_rgba(49,87,255,0.35)]" />
        </motion.div>

        {/* CTA - Solid Parallelogram Buttons */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            asChild
            size="lg"
            className="rounded-[18px] border-2 border-white/80 px-8 py-4 text-sm font-black uppercase tracking-wider text-white shadow-[0_12px_28px_rgba(49,87,255,0.3)] hover:-translate-y-0.5 active:scale-95"
          >
            <a href="#about-event">
              <span className="flex items-center gap-2">
                <ArrowDown className="size-4" /> Explore Now
              </span>
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="rounded-[18px] border-2 border-white/80 px-8 py-4 text-sm font-black uppercase tracking-wider shadow-[0_12px_28px_rgba(217,246,74,0.24)] hover:-translate-y-0.5 active:scale-95"
          >
            <a href="#contact">
              Contact Us
            </a>
          </Button>
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade to sky-100 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 z-20 pointer-events-none bg-linear-to-b from-transparent to-sky-100" />
    </section>
  );
}
