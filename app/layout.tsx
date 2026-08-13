import type { Metadata } from "next";
import localFont from "next/font/local";
import { Plus_Jakarta_Sans, Space_Grotesk, Geist } from "next/font/google";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "@/src/lib/providers";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const masterpiece = localFont({
  src: "../public/fonts/Masterpiece.ttf",
  variable: "--font-masterpiece",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ASTRO 2026 | Where Innovation Meets the Stars",
  description:
    "ASTRO 2026 adalah ajang kompetisi dan kreativitas bergengsi tingkat nasional persembahan BEM Sekolah Tinggi Teknologi Terpadu Nurul Fikri (STT-NF). Terbuka untuk SMA/SMK sederajat. Ikuti kompetisi Akademik, Olahraga, dan Esports. Raih prestasi dan tunjukkan bakatmu sekarang!",
  // TODO: Ubah ini menjadi new URL("https://astro.nurulfikri.ac.id") saat sudah migrasi domain
  metadataBase: new URL("https://astro-2026.vercel.app"),
  keywords: [
    "ASTRO",
    "ASTRO 2026",
    "ASTRO STT-NF",
    "BEM STT-NF",
    "Sekolah Tinggi Teknologi Terpadu Nurul Fikri",
    "STT-NF",
    "kompetisi",
    "lomba nasional",
    "akademik",
    "olahraga",
    "esports",
    "hackathon",
    "futsal",
    "mobile legends",
    "valorant",
    "SMA",
    "SMK",
    "event pelajar",
  ],
  authors: [{ name: "ASTRO Team" }],
  alternates: {
    // TODO: Ubah domain canonical saat rilis
    canonical: "https://astro-2026.vercel.app",
  },
  openGraph: {
    title: "ASTRO 2026 | Where Innovation Meets the Stars",
    description:
      "Ajang kompetisi dan kreativitas nasional terbesar tahun ini persembahan BEM STT-NF. Bergabunglah dalam ASTRO 2026 — pengalaman kompetisi multi-kategori (Akademik, Olahraga, Esports) untuk SMA/SMK sederajat.",
    // TODO: Ubah URL openGraph saat rilis
    url: "https://astro-2026.vercel.app",
    siteName: "ASTRO 2026",
    images: [
      {
        url: "https://i.ibb.co.com/QjnnBLmr/og-image-astro.png",
        width: 1200,
        height: 630,
        alt: "ASTRO 2026 - Where Innovation Meets the Stars",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ASTRO 2026 | Where Innovation Meets the Stars",
    description:
      "Ajang kompetisi tingkat nasional untuk SMA/SMK persembahan BEM STT-NF. Ikuti kategori Akademik, Olahraga, dan Esports di ASTRO 2026!",
    images: ["https://i.ibb.co.com/QjnnBLmr/og-image-astro.png"],
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
        plusJakartaSans.variable,
        spaceGrotesk.variable,
        masterpiece.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TooltipProvider>
          <Providers>{children}</Providers>
        </TooltipProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
