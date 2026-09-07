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
  label = "Daftar Segera",
  showAfter = 600,
  className,
}: {
  href?: string
  label?: string
  /** Scroll offset in px before the button appears. */
  showAfter?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > showAfter)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [showAfter])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? undefined : { opacity: 0, y: 24, scale: 0.9 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "fixed bottom-5 right-5 z-50 print:hidden",
            className
          )}
        >
          <Link
            href={href}
            className="group flex items-center gap-2 rounded-full border-2 border-white bg-linear-to-r from-astro-navy via-astro-blue to-cyan-400 py-3 pr-3 pl-5 font-bold text-white shadow-glow-blue ring-3 ring-white/60 transition-transform hover:-translate-y-0.5 active:translate-y-px"
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
