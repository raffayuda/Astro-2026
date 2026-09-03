'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { Reorder } from 'framer-motion';
import { Plus, Pencil, Check, Trash2, Star, Share2, GripVertical, ArrowUpDown, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import DeleteModal from '@/components/DeleteModal';
import Pagination from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  isCurrent?: boolean;
}
interface MediaPartner {
  id: number;
  name: string;
  website: string | null;
  logo?: string | null;
  isCurrent?: boolean;
}

const PAGE_SIZE = 10;

export default function SponsorPage() {
  const qc = useQueryClient();
  const { data: sponsorsData, isLoading: loading } = useSponsors();
  const { data: mediaPartnersData } = useMediaPartners();
  const sponsors = sponsorsData ?? [];
  const mediaPartners = mediaPartnersData ?? [];
  const [tab, setTab] = useState<'sponsor' | 'media-partner'>('sponsor');
  const [spFilter, setSpFilter] = useState<'all' | 'current' | 'previous'>('all');
  const [mpFilter, setMpFilter] = useState<'all' | 'current' | 'previous'>('all');
  const [spPage, setSpPage] = useState(1);
  const [mpPage, setMpPage] = useState(1);

  const [spForm, setSpForm] = useState({ name: '', website: '', logo: '', tier: 'gold', isCurrent: false });
  const [spEditingId, setSpEditingId] = useState<number | null>(null);
  const [spSaving, setSpSaving] = useState(false);
  const [showSpAdd, setShowSpAdd] = useState(false);
  const [mpForm, setMpForm] = useState({ name: '', website: '', logo: '', isCurrent: false });
  const [mpEditingId, setMpEditingId] = useState<number | null>(null);
  const [mpSaving, setMpSaving] = useState(false);
  const [showMpAdd, setShowMpAdd] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
  const [spUploading, setSpUploading] = useState(false);
  const [mpUploading, setMpUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [showSpReorderModal, setShowSpReorderModal] = useState(false);
  const [spReorderList, setSpReorderList] = useState<Sponsor[]>([]);
  const [showMpReorderModal, setShowMpReorderModal] = useState(false);
  const [mpReorderList, setMpReorderList] = useState<MediaPartner[]>([]);

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
      setSpForm({ name: '', website: '', logo: '', tier: 'gold', isCurrent: false });
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
      setMpForm({ name: '', website: '', logo: '', isCurrent: false });
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

  const handleToggleSpCurrent = async (s: Sponsor) => {
    try {
      await apiHelpers.sponsors.update(String(s.id), { isCurrent: !s.isCurrent });
      invalidate();
      toast.success(!s.isCurrent ? `"${s.name}" dijadikan Sponsor ASTRO 2026` : `"${s.name}" dijadikan Sponsor Periode Lalu`);
    } catch {
      toast.error('Gagal mengubah status sponsor');
    }
  };

  const handleToggleMpCurrent = async (m: MediaPartner) => {
    try {
      await apiHelpers.mediaPartners.update(String(m.id), { isCurrent: !m.isCurrent });
      invalidate();
      toast.success(!m.isCurrent ? `"${m.name}" dijadikan Media Partner ASTRO 2026` : `"${m.name}" dijadikan Media Partner Periode Lalu`);
    } catch {
      toast.error('Gagal mengubah status media partner');
    }
  };

  const spReorderMutation = useMutation({
    mutationFn: (ids: number[]) => apiHelpers.sponsors.reorder(ids),
    onSuccess: () => {
      toast.success("Urutan sponsor berhasil disimpan");
      setShowSpReorderModal(false);
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const mpReorderMutation = useMutation({
    mutationFn: (ids: number[]) => apiHelpers.mediaPartners.reorder(ids),
    onSuccess: () => {
      toast.success("Urutan media partner berhasil disimpan");
      setShowMpReorderModal(false);
      invalidate();
    },
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

  const handleSpReorderSave = async () => {
    const ids = spReorderList.map((d) => d.id);
    await spReorderMutation.mutateAsync(ids);
  };

  const handleSpEdit = (s: Sponsor) => {
    setSpForm({
      name: s.name,
      website: s.website || '',
      logo: s.logo || '',
      tier: (s as any).tier || 'gold',
      isCurrent: !!s.isCurrent,
    });
    setSpEditingId(s.id);
    setShowSpAdd(true);
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

  const handleMpReorderSave = async () => {
    const ids = mpReorderList.map((d) => d.id);
    await mpReorderMutation.mutateAsync(ids);
  };

  const handleMpEdit = (m: MediaPartner) => {
    setMpForm({
      name: m.name,
      website: m.website || '',
      logo: m.logo || '',
      isCurrent: !!m.isCurrent,
    });
    setMpEditingId(m.id);
    setShowMpAdd(true);
  };

  const handleMpDelete = (id: number, name: string) => {
    setDeleteModal({
      title: 'Hapus Media Partner', message: 'Yakin ingin menghapus "' + name + '"?',
      onConfirm: async () => {
        await mpDeleteMutation.mutateAsync(id);
      },
    });
  };

  const filteredSponsors = sponsors.filter((s) => {
    if (spFilter === 'current') return !!s.isCurrent;
    if (spFilter === 'previous') return !s.isCurrent;
    return true;
  });
  const spPaginated = filteredSponsors.slice((spPage - 1) * PAGE_SIZE, spPage * PAGE_SIZE);

  const filteredMediaPartners = mediaPartners.filter((m) => {
    if (mpFilter === 'current') return !!m.isCurrent;
    if (mpFilter === 'previous') return !m.isCurrent;
    return true;
  });
  const mpPaginated = filteredMediaPartners.slice((mpPage - 1) * PAGE_SIZE, mpPage * PAGE_SIZE);

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
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">Filter:</span>
              <Button
                variant={spFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setSpFilter('all'); setSpPage(1); }}
                className="h-7 text-xs font-bold uppercase tracking-wider"
              >
                Semua ({sponsors.length})
              </Button>
              <Button
                variant={spFilter === 'current' ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setSpFilter('current'); setSpPage(1); }}
                className={cn(
                  "h-7 text-xs font-bold uppercase tracking-wider",
                  spFilter === 'current'
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                )}
              >
                ASTRO 2026 ({sponsors.filter(s => s.isCurrent).length})
              </Button>
              <Button
                variant={spFilter === 'previous' ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setSpFilter('previous'); setSpPage(1); }}
                className="h-7 text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Periode Lalu ({sponsors.filter(s => !s.isCurrent).length})
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSpReorderList([...sponsors]);
                  setShowSpReorderModal(true);
                }}
                className="clip-angled text-xs font-bold uppercase tracking-wider border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 hover:text-amber-800"
              >
                <ArrowUpDown className="size-4 mr-2" /> Atur Urutan
              </Button>
              <Button
                onClick={() => {
                  setShowSpAdd(!showSpAdd);
                  setSpEditingId(null);
                  setSpForm({ name: '', tier: 'gold', website: '', logo: '', isCurrent: spFilter === 'current' });
                }}
                className="clip-angled text-xs font-bold uppercase tracking-wider"
              >
                <Plus data-icon="inline-start" /> Tambah Sponsor
              </Button>
            </div>
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
                  <Field className="sm:col-span-2">
                    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3">
                      <div className="space-y-0.5">
                        <Label htmlFor="sp-is-current" className="text-xs font-bold uppercase tracking-wider text-foreground cursor-pointer flex items-center gap-1.5">
                          <Sparkles className="size-3.5 text-amber-500" />
                          Sponsor Event Saat Ini (ASTRO 2026)
                        </Label>
                        <p className="text-[11px] text-muted-foreground">
                          Aktifkan jika brand ini merupakan sponsor resmi ASTRO 2026 yang sedang berlangsung (tampil di halaman utama). Matikan jika merupakan sponsor periode terdahulu (portofolio).
                        </p>
                      </div>
                      <Switch
                        id="sp-is-current"
                        checked={spForm.isCurrent}
                        onCheckedChange={(checked) => setSpForm({ ...spForm, isCurrent: checked })}
                      />
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
                    onClick={() => { setShowSpAdd(false); setSpEditingId(null); setSpForm({ name: '', tier: 'gold', website: '', logo: '', isCurrent: false }); }}>
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
                    {s.isCurrent ? (
                      <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400 text-[10px] font-bold">
                        ASTRO 2026
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] font-medium text-muted-foreground">
                        Periode Lalu
                      </Badge>
                    )}
                    {s.website && <span className="hidden text-[11px] text-muted-foreground sm:block">{s.website.replace(/https?:\/\//, '')}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleToggleSpCurrent(s)}
                      title={s.isCurrent ? "Ubah ke Periode Lalu" : "Jadikan Sponsor ASTRO 2026"}
                      aria-label={s.isCurrent ? "Ubah ke Periode Lalu" : "Jadikan Sponsor ASTRO 2026"}
                      className={s.isCurrent ? "text-emerald-600 hover:text-amber-600" : "text-muted-foreground hover:text-emerald-600"}
                    >
                      <Sparkles className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleSpEdit(s)} aria-label="Edit"><Pencil /></Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleSpDelete(s.id, s.name)} aria-label="Hapus" className="text-muted-foreground hover:text-destructive"><Trash2 /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredSponsors.length === 0 && <p className="py-4 text-center text-sm italic text-muted-foreground">Tidak ada sponsor pada filter ini.</p>}
          </div>
          <Pagination currentPage={spPage} totalItems={filteredSponsors.length} pageSize={PAGE_SIZE} onPageChange={setSpPage} />
        </div>
      )}

      {/* Media Partner Tab */}
      {tab === 'media-partner' && (
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">Filter:</span>
              <Button
                variant={mpFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setMpFilter('all'); setMpPage(1); }}
                className="h-7 text-xs font-bold uppercase tracking-wider"
              >
                Semua ({mediaPartners.length})
              </Button>
              <Button
                variant={mpFilter === 'current' ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setMpFilter('current'); setMpPage(1); }}
                className={cn(
                  "h-7 text-xs font-bold uppercase tracking-wider",
                  mpFilter === 'current'
                    ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                    : "border-cyan-500/40 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/30"
                )}
              >
                ASTRO 2026 ({mediaPartners.filter(m => m.isCurrent).length})
              </Button>
              <Button
                variant={mpFilter === 'previous' ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setMpFilter('previous'); setMpPage(1); }}
                className="h-7 text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Periode Lalu ({mediaPartners.filter(m => !m.isCurrent).length})
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setMpReorderList([...mediaPartners]);
                  setShowMpReorderModal(true);
                }}
                className="clip-angled text-xs font-bold uppercase tracking-wider border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 hover:text-amber-800"
              >
                <ArrowUpDown className="size-4 mr-2" /> Atur Urutan
              </Button>
              <Button
                onClick={() => {
                  setShowMpAdd(!showMpAdd);
                  setMpEditingId(null);
                  setMpForm({ name: '', website: '', logo: '', isCurrent: mpFilter === 'current' });
                }}
                className="clip-angled text-xs font-bold uppercase tracking-wider"
              >
                <Plus data-icon="inline-start" /> Tambah Media Partner
              </Button>
            </div>
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
                  <Field className="sm:col-span-2">
                    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3">
                      <div className="space-y-0.5">
                        <Label htmlFor="mp-is-current" className="text-xs font-bold uppercase tracking-wider text-foreground cursor-pointer flex items-center gap-1.5">
                          <Sparkles className="size-3.5 text-cyan-500" />
                          Media Partner Event Saat Ini (ASTRO 2026)
                        </Label>
                        <p className="text-[11px] text-muted-foreground">
                          Aktifkan jika media ini merupakan media partner resmi ASTRO 2026 yang sedang berlangsung (tampil di halaman utama). Matikan jika merupakan mitra periode terdahulu.
                        </p>
                      </div>
                      <Switch
                        id="mp-is-current"
                        checked={mpForm.isCurrent}
                        onCheckedChange={(checked) => setMpForm({ ...mpForm, isCurrent: checked })}
                      />
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
                    onClick={() => { setShowMpAdd(false); setMpEditingId(null); setMpForm({ name: '', website: '', logo: '', isCurrent: false }); }}>
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
                    {m.isCurrent ? (
                      <Badge className="bg-cyan-500/15 text-cyan-700 border-cyan-500/30 dark:text-cyan-400 text-[10px] font-bold">
                        ASTRO 2026
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] font-medium text-muted-foreground">
                        Periode Lalu
                      </Badge>
                    )}
                    {m.website && <span className="hidden text-[11px] text-muted-foreground sm:block">{m.website.replace(/https?:\/\//, '')}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleToggleMpCurrent(m)}
                      title={m.isCurrent ? "Ubah ke Periode Lalu" : "Jadikan Media Partner ASTRO 2026"}
                      aria-label={m.isCurrent ? "Ubah ke Periode Lalu" : "Jadikan Media Partner ASTRO 2026"}
                      className={m.isCurrent ? "text-cyan-600 hover:text-amber-600" : "text-muted-foreground hover:text-cyan-600"}
                    >
                      <Sparkles className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleMpEdit(m)} aria-label="Edit"><Pencil /></Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleMpDelete(m.id, m.name)} aria-label="Hapus" className="text-muted-foreground hover:text-destructive"><Trash2 /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredMediaPartners.length === 0 && <p className="py-4 text-center text-sm italic text-muted-foreground">Tidak ada media partner pada filter ini.</p>}
          </div>
          <Pagination currentPage={mpPage} totalItems={filteredMediaPartners.length} pageSize={PAGE_SIZE} onPageChange={setMpPage} />
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

      {/* Modal Reorder Sponsor */}
      {showSpReorderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md clip-angled relative border-border shadow-2xl">
            <div className="absolute -top-px -left-px size-8 bg-amber-500" style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }} />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black uppercase tracking-tight text-foreground">
                  Urutkan Sponsor
                </h2>
                <Button variant="ghost" size="icon-sm" onClick={() => setShowSpReorderModal(false)}><X className="size-4" /></Button>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                Geser (drag & drop) item di bawah ini untuk mengatur urutan sponsor.
              </p>

              <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <Reorder.Group axis="y" values={spReorderList} onReorder={setSpReorderList} className="flex flex-col gap-2">
                  {spReorderList.map((s) => (
                    <Reorder.Item
                      key={s.id}
                      value={s}
                      className="flex items-center gap-3 rounded-md border border-border bg-card p-3 shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50"
                    >
                      <GripVertical className="size-4 text-muted-foreground" />
                      {s.logo && (
                        <Image src={s.logo} alt="" width={24} height={24} unoptimized className="size-6 object-contain" />
                      )}
                      <span className="text-sm font-bold">{s.name || '(tanpa nama)'}</span>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowSpReorderModal(false)} className="text-xs font-bold uppercase">
                  Batal
                </Button>
                <Button onClick={handleSpReorderSave} disabled={spReorderMutation.isPending} className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold uppercase gap-2">
                  {spReorderMutation.isPending ? <Spinner className="size-4 text-white" /> : <Check className="size-4" />}
                  Simpan Urutan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Reorder Media Partner */}
      {showMpReorderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md clip-angled relative border-border shadow-2xl">
            <div className="absolute -top-px -left-px size-8 bg-amber-500" style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }} />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black uppercase tracking-tight text-foreground">
                  Urutkan Media Partner
                </h2>
                <Button variant="ghost" size="icon-sm" onClick={() => setShowMpReorderModal(false)}><X className="size-4" /></Button>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                Geser (drag & drop) item di bawah ini untuk mengatur urutan media partner.
              </p>

              <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <Reorder.Group axis="y" values={mpReorderList} onReorder={setMpReorderList} className="flex flex-col gap-2">
                  {mpReorderList.map((m) => (
                    <Reorder.Item
                      key={m.id}
                      value={m}
                      className="flex items-center gap-3 rounded-md border border-border bg-card p-3 shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50"
                    >
                      <GripVertical className="size-4 text-muted-foreground" />
                      {m.logo && (
                        <Image src={m.logo} alt="" width={24} height={24} unoptimized className="size-6 object-contain" />
                      )}
                      <span className="text-sm font-bold">{m.name || '(tanpa nama)'}</span>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowMpReorderModal(false)} className="text-xs font-bold uppercase">
                  Batal
                </Button>
                <Button onClick={handleMpReorderSave} disabled={mpReorderMutation.isPending} className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold uppercase gap-2">
                  {mpReorderMutation.isPending ? <Spinner className="size-4 text-white" /> : <Check className="size-4" />}
                  Simpan Urutan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
