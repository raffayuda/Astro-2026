"use client";

import * as React from "react";
import {
  Camera,
  Clapperboard,
  Eye,
  Flag,
  Globe,
  IdCard,
  Mail,
  PartyPopper,
  Presentation,
  Shirt,
  Store,
  Trophy,
  Users,
  Video,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";

import {
  CtaButton,
  PageShell,
  Pill,
  RetroMonitorWidget,
  SectionHeading,
  SectionShell,
  StatCard,
  Surface,
  WindowCard,
} from "@/components/brand";

const AUDIENCE = [
  {
    metric: "1.500+",
    label: "Target partisipan",
    icon: Users,
    hint: "Jangkauan audiens yang masif dan terarah.",
  },
  {
    metric: "1.000+",
    label: "Peserta kompetisi",
    icon: Trophy,
    hint: "Siswa SMA/SMK dan mahasiswa aktif.",
  },
  {
    metric: "350+",
    label: "Penonton Astro Fest",
    icon: Eye,
    hint: "Puncak festival musik luring.",
  },
  {
    metric: "300+",
    label: "Audiens grand opening",
    icon: PartyPopper,
    hint: "Pembukaan Festival Nusantara.",
  },
] as const;

const CHANNELS = [
  { label: "Instagram Feed", icon: Camera },
  { label: "Instagram Story", icon: Video },
  { label: "Collaboration Video", icon: Clapperboard },
  { label: "Website Resmi", icon: Globe },
  { label: "Backdrop Stage", icon: Presentation },
  { label: "Merchandise & Kaos", icon: Shirt },
  { label: "Booth Exhibition Space", icon: Store },
  { label: "ID Card", icon: IdCard },
  { label: "Opening & Closing Video", icon: Clapperboard },
];

const TIER_DETAIL: Record<string, string[]> = {
  Platinum: [
    "Logo dominan di seluruh media publikasi",
    "Booth exhibition ukuran penuh",
    "Collaboration video eksklusif",
    "Penyebutan di Opening & Closing",
  ],
  Gold: [
    "Logo di backdrop stage & banner venue",
    "Booth exhibition standar",
    "Instagram feed & story",
    "Logo di ID Card peserta",
  ],
  Silver: ["Logo di banner venue", "Instagram story", "Logo di website resmi"],
  Bronze: ["Logo di website resmi", "Penyebutan di Instagram story"],
};

export function SponsorshipClient() {
  const [tier, setTier] = React.useState("Gold");

  return (
    <PageShell>
      <SectionShell sky="soft" className="pt-24 md:pt-28" space="md">
        <div className="flex flex-col items-center gap-6 text-center">
          <SectionHeading
            title="Jadi mitra ASTRO 2026"
            lead="Hadirkan brand Anda di hadapan generasi muda yang aktif se-Jabodetabek."
          />

          <WindowCard
            title="Why Partner with ASTRO 2026?"
            className="mt-4 w-full max-w-3xl text-left"
            bodyClassName="space-y-5"
          >
            <p className="text-sm font-medium leading-relaxed text-ink/80">
              Hadirkan brand Anda langsung di hadapan generasi muda aktif dan potensial
              se-Jabodetabek.
            </p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-2">
              {AUDIENCE.map((stat) => (
                <StatCard
                  key={stat.label}
                  icon={stat.icon}
                  metric={stat.metric}
                  label={stat.label}
                  hint={stat.hint}
                />
              ))}
            </div>
          </WindowCard>
        </div>
      </SectionShell>

      {/* ── Packages ── */}
      <SectionShell sky="soft" clouds={false} bubbles="none" space="md">
        <SectionHeading
          eyebrow="Paket Kemitraan"
          title="Pilih Paket Terbaik"
          lead="Empat tingkat kemitraan dengan cakupan eksposur yang berbeda. Pilih tier untuk melihat rinciannya."
        />

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-2">
          <RetroMonitorWidget selected={tier} onSelect={setTier} />

          <Surface pad="lg" radius="xl">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-heading text-xl font-extrabold uppercase text-astro-navy">
                  {tier}
                </p>
                <Pill tone="blue" size="sm">
                  Tier terpilih
                </Pill>
              </div>
              <ul className="flex flex-col gap-2">
                {(TIER_DETAIL[tier] ?? []).map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 rounded-md bg-sky-bottom px-3 py-2 text-sm font-semibold text-ink"
                  >
                    <span aria-hidden className="mt-1 size-2 shrink-0 rounded-full bg-astro-blue" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Surface>
        </div>
      </SectionShell>

      {/* ── Exposure ── */}
      <SectionShell ribbon sky="bright" bubbles="corners" space="lg">
        <SectionHeading
          eyebrow="Brand Exposure"
          title="Visibility"
          lead="Brand Anda tampil dominan pada berbagai media publikasi fisik dan digital resmi ASTRO 2026."
        />

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-3">
          {CHANNELS.map((channel) => (
            <StatCard key={channel.label} icon={channel.icon} label={channel.label} checked />
          ))}
          <StatCard
            icon={Flag}
            label="X-Banner & Banner Venue"
            checked
            className="col-span-2 md:col-span-3"
          />
        </div>
      </SectionShell>

      {/* ── Contact ── */}
      <SectionShell sky="soft" clouds={false} bubbles="sparse" space="md">
        <SectionHeading eyebrow="Kontak" title="Let's Collaborate" />

        <Surface
          pad="xl"
          radius="xl"
          className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left"
        >
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-ink">
              Tertarik menjadi sponsor ASTRO 2026? Hubungi tim kemitraan kami untuk proposal
              lengkap.
            </p>
            <a
              href="mailto:astro@nurulfikri.ac.id"
              className="flex items-center justify-center gap-2 text-sm font-bold text-astro-blue hover:underline md:justify-start"
            >
              <Mail className="size-4" aria-hidden />
              astro@nurulfikri.ac.id
            </a>
          </div>

          <CtaButton
            href="https://wa.me/6281384681275"
            tone="default"
            size="lg"
            showChevron={false}
          >
            <FaWhatsapp className="size-5" aria-hidden />
            Hubungi Kami
          </CtaButton>
        </Surface>
      </SectionShell>
    </PageShell>
  );
}
