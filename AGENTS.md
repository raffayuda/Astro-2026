<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# ASTRO 2026 agent rules

Read [DESIGN.md](./DESIGN.md) before changing any public UI. The look is the brand kit + Cerdas Cermat posters: sky, bubbles, window cards, glossy pills, grass + mascot, glass contact bar. Do not flatten it back to a white SaaS landing. Do not use cream plates on marketing pages.

## Page composition

Every public marketing or auth route uses a brand shell. Do not re-assemble Navbar + Footer + sky gradients per page.

- Marketing pages (`/`, `/profile`, `/announcements`, `/sponsorship`, `/media`, `/competitions/*`, `/register/*`, `/check-registration`, `not-found`): `PageShell` from `@/components/brand`.
- Landing and profile heroes are two columns: copy left, mascot right, `GrassStrip` as the ground. Do not center-stack the mascot under the wordmark.
- Auth / invite / OTP: `CenteredShell` from `@/components/brand`.
- Dashboard stays on `DashboardShell`. Do not wrap it in `PageShell`. No grass, window close-dots, or CRT chrome in admin.

Inside a page, wrap sections with `SectionShell` + `SectionHeading`. Put stats, FAQ, partner grids, and competition listings in `WindowCard` (`CompetitionCard` for the catalog). Cards use `Surface`. Do not invent a new section wrapper.

## Components

- Import layout primitives from `@/components/brand` (or a specific file under `components/brand/` when a barrel import would cycle, e.g. `Navbar` must import `BrandLock` from `components/brand/BrandLock.tsx`).
- Primary CTAs use `CtaButton`. Other actions use `components/ui/button`.
- Metrics use `StatCard` (ink on tint inside a window). Exposure checklists use `StatCard` `checked`. Timeline steps use `ScheduleCard`. Labels use `Pill` with `pillTone` on `SectionHeading`.
- Organiser lock-up is `BrandLock`. Contact strip is `GlassBar`. Hero ground is `GrassStrip`.
- Sky, `Pattern`, and `Bubbles` belong to `PageShell`. Extra `SkyBackdrop` on a section is only for a set-piece hero.
- shadcn under `components/ui/` is for product chrome (forms, dialogs, dashboard). Do not restyle it into a second marketing kit.

## Tokens

- Colors, type, radius, and shadows live in `app/globals.css` `@theme inline`. Prefer token utilities (`bg-astro-navy`, `bg-sky-bottom`, `shadow-gloss`) over raw hex.
- Poster / AGT palette (`agt-pink`, `agt-cream`, `agt-orange`) is for AGT poster kit (`PosterPlate`) only. The UI ramp (`astro-blue`, `astro-navy`, `sky-*`) is for windows, stats, and sky.
- Page ground is sky. Plates on marketing pages are white. Cream is not a landing fill.

## Copy, types, and motion

- Indonesian for participant-facing UI. Sentence case. No em dashes.
- Public UI is client components. Landing may server-fetch then render `HomeClient`. No `any`. Use `isFlagOn`, `unwrapList`, and `toPublicCompetition` / `toJourneyCard`.
- Motion: `motion/react` only, `useReducedMotion()` on JS animation, transform/opacity only. No `window.addEventListener("scroll")`.
