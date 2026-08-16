'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, X, Check, Trash2, ImagePlus, Link2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import DeleteModal from '@/components/DeleteModal';
import Pagination from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import ImagePreviewModal from '@/components/ImagePreviewModal';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { useJourneys, useJourneyPhotos, queryKeys } from '@/src/lib/hooks/use-queries';
import { apiHelpers } from '@/src/lib/api';
import { normalizeImageUrl } from '@/components/ImportCommittee';

interface Journey {
  id: string;
  year: string | null;
  theme: string;
  participants: number | null;
  date: string | null;
  competitionsCount: number | null;
  achievement: string | null;
  description: string | null;
  highlights: string[] | null;
  isActive: string | null;
  sortOrder: number | null;
  createdAt: Date;
}

interface JourneyPhoto {
  id: number;
  journeyId: string;
  url: string;
  caption: string | null;
  sortOrder: number | null;
  createdAt: Date;
}

const PAGE_SIZE = 10;

export default function JourneyPage() {
  const qc = useQueryClient();
  const { data: itemsData, isLoading: loading } = useJourneys();
  const items = itemsData ?? [];
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  const [form, setForm] = useState({
    year: '', theme: '', participants: 0, date: '',
    competitionsCount: 0, achievement: '', description: '', highlights: '',
    sortOrder: 0,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.journeys.all });

  const saveMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      editingId
        ? apiHelpers.journeys.update(editingId, body)
        : apiHelpers.journeys.create(body),
    onSuccess: () => {
      setForm({ year: '', theme: '', participants: 0, date: '', competitionsCount: 0, achievement: '', description: '', highlights: '', sortOrder: 0 });
      setEditingId(null); setShowAdd(false);
      toast.success(editingId ? 'Journey diperbarui' : 'Journey ditambahkan');
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiHelpers.journeys.remove(id),
    onSuccess: () => { toast.success('Journey dihapus'); setDeleteModal(null); invalidate(); },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleEdit = (item: Journey) => {
    setForm({
      year: item.year || item.id,
      theme: item.theme,
      participants: item.participants || 0,
      date: item.date || '',
      competitionsCount: item.competitionsCount || 0,
      achievement: item.achievement || '',
      description: item.description || '',
      highlights: item.highlights?.join('\n') || '',
      sortOrder: item.sortOrder || 0,
    });
    setEditingId(item.id);
    setShowAdd(true);
  };

  const handleSave = async () => {
    if (!form.year || !form.theme) { toast.error('Tahun dan tema wajib diisi'); return; }
    setSaving(true);
    try {
      const body = {
        year: form.year,
        theme: form.theme,
        participants: Number(form.participants),
        date: form.date,
        competitionsCount: Number(form.competitionsCount),
        achievement: form.achievement,
        description: form.description,
        sortOrder: Number(form.sortOrder),
        highlights: form.highlights.split('\n').filter(s => s.trim()),
      };
      await saveMutation.mutateAsync(body);
    } catch { toast.error('Gagal menyimpan'); }
    setSaving(false);
  };

  const handleDelete = (id: string, theme: string) => {
    setDeleteModal({
      title: 'Hapus Journey', message: 'Yakin ingin menghapus "' + theme + '"?',
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id);
      },
    });
  };

  const paginated = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <div className="flex justify-center py-20"><Spinner className="size-6 text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">Journey</h1>
          <p className="mt-1 text-sm font-light text-muted-foreground">{items.length} perjalanan</p>
        </div>
        <Button onClick={() => { setShowAdd(!showAdd); setEditingId(null); setForm({ year: '', theme: '', participants: 0, date: '', competitionsCount: 0, achievement: '', description: '', highlights: '', sortOrder: 0 }); }}
          className="clip-angled text-xs font-bold uppercase tracking-wider">
          <Plus data-icon="inline-start" /> Tambah Journey
        </Button>
      </div>

      {showAdd && (
        <Card className="clip-angled relative border-border">
          <div className="absolute -top-px -left-px size-8 bg-primary" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
          <CardContent className="space-y-4 p-5">
            <h2 className="text-sm font-black uppercase tracking-tight text-foreground">{editingId ? 'Edit' : 'Tambah'} Journey</h2>
            <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field>
                <FieldLabel required>Tahun</FieldLabel>
                <Input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2024" />
              </Field>
              <Field>
                <FieldLabel required>Tema</FieldLabel>
                <Input value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} placeholder="Tema" />
              </Field>
              <Field>
                <FieldLabel>Sort Order</FieldLabel>
                <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
              </Field>
              <Field>
                <FieldLabel>Peserta</FieldLabel>
                <Input type="number" value={form.participants} onChange={(e) => setForm({ ...form, participants: Number(e.target.value) })} />
              </Field>
              <Field>
                <FieldLabel>Hari Pelaksanaan</FieldLabel>
                <Input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="22 - 24 Agustus 2026" />
              </Field>
              <Field>
                <FieldLabel>Cabang Lomba</FieldLabel>
                <Input type="number" value={form.competitionsCount} onChange={(e) => setForm({ ...form, competitionsCount: Number(e.target.value) })} />
              </Field>
              <Field className="sm:col-span-3">
                <FieldLabel>Pencapaian</FieldLabel>
                <Input value={form.achievement} onChange={(e) => setForm({ ...form, achievement: e.target.value })} placeholder="Pencapaian" />
              </Field>
              <Field className="sm:col-span-3">
                <FieldLabel>Deskripsi</FieldLabel>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </Field>
              <Field className="sm:col-span-3">
                <FieldLabel>Highlights (1 baris = 1 highlight)</FieldLabel>
                <Textarea value={form.highlights} onChange={(e) => setForm({ ...form, highlights: e.target.value })} rows={3} />
              </Field>
            </FieldGroup>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving} className="clip-angled-sm gap-1 text-xs font-bold uppercase tracking-wider">
                {saving ? <Spinner data-icon="inline-start" /> : <Check data-icon="inline-start" />} Simpan
              </Button>
              <Button variant="outline" className="clip-angled-sm gap-1 text-xs font-bold uppercase tracking-wider"
                onClick={() => { setShowAdd(false); setEditingId(null); setForm({ year: '', theme: '', participants: 0, date: '', competitionsCount: 0, achievement: '', description: '', highlights: '', sortOrder: 0 }); }}>
                <X data-icon="inline-start" /> Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-3">
        {paginated.map((item) => (
          <Card key={item.id} className="clip-angled group relative overflow-hidden border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md">
            <div className="absolute -top-px -left-px size-6 bg-primary/20 transition-colors group-hover:bg-primary" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
            <CardContent className="flex items-center justify-between gap-4 p-0">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="clip-angled-sm bg-muted px-2.5 py-1 text-xs font-black text-foreground">{item.year || item.id}</Badge>
                <span className="text-sm font-bold text-foreground">{item.theme}</span>
                <span className="text-[11px] text-muted-foreground">{item.participants} peserta</span>
              </div>
              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(item)} aria-label="Edit"><Pencil /></Button>
                <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(item.id, item.theme)} aria-label="Hapus" className="text-muted-foreground hover:text-destructive"><Trash2 /></Button>
              </div>
            </CardContent>
            <JourneyPhotoManager journey={item} />
          </Card>
        ))}
        {items.length === 0 && <p className="py-4 text-center text-sm italic text-muted-foreground">Belum ada data journey.</p>}
      </div>
      <Pagination currentPage={page} totalItems={items.length} pageSize={PAGE_SIZE} onPageChange={setPage} />

      <DeleteModal open={!!deleteModal} title={deleteModal?.title || ''} message={deleteModal?.message || ''}
        onConfirm={deleteModal?.onConfirm || (() => {})} onCancel={() => setDeleteModal(null)} loading={false} />
    </div>
  );
}

