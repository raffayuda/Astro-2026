import * as React from "react";
import { Mail } from "lucide-react";
import { FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa6";

import { cn } from "@/lib/utils";

export type SocialLink = {
  kind: "instagram" | "tiktok" | "whatsapp";
  handle: string;
  href: string;
};

export const ASTRO_SOCIALS: SocialLink[] = [
  {
    kind: "instagram",
    handle: "astrosttnf",
    href: "https://instagram.com/astrosttnf",
  },
  {
    kind: "tiktok",
    handle: "astro2026",
    href: "https://tiktok.com/@astro2026",
  },
];

export const ASTRO_EMAIL = "astro@nurulfikri.ac.id";

const ICONS = {
  instagram: FaInstagram,
  tiktok: FaTiktok,
  whatsapp: FaWhatsapp,
} as const;

/**
 * Frosted contact strip from the Cerdas Cermat posters: glass pill with
 * Instagram, email, and TikTok sitting over sky or grass.
 */
export function GlassBar({
  socials = ASTRO_SOCIALS,
  email = ASTRO_EMAIL,
  className,
}: {
  socials?: SocialLink[];
  email?: string;
  className?: string;
}) {
  return (
    <div
      data-slot="glass-bar"
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-full bg-white/40 px-5 py-3 text-xs font-semibold text-astro-navy shadow-soft ring-1 ring-white/70 backdrop-blur-md sm:gap-x-8 sm:px-8",
        className,
      )}
    >
      {socials.map((social) => {
        const Icon = ICONS[social.kind];
        return (
          <a
            key={social.href}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 transition-colors hover:text-astro-blue"
          >
            <Icon className="size-3.5" aria-hidden />
            <span>@{social.handle}</span>
          </a>
        );
      })}
      <a
        href={`mailto:${email}`}
        className="inline-flex items-center gap-2 transition-colors hover:text-astro-blue"
      >
        <Mail className="size-3.5" aria-hidden />
        <span className="hidden sm:inline">{email}</span>
        <span className="sm:hidden">Email</span>
      </a>
    </div>
  );
}
