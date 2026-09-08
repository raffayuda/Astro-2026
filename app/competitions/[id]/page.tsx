"use client";

import { useMemo } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  Trophy,
  CalendarDays,
  MapPin,
  Coins,
  Users,
  ArrowLeft,
  FileText,
  MessageCircle,
  Layers,
  Clock,
} from "lucide-react";
import { PageShell } from "@/components/brand";
import { Pill } from "@/components/brand/Pill";
import { SectionHeading } from "@/components/brand/SectionHeading";
import { SectionShell } from "@/components/brand/SectionShell";
import { Surface } from "@/components/brand/Surface";
import RegisterSection from "./RegisterSection";
import CompetitionTimeline from "./CompetitionTimeline";
import GuidebookArticle from "@/components/GuidebookArticle";
import SponsorSection from "@/components/SponsorSection";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDateLong } from "@/lib/date";
import { toPublicCompetition } from "@/lib/mappers";
import { useCompetition, useCompetitionTimeline } from "@/src/lib/hooks/use-queries";
import type { CompetitionBatch } from "@/src/db/schema";

const CATEGORY_LABEL: Record<string, string> = {
  akademik: "Akademik",
  olahraga: "Olahraga",
  esports: "Esports",
  "kesenian-/-seni": "Kesenian",
};

function typeLabel(type?: string) {
  if (type === "both") return "Tim & individu";
  if (type === "team") return "Tim";
  return "Individu";
}

