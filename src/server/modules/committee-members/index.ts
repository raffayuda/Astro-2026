import { Elysia, t, status } from 'elysia';
import { authPlugin } from '@/src/server/plugins/auth';
import { db } from '@/src/db';
import { committeeMembers, committeeDivisions } from '@/src/db/schema';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';

/** Satu baris import (tanpa quote, tanpa instagram — diisi dari file panitia). */
const importRowSchema = t.Object({
  name: t.String({ minLength: 1 }),
  role: t.String({ minLength: 1 }),
  division: t.String({ minLength: 1 }),
  divisionName: t.Optional(t.String()),
  image: t.Optional(t.String()),
  isLeader: t.Optional(t.Boolean()),
  studyProgram: t.Optional(t.Nullable(t.String())),
  batch: t.Optional(t.Nullable(t.String())),
});

const memberSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  role: z.string().min(1, 'Jabatan wajib diisi'),
  division: z.string().min(1, 'Divisi wajib diisi'),
  divisionName: z.string().optional(),
  image: z.string().min(1, 'Foto wajib diisi'),
  isLeader: z.boolean().optional().default(false),
  studyProgram: z.string().nullable().optional(),
  batch: z.string().nullable().optional(),
  quote: z.string().nullable().optional(),
  instagram: z.string().nullable().optional(),
  linkedin: z.string().nullable().optional(),
  sortOrder: z.number().int().optional().default(0),
});

/** Public list + admin mutations. (Renamed from /committee → /committee-members.) */
export const committeeMembersModule = new Elysia({ prefix: '/committee-members' })
  .use(authPlugin)
  .get('/', () => db.select().from(committeeMembers).orderBy(asc(committeeMembers.sortOrder)))
  .post('/', async ({ body }) => {
    const [item] = await db
      .insert(committeeMembers)
      .values({
        name: body.name,
        role: body.role,
        division: body.division,
        divisionName: body.divisionName || body.division,
        image: body.image,
        isLeader: body.isLeader ? '1' : '0',
        studyProgram: body.studyProgram ?? null,
        batch: body.batch ?? null,
        quote: body.quote ?? null,
        instagram: body.instagram ?? null,
        linkedin: body.linkedin ?? null,
        sortOrder: body.sortOrder,
      })
      .returning();
    return status(201, item);
  }, {
    body: memberSchema,
    admin: true,
  })
  /** Import batch dari file (CSV/Excel panitia). Divisi otomatis dibuat bila belum ada. */
  .post('/import', async ({ body }) => {
    const rows = body.rows;

    // 1. Kumpulkan semua divisi (bersih, tanpa spasi ekstra)
    const rawDivisions = Array.from(
      new Set(rows.map((r) => r.division.trim()).filter(Boolean)),
    );

    // 2. Slug + nama divisi (nama asli apa adanya)
    const divInfo = rawDivisions.map((d) => ({
      name: d,
      slug: d.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    }));

    // 3. Ambil divisi yang sudah ada, buat yang belum
    const existing = await db
      .select({ slug: committeeDivisions.slug })
      .from(committeeDivisions);
    const existingSlugs = new Set(existing.map((e) => e.slug));
    const toCreate = divInfo.filter((d) => !existingSlugs.has(d.slug));
    if (toCreate.length > 0) {
      await db
        .insert(committeeDivisions)
        .values(
          toCreate.map((d) => ({
            name: d.name,
            shortName: null,
            slug: d.slug,
          })),
        )
        .onConflictDoNothing();
    }

    // 4. Map name → slug untuk referensi divisionName
    const slugByName = new Map(divInfo.map((d) => [d.name, d.slug]));

    // 5. Insert semua anggota (jaga sortOrder berurutan)
    const inserted = await db
      .insert(committeeMembers)
      .values(
        rows.map((r, i) => ({
          name: r.name.trim(),
          role: r.role.trim(),
          division: slugByName.get(r.division.trim()) ?? r.division.trim(),
          divisionName: r.divisionName?.trim() || r.division.trim(),
          image: r.image || '',
          isLeader: r.isLeader ? '1' : '0',
          studyProgram: r.studyProgram ?? null,
          batch: r.batch ?? null,
          sortOrder: i,
        })),
      )
      .returning();

    return status(201, { count: inserted.length });
  }, {
    body: t.Object({
      rows: t.Array(importRowSchema),
    }),
    admin: true,
  })
  .put('/:id', async ({ params, body }) => {
    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.role !== undefined) updates.role = body.role;
    if (body.division !== undefined) updates.division = body.division;
    if (body.divisionName !== undefined) updates.divisionName = body.divisionName;
    if (body.image !== undefined) updates.image = body.image;
    if (body.isLeader !== undefined) updates.isLeader = body.isLeader ? '1' : '0';
    if (body.studyProgram !== undefined) updates.studyProgram = body.studyProgram ?? null;
    if (body.batch !== undefined) updates.batch = body.batch ?? null;
    if (body.quote !== undefined) updates.quote = body.quote ?? null;
    if (body.instagram !== undefined) updates.instagram = body.instagram ?? null;
    if (body.linkedin !== undefined) updates.linkedin = body.linkedin ?? null;
    if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder;

    const [item] = await db
      .update(committeeMembers)
      .set(updates)
      .where(eq(committeeMembers.id, Number(params.id)))
      .returning();
    if (!item) return status(404, { error: 'Not found' });
    return item;
  }, {
    params: t.Object({ id: t.String() }),
    body: memberSchema.partial(),
    admin: true,
  })
  .delete('/:id', async ({ params }) => {
    const [item] = await db
      .delete(committeeMembers)
      .where(eq(committeeMembers.id, Number(params.id)))
      .returning();
    if (!item) return status(404, { error: 'Not found' });
    return { success: true };
  }, {
    params: t.Object({ id: t.String() }),
    admin: true,
  });
