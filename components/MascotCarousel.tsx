"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

const MASCOT_CACHE = "?v=all";

export const HERO_MASCOTS = [
  { id: "wave", src: `/assets/mascots/wave.svg${MASCOT_CACHE}`, label: "Halo" },
  { id: "orange-front", src: `/assets/mascots/orange-front.svg${MASCOT_CACHE}`, label: "Oranye" },
  { id: "sit", src: `/assets/mascots/sit.svg${MASCOT_CACHE}`, label: "Santai" },
  { id: "orange-sit", src: `/assets/mascots/orange-sit.svg${MASCOT_CACHE}`, label: "Pita" },
  { id: "reach", src: `/assets/mascots/reach.svg${MASCOT_CACHE}`, label: "Semangat" },
  { id: "orange-reach", src: `/assets/mascots/orange-reach.svg${MASCOT_CACHE}`, label: "Senyum" },
  { id: "cheer", src: `/assets/mascots/cheer.svg${MASCOT_CACHE}`, label: "Hore" },
  { id: "orange-cheer", src: `/assets/mascots/orange-cheer.svg${MASCOT_CACHE}`, label: "Sorak" },
  { id: "alien", src: `/assets/mascots/alien.svg${MASCOT_CACHE}`, label: "Bintang" },
  { id: "bow", src: `/assets/mascots/bow.svg${MASCOT_CACHE}`, label: "Rompi" },
  { id: "wink", src: `/assets/mascots/wink.svg${MASCOT_CACHE}`, label: "Kedip" },
] as const;

type CursorPhase = "hidden" | "in" | "press" | "swipe";

/** Pointer position as a percent of the stage, so the auto-swipe reads as a drag. */
const CURSOR_X: Record<Exclude<CursorPhase, "hidden">, string> = {
  in: "18%",
  press: "14%",
  swipe: "-46%",
};

/**
 * Vector mascot stage. Auto-swipes with a pointer cursor. The drawing is
 * inset so ears, tail, and feet stay inside the frame.
 */
export function MascotCarousel({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const skipClick = useRef(false);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [cursor, setCursor] = useState<CursorPhase>("hidden");

  const go = useCallback((delta: 1 | -1) => {
    setDirection(delta);
    setIndex((current) => (current + delta + HERO_MASCOTS.length) % HERO_MASCOTS.length);
  }, []);

  useEffect(() => {
    if (reduce) {
      const tick = window.setInterval(() => go(1), 5600);
      return () => window.clearInterval(tick);
    }

    setCursor("hidden");
    const appear = window.setTimeout(() => setCursor("in"), 2200);
    const press = window.setTimeout(() => setCursor("press"), 2900);
    const swipe = window.setTimeout(() => setCursor("swipe"), 3280);
    const flip = window.setTimeout(() => go(1), 4100);

    return () => {
      window.clearTimeout(appear);
      window.clearTimeout(press);
      window.clearTimeout(swipe);
      window.clearTimeout(flip);
    };
  }, [go, index, reduce]);

  const mascot = HERO_MASCOTS[index];
  const swiping = cursor === "swipe" && !reduce;

  return (
    <div
      className={cn(
        "relative mx-auto flex w-full flex-col items-center overflow-visible",
        className,
      )}
    >
      <div className="relative mx-auto w-[min(16.5rem,78vw)] overflow-visible sm:w-[min(24rem,54vw)] lg:w-[26rem]">
        <motion.div
          animate={reduce || swiping ? { y: 0 } : { y: [0, -8, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          className="overflow-visible"
        >
          <button
            type="button"
            onClick={() => {
              if (skipClick.current) {
                skipClick.current = false;
                return;
              }
              go(1);
            }}
            aria-label={`Maskot ${mascot.label}. Geser atau klik untuk pose berikutnya`}
            className="relative block w-full cursor-grab overflow-visible active:cursor-grabbing focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <div className="relative w-full overflow-visible">
              <div
                className="relative mx-auto w-full overflow-visible"
                style={{ aspectRatio: "785 / 940" }}
              >
                <AnimatePresence initial={false} mode="sync">
                  <motion.div
                    key={mascot.id}
                    drag={reduce ? false : "x"}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.22}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -48) {
                        skipClick.current = true;
                        go(1);
                      } else if (info.offset.x > 48) {
                        skipClick.current = true;
                        go(-1);
                      }
                    }}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, x: direction * 96 }}
                    animate={swiping ? { opacity: 1, x: -80 } : { opacity: 1, x: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, x: direction * -120 }}
                    transition={{ duration: reduce ? 0.15 : 0.62, ease: EASE }}
                    className="absolute inset-0 touch-pan-y"
                  >
                    <MascotArt src={mascot.src} id={mascot.id} />
                  </motion.div>
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {cursor !== "hidden" && !reduce && (
                  <motion.div
                    key="swipe-cursor"
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-20"
                    initial={{ opacity: 0, x: "28%" }}
                    animate={{
                      opacity: 1,
                      x: CURSOR_X[cursor],
                      y: cursor === "press" ? 10 : cursor === "swipe" ? -8 : 0,
                    }}
                    exit={{ opacity: 0, x: "-52%" }}
                    transition={{ duration: cursor === "swipe" ? 0.72 : 0.32, ease: EASE }}
                  >
                    <div className="absolute top-[48%] left-[52%]">
                      <SwipeCursor pressing={cursor === "press"} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </button>
        </motion.div>
      </div>

      <div className="relative z-10 mt-1 flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Maskot sebelumnya"
          onClick={() => go(-1)}
          className="rounded-full bg-white/80 shadow-soft backdrop-blur-md"
        >
          <ChevronLeft />
        </Button>

        <div className="flex items-center gap-1.5 px-1" role="tablist" aria-label="Pose maskot">
          {HERO_MASCOTS.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={item.label}
              onClick={() => {
                setDirection(i > index ? 1 : -1);
                setIndex(i);
              }}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-5 bg-astro-navy" : "w-1.5 bg-astro-navy/30 hover:bg-astro-navy/55",
              )}
            />
          ))}
        </div>

        <Button
          type="button"
          variant="default"
          size="icon-sm"
          aria-label="Maskot berikutnya"
          onClick={() => go(1)}
          className="rounded-full shadow-gloss ring-2 ring-white/70"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

