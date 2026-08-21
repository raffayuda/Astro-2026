import { db } from '@/src/db';
import { certificateTemplates } from '@/src/db/schema';
import { eq, asc } from 'drizzle-orm';
import { deleteSupabaseFile } from '@/src/server/modules/upload';
import type { CertificateTemplateInput } from './model';

export async function listTemplates(competitionId: string) {
  return db
    .select()
    .from(certificateTemplates)
    .where(eq(certificateTemplates.competitionId, competitionId))
    .orderBy(asc(certificateTemplates.rank));
}

export async function getTemplate(id: number) {
  const [row] = await db
    .select()
    .from(certificateTemplates)
    .where(eq(certificateTemplates.id, id));
  return row || null;
}

export async function getTemplateByRank(competitionId: string, rank: string) {
  const [row] = await db
    .select()
    .from(certificateTemplates)
    .where(
      eq(certificateTemplates.competitionId, competitionId) &&
      eq(certificateTemplates.rank, rank),
    );
  return row || null;
}

export async function upsertTemplate(input: CertificateTemplateInput) {
  const [existing] = await db
    .select({ id: certificateTemplates.id })
    .from(certificateTemplates)
    .where(
      eq(certificateTemplates.competitionId, input.competitionId) &&
      eq(certificateTemplates.rank, input.rank),
    );

  const values = {
    competitionId: input.competitionId,
    rank: input.rank,
    templateImageUrl: input.templateImageUrl,
    textOverlays: input.textOverlays,
    is_active: input.isActive ? '1' : '0',
    updatedAt: new Date(),
  };

  if (existing) {
    const [updated] = await db
      .update(certificateTemplates)
      .set(values)
      .where(eq(certificateTemplates.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(certificateTemplates)
    .values(values)
    .returning();
  return created;
}

export async function deleteTemplate(id: number) {
  const [deleted] = await db
    .delete(certificateTemplates)
    .where(eq(certificateTemplates.id, id))
    .returning();
  if (deleted) {
    deleteSupabaseFile(deleted.templateImageUrl).catch(console.error);
  }
  return deleted || null;
}
