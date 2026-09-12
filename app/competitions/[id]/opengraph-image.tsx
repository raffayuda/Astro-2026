import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { competitions } from "@/src/db/schema";
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from "@/lib/og";

export const alt = "Cabang lomba ASTRO 2026";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// The catalog changes rarely once published, so serve a cached image and let it
// refresh hourly rather than re-rendering the PNG on every crawler hit.
export const revalidate = 3600;

/** Category labels, kept in step with `CategorySection`. */
const CATEGORY_LABELS: Record<string, string> = {
  akademik: "Akademik",
  olahraga: "Olahraga",
  esports: "Esports",
};

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let comp: { title: string; category: string; tagline: string | null; fee: number } | undefined;
  try {
    comp = await db.query.competitions.findFirst({
      where: eq(competitions.id, id),
      columns: { title: true, category: true, tagline: true, fee: true },
    });
  } catch {
    // A database hiccup must not break the social preview: fall through to the
    // generic catalog card below.
    comp = undefined;
  }

  if (!comp) {
    return ogImage({
      title: "Cabang lomba",
      subtitle: "Lihat juknis, jadwal, dan hadiah tiap cabang lomba.",
    });
  }

  const category = CATEGORY_LABELS[comp.category] ?? comp.category;

  return ogImage({
    title: comp.title,
    subtitle: comp.tagline ?? `Cabang lomba ${category} di ASTRO 2026.`,
    tag: comp.fee > 0 ? `${category} · ${rupiah.format(comp.fee)}` : `${category} · Gratis`,
    // Long competition names need the full width; the mascot would crowd them.
    mascot: comp.title.length <= 26,
  });
}
