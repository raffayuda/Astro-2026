import SocialMediaSection from '@/components/SocialMediaSection';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Instagram Hub & Media Center | ASTRO 2026',
  description: 'Aplikasi dan kanal media resmi ASTRO 2026. Dapatkan update real-time, dokumentasi visual, reels eksklusif, dan press kit resmi.',
};

export default function MediaPage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-sky-top via-sky-mid to-white">
      <Navbar />
      <SocialMediaSection priority />
      <Footer />
    </main>
  );
}
