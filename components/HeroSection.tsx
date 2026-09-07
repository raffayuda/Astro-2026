'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { CalendarDays, FileText, Trophy, Users } from 'lucide-react';

import type { EventConfig } from '@/types/astro';
import {
  ChromeTitle,
  CtaButton,
  Pill,
  SkyBackdrop,
  StatCard,
  Surface,
} from '@/components/brand';
import { Button } from '@/components/ui/button';
import CountdownTimer from './CountdownTimer';

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
      className="relative isolate min-h-svh overflow-hidden px-4 pb-18 pt-24 sm:px-6 sm:pb-24 sm:pt-28"
    >
      <SkyBackdrop tone="bright" bubbles="sparse" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-28 opacity-70 sm:h-36">
        <Image
          src="/assets/green-grash.png"
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          priority
          className="object-cover object-top"
        />
      </div>

      <MotionImage
        src="/assets/fish1.png"
        alt=""
        aria-hidden
        width={320}
        height={320}
        priority
        animate={reduce ? undefined : { y: [0, -16, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute bottom-14 right-0 z-10 hidden w-40 select-none sm:block lg:w-64"
      />

      <div className="relative z-20 mx-auto grid min-h-[calc(100svh-10rem)] w-full max-w-7xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col items-start gap-6 text-left">
          <motion.div {...rise(0)} className="flex flex-wrap items-center gap-2">
            <Pill tone="gold" size="sm">
              Open registration
            </Pill>
            <Pill tone="glass" size="sm">
              ASTRO 2026
            </Pill>
          </motion.div>

          <motion.div {...rise(0.08)} className="w-full max-w-3xl">
            <ChromeTitle depth="lg" align="left">
              {`Astro Got
Talent`}
            </ChromeTitle>
          </motion.div>

          <motion.p
            {...rise(0.16)}
            className="max-w-2xl text-base font-semibold leading-relaxed text-astro-navy sm:text-lg"
          >
            {eventConfig.description}
          </motion.p>

          <motion.div
            {...rise(0.24)}
            className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3"
          >
            <StatCard icon={Trophy} metric={eventConfig.totalPrizePool} label="Prize Pool" />
            <StatCard icon={Users} metric="3" label="Kategori" />
            <StatCard icon={CalendarDays} metric="2026" label="Season" />
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
            <div className="mb-5 flex items-center justify-between gap-4 border-b border-astro-cyan-2/40 pb-4">
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
                  <p className="font-heading text-sm font-extrabold uppercase tracking-wide text-astro-navy">
                    Participant landing
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
                <p className="mb-3 text-10 font-black uppercase tracking-widest text-astro-navy/70">
                  Batas pendaftaran
                </p>
                <CountdownTimer deadline={eventConfig.registrationDeadline} />
              </Surface>

              <div className="grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
                <Surface tone="gold" radius="xl" pad="md" className="overflow-hidden">
                  <p className="text-10 font-black uppercase tracking-widest text-astro-navy/70">
                    Total hadiah
                  </p>
                  <p className="mt-2 font-heading text-3xl font-black leading-none text-astro-navy">
                    {eventConfig.totalPrizePool}
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
