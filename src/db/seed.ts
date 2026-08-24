import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

import { eq } from 'drizzle-orm';
import { db } from './index';
import { categories, competitions, competitionTimeline, faqs, users } from './schema';
import astroData from '../../data/astro-data.json';

type Competition = (typeof astroData.competitions)[number];

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  akademik: { label: 'Akademik', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  olahraga: { label: 'Olahraga', color: 'text-orange-700 bg-orange-50 border-orange-200' },
  esports: { label: 'Esports', color: 'text-cyan-700 bg-cyan-50 border-cyan-200' },
};

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'password';
const ADMIN_NAME = 'Admin ASTRO';

function prizeValue(comp: Competition, label: string) {
  return comp.prizes.find((p) => p.label === label)?.value ?? '';
}

async function seedCategories() {
  const ids = [...new Set(astroData.competitions.map((c) => c.category))];
  const rows = ids.map((id, i) => ({
    id,
    label: CATEGORY_LABELS[id]?.label ?? id,
    color: CATEGORY_LABELS[id]?.color ?? 'text-cyan-700 bg-cyan-50 border-cyan-200',
    sortOrder: i,
  }));

  await db.insert(categories).values(rows).onConflictDoNothing({ target: categories.id });
  console.log(`Seeded ${rows.length} categories`);
}

async function seedCompetitions() {
  const rows = astroData.competitions.map((comp) => ({
    id: comp.id,
    title: comp.title,
    category: comp.category,
    tagline: comp.tagline,
    description: comp.description,
    fee: comp.fee,
    maxSlots: comp.maxSlots,
    filledSlots: comp.filledSlots,
    scheduleDate: new Date(comp.scheduleDate),
    location: comp.location,
    prizesFirst: prizeValue(comp, 'Juara 1'),
    prizesSecond: prizeValue(comp, 'Juara 2'),
    prizesThird: prizeValue(comp, 'Juara 3'),
    prizes: comp.prizes,
    rulesSummary: comp.rulesSummary,
    rulebookUrl: comp.rulebookUrl,
    contactName: comp.contactPerson.name,
    contactWhatsapp: comp.contactPerson.whatsapp,
    playerPhotoRequired:
      (comp as { playerPhotoRequired?: boolean }).playerPhotoRequired ? '1' : '0',
  }));

  await db.insert(competitions).values(rows).onConflictDoNothing({ target: competitions.id });
  console.log(`Seeded ${rows.length} competitions`);
}

async function seedCompetitionTimeline() {
  const rows = astroData.competitions.flatMap((comp) =>
    comp.timeline.map((item, i) => ({
      competitionId: comp.id,
      date: item.date,
      title: item.title,
      desc: item.desc,
      sortOrder: i,
    })),
  );
  if (rows.length === 0) return;

  // Re-run safe: wipe and re-insert per competition instead of guessing at conflict keys.
  const compIds = [...new Set(rows.map((r) => r.competitionId))];
  await Promise.all(
    compIds.map((compId) =>
      db.delete(competitionTimeline).where(eq(competitionTimeline.competitionId, compId)),
    ),
  );
  await db.insert(competitionTimeline).values(rows);
  console.log(`Seeded ${rows.length} competition timeline entries`);
}

async function seedFaqs() {
  const rows = astroData.faqs.map((faq, i) => ({
    question: faq.q,
    answer: faq.a,
    sortOrder: i,
  }));

  const existing = await db.select({ id: faqs.id }).from(faqs).limit(1);
  if (existing.length > 0) {
    console.log('Skipped FAQs (already seeded)');
    return;
  }

  await db.insert(faqs).values(rows);
  console.log(`Seeded ${rows.length} FAQs`);
}

async function seedAdminUser() {
  const { auth } = await import('@/src/server/auth');

  const [existing] = await db.select().from(users).where(eq(users.email, ADMIN_EMAIL));

  let adminId = existing?.id;

  if (!adminId) {
    const result = await auth.api.signUpEmail({
      body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, name: ADMIN_NAME },
    });
    adminId = result?.user?.id;
  }

  if (!adminId) {
    console.log('Could not create admin user — create manually and run:');
    console.log(`  UPDATE users SET role = 'admin', email_verified = true WHERE email = '${ADMIN_EMAIL}';`);
    return;
  }

  // better-auth's signUpEmail always inserts with role: 'participant' and
  // email_verified: false — force both to the correct admin state here,
  // whether the user was just created or already existed.
  await db
    .update(users)
    .set({ role: 'admin', emailVerified: true, updatedAt: new Date() })
    .where(eq(users.id, adminId));

  console.log('Admin user ready:');
  console.log(`  Email: ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
}

async function seed() {
  console.log('Seeding database...');

  await seedCategories();
  await seedCompetitions();
  await seedCompetitionTimeline();
  await seedFaqs();
  await seedAdminUser();

  console.log('Seed complete!');
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
