"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import {
  Plus,
  Pencil,
  X,
  Check,
  Trash2,
  Building2,
  UploadCloud,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import DeleteModal from "@/components/DeleteModal";
import ImportCommittee, { normalizeImageUrl } from "@/components/ImportCommittee";
import Pagination from "@/components/Pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ImagePreviewModal from "@/components/ImagePreviewModal";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  useCommitteeMembers,
  useCommitteeDivisions,
  queryKeys,
} from "@/src/lib/hooks/use-queries";
import { apiHelpers } from "@/src/lib/api";

interface CommitteeMember {
  id: number;
  name: string;
  role: string;
  division: string;
  divisionName: string;
  image: string;
  isLeader: string | null;
  studyProgram: string | null;
  batch: string | null;
  quote: string | null;
  instagram: string | null;
  linkedin: string | null;
  sortOrder: number | null;
  createdAt: Date;
}

interface Division {
  id: number;
  name: string;
  slug: string;
  shortName: string | null;
}

const PAGE_SIZE = 10;

/** Jabatan yang tersedia — diambil dari data panitia (Google Forms). */
const JABATAN_OPTIONS = ['SC', 'PO', 'PI', 'Staff'];

export default function CommitteePage() {
  const qc = useQueryClient();
  const { data: itemsData, isLoading: loading } = useCommitteeMembers();
  const { data: divisionsData } = useCommitteeDivisions();
  const items = itemsData ?? [];
  const divisions = divisionsData ?? [];
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterDivision, setFilterDivision] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [showDivManager, setShowDivManager] = useState(false);
  const [divForm, setDivForm] = useState({ name: "", shortName: "", slug: "" });
  const [divEditingId, setDivEditingId] = useState<number | null>(null);
  const [divSaving, setDivSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    role: "",
    division: "",
    divisionName: "",
    image: "",
    isLeader: "0",
    studyProgram: "",
    batch: "",
    quote: "",
    instagram: "",
    linkedin: "",
  });
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: queryKeys.committeeMembers.all });
    qc.invalidateQueries({ queryKey: queryKeys.committeeDivisions.all });
  };

  const saveMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      editingId
        ? apiHelpers.committeeMembers.update(String(editingId), body)
        : apiHelpers.committeeMembers.create(body),
    onSuccess: () => {
      setForm({
        name: "",
        role: "",
        division: divisions[0]?.slug || "",
        divisionName: divisions[0]?.name || "",
        image: "",
        isLeader: "0",
        studyProgram: "",
        batch: "",
        quote: "",
        instagram: "",
        linkedin: "",
      });
      setEditingId(null);
      setShowAdd(false);
      toast.success(editingId ? "Anggota diperbarui" : "Anggota ditambahkan");
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiHelpers.committeeMembers.remove(String(id)),
    onSuccess: () => {
      toast.success("Anggota dihapus");
      setDeleteModal(null);
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const divSaveMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      divEditingId
        ? apiHelpers.committeeDivisions.update(String(divEditingId), body)
        : apiHelpers.committeeDivisions.create(body),
    onSuccess: () => {
      setDivForm({ name: "", shortName: "", slug: "" });
      setDivEditingId(null);
      toast.success(divEditingId ? "Divisi diperbarui" : "Divisi ditambahkan");
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const divDeleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiHelpers.committeeDivisions.remove(String(id)),
    onSuccess: () => {
      toast.success("Divisi dihapus");
      setDivEditingId(null);
      setDivForm({ name: "", shortName: "", slug: "" });
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleDivisionChange = (slug: string) => {
    const div = divisions.find((d) => d.slug === slug);
    setForm({ ...form, division: slug, divisionName: div?.name || slug });
  };

  const handleEdit = (item: CommitteeMember) => {
    setForm({
      name: item.name,
      role: item.role,
      division: item.division,
      divisionName: item.divisionName,
      image: item.image,
      isLeader: item.isLeader || "0",
      studyProgram: item.studyProgram || "",
      batch: item.batch || "",
      quote: item.quote || "",
      instagram: item.instagram || "",
      linkedin: item.linkedin || "",
    });
    setEditingId(item.id);
    setShowAdd(true);
  };

  /** Siapkan URL foto: terima link Google Drive lalu ubah jadi URL gambar yang bisa tampil. */
  const prepareImage = (raw: string) => normalizeImageUrl(raw);

  const handleSave = async () => {
    if (!form.name || !form.role || !form.division || !form.image) {
      toast.error("Nama, jabatan, divisi, dan foto wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const body = {
        ...form,
        image: prepareImage(form.image),
        divisionName: form.divisionName || form.division,
        isLeader: form.isLeader === "1",
      };
      await saveMutation.mutateAsync(body);
    } catch {
      toast.error("Gagal menyimpan");
    }
    setSaving(false);
  };

  const handleDelete = (id: number, name: string) => {
    setDeleteModal({
      title: "Hapus Anggota",
      message: 'Yakin ingin menghapus "' + name + '"?',
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id);
      },
    });
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDivSave = async () => {
    if (!divForm.name || !divForm.slug) {
      toast.error("Nama dan slug wajib diisi");
      return;
    }
    setDivSaving(true);
    try {
      await divSaveMutation.mutateAsync(divForm);
    } catch {
      toast.error("Gagal menyimpan divisi");
    }
    setDivSaving(false);
  };

  const handleDivEdit = (div: Division) => {
    setDivForm({
      name: div.name,
      shortName: (div as any).shortName || "",
      slug: div.slug,
    });
    setDivEditingId(div.id);
  };

  const handleDivDelete = async (id: number) => {
    await divDeleteMutation.mutateAsync(id);
  };

  const filtered = items.filter((item) => {
    const q = search.trim().toLowerCase();
    if (q && !`${item.name} ${item.role} ${item.divisionName} ${item.studyProgram || ''} ${item.batch || ''}`.toLowerCase().includes(q)) {
      return false;
    }
    if (filterRole && filterRole !== "all" && item.role !== filterRole) return false;
    if (filterDivision && filterDivision !== "all" && item.division !== filterDivision) return false;
    return true;
  });

  const roles = Array.from(new Set(items.map((i) => i.role).filter(Boolean)));
  const divSlugs = Array.from(new Set(items.map((i) => i.division).filter(Boolean)));

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSelectAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      const pageIds = paginated.map((p) => p.id);
      const allSelected = pageIds.length > 0 && pageIds.every((id) => next.has(id));
      pageIds.forEach((id) => {
        if (allSelected) next.delete(id);
        else next.add(id);
      });
      return next;
    });
  };

  const isPageSelected = paginated.length > 0 && paginated.every((p) => selected.has(p.id));

  const handleBulkDelete = () => {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    setDeleteModal({
      title: "Hapus Anggota Terpilih",
      message:
        "Yakin ingin menghapus " +
        ids.length +
        ' anggota terpilih sekaligus? Tindakan ini tidak bisa dibatalkan.',
      onConfirm: async () => {
        await Promise.all(ids.map((id) => deleteMutation.mutateAsync(id)));
        setSelected(new Set());
      },
    });
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner className="size-6 text-primary" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">
            Committee
          </h1>
          <p className="mt-1 text-sm font-light text-muted-foreground">
            {items.length} anggota
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowImport(!showImport);
              setShowDivManager(false);
              setShowAdd(false);
            }}
            className="clip-angled text-xs font-bold uppercase tracking-wider"
          >
            <UploadCloud data-icon="inline-start" /> Import
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setShowDivManager(!showDivManager);
              setShowAdd(false);
              setShowImport(false);
            }}
            className="clip-angled text-xs font-bold uppercase tracking-wider"
          >
            <Building2 data-icon="inline-start" /> Kelola Divisi
          </Button>
          <Button
            onClick={() => {
              setShowAdd(!showAdd);
              setShowDivManager(false);
              setShowImport(false);
              setEditingId(null);
              setForm({
                name: "",
                role: "",
                division: divisions[0]?.slug || "",
                divisionName: divisions[0]?.name || "",
                image: "",
                isLeader: "0",
                studyProgram: "",
                batch: "",
                quote: "",
                instagram: "",
                linkedin: "",
              });
            }}
            className="clip-angled text-xs font-bold uppercase tracking-wider"
          >
            <Plus data-icon="inline-start" /> Tambah Anggota
          </Button>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari nama, jabatan, divisi, prodi..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={filterRole} onValueChange={(v) => { setFilterRole(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Jabatan" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Semua Jabatan</SelectItem>
                {roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select value={filterDivision} onValueChange={(v) => { setFilterDivision(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Divisi" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Semua Divisi</SelectItem>
                {divSlugs.map((s) => {
                  const div = divisions.find((d) => d.slug === s);
                  return <SelectItem key={s} value={s}>{div?.name || s}</SelectItem>;
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
          {(search || filterRole || filterDivision) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSearch(""); setFilterRole(""); setFilterDivision(""); setPage(1); }}
              className="clip-angled-sm gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
            >
              <X className="size-3" /> Reset
            </Button>
          )}
        </div>
      </div>

      {filtered.length !== items.length && (
        <p className="text-[11px] text-muted-foreground">
          Menampilkan {filtered.length} dari {items.length} anggota
        </p>
      )}

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-foreground">
            <input
              type="checkbox"
              checked={isPageSelected}
              onChange={toggleSelectAll}
              className="size-4 accent-destructive"
            />
            Pilih {paginated.length} di halaman ini
          </label>
          <span className="text-xs text-muted-foreground">{selected.size} anggota terpilih</span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            className="clip-angled-sm ml-auto gap-1 text-[10px] font-bold uppercase tracking-wider"
          >
            <Trash2 className="size-3.5" /> Hapus Terpilih
          </Button>
        </div>
      )}

      {/* Import CSV/Excel */}
      {showImport && (
        <Card className="clip-angled relative border-border">
          <div className="absolute -top-px -left-px size-8 bg-primary" style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }} />
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-tight text-foreground">Import Anggota</h2>
              <Button variant="ghost" size="icon-sm" onClick={() => setShowImport(false)} aria-label="Tutup"><X /></Button>
            </div>
            <ImportCommittee onImported={invalidate} />
          </CardContent>
        </Card>
      )}

      {/* Division Manager */}
      {showDivManager && (
        <Card className="clip-angled relative border-border">
          <div className="absolute -top-px -left-px size-8 bg-primary" style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }} />
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-tight text-foreground">
                Kelola Divisi
              </h2>
              <Button variant="ghost" size="icon-sm" onClick={() => setShowDivManager(false)} aria-label="Tutup"><X /></Button>
            </div>
            <FieldGroup className="flex items-end gap-3">
              <Field className="flex-1">
                <FieldLabel required>Nama Divisi</FieldLabel>
                <Input
                  value={divForm.name}
                  onChange={(e) => {
                    const nameVal = e.target.value;
                    setDivForm({
                      ...divForm,
                      name: nameVal,
                      slug: nameVal
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, ""),
                    });
                  }}
                  placeholder="Badan Pengurus Harian"
                />
              </Field>
              <Field className="flex-1">
                <FieldLabel>Singkatan <span className="font-normal normal-case text-muted-foreground">(opsional)</span></FieldLabel>
                <Input
                  value={divForm.shortName}
                  onChange={(e) => setDivForm({ ...divForm, shortName: e.target.value })}
                  placeholder="BPH"
                />
              </Field>
              <Field className="flex-1">
                <FieldLabel required>Slug</FieldLabel>
                <Input
                  value={divForm.slug}
                  onChange={(e) => setDivForm({ ...divForm, slug: e.target.value })}
                  placeholder="bph"
                />
              </Field>
              <Button onClick={handleDivSave} disabled={divSaving} size="icon" aria-label="Simpan divisi">
                {divSaving ? <Spinner className="size-4" /> : divEditingId ? <Check className="size-4" /> : <Plus className="size-4" />}
              </Button>
              {divEditingId && (
                <Button variant="outline" onClick={() => { setDivEditingId(null); setDivForm({ name: "", shortName: "", slug: "" }); }} className="text-xs font-bold uppercase tracking-wider">
                  Batal
                </Button>
              )}
            </FieldGroup>
            <div className="flex flex-wrap gap-2">
              {divisions.map((d) => {
                const displayLabel = d.shortName
                  ? `${d.name} (${d.shortName})`
                  : d.name;
                return (
                  <Badge key={d.id} variant="secondary" className="gap-2 border border-border px-3 py-1.5 text-xs font-bold">
                    <span>{displayLabel}</span>
                    <Button variant="ghost" size="icon-xs" onClick={() => handleDivEdit(d)} aria-label="Edit" className="ml-1 text-muted-foreground hover:text-primary"><Pencil /></Button>
                    <Button variant="ghost" size="icon-xs" onClick={() => handleDivDelete(d.id)} aria-label="Hapus" className="text-muted-foreground hover:text-destructive"><X /></Button>
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {showAdd && (
        <Card className="clip-angled relative border-border">
          <div className="absolute -top-px -left-px size-8 bg-primary" style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }} />
          <CardContent className="space-y-4 p-5">
            <h2 className="text-sm font-black uppercase tracking-tight text-foreground">
              {editingId ? "Edit" : "Tambah"} Anggota
            </h2>
            <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field>
                <FieldLabel required>Nama</FieldLabel>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama" />
              </Field>
              <Field>
                <FieldLabel required>Jabatan</FieldLabel>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih jabatan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {JABATAN_OPTIONS.map((j) => (
                        <SelectItem key={j} value={j}>{j}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel required>Divisi</FieldLabel>
                <Select value={form.division} onValueChange={handleDivisionChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {divisions.map((d) => {
                        const label = d.shortName
                          ? `${d.name} (${d.shortName})`
                          : d.name;
                        return (
                          <SelectItem key={d.slug} value={d.slug}>{label}</SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <input type="hidden" value={form.divisionName} />
              </Field>
              <Field>
                <FieldLabel>Quote</FieldLabel>
                <Input value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} placeholder="Quote" />
              </Field>
              <Field>
                <FieldLabel>Instagram</FieldLabel>
                <Input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="@username" />
              </Field>
            </FieldGroup>
            <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field>
                <FieldLabel>Prodi</FieldLabel>
                <Input value={form.studyProgram} onChange={(e) => setForm({ ...form, studyProgram: e.target.value })} placeholder="Teknik Informatika" />
              </Field>
              <Field>
                <FieldLabel>Angkatan</FieldLabel>
                <Input value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} placeholder="2024" />
              </Field>
              <Field>
                <FieldLabel>LinkedIn</FieldLabel>
                <Input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="URL LinkedIn" />
              </Field>
              <Field>
                <FieldLabel required>Foto</FieldLabel>
                <div className="space-y-2">
                  <Input
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="URL Google Drive / link gambar langsung..."
                    className="flex-1"
                  />
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>atau</span>
                    <label className="cursor-pointer">
                      <span className={cn(
                        "clip-angled-sm inline-block border border-border px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors",
                        uploading ? "bg-primary text-primary-foreground opacity-70 cursor-not-allowed" : "bg-muted text-muted-foreground hover:bg-accent"
                      )}>
                        {uploading ? "Mengunggah..." : "Upload File"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploading(true);
                          try {
                            const uploadRes = await apiHelpers.upload(file);
                            const url = (uploadRes as any)?.url;
                            if (url) {
                              setForm({ ...form, image: url });
                              toast.success('File berhasil diunggah');
                            }
                          } catch (err: any) {
                            toast.error(err.message || 'Gagal mengunggah file');
                            console.error("Upload failed", err);
                          } finally {
                            setUploading(false);
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                    <span className="ml-auto">Paste link Drive: <code className="rounded bg-muted px-1 py-0.5">drive.google.com/file/d/…</code></span>
                  </div>
                </div>
              </Field>
            </FieldGroup>
            {form.image && (
              <div className="clip-angled-sm flex items-center gap-3 border border-border bg-muted/50 p-3">
                <button
                  type="button"
                  onClick={() => setPreviewImage(form.image)}
                  className="overflow-hidden rounded-full transition-opacity hover:opacity-80"
                >
                  <Image src={prepareImage(form.image)} alt="Preview" width={48} height={48} unoptimized className="size-12 object-cover" />
                </button>
                <span className="text-xs text-muted-foreground">Preview</span>
                <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, image: "" })} className="ml-auto text-xs text-destructive hover:text-destructive">Hapus</Button>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving} className="clip-angled-sm gap-1 text-xs font-bold uppercase tracking-wider">
                {saving ? <Spinner data-icon="inline-start" /> : <Check data-icon="inline-start" />} Simpan
              </Button>
              <Button variant="outline" className="clip-angled-sm gap-1 text-xs font-bold uppercase tracking-wider"
                onClick={() => {
                  setShowAdd(false);
                  setEditingId(null);
                  setForm({
                    name: "",
                    role: "",
                    division: divisions[0]?.slug || "",
                    divisionName: divisions[0]?.name || "",
                    image: "",
                    isLeader: "0",
                    studyProgram: "",
                    batch: "",
                    quote: "",
                    instagram: "",
                    linkedin: "",
                  });
                }}>
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
                <input
                  type="checkbox"
                  checked={selected.has(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  aria-label={`Pilih ${item.name}`}
                  className="size-4 shrink-0 accent-primary"
                />
                {item.image ? (
                  <button
                    type="button"
                    onClick={() => setPreviewImage(item.image)}
                    className="overflow-hidden rounded-full transition-opacity hover:opacity-80"
                  >
                    <Image src={normalizeImageUrl(item.image)} alt="" width={40} height={40} unoptimized className="size-10 object-cover" />
                  </button>
                ) : (
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted text-[10px] font-bold uppercase text-muted-foreground">
                    {item.name.charAt(0)}
                  </div>
                )}
                <div>
                  <span className="text-sm font-bold text-foreground">{item.name}</span>
                  <div className="mt-0.5 flex gap-2">
                    <span className="text-[10px] font-semibold text-muted-foreground">{item.role}</span>
                    {item.isLeader === "1" && (
                      <Badge variant="outline" className="clip-angled-sm border-amber-200 bg-amber-50 text-[9px] font-bold uppercase text-amber-700">
                        Koordinator
                      </Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground/60">|</span>
                    <span className="text-[10px] text-muted-foreground">{item.divisionName || item.division}</span>
                    {(item.studyProgram || item.batch) && (
                      <span className="text-[10px] text-muted-foreground/60">
                        · {[item.studyProgram, item.batch].filter(Boolean).join(' ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(item)} aria-label="Edit"><Pencil /></Button>
                <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(item.id, item.name)} aria-label="Hapus" className="text-muted-foreground hover:text-destructive"><Trash2 /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {paginated.length === 0 && (
          <p className="py-4 text-center text-sm italic text-muted-foreground">
            {items.length === 0 ? "Belum ada anggota committee." : "Tidak ada anggota yang cocok dengan pencarian/filter."}
          </p>
        )}
      </div>
      <Pagination
        currentPage={page}
        totalItems={items.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      <DeleteModal
        open={!!deleteModal}
        title={deleteModal?.title || ""}
        message={deleteModal?.message || ""}
        onConfirm={deleteModal?.onConfirm || (() => {})}
        onCancel={() => setDeleteModal(null)}
        loading={false}
      />
      <ImagePreviewModal url={previewImage} onClose={() => setPreviewImage(null)} />
    </div>
  );
}
