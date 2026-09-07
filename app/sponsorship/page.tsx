import type { Metadata } from "next"

import { SponsorshipClient } from "./SponsorshipClient"

export const metadata: Metadata = {
  title: "Sponsorship — ASTRO 2026",
  description:
    "Jadi mitra ASTRO 2026. Jangkau 1.500+ pengunjung dan 1.000+ peserta kompetisi se-Jabodetabek melalui paket kemitraan Platinum, Gold, Silver dan Bronze.",
  alternates: { canonical: "/sponsorship" },
  openGraph: {
    title: "Sponsorship — ASTRO 2026",
    description:
      "Paket kemitraan ASTRO 2026 dengan eksposur brand di media fisik dan digital resmi.",
    url: "/sponsorship",
  },
}

export default function SponsorshipPage() {
  return <SponsorshipClient />
}
