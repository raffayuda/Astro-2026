'use client';

import { useRef, useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { FileUp, UploadCloud, Loader2, Check, X, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { apiHelpers } from '@/src/lib/api';

/** Satu baris hasil parse — dinormalisasi dari kolom Google Forms. */
interface ParsedRow {
  name: string;
  role: string;
  division: string;
  image: string;
  isLeader: boolean;
  studyProgram: string | null;
  batch: string | null;
}

interface ImportResult {
  count: number;
}

/** Ambil file ID dari berbagai bentuk link Google Drive. */
export function extractDriveId(value: string): string | null {
  const v = value.trim();
  // drive.google.com/file/d/<ID>/view?usp=sharing | drive.google.com/open?id=<ID> | drive.google.com/uc?id=<ID>
  const fileMatch = v.match(/\/file\/d\/([A-Za-z0-9_-]{10,})/);
  if (fileMatch) return fileMatch[1];
  const idMatch = v.match(/[?&]id=([A-Za-z0-9_-]{10,})/);
  if (idMatch) return idMatch[1];
  // drive.google.com/drive/folders/<ID>
  const folderMatch = v.match(/\/drive\/folders\/([A-Za-z0-9_-]{10,})/);
  if (folderMatch) return folderMatch[1];
  // docs.google.com/…/d/<ID>/…
  const docMatch = v.match(/docs\.google\.com\/\w+\/d\/([A-Za-z0-9_-]{10,})/);
  if (docMatch) return docMatch[1];
  // String {id} mentah
  if (/^[A-Za-z0-9_-]{10,}$/.test(v)) return v;
  return null;
}

/** Ubah link Google Drive menjadi URL gambar yang bisa ditampilkan (lh3, tanpa redirect). */
export function toDriveImageUrl(value: string): string {
  const id = extractDriveId(value);
  if (!id) return '';
  return `https://lh3.googleusercontent.com/d/${id}=w1000`;
}

/** Normalisasi URL gambar: link Drive → URL gambar; legacy /uploads/ → storage; selain itu dibiarkan. */
export function normalizeImageUrl(url: string): string {
  if (!url) return '';
  // Idempotent: URL lh3 yang sudah dikonversi sebelumnya tidak dikonversi ulang.
  if (url.startsWith('https://lh3.googleusercontent.com/d/')) return url;
  const drive = toDriveImageUrl(url);
  if (drive) return drive;
  // Legacy local-fs paths (pre-Supabase) now live in the public uploads bucket.
  if (url.startsWith('/uploads/')) {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://abhshprulipnmetfumrt.supabase.co';
    return `${base}/storage/v1/object/public/uploads/${url.slice('/uploads/'.length)}`;
  }
  return url;
}

export default function ImportCommittee({ onImported }: { onImported?: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[] | null>(null);
  const [fileName, setFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [skipped, setSkipped] = useState(0);

  /** Deteksi & baca file: .csv lewat Papa, .xlsx/.xls lewat SheetJS. */
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setFileName(file.name);
    setImportedCount(null);

    const isXlsx = /\.(xlsx|xls)$/i.test(file.name);

    let raw: Record<string, unknown>[] = [];
    try {
      if (isXlsx) {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
      } else {
        const text = await file.text();
        const parsed = Papa.parse<Record<string, unknown>>(text, {
          header: true,
          skipEmptyLines: 'greedy',
        });
        raw = parsed.data;
      }
    } catch {
      toast.error('Gagal membaca file. Pastikan format CSV atau Excel.');
      return;
    }

    const normalized = normalize(raw);
    setSkipped(raw.length - normalized.length);
    setRows(normalized);
    if (normalized.length === 0) {
      toast.error('Tidak ada baris valid di file ini.');
    }
  };

  /** Peta kolom nama → field, abaikan kolom yang tidak dikenal (NIM, TTD, dll). */
  function normalize(raw: Record<string, unknown>[]): ParsedRow[] {
    const out: ParsedRow[] = [];
    const seen = new Set<string>();
    for (const r of raw) {
      const get = (keys: string[]) => {
        for (const k of keys) {
          if (r[k] !== undefined && String(r[k]).trim() !== '') {
            return String(r[k]).trim();
          }
        }
        return '';
      };

      const name = get(['name', 'Nama lengkap :', 'Nama lengkap', 'name lengkap', 'Nama']);
      const role = get(['role', 'Jabatan :', 'Jabatan', 'Tipe']);
      const division = get(['division', 'Divisi :', 'Divisi']);
      const imageRaw = get(['image', 'upload foto terbaik mu', 'upload foto terbaik', 'Foto', 'image url']);
      const studyProgram = get(['studyProgram', 'PRODI :', 'PRODI', 'Prodi', 'prodi']) || null;
      const batch = get(['batch', 'Angkatan']) || null;

      if (!name || !role || !division) continue;
      if (seen.has(name)) continue; // hapus baris ganda dari file

      seen.add(name);
      out.push({
        name,
        role,
        division,
        image: toDriveImageUrl(imageRaw),
        isLeader: false,
        studyProgram,
        batch,
      });
    }
    return out;
  }

  const handleImport = async () => {
    if (!rows || rows.length === 0) return;
    setImporting(true);
    try {
      const res = (await apiHelpers.committeeMembers.importRows(rows)) as ImportResult;
      setImportedCount(res.count);
      toast.success(`${res.count} anggota berhasil diimport`);
      setRows(null);
      setFileName('');
      onImported?.();
    } catch {
      toast.error('Gagal import. Cek kembali isi file.');
    } finally {
      setImporting(false);
    }
  };

  const groupByDivision = (() => {
    if (!rows) return {};
    return rows.reduce<Record<string, number>>((acc, r) => {
      acc[r.division] = (acc[r.division] || 0) + 1;
      return acc;
    }, {});
  })();

  return (
    <div className="space-y-4">
      {/* Dropzone / pilih file */}
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 px-6 py-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/60">
        <FileUp className="size-8 text-muted-foreground" />
        <span className="text-sm font-bold text-foreground">
          {fileName || 'Pilih file CSV / Excel panitia'}
        </span>
        <span className="text-[11px] text-muted-foreground">
          Format Google Forms (kolom: Nama lengkap, PRODI, Angkatan, Jabatan, Divisi, upload foto). NIM &amp; TTD dilewati otomatis.
        </span>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={handleFile}
        />
      </label>

      {/* Hasil parse */}
      {rows && rows.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <FileSpreadsheet className="size-4 text-primary" />
              {rows.length} anggota siap diimport
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleImport}
                disabled={importing}
                className="clip-angled-sm gap-1 text-xs font-bold uppercase tracking-wider"
              >
                {importing ? <Loader2 className="size-3 animate-spin" /> : <UploadCloud className="size-3" />}
                {importing ? 'Mengimport...' : 'Import Sekarang'}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setRows(null); setFileName(''); }}
                className="clip-angled-sm gap-1 text-xs font-bold uppercase tracking-wider"
              >
                <X className="size-3" /> Batal
              </Button>
            </div>
          </div>

          {skipped > 0 && (
            <p className="flex items-center gap-1.5 text-[11px] text-amber-600">
              <AlertTriangle className="size-3.5" />
              {skipped} baris dilewati (duplikat atau data tidak lengkap).
            </p>
          )}

          {/* Ringkasan divisi */}
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(groupByDivision).map(([div, count]) => (
              <Badge key={div} variant="secondary" className="clip-angled-sm gap-1 px-2.5 py-1 text-[10px] font-bold">
                {div} · {count}
              </Badge>
            ))}
          </div>

          {/* Preview 5 baris */}
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Nama</th>
                  <th className="px-3 py-2">Jabatan</th>
                  <th className="px-3 py-2">Divisi</th>
                  <th className="px-3 py-2">Prodi / Angkatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.slice(0, 5).map((r, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 font-semibold text-foreground">{r.name}</td>
                    <td className="px-3 py-2">
                      <Badge className={cn(
                        'clip-angled-sm text-[9px] font-bold uppercase',
                        r.role.toUpperCase() === 'SC' || r.role.toUpperCase() === 'PO' || r.role.toUpperCase() === 'PI'
                          ? 'bg-cyan-100 text-cyan-800'
                          : 'bg-muted text-muted-foreground'
                      )}>{r.role}</Badge>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{r.division}</td>
                    <td className="px-3 py-2 text-muted-foreground">{[r.studyProgram, r.batch].filter(Boolean).join(' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 5 && (
              <div className="border-t border-border bg-muted/30 px-3 py-1.5 text-[10px] text-muted-foreground">
                … dan {rows.length - 5} lainnya
              </div>
            )}
          </div>
        </div>
      )}

      {importedCount !== null && rows === null && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">
          <Check className="size-4" /> {importedCount} anggota berhasil diimport ke committee.
        </div>
      )}
    </div>
  );
}
