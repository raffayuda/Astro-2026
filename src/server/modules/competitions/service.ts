import { db } from '@/src/db';
import { competitions, registrations, competitionTimeline } from '@/src/db/schema';
import { eq, desc, asc, count } from 'drizzle-orm';
import type { CompetitionInput, TimelineItem } from './model';
import { revalidatePath } from 'next/cache';

/** Safely revalidate public web portal paths when competitions change. */
export function revalidateCompetitionPaths(id?: string) {
  try {
    revalidatePath('/');
    revalidatePath('/competitions');
    if (id) {
      revalidatePath(`/competitions/${id}`);
      revalidatePath(`/register/${id}`);
    }
  } catch {
    // Non-fatal if invoked outside a Next.js request context
  }
}

/** Convert a Drizzle text-boolean ('1'/'0') to a real boolean. */
function toBool(value: string | null | undefined): boolean {
  return value === '1';
}

/** Map a DB competition row to the API shape (booleans as real booleans). */
function toApiCompetition(row: typeof competitions.$inferSelect) {
  return {
    ...row,
    isFree: toBool(row.isFree),
    hasBatches: toBool(row.hasBatches),
    playerPhotoRequired: toBool(row.playerPhotoRequired),
    isActive: toBool(row.isActive),
    certificateEnabled: toBool(row.certificateEnabled),
  };
}

/** Get the currently active batch from a list of competition batches */
export function getActiveCompetitionBatch(
  batches: typeof competitions.$inferSelect['batches'] | null | undefined,
  now = new Date(),
) {
  if (!batches || !Array.isArray(batches) || batches.length === 0) return null;
  return (
    batches.find((b) => {
      const start = new Date(b.startDate);
      const end = new Date(b.endDate);
      return now >= start && now <= end;
    }) || null
  );
}

/** Calculate the effective fee and active batch name for a competition */
export function getEffectiveFee(
  competition: {
    fee: number;
    isFree?: boolean | string | null;
    hasBatches?: boolean | string | null;
    batches?: typeof competitions.$inferSelect['batches'] | null;
  },
  now = new Date(),
) {
  const isFree = competition.isFree === true || competition.isFree === '1';
  if (isFree) {
    return { fee: 0, batchName: null, isBatch: false, activeBatch: null };
  }

  const hasBatches = competition.hasBatches === true || competition.hasBatches === '1';
  if (hasBatches && competition.batches && competition.batches.length > 0) {
    const activeBatch = getActiveCompetitionBatch(competition.batches, now);
    if (activeBatch) {
      return { fee: activeBatch.fee, batchName: activeBatch.name, isBatch: true, activeBatch };
    }
  }

  return { fee: competition.fee || 0, batchName: null, isBatch: false, activeBatch: null };
}

export async function listCompetitions() {
  const data = await db
    .select()
    .from(competitions)
    .orderBy(desc(competitions.createdAt));
  return data.map(toApiCompetition);
}

export async function getCompetition(id: string) {
  const [row] = await db
    .select()
    .from(competitions)
    .where(eq(competitions.id, id));
  return row ? toApiCompetition(row) : null;
}

export async function createCompetition(input: CompetitionInput) {
  const isFree = !!input.isFree;
  const [row] = await db
    .insert(competitions)
    .values({
      id: input.id!,
      title: input.title,
      category: input.category,
      tagline: input.tagline,
      description: input.description,
      fee: isFree ? 0 : (input.fee ?? 0),
      hasBatches: input.hasBatches ? '1' : '0',
      batches: input.batches ?? [],
      maxSlots: input.maxSlots,
      filledSlots: input.filledSlots,
      scheduleDate: input.scheduleDate ? new Date(input.scheduleDate) : null,
      location: input.location,
      prizesFirst: input.prizesFirst,
      prizesSecond: input.prizesSecond,
      prizesThird: input.prizesThird,
      prizes: input.prizes,
      rulesSummary: input.rulesSummary,
      rulebookUrl: input.rulebookUrl,
      contactName: input.contactName,
      contactWhatsapp: input.contactWhatsapp,
      type: input.type,
      maxTeamMembers: input.maxTeamMembers,
      minTeamMembers: input.minTeamMembers,
      membersRequired: input.membersRequired,
      playerPhotoRequired: input.playerPhotoRequired ? '1' : '0',
      isFree: isFree ? '1' : '0',
      origin: input.origin,
      certificateEnabled: input.certificateEnabled ? '1' : '0',
      certificateType: input.certificateType,
      certificateTemplate: input.certificateTemplate,
      isActive: input.isActive ? '1' : '0',
    })
    .returning();
  revalidateCompetitionPaths(input.id);
  return toApiCompetition(row);
}

