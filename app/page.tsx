import { db } from "@/src/db";
import { competitions, faqs as faqsTable } from "@/src/db/schema";
import { desc } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import type { AstroData } from "@/types/astro";
import astroData from "@/data/astro-data.json";
import { toPublicCompetition } from "@/lib/mappers";
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

  const data: AstroData =
    rows.length > 0
      ? {
          ...fallbackData,
          competitions: rows.map(toPublicCompetition),
          faqs: faqRows.map((f) => ({ q: f.question, a: f.answer })),
        }
      : fallbackData;

  return <HomeClient data={data} />;
}