/* ─── Neutral uploader for a single journey's documentation photos ─── */
function JourneyPhotoManager({ journey }: { journey: Journey }) {
  const qc = useQueryClient();
  const { data: photosData, isLoading: loading } = useJourneyPhotos(journey.id);
  const photos: JourneyPhoto[] = photosData ?? [];
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [caption, setCaption] = useState('');
  const [url, setUrl] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: queryKeys.journeyPhotos.list(journey.id) });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    try {
      const uploadRes = await apiHelpers.upload(file);
      const url = (uploadRes as { url?: string })?.url;
      if (!url) {
        toast.error('Gagal upload gambar');
        return;
      }
      await apiHelpers.journeyPhotos.create({
        journeyId: journey.id,
        url,
        caption: caption.trim() || null,
      });
      setCaption('');
      toast.success('Foto dokumentasi ditambahkan');
      invalidate();
    } catch {
      toast.error('Upload gagal');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await apiHelpers.journeyPhotos.remove(id);
      toast.success('Foto dihapus');
      invalidate();
    } catch {
      toast.error('Gagal menghapus foto');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddByUrl = async () => {
    const clean = normalizeImageUrl(url.trim());
    if (!clean) {
      toast.error('Masukkan URL gambar atau link Google Drive');
      return;
    }
    try {
      await apiHelpers.journeyPhotos.create({
        journeyId: journey.id,
        url: clean,
        caption: caption.trim() || null,
      });
      setUrl('');
      setCaption('');
      toast.success('Foto dokumentasi ditambahkan');
      invalidate();
    } catch {
      toast.error('Gagal menambahkan foto');
    }
  };

  return (
    <div className="mt-2 border-t border-border pt-2">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Keterangan foto (opsional)..."
          className="min-w-0 basis-40 flex-1 bg-background"
        />
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAddByUrl(); }}
          placeholder="URL Google Drive / link gambar langsung..."
          className="min-w-0 basis-64 flex-1 bg-background"
        />
        <label className="flex-shrink-0 cursor-pointer">
          <Button asChild size="sm" variant="outline" disabled={uploading}
            className="clip-angled-sm gap-1 text-[10px] font-bold uppercase tracking-wider">
            <span>
              {uploading ? <Loader2 className="size-3 animate-spin" /> : <ImagePlus className="size-3" />}
              {uploading ? 'Mengunggah...' : 'Upload Foto'}
            </span>
          </Button>
          <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleUpload} />
        </label>
      </div>
      <button
        onClick={handleAddByUrl}
        className="clip-angled-sm mt-2 inline-flex items-center gap-1.5 border border-border bg-muted px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Link2 className="size-3" /> Tambah dari URL
      </button>

      {loading ? (
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3 animate-spin" /> Memuat foto...
        </div>
      ) : photos.length > 0 ? (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {photos.map((p) => (
            <div key={p.id} className="clip-angled-sm group relative aspect-[4/3] overflow-hidden border border-border bg-muted">
              <button
                type="button"
                onClick={() => setPreviewImage(p.url)}
                className="size-full overflow-hidden transition-opacity hover:opacity-80"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={normalizeImageUrl(p.url)} alt={p.caption || 'Foto dokumentasi'} className="size-full object-cover" />
              </button>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
                <Button size="icon-xs" variant="outline" disabled={deletingId === p.id}
                  onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} aria-label="Hapus foto"
                  className="size-6 border-red-300 bg-white/90 text-red-600 hover:bg-red-50 pointer-events-auto">
                  {deletingId === p.id ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-[11px] text-muted-foreground">Belum ada foto dokumentasi. Upload untuk menambahkan.</p>
      )}
      <ImagePreviewModal url={previewImage} onClose={() => setPreviewImage(null)} />
    </div>
  );
}
