"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Mail, MessageSquare, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CtaButton } from "@/components/brand/CtaButton";
import { SectionHeading } from "@/components/brand/SectionHeading";
import { SectionShell } from "@/components/brand/SectionShell";
import { Surface } from "@/components/brand/Surface";
import { WindowCard } from "@/components/brand/WindowCard";
import { useMediaPartners, useSponsors } from "@/src/lib/hooks/use-queries";

interface SponsorItem {
  id: number;
  name: string;
  tier?: string;
  website?: string | null;
  logo?: string | null;
  isCurrent?: boolean;
}

interface MediaPartnerItem {
  id: number;
  name: string;
  website?: string | null;
  logo?: string | null;
  isCurrent?: boolean;
}

/** A titled shelf of partners, with an optional node shown when it is empty. */
interface PartnerGroup {
  title: string;
  items: (SponsorItem | MediaPartnerItem)[];
  fallback?: ReactNode;
}

interface SponsorSectionProps {
  variant?: "home" | "profile" | "all";
  id?: string;
}

const SPONSOR_CP = {
  name: "Muhammad Syafiq Arrafif",
  phone: "+62 851-5711-9650",
  waLink:
    "https://wa.me/6285157119650?text=Halo%20Syafiq,%20saya%20tertarik%20untuk%20bekerja%20sama%20sebagai%20Sponsor%20ASTRO%202026.",
  email: "astro@nurulfikri.ac.id",
  emailLink:
    "mailto:astro@nurulfikri.ac.id?subject=Penawaran%20Kerja%20Sama%20Sponsorship%20ASTRO%202026",
};

const MEDPART_CP = [
  {
    name: "Resna",
    phone: "+62 813-8468-1275",
    waLink:
      "https://wa.me/6281384681275?text=Halo%20Kak%20Resna,%20saya%20tertarik%20mengajukan%20kerja%20sama%20Media%20Partner%20ASTRO%202026.",
  },
  {
    name: "Audy",
    phone: "+62 882-9337-9555",
    waLink:
      "https://wa.me/6288293379555?text=Halo%20Kak%20Audy,%20saya%20tertarik%20mengajukan%20kerja%20sama%20Media%20Partner%20ASTRO%202026.",
  },
];

/**
 * Partners — shelves of logos, then one contact row.
 *
 * The contact block was a sticky sidebar card competing with the shelves for
 * half the width; it is a full-width strip under them now, which is where the
 * reader gets to it anyway.
 */
export default function SponsorSection({ variant = "home", id = "sponsor" }: SponsorSectionProps) {
  const reduce = useReducedMotion();
  const { data: rawSponsors = [] } = useSponsors() as { data: SponsorItem[] };
  const { data: rawMediaPartners = [] } = useMediaPartners() as {
    data: MediaPartnerItem[];
  };

  const sponsors = Array.isArray(rawSponsors) ? rawSponsors : [];
  const mediaPartners = Array.isArray(rawMediaPartners) ? rawMediaPartners : [];

  const currentSponsors = sponsors.filter((sponsor) => !!sponsor.isCurrent);
  const previousSponsors = sponsors.filter((sponsor) => !sponsor.isCurrent);
  const currentMediaPartners = mediaPartners.filter((partner) => !!partner.isCurrent);
  const previousMediaPartners = mediaPartners.filter((partner) => !partner.isCurrent);

  const groups: PartnerGroup[] =
    variant === "home"
      ? [
          {
            title: "Official Sponsor",
            items: currentSponsors,
            fallback: <SponsorFallback />,
          },
          {
            title: "Media Partner",
            items: currentMediaPartners,
            fallback: <MediaPartnerFallback />,
          },
        ]
      : variant === "profile"
        ? [
            { title: "Official Sponsor ASTRO 2026", items: currentSponsors },
            { title: "Sponsor Periode Terdahulu", items: previousSponsors },
            { title: "Official Media Partner ASTRO 2026", items: currentMediaPartners },
            { title: "Media Partner Periode Terdahulu", items: previousMediaPartners },
          ]
        : [
            { title: "Sponsors", items: sponsors },
            { title: "Media Partners", items: mediaPartners },
          ];

  const visibleGroups = groups.filter((group) => group.items.length > 0 || group.fallback);

  return (
    <SectionShell
      id={id}
      band={variant === "home" ? "gold" : "white"}
      space="md"
    >
      <SectionHeading
        eyebrow="Kolaborasi"
        pillTone="gold"
        title={variant === "profile" ? "Jejak kolaborasi" : "Ruang kolaborasi"}
        lead={
          variant === "profile"
            ? "Sponsor dan media partner yang mendukung perjalanan ASTRO."
            : "Brand dan komunitas bisa masuk ke ekosistem ASTRO melalui sponsor, publikasi, dan aktivasi acara."
        }
        align="start"
      />

      <div className="mt-6 grid items-stretch gap-3 sm:mt-8 sm:gap-5 md:grid-cols-2">
        {visibleGroups.map((group, index) => (
          <motion.div
            key={group.title}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ delay: index * 0.06, duration: 0.45 }}
            className="h-full"
          >
            <WindowCard title={group.title} close={false} className="h-full">
              <PartnerShelf items={group.items}>{group.fallback}</PartnerShelf>
            </WindowCard>
          </motion.div>
        ))}
      </div>

      {variant === "home" && (
        <WindowCard
          title="Let's collaborate"
          close={false}
          className="mt-6 sm:mt-8"
          bodyClassName="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex min-w-0 flex-col gap-2">
            <p className="flex items-start gap-2 text-sm font-semibold break-words text-astro-navy">
              <Phone aria-hidden className="mt-0.5 size-4 shrink-0 text-astro-blue" />
              {SPONSOR_CP.name} ({SPONSOR_CP.phone})
            </p>
            <a
              href={SPONSOR_CP.emailLink}
              className="flex items-center gap-2 text-sm font-semibold break-all text-astro-navy hover:underline"
            >
              <Mail aria-hidden className="size-4 text-astro-blue" />
              {SPONSOR_CP.email}
            </a>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
            <CtaButton href={SPONSOR_CP.waLink} size="default" showChevron={false} className="w-full sm:w-auto">
              Hubungi sponsor
            </CtaButton>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/profile#sponsor">
                Lihat rekam jejak
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </WindowCard>
      )}
    </SectionShell>
  );
}

