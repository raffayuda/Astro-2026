"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { CalendarDays, FileText, Trophy } from "lucide-react";

import type { EventConfig } from "@/types/astro";
import { CtaButton, Pill, SkyBackdrop, Surface } from "@/components/brand";
import { Button } from "@/components/ui/button";
import CountdownTimer from "./CountdownTimer";

const MotionImage = motion.create(Image);

const EASE = [0.16, 1, 0.3, 1] as const;

interface Props {
  eventConfig: EventConfig;
}

export default function HeroSection({ eventConfig }: Props) {
  const reduce = useReducedMotion();

  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.6, ease: EASE },
  });

  return (
    <section
      id="home"
      className="relative isolate min-h-svh overflow-hidden px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-28"
    >
      <SkyBackdrop tone="bright" clouds={false} bubbles="none" />

      <div className="relative z-20 mx-auto grid min-h-[calc(100svh-10rem)] w-full max-w-7xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col items-start gap-6 text-left">
          <motion.div
            {...rise(0)}
            className="flex flex-wrap items-center gap-2"
          >
            <Pill tone="gold" size="sm">
              Pendaftaran dibuka
            </Pill>
            <Pill tone="glass" size="sm">
              BEM STT-NF
            </Pill>
          </motion.div>

          <motion.h1
            {...rise(0.08)}
            className="max-w-3xl font-heading text-5xl font-black leading-[0.98] tracking-tight text-astro-navy text-balance sm:text-6xl lg:text-7xl"
          >
            ASTRO 2026, tempat bakatmu tampil.
          </motion.h1>

          <motion.p
            {...rise(0.16)}
            className="max-w-2xl text-base font-medium leading-relaxed text-ink sm:text-lg"
          >
            {eventConfig.description}
          </motion.p>

          <motion.div
            {...rise(0.24)}
            className="grid w-full max-w-2xl gap-3 sm:grid-cols-3"
          >
            {[
              {
                icon: Trophy,
                label: "Prize pool",
                value: eventConfig.totalPrizePool,
              },
              { icon: CalendarDays, label: "Musim", value: "2026" },
              { icon: FileText, label: "Juknis", value: "Lengkap" },
            ].map(({ icon: Icon, label, value }) => (
              <Surface
                key={label}
                tone="plain"
                radius="xl"
                pad="md"
                className="flex items-center gap-3 border border-white/80 bg-white/80"
              >
                <span className="grid size-9 place-items-center rounded-full bg-sky-bottom text-astro-blue">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span>
                  <span className="block text-10 font-black uppercase tracking-widest text-muted-foreground">
                    {label}
                  </span>
                  <span className="block font-heading text-lg font-black text-astro-navy">
                    {value}
                  </span>
                </span>
              </Surface>
            ))}
          </motion.div>

          <motion.div
            {...rise(0.32)}
            className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
          >
            <CtaButton href="#competitions" size="lg">
              Daftar Segera
            </CtaButton>
            <Button variant="outline" size="lg" asChild>
              <a
                href={eventConfig.generalJuknisUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText data-icon="inline-start" />
                Unduh Juknis
              </a>
            </Button>
          </motion.div>
        </div>

        <motion.div
          {...rise(0.18)}
          className="relative mx-auto w-full max-w-xl lg:ml-auto"
        >
          <Surface
            tone="plain"
            radius="2xl"
            pad="lg"
            className="overflow-hidden border border-white/80 bg-white/90 backdrop-blur"
          >
            <div className="mb-5 flex items-center justify-between gap-4 border-b border-astro-cyan-2/35 pb-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/assets/logo-astro.png"
                  alt="ASTRO 2026"
                  width={48}
                  height={48}
                  priority
                  className="size-12 object-contain"
                />
                <div>
                  <p className="font-heading text-sm font-extrabold text-astro-navy">
                    astro.nurulfikri.ac.id
                  </p>
                  <p className="text-xs font-semibold text-muted-foreground">
                    {eventConfig.tagline}
                  </p>
                </div>
              </div>
              <Pill tone="blue" size="sm">
                Live
              </Pill>
            </div>

            <div className="grid gap-4">
              <Surface tone="tint" radius="xl" pad="md">
                <p className="mb-3 text-10 font-black uppercase tracking-widest text-muted-foreground">
                  Batas pendaftaran
                </p>
                <CountdownTimer deadline={eventConfig.registrationDeadline} />
              </Surface>

              <div className="grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
                <Surface
                  tone="gold"
                  radius="xl"
                  pad="md"
                  className="overflow-hidden"
                >
                  <p className="text-10 font-black uppercase tracking-widest text-astro-navy/70">
                    Langkah awal
                  </p>
                  <p className="mt-2 font-heading text-2xl font-black leading-tight text-astro-navy">
                    Pilih lomba, baca detail, daftar.
                  </p>
                </Surface>
                <div className="relative min-h-42 overflow-hidden rounded-xl bg-linear-to-br from-sky-bottom via-white to-astro-cyan-2/45 shadow-soft">
                  <Image
                    src="/assets/computer.png"
                    alt="Layar retro ASTRO 2026"
                    fill
                    sizes="(min-width: 1024px) 280px, 100vw"
                    className="object-contain object-center p-3"
                    priority
                  />
                </div>
              </div>
            </div>
          </Surface>
        </motion.div>
      </div>
    </section>
  );
}
