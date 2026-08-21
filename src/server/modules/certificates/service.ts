import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { db } from '@/src/db';
import { registrations, competitions } from '@/src/db/schema';
import { eq, and } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { Resend } from 'resend';
import type { TextOverlayField } from '@/src/db/schema';
import * as templateService from '@/src/server/modules/certificate-templates/service';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = () => createClient(supabaseUrl!, supabaseKey!);

/** Parse the newline-separated `members` field into an array of names. */
export function parseTeamMembers(members: string | null | undefined): string[] {
  if (!members) return [];
  return members
    .split('\n')
    .map((m) => m.trim())
    .filter(Boolean);
}

/**
 * Build the set of replacement values for text-overlay placeholders.
 * For team competitions, `participantName` is the individual member name;
 * for individual competitions, it is the registrant's fullName.
 */
function buildValues(
  reg: typeof registrations.$inferSelect,
  competition: typeof competitions.$inferSelect,
  rank: string,
  memberName?: string,
): Record<string, string> {
  const isTeam = reg.type === 'team';
  // Include the team leader as the first member so they get a certificate too
  const members = isTeam && reg.leaderName
    ? [reg.leaderName, ...parseTeamMembers(reg.members)]
    : parseTeamMembers(reg.members);

  const rankLabel = rank === 'participant' ? 'Peserta' : `Juara ${rank}`;

  return {
    participantName: memberName || reg.fullName || reg.teamName || reg.leaderName || 'Peserta',
    rank: rankLabel,
    competitionTitle: competition.title,
    category: competition.category,
    institution: reg.institution,
    teamName: isTeam ? reg.teamName || '' : '',
    teamMembers: members.join(', '),
    date: new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    competitionTagline: competition.tagline || '',
    competitionType: isTeam ? 'Tim' : 'Individu',
  };
}

/**
 * Download an image from a URL and return it as a Uint8Array.
 * Supports both Supabase direct URLs and relative paths.
 */
async function fetchImage(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch template image: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

/**
 * Render a certificate PDF from a background image + text overlays.
 * Uses pdf-lib: embeds the template image, draws each overlay text at (x, y).
 */
export async function generateCertificatePdf(
  templateImageUrl: string,
  textOverlays: TextOverlayField[],
  values: Record<string, string>,
): Promise<Uint8Array> {
  const templateImg = await fetchImage(templateImageUrl);

  const pdfDoc = await PDFDocument.create();

  const page = pdfDoc.addPage();

  // Embed template image: try PNG first, fall back to JPG.
  const img = await (async () => {
    try {
      return await pdfDoc.embedPng(templateImg);
    } catch {
      return await pdfDoc.embedJpg(templateImg);
    }
  })();
  const imgW = img.width;
  const imgH = img.height;

  // Page size = template image size in PDF points. This matches the preview
  // 1:1 (a template pixel maps to one PDF point), so overlay coordinates and
  // font sizes line up exactly with what the admin positioned in the preview.
  const pageW = imgW;
  const pageH = imgH;
  page.setSize(pageW, pageH);

  const scale = 1;
  const drawW = imgW;
  const drawH = imgH;
  const offsetX = 0;
  const offsetY = 0;

  // Draw the image filling the page.
  page.drawImage(img, { x: offsetX, y: offsetY, width: drawW, height: drawH });

  // Embed font (pdf-lib standard: Helvetica)
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Draw each text overlay.
  // Overlay x/y/fontSize/maxWidth are in the template image's natural pixel
  // space (top-left origin, Y downward). We apply the same `scale` used for
  // the image, then flip Y to PDF's bottom-left origin.
  for (const overlay of textOverlays) {
    const rawValue = values[overlay.field] ?? '';
    if (!rawValue) continue;

    const fontSize = (overlay.fontSize ?? 16) * scale;
    const maxWidth = (overlay.maxWidth ?? 300) * scale;
    const color = overlay.color ? hexToRgb(overlay.color) : rgb(0, 0, 0);
    const useFont = overlay.align === 'center' ? fontBold : font;

    const textX = offsetX + overlay.x * scale;

    // pdf-lib draws text with y as the BASELINE, but the admin positions
    // overlays by the text box's top edge in the preview (CSS `top`). Shift
    // the baseline down by the font ascender (Helvetica/Helvetica-Bold =
    // 0.718em) so the glyph tops land at the same y as in the preview.
    const ascender = 0.718;
    const textY = offsetY + drawH - overlay.y * scale - fontSize * ascender;

    // Simple text wrapping based on maxWidth
    const lines = wrapText(useFont, rawValue, maxWidth, fontSize);
    const lineHeight = fontSize * 1.2;

    let currentY = textY;
    for (const line of lines) {
      let x = textX;
      if (overlay.align === 'center') {
        const textWidth = useFont.widthOfTextAtSize(line, fontSize);
        x = textX + (maxWidth - textWidth) / 2;
      }
      page.drawText(line, {
        x,
        y: currentY,
        size: fontSize,
        font: useFont,
        color,
        maxWidth,
      });
      currentY -= lineHeight;
    }
  }

  return await pdfDoc.save();
}

/** Convert hex color (#RRGGBB or #RGB) to pdf-lib rgb() tuple. */
function hexToRgb(hex: string): ReturnType<typeof rgb> {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const num = parseInt(h, 16);
  return rgb(
    ((num >> 16) & 0xff) / 255,
    ((num >> 8) & 0xff) / 255,
    (num & 0xff) / 255,
  );
}

/** Naive text wrapping: split text into words until maxWidth exceeded. */
function wrapText(
  font: { widthOfTextAtSize: (text: string, size: number) => number },
  text: string,
  maxWidth: number,
  fontSize: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  if (words.length === 1) {
    if (font && font.widthOfTextAtSize(text, fontSize) <= maxWidth) return [text];
    return [text]; // single long word — let pdf handle overflow
  }

  const lines: string[] = [];
  let current = words[0];
  for (let i = 1; i < words.length; i++) {
    const candidate = `${current} ${words[i]}`;
    if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = words[i];
    }
  }
  lines.push(current);
  return lines;
}

