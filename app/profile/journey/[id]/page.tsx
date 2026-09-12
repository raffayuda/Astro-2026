"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Camera, X } from "lucide-react";
import { PageShell } from "@/components/brand";
import { Pill } from "@/components/brand/Pill";
import { SectionHeading } from "@/components/brand/SectionHeading";
import { SectionShell } from "@/components/brand/SectionShell";
import { StatCard } from "@/components/brand/StatCard";
import { Surface } from "@/components/brand/Surface";
import { WindowCard } from "@/components/brand/WindowCard";
import { Button } from "@/components/ui/button";
import { toJourneyCard } from "@/lib/mappers";
import { useJourneyPhotos, useJourneys } from "@/src/lib/hooks/use-queries";
import { Calendar, Target, Users } from "lucide-react";

export default function JourneyDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const reduce = useReducedMotion();
  const [lightbox, setLightbox] = useState<string | null>(null);

  const { data: journeysData, isLoading: loadingJourneys } = useJourneys();
  const row = (journeysData ?? []).find((j) => j.id === id || j.year === id);
  const { data: photosData } = useJourneyPhotos(row?.id ?? "");

  const data = useMemo(() => (row ? toJourneyCard(row) : null), [row]);
  const photos = photosData ?? [];

  if (!loadingJourneys && !data) {
    notFound();
  }

  if (!data) {
    return (
      <PageShell>
        <div className="flex min-h-[60svh] items-center justify-center text-sm font-bold text-ink">
          Memuat...
        </div>
      </PageShell>
    );
  }

  const yearNum = Number.parseInt(data.year, 10);
  const prevYear = Number.isFinite(yearNum) ? yearNum - 1 : null;
  const nextYear = Number.isFinite(yearNum) ? yearNum + 1 : null;

  return (
    <PageShell>
      <SectionShell id="journey-hero" sky="soft" space="lg" className="pt-24">
        <Button asChild variant="ghost" size="sm" className="mb-8">
          <Link href="/profile">
            <ArrowLeft data-icon="inline-start" />
            Kembali ke profil
          </Link>
        </Button>

        <Pill tone="blue" size="sm" className="shadow-gloss">
          ASTRO {data.year}
        </Pill>
        <h1 className="mt-4 max-w-3xl font-heading text-4xl font-black tracking-tight text-astro-navy sm:text-5xl md:text-6xl">
          {data.theme}
        </h1>

        <WindowCard title="Sekilas" className="mt-10">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              icon={Users}
              metric={data.participants > 0 ? `${data.participants}+` : "–"}
              label="Peserta"
            />
            <StatCard icon={Calendar} metric={data.date || "–"} label="Hari pelaksanaan" />
            <StatCard icon={Target} metric={String(data.competitions)} label="Cabang lomba" />
          </div>
        </WindowCard>
      </SectionShell>

      <SectionShell band="none" space="md">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHeading
              align="start"
              title={`Tentang ASTRO ${data.year}`}
              lead={data.description}
            />
            {data.highlights.length > 0 && (
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {data.highlights.map((h) => (
                  <li key={h}>
                    <Surface tone="tint" radius="lg" pad="sm" className="text-sm text-ink">
                      {h}
                    </Surface>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="lg:col-span-5">
            <WindowCard title="Pencapaian" className="lg:sticky lg:top-24">
              <p className="text-sm font-medium leading-relaxed text-ink">
                {data.achievement || "Dokumentasi pencapaian sedang dilengkapi."}
              </p>
              <div className="mt-6 flex justify-between border-t border-sky-mid/60 pt-5 text-sm font-bold text-astro-blue">
                {prevYear && prevYear >= 2023 ? (
                  <Link href={`/profile/journey/${prevYear}`}>{prevYear}</Link>
                ) : (
                  <span />
                )}
                {nextYear && nextYear <= 2026 ? (
                  <Link href={`/profile/journey/${nextYear}`}>{nextYear}</Link>
                ) : (
                  <span />
                )}
              </div>
            </WindowCard>
          </div>
        </div>
      </SectionShell>

      <SectionShell band="none" space="md">
        <SectionHeading
          eyebrow="Arsip"
          pillTone="pink"
          title="Dokumentasi"
          lead={`Momen selama perjalanan ASTRO ${data.year}.`}
        />

        {photos.length === 0 ? (
          <Surface tone="plain" radius="xl" pad="lg" className="mt-10 text-center">
            <Camera className="mx-auto mb-3 size-8 text-astro-cyan-2" />
            <p className="text-sm font-medium text-ink">
              Belum ada foto dokumentasi untuk ASTRO {data.year}
            </p>
          </Surface>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {photos.map((doc, i) => (
              <motion.button
                key={doc.id}
                type="button"
                onClick={() => setLightbox(doc.url)}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-white text-left shadow-soft"
              >
                <Image
                  src={doc.url}
                  alt={doc.caption || `Dokumentasi ASTRO ${data.year}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </motion.button>
            ))}
          </div>
        )}
      </SectionShell>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Dokumentasi"
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="Tutup"
            className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/10 text-white"
          >
            <X className="size-5" />
          </button>
          <Image
            src={lightbox}
            alt="Dokumentasi ASTRO"
            width={1600}
            height={1200}
            className="max-h-[85vh] w-auto max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </PageShell>
  );
}
