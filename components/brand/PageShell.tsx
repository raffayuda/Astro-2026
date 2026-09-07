"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import Navbar from "@/components/Navbar"
import { SiteFooter } from "./SiteFooter"

/**
 * Standard page frame: navbar, content, footer.
 *
 * Every route uses this so the header offset, footer and vertical rhythm are
 * identical instead of being re-derived per page. Section-level decoration
 * (sky, ribbon, bubbles) belongs to SectionShell inside `children`.
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
      className={cn("flex min-h-svh flex-col bg-white", className)}
    >
      {navbar && <Navbar />}
      <main className={cn("flex-1", mainClassName)}>{children}</main>
      {footer && <SiteFooter />}
    </div>
  )
}

/**
 * Centred single-card frame, for auth and other focused flows.
 * Keeps the sky ground and ribbon consistent across login, signup and invite.
 */
export function CenteredShell({
  children,
  footer = false,
  className,
}: {
  children: React.ReactNode
  footer?: boolean
  className?: string
}) {
  return (
    <PageShell footer={footer} className={className}>
      <div className="relative flex min-h-svh items-center justify-center overflow-hidden px-4 py-24">
        <div className="absolute inset-0 bg-linear-to-b from-sky-top via-sky-mid to-white" />
        <div className="relative z-10 w-full max-w-md">{children}</div>
      </div>
    </PageShell>
  )
}