export default function CompetitionDetailPage() {
  const reduce = useReducedMotion();
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { data: rawCompetition, isLoading: loading, isError } = useCompetition(id);
  const { data: timeline = [] } = useCompetitionTimeline(id);
  const competition = useMemo(
    () => (rawCompetition ? toPublicCompetition(rawCompetition) : null),
    [rawCompetition],
  );

  if (loading) return <DetailSkeleton />;
  if (isError || !competition) notFound();

  const leftSlots = competition.maxSlots - competition.filledSlots;
  const ratio = Math.min((competition.filledSlots / competition.maxSlots) * 100, 100);
  const hasSlots = competition.maxSlots > 0;
  const catLabel = CATEGORY_LABEL[competition.category] ?? competition.category;

  const infoCards = [
    {
      icon: Coins,
      label: competition.batchName ? `Biaya (${competition.batchName})` : "Biaya pendaftaran",
      value: competition.isFree
        ? "Gratis"
        : competition.fee > 0
          ? `Rp ${competition.fee.toLocaleString("id-ID")}`
          : "TBA",
    },
    {
      icon: CalendarDays,
      label: "Jadwal",
      value: formatDateLong(competition.scheduleDate) || "TBA",
    },
    {
      icon: MapPin,
      label: "Lokasi",
      value: competition.location || "TBA",
    },
    {
      icon: Users,
      label: competition.type === "team" ? "Kuota tim" : "Kuota peserta",
      value: hasSlots
        ? `${competition.filledSlots} / ${competition.maxSlots} terisi`
        : "TBA",
      sub: hasSlots ? (leftSlots > 0 ? `Sisa ${leftSlots} slot` : "Penuh") : undefined,
      isLow: hasSlots && leftSlots <= 5,
      ratio: hasSlots ? ratio : 0,
    },
  ];

  const batches: CompetitionBatch[] = competition.batches ?? [];

  return (
    <PageShell>
      <SectionShell sky="soft" space="lg" className="pt-24">
        <Button asChild variant="ghost" size="sm" className="mb-8">
          <Link href="/#competitions">
            <ArrowLeft data-icon="inline-start" />
            Kembali ke lomba
          </Link>
        </Button>

        <div className="mb-5 flex flex-wrap items-center gap-2">
          <Pill tone="white" size="sm">{catLabel}</Pill>
          <Pill tone="navy" size="sm">
            {competition.origin === "external" ? "Eksternal" : "Internal"}
          </Pill>
          <Pill tone={competition.isFree ? "blue" : "gold"} size="sm">
            {competition.isFree ? "Gratis" : "Berbayar"}
          </Pill>
          <Pill tone="white" size="sm">{typeLabel(competition.type)}</Pill>
          {competition.isActive === false && (
            <Pill tone="pink" size="sm">Pendaftaran ditutup</Pill>
          )}
        </div>

        <h1 className="max-w-3xl font-heading text-3xl font-black tracking-tight text-astro-navy sm:text-4xl lg:text-5xl">
          {competition.title}
        </h1>
        {competition.tagline && (
          <p className="mt-4 max-w-2xl text-base font-medium text-ink/75 md:text-lg">
            {competition.tagline}
          </p>
        )}
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-ink md:text-base">
          {competition.description || "Deskripsi lengkap perlombaan akan segera diumumkan."}
        </p>
      </SectionShell>

      <SectionShell band="none" space="md">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-10 lg:col-span-7">
            <div className="grid gap-4 sm:grid-cols-2">
              {infoCards.map((card, idx) => (
                <motion.div
                  key={card.label}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                >
                  <Surface tone="plain" radius="xl" pad="md" className="flex items-start gap-4">
                    <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-sky-bottom text-astro-blue">
                      <card.icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-10 font-bold uppercase tracking-wider text-ink">
                        {card.label}
                      </span>
                      <span className="mt-1 block truncate text-lg font-black text-astro-navy">
                        {card.value}
                      </span>
                      {card.sub !== undefined && (
                        <>
                          <Progress value={card.ratio} className="mt-2 h-1 bg-sky-bottom" />
                          <span
                            className={cn(
                              "mt-1 block text-10 font-bold uppercase tracking-wider",
                              card.isLow ? "text-destructive" : "text-muted-foreground",
                            )}
                          >
                            {card.sub}
                          </span>
                        </>
                      )}
                    </div>
                  </Surface>
                </motion.div>
              ))}
            </div>

            {competition.hasBatches && batches.length > 0 && (
              <div>
                <h2 className="mb-4 flex items-center gap-2 font-heading text-xl font-black text-astro-navy">
                  <Layers className="size-5 text-astro-cyan" />
                  Gelombang pendaftaran
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {batches.map((batch) => {
                    const now = new Date();
                    const isOngoing =
                      Boolean(batch.startDate && batch.endDate) &&
                      now >= new Date(batch.startDate) &&
                      now <= new Date(batch.endDate);
                    const isUpcoming = Boolean(batch.startDate) && now < new Date(batch.startDate);
                    const isPast = Boolean(batch.endDate) && now > new Date(batch.endDate);

                    return (
                      <Surface
                        key={batch.id}
                        tone={isOngoing ? "tint" : "plain"}
                        radius="xl"
                        pad="md"
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="text-xs font-black uppercase tracking-wider text-astro-navy">
                            {batch.name}
                          </span>
                          {isOngoing && (
                            <Pill tone="blue" size="sm">Aktif</Pill>
                          )}
                          {isUpcoming && (
                            <Pill tone="white" size="sm">Mendatang</Pill>
                          )}
                          {isPast && (
                            <Pill tone="white" size="sm">Berakhir</Pill>
                          )}
                        </div>
                        <div className="text-lg font-black text-astro-navy">
                          Rp {Number(batch.fee).toLocaleString("id-ID")}
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 text-11 text-ink">
                          <Clock className="size-3" />
                          {formatDateLong(batch.startDate)} s/d {formatDateLong(batch.endDate)}
                        </div>
                      </Surface>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 lg:col-span-5">
            <h2 className="font-heading text-xl font-black text-astro-navy">Hadiah pemenang</h2>
            {competition.prizes.length === 0 ? (
              <Surface tone="plain" radius="xl" pad="lg" className="text-center">
                <Trophy className="mx-auto mb-2 size-8 text-ink/40" />
                <p className="text-sm font-medium text-ink">Hadiah segera diumumkan.</p>
              </Surface>
            ) : (
              <div className="grid gap-3">
                {competition.prizes.map((item) => (
                  <Surface key={item.label} tone="plain" radius="xl" pad="md" className="flex items-center gap-3">
                    <div className="grid size-9 place-items-center rounded-lg bg-amber-50 text-amber-600">
                      <Trophy className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-10 font-bold uppercase tracking-wider text-ink">
                        {item.label}
                      </div>
                      <div className="truncate text-sm font-black text-astro-navy">
                        {item.value || "TBA"}
                      </div>
                    </div>
                  </Surface>
                ))}
              </div>
            )}

            <Surface tone="tint" radius="xl" pad="lg" className="space-y-4">
              <RegisterSection competition={competition} />
              {competition.rulebookUrl && (
                <Button asChild variant="outline" size="sm" className="w-full">
                  <a href={competition.rulebookUrl} target="_blank" rel="noopener noreferrer">
                    <FileText data-icon="inline-start" />
                    Buka guidebook
                  </a>
                </Button>
              )}
            </Surface>
          </div>
        </div>
      </SectionShell>

      <SectionShell band="none" space="md">
        <GuidebookArticle
          sections={competition.guidebookSections || []}
          fallbackRules={competition.rulesSummary || []}
          description={competition.description || ""}
          rulebookUrl={competition.rulebookUrl || ""}
          contactPerson={competition.contactPerson}
        />
      </SectionShell>

      {timeline.length > 0 && (
        <CompetitionTimeline
          timeline={timeline}
          lineColor="#3B82F6"
          categoryColors={{
            accent: "bg-astro-blue",
            dot: "bg-astro-blue",
            ring: "ring-astro-blue/20",
            iconBg: "bg-sky-bottom text-astro-blue",
            iconBorder: "border-astro-cyan-2",
            hex: "#3B82F6",
          }}
        />
      )}

      <SectionShell band="none" space="md">
        <SectionHeading
          title="Siap berkompetisi?"
          lead="Daftar sebelum kuota penuh. Baca rulebook dulu, lalu isi formulir."
        />
        <div className="mx-auto mt-10 flex max-w-md flex-col items-center gap-4">
          <RegisterSection competition={competition} />
          <div className="flex w-full flex-col gap-3 sm:flex-row">
            {competition.rulebookUrl ? (
              <Button asChild variant="outline" className="flex-1">
                <a href={competition.rulebookUrl} target="_blank" rel="noopener noreferrer">
                  <FileText data-icon="inline-start" />
                  Baca rulebook
                </a>
              </Button>
            ) : (
              <Button disabled variant="outline" className="flex-1">
                Rulebook (TBA)
              </Button>
            )}
            {competition.contactPerson?.whatsapp ? (
              <Button asChild variant="outline" className="flex-1">
                <a
                  href={`https://wa.me/${competition.contactPerson.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle data-icon="inline-start" />
                  Hubungi CP
                </a>
              </Button>
            ) : (
              <Button disabled variant="outline" className="flex-1">
                CP (TBA)
              </Button>
            )}
          </div>
        </div>
      </SectionShell>

      <SponsorSection />
    </PageShell>
  );
}

function DetailSkeleton() {
  return (
    <PageShell>
      <SectionShell sky="soft" space="lg" className="pt-24">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-6 h-12 w-3/4" />
        <Skeleton className="mt-4 h-4 w-1/2" />
      </SectionShell>
      <SectionShell band="none" space="md">
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </SectionShell>
    </PageShell>
  );
}
