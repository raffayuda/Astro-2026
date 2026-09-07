"use client"

import * as React from "react"
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
} from "lucide-react"
import { FaWhatsapp } from "react-icons/fa6"

import {
  ChromeTitle,
  CtaButton,
  Pill,
  RetroMonitorWidget,
  SectionHeading,
  SectionShell,
  SiteFooter,
  StatCard,
  Subtitle,
  Surface,
} from "@/components/brand"
import Navbar from "@/components/Navbar"

const AUDIENCE = [
  { metric: "1.500+", label: "Target Pengunjung", icon: Users },
  { metric: "1.000+", label: "Peserta Kompetisi", icon: Trophy },
  { metric: "350+", label: "Penonton Grand Final", icon: Eye },
  { metric: "500+", label: "Audience Grand Opening", icon: PartyPopper },
]

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
]

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
  Silver: [
    "Logo di banner venue",
    "Instagram story",
    "Logo di website resmi",
  ],
  Bronze: ["Logo di website resmi", "Penyebutan di Instagram story"],
}

export function SponsorshipClient() {
  const [tier, setTier] = React.useState("Gold")

  return (
    <main className="relative min-h-screen">
      <Navbar />

      {/* ── Hero ── */}
      <SectionShell
        ribbon
        sky="bright"
        bubbles="dense"
        className="pb-20 pt-32 md:pt-40"
      >
        <div className="flex flex-col items-center gap-6 text-center">
          <Pill tone="white" size="sm">
            Sponsorship Proposal
          </Pill>
          <ChromeTitle depth="md" align="middle" className="mx-auto max-w-2xl">
            Why Partner
          </ChromeTitle>
          <Subtitle>With Astro 2026</Subtitle>
          <p className="max-w-2xl text-sm font-semibold text-astro-navy sm:text-base">
            Hadirkan brand Anda langsung di hadapan generasi muda yang aktif dan
            potensial se-Jabodetabek.
          </p>

          <div className="mt-4 grid w-full max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
            {AUDIENCE.map((stat) => (
              <StatCard
                key={stat.label}
                icon={stat.icon}
                metric={stat.metric}
                label={stat.label}
              />
            ))}
          </div>
        </div>
      </SectionShell>

      {/* ── Packages ── */}
      <SectionShell sky="soft" clouds={false} bubbles="none" className="py-20">
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
                    <span
                      aria-hidden
                      className="mt-1 size-2 shrink-0 rounded-full bg-astro-blue"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Surface>
        </div>
      </SectionShell>

      {/* ── Exposure ── */}
      <SectionShell
        ribbon
        sky="bright"
        bubbles="corners"
        className="py-20 md:py-24"
      >
        <SectionHeading
          eyebrow="Brand Exposure"
          title="Visibility"
          lead="Brand Anda tampil dominan pada berbagai media publikasi fisik dan digital resmi ASTRO 2026."
        />

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-3">
          {CHANNELS.map((channel) => (
            <StatCard
              key={channel.label}
              icon={channel.icon}
              label={channel.label}
              checked
            />
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
      <SectionShell sky="soft" clouds={false} bubbles="sparse" className="py-20">
        <SectionHeading eyebrow="Kontak" title="Let's Collaborate" />

        <Surface
          pad="xl"
          radius="xl"
          className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left"
        >
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-ink">
              Tertarik menjadi sponsor ASTRO 2026? Hubungi tim kemitraan kami
              untuk proposal lengkap.
            </p>
            <a
              href="mailto:astrosttnf@nurulfikri.ac.id"
              className="flex items-center justify-center gap-2 text-sm font-bold text-astro-blue hover:underline md:justify-start"
            >
              <Mail className="size-4" aria-hidden />
              astrosttnf@nurulfikri.ac.id
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

      <SiteFooter />
    </main>
  )
}
