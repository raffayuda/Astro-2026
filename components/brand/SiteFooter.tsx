import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Mail, Phone } from "lucide-react"
import { FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa6"

import { cn } from "@/lib/utils"

/**
 * Site footer — navy panel with social handles and contact details, per spec
 * sheet 2 (`bg-astro-navy p-8 text-white flex justify-between`).
 *
 * Brand marks come from react-icons/fa6 because lucide-react v1 removed its
 * brand icon set; everything non-brand stays on lucide.
 */

export type SocialLink = {
  kind: "instagram" | "tiktok" | "whatsapp"
  handle: string
  href: string
}

const SOCIAL_ICONS = {
  instagram: FaInstagram,
  tiktok: FaTiktok,
  whatsapp: FaWhatsapp,
} as const

export const ASTRO_SOCIALS: SocialLink[] = [
  {
    kind: "instagram",
    handle: "astrosttnf",
    href: "https://instagram.com/astrosttnf",
  },
  { kind: "tiktok", handle: "astro2026", href: "https://tiktok.com/@astro2026" },
]

export const ASTRO_EMAIL = "astrosttnf@nurulfikri.ac.id"

const NAV = [
  { label: "Kompetisi", href: "/#competitions" },
  { label: "Timeline", href: "/#timeline" },
  { label: "Profil", href: "/profile" },
  { label: "Pengumuman", href: "/announcements" },
  { label: "Cek Pendaftaran", href: "/check-registration" },
  { label: "Sponsorship", href: "/sponsorship" },
]

export function SiteFooter({
  socials = ASTRO_SOCIALS,
  email = ASTRO_EMAIL,
  phone,
  className,
}: {
  socials?: SocialLink[]
  email?: string
  phone?: string
  className?: string
}) {
  return (
    <footer
      data-slot="site-footer"
      className={cn("relative z-10 bg-astro-navy text-white", className)}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:items-start">
          <div className="flex flex-col items-center gap-3 md:items-start">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/assets/logo-astro.png"
                alt="ASTRO 2026"
                width={44}
                height={44}
                className="size-11 object-contain"
              />
              <span className="font-title text-2xl uppercase leading-none">
                Astro 2026
              </span>
            </Link>
            <p className="max-w-xs text-center text-xs font-medium text-white/70 md:text-left">
              Ruang Tanpa Sekat, Tumpukan Bakat. Persembahan BEM STT-NF.
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-semibold text-white/80 transition-colors hover:text-astro-gold"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col items-center gap-3 md:items-end">
            <div className="flex items-center gap-2">
              {socials.map((social) => {
                const Icon = SOCIAL_ICONS[social.kind]
                return (
                  <a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${social.kind}: ${social.handle}`}
                    className="grid size-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-astro-blue"
                  >
                    <Icon className="size-4" aria-hidden />
                  </a>
                )
              })}
            </div>

            <a
              href={`mailto:${email}`}
              className="flex items-center gap-2 text-xs font-semibold text-white/80 transition-colors hover:text-astro-gold"
            >
              <Mail className="size-3.5" aria-hidden />
              {email}
            </a>

            {phone && (
              <a
                href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                className="flex items-center gap-2 text-xs font-semibold text-white/80 transition-colors hover:text-astro-gold"
              >
                <Phone className="size-3.5" aria-hidden />
                {phone}
              </a>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-white/15 pt-6 text-10 font-semibold uppercase tracking-widest text-white/50 sm:flex-row">
          <p>&copy; 2026 BEM STT-NF</p>
          <p>Sekolah Tinggi Teknologi Terpadu Nurul Fikri</p>
        </div>
      </div>
    </footer>
  )
}
