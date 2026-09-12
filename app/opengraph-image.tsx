import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from "@/lib/og";

export const alt = "ASTRO 2026, ajang kompetisi BEM STT-NF";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    title: "ASTRO 2026",
    subtitle: "Ajang kompetisi Akademik, olahraga, dan esports.",
    tag: "Pendaftaran dibuka",
  });
}
