import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil & Sejarah Event | ASTRO 2026 - BEM STT-NF",
  description:
    "Mengenal ASTRO 2026, ajang tahunan terbesar persembahan BEM Sekolah Tinggi Teknologi Terpadu Nurul Fikri (STT-NF). Temukan visi, misi, perjalanan sejarah, dan jajaran panitia pelaksana.",
  alternates: {
    canonical: "https://astro.nurulfikri.ac.id/profile",
  },
  openGraph: {
    title: "Profil & Sejarah Event | ASTRO 2026 - BEM STT-NF",
    description:
      "Mengenal ASTRO 2026, ajang tahunan terbesar persembahan BEM STT-NF. Temukan visi, misi, perjalanan sejarah, dan jajaran panitia pelaksana.",
    url: "https://astro.nurulfikri.ac.id/profile",
    siteName: "ASTRO 2026",
  },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
