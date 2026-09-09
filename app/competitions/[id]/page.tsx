"use client";

import { useMemo } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Award, FileText, MapPin, MessageCircle, Sparkles, Users } from "lucide-react";

import {
  BenefitCard,
  ChromeTitle,
  GrassStrip,
  PageShell,
  Pill,
  PricePill,
  SectionHeading,
  SectionShell,
  Surface,
  TALENT_CATEGORIES,
  TalentCategoryCard,
  talentMeta,
  WindowCard,
  type PillProps,
} from "@/components/brand";
import RegisterSection from "./RegisterSection";
import CompetitionTimeline from "./CompetitionTimeline";
import GuidebookArticle from "@/components/GuidebookArticle";
import SponsorSection from "@/components/SponsorSection";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateLong } from "@/lib/date";
import { toPublicCompetition } from "@/lib/mappers";
import { useCompetition, useCompetitionTimeline } from "@/src/lib/hooks/use-queries";
import type { Competition } from "@/types/astro";

const CATEGORY_PILL: Record<string, { label: string; tone: NonNullable<PillProps["tone"]> }> = {
  akademik: { label: "Akademik", tone: "blue" },
  olahraga: { label: "Olahraga", tone: "orange" },
  esports: { label: "Esports", tone: "navy" },
  "kesenian-/-seni": { label: "Kesenian", tone: "pink" },
};

const CATEGORY_MASCOT: Record<string, string> = {
  akademik: "/assets/mascots/sit.svg",
  olahraga: "/assets/mascots/cheer.svg",
  esports: "/assets/mascots/wink.svg",
  "kesenian-/-seni": "/assets/mascots/orange-cheer.svg",
};

const EASE = [0.16, 1, 0.3, 1] as const;

function typeLabel(type?: string) {
  if (type === "both") return "Tim dan individu";
  if (type === "team") return "Tim";
  return "Individu";
}

function feeAmount(competition: { isFree?: boolean; fee: number }) {
  if (competition.isFree) return "Gratis";
  if (competition.fee > 0) return `Rp ${competition.fee.toLocaleString("id-ID")}`;
  return "Segera diumumkan";
}

function chromeTitle(title: string) {
  const t = title.replace(/\s+/g, " ").trim();
  if (/got\s*talent/i.test(t)) return "GOT\nTALENT";
  const words = t.split(" ").filter(Boolean);
  if (words.length <= 1) return t;
  if (words.length === 2) return `${words[0]}\n${words[1]}`;
  const mid = Math.ceil(words.length / 2);
  return `${words.slice(0, mid).join(" ")}\n${words.slice(mid).join(" ")}`;
}

