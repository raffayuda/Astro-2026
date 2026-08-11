'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { Plus, Pencil, Check, Trash2, Tag, X } from 'lucide-react';
import { toast } from 'sonner';
import DeleteModal from '@/components/DeleteModal';
import Pagination from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useGalleryPhotos, useGalleryCategories, queryKeys } from '@/src/lib/hooks/use-queries';
import { apiHelpers } from '@/src/lib/api';
import { normalizeImageUrl } from '@/components/ImportCommittee';

interface GalleryItem {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  year: string;
  likesCount: number;
  sortOrder: number | null;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const PAGE_SIZE = 10;
const YEARS = ['ASTRO 2023', 'ASTRO 2024', 'ASTRO 2025', 'ASTRO 2026'];

export default function GalleryPage() {
  const qc = useQueryClient();
  const { data: photosData, isLoading: loading } = useGalleryPhotos({ page: 1, pageSize: 100 });
  const { data: categoriesData } = useGalleryCategories();
  const items = Array.isArray(photosData) ? photosData : (photosData as any)?.data ?? [];
  const categories = categoriesData ?? [];
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
  const [showCatManager, setShowCatManager] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', slug: '' });
  const [catEditingId, setCatEditingId] = useState<number | null>(null);
  const [catSaving, setCatSaving] = useState(false);

  const [form, setForm] = useState({ title: '', category: '', imageUrl: '', year: 'ASTRO 2025', likesCount: 0, sortOrder: 0 });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: queryKeys.galleryPhotos.all });
    qc.invalidateQueries({ queryKey: queryKeys.galleryCategories.all });
  };

  const saveMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      editingId
        ? apiHelpers.galleryPhotos.update(String(editingId), body)
        : apiHelpers.galleryPhotos.create(body),
    onSuccess: () => {
      setForm({ title: '', category: categories[0]?.slug || '', imageUrl: '', year: 'ASTRO 2025', likesCount: 0, sortOrder: 0 });
      setEditingId(null); setShowAdd(false);
      toast.success(editingId ? 'Foto diperbarui' : 'Foto ditambahkan');
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiHelpers.galleryPhotos.remove(String(id)),
    onSuccess: () => { toast.success('Foto dihapus'); setDeleteModal(null); invalidate(); },
    onError: (err: Error) => toast.error(err.message),
  });

  const catSaveMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      catEditingId
        ? apiHelpers.galleryCategories.update(String(catEditingId), body)
        : apiHelpers.galleryCategories.create(body),
    onSuccess: () => {
      setCatForm({ name: '', slug: '' });
      setCatEditingId(null);
      toast.success(catEditingId ? 'Kategori diperbarui' : 'Kategori ditambahkan');
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const catDeleteMutation = useMutation({
    mutationFn: (id: number) => apiHelpers.galleryCategories.remove(String(id)),
    onSuccess: () => {
      toast.success('Kategori dihapus');
      setCatEditingId(null);
      setCatForm({ name: '', slug: '' });
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleEdit = (item: GalleryItem) => {
    setForm({ title: item.title, category: item.category, imageUrl: item.imageUrl, year: item.year, likesCount: item.likesCount, sortOrder: item.sortOrder || 0 });
    setEditingId(item.id);
    setShowAdd(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.imageUrl) { toast.error('Title dan gambar wajib diisi'); return; }
    if (!form.category) { toast.error('Kategori wajib dipilih'); return; }
    setSaving(true);
    try {
      const body = {
        ...form,
        imageUrl: normalizeImageUrl(form.imageUrl),
        likesCount: Number(form.likesCount), sortOrder: Number(form.sortOrder),
      };
      await saveMutation.mutateAsync(body);
    } catch { toast.error('Gagal menyimpan'); }
    setSaving(false);
  };

  const handleDelete = (id: number, title: string) => {
    setDeleteModal({
      title: 'Hapus Foto', message: 'Yakin ingin menghapus "' + title + '"?',
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id);
      },
    });
  };

  const handleCatSave = async () => {
    if (!catForm.name || !catForm.slug) { toast.error('Nama dan slug wajib diisi'); return; }
    setCatSaving(true);
    try {
      await catSaveMutation.mutateAsync(catForm);
    } catch { toast.error('Gagal menyimpan kategori'); }
    setCatSaving(false);
  };

  const handleCatEdit = (cat: Category) => {
    setCatForm({ name: cat.name, slug: cat.slug });
    setCatEditingId(cat.id);
  };

  const handleCatDelete = async (id: number) => {
    await catDeleteMutation.mutateAsync(id);
  };

  const paginated = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <div className="flex justify-center py-20"><Spinner className="size-6 text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">Galeri Foto</h1>
          <p className="mt-1 text-sm font-light text-muted-foreground">{items.length} foto</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setShowCatManager(!showCatManager); setShowAdd(false); }} className="clip-angled text-xs font-bold uppercase tracking-wider">
            <Tag data-icon="inline-start" /> Kelola Kategori
          </Button>
          <Button onClick={() => { setShowAdd(!showAdd); setShowCatManager(false); setEditingId(null); setForm({ title: '', category: categories[0]?.slug || '', imageUrl: '', year: 'ASTRO 2025', likesCount: 0, sortOrder: 0 }); }} className="clip-angled text-xs font-bold uppercase tracking-wider">
            <Plus data-icon="inline-start" /> Tambah Foto
          </Button>
        </div>
      </div>

      {/* Category Manager */}
      {showCatManager && (
        <Card className="clip-angled relative border-border">
          <div className="absolute -top-px -left-px size-8 bg-primary" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-tight text-foreground">Kelola Kategori Gallery</h2>
              <Button variant="ghost" size="icon-sm" onClick={() => setShowCatManager(false)} aria-label="Tutup"><X /></Button>
            </div>
            <FieldGroup className="flex items-end gap-3">
              <Field className="flex-1">
                <FieldLabel required>Nama</FieldLabel>
                <Input
                  value={catForm.name}
                  onChange={(e) => {
                    const nameVal = e.target.value;
                    setCatForm({
                      ...catForm,
                      name: nameVal,
                      slug: nameVal
                        .toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^a-z0-9-]/g, ''),
                    });
                  }}
                  placeholder="Nama kategori"
                />
              </Field>
              <Field className="flex-1">
                <FieldLabel required>Slug</FieldLabel>
                <Input value={catForm.slug} onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })} placeholder="competition" />
              </Field>
              <Button onClick={handleCatSave} disabled={catSaving} size="icon">
                {catSaving ? <Spinner className="size-4" /> : catEditingId ? <Check className="size-4" /> : <Plus className="size-4" />}
              </Button>
              {catEditingId && (
                <Button variant="outline" onClick={() => { setCatEditingId(null); setCatForm({ name: '', slug: '' }); }} className="text-xs font-bold uppercase tracking-wider">
                  Batal
                </Button>
              )}
            </FieldGroup>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Badge key={cat.id} variant="secondary" className="gap-2 border border-border px-3 py-1.5 text-xs font-bold">
                  <span>{cat.name}</span>
                  <span className="text-[10px] text-muted-foreground">({cat.slug})</span>
                  <Button variant="ghost" size="icon-xs" onClick={() => handleCatEdit(cat)} aria-label="Edit" className="ml-1 text-muted-foreground hover:text-primary"><Pencil /></Button>
                  <Button variant="ghost" size="icon-xs" onClick={() => handleCatDelete(cat.id)} aria-label="Hapus" className="text-muted-foreground hover:text-destructive"><X /></Button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showAdd && (
        <Card className="clip-angled relative border-border">
          <div className="absolute -top-px -left-px size-8 bg-primary" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
          <CardContent className="space-y-4 p-5">
            <h2 className="text-sm font-black uppercase tracking-tight text-foreground">{editingId ? 'Edit' : 'Tambah'} Foto</h2>
            <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field>
                <FieldLabel required>Judul</FieldLabel>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Judul foto" />
              </Field>
              <Field>
                <FieldLabel required>Kategori</FieldLabel>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {categories.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Tahun</FieldLabel>
                <Select value={form.year} onValueChange={(v) => setForm({ ...form, year: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
            <Field>
              <FieldLabel required>Gambar</FieldLabel>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer">
                  <span className="clip-angled-sm inline-block border border-border bg-muted px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-accent">
                    Upload File
                  </span>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const uploadRes = await apiHelpers.upload(file);
                        const url = (uploadRes as any)?.url;
                        if (url) setForm({ ...form, imageUrl: url });
                      } catch { console.error('Upload failed'); }
                    }} />
                </label>
                <span className="text-[10px] text-muted-foreground">atau</span>
                <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="URL Google Drive / link gambar langsung..." className="flex-1" />
              </div>
            </Field>
            {form.imageUrl && (
              <div className="clip-angled-sm flex items-center gap-3 border border-border bg-muted/50 p-3">
                <Image src={normalizeImageUrl(form.imageUrl)} alt="Preview" width={64} height={48} unoptimized className="size-16 object-cover" />
                <span className="text-xs text-muted-foreground">Preview</span>
                <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, imageUrl: '' })} className="ml-auto text-xs text-destructive hover:text-destructive">Hapus</Button>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving} className="clip-angled-sm gap-1 text-xs font-bold uppercase tracking-wider">
                {saving ? <Spinner data-icon="inline-start" /> : <Check data-icon="inline-start" />} Simpan
              </Button>
              <Button variant="outline" className="clip-angled-sm gap-1 text-xs font-bold uppercase tracking-wider"
                onClick={() => { setShowAdd(false); setEditingId(null); setForm({ title: '', category: categories[0]?.slug || '', imageUrl: '', year: 'ASTRO 2025', likesCount: 0, sortOrder: 0 }); }}>
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
                {item.imageUrl && <Image src={normalizeImageUrl(item.imageUrl)} alt="" width={48} height={36} unoptimized className="size-12 rounded object-cover" />}
                <div>
                  <span className="text-sm font-bold text-foreground">{item.title}</span>
                  <div className="mt-0.5 flex gap-2">
                    <span className="text-[10px] font-semibold uppercase text-muted-foreground">{item.category}</span>
                    <span className="text-[10px] text-muted-foreground/60">|</span>
                    <span className="text-[10px] text-muted-foreground">{item.year}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(item)} aria-label="Edit"><Pencil /></Button>
                <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(item.id, item.title)} aria-label="Hapus" className="text-muted-foreground hover:text-destructive"><Trash2 /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && <p className="py-4 text-center text-sm italic text-muted-foreground">Belum ada foto.</p>}
      </div>
      <Pagination currentPage={page} totalItems={items.length} pageSize={PAGE_SIZE} onPageChange={setPage} />

      <DeleteModal open={!!deleteModal} title={deleteModal?.title || ''} message={deleteModal?.message || ''}
        onConfirm={deleteModal?.onConfirm || (() => {})} onCancel={() => setDeleteModal(null)} loading={false} />
    </div>
  );
}
