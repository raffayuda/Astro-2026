"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Award, Calendar, ShieldCheck, Sparkles, Users } from "lucide-react";
import { PageShell } from "@/components/brand";
import { CtaButton } from "@/components/brand/CtaButton";
import { Pill } from "@/components/brand/Pill";
import { SectionHeading } from "@/components/brand/SectionHeading";
import { SectionShell } from "@/components/brand/SectionShell";
import { StatCard } from "@/components/brand/StatCard";
import { Surface } from "@/components/brand/Surface";
import { WindowCard } from "@/components/brand/WindowCard";
import CommitteeSection from "@/components/CommitteeSection";
import EventGallerySection from "@/components/EventGallerySection";
import SocialMediaSection from "@/components/SocialMediaSection";
import ProfileHero from "@/components/ProfileHero";
import SponsorSection from "@/components/SponsorSection";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toJourneyCard } from "@/lib/mappers";
import { useJourneys } from "@/src/lib/hooks/use-queries";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Multi-disiplin lomba",
    desc: "Akademik, olahraga, esports, dan seni dalam satu festival.",
  },
  {
    icon: Award,
    title: "Hadiah resmi",
    desc: "Penghargaan dan dana pembinaan untuk pemenang.",
  },
  {
    icon: ShieldCheck,
    title: "Penilaian transparan",
    desc: "Juri profesional, rubrik yang bisa dibaca peserta.",
  },
  {
    icon: Users,
    title: "Komunitas pelajar",
    desc: "Jaringan antar SMA/SMK dan mahasiswa di satu acara.",
  },
] as const;

const MISI = [
  "Menghadirkan kegiatan yang kompetitif dan edukatif sebagai wadah potensi mahasiswa.",
  "Meningkatkan apresiasi budaya Nusantara lewat konsep yang relevan untuk generasi muda.",
  "Membangun kolaborasi antar peserta dengan sportivitas dan kekeluargaan.",
  "Menyelenggarakan acara yang profesional, berkesan, dan berdampak.",
  "Menjadikan ASTRO wadah prestasi yang berkelanjutan.",
];

export default function ProfilePage() {
  const reduce = useReducedMotion();
  const router = useRouter();
  const [showAllJourney, setShowAllJourney] = useState(false);
  const { data: journeysData } = useJourneys();
  const journey = useMemo(() => (journeysData ?? []).map(toJourneyCard), [journeysData]);

  return (
    <PageShell>
      <ProfileHero />

      <SectionShell id="about-event" band="none" space="sm">
        <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <SectionHeading
              align="start"
              eyebrow="Profil"
              pillTone="blue"
              title="Tentang ASTRO 2026"
              lead="Program kerja tahunan BEM STT-NF. Dari classmeet kampus menjadi festival pendidikan, seni, dan olahraga untuk SMA/SMK dan mahasiswa."
            />
            <WindowCard title="Yang dibawa ASTRO" className="mt-8">
              <div className="grid gap-3 sm:grid-cols-2">
                {FEATURES.map((feature) => (
                  <StatCard
                    key={feature.title}
                    icon={feature.icon}
                    label={feature.title}
                    hint={feature.desc}
                    checked
                  />
                ))}
              </div>
            </WindowCard>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-5">
            <WindowCard title="Visi">
              <p className="text-sm leading-relaxed text-ink md:text-base">
                Menjadikan ASTRO 2026 festival mahasiswa yang mengintegrasikan olahraga, pendidikan,
                dan kesenian dalam semangat pelestarian budaya Nusantara.
              </p>
            </WindowCard>

            <WindowCard title="Misi">
              <ol className="space-y-3">
                {MISI.map((item, i) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm leading-relaxed text-ink"
                  >
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-sky-bottom text-xs font-bold text-astro-navy">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </WindowCard>
          </div>
        </div>
      </SectionShell>

      <SectionShell id="journey" band="none" space="sm">
        <SectionHeading
          eyebrow="Arsip"
          pillTone="orange"
          title="Perjalanan ASTRO"
          lead="Setiap tahun adalah babak baru. Pilih edisi untuk melihat dokumentasi dan pencapaian."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {journey.map((j, idx) => {
            const isLatest = idx === journey.length - 1;
            return (
              <motion.button
                key={j.id}
                type="button"
                onClick={() => router.push(`/profile/journey/${j.year}`)}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: idx * 0.06, duration: 0.4 }}
                className="text-left"
              >
                <Surface interactive tone="plain" radius="xl" pad="lg" className="h-full">
                  <div className="mb-4 flex items-center gap-2">
                    <Pill tone="blue" size="sm">
                      {j.year}
                    </Pill>
                    {isLatest && (
                      <Pill tone="gold" size="sm">
                        Terbaru
                      </Pill>
                    )}
                  </div>
                  <h3 className="font-heading text-xl font-bold text-astro-navy md:text-2xl">
                    {j.theme}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink">{j.achievement}</p>
                  <div className="mt-6 flex items-center justify-between border-t border-sky-mid/60 pt-4">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-ink">
                      <Users className="size-3.5 text-astro-blue" />
                      {j.participants > 0
                        ? `${j.participants.toLocaleString("id-ID")}+ peserta`
                        : "Segera"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-astro-blue">
                      Lihat detail
                      <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </Surface>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Button
            onClick={() => setShowAllJourney(true)}
            size="lg"
            variant="outline"
            className="rounded-lg"
          >
            <Calendar data-icon="inline-start" />
            Lihat semua perjalanan
          </Button>
        </div>
      </SectionShell>

      <Dialog open={showAllJourney} onOpenChange={setShowAllJourney}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden p-0">
          <DialogHeader className="border-b border-sky-mid/60 px-6 py-5">
            <DialogTitle className="font-heading text-2xl text-astro-navy">
              Perjalanan ASTRO
            </DialogTitle>
            <DialogDescription>Jelajahi setiap edisi dari awal sampai sekarang.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] space-y-6 overflow-y-auto p-6">
            {journey.map((j) => (
              <div key={j.id} className="border-l-2 border-astro-blue/30 pl-5">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-sky-bottom px-2.5 py-0.5 text-xs font-bold text-astro-navy">
                    {j.year}
                  </span>
                  <span className="text-sm font-bold text-astro-navy">{j.theme}</span>
                </div>
                <p className="mb-3 text-sm leading-relaxed text-ink/80">{j.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-ink">
                  <span>{j.participants > 0 ? `${j.participants}+` : "–"} peserta</span>
                  <span>{j.date || "–"}</span>
                  <span>{j.competitions} cabang</span>
                  <CtaButton
                    href={`/profile/journey/${j.year}`}
                    size="default"
                    showChevron
                    className="ml-auto"
                  >
                    Detail
                  </CtaButton>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <EventGallerySection />
      <SocialMediaSection />
      <CommitteeSection />
      <SponsorSection variant="profile" id="sponsor" />
    </PageShell>
  );
}
