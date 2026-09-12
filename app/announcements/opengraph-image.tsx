import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from "@/lib/og";

export const alt = "Pengumuman pemenang ASTRO 2026";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    title: "Pengumuman pemenang",
    subtitle: "Daftar juara seluruh cabang lomba beserta sertifikat digital.",
  });
}
