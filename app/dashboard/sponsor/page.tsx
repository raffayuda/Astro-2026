'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { Plus, Pencil, Check, Trash2, Star, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import DeleteModal from '@/components/DeleteModal';
import Pagination from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import ImagePreviewModal from '@/components/ImagePreviewModal';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSponsors, useMediaPartners, queryKeys } from '@/src/lib/hooks/use-queries';
import { apiHelpers } from '@/src/lib/api';
import { cn } from '@/lib/utils';

interface Sponsor {
  id: number;
  name: string;
  tier: string;
  website: string | null;
  logo?: string | null;
}
interface MediaPartner {
  id: number;
  name: string;
  website: string | null;
  logo?: string | null;
}

const PAGE_SIZE = 10;

export default function SponsorPage() {
  const qc = useQueryClient();
  const { data: sponsorsData, isLoading: loading } = useSponsors();
  const { data: mediaPartnersData } = useMediaPartners();
  const sponsors = sponsorsData ?? [];
  const mediaPartners = mediaPartnersData ?? [];
  const [tab, setTab] = useState<'sponsor' | 'media-partner'>('sponsor');
  const [spPage, setSpPage] = useState(1);
  const [mpPage, setMpPage] = useState(1);

  const [spForm, setSpForm] = useState({ name: '', website: '', logo: '', tier: 'gold' });
  const [spEditingId, setSpEditingId] = useState<number | null>(null);
  const [spSaving, setSpSaving] = useState(false);
  const [showSpAdd, setShowSpAdd] = useState(false);
  const [mpForm, setMpForm] = useState({ name: '', website: '', logo: '' });
  const [mpEditingId, setMpEditingId] = useState<number | null>(null);
  const [mpSaving, setMpSaving] = useState(false);
  const [showMpAdd, setShowMpAdd] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
  const [spUploading, setSpUploading] = useState(false);
  const [mpUploading, setMpUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: queryKeys.sponsors.all });
    qc.invalidateQueries({ queryKey: queryKeys.mediaPartners.all });
  };

  const spSaveMutation = useMutation({
    mutationFn: (body: typeof spForm) =>
      spEditingId
        ? apiHelpers.sponsors.update(String(spEditingId), body)
        : apiHelpers.sponsors.create(body),
    onSuccess: () => {
      setSpForm({ name: '', website: '', logo: '', tier: 'gold' });
      setSpEditingId(null); setShowSpAdd(false);
      toast.success(spEditingId ? 'Sponsor diperbarui' : 'Sponsor ditambahkan');
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const spDeleteMutation = useMutation({
    mutationFn: (id: number) => apiHelpers.sponsors.remove(String(id)),
    onSuccess: () => { toast.success('Sponsor dihapus'); setDeleteModal(null); invalidate(); },
    onError: (err: Error) => toast.error(err.message),
  });

  const mpSaveMutation = useMutation({
    mutationFn: (body: typeof mpForm) =>
      mpEditingId
        ? apiHelpers.mediaPartners.update(String(mpEditingId), body)
        : apiHelpers.mediaPartners.create(body),
    onSuccess: () => {
      setMpForm({ name: '', website: '', logo: '' });
      setMpEditingId(null); setShowMpAdd(false);
      toast.success(mpEditingId ? 'Media partner diperbarui' : 'Media partner ditambahkan');
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const mpDeleteMutation = useMutation({
    mutationFn: (id: number) => apiHelpers.mediaPartners.remove(String(id)),
    onSuccess: () => { toast.success('Media partner dihapus'); setDeleteModal(null); invalidate(); },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSpSave = async () => {
    if (!spForm.name && !spForm.logo) { toast.error('Nama atau logo wajib diisi'); return; }
    setSpSaving(true);
    try {
      await spSaveMutation.mutateAsync(spForm);
    } catch { toast.error('Gagal menyimpan sponsor'); }
    setSpSaving(false);
  };

  const handleSpEdit = (s: Sponsor) => {
    setSpForm({ name: s.name, website: s.website || '', logo: s.logo || '', tier: (s as any).tier || 'gold' });
    setSpEditingId(s.id); setShowSpAdd(true);
  };

  const handleSpDelete = (id: number, name: string) => {
    setDeleteModal({
      title: 'Hapus Sponsor', message: 'Yakin ingin menghapus "' + name + '"?',
      onConfirm: async () => {
        await spDeleteMutation.mutateAsync(id);
      },
    });
  };

  const handleMpSave = async () => {
    if (!mpForm.name && !mpForm.logo) { toast.error('Nama atau logo wajib diisi'); return; }
    setMpSaving(true);
    try {
      await mpSaveMutation.mutateAsync(mpForm);
    } catch { toast.error('Gagal menyimpan media partner'); }
    setMpSaving(false);
  };

  const handleMpEdit = (m: MediaPartner) => {
    setMpForm({ name: m.name, website: m.website || '', logo: m.logo || '' });
    setMpEditingId(m.id); setShowMpAdd(true);
  };

  const handleMpDelete = (id: number, name: string) => {
    setDeleteModal({
      title: 'Hapus Media Partner', message: 'Yakin ingin menghapus "' + name + '"?',
      onConfirm: async () => {
        await mpDeleteMutation.mutateAsync(id);
      },
    });
  };

  const spPaginated = sponsors.slice((spPage - 1) * PAGE_SIZE, spPage * PAGE_SIZE);
  const mpPaginated = mediaPartners.slice((mpPage - 1) * PAGE_SIZE, mpPage * PAGE_SIZE);

  if (loading) return <div className="flex justify-center py-20"><Spinner className="size-6 text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">Sponsor &amp; Media Partner</h1>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => { setTab(v as 'sponsor' | 'media-partner'); setShowSpAdd(false); setShowMpAdd(false); }}>
        <TabsList className="bg-muted">
          <TabsTrigger value="sponsor" className="clip-angled-sm gap-2">
            <Star className="size-3.5" /> Sponsor ({sponsors.length})
          </TabsTrigger>
          <TabsTrigger value="media-partner" className="clip-angled-sm gap-2">
            <Share2 className="size-3.5" /> Media Partner ({mediaPartners.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Sponsor Tab */}
      {tab === 'sponsor' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{sponsors.length} sponsor</p>
            <Button
              onClick={() => { setShowSpAdd(!showSpAdd); setSpEditingId(null); setSpForm({ name: '', tier: 'gold', website: '', logo: '' }); }}
              className="clip-angled text-xs font-bold uppercase tracking-wider"
            >
              <Plus data-icon="inline-start" /> Tambah Sponsor
            </Button>
          </div>

          {showSpAdd && (
            <Card className="clip-angled relative mb-5 border-border">
              <div className="absolute -top-px -left-px size-8 bg-primary" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
              <CardContent className="space-y-4 p-5">
                <h2 className="text-sm font-black uppercase tracking-tight text-foreground">{spEditingId ? 'Edit' : 'Tambah'} Sponsor</h2>
                <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>Nama <span className="font-normal normal-case text-muted-foreground">(opsional, untuk alt text)</span></FieldLabel>
                    <Input value={spForm.name} onChange={(e) => setSpForm({ ...spForm, name: e.target.value })} placeholder="Nama sponsor" />
                  </Field>
                  <Field>
                    <FieldLabel>Website <span className="font-normal normal-case text-muted-foreground">(opsional)</span></FieldLabel>
                    <Input value={spForm.website} onChange={(e) => setSpForm({ ...spForm, website: e.target.value })} placeholder="https://..." />
                  </Field>
                  <Field>
                    <FieldLabel>Tier</FieldLabel>
                    <Select value={spForm.tier} onValueChange={(v) => setSpForm({ ...spForm, tier: v })}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="gold">Gold</SelectItem>
                          <SelectItem value="silver">Silver</SelectItem>
                          <SelectItem value="bronze">Bronze</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>Logo <span className="font-normal normal-case text-muted-foreground">(upload gambar, opsional jika ada teks nama)</span></FieldLabel>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer">
                        <span className={cn(
                          "clip-angled-sm inline-block border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
                          spUploading ? "bg-primary text-primary-foreground opacity-70 cursor-not-allowed" : "bg-muted text-muted-foreground hover:bg-accent"
                        )}>
                          {spUploading ? "Mengunggah..." : "Pilih File"}
                        </span>
                        <input type="file" accept="image/*" className="hidden" disabled={spUploading}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setSpUploading(true);
                            try {
                              const uploadRes = await apiHelpers.upload(file);
                              const url = (uploadRes as any)?.url;
                              if (url) {
                                setSpForm({ ...spForm, logo: url });
                                toast.success('File berhasil diunggah');
                              }
                            } catch (err: any) {
                              toast.error(err.message || 'Gagal mengunggah file');
                              console.error('Upload failed', err);
                            } finally {
                              setSpUploading(false);
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>
                      {spForm.logo && (
                        <span className="text-xs font-semibold text-emerald-600">File terpilih</span>
                      )}
                    </div>
                  </Field>
                </FieldGroup>

                {spForm.logo && (
                  <div className="clip-angled-sm flex items-center gap-3 border border-border bg-muted/50 p-3">
                    <button type="button" onClick={() => setPreviewImage(spForm.logo)} className="overflow-hidden rounded transition-opacity hover:opacity-80">
                      <Image src={spForm.logo} alt="Preview" width={40} height={40} unoptimized className="size-10 object-contain" />
                    </button>
                    <span className="text-xs text-muted-foreground">Preview logo</span>
                    <Button variant="ghost" size="sm" onClick={() => setSpForm({ ...spForm, logo: '' })} className="ml-auto text-xs text-destructive hover:text-destructive">
                      Hapus
                    </Button>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSpSave} disabled={spSaving} className="clip-angled-sm gap-1 text-xs font-bold uppercase tracking-wider">
                    {spSaving ? <Spinner data-icon="inline-start" /> : <Check data-icon="inline-start" />} Simpan
                  </Button>
                  <Button variant="outline" className="clip-angled-sm gap-1 text-xs font-bold uppercase tracking-wider"
                    onClick={() => { setShowSpAdd(false); setSpEditingId(null); setSpForm({ name: '', tier: 'gold', website: '', logo: '' }); }}>
                    Batal
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-3">
            {spPaginated.map((s) => (
              <Card key={s.id} className="clip-angled group relative overflow-hidden border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md">
                <div className="absolute -top-px -left-px size-6 bg-primary/20 transition-colors group-hover:bg-primary" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
                <CardContent className="flex items-center justify-between gap-4 p-0">
                  <div className="flex items-center gap-3">
                    {s.logo ? (
                      <button type="button" onClick={() => setPreviewImage(s.logo || null)} className="overflow-hidden rounded transition-opacity hover:opacity-80">
                        <Image src={s.logo} alt="" width={32} height={32} unoptimized className="size-8 object-contain" />
                      </button>
                    ) : null}
                    <span className="text-sm font-bold text-foreground">{s.name || '(tanpa nama)'}</span>
                    {s.website && <span className="hidden text-[11px] text-muted-foreground sm:block">{s.website.replace(/https?:\/\//, '')}</span>}
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="ghost" size="icon-sm" onClick={() => handleSpEdit(s)} aria-label="Edit"><Pencil /></Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleSpDelete(s.id, s.name)} aria-label="Hapus" className="text-muted-foreground hover:text-destructive"><Trash2 /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {sponsors.length === 0 && <p className="py-4 text-center text-sm italic text-muted-foreground">Belum ada sponsor.</p>}
          </div>
          <Pagination currentPage={spPage} totalItems={sponsors.length} pageSize={PAGE_SIZE} onPageChange={setSpPage} />
        </div>
      )}

      {/* Media Partner Tab */}
      {tab === 'media-partner' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{mediaPartners.length} media partner</p>
            <Button
              onClick={() => { setShowMpAdd(!showMpAdd); setMpEditingId(null); setMpForm({ name: '', website: '', logo: '' }); }}
              className="clip-angled text-xs font-bold uppercase tracking-wider"
            >
              <Plus data-icon="inline-start" /> Tambah Media Partner
            </Button>
          </div>

          {showMpAdd && (
            <Card className="clip-angled relative mb-5 border-border">
              <div className="absolute -top-px -left-px size-8 bg-primary" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
              <CardContent className="space-y-4 p-5">
                <h2 className="text-sm font-black uppercase tracking-tight text-foreground">{mpEditingId ? 'Edit' : 'Tambah'} Media Partner</h2>
                <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>Nama <span className="font-normal normal-case text-muted-foreground">(opsional, untuk alt text)</span></FieldLabel>
                    <Input value={mpForm.name} onChange={(e) => setMpForm({ ...mpForm, name: e.target.value })} placeholder="Nama" />
                  </Field>
                  <Field>
                    <FieldLabel>Website <span className="font-normal normal-case text-muted-foreground">(opsional)</span></FieldLabel>
                    <Input value={mpForm.website} onChange={(e) => setMpForm({ ...mpForm, website: e.target.value })} placeholder="https://..." />
                  </Field>
                  <Field>
                    <FieldLabel>Logo <span className="font-normal normal-case text-muted-foreground">(upload gambar, opsional jika ada teks nama)</span></FieldLabel>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer">
                        <span className={cn(
                          "clip-angled-sm inline-block border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
                          mpUploading ? "bg-primary text-primary-foreground opacity-70 cursor-not-allowed" : "bg-muted text-muted-foreground hover:bg-accent"
                        )}>
                          {mpUploading ? "Mengunggah..." : "Pilih File"}
                        </span>
                        <input type="file" accept="image/*" className="hidden" disabled={mpUploading}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setMpUploading(true);
                            try {
                              const uploadRes = await apiHelpers.upload(file);
                              const url = (uploadRes as any)?.url;
                              if (url) {
                                setMpForm({ ...mpForm, logo: url });
                                toast.success('File berhasil diunggah');
                              }
                            } catch (err: any) {
                              toast.error(err.message || 'Gagal mengunggah file');
                              console.error('Upload failed', err);
                            } finally {
                              setMpUploading(false);
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>
                      {mpForm.logo && (
                        <span className="text-xs font-semibold text-emerald-600">File terpilih</span>
                      )}
                    </div>
                  </Field>
                </FieldGroup>

                {mpForm.logo && (
                  <div className="clip-angled-sm flex items-center gap-3 border border-border bg-muted/50 p-3">
                    <button type="button" onClick={() => setPreviewImage(mpForm.logo)} className="overflow-hidden rounded transition-opacity hover:opacity-80">
                      <Image src={mpForm.logo} alt="Preview" width={40} height={40} unoptimized className="size-10 object-contain" />
                    </button>
                    <span className="text-xs text-muted-foreground">Preview logo</span>
                    <Button variant="ghost" size="sm" onClick={() => setMpForm({ ...mpForm, logo: '' })} className="ml-auto text-xs text-destructive hover:text-destructive">
                      Hapus
                    </Button>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleMpSave} disabled={mpSaving} className="clip-angled-sm gap-1 text-xs font-bold uppercase tracking-wider">
                    {mpSaving ? <Spinner data-icon="inline-start" /> : <Check data-icon="inline-start" />} Simpan
                  </Button>
                  <Button variant="outline" className="clip-angled-sm gap-1 text-xs font-bold uppercase tracking-wider"
                    onClick={() => { setShowMpAdd(false); setMpEditingId(null); setMpForm({ name: '', website: '', logo: '' }); }}>
                    Batal
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-3">
            {mpPaginated.map((m) => (
              <Card key={m.id} className="clip-angled group relative overflow-hidden border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md">
                <div className="absolute -top-px -left-px size-6 bg-primary/20 transition-colors group-hover:bg-primary" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
                <CardContent className="flex items-center justify-between gap-4 p-0">
                  <div className="flex items-center gap-3">
                    {m.logo ? (
                      <button type="button" onClick={() => setPreviewImage(m.logo || null)} className="overflow-hidden rounded transition-opacity hover:opacity-80">
                        <Image src={m.logo} alt="" width={32} height={32} unoptimized className="size-8 object-contain" />
                      </button>
                    ) : null}
                    <span className="text-sm font-bold text-foreground">{m.name || '(tanpa nama)'}</span>
                    {m.website && <span className="hidden text-[11px] text-muted-foreground sm:block">{m.website.replace(/https?:\/\//, '')}</span>}
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="ghost" size="icon-sm" onClick={() => handleMpEdit(m)} aria-label="Edit"><Pencil /></Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleMpDelete(m.id, m.name)} aria-label="Hapus" className="text-muted-foreground hover:text-destructive"><Trash2 /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {mediaPartners.length === 0 && <p className="py-4 text-center text-sm italic text-muted-foreground">Belum ada media partner.</p>}
          </div>
          <Pagination currentPage={mpPage} totalItems={mediaPartners.length} pageSize={PAGE_SIZE} onPageChange={setMpPage} />
        </div>
      )}

      <DeleteModal
        open={!!deleteModal}
        title={deleteModal?.title || ''}
        message={deleteModal?.message || ''}
        onConfirm={deleteModal?.onConfirm || (() => {})}
        onCancel={() => setDeleteModal(null)}
        loading={false}
      />
      <ImagePreviewModal url={previewImage} onClose={() => setPreviewImage(null)} />
    </div>
  );
}