function benefitsFor(competition: Competition) {
  const items = [
    {
      icon: Users,
      label: typeLabel(competition.type),
    },
    {
      icon: Award,
      label: competition.prizes.length > 0 ? "Hadiah resmi" : "E-sertifikat peserta",
    },
    {
      icon: competition.location ? MapPin : Sparkles,
      label: competition.location || "Pengalaman lomba",
    },
  ];
  if (competition.type === "team" || competition.type === "both") {
    const min = competition.minTeamMembers || 1;
    const max = competition.maxTeamMembers || 5;
    items[0] = {
      icon: Users,
      label: `Tim ${min}-${max} orang`,
    };
  }
  return items;
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

  const category = CATEGORY_PILL[competition.category] ?? CATEGORY_PILL.akademik;
  const mascot = CATEGORY_MASCOT[competition.category] ?? CATEGORY_MASCOT.akademik;
  const hasSlots = competition.maxSlots > 0;
  const leftSlots = competition.maxSlots - competition.filledSlots;
  const batches = competition.batches ?? [];
  const hasGuidebook =
    (competition.guidebookSections && competition.guidebookSections.length > 0) ||
    (competition.rulesSummary && competition.rulesSummary.length > 0);
  const talentField = competition.customFields?.find((field) => field.id === "talent_category");
  const isOpen = competition.isActive !== false;

  const facts = [
    { label: "Jadwal", value: formatDateLong(competition.scheduleDate) || "Segera diumumkan" },
    { label: "Lokasi", value: competition.location || "Segera diumumkan" },
    { label: "Format", value: typeLabel(competition.type) },
    {
      label: competition.type === "team" ? "Kuota tim" : "Kuota",
      value: hasSlots
        ? `${competition.filledSlots} dari ${competition.maxSlots}`
        : "Segera diumumkan",
      hint: hasSlots ? (leftSlots > 0 ? `Sisa ${leftSlots}` : "Penuh") : undefined,
    },
  ];

  const waNumber = competition.contactPerson?.whatsapp?.replace(/\D/g, "") ?? "";
  const waHref = waNumber ? `https://wa.me/${waNumber}` : undefined;

  const stage = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.5, ease: EASE },
    },
  };

  return (
    <PageShell>
      <section className="relative isolate flex min-h-[100dvh] flex-col overflow-x-clip pt-20">
        <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-8 px-4 pb-28 pt-6 sm:px-8 sm:pb-32 lg:grid-cols-2 lg:gap-12 lg:pb-36">
          <motion.div
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: reduce ? 0 : 0.08 }}
            className="flex flex-col items-center text-center lg:items-start lg:text-left"
          >
            <motion.div variants={stage} className="self-start lg:self-auto">
              <Link
                href="/#competitions"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-astro-navy/70 transition-colors hover:text-astro-navy"
              >
                <ArrowLeft className="size-4" aria-hidden />
                Semua lomba
              </Link>
            </motion.div>

            <motion.div
              variants={stage}
              className="mt-5 flex flex-wrap items-center justify-center gap-2 lg:justify-start"
            >
              <Pill tone={category.tone} size="sm" className="shadow-gloss">
                {category.label}
              </Pill>
              <Pill tone="glass" size="sm">
                {competition.origin === "external" ? "Eksternal" : "Internal"}
              </Pill>
              <Pill tone={isOpen ? "gold" : "pink"} size="sm" className="shadow-gloss">
                {isOpen ? "Open" : "Ditutup"}
              </Pill>
            </motion.div>

            <motion.div
              variants={stage}
              className="mt-4 w-[min(100%,20rem)] sm:w-[min(100%,24rem)]"
            >
              <ChromeTitle depth="lg" align="center" className="lg:hidden">
                {chromeTitle(competition.title)}
              </ChromeTitle>
              <ChromeTitle depth="lg" align="left" className="hidden lg:block">
                {chromeTitle(competition.title)}
              </ChromeTitle>
            </motion.div>

            {competition.tagline ? (
              <motion.p
                variants={stage}
                className="mt-4 max-w-md text-pretty text-base font-medium leading-relaxed text-astro-navy/75 sm:text-lg"
              >
                {competition.tagline}
              </motion.p>
            ) : null}

            <motion.p
              variants={stage}
              className="mt-3 max-w-md text-pretty text-sm font-medium leading-relaxed text-ink/75 sm:text-base"
            >
              {competition.description || "Deskripsi lengkap lomba akan segera diumumkan."}
            </motion.p>

            <motion.div variants={stage} className="mt-6">
              <RegisterSection competition={competition} />
            </motion.div>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduce ? 0 : 0.22, duration: reduce ? 0 : 0.55, ease: EASE }}
            className="relative z-10 w-full max-w-lg justify-self-center lg:max-w-none lg:justify-self-end"
          >
            <WindowCard title="Pendaftaran" bodyClassName="gap-5">
              {competition.batchName ? (
                <p className="text-xs font-semibold text-astro-navy/60">{competition.batchName}</p>
              ) : null}
              <PricePill
                amount={feeAmount(competition)}
                unit={
                  competition.isFree || competition.fee <= 0
                    ? undefined
                    : competition.type === "team"
                      ? "Tim"
                      : "Orang"
                }
              />

              <dl className="grid gap-2.5 text-sm">
                {facts.map((fact) => (
                  <div key={fact.label} className="flex items-baseline justify-between gap-4">
                    <dt className="shrink-0 text-ink/55">{fact.label}</dt>
                    <dd className="text-right font-semibold text-astro-navy">
                      {fact.value}
                      {fact.hint ? (
                        <span className="mt-0.5 block text-xs font-medium text-ink/55">
                          {fact.hint}
                        </span>
                      ) : null}
                    </dd>
                  </div>
                ))}
              </dl>

              {competition.prizes.length > 0 ? (
                <Surface tone="tint" radius="xl" pad="md">
                  <p className="text-xs font-bold text-astro-navy">Hadiah</p>
                  <ul className="mt-2 grid gap-1.5">
                    {competition.prizes.map((prize) => (
                      <li
                        key={prize.label}
                        className="flex items-baseline justify-between gap-3 text-sm"
                      >
                        <span className="text-ink/70">{prize.label}</span>
                        <span className="text-right font-semibold text-astro-navy">
                          {prize.value || "Segera diumumkan"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Surface>
              ) : null}

              <div className="flex flex-col gap-2 sm:flex-row">
                {competition.rulebookUrl ? (
                  <Button asChild variant="outline" size="default" className="flex-1">
                    <a href={competition.rulebookUrl} target="_blank" rel="noopener noreferrer">
                      <FileText data-icon="inline-start" />
                      Guidebook
                    </a>
                  </Button>
                ) : null}
                {waHref ? (
                  <Button asChild variant="outline" size="default" className="flex-1">
                    <a href={waHref} target="_blank" rel="noopener noreferrer">
                      <MessageCircle data-icon="inline-start" />
                      Hubungi panitia
                    </a>
                  </Button>
                ) : null}
              </div>
            </WindowCard>
          </motion.div>
        </div>

        <Image
          src={mascot}
          alt=""
          aria-hidden
          width={192}
          height={192}
          className="pointer-events-none absolute bottom-10 right-[6%] z-20 hidden w-28 sm:block md:bottom-12 md:w-40 lg:w-48"
        />
        <GrassStrip className="h-24 sm:h-32 md:h-40" />
      </section>

      <SectionShell band="none" space="md">
        <SectionHeading
          eyebrow="Benefit"
          pillTone="pink"
          title="Yang kamu dapat"
          lead="Format, hadiah, dan tempat lomba. Biaya dan kuota ada di kartu pendaftaran."
          align="start"
        />
        <div className="mt-6 sm:mt-8">
          <BenefitCard items={benefitsFor(competition)} />
        </div>
      </SectionShell>

      {talentField ? (
        <SectionShell band="none" space="md">
          <SectionHeading
            eyebrow="Kategori"
            pillTone="orange"
            title={talentField.label || "Pilih aksi"}
            lead={talentField.description || "Satu panggung, beberapa jenis tampilan."}
            align="start"
          />
          <WindowCard title="Jenis aksi" className="mt-6 sm:mt-8">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-7">
              {(talentField.options?.length
                ? talentField.options.map((option) => ({ option, ...talentMeta(option) }))
                : TALENT_CATEGORIES.map((talent) => ({ option: talent.id, ...talent }))
              ).map((talent) => (
                <TalentCategoryCard
                  key={talent.option}
                  id={talent.id}
                  label={talent.label}
                  size="mini"
                />
              ))}
            </div>
          </WindowCard>
        </SectionShell>
      ) : null}

      {hasGuidebook ? (
        <SectionShell band="none" space="md">
          <SectionHeading
            eyebrow="Materi"
            pillTone="orange"
            title="Ketentuan lomba"
            lead="Baca aturan resmi sebelum mengisi formulir."
            align="start"
          />
          <WindowCard title="Guidebook" className="mt-6 sm:mt-8">
            <GuidebookArticle
              sections={competition.guidebookSections || []}
              fallbackRules={competition.rulesSummary || []}
            />
          </WindowCard>
        </SectionShell>
      ) : null}

      {(timeline.length > 0 || (competition.hasBatches && batches.length > 0)) && (
        <SectionShell band="none" space="md">
          <SectionHeading
            eyebrow="Timeline"
            pillTone="pink"
            title="Jadwal dan gelombang"
            lead="Tanggal penting dan biaya per gelombang, jika ada."
            align="start"
          />
          <div className="mt-6 grid items-stretch gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-2">
            {timeline.length > 0 && <CompetitionTimeline timeline={timeline} />}
            {competition.hasBatches && batches.length > 0 && (
              <WindowCard title="Gelombang" className="h-full" bodyClassName="gap-3">
                {batches.map((batch) => {
                  const now = new Date();
                  const isOngoing =
                    Boolean(batch.startDate && batch.endDate) &&
                    now >= new Date(batch.startDate) &&
                    now <= new Date(batch.endDate);
                  const isUpcoming = Boolean(batch.startDate) && now < new Date(batch.startDate);

                  return (
                    <Surface
                      key={batch.id}
                      tone={isOngoing ? "tint" : "plain"}
                      radius="xl"
                      pad="md"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-heading text-sm font-bold text-astro-navy">
                          {batch.name}
                        </p>
                        <Pill tone={isOngoing ? "blue" : "glass"} size="sm">
                          {isOngoing ? "Aktif" : isUpcoming ? "Mendatang" : "Berakhir"}
                        </Pill>
                      </div>
                      <p className="mt-1 font-title text-lg text-astro-navy">
                        Rp {Number(batch.fee).toLocaleString("id-ID")}
                      </p>
                      <p className="mt-1 text-xs font-medium text-ink/65">
                        {formatDateLong(batch.startDate)} sampai {formatDateLong(batch.endDate)}
                      </p>
                    </Surface>
                  );
                })}
              </WindowCard>
            )}
          </div>
        </SectionShell>
      )}

      <SponsorSection />
    </PageShell>
  );
}

function DetailSkeleton() {
  return (
    <PageShell>
      <SectionShell space="lg" className="pt-24">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="mt-6 h-12 w-2/3" />
        <Skeleton className="mt-4 h-4 w-1/2" />
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </SectionShell>
    </PageShell>
  );
}
