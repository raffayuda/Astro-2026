"use client"

import * as React from "react"
import {
  Clapperboard,
  Eye,
  Flag,
  Globe,
  IdCard,
  Camera,
  PartyPopper,
  Presentation,
  Shirt,
  Store,
  Trophy,
  Users,
  Video,
} from "lucide-react"

import {
  AccentLine,
  BenefitCard,
  ChevronRibbon,
  ChromeText,
  CtaButton,
  Pill,
  PricePill,
  RetroMonitorWidget,
  ScheduleCard,
  SectionHeading,
  SectionShell,
  StatCard,
  Surface,
  TALENT_CATEGORIES,
  TalentCategoryCard,
  type TalentId,
} from "@/components/brand"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const COLOR_GROUPS = [
  {
    name: "Primary",
    swatches: [
      { name: "astro-blue", hex: "#3B82F6", cls: "bg-astro-blue" },
      { name: "astro-cyan-2", hex: "#93C5FD", cls: "bg-astro-cyan-2" },
      { name: "astro-navy", hex: "#1E3A8A", cls: "bg-astro-navy" },
    ],
  },
  {
    name: "Accent",
    swatches: [
      { name: "pastel-orange", hex: "#FF9E64", cls: "bg-pastel-orange" },
      { name: "astro-gold", hex: "#FACC15", cls: "bg-astro-gold" },
      { name: "astro-pink", hex: "#EC4899", cls: "bg-astro-pink" },
      { name: "astro-lime2", hex: "#A3E635", cls: "bg-astro-lime2" },
    ],
  },
  {
    name: "Sky and neutral",
    swatches: [
      { name: "sky-top", hex: "#7EC8F5", cls: "bg-sky-top" },
      { name: "sky-mid", hex: "#B8E4FB", cls: "bg-sky-mid" },
      { name: "sky-bottom", hex: "#E8F6FE", cls: "bg-sky-bottom" },
      { name: "surface", hex: "#F3F4F6", cls: "bg-surface" },
      { name: "ink", hex: "#1F2937", cls: "bg-ink" },
    ],
  },
]

const SCHEDULE = [
  { phase: "Pendaftaran Batch 1", dateLabel: "15-30 Sep 2026", status: "done" as const },
  { phase: "Pendaftaran Batch 2", dateLabel: "1-26 Okt 2026", status: "active" as const },
  { phase: "Technical Meeting", dateLabel: "11 Nov 2026", status: "upcoming" as const },
  { phase: "Showcase", dateLabel: "6 Des 2026", status: "upcoming" as const },
  { phase: "Grand Final", dateLabel: "13 Des 2026", status: "upcoming" as const },
]

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
  { label: "Merchandise dan Kaos", icon: Shirt },
  { label: "Booth Exhibition", icon: Store },
  { label: "ID Card", icon: IdCard },
  { label: "X-Banner dan Venue", icon: Flag },
]

const BUTTON_TONES = [
  "default",
  "secondary",
  "gold",
  "talent",
  "pink",
  "outline",
  "ghost",
  "destructive",
  "link",
] as const

const BUTTON_SIZES = ["xs", "sm", "default", "lg", "xl"] as const

const SURFACE_TONES = [
  "plain",
  "tint",
  "blue",
  "pink",
  "orange",
  "gold",
  "sticker",
] as const

const PILL_TONES = [
  "white",
  "blue",
  "navy",
  "gold",
  "pink",
  "orange",
  "glass",
] as const

const BADGE_VARIANTS = [
  "default",
  "secondary",
  "outline",
  "destructive",
  "ghost",
  "link",
] as const

const SHADOWS = [
  { name: "shadow-soft-sm", cls: "shadow-soft-sm" },
  { name: "shadow-soft", cls: "shadow-soft" },
  { name: "shadow-soft-lg", cls: "shadow-soft-lg" },
  { name: "shadow-glow-blue", cls: "shadow-glow-blue" },
  { name: "shadow-sticker", cls: "shadow-sticker" },
]

/** One labelled block in the style guide. */
function Spec({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="font-masterpiece text-xl uppercase text-astro-navy">
          {title}
        </h3>
        {hint && (
          <p className="text-xs font-medium text-muted-foreground">{hint}</p>
        )}
        <AccentLine />
      </div>
      <Surface pad="lg" radius="xl">
        {children}
      </Surface>
    </section>
  )
}

