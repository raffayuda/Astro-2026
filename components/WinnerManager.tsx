'use client';

import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Trophy, Award, Check, X, Send, Users, Mail,
  Upload, ExternalLink, Save, FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import Pagination from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { apiHelpers } from '@/src/lib/api';
import { useRegistrations } from '@/src/lib/hooks/use-queries';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 5;

interface CertItem {
  name: string;
  url: string;
}

interface Registration {
  id: string;
  type: string;
  fullName: string | null;
  teamName: string | null;
  leaderName: string | null;
  email: string;
  institution: string;
  paymentStatus: string;
  isWinner: string;
  winnerRank: string | null;
  certificateSent: string;
  certificates: CertItem[];
}

interface DraftEntry {
  isWinner: string;
  winnerRank: string | null;
}

interface WinnerManagerProps {
  competitionId: string;
}

export default function WinnerManager({ competitionId }: WinnerManagerProps) {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const [draftChanges, setDraftChanges] = useState<Record<string, DraftEntry>>({});

  // New cert input per reg (before save)
  const [newCert, setNewCert] = useState<Record<string, { name: string; uploading: boolean; preview?: string }>>({});

  const { data: regsRaw, isLoading: loading } = useRegistrations({ competitionId, pageSize: 100 });

  const registrations: Registration[] = useMemo(() => {
    const list = Array.isArray(regsRaw) ? regsRaw : (regsRaw as any)?.data ?? [];
    const seen = new Set<string>();
    return list.filter((r: Registration) => {
      if (r.paymentStatus !== 'paid') return false;
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
  }, [regsRaw]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['registrations'] });

  const updateRegistrationMutation = useMutation({
    mutationFn: ({ regId, body }: { regId: string; body: unknown }) =>
      apiHelpers.registrations.update(regId, body),
    onSuccess: invalidate,
  });

  const sendCertMutation = useMutation({
    mutationFn: (body: { registrationId: string; competitionId: string }) =>
      apiHelpers.certificates.send(body),
    onSuccess: invalidate,
  });

  // ─── Multi Upload per Peserta ───
  const handleUploadCert = async (e: React.ChangeEvent<HTMLInputElement>, regId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const name = newCert[regId]?.name?.trim() || file.name.replace(/\.[^/.]+$/, '');
    if (!name) {
      toast.error('Masukkan nama peserta untuk sertifikat ini');
      return;
    }

    // Local preview (object URL) shown while the file uploads
    const preview = URL.createObjectURL(file);
    setNewCert((prev) => ({ ...prev, [regId]: { name, uploading: true, preview } }));
    try {
      const uploadRes = await apiHelpers.upload(file);
      const url = (uploadRes as any)?.url;
      URL.revokeObjectURL(preview);
      if (!url) { toast.error('Gagal upload'); setNewCert((prev) => ({ ...prev, [regId]: { name, uploading: false } })); return; }

      // Get current certs
      const reg = registrations.find((r) => r.id === regId);
      const current = reg?.certificates || [];
      const updated = [...current, { name, url }];

      await updateRegistrationMutation.mutateAsync({ regId, body: { certificates: updated } });
      toast.success(`Sertifikat untuk "${name}" berhasil ditambahkan`);
      setNewCert((prev) => {
        const next = { ...prev };
        delete next[regId];
        return next;
      });
    } catch {
      URL.revokeObjectURL(preview);
      toast.error('Upload gagal');
      setNewCert((prev) => ({ ...prev, [regId]: { name, uploading: false } }));
    }
  };

  const handleDeleteCert = async (regId: string, certUrl: string) => {
    const reg = registrations.find((r) => r.id === regId);
    if (!reg) return;
    const updated = reg.certificates.filter((c) => c.url !== certUrl);
    try {
      await updateRegistrationMutation.mutateAsync({ regId, body: { certificates: updated } });
      toast.success('Sertifikat dihapus');
    } catch {
      toast.error('Gagal menghapus');
    }
  };

  // ─── Toggle Winner (Draft) ───
  const getEffective = (reg: Registration) => {
    const draft = draftChanges[reg.id];
    if (draft) return draft;
    return { isWinner: reg.isWinner, winnerRank: reg.winnerRank };
  };

  const handleToggleWinner = (regId: string, rank: string) => {
    const reg = registrations.find((r) => r.id === regId);
    if (!reg) return;
    const eff = getEffective(reg);
    // rank === '' berarti ToggleGroup dideaktivasi (klik tombol juara yang sama
    // untuk membatalkan) → batalkan status juara
    if (!rank || (eff.isWinner === '1' && eff.winnerRank === rank)) {
      setDraftChanges((prev) => ({ ...prev, [regId]: { isWinner: '0', winnerRank: null } }));
      return;
    }
    setDraftChanges((prev) => ({ ...prev, [regId]: { isWinner: '1', winnerRank: rank } }));
  };

  // ─── Bulk Save ───
  const hasChanges = Object.keys(draftChanges).length > 0;
  const [saving, setSaving] = useState(false);

  const handleSaveAll = async () => {
    if (!hasChanges) return;
    setSaving(true);
    const entries = Object.entries(draftChanges);
    let success = 0;
    let fail = 0;
    for (const [regId, change] of entries) {
      try {
        // Sequential PATCHes keep the success/fail count deterministic
        // oxlint-disable-next-line no-await-in-loop
        await updateRegistrationMutation.mutateAsync({
          regId,
          body: { isWinner: change.isWinner, winnerRank: change.winnerRank },
        });
        success++;
      } catch { fail++; }
    }
    if (fail === 0) toast.success(`Semua ${success} perubahan berhasil disimpan`);
    else toast.warning(`${success} berhasil, ${fail} gagal`);
    setDraftChanges({});
    setSaving(false);
  };

  // ─── Send Certificate Email ───
  const sendCertificate = async (reg: Registration) => {
    try {
      await sendCertMutation.mutateAsync({ registrationId: reg.id, competitionId });
      toast.success('Sertifikat berhasil dikirim ke ' + reg.email);
    } catch {
      toast.error('Gagal mengirim sertifikat');
    }
  };

  const paginated = registrations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return <div className="flex justify-center py-8"><Spinner className="size-5 text-primary" /></div>;
  }

  return (
    <div className="space-y-5 text-left text-foreground">
      <div className="flex flex-col justify-between gap-3 border-b border-border pb-3 md:flex-row md:items-center">
        <div>
          <h4 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-foreground">
            <Award className="size-4 text-primary" /> Kelola Juara & Sertifikat
          </h4>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            Tentukan juara dan upload sertifikat per anggota tim/peserta.
          </p>
        </div>
      </div>

      {/* Registrations List */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          <span>Daftar Peserta ({registrations.length} Lunas)</span>
          <span>Halaman {page} dari {Math.max(1, Math.ceil(registrations.length / PAGE_SIZE))}</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {paginated.map((reg) => {
            const name = reg.fullName || reg.teamName || reg.leaderName || 'Peserta';
            const eff = getEffective(reg);
            const isWinner = eff.isWinner === '1';
            const isSent = reg.certificateSent === '1';
            const isDraft = !!draftChanges[reg.id];
            const certs = reg.certificates || [];

            return (
              <div key={reg.id}
                className={`border p-3 transition-colors ${
                  isDraft ? 'bg-amber-50/80 border-amber-200' : 'bg-slate-50 border-slate-200'
                }`}
                style={{ clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)' }}
              >
                {/* Info Baris Atas */}
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-tight text-foreground">{name}</span>
                      {reg.type === 'team' && (
                        <Badge variant="secondary" className="rounded bg-muted text-[8px] font-bold uppercase tracking-wider text-muted-foreground">Tim</Badge>
                      )}
                      {isWinner && (
                        <Badge variant="outline" className={cn('clip-angled-sm gap-0.5 border text-[9px] font-bold uppercase tracking-wider',
                          isDraft ? 'border-amber-300 bg-amber-200 text-amber-900' : 'border-amber-200 bg-amber-100 text-amber-800')}>
                          <Trophy className="size-2.5" /> Juara {eff.winnerRank}
                          {isDraft && <span className="ml-0.5 text-[7px] opacity-60">(draft)</span>}
                        </Badge>
                      )}
                      {isSent && (
                        <Badge variant="outline" className="clip-angled-sm gap-0.5 border border-emerald-200 bg-emerald-100 text-[9px] font-bold uppercase tracking-wider text-emerald-800">
                          <Check className="size-2.5" /> Terkirim
                        </Badge>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Mail className="size-3 text-muted-foreground" /> {reg.email}
                      <span>•</span>
                      <span>{reg.institution}</span>
                    </div>
                  </div>

                  <div className="flex flex-shrink-0 items-center gap-1.5">
                    {/* Winner Buttons */}
                    <ToggleGroup type="single" value={isWinner && eff.winnerRank ? eff.winnerRank : ''} onValueChange={(v) => handleToggleWinner(reg.id, v)} spacing={0} className="border border-border bg-background p-0.5">
                      {['1', '2', '3'].map((rank) => {
                        const active = isWinner && eff.winnerRank === rank;
                        return (
                          <ToggleGroupItem key={rank} value={rank}
                            className={cn('size-7 text-[10px] font-black text-muted-foreground hover:bg-muted hover:text-muted-foreground',
                              active && 'bg-amber-400 text-amber-950 shadow-sm hover:bg-amber-400 hover:text-amber-950')}
                            title={active ? `Batalkan Juara ${rank}` : `Tandai Juara ${rank}`}>
                            {rank}
                          </ToggleGroupItem>
                        );
                      })}
                    </ToggleGroup>

                    {/* Send button */}
                    <Button onClick={() => sendCertificate(reg)} disabled={saving} size="sm"
                      className={cn('clip-angled-sm gap-1 text-[9px] font-bold uppercase tracking-wider', isSent && 'bg-muted text-muted-foreground hover:bg-muted')}>
                      <Send data-icon="inline-start" className="size-2.5" /> {isSent ? 'Kirim Ulang' : 'Kirim'}
                    </Button>
                  </div>
                </div>

                {/* ─── Daftar Sertifikat yang sudah diupload ─── */}
                {certs.length > 0 && (
                  <div className="border-t border-slate-200 pt-2 mt-2 space-y-1.5">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Sertifikat Terupload:</p>
                    {certs.map((c, i) => (
                      <div key={i} className="flex items-center justify-between bg-white border border-slate-100 px-2.5 py-1.5"
                        style={{ clipPath: 'polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)' }}>
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="text-[11px] font-bold text-slate-700 truncate">{c.name}</span>
                          <a href={c.url} target="_blank" rel="noopener noreferrer"
                            className="text-slate-400 hover:text-astro-cyan flex-shrink-0" title="Lihat">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <button onClick={() => handleDeleteCert(reg.id, c.url)}
                          className="p-0.5 text-slate-400 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* ─── Upload Sertifikat Baru ─── */}
                <div className="mt-2 flex items-center gap-2 border-t border-border pt-2">
                  <Input
                    value={newCert[reg.id]?.name || ''}
                    onChange={(e) => setNewCert((prev) => ({ ...prev, [reg.id]: { name: e.target.value, uploading: prev[reg.id]?.uploading || false } }))}
                    placeholder="Nama anggota..."
                    className="min-w-0 flex-1 bg-background"
                  />
                  <label className="flex-shrink-0 cursor-pointer">
                    <Button asChild size="sm" variant="outline" disabled={newCert[reg.id]?.uploading}
                      className="clip-angled-sm gap-1 text-[9px] font-bold uppercase tracking-wider">
                      <span>
                        {newCert[reg.id]?.uploading ? <Spinner className="size-3" /> : <Upload className="size-3" />}
                        {newCert[reg.id]?.uploading ? 'Mengunggah...' : 'Upload'}
                      </span>
                    </Button>
                    <input type="file" accept="image/*,.pdf" className="hidden"
                      disabled={newCert[reg.id]?.uploading}
                      onChange={(e) => handleUploadCert(e, reg.id)} />
                  </label>
                </div>
                {newCert[reg.id]?.preview && (
                  <div className="mt-2 flex items-center gap-2 border border-slate-100 bg-slate-50 px-2 py-1.5"
                    style={{ clipPath: 'polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={newCert[reg.id]?.preview} alt={newCert[reg.id]?.name || 'Preview'} className="size-7 rounded object-cover" />
                    <span className="text-[10px] font-semibold text-slate-500">
                      {newCert[reg.id]?.uploading ? 'Mengunggah...' : 'Preview sertifikat'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {registrations.length === 0 && (
            <div className="bg-slate-50 border border-slate-200 border-dashed py-8 text-center"
              style={{ clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)' }}>
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400 italic">Belum ada peserta yang melakukan pembayaran lunas.</p>
            </div>
          )}
        </div>

        <Pagination currentPage={page} totalItems={registrations.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
      </div>

      {/* Sticky Bottom Bulk Save */}
      {hasChanges && (
        <div className="clip-angled sticky bottom-0 -mx-1 -mb-1 border-t-2 border-amber-300 bg-background p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-tight text-foreground">
                {hasChanges} perubahan belum disimpan
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Klik simpan untuk mengirim perubahan juara ke server.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setDraftChanges({}); toast.info('Perubahan dibatalkan'); }}
                disabled={saving} className="clip-angled-sm gap-1 text-xs font-bold uppercase tracking-wider">
                <X data-icon="inline-start" className="size-3.5" /> Batal
              </Button>
              <Button onClick={handleSaveAll} disabled={saving}
                className="clip-angled-sm gap-1.5 bg-amber-500 text-xs font-black uppercase tracking-wider text-amber-950 hover:bg-amber-400">
                {saving ? <Spinner data-icon="inline-start" className="size-3.5" /> : <Save data-icon="inline-start" className="size-3.5" />}
                {saving ? 'Menyimpan...' : 'Simpan Semua'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
