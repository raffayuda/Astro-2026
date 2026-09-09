import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from "@/lib/og";

export const alt = "Cek status pendaftaran ASTRO 2026";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    title: "Cek pendaftaranmu",
    subtitle: "Lacak progres verifikasi tim dan pembayaran lewat nomor WhatsApp.",
  });
}