export function DesignSystemClient() {
  const [talent, setTalent] = React.useState<TalentId>("dance")
  const [tier, setTier] = React.useState("Gold")

  return (
    <main className="relative min-h-screen pb-24">
      <SectionShell ribbon sky="bright" bubbles="dense" className="pb-16 pt-24">
        <div className="flex flex-col items-center gap-5 text-center">
          <Pill tone="white" size="sm">
            Design System
          </Pill>
          <ChromeText
            as="h1"
            depth="lg"
            className="text-5xl sm:text-6xl lg:text-7xl"
          >
            Core Components
          </ChromeText>
          <p className="max-w-2xl text-sm font-semibold text-astro-navy sm:text-base">
            Every ASTRO 2026 surface is composed from the components below. No
            global astro-star CSS classes and no arbitrary Tailwind values:
            tokens live in globals.css, behaviour lives in React.
          </p>
          <CtaButton href="/">Kembali ke Beranda</CtaButton>
        </div>
      </SectionShell>

      <SectionShell sky="soft" clouds={false} bubbles="none" className="py-16">
        <div className="flex flex-col gap-14">
          <Spec
            title="Colour tokens"
            hint="Declared in @theme inline; every swatch below is a real generated utility."
          >
            <div className="flex flex-col gap-6">
              {COLOR_GROUPS.map((group) => (
                <div key={group.name} className="flex flex-col gap-3">
                  <p className="text-2xs font-bold uppercase tracking-widest text-muted-foreground">
                    {group.name}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {group.swatches.map((swatch) => (
                      <div key={swatch.name} className="flex flex-col gap-1.5">
                        <div
                          className={cnSwatch(swatch.cls)}
                          aria-hidden
                        />
                        <p className="text-2xs font-bold uppercase text-astro-navy">
                          {swatch.name}
                        </p>
                        <p className="font-mono text-2xs text-muted-foreground">
                          {swatch.hex}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Spec>

          <Spec
            title="Typography"
            hint="Masterpiece for display type, Geist for body copy."
          >
            <div className="flex flex-col gap-5">
              <ChromeText as="p" depth="lg" className="text-5xl">
                Chrome LG
              </ChromeText>
              <ChromeText as="p" depth="md" className="text-4xl">
                Chrome MD
              </ChromeText>
              <ChromeText as="p" depth="sm" className="text-3xl">
                Chrome SM
              </ChromeText>
              <p className="font-masterpiece text-3xl uppercase text-astro-navy">
                Masterpiece display
              </p>
              <p className="text-base text-ink">
                Geist body copy, used for all running text, form labels and
                table content.
              </p>
              <p className="text-2xs font-bold uppercase tracking-widest text-muted-foreground">
                Micro label / text-2xs
              </p>
            </div>
          </Spec>

          <Spec
            title="Elevation"
            hint="Soft diffuse by default; the hard sticker offset stays available for poster surfaces."
          >
            <div className="flex flex-wrap gap-4">
              {SHADOWS.map((shadow) => (
                <div
                  key={shadow.name}
                  className="flex flex-col items-center gap-2"
                >
                  <div className={cnShadowSwatch(shadow.cls)} aria-hidden />
                  <p className="font-mono text-2xs text-muted-foreground">
                    {shadow.name}
                  </p>
                </div>
              ))}
            </div>
          </Spec>

          <Spec
            title="Primary CTA"
            hint="CtaButton: gradient pill, white ring, circled chevron."
          >
            <div className="flex flex-wrap items-center gap-4">
              <CtaButton size="xl">Daftar Segera</CtaButton>
              <CtaButton size="lg">Daftar Segera</CtaButton>
              <CtaButton size="default">Daftar Segera</CtaButton>
              <CtaButton tone="gold">Jadi Sponsor</CtaButton>
              <CtaButton tone="pink" showChevron={false}>
                Tanpa Chevron
              </CtaButton>
            </div>
          </Spec>

          <Spec
            title="Button variants"
            hint="Nine tones and nine sizes; every data-slot and data-icon consumer hook is preserved."
          >
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-3">
                {BUTTON_TONES.map((tone) => (
                  <Button key={tone} variant={tone}>
                    {tone}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {BUTTON_SIZES.map((size) => (
                  <Button key={size} size={size}>
                    size {size}
                  </Button>
                ))}
              </div>
            </div>
          </Spec>

          <Spec
            title="Event schedule card"
            hint="ScheduleCard: gold banner, status icon, date and phase."
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SCHEDULE.map((item) => (
                <ScheduleCard
                  key={item.phase}
                  phase={item.phase}
                  dateLabel={item.dateLabel}
                  status={item.status}
                />
              ))}
            </div>
          </Spec>

          <Spec
            title="Talent category card"
            hint="TalentCategoryCard: click to select. The mini variant is used inside the registration form."
          >
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                {TALENT_CATEGORIES.map((category) => (
                  <TalentCategoryCard
                    key={category.id}
                    id={category.id}
                    label={category.label}
                    selected={talent === category.id}
                    onSelect={setTalent}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {TALENT_CATEGORIES.map((category) => (
                  <TalentCategoryCard
                    key={category.id}
                    id={category.id}
                    label={category.label}
                    size="mini"
                    selected={talent === category.id}
                    onSelect={setTalent}
                  />
                ))}
              </div>
            </div>
          </Spec>

          <Spec title="Benefit card and price pill" hint="BenefitCard, PricePill.">
            <div className="flex flex-wrap items-start gap-8">
              <BenefitCard className="w-full max-w-xs" />
              <div className="flex flex-col gap-4">
                <PricePill amount="Rp 20.000" unit="Orang" />
                <PricePill amount="Gratis" />
              </div>
            </div>
          </Spec>

          <Spec
            title="Stat card"
            hint="StatCard: metric variant for figures, checked variant for exposure channels."
          >
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {AUDIENCE.map((stat) => (
                  <StatCard
                    key={stat.label}
                    icon={stat.icon}
                    metric={stat.metric}
                    label={stat.label}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {CHANNELS.map((channel) => (
                  <StatCard
                    key={channel.label}
                    icon={channel.icon}
                    label={channel.label}
                    checked
                  />
                ))}
              </div>
            </div>
          </Spec>

          <Spec
            title="Retro monitor widget"
            hint="RetroMonitorWidget: the sponsorship tier selector from slide three."
          >
            <RetroMonitorWidget selected={tier} onSelect={setTier} />
          </Spec>

          <Spec
            title="Surface tones"
            hint="Surface is the single card and panel primitive."
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SURFACE_TONES.map((tone) => (
                <Surface key={tone} tone={tone} pad="md" interactive>
                  <p className="font-masterpiece text-lg uppercase">{tone}</p>
                  <p className="text-xs font-medium opacity-80">tone {tone}</p>
                </Surface>
              ))}
            </div>
          </Spec>

          <Spec
            title="Pills and badges"
            hint="Pill is the brand chip; Badge is the shadcn primitive."
          >
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-3">
                {PILL_TONES.map((tone) => (
                  <Pill key={tone} tone={tone}>
                    {tone}
                  </Pill>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {BADGE_VARIANTS.map((variant) => (
                  <Badge key={variant} variant={variant}>
                    {variant}
                  </Badge>
                ))}
              </div>
            </div>
          </Spec>

          <Spec
            title="Form controls"
            hint="Input and Textarea: two-pixel cyan rail with a blue focus ring."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="ds-name"
                  className="text-2xs font-bold uppercase tracking-widest text-ink"
                >
                  Nama Lengkap
                </label>
                <Input id="ds-name" placeholder="Nama peserta" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="ds-email"
                  className="text-2xs font-bold uppercase tracking-widest text-ink"
                >
                  Email
                </label>
                <Input
                  id="ds-email"
                  type="email"
                  placeholder="nama@nurulfikri.ac.id"
                />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label
                  htmlFor="ds-note"
                  className="text-2xs font-bold uppercase tracking-widest text-ink"
                >
                  Catatan
                </label>
                <Textarea id="ds-note" placeholder="Deskripsi penampilan" />
              </div>
            </div>
          </Spec>

          <Spec
            title="Card primitive"
            hint="The shadcn Card, retuned onto the soft-shadow surface."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Lomba Esports</CardTitle>
                  <CardDescription>Mobile Legends 5v5</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-ink">
                    Kuota 32 tim. Pendaftaran ditutup 26 Oktober 2026.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Lihat Detail</Button>
                </CardFooter>
              </Card>
              <Card size="sm">
                <CardHeader>
                  <CardTitle>Card size sm</CardTitle>
                  <CardDescription>Tighter spacing scale</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-ink">
                    Used inside the dashboard tables.
                  </p>
                </CardContent>
              </Card>
            </div>
          </Spec>

          <Spec
            title="Decor"
            hint="ChevronRibbon, Bubbles and SkyBackdrop, all composed for you by SectionShell."
          >
            <div className="relative h-40 overflow-hidden rounded-xl bg-gradient-to-b from-sky-top via-sky-mid to-white">
              <ChevronRibbon edge="top" />
              <ChevronRibbon edge="bottom" />
              <div className="grid h-full place-items-center">
                <Pill tone="glass">SectionShell ribbon and sky</Pill>
              </div>
            </div>
          </Spec>
        </div>
      </SectionShell>

      <SectionShell ribbon sky="bright" bubbles="corners" className="py-20">
        <SectionHeading
          eyebrow="SectionHeading"
          title="Ruang Tanpa Sekat"
          lead="Eyebrow pill, chrome display title, accent rule and lead paragraph: the standard section opener."
        />
      </SectionShell>
    </main>
  )
}

function cnSwatch(colorClass: string) {
  return `size-20 rounded-lg shadow-soft ring-1 ring-inset ring-black/5 ${colorClass}`
}

function cnShadowSwatch(shadowClass: string) {
  return `size-24 rounded-xl bg-white ${shadowClass}`
}