/** Upload a PDF buffer to Supabase storage and return the public URL. */
export async function uploadPdf(
  pdfBuffer: Uint8Array,
  competitionId: string,
  rank: string,
): Promise<string> {
  const client = supabase();
  const ext = `${Date.now()}-${randomUUID()}.pdf`;
  const path = `certificates/${competitionId}/${rank}/${ext}`;

  const { error } = await client.storage
    .from('uploads')
    .upload(path, pdfBuffer, { contentType: 'application/pdf' });

  if (error) throw new Error(`Upload gagal: ${error.message}`);

  const { data: publicUrl } = client.storage.from('uploads').getPublicUrl(path);
  return publicUrl.publicUrl;
}

/** Result row for a generated certificate. */
export interface GenerateResult {
  name: string;
  url: string;
  rank: string;
}

/**
 * Generate & upload certificate(s) for a single registration.
 * - Individual: one PDF, participantName = fullName.
 * - Team: one PDF per member listed in `members`, participantName = member name.
 * Always appends the new cert(s) to `registrations.certificates` and updates
 * `certificateSent` / `certificateGeneratedAt`.
 *
 * @param memberName  When set (team context), overrides participantName with this member's name.
 */
async function generateAndUploadForRegistration(
  reg: typeof registrations.$inferSelect,
  comp: typeof competitions.$inferSelect,
  template: { templateImageUrl: string; textOverlays: unknown },
  rank: string,
): Promise<GenerateResult[]> {
  const overlays = (template.textOverlays as unknown as TextOverlayField[]) || [];
  const isTeam = reg.type === 'team';
  const members = isTeam && reg.leaderName
    ? [reg.leaderName, ...parseTeamMembers(reg.members)]
    : parseTeamMembers(reg.members);

  const targets =
    isTeam && members.length > 0 ? members : [undefined];

  const results: GenerateResult[] = [];
  const newCerts: { name: string; url: string }[] = [];

  for (const memberName of targets) {
    const values = buildValues(reg, comp, rank, memberName);
    const pdf = await generateCertificatePdf(
      template.templateImageUrl,
      overlays,
      values,
    );

    const certName = memberName
      ? `Sertifikat ${values.rank} - ${memberName}`
      : `Sertifikat ${values.rank}`;
    const url = await uploadPdf(pdf, comp.id, rank);

    results.push({ name: certName, url, rank });
    newCerts.push({ name: certName, url });
  }

  await db
    .update(registrations)
    .set({
      certificates: [...(reg.certificates || []), ...newCerts],
      certificateSent: '1',
      certificateGeneratedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(registrations.id, reg.id));

  return results;
}

/**
 * Generate certificates for ALL winners (admin bulk generate).
 * Handles team competitions by generating one certificate per member.
 */
export async function generateAllWinnerCertificates(
  competitionId: string,
  ranks: string[] = ['1', '2', '3'],
): Promise<{ generated: number; skipped: number; errors: string[] }> {
  const compRows = await db
    .select()
    .from(competitions)
    .where(eq(competitions.id, competitionId));
  const comp = compRows[0];
  if (!comp) return { generated: 0, skipped: 0, errors: ['Lomba tidak ditemukan'] };

  // Fetch all winners for specified ranks
  const winnerRows = await db
    .select()
    .from(registrations)
    .where(
      and(
        eq(registrations.competitionId, competitionId),
        eq(registrations.isWinner, '1'),
        eq(registrations.paymentStatus, 'paid'),
      ),
    );

  const filtered = winnerRows.filter((r) => ranks.includes(r.winnerRank || ''));

  let generated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const reg of filtered) {
    const rank = reg.winnerRank || 'participant';
    const template = await templateService.getTemplateByRank(competitionId, rank);
    if (!template || !template.is_active) {
      skipped++;
      continue;
    }

    try {
      const results = await generateAndUploadForRegistration(reg, comp, template, rank);
      generated += results.length;
    } catch (err) {
      const member =
        reg.type === 'team'
          ? parseTeamMembers(reg.members).join(', ')
          : reg.fullName || reg.id;
      errors.push(
        `Gagal generate ${member} (${reg.id}): ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  // Send email notifications to winners
  await sendCertificateEmails(comp, filtered);

  return { generated, skipped, errors };
}

/**
 * Generate a single certificate for one registration (user-side on-demand).
 * Returns the generated cert(s). For team registrations, returns one entry
 * per team member.
 *
 * Only works if the registrant is an actual winner (isWinner='1' && paid).
 * If certificates already exist for this registration, returns the cached URLs.
 */
export async function generateSingleCertificate(
  registrationId: string,
  competitionId: string,
): Promise<GenerateResult[] | null> {
  const [reg] = await db
    .select()
    .from(registrations)
    .where(
      and(
        eq(registrations.id, registrationId),
        eq(registrations.competitionId, competitionId),
        eq(registrations.isWinner, '1'),
        eq(registrations.paymentStatus, 'paid'),
      ),
    );

  if (!reg) return null;

  const compRows = await db
    .select()
    .from(competitions)
    .where(eq(competitions.id, competitionId));
  const comp = compRows[0];
  if (!comp) return null;

  const rank = reg.winnerRank || 'participant';
  const template = await templateService.getTemplateByRank(competitionId, rank);
  if (!template || !template.is_active) return null;

  // If already generated, return existing (cache)
  if (reg.certificates && reg.certificates.length > 0) {
    return reg.certificates.map((c) => ({
      name: c.name,
      url: c.url,
      rank,
    }));
  }

  return generateAndUploadForRegistration(reg, comp, template, rank);
}

async function sendCertificateEmails(
  comp: typeof competitions.$inferSelect,
  winners: typeof registrations.$inferSelect[],
) {
  for (const reg of winners) {
    if (!reg.certificates || reg.certificates.length === 0) continue;
    if (!reg.email) continue;

    const participantName = reg.fullName || reg.teamName || reg.leaderName || 'Peserta';
    const rank = reg.winnerRank ? `Juara ${reg.winnerRank}` : 'Peserta';

    const certLinks = reg.certificates
      .map((c) => {
        const href = c.url?.startsWith('http')
          ? c.url
          : `${process.env.NEXT_PUBLIC_BASE_URL || 'https://astro2026.example.com'}${c.url}`;
        return `<tr><td style="padding: 6px 0; color: #64748b; font-size: 13px;">${c.name}</td>
          <td style="padding: 6px 0; text-align: right;">
            <a href="${href}" style="display: inline-block; padding: 8px 20px; background: #06b6d4; color: #0f172a; text-decoration: none; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; clip-path: polygon(5px 0, 100% 0, calc(100% - 5px) 100%, 0 100%);">
              Download
            </a>
          </td></tr>`;
      })
      .join('');

    try {
      await resend.emails.send({
        from: 'ASTRO 2026 <noreply@mailer.kta.blue>',
        to: reg.email,
        subject: `Sertifikat - ${comp.title} | ASTRO 2026`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #f8fafc; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <img src="https://abhshprulipnmetfumrt.supabase.co/storage/v1/object/public/assets/logo-astro.png" alt="ASTRO" style="height: 48px;" />
            </div>
            <h1 style="font-size: 20px; font-weight: 900; color: #0f172a; text-align: center; text-transform: uppercase; letter-spacing: 0.02em; margin-bottom: 8px;">
              Sertifikat ASTRO 2026
            </h1>
            <p style="font-size: 14px; color: #64748b; text-align: center; margin-bottom: 24px;">
              Berikut adalah sertifikat untuk ${participantName} di ${comp.title}. (${rank})
            </p>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px;">
              <table style="width: 100%; font-size: 14px; color: #0f172a;">
                <tr><td style="padding: 4px 0; color: #64748b;">Tim / Peserta</td><td style="padding: 4px 0; font-weight: 700;">${participantName}</td></tr>
                <tr><td style="padding: 4px 0; color: #64748b;">Lomba</td><td style="padding: 4px 0; font-weight: 700;">${comp.title}</td></tr>
                <tr><td style="padding: 4px 0; color: #64748b;">Status</td><td style="padding: 4px 0; font-weight: 700;">${rank}</td></tr>
              </table>
            </div>
            <h3 style="font-size: 13px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 12px;">
              Sertifikat Anda
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${certLinks}
            </table>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 11px; color: #cbd5e1; text-align: center;">
              ASTRO 2026 — Ajang Lomba Pelajar Tingkat Nasional
            </p>
          </div>
        `,
      });
    } catch (err) {
      console.error('Failed to send certificate email:', err);
    }
  }
}
