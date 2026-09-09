import { isFlagOn, type FlagLike } from "@/lib/flags";
import { toIsoString } from "@/lib/date";
import { getEffectiveCompetitionFee } from "@/src/lib/competitions";
import type { Competition, CompetitionCustomField, JourneyCard, TimelineItem } from "@/types/astro";

export type CompetitionSource = {
  id: string;
  title: string;
  category: string;
  tagline?: string | null;
  description?: string | null;
  fee: number;
  maxSlots: number;
  filledSlots: number;
  scheduleDate?: Date | string | null;
  location?: string | null;
  prizes?: { label: string; value: string }[] | null;
  prizesFirst?: string | null;
  prizesSecond?: string | null;
  prizesThird?: string | null;
  rulesSummary?: string[] | null;
  rulebookUrl?: string | null;
  type?: string | null;
  maxTeamMembers?: number | null;
  minTeamMembers?: number | null;
  contactName?: string | null;
  contactWhatsapp?: string | null;
  timeline?: TimelineItem[] | null;
  isFree?: FlagLike;
  hasBatches?: FlagLike;
  batches?: Competition["batches"] | null;
  guidebookSections?: Competition["guidebookSections"] | null;
  customFields?: CompetitionCustomField[] | null;
  origin?: string | null;
  isActive?: FlagLike;
  playerPhotoRequired?: FlagLike;
};

export type JourneySource = {
  id: string;
  year?: string | null;
  theme: string;
  participants?: number | null;
  date?: string | null;
  competitionsCount?: number | null;
  achievement?: string | null;
  description?: string | null;
  highlights?: string[] | null;
};

export function toPublicCompetition(row: CompetitionSource): Competition {
  const effective = getEffectiveCompetitionFee(row);
  const prizes = row.prizes?.length
    ? row.prizes
    : [
        ...(row.prizesFirst ? [{ label: "Juara 1", value: row.prizesFirst }] : []),
        ...(row.prizesSecond ? [{ label: "Juara 2", value: row.prizesSecond }] : []),
        ...(row.prizesThird ? [{ label: "Juara 3", value: row.prizesThird }] : []),
      ];

  return {
    id: row.id,
    title: row.title,
    category: row.category,
    tagline: row.tagline || "",
    description: row.description || "",
    fee: effective.fee,
    batchName: effective.batchName,
    hasBatches: isFlagOn(row.hasBatches),
    batches: row.batches ?? [],
    guidebookSections: row.guidebookSections ?? [],
    customFields: row.customFields ?? [],
    maxSlots: row.maxSlots,
    filledSlots: row.filledSlots,
    scheduleDate: toIsoString(row.scheduleDate),
    location: row.location || "",
    prizes,
    rulesSummary: row.rulesSummary ?? [],
    rulebookUrl: row.rulebookUrl || "",
    registrationUrl: "",
    type: row.type || "individual",
    maxTeamMembers: row.maxTeamMembers || 1,
    minTeamMembers: row.minTeamMembers || 1,
    playerPhotoRequired: isFlagOn(row.playerPhotoRequired),
    contactPerson: {
      name: row.contactName || "",
      whatsapp: row.contactWhatsapp || "",
    },
    timeline: row.timeline ?? [],
    isFree: isFlagOn(row.isFree),
    origin: row.origin === "external" ? "external" : "internal",
    isActive: row.isActive === undefined ? true : isFlagOn(row.isActive),
  };
}

export function toJourneyCard(row: JourneySource): JourneyCard {
  return {
    id: row.id,
    year: row.year || row.id,
    theme: row.theme,
    participants: row.participants || 0,
    date: row.date || "",
    competitions: row.competitionsCount || 0,
    achievement: row.achievement || "",
    description: row.description || "",
    highlights: row.highlights ?? [],
  };
}
