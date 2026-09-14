import { db } from "@/src/db";
import { competitions, faqs as faqsTable } from "@/src/db/schema";
import { desc } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import type { AstroData } from "@/types/astro";
import astroData from "@/data/astro-data.json";
import { toPublicCompetition } from "@/lib/mappers";
import { getLatestRegistrationDeadline } from "@/src/lib/competitions";
import HomeClient from "./HomeClient";

type CompetitionRow = InferSelectModel<typeof competitions>;
type FaqRow = InferSelectModel<typeof faqsTable>;

const fallbackData = astroData as AstroData;

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  let rows: CompetitionRow[] = [];
  let faqRows: FaqRow[] = [];

  try {
    rows = await db.select().from(competitions);
    faqRows = await db.select().from(faqsTable).orderBy(desc(faqsTable.sortOrder));
  } catch {
    // DB not available, use JSON
  }

  const publicCompetitions =
    rows.length > 0 ? rows.map(toPublicCompetition) : fallbackData.competitions;

  const latestDeadline = getLatestRegistrationDeadline(
    publicCompetitions,
    fallbackData.eventConfig.registrationDeadline,
  );

  const data: AstroData = {
    ...fallbackData,
    eventConfig: {
      ...fallbackData.eventConfig,
      registrationDeadline: latestDeadline,
    },
    competitions: publicCompetitions,
    faqs:
      faqRows.length > 0
        ? faqRows.map((f) => ({ q: f.question, a: f.answer }))
        : fallbackData.faqs,
  };

  return <HomeClient data={data} />;
}