export async function updateCompetition(id: string, input: Partial<CompetitionInput>) {
  const updates: Partial<typeof competitions.$inferInsert> = {};
  if (input.title !== undefined) updates.title = input.title;
  if (input.category !== undefined) updates.category = input.category;
  if (input.tagline !== undefined) updates.tagline = input.tagline;
  if (input.description !== undefined) updates.description = input.description;

  if (input.isFree !== undefined) {
    updates.isFree = input.isFree ? '1' : '0';
    if (input.isFree) {
      updates.fee = 0;
    }
  }
  if (input.fee !== undefined && !input.isFree) {
    updates.fee = input.fee;
  }
  if (input.hasBatches !== undefined) {
    updates.hasBatches = input.hasBatches ? '1' : '0';
  }
  if (input.batches !== undefined) {
    updates.batches = input.batches;
  }

  if (input.maxSlots !== undefined) updates.maxSlots = input.maxSlots;
  if (input.filledSlots !== undefined) updates.filledSlots = input.filledSlots;
  if (input.scheduleDate !== undefined)
    updates.scheduleDate = input.scheduleDate ? new Date(input.scheduleDate) : null;
  if (input.location !== undefined) updates.location = input.location;
  if (input.prizesFirst !== undefined) updates.prizesFirst = input.prizesFirst;
  if (input.prizesSecond !== undefined) updates.prizesSecond = input.prizesSecond;
  if (input.prizesThird !== undefined) updates.prizesThird = input.prizesThird;
  if (input.prizes !== undefined) updates.prizes = input.prizes;
  if (input.rulesSummary !== undefined) updates.rulesSummary = input.rulesSummary;
  if (input.rulebookUrl !== undefined) updates.rulebookUrl = input.rulebookUrl;
  if (input.contactName !== undefined) updates.contactName = input.contactName;
  if (input.contactWhatsapp !== undefined) updates.contactWhatsapp = input.contactWhatsapp;
  if (input.type !== undefined) updates.type = input.type;
  if (input.maxTeamMembers !== undefined) updates.maxTeamMembers = input.maxTeamMembers;
  if (input.minTeamMembers !== undefined) updates.minTeamMembers = input.minTeamMembers;
  if (input.membersRequired !== undefined) updates.membersRequired = input.membersRequired;
  if (input.playerPhotoRequired !== undefined)
    updates.playerPhotoRequired = input.playerPhotoRequired ? '1' : '0';
  if (input.origin !== undefined) updates.origin = input.origin;
  if (input.certificateEnabled !== undefined)
    updates.certificateEnabled = input.certificateEnabled ? '1' : '0';
  if (input.certificateType !== undefined) updates.certificateType = input.certificateType;
  if (input.certificateTemplate !== undefined)
    updates.certificateTemplate = input.certificateTemplate;
  if (input.isActive !== undefined) updates.isActive = input.isActive ? '1' : '0';

  const [row] = await db
    .update(competitions)
    .set(updates)
    .where(eq(competitions.id, id))
    .returning();

  revalidateCompetitionPaths(id);
  return row ? toApiCompetition(row) : null;
}

export async function deleteCompetition(id: string) {
  // Check for existing registrations
  const [regCount] = await db
    .select({ total: count() })
    .from(registrations)
    .where(eq(registrations.competitionId, id));

  if (regCount && Number(regCount.total) > 0) {
    return { blocked: true, count: Number(regCount.total) };
  }

  await db.delete(competitions).where(eq(competitions.id, id));
  revalidateCompetitionPaths(id);
  return { blocked: false, count: 0 };
}

/** Competitions with a `hasWinners` flag (public). */
export async function listCompetitionsWithWinners() {
  const allComps = await db
    .select({
      id: competitions.id,
      title: competitions.title,
      category: competitions.category,
      tagline: competitions.tagline,
      type: competitions.type,
      origin: competitions.origin,
      isFree: competitions.isFree,
    })
    .from(competitions)
    .orderBy(desc(competitions.createdAt));

  const compsWithWinners = await db
    .select({ id: registrations.competitionId })
    .from(registrations)
    .where(eq(registrations.isWinner, '1'))
    .groupBy(registrations.competitionId);

  const winnerIds = new Set(compsWithWinners.map((r) => r.id));

  return allComps.map((c) => ({
    ...c,
    isFree: toBool(c.isFree),
    hasWinners: winnerIds.has(c.id),
  }));
}

/* ─── Timeline ─── */

export async function listTimeline(competitionId: string) {
  return db
    .select()
    .from(competitionTimeline)
    .where(eq(competitionTimeline.competitionId, competitionId))
    .orderBy(asc(competitionTimeline.sortOrder), asc(competitionTimeline.createdAt));
}

export async function createTimelineItem(competitionId: string, input: TimelineItem) {
  const existing = await db
    .select()
    .from(competitionTimeline)
    .where(eq(competitionTimeline.competitionId, competitionId))
    .orderBy(asc(competitionTimeline.sortOrder));

  const nextOrder =
    existing.length > 0 ? (existing[existing.length - 1].sortOrder ?? 0) + 1 : 0;

  const [row] = await db
    .insert(competitionTimeline)
    .values({
      competitionId,
      date: input.date,
      title: input.title,
      desc: input.desc,
      sortOrder: input.sortOrder ?? nextOrder,
    })
    .returning();
  revalidateCompetitionPaths(competitionId);
  return row;
}

export async function updateTimelineItem(itemId: number, input: Partial<TimelineItem>) {
  const updates: Partial<typeof competitionTimeline.$inferInsert> = {};
  if (input.date !== undefined) updates.date = input.date;
  if (input.title !== undefined) updates.title = input.title;
  if (input.desc !== undefined) updates.desc = input.desc;
  if (input.sortOrder !== undefined) updates.sortOrder = input.sortOrder;

  const [row] = await db
    .update(competitionTimeline)
    .set(updates)
    .where(eq(competitionTimeline.id, itemId))
    .returning();
  if (row) {
    revalidateCompetitionPaths(row.competitionId);
  }
  return row || null;
}

export async function deleteTimelineItem(itemId: number) {
  const [row] = await db
    .delete(competitionTimeline)
    .where(eq(competitionTimeline.id, itemId))
    .returning();
  if (row) {
    revalidateCompetitionPaths(row.competitionId);
  }
  return row || null;
}
