# Product Requirement Document (PRD) — Landing Page Focus

## Project: Astro Event Web Application (Next.js App Router Edition)

---

## 1. Goal & Context

**Primary Goal:** Membangun landing page _single-page application_ yang cepat, responsif, dan SEO-friendly untuk event **Astro**.
**Tech Stack Baseline:**

- **Framework:** Next.js (App Router, React 18/19, TypeScript)
- **Styling:** Tailwind CSS v3/v4 + `clsx` / `tailwind-merge`
- **Icons:** `lucide-react`
- **Data Source:** Local JSON file (`src/data/astro-data.json`)
- **Deployment Target:** Vercel / Netlify

---

## 2. Next.js Project Architecture & File Structure

AI Agent **harus** mengikuti struktur folder dan konvensi Next.js berikut:

```text
astro-event/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root Layout (Metadata, Fonts, Dark Mode Base)
│   │   ├── page.tsx            # Main Landing Page (Server Component)
│   │   └── globals.css         # Tailwind directives & Custom CSS
│   ├── components/             # Reusable UI Components
│   │   ├── Navbar.tsx          # Client Component (scroll & mobile drawer state)
│   │   ├── HeroSection.tsx     # Server Component (wraps Countdown)
│   │   ├── CountdownTimer.tsx  # Client Component ('use client')
│   │   ├── StatsBar.tsx        # Server Component
│   │   ├── CompetitionSection.tsx # Client Component ('use client' - state search/filter)
│   │   ├── CompetitionCard.tsx    # Server Component / Sub-component
│   │   ├── CompetitionModal.tsx   # Client Component ('use client')
│   │   ├── TimelineSection.tsx    # Server Component
│   │   ├── FAQSection.tsx         # Client Component (Accordion state)
│   │   └── Footer.tsx             # Server Component
│   ├── data/
│   │   └── astro-data.json     # Single source of truth data statis
│   └── types/
│       └── astro.ts            # TypeScript Interfaces
3. Server vs Client Component Rules for AI Agent
Untuk menjaga performa dan optimasi render Next.js:

Default Server Components: app/page.tsx, HeroSection.tsx, StatsBar.tsx, TimelineSection.tsx, dan Footer.tsx harus dibuat sebagai Server Component (tanpa direktif 'use client').

Client Components Mandatory:

CountdownTimer.tsx: Menggunakan useEffect & useState untuk interval waktu real-time.

CompetitionSection.tsx: Menggunakan useState untuk searchQuery, selectedCategory, dan modal controller.

FAQSection.tsx: Menggunakan useState untuk toggle open/close accordion.

Navbar.tsx: Menggunakan state untuk menu mobile drawer & listener scroll offset.

4. TypeScript Contracts (src/types/astro.ts)
TypeScript
export type CategoryType = 'akademik' | 'olahraga' | 'esports';

export interface Competition {
  id: string;
  title: string;
  category: CategoryType;
  tagline: string;
  description: string;
  fee: number;
  maxSlots: number;
  filledSlots: number;
  scheduleDate: string;
  location: string;
  prizes: {
    first: string;
    second: string;
    third: string;
  };
  rulesSummary: string[];
  rulebookUrl: string;
  registrationUrl: string;
  contactPerson: {
    name: string;
    whatsapp: string;
  };
}

export interface EventConfig {
  name: string;
  tagline: string;
  description: string;
  registrationDeadline: string;
  totalPrizePool: string;
  generalJuknisUrl: string;
}

export interface TimelineItem {
  date: string;
  title: string;
  desc: string;
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface AstroData {
  eventConfig: EventConfig;
  competitions: Competition[];
  timeline: TimelineItem[];
  faqs: FAQItem[];
}
5. Next.js Specific Conventions
Metadata Optimization (src/app/layout.tsx):

Gunakan export const metadata: Metadata untuk OpenGraph, title, dan description bawaan eventConfig.

Font Optimization:

Gunakan next/font/google (misal: Inter atau Plus Jakarta Sans) di layout.tsx.

Links & Navigation:

Gunakan next/link untuk navigasi internal, dan tag <a> biasa dengan target="_blank" rel="noopener noreferrer" untuk link luar (seperti WhatsApp dan Google Form).

Data Importing:

Di app/page.tsx, import langsung data JSON dari @/data/astro-data.json secara synchronous dan pass data tersebut via props ke komponen-komponennya.


---

<FollowUp label="Mau saya buatkan file setup awal (app/page.tsx & types/astro.ts) agar siap di-copy?" query="Tolong buatkan file app/page.tsx dan src/types/astro.ts untuk Next.js App Router berdasarkan PRD terbaru di atas."/>
```