function MascotArt({ src, id }: { src: string; id: string }) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    const cached = svgCache.get(src);
    if (cached) {
      setHtml(prefixSvgIds(cached, `${id}-`));
      return;
    }

    let cancelled = false;
    fetch(src)
      .then((response) => response.text())
      .then((text) => {
        svgCache.set(src, text);
        if (!cancelled) setHtml(prefixSvgIds(text, `${id}-`));
      });

    return () => {
      cancelled = true;
    };
  }, [id, src]);

  if (!html) {
    return (
      <img
        src={src}
        alt=""
        draggable={false}
        className="pointer-events-none h-full w-full object-contain object-center drop-shadow-[0_18px_28px_rgba(19,26,61,0.22)]"
      />
    );
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none h-full w-full drop-shadow-[0_18px_28px_rgba(19,26,61,0.22)] [&_svg]:h-full [&_svg]:w-full [&_svg]:overflow-visible"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

const svgCache = new Map<string, string>();

function prefixSvgIds(svg: string, prefix: string) {
  return svg
    .replaceAll('[id="', `[id="${prefix}`)
    .replace(/(?<!\[)id="/g, `id="${prefix}`)
    .replaceAll("url(#", `url(#${prefix}`)
    .replaceAll('href="#', `href="#${prefix}`)
    .replaceAll('xlink:href="#', `xlink:href="#${prefix}`);
}

function SwipeCursor({ pressing }: { pressing: boolean }) {
  return (
    <div className="relative -translate-x-1 -translate-y-1">
      <motion.span
        aria-hidden
        className="absolute top-1 left-1 size-8 rounded-full bg-astro-navy/20"
        animate={pressing ? { scale: 1.45, opacity: 0.5 } : { scale: 0.55, opacity: 0 }}
        transition={{ duration: 0.22 }}
      />
      <svg
        width="44"
        height="50"
        viewBox="0 0 36 42"
        fill="none"
        className="relative drop-shadow-[0_8px_12px_rgba(19,26,61,0.32)]"
      >
        <path
          d="M6.2 2.4 6.2 29.2 13.1 23.4 17.8 36.4 22.6 34.6 17.6 21.2 28.8 21.2Z"
          fill="white"
          stroke="#1E3A8A"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M6.2 2.4 6.2 29.2 13.1 23.4 17.8 36.4 22.6 34.6 17.6 21.2 28.8 21.2Z"
          fill="url(#mascot-cursor-gloss)"
          fillOpacity="0.35"
        />
        <defs>
          <linearGradient id="mascot-cursor-gloss" x1="6" y1="2" x2="22" y2="36">
            <stop stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
