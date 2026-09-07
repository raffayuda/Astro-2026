'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';

import type { EventConfig } from '@/types/astro';
import { ChromeTitle, CtaButton, Pill, SkyBackdrop, Subtitle } from '@/components/brand';
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
      className="relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden pt-24 pb-40 sm:pt-28"
    >
      <SkyBackdrop tone="bright" bubbles="dense" />

      {/* ─── Grass horizon ─── */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-36 sm:h-44">
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

      {/* ─── Mascot ─── */}
      <MotionImage
        src="/assets/fish1.png"
        alt=""
        aria-hidden
        width={320}
        height={320}
        priority
        animate={reduce ? undefined : { y: [0, -16, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute bottom-20 -right-6 z-10 w-40 select-none sm:w-56 lg:w-72"
      />

      {/* ─── Content ─── */}
      <div className="relative z-20 mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-4 text-center">
        <motion.div {...rise(0)}>
          <Pill tone="gold" size="sm">
            Pendaftaran Dibuka
          </Pill>
        </motion.div>

        <motion.div {...rise(0.08)} className="w-full">
          <ChromeTitle depth="lg" align="middle" className="mx-auto max-w-3xl">
            {`Astro
2026`}
          </ChromeTitle>
        </motion.div>

        <motion.div {...rise(0.16)}>
          <Subtitle className="text-white drop-shadow-md">
            {eventConfig.tagline}
          </Subtitle>
        </motion.div>

        <motion.p
          {...rise(0.24)}
          className="max-w-xl text-sm font-semibold text-astro-navy sm:text-base"
        >
          {eventConfig.description}
        </motion.p>

        <motion.div {...rise(0.32)} className="w-full max-w-lg">
          <CountdownTimer deadline={eventConfig.registrationDeadline} />
        </motion.div>

        <motion.div
          {...rise(0.4)}
          className="flex flex-col items-center gap-3 sm:flex-row"
        >
          <CtaButton href="#competitions" size="lg">
            Daftar Segera
          </CtaButton>
          <Button variant="outline" size="lg" asChild>
            <a href={eventConfig.generalJuknisUrl} target="_blank" rel="noopener noreferrer">
              Unduh Juknis
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