function PartnerShelf({
  items,
  children,
}: {
  items: { id: number; name: string; website?: string | null; logo?: string | null }[];
  children?: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-1 flex-col gap-3">
      <p className="text-xs font-bold text-ink/60">
        {items.length > 0 ? `${items.length} partner` : "Slot terbuka"}
      </p>

      {items.length > 0 ? (
        <div className="grid flex-1 grid-cols-2 content-start gap-3 sm:grid-cols-3">
          {items.map((brand) => (
            <BrandItem key={brand.id} brand={brand} />
          ))}
        </div>
      ) : (
        <div className="flex flex-1">{children}</div>
      )}
    </div>
  );
}

function SponsorFallback() {
  return (
    <Surface tone="tint" radius="xl" pad="md" className="flex min-h-36 flex-1 flex-col justify-center shadow-none">
      <h3 className="font-heading text-base font-black text-astro-navy">
        Slot sponsor masih dibuka
      </h3>
      <p className="mt-1.5 text-sm font-medium leading-relaxed text-ink/75">
        Jangkau peserta, komunitas kampus, dan audience grand final ASTRO 2026.
      </p>
    </Surface>
  );
}

function MediaPartnerFallback() {
  return (
    <Surface tone="tint" radius="xl" pad="md" className="flex min-h-36 flex-1 flex-col justify-center shadow-none">
      <p className="text-sm font-medium leading-relaxed text-ink/75">
        Media partner dapat menghubungi contact person publikasi untuk kerja sama konten dan liputan
        acara.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {MEDPART_CP.map((cp) => (
          <Button key={cp.name} asChild variant="outline" size="sm">
            <a href={cp.waLink} target="_blank" rel="noopener noreferrer">
              <MessageSquare data-icon="inline-start" />
              {cp.name}
            </a>
          </Button>
        ))}
      </div>
    </Surface>
  );
}

function BrandItem({
  brand,
}: {
  brand: { name: string; website?: string | null; logo?: string | null };
}) {
  const content = (
    <div className="flex h-full min-h-24 flex-col items-center justify-center gap-2 rounded-xl border border-astro-cyan-2/40 bg-white p-4 text-center transition-colors hover:border-astro-blue/60">
      {brand.logo && (
        <div className="relative size-12 shrink-0">
          <Image
            src={brand.logo}
            alt={brand.name || "Logo partner"}
            fill
            className="object-contain"
            sizes="48px"
          />
        </div>
      )}
      <span className="font-heading text-xs font-extrabold leading-tight text-astro-navy">
        {brand.name}
      </span>
    </div>
  );

  const websiteUrl = brand.website
    ? brand.website.startsWith("http://") || brand.website.startsWith("https://")
      ? brand.website
      : `https://${brand.website}`
    : null;

  if (websiteUrl) {
    return (
      <a
        href={websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        title={brand.name}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {content}
      </a>
    );
  }

  return content;
}
