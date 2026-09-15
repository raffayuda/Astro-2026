import type { Metadata } from "next";
import { Alexandria, Lexend_Exa, Plus_Jakarta_Sans, Geist } from "next/font/google";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "@/src/lib/providers";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

// Heading / display face. Geometric, high-contrast at bold weights — matches the
// component spec sheets. Previously loaded but only ever used as a fallback.
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

// Display title face — used by the chrome hero wordmarks.
const alexandria = Alexandria({
  variable: "--font-alexandria",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

// Secondary display face — used by section subtitles.
const lexendExa = Lexend_Exa({
  variable: "--font-lexend-exa",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ASTRO 2026 | Where Innovation Meets the Stars",
  description:
    "ASTRO 2026 adalah ajang kompetisi dan kreativitas bergengsi persembahan BEM Sekolah Tinggi Teknologi Terpadu Nurul Fikri (STT-NF). Terbuka untuk mahasiswa STT-NF dan pelajar SMA/SMK sederajat. Ikuti kompetisi Akademik, Olahraga, dan Esports. Raih prestasi dan tunjukkan bakatmu sekarang!",
  metadataBase: new URL("https://astro.nurulfikri.ac.id"),
  keywords: [
    "ASTRO",
    "ASTRO 2026",
    "ASTRO STT-NF",
    "BEM STT-NF",
    "Sekolah Tinggi Teknologi Terpadu Nurul Fikri",
    "STT-NF",
    "kompetisi",
    "kompetisi mahasiswa",
    "lomba SMA SMK",
    "mahasiswa STT-NF",
    "akademik",
    "olahraga",
    "esports",
    "futsal",
    "mobile legends",
    "valorant",
    "SMA",
    "SMK",
    "mahasiswa",
    "event kampus",
    "event pelajar",
  ],
  authors: [{ name: "ASTRO Team" }],
  alternates: {
    canonical: "https://astro.nurulfikri.ac.id",
  },
  openGraph: {
    title: "ASTRO 2026 | Where Innovation Meets the Stars",
    description:
      "Ajang kompetisi dan kreativitas terbesar tahun ini persembahan BEM STT-NF. Bergabunglah dalam ASTRO 2026 — pengalaman kompetisi multi-kategori (Akademik, Olahraga, Esports) untuk mahasiswa STT-NF dan pelajar SMA/SMK sederajat.",
    url: "https://astro.nurulfikri.ac.id",
    siteName: "ASTRO 2026",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ASTRO 2026 | Where Innovation Meets the Stars",
    description:
      "Ajang kompetisi persembahan BEM STT-NF untuk mahasiswa STT-NF dan pelajar SMA/SMK sederajat. Ikuti kategori Akademik, Olahraga, dan Esports di ASTRO 2026!",
    creator: "@Astro2026",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "googlee517c006589d4539",
    other: {
      "msvalidate.01": "C3591A71AD0662B4BF4374B3130209A5",
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  manifest: "/site.webmanifest",
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ASTRO 2026",
    alternateName: ["ASTRO", "ASTRO STT-NF", "ASTRO BEM STT-NF"],
    url: "https://astro.nurulfikri.ac.id",
    description:
      "Ajang kompetisi dan kreativitas bergengsi persembahan BEM Sekolah Tinggi Teknologi Terpadu Nurul Fikri (STT-NF) untuk mahasiswa STT-NF dan pelajar SMA/SMK sederajat.",
    inLanguage: "id-ID",
    publisher: {
      "@type": "Organization",
      name: "BEM STT-NF",
      url: "https://nurulfikri.ac.id",
      logo: "https://astro.nurulfikri.ac.id/assets/logo-astro.png",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ASTRO 2026",
    url: "https://astro.nurulfikri.ac.id",
    logo: "https://astro.nurulfikri.ac.id/assets/logo-astro.png",
    sameAs: ["https://www.instagram.com/astro.sttnf", "https://nurulfikri.ac.id"],
    parentOrganization: {
      "@type": "CollegeOrUniversity",
      name: "Sekolah Tinggi Teknologi Terpadu Nurul Fikri",
      url: "https://nurulfikri.ac.id",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: [
      {
        "@type": "SiteNavigationElement",
        position: 1,
        name: "Beranda & Kompetisi",
        description: "Katalog cabang lomba Akademik, Olahraga, dan Esports ASTRO 2026.",
        url: "https://astro.nurulfikri.ac.id",
      },
      {
        "@type": "SiteNavigationElement",
        position: 2,
        name: "Profil & Sejarah Event",
        description: "Visi, misi, sejarah, serta struktur panitia pelaksana ASTRO 2026.",
        url: "https://astro.nurulfikri.ac.id/profile",
      },
      {
        "@type": "SiteNavigationElement",
        position: 3,
        name: "Cek Status Pendaftaran",
        description: "Cek status verifikasi formulir dan tiket pendaftaran peserta lomba.",
        url: "https://astro.nurulfikri.ac.id/check-registration",
      },
      {
        "@type": "SiteNavigationElement",
        position: 4,
        name: "Pengumuman Pemenang",
        description: "Pengumuman hasil perlombaan dan pemenang ASTRO 2026.",
        url: "https://astro.nurulfikri.ac.id/announcements",
      },
      {
        "@type": "SiteNavigationElement",
        position: 5,
        name: "Media Center & Dokumentasi",
        description: "Dokumentasi visual, kanal media sosial, dan press kit ASTRO 2026.",
        url: "https://astro.nurulfikri.ac.id/media",
      },
    ],
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={cn(
        "h-full",
        "antialiased",
        alexandria.variable,
        lexendExa.variable,
        plusJakartaSans.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <head>
        {jsonLd.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
        <script defer src="http://192.168.123.6:5555/script.js" data-website-id="79d7fe00-8561-4699-a3e9-ef3a6929cada"></script>
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TooltipProvider>
          <Providers>{children}</Providers>
        </TooltipProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
