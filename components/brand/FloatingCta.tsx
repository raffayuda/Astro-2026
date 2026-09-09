"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Persistent registration CTA.
 *
 * Appears once the hero has scrolled past, so it never competes with the hero's
 * own primary button. Hidden entirely for reduced-motion users only in its
 * animation, not its availability.
 */
export function FloatingCta({
  href = "#competitions",
  label = "Daftar segera",
  className,
}: {
  href?: string
  label?: string
  className?: string
}) {
  const reduce = useReducedMotion()
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const hero = document.getElementById("home")
    if (!hero) {
      setVisible(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.12 },
    )
    io.observe(hero)
    return () => io.disconnect()
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? undefined : { opacity: 0, y: 24, scale: 0.9 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "fixed z-50 print:hidden",
            "inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] sm:inset-x-auto sm:right-5 sm:bottom-5",
            className
          )}
        >
          <Link
            href={href}
            className="group flex w-full items-center justify-center gap-2 rounded-full border-2 border-white bg-linear-to-r from-astro-navy via-astro-blue to-astro-sky py-3 pr-3 pl-5 font-bold text-white shadow-glow-blue ring-3 ring-white/60 transition-transform hover:-translate-y-0.5 active:translate-y-px sm:w-auto"
          >
            <span className="text-sm uppercase tracking-wide">{label}</span>
            <span
              aria-hidden
              className="grid size-7 place-items-center rounded-full bg-white/25 ring-1 ring-inset ring-white/60 transition-transform group-hover:translate-x-0.5"
            >
              <ChevronRight className="size-4" />
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
