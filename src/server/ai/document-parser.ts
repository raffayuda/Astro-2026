import * as XLSX from "xlsx";
import Papa from "papaparse";

export interface ParsedDocumentResult {
  fileName: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  charCount: number;
  extractedText: string;
  previewSnippet: string;
  pageOrSheetCount?: number;
  isImage: boolean;
  imageBase64?: string;
  truncated: boolean;
}

export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB
export const MAX_EXTRACTED_CHARS = 35000; // 35k chars safe context window limit

export const SUPPORTED_FILE_EXTENSIONS = [
  ".md",
  ".markdown",
  ".pdf",
  ".docx",
  ".xlsx",
  ".xls",
  ".csv",
  ".txt",
  ".json",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
];

/**
 * Parses uploaded documents (Markdown, PDF, Word, Excel, CSV, Text, Image)
 * and extracts clean structured text or multimodal data for ASTRO Copilot.
 */
export async function parseUploadedDocument(
  file: File | Blob,
  fileName: string,
): Promise<ParsedDocumentResult> {
  const fileSize = file.size;
  if (fileSize > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `Ukuran berkas (${Math.round(fileSize / 1024 / 1024)} MB) melebihi batas maksimal 15 MB.`,
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
  const mimeType = file.type || getMimeTypeFromExt(ext);

  let extractedText = "";
  let pageOrSheetCount = 1;
  let isImage = false;
  let imageBase64: string | undefined;

  // ─── 1. Markdown & Text Formats (.md, .markdown, .txt, .json, .rst) ───
  if (ext === ".md" || ext === ".markdown" || ext === ".txt" || ext === ".json" || ext === ".rst") {
    extractedText = buffer.toString("utf-8");
  }

  // ─── 2. PDF Documents (.pdf) ───
  else if (ext === ".pdf" || mimeType.includes("pdf")) {
    try {
      // Dynamic import to avoid bundling issues in edge/serverless if any
      const pdfParse = require("pdf-parse");
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text || "";
      pageOrSheetCount = pdfData.numpages || 1;
    } catch (err: unknown) {
      console.error("[document-parser] PDF extraction error:", err);
      throw new Error("Gagal membaca teks dari berkas PDF. Pastikan PDF tidak terkunci/terproteksi password.");
    }
  }

  // ─── 3. Microsoft Word Documents (.docx) ───
  else if (ext === ".docx" || mimeType.includes("wordprocessingml")) {
    try {
      const mammoth = require("mammoth");
      const docxData = await mammoth.extractRawText({ buffer });
      extractedText = docxData.value || "";
    } catch (err: unknown) {
      console.error("[document-parser] DOCX extraction error:", err);
      throw new Error("Gagal membaca berkas Word (.docx). Pastikan berkas tidak korup.");
    }
  }

  // ─── 4. Excel Spreadsheets (.xlsx, .xls) ───
  else if (ext === ".xlsx" || ext === ".xls" || mimeType.includes("spreadsheet") || mimeType.includes("excel")) {
    try {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetNames = workbook.SheetNames || [];
      pageOrSheetCount = sheetNames.length;

      const sheetsText: string[] = [];
      for (const name of sheetNames) {
        const sheet = workbook.Sheets[name];
        if (!sheet) continue;
        const csv = XLSX.utils.sheet_to_csv(sheet);
        if (csv && csv.trim()) {
          sheetsText.push(`### Sheet: ${name}\n\`\`\`csv\n${csv.trim()}\n\`\`\``);
        }
      }
      extractedText = sheetsText.join("\n\n");
    } catch (err: unknown) {
      console.error("[document-parser] Excel extraction error:", err);
      throw new Error("Gagal membaca berkas Excel. Pastikan format tabel sesuai.");
    }
  }

  // ─── 5. CSV Files (.csv) ───
  else if (ext === ".csv" || mimeType.includes("csv")) {
    try {
      const rawCsv = buffer.toString("utf-8");
      const parsed = Papa.parse<string[]>(rawCsv, { skipEmptyLines: true });
      if (parsed.data && parsed.data.length > 0) {
        // Format rows into a clean markdown table if under 200 rows, otherwise keep CSV snippet
        if (parsed.data.length <= 150) {
          const headers = parsed.data[0];
          const rows = parsed.data.slice(1);
          const headerLine = `| ${headers.map((h) => h.trim()).join(" | ")} |`;
          const sepLine = `| ${headers.map(() => "---").join(" | ")} |`;
          const rowLines = rows.map((r) => `| ${r.map((c) => (c || "").trim()).join(" | ")} |`).join("\n");
          extractedText = `${headerLine}\n${sepLine}\n${rowLines}`;
        } else {
          extractedText = rawCsv;
        }
      } else {
        extractedText = rawCsv;
      }
    } catch (err: unknown) {
      console.error("[document-parser] CSV extraction error:", err);
      extractedText = buffer.toString("utf-8");
    }
  }

  // ─── 6. Images (.png, .jpg, .jpeg, .webp) ───
  else if (
    ext === ".png" ||
    ext === ".jpg" ||
    ext === ".jpeg" ||
    ext === ".webp" ||
    mimeType.startsWith("image/")
  ) {
    isImage = true;
    const base64 = buffer.toString("base64");
    imageBase64 = `data:${mimeType};base64,${base64}`;
    extractedText = `[Gambar Berkas Terlampir: ${fileName} (${Math.round(fileSize / 1024)} KB)]`;
  } else {
    throw new Error(
      `Format berkas '${ext}' tidak didukung. Format yang didukung: ${SUPPORTED_FILE_EXTENSIONS.join(", ")}`,
    );
  }

  // ─── 7. Safe Truncation & Preview Snippet ───
  let truncated = false;
  if (extractedText.length > MAX_EXTRACTED_CHARS) {
    extractedText =
      extractedText.slice(0, MAX_EXTRACTED_CHARS) +
      `\n\n[...Konten dokumen dipotong karena telah mencapai batas maksimal ${MAX_EXTRACTED_CHARS.toLocaleString(
        "id-ID",
      )} karakter...]`;
    truncated = true;
  }

  // Generate 200-char preview snippet
  const previewSnippet = extractedText.replace(/\s+/g, " ").trim().slice(0, 200);

  return {
    fileName,
    fileType: ext.replace(/^\./, "").toLowerCase() || "file",
    mimeType,
    fileSize,
    charCount: extractedText.length,
    extractedText,
    previewSnippet,
    pageOrSheetCount,
    isImage,
    imageBase64,
    truncated,
  };
}

function getMimeTypeFromExt(ext: string): string {
  switch (ext) {
    case ".md":
    case ".markdown":
      return "text/markdown";
    case ".pdf":
      return "application/pdf";
    case ".docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case ".xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case ".xls":
      return "application/vnd.ms-excel";
    case ".csv":
      return "text/csv";
    case ".json":
      return "application/json";
    case ".txt":
      return "text/plain";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}
