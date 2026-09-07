"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import Navbar from "@/components/Navbar"
import { Bubbles } from "./Bubbles"
import { Pattern } from "./Pattern"
import { SiteFooter } from "./SiteFooter"
import { SkyBackdrop } from "./SkyBackdrop"

/**
 * Standard page frame: sky ground, navbar, content, footer.
 *
 * Every public route uses this so the Frutiger-aero sky, pattern, and bubbles
 * are identical instead of being re-derived per page.
 */
export function PageShell({
  children,
  footer = true,
  navbar = true,
  className,
  mainClassName,
}: {
  children: React.ReactNode
  footer?: boolean
  navbar?: boolean
  className?: string
  mainClassName?: string
}) {
  return (
    <div
      data-slot="page-shell"
      className={cn("relative flex min-h-svh flex-col", className)}
    >
      <SkyBackdrop tone="bright" clouds bubbles="sparse" />
      <Pattern className="opacity-35" />
      <Bubbles preset="corners" />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100 focus:rounded-full focus:bg-astro-navy focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
      >
        Lewati ke konten
      </a>
      {navbar && <Navbar />}
      <main id="main-content" className={cn("relative z-10 flex-1", mainClassName)}>
        {children}
      </main>
      {footer && <SiteFooter />}
    </div>
  )
}

/**
 * Centred single-card frame, for auth and other focused flows.
 */
export function CenteredShell({
  children,
  footer = false,
  navbar = false,
  className,
}: {
  children: React.ReactNode
  footer?: boolean
  navbar?: boolean
  className?: string
}) {
  return (
    <PageShell footer={footer} navbar={navbar} className={className}>
      <div className="relative z-10 flex min-h-svh items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </PageShell>
  )
}
