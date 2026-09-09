import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from "@/lib/og";

export const alt = "Paket sponsorship ASTRO 2026";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    title: "Jadi mitra ASTRO",
    subtitle: "Eksposur brand di seluruh media fisik dan digital resmi.",
  });
}
