'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Pencil, X, Check, Search, Plus, Trophy,
  Coins, Users, MapPin, Calendar, Phone, User, Tag,
  Trash2, EyeOff, Eye, Clock, Award, Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import DeleteModal from '@/components/DeleteModal';
import Pagination from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import WinnerManager from '@/components/WinnerManager';
import { useCompetitions, useCategories, queryKeys } from '@/src/lib/hooks/use-queries';
import { apiHelpers } from '@/src/lib/api';
import { cn } from '@/lib/utils';
import { formatDateNumeric, toDateInputValue, toIsoOrNull } from '@/lib/date';
import { getActiveBatch } from '@/src/lib/competitions';

const PAGE_SIZE = 10;

/** Competition shape derived from the Eden API response. */
type Competition = Awaited<ReturnType<typeof apiHelpers.competitions.list>>[number];

interface Category {
  id: string;
  label: string;
  color: string;
  sortOrder: number | null;
  createdAt: Date;
}

export interface CompetitionBatchItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  fee: number;
  feeDisplay?: string;
}

const emptyForm = {
  id: '',
  title: '',
  category: 'akademik',
  type: 'individual',
  maxTeamMembers: 5,
  minTeamMembers: 3,
  membersRequired: 'required',
  tagline: '',
  description: '',
  fee: 0,
  hasBatches: false,
  batches: [] as CompetitionBatchItem[],
  maxSlots: 0,
  filledSlots: 0,
  scheduleDate: '',
  location: '',
  prizes: [] as { label: string; value: string }[],
  rulesSummary: '',
  rulebookUrl: '',
  contactName: '',
  contactWhatsapp: '',
  isActive: true,
  feeDisplay: '',
  isFree: false,
  origin: 'internal',
  playerPhotoRequired: false,
};

/* ─── Form Fields Sub-component ─── */
function formatRupiah(val: string | number) {
  const num = String(val ?? '').replace(/\D/g, '');
  if (!num) return '';
  return new Intl.NumberFormat('id-ID').format(Number(num));
}

function parseRupiah(val: string | number) {
  return Number(String(val ?? '').replace(/\D/g, '')) || 0;
}

