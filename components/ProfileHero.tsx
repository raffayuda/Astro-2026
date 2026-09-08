"use client";

import { motion, useReducedMotion } from "motion/react";
import { ChromeTitle } from "@/components/brand/ChromeTitle";
import { CtaButton } from "@/components/brand/CtaButton";
import { GrassStrip } from "@/components/brand/GrassStrip";
import { Pill } from "@/components/brand/Pill";
import { MascotCarousel } from "@/components/MascotCarousel";
import { Button } from "@/components/ui/button";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function ProfileHero() {
  const reduce = useReducedMotion();

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
      <h1 className="sr-only">ASTRO 2026. Where innovation meets the stars.</h1>
      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-6 px-5 pb-32 pt-4 sm:px-8 lg:grid-cols-2 lg:gap-10 lg:pb-36">
        <motion.div
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.08 }}
          className="flex flex-col items-center text-center lg:items-start lg:text-left"
        >
          <motion.div variants={stage}>
            <Pill tone="blue" size="sm" className="shadow-gloss">
              Profil
            </Pill>
          </motion.div>

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
            className="mt-4 max-w-md text-pretty text-base font-medium leading-relaxed text-astro-navy/70 sm:text-lg"
          >
            Where innovation meets the stars. Persembahan BEM STT-NF.
          </motion.p>

          <motion.div
            variants={stage}
            className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:items-center lg:items-start"
          >
            <CtaButton href="#about-event" size="lg">
              Jelajahi
            </CtaButton>
            <Button asChild variant="ghost" size="lg">
              <a href="#committee">Hubungi panitia</a>
            </Button>
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

      <GrassStrip className="h-32 md:h-40 lg:h-44" />
    </section>
  );
}
