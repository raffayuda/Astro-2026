"use client";

import { motion, useReducedMotion } from "motion/react";

import type { EventConfig } from "@/types/astro";
import { ChromeTitle } from "@/components/brand/ChromeTitle";
import { CtaButton } from "@/components/brand/CtaButton";
import { GrassStrip } from "@/components/brand/GrassStrip";
import { Pill } from "@/components/brand/Pill";
import { MascotCarousel } from "@/components/MascotCarousel";
import CountdownTimer from "./CountdownTimer";

const EASE = [0.16, 1, 0.3, 1] as const;

interface Props {
  eventConfig: EventConfig;
  competitionCount?: number;
}

/**
 * Landing hero, laid out like the Cerdas Cermat / AGT posters: copy on the
 * left, mascot on the right, grass as the ground that separates the scene
 * from the rest of the page.
 */
export default function HeroSection({ eventConfig, competitionCount }: Props) {
  const reduce = useReducedMotion();
  const isOpen = new Date(eventConfig.registrationDeadline).getTime() > Date.now();

  const stage = {
    hidden: { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.55, ease: EASE },
    },
  };

  return (
    <section
      id="home"
      className="relative isolate flex min-h-[100dvh] flex-col overflow-x-clip pt-20"
    >
      <h1 className="sr-only">
        ASTRO 2026. {eventConfig.tagline}
      </h1>
      <img
        src="/assets/agt/swirl-left.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-8 left-0 z-0 hidden h-[min(72%,38rem)] w-auto opacity-80 lg:block"
      />
      <img
        src="/assets/agt/swirl-right.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-8 z-0 hidden h-[min(72%,38rem)] w-auto opacity-80 lg:block"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-4 px-4 pb-24 pt-6 sm:px-8 sm:gap-6 sm:pb-32 lg:grid-cols-2 lg:gap-10 lg:pb-36">
        <motion.div
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.08 }}
          className="flex flex-col items-center text-center lg:items-start lg:text-left"
        >
          {isOpen && (
            <motion.div variants={stage}>
              <Pill tone="pink" size="sm" className="shadow-gloss">
                Open
              </Pill>
            </motion.div>
          )}

          <motion.div variants={stage} className="mt-4 w-[min(100%,22rem)]">
            <ChromeTitle depth="lg" align="center" className="lg:hidden">
              {`ASTRO\n2026`}
            </ChromeTitle>
            <ChromeTitle depth="lg" align="left" className="hidden lg:block">
              {`ASTRO\n2026`}
            </ChromeTitle>
          </motion.div>

          <motion.p
            variants={stage}
            className="mt-4 max-w-md text-pretty text-base font-medium leading-relaxed text-logo-navy/75 sm:text-lg"
          >
            {competitionCount ?? 9} lomba akademik, olahraga, dan esports.
          </motion.p>

          <motion.div variants={stage} className="mt-6">
            <CtaButton href="#competitions" size="lg">
              Daftar segera
            </CtaButton>
          </motion.div>

          <motion.div variants={stage} className="mt-4">
            <CountdownTimer deadline={eventConfig.registrationDeadline} variant="inline" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduce ? 0 : 0.28, duration: reduce ? 0 : 0.7, ease: EASE }}
          className="relative z-10 flex items-center justify-center"
        >
          <MascotCarousel />
        </motion.div>
      </div>

      <GrassStrip className="h-24 sm:h-32 md:h-40 lg:h-44" />
    </section>
  );
}