function FormFields({ form, setForm, isAdd, categories }: { form: any; setForm: (f: any) => void; isAdd?: boolean; categories: Category[] }) {
  const update = (fieldOrObj: string | Record<string, any>, value?: any) => {
    setForm((prev: any) => {
      const updates = typeof fieldOrObj === 'string' ? { [fieldOrObj]: value } : fieldOrObj;
      const next = { ...prev, ...updates };
      // Auto-generate slug from title when adding
      if (isAdd && ('title' in updates)) {
        next.id = String(updates.title || '')
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
      }
      return next;
    });
  };

  return (
    <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {isAdd && (
        <Field>
          <FieldLabel required>ID (slug)</FieldLabel>
          <Input value={form.id} readOnly className="cursor-not-allowed bg-muted text-muted-foreground" />
        </Field>
      )}
      <Field>
        <FieldLabel required>Judul</FieldLabel>
        <Input value={form.title} onChange={(e) => update('title', e.target.value)} />
      </Field>
      <Field>
        <FieldLabel className="gap-1" required><Tag className="size-3" /> Kategori</FieldLabel>
        <Select value={form.category} onValueChange={(v) => update('category', v)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel className="gap-1"><Users className="size-3" /> Tipe</FieldLabel>
        <ToggleGroup type="single" value={form.type} onValueChange={(v) => v && update('type', v)} spacing={2} className="w-full">
          <ToggleGroupItem value="individual" className="flex-1 text-xs font-bold uppercase tracking-wider">Individu</ToggleGroupItem>
          <ToggleGroupItem value="team" className="flex-1 text-xs font-bold uppercase tracking-wider">Tim</ToggleGroupItem>
          <ToggleGroupItem value="both" className="flex-1 text-xs font-bold uppercase tracking-wider">Keduanya</ToggleGroupItem>
        </ToggleGroup>
        {form.type === 'both' && (
          <p className="mt-1.5 text-[10px] text-muted-foreground">Peserta bisa memilih pendaftaran individu atau tim.</p>
        )}
      </Field>
      {form.type !== 'individual' && (
        <Field>
          <FieldLabel className="gap-1" required><Users className="size-3" /> Maksimal Anggota per Tim</FieldLabel>
          <Input type="number" min={1} value={form.maxTeamMembers} onChange={(e) => update('maxTeamMembers', parseInt(e.target.value) || 1)} />
        </Field>
      )}
      {form.type !== 'individual' && (
        <Field>
          <FieldLabel className="gap-1" required><Users className="size-3" /> Minimal Anggota per Tim</FieldLabel>
          <Input type="number" min={1} max={form.maxTeamMembers} value={form.minTeamMembers} onChange={(e) => update('minTeamMembers', parseInt(e.target.value) || 1)} />
        </Field>
      )}
      <Field className="sm:col-span-2">
        <FieldLabel>Tagline</FieldLabel>
        <Input value={form.tagline} onChange={(e) => update('tagline', e.target.value)} />
      </Field>
      <Field className="sm:col-span-2">
        <FieldLabel>Deskripsi</FieldLabel>
        <Textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} />
      </Field>
      <Field>
        <FieldLabel className="gap-1"><Users className="size-3" /> Foto Pemain</FieldLabel>
        <ToggleGroup type="single" value={form.playerPhotoRequired ? 'required' : 'optional'} onValueChange={(v) => v && update('playerPhotoRequired', v === 'required')} spacing={2} className="w-full">
          <ToggleGroupItem value="optional" className="flex-1 text-xs font-bold uppercase tracking-wider">Tidak Perlu</ToggleGroupItem>
          <ToggleGroupItem value="required" className="flex-1 text-xs font-bold uppercase tracking-wider">Wajib</ToggleGroupItem>
        </ToggleGroup>
        {form.playerPhotoRequired && (
          <p className="mt-1.5 text-[10px] text-muted-foreground">Setiap pemain (ketua + anggota) wajib mengunggah foto saat mendaftar.</p>
        )}
      </Field>
      <Field>
        <FieldLabel className="gap-1"><Tag className="size-3" /> Tipe Lomba</FieldLabel>
        <ToggleGroup type="single" value={form.origin} onValueChange={(v) => v && update('origin', v)} spacing={2} className="w-full">
          <ToggleGroupItem value="internal" className="flex-1 text-xs font-bold uppercase tracking-wider">Internal</ToggleGroupItem>
          <ToggleGroupItem value="external" className="flex-1 text-xs font-bold uppercase tracking-wider">Eksternal</ToggleGroupItem>
        </ToggleGroup>
      </Field>
      <Field className="sm:col-span-2">
        <FieldLabel className="gap-1"><Eye className="size-3" /> Status Pendaftaran</FieldLabel>
        <ToggleGroup type="single" value={form.isActive ? 'active' : 'inactive'} onValueChange={(v) => v && update('isActive', v === 'active')} spacing={2} className="w-full">
          <ToggleGroupItem value="active" className="flex-1 text-xs font-bold uppercase tracking-wider text-emerald-700 data-[state=on]:bg-emerald-100 data-[state=on]:border-emerald-300">
            Buka Pendaftaran (Aktif)
          </ToggleGroupItem>
          <ToggleGroupItem value="inactive" className="flex-1 text-xs font-bold uppercase tracking-wider text-red-700 data-[state=on]:bg-red-100 data-[state=on]:border-red-300">
            Tutup Pendaftaran (Nonaktif / Draft)
          </ToggleGroupItem>
        </ToggleGroup>
        <p className="mt-1 text-[10px] text-muted-foreground">
          {form.isActive ? 'Pendaftaran lomba ini dibuka untuk umum.' : 'Pendaftaran ditutup/dikunci di halaman publik, formulir pendaftaran tidak dapat diakses.'}
        </p>
      </Field>
      <Field>
        <FieldLabel className="gap-1"><Coins className="size-3" /> Biaya</FieldLabel>
        <ToggleGroup
          type="single"
          value={form.isFree ? 'free' : 'paid'}
          onValueChange={(v) => {
            if (!v) return;
            const isFree = v === 'free';
            if (isFree) {
              update({ isFree: true, fee: 0, feeDisplay: '0' });
            } else {
              update({
                isFree: false,
                fee: form.fee || 0,
                feeDisplay: form.fee ? formatRupiah(String(form.fee)) : '',
              });
            }
          }}
          spacing={2}
          className="w-full"
        >
          <ToggleGroupItem value="paid" className="flex-1 text-xs font-bold uppercase tracking-wider">Berbayar</ToggleGroupItem>
          <ToggleGroupItem value="free" className="flex-1 text-xs font-bold uppercase tracking-wider">Gratis</ToggleGroupItem>
        </ToggleGroup>
        {!form.isFree && (
          <>
            <InputGroup className="clip-angled-sm mt-2 h-10 border-border bg-background">
              <InputGroupAddon align="inline-start"><span className="text-sm font-bold text-muted-foreground">Rp</span></InputGroupAddon>
              <InputGroupInput
                type="text"
                inputMode="numeric"
                value={form.feeDisplay !== undefined && form.feeDisplay !== null ? form.feeDisplay : (form.fee ? formatRupiah(String(form.fee)) : '')}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '');
                  if (!raw) {
                    update({ fee: 0, feeDisplay: '' });
                  } else {
                    const num = parseInt(raw, 10);
                    update({ fee: num, feeDisplay: formatRupiah(raw) });
                  }
                }}
                placeholder="50.000"
              />
            </InputGroup>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Minimal Rp 1.000 untuk gateway pembayaran. Jika gratis, pilih opsi &quot;Gratis&quot;.
            </p>
          </>
        )}
      </Field>
      {!form.isFree && (
        <Field className="sm:col-span-2">
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/10 p-4 dark:bg-cyan-950/20">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <Label htmlFor="toggle-has-batches" className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-foreground cursor-pointer">
                  <Layers className="size-4 text-cyan-600" />
                  Aktifkan Batch Pendaftaran (Harga Beda)
                </Label>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Aktifkan untuk membagi periode pendaftaran menjadi beberapa gelombang (misalnya Early Bird, Batch 1, Reguler) dengan rentang tanggal dan harga yang berbeda.
                </p>
              </div>
              <Switch
                id="toggle-has-batches"
                checked={!!form.hasBatches}
                onCheckedChange={(checked) => {
                  if (checked && (!form.batches || form.batches.length === 0)) {
                    const now = new Date();
                    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                    update({
                      hasBatches: true,
                      batches: [
                        {
                          id: crypto.randomUUID(),
                          name: 'Early Bird',
                          startDate: now.toISOString().slice(0, 16),
                          endDate: nextWeek.toISOString().slice(0, 16),
                          fee: form.fee || 35000,
                          feeDisplay: form.fee ? formatRupiah(String(form.fee)) : '35.000',
                        },
                      ],
                    });
                  } else {
                    update({ hasBatches: checked });
                  }
                }}
              />
            </div>

            {form.hasBatches && (
              <div className="mt-4 space-y-3 border-t border-cyan-500/20 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    Daftar Gelombang / Batch ({form.batches?.length || 0})
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentBatches = form.batches || [];
                      const lastBatch = currentBatches[currentBatches.length - 1];
                      let startDate = new Date().toISOString().slice(0, 16);
                      if (lastBatch?.endDate) {
                        startDate = lastBatch.endDate;
                      }
                      const endDate = new Date(new Date(startDate).getTime() + 14 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .slice(0, 16);

                      const newBatch: CompetitionBatchItem = {
                        id: crypto.randomUUID(),
                        name: `Batch ${currentBatches.length + 1}`,
                        startDate,
                        endDate,
                        fee: form.fee || 50000,
                        feeDisplay: form.fee ? formatRupiah(String(form.fee)) : '50.000',
                      };
                      update({ batches: [...currentBatches, newBatch] });
                    }}
                    className="h-7 text-xs font-bold uppercase tracking-wider border-cyan-500/40 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-500/10"
                  >
                    <Plus className="size-3.5 mr-1" /> Tambah Batch
                  </Button>
                </div>

                {(!form.batches || form.batches.length === 0) ? (
                  <p className="py-3 text-center text-xs italic text-muted-foreground">
                    Belum ada batch pendaftaran yang ditambahkan. Klik &quot;Tambah Batch&quot; di atas.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {form.batches.map((batch: CompetitionBatchItem, idx: number) => {
                      const now = new Date();
                      const isOngoing = batch.startDate && batch.endDate && now >= new Date(batch.startDate) && now <= new Date(batch.endDate);
                      const isPast = batch.endDate && now > new Date(batch.endDate);
                      const isUpcoming = batch.startDate && now < new Date(batch.startDate);

                      return (
                        <div
                          key={batch.id || idx}
                          className="rounded-lg border border-border bg-card p-3.5 shadow-xs space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black uppercase text-foreground">
                                Batch #{idx + 1}
                              </span>
                              {isOngoing && (
                                <Badge className="bg-emerald-500 text-white text-[10px] py-0 px-2 h-4 font-bold">
                                  Aktif Sekarang
                                </Badge>
                              )}
                              {isUpcoming && (
                                <Badge variant="secondary" className="text-[10px] py-0 px-2 h-4 text-cyan-600 font-bold">
                                  Mendatang
                                </Badge>
                              )}
                              {isPast && (
                                <Badge variant="outline" className="text-[10px] py-0 px-2 h-4 text-muted-foreground font-bold">
                                  Berakhir
                                </Badge>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => {
                                const nextBatches = form.batches.filter((_: any, i: number) => i !== idx);
                                update({ batches: nextBatches });
                              }}
                              className="text-muted-foreground hover:text-destructive"
                              title="Hapus Batch"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                              <Label className="text-[11px] font-bold uppercase text-muted-foreground">Nama Gelombang / Batch</Label>
                              <Input
                                value={batch.name}
                                onChange={(e) => {
                                  const nextBatches = [...form.batches];
                                  nextBatches[idx] = { ...nextBatches[idx], name: e.target.value };
                                  update({ batches: nextBatches });
                                }}
                                placeholder="mis. Early Bird / Gelombang 1"
                                className="h-9 text-xs font-semibold mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-[11px] font-bold uppercase text-muted-foreground">Harga / Biaya Gelombang</Label>
                              <InputGroup className="h-9 mt-1 border-border bg-background">
                                <InputGroupAddon align="inline-start">
                                  <span className="text-xs font-bold text-muted-foreground">Rp</span>
                                </InputGroupAddon>
                                <InputGroupInput
                                  type="text"
                                  inputMode="numeric"
                                  value={batch.feeDisplay !== undefined ? batch.feeDisplay : (batch.fee ? formatRupiah(String(batch.fee)) : '')}
                                  onChange={(e) => {
                                    const raw = e.target.value.replace(/\D/g, '');
                                    const nextBatches = [...form.batches];
                                    nextBatches[idx] = {
                                      ...nextBatches[idx],
                                      fee: raw ? parseInt(raw, 10) : 0,
                                      feeDisplay: raw ? formatRupiah(raw) : '',
                                    };
                                    update({ batches: nextBatches });
                                  }}
                                  placeholder="35.000"
                                  className="text-xs font-semibold"
                                />
                              </InputGroup>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                              <Label className="text-[11px] font-bold uppercase text-muted-foreground">Tanggal Mulai (Daterange Start)</Label>
                              <Input
                                type="datetime-local"
                                value={batch.startDate ? (batch.startDate.includes('T') ? batch.startDate.slice(0, 16) : `${batch.startDate}T00:00`) : ''}
                                onChange={(e) => {
                                  const nextBatches = [...form.batches];
                                  nextBatches[idx] = { ...nextBatches[idx], startDate: e.target.value };
                                  update({ batches: nextBatches });
                                }}
                                className="h-9 text-xs mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-[11px] font-bold uppercase text-muted-foreground">Tanggal Selesai (Daterange End)</Label>
                              <Input
                                type="datetime-local"
                                value={batch.endDate ? (batch.endDate.includes('T') ? batch.endDate.slice(0, 16) : `${batch.endDate}T23:59`) : ''}
                                onChange={(e) => {
                                  const nextBatches = [...form.batches];
                                  nextBatches[idx] = { ...nextBatches[idx], endDate: e.target.value };
                                  update({ batches: nextBatches });
                                }}
                                className="h-9 text-xs mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </Field>
      )}
      <Field>
        <FieldLabel className="gap-1" required><Users className="size-3" /> {form.type === 'team' ? 'Kuota Tim' : form.type === 'both' ? 'Kuota Peserta / Tim' : 'Kuota Peserta'}</FieldLabel>
        <Input type="number" value={form.maxSlots} onChange={(e) => update('maxSlots', e.target.value)} />
      </Field>
      <Field>
        <FieldLabel className="gap-1"><Calendar className="size-3" /> Tanggal</FieldLabel>
        <Input type="date" value={form.scheduleDate} onChange={(e) => update('scheduleDate', e.target.value)} />
      </Field>
      <Field>
        <FieldLabel className="gap-1"><MapPin className="size-3" /> Lokasi</FieldLabel>
        <Input value={form.location} onChange={(e) => update('location', e.target.value)} />
      </Field>
      <Field className="sm:col-span-2">
        <FieldLabel className="gap-1"><Trophy className="size-3" /> Hadiah</FieldLabel>
        <FieldGroup className="gap-2">
          {form.prizes.map((p: { label: string; value: string }, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-5 flex-shrink-0 text-[10px] font-bold text-muted-foreground">#{i + 1}</span>
              <Input
                value={p.label}
                onChange={(e) => {
                  const next = [...form.prizes];
                  next[i] = { ...next[i], label: e.target.value };
                  update('prizes', next);
                }}
                placeholder="Label (Juara 1, Top Score, ...)"
                className="min-w-0 flex-1"
              />
              <Input
                value={p.value}
                onChange={(e) => {
                  const next = [...form.prizes];
                  next[i] = { ...next[i], value: e.target.value };
                  update('prizes', next);
                }}
                placeholder="Hadiah"
                className="min-w-0 flex-[2]"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => update('prizes', form.prizes.filter((_: any, j: number) => j !== i))}
                className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                title="Hapus"
                aria-label="Hapus hadiah"
              >
                <X />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => update('prizes', [...form.prizes, { label: `Juara ${form.prizes.length + 1}`, value: '' }])}
            className="clip-angled-sm gap-1.5 self-start border-dashed text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary"
          >
            <Plus data-icon="inline-start" className="size-3" /> Tambah Hadiah
          </Button>
        </FieldGroup>
      </Field>
      <Field className="sm:col-span-2">
        <FieldLabel>Aturan (1 baris = 1 aturan)</FieldLabel>
        <Textarea value={form.rulesSummary} onChange={(e) => update('rulesSummary', e.target.value)} rows={3} />
      </Field>
      <Field>
        <FieldLabel className="gap-1" required><User className="size-3" /> Kontak (Nama)</FieldLabel>
        <Input value={form.contactName} onChange={(e) => update('contactName', e.target.value)} />
      </Field>
      <Field>
        <FieldLabel className="gap-1" required><Phone className="size-3" /> Kontak (WhatsApp)</FieldLabel>
        <Input type="tel" inputMode="numeric" value={form.contactWhatsapp} onChange={(e) => update('contactWhatsapp', e.target.value.replace(/\D/g, ''))} placeholder="62812XXXXXXXX" />
      </Field>
    </FieldGroup>
  );
}

export default function KompetisiPage() {
  const qc = useQueryClient();
  const { data: compsData, isLoading: loading } = useCompetitions();
  const { data: catsData } = useCategories();
  const competitions = compsData ?? [];
  const categories = catsData ?? [];
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'az' | 'za'>('newest');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<any>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Category manager state
  const [showCatManager, setShowCatManager] = useState(false);
  const [catForm, setCatForm] = useState({ id: '', label: '', color: 'text-cyan-700 bg-cyan-50 border-cyan-200' });
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catSaving, setCatSaving] = useState(false);

  // Delete modal
  const [deleteModal, setDeleteModal] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  // Timeline manager state
  interface TimelineItemData {
    id: number;
    competitionId: string;
    date: string;
    title: string;
    desc: string;
    sortOrder: number | null;
    createdAt: Date;
  }
  const [timelineOpen, setTimelineOpen] = useState<string | null>(null);
  const [winnerOpenId, setWinnerOpenId] = useState<string | null>(null);
  const [timelineItems, setTimelineItems] = useState<Record<string, TimelineItemData[]>>({});
  const [tlForm, setTlForm] = useState({ date: '', title: '', desc: '' });
  const [tlEditingId, setTlEditingId] = useState<number | null>(null);
  const [tlSaving, setTlSaving] = useState(false);
  const [tlDateRange, setTlDateRange] = useState({ start: '', end: '' });

  const invalidate = (id?: string) => {
    qc.invalidateQueries({ queryKey: queryKeys.competitions.all });
    qc.invalidateQueries({ queryKey: ['competitions'] });
    if (id) {
      qc.invalidateQueries({ queryKey: queryKeys.competitions.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.competitions.timeline(id) });
    }
    qc.invalidateQueries({ queryKey: queryKeys.categories.all });
  };

  const saveMutation = useMutation({
    mutationFn: ({ id, body }: { id?: string; body: Record<string, unknown> }) =>
      id
        ? apiHelpers.competitions.update(id, body)
        : apiHelpers.competitions.create(body),
    onSuccess: (_data, variables) => {
      setEditingId(null);
      invalidate(variables.id);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      apiHelpers.competitions.update(id, body),
    onSuccess: (_data, variables) => invalidate(variables.id),
  });

  const deleteCompMutation = useMutation({
    mutationFn: (id: string) => apiHelpers.competitions.remove(id),
    onSuccess: (_data, id) => {
      toast.success('Lomba berhasil dihapus');
      invalidate(id);
    },
    onError: () => toast.error('Gagal menghapus lomba'),
  });

  const catSaveMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      editingCatId
        ? apiHelpers.categories.update(editingCatId, body)
        : apiHelpers.categories.create(body),
    onSuccess: () => {
      setEditingCatId(null);
      invalidate();
    },
    onError: () => console.error('Category save failed'),
  });

  const catDeleteMutation = useMutation({
    mutationFn: (id: string) => apiHelpers.categories.remove(id),
    onSuccess: () => invalidate(),
  });

  /* ─── Competition CRUD ─── */
  const handleEdit = (comp: Competition) => {
    setShowAdd(false);
    setEditingId(comp.id);
    const isFreeBool = comp.isFree === true || (comp as any).isFree === '1';
    const hasBatchesBool = comp.hasBatches === true || (comp as any).hasBatches === '1';
    setEditForm({
      title: comp.title,
      category: comp.category,
      type: comp.type || 'individual',
      maxTeamMembers: comp.maxTeamMembers || 5,
      minTeamMembers: comp.minTeamMembers || 1,
      membersRequired: comp.membersRequired || 'optional',
      playerPhotoRequired: comp.playerPhotoRequired === true || (comp as any).playerPhotoRequired === '1',
      tagline: comp.tagline || '',
      description: comp.description || '',
      fee: isFreeBool ? 0 : (comp.fee || 0),
      hasBatches: hasBatchesBool,
      batches: Array.isArray((comp as any).batches)
        ? (comp as any).batches.map((b: any) => ({
            ...b,
            feeDisplay: b.fee ? formatRupiah(String(b.fee)) : '',
          }))
        : [],
      maxSlots: comp.maxSlots || 0,
      filledSlots: comp.filledSlots || 0,
      scheduleDate: toDateInputValue(comp.scheduleDate),
      location: comp.location || '',
      prizes: (comp as any).prizes?.length
        ? (comp as any).prizes
        : [
            ...(comp.prizesFirst ? [{ label: 'Juara 1', value: comp.prizesFirst }] : []),
            ...(comp.prizesSecond ? [{ label: 'Juara 2', value: comp.prizesSecond }] : []),
            ...(comp.prizesThird ? [{ label: 'Juara 3', value: comp.prizesThird }] : []),
          ],
      rulesSummary: Array.isArray(comp.rulesSummary) ? comp.rulesSummary.join('\n') : (comp.rulesSummary || ''),
      rulebookUrl: comp.rulebookUrl || '',
      contactName: comp.contactName || '',
      contactWhatsapp: comp.contactWhatsapp || '',
      feeDisplay: isFreeBool ? '0' : (comp.fee ? formatRupiah(String(comp.fee)) : ''),
      isFree: isFreeBool,
      isActive: comp.isActive === true || (comp as any).isActive === '1' || comp.isActive === undefined,
      origin: comp.origin || 'internal',
    });
  };

  const handleCancelEdit = () => setEditingId(null);

  const handleSave = async (id: string) => {
    setSaving(true);
    try {
      const { feeDisplay: _feeDisplay, ...submitData } = editForm;
      const isFree = !!editForm.isFree;
      const feeNum = isFree ? 0 : (parseRupiah(String(editForm.feeDisplay ?? editForm.fee)) || 0);

      if (!isFree && !editForm.hasBatches && feeNum > 0 && feeNum < 1000) {
        toast.error('Biaya berbayar minimal Rp 1.000 untuk gateway pembayaran. Jika lomba gratis, pilih opsi Gratis.');
        setSaving(false);
        return;
      }

      let cleanedBatches: CompetitionBatchItem[] = [];
      if (!isFree && editForm.hasBatches) {
        if (!editForm.batches || editForm.batches.length === 0) {
          toast.error('Silakan tambahkan minimal 1 batch pendaftaran atau nonaktifkan opsi batch.');
          setSaving(false);
          return;
        }
        for (let i = 0; i < editForm.batches.length; i++) {
          const b = editForm.batches[i];
          if (!b.name || !b.name.trim()) {
            toast.error(`Nama pada Gelombang #${i + 1} wajib diisi`);
            setSaving(false);
            return;
          }
          if (!b.startDate || !b.endDate) {
            toast.error(`Rentang tanggal pada Gelombang #${i + 1} wajib diisi`);
            setSaving(false);
            return;
          }
          const batchFee = parseRupiah(String(b.feeDisplay ?? b.fee)) || 0;
          if (batchFee > 0 && batchFee < 1000) {
            toast.error(`Biaya pada Gelombang #${i + 1} minimal Rp 1.000.`);
            setSaving(false);
            return;
          }
        }
        cleanedBatches = editForm.batches.map((b: any) => ({
          id: b.id || crypto.randomUUID(),
          name: b.name.trim(),
          startDate: b.startDate,
          endDate: b.endDate,
          fee: parseRupiah(String(b.feeDisplay ?? b.fee)) || 0,
        }));
      }

      const rules = typeof editForm.rulesSummary === 'string'
        ? editForm.rulesSummary.split('\n').filter((s: string) => s.trim())
        : Array.isArray(editForm.rulesSummary)
          ? editForm.rulesSummary
          : [];

      await saveMutation.mutateAsync({
        id,
        body: {
          ...submitData,
          fee: feeNum,
          hasBatches: !isFree && !!editForm.hasBatches,
          batches: cleanedBatches,
          isFree,
          maxSlots: parseInt(String(editForm.maxSlots), 10) || 0,
          filledSlots: parseInt(String(editForm.filledSlots), 10) || 0,
          maxTeamMembers: parseInt(String(editForm.maxTeamMembers), 10) || 1,
          minTeamMembers: parseInt(String(editForm.minTeamMembers), 10) || 1,
          rulesSummary: rules,
          scheduleDate: toIsoOrNull(editForm.scheduleDate),
          prizes: Array.isArray(editForm.prizes)
            ? editForm.prizes.filter((p: any) => p && p.label && p.value)
            : [],
        },
      });
      toast.success('Lomba berhasil diperbarui');
    } catch (err) { console.error(err); toast.error(err instanceof Error ? err.message : 'Gagal menyimpan lomba'); }
    setSaving(false);
  };

  const handleAdd = async () => {
    if (!addForm.title || !addForm.id) return;
    setSaving(true);
    try {
      const { feeDisplay: _feeDisplay, ...submitData } = addForm;
      const isFree = !!addForm.isFree;
      const feeNum = isFree ? 0 : (parseRupiah(String(addForm.feeDisplay ?? addForm.fee)) || 0);

      if (!isFree && !addForm.hasBatches && feeNum > 0 && feeNum < 1000) {
        toast.error('Biaya berbayar minimal Rp 1.000 untuk gateway pembayaran. Jika lomba gratis, pilih opsi Gratis.');
        setSaving(false);
        return;
      }

      let cleanedBatches: CompetitionBatchItem[] = [];
      if (!isFree && addForm.hasBatches) {
        if (!addForm.batches || addForm.batches.length === 0) {
          toast.error('Silakan tambahkan minimal 1 batch pendaftaran atau nonaktifkan opsi batch.');
          setSaving(false);
          return;
        }
        for (let i = 0; i < addForm.batches.length; i++) {
          const b = addForm.batches[i];
          if (!b.name || !b.name.trim()) {
            toast.error(`Nama pada Gelombang #${i + 1} wajib diisi`);
            setSaving(false);
            return;
          }
          if (!b.startDate || !b.endDate) {
            toast.error(`Rentang tanggal pada Gelombang #${i + 1} wajib diisi`);
            setSaving(false);
            return;
          }
          const batchFee = parseRupiah(String(b.feeDisplay ?? b.fee)) || 0;
          if (batchFee > 0 && batchFee < 1000) {
            toast.error(`Biaya pada Gelombang #${i + 1} minimal Rp 1.000.`);
            setSaving(false);
            return;
          }
        }
        cleanedBatches = addForm.batches.map((b: any) => ({
          id: b.id || crypto.randomUUID(),
          name: b.name.trim(),
          startDate: b.startDate,
          endDate: b.endDate,
          fee: parseRupiah(String(b.feeDisplay ?? b.fee)) || 0,
        }));
      }

      const rules = typeof addForm.rulesSummary === 'string'
        ? addForm.rulesSummary.split('\n').filter((s: string) => s.trim())
        : Array.isArray(addForm.rulesSummary)
          ? addForm.rulesSummary
          : [];

      await saveMutation.mutateAsync({
        body: {
          ...submitData,
          fee: feeNum,
          hasBatches: !isFree && !!addForm.hasBatches,
          batches: cleanedBatches,
          isFree,
          maxSlots: parseInt(String(addForm.maxSlots), 10) || 0,
          filledSlots: parseInt(String(addForm.filledSlots), 10) || 0,
          maxTeamMembers: parseInt(String(addForm.maxTeamMembers), 10) || 1,
          minTeamMembers: parseInt(String(addForm.minTeamMembers), 10) || 1,
          rulesSummary: rules,
          scheduleDate: toIsoOrNull(addForm.scheduleDate),
          prizes: Array.isArray(addForm.prizes)
            ? addForm.prizes.filter((p: any) => p && p.label && p.value)
            : [],
        },
      });
      setAddForm({ ...emptyForm });
      setShowAdd(false);
      toast.success('Lomba berhasil ditambahkan');
    } catch (err) { console.error(err); toast.error(err instanceof Error ? err.message : 'Gagal menambahkan lomba'); }
    setSaving(false);
  };

  /* ─── Toggle Active ─── */
  const handleToggleActive = async (comp: Competition) => {
    try {
      const newStatus = !comp.isActive;
      await toggleActiveMutation.mutateAsync({
        id: comp.id,
        body: {
          isActive: newStatus,
        },
      });
      toast.success(newStatus ? 'Lomba diaktifkan' : 'Lomba dinonaktifkan');
    } catch (err) { console.error(err); toast.error(err instanceof Error ? err.message : 'Gagal mengubah status'); }
  };

  /* ─── Delete Competition ─── */
  const handleDeleteComp = (id: string) => {
    setDeleteModal({
      title: 'Hapus Lomba',
      message: 'Yakin ingin menghapus lomba ini? Tindakan ini tidak bisa dibatalkan.',
      onConfirm: async () => {
        setDeleteLoading(true);
        try {
          await deleteCompMutation.mutateAsync(id);
        } catch (err) { console.error(err); toast.error('Gagal menghapus lomba'); }
        setDeleteLoading(false);
      },
    });
  };

  /* ─── Timeline CRUD ─── */
  const composeDate = (start: string, end: string) => {
    if (!start) return '';
    const s = new Date(start + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    if (!end) return s;
    const e = new Date(end + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    return s === e ? s : `${s} - ${e}`;
  };

  const handleTimelineOpen = async (compId: string) => {
    if (timelineOpen === compId) {
      setTimelineOpen(null);
      return;
    }
    setTimelineOpen(compId);
    setWinnerOpenId(null);
    setTlEditingId(null);
    setTlForm({ date: '', title: '', desc: '' });
    setTlDateRange({ start: '', end: '' });
    try {
      const items = await apiHelpers.competitions.timeline(compId);
      setTimelineItems((prev) => ({ ...prev, [compId]: items ?? [] }));
    } catch {
      toast.error('Gagal memuat timeline');
    }
  };

  const handleWinnerOpen = (compId: string) => {
    if (winnerOpenId === compId) {
      setWinnerOpenId(null);
      return;
    }
    setWinnerOpenId(compId);
    setTimelineOpen(null);
  };

  const handleTlSave = async (compId: string) => {
    const dateStr = composeDate(tlDateRange.start, tlDateRange.end);
    if (!tlForm.title || !dateStr || !tlForm.desc) {
      toast.error('Judul, tanggal, dan deskripsi wajib diisi');
      return;
    }
    const payload = { ...tlForm, date: dateStr, desc: tlForm.desc };
    setTlSaving(true);
    try {
      if (tlEditingId) {
        await apiHelpers.competitions.updateTimeline(compId, String(tlEditingId), payload);
      } else {
        await apiHelpers.competitions.createTimeline(compId, payload);
      }
      setTlForm({ date: '', title: '', desc: '' });
      setTlDateRange({ start: '', end: '' });
      setTlEditingId(null);
      toast.success(tlEditingId ? 'Timeline diperbarui' : 'Timeline ditambahkan');
      const items = await apiHelpers.competitions.timeline(compId);
      setTimelineItems((prev) => ({ ...prev, [compId]: items ?? [] }));
    } catch {
      toast.error('Gagal menyimpan timeline');
    }
    setTlSaving(false);
  };

  const handleTlEdit = (item: TimelineItemData) => {
    setTlEditingId(item.id);
    setTlForm({ date: item.date, title: item.title, desc: item.desc });
    // Try to parse existing date back to range
    const parts = item.date.split(' - ');
    if (parts.length === 2) {
      // Convert Indonesian date-ish back to YYYY-MM-DD — best effort
      const guess = (s: string) => {
        try { return new Date(s).toISOString().split('T')[0]; } catch { return ''; }
      };
      setTlDateRange({ start: guess(parts[0]), end: guess(parts[1]) });
    } else {
      const d = new Date(item.date).toISOString().split('T')[0];
      setTlDateRange({ start: d, end: '' });
    }
  };

  const handleTlDelete = async (compId: string, itemId: number) => {
    if (!confirm('Hapus item timeline ini?')) return;
    try {
      await apiHelpers.competitions.removeTimeline(compId, String(itemId));
      toast.success('Item timeline dihapus');
      const items = await apiHelpers.competitions.timeline(compId);
      setTimelineItems((prev) => ({ ...prev, [compId]: items ?? [] }));
    } catch {
      toast.error('Gagal menghapus item timeline');
    }
  };

  /* ─── Category CRUD ─── */
  const handleCatSave = async () => {
    if (!catForm.label) return;
    setCatSaving(true);
    try {
      await catSaveMutation.mutateAsync(catForm);
      setCatForm({ id: '', label: '', color: 'text-cyan-700 bg-cyan-50 border-cyan-200' });
    } catch (err) { console.error(err); }
    setCatSaving(false);
  };

  const handleCatEdit = (cat: Category) => {
    setCatForm({ id: cat.id, label: cat.label, color: cat.color });
    setEditingCatId(cat.id);
  };

  const handleCatDelete = (id: string) => {
    setDeleteModal({
      title: 'Hapus Kategori',
      message: 'Yakin ingin menghapus kategori ini? Hanya bisa dihapus jika tidak ada lomba yang menggunakannya.',
      onConfirm: async () => {
        setDeleteModal(null);
        try {
          await catDeleteMutation.mutateAsync(id);
        } catch (err: any) {
          alert(err.message);
        }
      },
    });
  };

  const filtered = [...competitions]
    .filter((c) => !search || c.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'az') return a.title.localeCompare(b.title);
      if (sortBy === 'za') return b.title.localeCompare(a.title);
      return 0; // newest — keep DB order
    });
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner className="size-6 text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">Kompetisi</h1>
          <p className="mt-1 text-sm font-light text-muted-foreground">{competitions.length} lomba terdaftar</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setShowCatManager(!showCatManager); setShowAdd(false); setEditingId(null); }} className="clip-angled text-xs font-bold uppercase tracking-wider">
            <Tag data-icon="inline-start" /> Kelola Kategori
          </Button>
          <Button onClick={() => { setShowAdd(!showAdd); setEditingId(null); }} className="clip-angled text-xs font-bold uppercase tracking-wider">
            <Plus data-icon="inline-start" /> Tambah Lomba
          </Button>
        </div>
      </div>

      {/* Category Manager */}
      {showCatManager && (
        <div className="bg-white border border-slate-200 relative p-5 space-y-4"
          style={{ clipPath: 'polygon(14px 0, 100% 0, calc(100% - 14px) 100%, 0 100%)' }}
        >
          <div className="absolute -top-[1px] -left-[1px] w-8 h-8 bg-astro-cyan"
            style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
          />
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Kelola Kategori</h2>
            <button onClick={() => setShowCatManager(false)}
              className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-4 h-4" /></button>
          </div>

          {/* Add/Edit form */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Label</label>
              <input value={catForm.label} onChange={(e) => setCatForm({ ...catForm, label: e.target.value, id: editingCatId ? catForm.id : e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder="Nama kategori"
                className="w-full px-3 py-2 border border-slate-200 text-sm mt-1 focus:outline-none focus:border-astro-cyan"
                style={{ clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)' }}
              />
            </div>
            {!editingCatId && (
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ID</label>
                <input value={catForm.id} onChange={(e) => setCatForm({ ...catForm, id: e.target.value })}
                  placeholder="slug-kategori"
                  className="w-full px-3 py-2 border border-slate-200 text-sm mt-1 focus:outline-none focus:border-astro-cyan"
                  style={{ clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)' }}
                />
              </div>
            )}
            <select value={catForm.color} onChange={(e) => setCatForm({ ...catForm, color: e.target.value })}
              className="flex-1 px-3 py-2 border border-slate-200 text-xs mt-5 focus:outline-none focus:border-astro-cyan cursor-pointer"
              style={{ clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)' }}
            >
              <option value="text-emerald-700 bg-emerald-50 border-emerald-200">Hijau (Akademik)</option>
              <option value="text-orange-700 bg-orange-50 border-orange-200">Oranye (Olahraga)</option>
              <option value="text-cyan-700 bg-cyan-50 border-cyan-200">Cyan (Esports)</option>
              <option value="text-purple-700 bg-purple-50 border-purple-200">Ungu</option>
              <option value="text-pink-700 bg-pink-50 border-pink-200">Pink</option>
              <option value="text-sky-700 bg-sky-50 border-sky-200">Sky</option>
              <option value="text-amber-700 bg-amber-50 border-amber-200">Amber</option>
            </select>
            <button onClick={handleCatSave} disabled={catSaving}
              className="px-4 py-2 bg-astro-cyan text-slate-950 font-bold text-xs tracking-wider uppercase hover:bg-cyan-400 disabled:bg-slate-200 disabled:text-slate-400 cursor-pointer"
              style={{ clipPath: 'polygon(5px 0, 100% 0, calc(100% - 5px) 100%, 0 100%)' }}
            >
              {catSaving ? <Spinner className="w-3 h-3" /> : editingCatId ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            </button>
            {editingCatId && (
              <button onClick={() => { setEditingCatId(null); setCatForm({ id: '', label: '', color: 'text-cyan-700 bg-cyan-50 border-cyan-200' }); }}
                className="px-4 py-2 border border-slate-300 text-slate-600 font-bold text-xs tracking-wider uppercase hover:bg-slate-50 cursor-pointer"
                style={{ clipPath: 'polygon(5px 0, 100% 0, calc(100% - 5px) 100%, 0 100%)' }}
              >Batal</button>
            )}
          </div>

          {/* Categories list */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <div key={cat.id}
                className={`flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider border ${cat.color}`}
                style={{ clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)' }}
              >
                <span>{cat.label}</span>
                <button onClick={() => handleCatEdit(cat)} className="hover:opacity-60 cursor-pointer"><Pencil className="w-3 h-3" /></button>
                <button onClick={() => handleCatDelete(cat.id)} className="hover:opacity-60 cursor-pointer"><X className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Form */}
      {showAdd && (
        <div className="bg-white border border-slate-200 relative p-5 space-y-4"
          style={{ clipPath: 'polygon(14px 0, 100% 0, calc(100% - 14px) 100%, 0 100%)' }}
        >
          <div className="absolute -top-[1px] -left-[1px] w-8 h-8 bg-astro-cyan"
            style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
          />
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Tambah Lomba Baru</h2>
          <FormFields form={addForm} setForm={setAddForm} isAdd categories={categories} />
          <div className="flex gap-2 pt-2">
            <Button onClick={handleAdd} disabled={saving} className="clip-angled-sm gap-1 text-xs font-bold uppercase tracking-wider">
              {saving ? <Spinner data-icon="inline-start" /> : <Check data-icon="inline-start" />} Simpan
            </Button>
            <Button variant="outline" onClick={() => setShowAdd(false)} className="clip-angled-sm gap-1 text-xs font-bold uppercase tracking-wider">
              <X data-icon="inline-start" /> Batal
            </Button>
          </div>
        </div>
      )}

      {/* Search + Sort */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="max-w-xs flex-1">
          <InputGroup className="clip-angled h-10 border-border bg-background">
            <InputGroupAddon align="inline-start">
              <Search className="size-3.5 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari lomba..." className="text-xs font-medium" />
          </InputGroup>
        </div>

        <ToggleGroup type="single" value={sortBy} onValueChange={(v) => v && setSortBy(v as 'newest' | 'az' | 'za')} spacing={1}>
          {[
            { key: 'newest', label: 'Terbaru' },
            { key: 'az', label: 'A-Z' },
            { key: 'za', label: 'Z-A' },
          ].map((opt) => (
            <ToggleGroupItem key={opt.key} value={opt.key} className="clip-angled-sm px-3 py-2 text-[10px] font-bold uppercase tracking-wider">
              {opt.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {paginated.map((comp) => {
          const cat = categories.find((c) => c.id === comp.category);
          const catColor = cat?.color || 'bg-slate-50 text-slate-600 border-slate-200';

          return (
            <div key={comp.id}
              className="bg-white border border-slate-200 relative"
              style={{ clipPath: 'polygon(14px 0, 100% 0, calc(100% - 14px) 100%, 0 100%)' }}
            >
              <div className="absolute -top-[1px] -left-[1px] w-8 h-8 bg-astro-cyan"
                style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
              />
              <div className="p-5">
                {editingId === comp.id ? (
                  <div className="space-y-4">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Edit Lomba</h2>
                    <FormFields form={editForm} setForm={setEditForm} categories={categories} />
                    <div className="flex gap-2 pt-2">
                      <Button onClick={() => handleSave(comp.id)} disabled={saving} className="clip-angled-sm gap-1 text-xs font-bold uppercase tracking-wider">
                        {saving ? <Spinner data-icon="inline-start" /> : <Check data-icon="inline-start" />} Simpan
                      </Button>
                      <Button variant="outline" onClick={handleCancelEdit} className="clip-angled-sm gap-1 text-xs font-bold uppercase tracking-wider">
                        <X data-icon="inline-start" /> Batal
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-black uppercase tracking-tight text-foreground">{comp.title}</h3>
                        <Badge variant="outline" className={cn('clip-angled-sm border text-[10px] font-bold uppercase tracking-wider', catColor)}>
                          {cat?.label || comp.category}
                        </Badge>
                        <Badge variant="outline" className="clip-angled-sm border-purple-200 bg-purple-50 text-[9px] font-bold uppercase tracking-wider text-purple-700">
                          {comp.type === 'both'
                            ? 'Tim & Individu'
                            : comp.type === 'team'
                              ? 'Tim'
                              : 'Individu'}
                        </Badge>
                        <Badge variant="outline" className={cn('clip-angled-sm border text-[9px] font-bold uppercase tracking-wider',
                          (comp as any).isFree === '1' || (comp as any).isFree === true
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-amber-200 bg-amber-50 text-amber-700')}
                        >
                          {(comp as any).isFree === '1' || (comp as any).isFree === true ? 'Gratis' : 'Berbayar'}
                        </Badge>
                        <Badge variant="outline" className="clip-angled-sm border-sky-200 bg-sky-50 text-[9px] font-bold uppercase tracking-wider text-sky-700">
                          {(comp as any).origin === 'external' ? 'Eksternal' : 'Internal'}
                        </Badge>
                        <Badge variant="outline" className={cn('clip-angled-sm border text-[9px] font-bold uppercase tracking-wider',
                          comp.isActive
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-red-200 bg-red-50 text-red-600')}
                        >
                          {comp.isActive ? 'Pendaftaran Dibuka' : 'Pendaftaran Ditutup'}
                        </Badge>
                        {((comp as any).hasBatches === true || (comp as any).hasBatches === '1') && (
                          <Badge variant="outline" className="clip-angled-sm border-cyan-300 bg-cyan-50 text-[9px] font-bold uppercase tracking-wider text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400 gap-1">
                            <Layers className="size-2.5" /> {(comp as any).batches?.length || 0} Batch
                          </Badge>
                        )}
                      </div>
                      {comp.tagline && (
                        <p className="text-sm text-slate-500 font-light mb-2">{comp.tagline}</p>
                      )}
                      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-semibold text-slate-900 dark:text-slate-100">
                          <Coins className="w-3 h-3 text-cyan-600" />
                          {(() => {
                            if ((comp as any).isFree === '1' || (comp as any).isFree === true || comp.isFree) {
                              return 'Gratis';
                            }
                            const hasBatches = (comp as any).hasBatches === true || (comp as any).hasBatches === '1';
                            if (hasBatches && Array.isArray((comp as any).batches) && (comp as any).batches.length > 0) {
                              const active = getActiveBatch((comp as any).batches);
                              if (active) {
                                return `${active.name}: Rp ${active.fee.toLocaleString('id-ID')}`;
                              }
                              return `${(comp as any).batches.length} Gelombang (Rp ${comp.fee.toLocaleString('id-ID')})`;
                            }
                            return `Rp ${comp.fee.toLocaleString('id-ID')}`;
                          })()}
                        </span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {comp.filledSlots}/{comp.maxSlots} terisi</span>
                        {comp.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {comp.location}</span>}
                        {comp.scheduleDate && (
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDateNumeric(comp.scheduleDate)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => handleToggleActive(comp)} title={comp.isActive ? 'Tutup Pendaftaran' : 'Buka Pendaftaran'} aria-label={comp.isActive ? 'Tutup Pendaftaran' : 'Buka Pendaftaran'}
                        className={comp.isActive ? 'text-emerald-600 hover:text-red-600' : 'text-red-500 hover:text-emerald-600'}>
                        {comp.isActive ? <EyeOff /> : <Eye />}
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(comp)} title="Edit" aria-label="Edit" className="text-muted-foreground hover:text-primary">
                        <Pencil />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleTimelineOpen(comp.id)} title="Atur Timeline" aria-label="Atur Timeline"
                        className={timelineOpen === comp.id ? 'text-primary' : 'text-muted-foreground hover:text-primary'}>
                        <Clock />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleWinnerOpen(comp.id)} title="Atur Sertifikat & Juara" aria-label="Atur Sertifikat dan Juara"
                        className={winnerOpenId === comp.id ? 'text-primary' : 'text-muted-foreground hover:text-primary'}>
                        <Award />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDeleteComp(comp.id)} title="Hapus" aria-label="Hapus" className="text-muted-foreground hover:text-destructive">
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                )}

                {/* ─── Timeline Manager ─── */}
                {timelineOpen === comp.id && (
                  <div className="border-t border-slate-200 mt-5 pt-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                        <Clock className="w-4 h-4 text-astro-cyan" /> Timeline Lomba
                      </h3>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {(timelineItems[comp.id] || []).length} item
                      </span>
                    </div>

                    {/* Timeline list */}
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {(timelineItems[comp.id] || []).length === 0 && (
                        <p className="text-xs text-slate-400 italic">Belum ada timeline. Tambah item baru di bawah.</p>
                      )}
                      {(timelineItems[comp.id] || []).map((item, idx) => (
                        <div key={item.id}
                          className="flex items-start gap-3 bg-slate-50 border border-slate-100 p-3 group"
                          style={{ clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)' }}
                        >
                          <span className="flex-shrink-0 w-6 h-6 text-[10px] font-black bg-cyan-100 text-cyan-700 flex items-center justify-center"
                            style={{ clipPath: 'polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)' }}
                          >
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-800 uppercase tracking-tight truncate">{item.title}</span>
                              <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">{item.date}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-1">{item.desc}</p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleTlEdit(item)}
                              className="p-1 text-slate-400 hover:text-astro-cyan cursor-pointer" title="Edit"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button onClick={() => handleTlDelete(comp.id, item.id)}
                              className="p-1 text-slate-400 hover:text-red-500 cursor-pointer" title="Hapus"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add/Edit form */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tanggal Mulai</label>
                        <input type="date" value={tlDateRange.start}
                          onChange={(e) => setTlDateRange({ ...tlDateRange, start: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 text-xs mt-1 focus:outline-none focus:border-astro-cyan"
                          style={{ clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)' }}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tanggal Akhir <span className="text-slate-400 font-normal normal-case tracking-normal">(opsional)</span></label>
                        <input type="date" value={tlDateRange.end}
                          onChange={(e) => setTlDateRange({ ...tlDateRange, end: e.target.value })}
                          min={tlDateRange.start || undefined}
                          className="w-full px-3 py-2 border border-slate-200 text-xs mt-1 focus:outline-none focus:border-astro-cyan"
                          style={{ clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)' }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Judul</label>
                        <input value={tlForm.title} onChange={(e) => setTlForm({ ...tlForm, title: e.target.value })}
                          placeholder="Pendaftaran Dibuka"
                          className="w-full px-3 py-2 border border-slate-200 text-xs mt-1 focus:outline-none focus:border-astro-cyan"
                          style={{ clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)' }}
                        />
                      </div>
                      <div className="flex gap-2 self-end">
                        <Button onClick={() => handleTlSave(comp.id)} disabled={tlSaving} size="icon" aria-label="Simpan timeline">
                          {tlSaving ? <Spinner className="size-4" /> : tlEditingId ? <Check className="size-4" /> : <Plus className="size-4" />}
                        </Button>
                        {tlEditingId && (
                          <Button variant="outline" size="icon" onClick={() => { setTlEditingId(null); setTlForm({ date: '', title: '', desc: '' }); setTlDateRange({ start: '', end: '' }); }} aria-label="Batal edit timeline">
                            <X />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Deskripsi</label>
                      <textarea value={tlForm.desc} onChange={(e) => setTlForm({ ...tlForm, desc: e.target.value })}
                        placeholder="Deskripsi item timeline..."
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-200 text-xs mt-1 focus:outline-none focus:border-astro-cyan"
                        style={{ clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)' }}
                      />
                    </div>
                  </div>
                )}

                {/* ─── Winner Manager ─── */}
                {winnerOpenId === comp.id && (
                  <div className="border-t border-slate-200 mt-5 pt-5 space-y-4">
                    <WinnerManager competitionId={comp.id} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Pagination currentPage={page} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />

      {/* Delete Modal */}
      <DeleteModal
        open={!!deleteModal}
        title={deleteModal?.title || ''}
        message={deleteModal?.message || ''}
        onConfirm={deleteModal?.onConfirm || (() => {})}
        onCancel={() => setDeleteModal(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
