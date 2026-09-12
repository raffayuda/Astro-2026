import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from "@/lib/og";

export const alt = "Profil dan sejarah ASTRO 2026";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    title: "Profil dan sejarah",
    subtitle: "Visi, misi, perjalanan, dan jajaran panitia pelaksana.",
  });
}
