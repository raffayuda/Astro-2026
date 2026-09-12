import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from "@/lib/og";

export const alt = "Media center ASTRO 2026";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    title: "Kanal resmi ASTRO",
    subtitle: "Update real-time, dokumentasi visual, reels, dan press kit.",
  });
}
