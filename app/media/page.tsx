import SocialMediaSection from "@/components/SocialMediaSection";
import { PageShell } from "@/components/brand";

export const metadata = {
  title: "Instagram Hub & Media Center | ASTRO 2026",
  description:
    "Aplikasi dan kanal media resmi ASTRO 2026. Dapatkan update real-time, dokumentasi visual, reels eksklusif, dan press kit resmi.",
};

export default function MediaPage() {
  return (
    <PageShell>
      <SocialMediaSection priority />
    </PageShell>
  );
}
