# ASTRO 2026 design system

Source of truth for the public site. Tokens live in `app/globals.css`. Components live in `components/brand/`.

Visual references (do not invent a quieter system):

- Brand kit slides: window cards with a blue header and red close, 2×2 blue stat blocks, 3×3 exposure grid with green ticks, beige CRT monitor for sponsor tiers, yellow collaborate banner, sky + bubbles + pattern.
- Cerdas Cermat posters: colored pill section tags (pink Timeline, orange Materi, blue Benefit), grass hill + mascot, frosted glass contact bar, glossy `Daftar segera` pill. Cream plates stay on AGT poster kit (`PosterPlate`) only.

Figma file: [ASTRO-2026](https://www.figma.com/design/jUNbMp9pE8sx5URCvZUcZV/ASTRO-2026).

## Design read

Campus event for SMA/SMK and mahasiswa. Y2K / Frutiger Aero language: bright sky, glass bubbles, glossy 3D pills, UI-window cards on a sky canvas. Playful, not a flat white SaaS landing.

Dials: variance 8, motion 6, density 4. Light theme only.

## Tokens

| Role                | Token                                | Hex                               |
| ------------------- | ------------------------------------ | --------------------------------- |
| Primary             | `astro-blue`                         | `#3B82F6`                         |
| Ink / stroke        | `astro-navy`                         | `#1E3A8A`                         |
| Sky wash            | `sky-top` / `sky-mid` / `sky-bottom` | `#7EC8F5` / `#B8E4FB` / `#E8F6FE` |
| Gold CTA            | `astro-gold`                         | `#FACC15`                         |
| Pink tag            | `astro-pink` / `agt-pink`            | `#EC4899` / `#FF1CA8`             |
| Orange tag          | `pastel-orange` / `agt-orange`       | `#FF9E64` / `#F67334`             |
| Cream (poster only) | `agt-cream`                          | `#FFF2D0`                         |
| Close dot           | `#FF4D4D`                            | window chrome                     |
| Grass               | `#7CF0C1` → `#3ED08F`                | hero ground                       |
| Body                | `ink` on sky                         | `#1F2937`                         |

Type: Geist (`font-sans`) body, Plus Jakarta (`font-heading`) titles, Alexandria (`font-title`) wordmarks and outlined chrome titles, Lexend Exa (`font-subtitle`) poster chips.

Radius: `sm 6` / `md 8` / `lg 12` / `xl 16` / `2xl 20` / `3xl 24` / full for pills. Cards default `2xl`–`3xl`.

Elevation: `shadow-soft*` for plates, `shadow-gloss` inset highlight on pills, `shadow-glow-*` on colored CTAs, `shadow-sticker*` only for poster stickers.

## Canonical layout

```
PageShell            sky + pattern + bubbles, navbar, main, footer
  Hero               two columns: Open pill + ChromeTitle + CtaButton left, mascot right, GrassStrip ground
  SectionShell       band none over the page sky (white/tint washes are optional)
    SectionHeading   colored Pill eyebrow + title + lead
    WindowCard       blue gradient header + white body (listings, stats, FAQ, partners)
    Surface          white / tint plates inside the window — never cream on marketing
    StatCard         ink-on-tint metrics (gradient stays on the header)
    CompetitionCard  WindowCard listing
    ScheduleCard     timeline row
    CtaButton        glossy pill
  SiteFooter         GlassBar (frosted socials) then navy sitemap
```

Auth uses `CenteredShell` (same sky, no navbar).

Container: `max-w-6xl` default, `px-5 sm:px-8`. Nav is a floating glass pill (`h-14`, `rounded-full`, `bg-white/55` over the hero).

## Brand components

Use these. Do not fork them at the call site.

| Component                             | Job                                                                                             |
| ------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `PageShell` / `CenteredShell`         | Sky canvas + chrome                                                                             |
| `SectionShell`                        | Section band (`none` on landing so the sky shows). Opt-in `sky`, `pattern`, `bubbles`, `ribbon` |
| `SectionHeading`                      | Pill eyebrow (`pillTone`) + title + lead                                                        |
| `WindowCard`                          | Kit window: blue gradient bar, red close, white body                                            |
| `Surface`                             | Plate (`plain`, `blue`, `pink`, `orange`, `gold`, `tint`, `sticker`). `cream` is poster-only    |
| `StatCard`                            | Ink-on-tint metric inside a window. `checked` = exposure grid                                   |
| `CompetitionCard`                     | Listing window: title in the header, pills + meta + Detail / Daftar in the body                 |
| `ScheduleCard`                        | Timeline step                                                                                   |
| `Pill`                                | Glossy chip. Pink/orange/blue tags match poster headers                                         |
| `CtaButton`                           | Glossy 3D `Daftar segera` pill                                                                  |
| `BrandLock`                           | BEM + ASTRO lock-up                                                                             |
| `GrassStrip`                          | Hero grass hill                                                                                 |
| `GlassBar`                            | Frosted IG / email / TikTok strip                                                               |
| `RetroMonitorWidget`                  | Sponsor tier CRT                                                                                |
| `BenefitCard` / `PricePill`           | Poster benefit + fee                                                                            |
| `ChromeTitle`                         | Outlined display title (poster wordmarks)                                                       |
| `SkyBackdrop` / `Bubbles` / `Pattern` | Page and hero atmosphere                                                                        |
| `SiteFooter`                          | GlassBar + navy legal                                                                           |

## How a public page is built

1. Wrap the route in `PageShell` (or `CenteredShell` for auth).
2. Hero: left copy (`Pill` Open, `ChromeTitle`, one glossy `CtaButton`), right mascot, `GrassStrip` as the ground that separates the scene from the next section. Do not stack the mascot under a centered logo.
3. Stats / FAQ / partner “why”: put the grid inside `WindowCard`. Inner tiles stay ink on tint, not a second blue fill.
4. Section titles: `SectionHeading` with a colored `eyebrow` pill (`pink` timeline, `orange` materi, `blue` benefit/kategori).
5. Competition listings use `CompetitionCard` (`WindowCard`). Other plates use `Surface` plain or tint. Do not use cream on marketing pages. Do not invent a one-off box.
6. Footer contact: `GlassBar`. Do not rebuild social chips.

Dashboard stays on `DashboardShell` + shadcn. Brand buttons and tokens are allowed; window chrome and grass are not.

## Accessibility

Skip link in `PageShell`. Visible focus rings. WCAG AA on gold/pink CTAs (deepen the bottom stop if contrast fails). `useReducedMotion()` on Motion. Heroes use `min-h-[100dvh]`, never `h-screen`. The window close dot is decorative unless `onClose` is passed.
