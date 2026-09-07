"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Handshake, Mail, MessageSquare, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Pattern,
  Pill,
  SectionHeading,
  SectionShell,
  Surface,
} from "@/components/brand";
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

export default function SponsorSection({
  variant = "home",
  id = "sponsor",
}: SponsorSectionProps) {
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
            title: "Official Sponsor ASTRO 2026",
            items: currentSponsors,
            fallback: <SponsorFallback />,
          },
          {
            title: "Official Media Partner ASTRO 2026",
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

  const visibleGroups = groups.filter(
    (group) => group.items.length > 0 || group.fallback,
  );

  return (
    <SectionShell
      id={id}
      sky="none"
      width="wide"
      className="relative overflow-hidden bg-linear-to-b from-surface via-sky-bottom to-astro-cyan-2/70 py-18 text-astro-navy md:py-24"
    >
      <Pattern className="absolute inset-0 -z-10 opacity-25" />

      <div className="grid gap-8 lg:grid-cols-[0.38fr_0.62fr] lg:items-start">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="lg:sticky lg:top-24"
        >
          <SectionHeading
            eyebrow="Partner"
            title={variant === "profile" ? "Jejak kolaborasi" : "Ruang kolaborasi"}
            lead={
              variant === "profile"
                ? "Sponsor dan media partner yang mendukung perjalanan ASTRO."
                : "Brand dan komunitas bisa masuk ke ekosistem ASTRO melalui sponsor, publikasi, dan aktivasi acara."
            }
            align="start"
            chrome={false}
          />

          {variant === "home" && (
            <Surface
              tone="plain"
              radius="2xl"
              pad="lg"
              className="mt-6 border border-white/80 bg-white/85 backdrop-blur"
            >
              <Pill tone="gold" size="sm">
                Let's collaborate
              </Pill>
              <div className="mt-4 flex flex-col gap-3 text-sm font-medium text-ink">
                <p className="flex items-center gap-2">
                  <Phone className="size-4 text-astro-blue" />
                  <span>
                    {SPONSOR_CP.name} ({SPONSOR_CP.phone})
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="size-4 text-astro-blue" />
                  <a href={SPONSOR_CP.emailLink} className="font-bold text-astro-navy hover:underline">
                    {SPONSOR_CP.email}
                  </a>
                </p>
              </div>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row lg:flex-col">
                <Button asChild className="rounded-full text-xs font-black uppercase tracking-wider">
                  <a href={SPONSOR_CP.waLink} target="_blank" rel="noopener noreferrer">
                    <MessageSquare data-icon="inline-start" />
                    Hubungi sponsor
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full text-xs font-black uppercase tracking-wider"
                >
                  <Link href="/profile#sponsor">
                    Lihat rekam jejak
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                </Button>
              </div>
            </Surface>
          )}
        </motion.div>

        <div className="flex flex-col gap-5">
          {visibleGroups.map((group, index) => (
            <motion.div
              key={group.title}
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: index * 0.06, duration: 0.45 }}
            >
              <PartnerShelf title={group.title} items={group.items}>
                {group.fallback}
              </PartnerShelf>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function PartnerShelf({
  title,
  items,
  children,
}: {
  title: string;
  items: { id: number; name: string; website?: string | null; logo?: string | null }[];
  children?: React.ReactNode;
}) {
  return (
    <Surface
      tone="plain"
      radius="2xl"
      pad="lg"
      className="border border-white/80 bg-white/88 backdrop-blur"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Pill tone="blue" size="sm">
          {title}
        </Pill>
        <span className="text-10 font-black uppercase tracking-widest text-muted-foreground">
          {items.length > 0 ? `${items.length} partner` : "Open slot"}
        </span>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((brand) => (
            <BrandItem key={brand.id} brand={brand} />
          ))}
        </div>
      ) : (
        children
      )}
    </Surface>
  );
}

function SponsorFallback() {
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-sky-bottom p-5">
      <span className="grid size-11 place-items-center rounded-full bg-white text-astro-blue shadow-soft-sm">
        <Handshake className="size-5" />
      </span>
      <div>
        <h3 className="font-heading text-lg font-black text-astro-navy">
          Slot sponsor masih dibuka
        </h3>
        <p className="mt-1 text-sm font-medium leading-relaxed text-ink">
          Jangkau peserta, komunitas kampus, dan audience grand final ASTRO 2026.
        </p>
      </div>
    </div>
  );
}

function MediaPartnerFallback() {
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-sky-bottom p-5">
      <p className="text-sm font-medium leading-relaxed text-ink">
        Media partner dapat menghubungi contact person publikasi untuk kerja sama
        konten dan liputan acara.
      </p>
      <div className="flex flex-wrap gap-2">
        {MEDPART_CP.map((cp) => (
          <Button
            key={cp.name}
            asChild
            variant="outline"
            size="sm"
            className="rounded-full text-xs font-black uppercase tracking-wider"
          >
            <a href={cp.waLink} target="_blank" rel="noopener noreferrer">
              <MessageSquare data-icon="inline-start" />
              {cp.name}
            </a>
          </Button>
        ))}
      </div>
    </div>
  );
}

function BrandItem({
  brand,
}: {
  brand: { name: string; website?: string | null; logo?: string | null };
}) {
  const content = (
    <div className="flex min-h-24 items-center justify-center gap-3 rounded-xl bg-sky-bottom/70 p-4 text-center shadow-soft-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-soft">
      {brand.logo && (
        <div className="relative size-14 shrink-0">
          <Image
            src={brand.logo}
            alt={brand.name || "Logo partner"}
            fill
            className="object-contain"
            sizes="56px"
          />
        </div>
      )}
      <span className="font-heading text-sm font-extrabold leading-tight text-astro-navy">
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
