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
  ChromeTitle,
  CtaButton,
  Pill,
  PricePill,
  RetroMonitorWidget,
  ScheduleCard,
  SectionHeading,
  SectionShell,
  SiteFooter,
  Subtitle,
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
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
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

const PAGE_LAYOUTS = [
  {
    name: "Landing",
    route: "/",
    parts: ["SectionShell", "ChromeText", "StatCard", "ScheduleCard", "TalentCategoryCard", "PricePill", "CtaButton", "SiteFooter"],
  },
  {
    name: "Company Profile",
    route: "/profile",
    parts: ["SectionShell", "SectionHeading", "Surface", "SiteFooter"],
  },
  {
    name: "Competition Detail",
    route: "/competitions/[id]",
    parts: ["SectionShell", "ChromeText", "Pill", "ScheduleCard", "BenefitCard", "CtaButton"],
  },
  {
    name: "Registration",
    route: "/register/[id]",
    parts: ["SectionShell", "Surface", "Label", "Input", "Select", "TalentCategoryCard", "PricePill", "CtaButton"],
  },
  {
    name: "Sponsorship Proposal",
    route: "/sponsorship",
    parts: ["SectionShell", "StatCard", "RetroMonitorWidget", "Surface", "CtaButton", "SiteFooter"],
  },
  {
    name: "Announcements",
    route: "/announcements",
    parts: ["SectionShell", "ToggleGroup", "Surface", "Badge", "SiteFooter"],
  },
  {
    name: "Check Registration",
    route: "/check-registration",
    parts: ["SectionShell", "Surface", "Badge", "SiteFooter"],
  },
  {
    name: "Auth",
    route: "/login, /auth/signup",
    parts: ["SectionShell", "Surface", "Label", "Input", "InputOTP", "Button"],
  },
  {
    name: "Dashboard",
    route: "/dashboard/*",
    parts: ["Surface", "Card", "Table", "Badge", "Button", "Select", "Switch"],
  },
] as const

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
        <h3 className="font-heading text-xl font-extrabold uppercase tracking-tight text-astro-navy">
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
  const [checked, setChecked] = React.useState(true)
  const [toggled, setToggled] = React.useState(true)
  const [radio, setRadio] = React.useState("individu")
  const [filter, setFilter] = React.useState("semua")
  const [otp, setOtp] = React.useState("")

  return (
    <main className="relative min-h-screen pb-24">
      <SectionShell ribbon sky="bright" bubbles="dense" className="pb-16 pt-24">
        <div className="flex flex-col items-center gap-5 text-center">
          <Pill tone="white" size="sm">
            Design System
          </Pill>
          <ChromeTitle depth="lg" align="middle" className="max-w-3xl">
            {`Core
Components`}
          </ChromeTitle>
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
                  <p className="text-10 font-bold uppercase tracking-widest text-muted-foreground">
                    {group.name}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {group.swatches.map((swatch) => (
                      <div key={swatch.name} className="flex flex-col gap-1.5">
                        <div
                          className={cnSwatch(swatch.cls)}
                          aria-hidden
                        />
                        <p className="text-10 font-bold uppercase text-astro-navy">
                          {swatch.name}
                        </p>
                        <p className="font-mono text-10 text-muted-foreground">
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
            hint="Alexandria for display titles, Lexend Exa for subtitles, Plus Jakarta Sans for headings, Geist for body."
          >
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <p className="text-10 font-bold uppercase tracking-widest text-muted-foreground">
                  text-title &mdash; Alexandria 700 / 162.55px ceiling / -6% tracking
                </p>
                <ChromeText as="p" depth="lg" className="text-title">
                  Astro
                </ChromeText>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-10 font-bold uppercase tracking-widest text-muted-foreground">
                  ChromeTitle &mdash; SVG text, round-joined outline, scales to container
                </p>
                <ChromeTitle depth="md" className="max-w-xl">
                  {`Firtiansyah
Okta R.`}
                </ChromeTitle>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-10 font-bold uppercase tracking-widest text-muted-foreground">
                  text-subtitle &mdash; Lexend Exa 700 / 35.05px ceiling / -19% tracking
                </p>
                <Subtitle>Ruang Tanpa Sekat</Subtitle>
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-10 font-bold uppercase tracking-widest text-muted-foreground">
                  Chrome depth &mdash; gloss stack vs. outline
                </p>
                <div className="flex flex-wrap items-end gap-6">
                  {(["sm", "md", "lg"] as const).map((d) => (
                    <ChromeText key={d} as="p" depth={d} className="text-4xl">
                      Chrome {d}
                    </ChromeText>
                  ))}
                </div>
                <div className="flex flex-wrap items-end gap-6">
                  {(["sm", "md", "lg"] as const).map((d) => (
                    <ChromeText
                      key={d}
                      as="p"
                      variant="outline"
                      depth={d}
                      className="text-4xl"
                    >
                      Outline {d}
                    </ChromeText>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-astro-cyan-2/40 pt-5">
                <p className="font-heading text-2xl font-extrabold text-astro-navy">
                  Plus Jakarta Sans &mdash; headings and stat figures
                </p>
                <p className="text-base text-ink">
                  Geist body copy, used for all running text, form labels and
                  table content.
                </p>
                <p className="text-10 font-bold uppercase tracking-widest text-muted-foreground">
                  Micro label / text-10
                </p>
              </div>
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
                  <p className="font-mono text-10 text-muted-foreground">
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
                  <p className="font-heading text-lg font-extrabold uppercase">{tone}</p>
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
                  className="text-10 font-bold uppercase tracking-widest text-ink"
                >
                  Nama Lengkap
                </label>
                <Input id="ds-name" placeholder="Nama peserta" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="ds-email"
                  className="text-10 font-bold uppercase tracking-widest text-ink"
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
                  className="text-10 font-bold uppercase tracking-widest text-ink"
                >
                  Catatan
                </label>
                <Textarea id="ds-note" placeholder="Deskripsi penampilan" />
              </div>
            </div>
          </Spec>

          <Spec
            title="Selection controls"
            hint="Checkbox, RadioGroup, Switch, Select, ToggleGroup and InputOTP, all on the same cyan rail and blue active state."
          >
            <div className="flex flex-col gap-7">
              <div className="flex flex-wrap items-center gap-8">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="ds-check"
                    checked={checked}
                    onCheckedChange={(v) => setChecked(v === true)}
                  />
                  <Label htmlFor="ds-check">Saya menyetujui ketentuan</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="ds-switch"
                    checked={toggled}
                    onCheckedChange={setToggled}
                  />
                  <Label htmlFor="ds-switch">Notifikasi email</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch id="ds-switch-sm" size="sm" defaultChecked />
                  <Label htmlFor="ds-switch-sm">size sm</Label>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label variant="micro">Tipe Pendaftaran</Label>
                <RadioGroup
                  value={radio}
                  onValueChange={setRadio}
                  className="flex flex-wrap gap-6"
                >
                  {[
                    { value: "individu", label: "Individu" },
                    { value: "kelompok", label: "Kelompok" },
                  ].map((option) => (
                    <div key={option.value} className="flex items-center gap-2">
                      <RadioGroupItem
                        id={`ds-radio-${option.value}`}
                        value={option.value}
                      />
                      <Label htmlFor={`ds-radio-${option.value}`}>
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label variant="micro" htmlFor="ds-select">
                    Program Studi
                  </Label>
                  <Select>
                    <SelectTrigger id="ds-select" className="w-full">
                      <SelectValue placeholder="Pilih program studi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ti">Teknik Informatika</SelectItem>
                      <SelectItem value="si">Sistem Informasi</SelectItem>
                      <SelectItem value="bd">Bisnis Digital</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label variant="micro">Kode OTP</Label>
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <InputOTPSlot key={i} index={i} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label variant="micro">Filter Kategori</Label>
                <ToggleGroup
                  type="single"
                  value={filter}
                  onValueChange={(v) => v && setFilter(v)}
                  className="flex flex-wrap gap-2"
                >
                  {["semua", "akademik", "olahraga", "esports"].map((v) => (
                    <ToggleGroupItem key={v} value={v} className="px-4 capitalize">
                      {v}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
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
            title="Site footer"
            hint="SiteFooter: navy panel, social marks, contact details. Brand marks use react-icons because lucide v1 dropped them."
          >
            <div className="overflow-hidden rounded-xl">
              <SiteFooter phone="+62 813-8468-1275" />
            </div>
          </Spec>

          <Spec
            title="Page layouts"
            hint="Which components compose each route. Every page is assembled from the library above."
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {PAGE_LAYOUTS.map((page) => (
                <Surface key={page.route} tone="tint" pad="md" radius="lg">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-heading text-sm font-extrabold text-astro-navy">
                        {page.name}
                      </p>
                      <code className="font-mono text-10 text-muted-foreground">
                        {page.route}
                      </code>
                    </div>
                    <ul className="flex flex-wrap gap-1.5">
                      {page.parts.map((part) => (
                        <li key={part}>
                          <Pill tone="white" size="sm" className="font-mono">
                            {part}
                          </Pill>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Surface>
              ))}
            </div>
          </Spec>

          <Spec
            title="Decor"
            hint="ChevronRibbon, Bubbles and SkyBackdrop, all composed for you by SectionShell."
          >
            <div className="relative h-40 overflow-hidden rounded-xl bg-linear-to-b from-sky-top via-sky-mid to-white">
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
