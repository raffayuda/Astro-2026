"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Pencil,
  X,
  Check,
  Plus,
  Trophy,
  Coins,
  Users,
  MapPin,
  Calendar,
  Tag,
  Trash2,
  EyeOff,
  Eye,
  Clock,
  Award,
  Layers,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import {
  DataToolbar,
  EmptyState,
  PageHeader,
  PageShell,
  SectionCard,
  SegmentedControl,
  StatusBadge,
} from "@/components/dashboard";
import DeleteModal from "@/components/DeleteModal";
import Pagination from "@/components/Pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import WinnerManager from "@/components/WinnerManager";
import { useCompetitions, useCategories, queryKeys } from "@/src/lib/hooks/use-queries";
import { apiHelpers } from "@/src/lib/api";
import { errorMessage, isFlagOn } from "@/lib/flags";
import { formatDateNumeric } from "@/lib/date";
import { getActiveBatch } from "@/src/lib/competitions";
import { compExtras, type Competition } from "./competition-form";

const PAGE_SIZE = 10;

/** Tailwind class triplets offered for a category badge. */
const CATEGORY_COLORS = [
  { label: "Hijau (Akademik)", value: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { label: "Oranye (Olahraga)", value: "text-orange-700 bg-orange-50 border-orange-200" },
  { label: "Cyan (Esports)", value: "text-astro-navy bg-sky-bottom border-astro-cyan-2" },
  { label: "Ungu", value: "text-purple-700 bg-purple-50 border-purple-200" },
  { label: "Pink", value: "text-pink-700 bg-pink-50 border-pink-200" },
  { label: "Amber", value: "text-amber-700 bg-amber-50 border-amber-200" },
];

interface Category {
  id: string;
  label: string;
  color: string;
  sortOrder: number | null;
  createdAt: Date;
}

export default function KompetisiPage() {
  const qc = useQueryClient();
  const { data: compsData, isLoading: loading } = useCompetitions();
  const { data: catsData } = useCategories();
  const competitions = compsData ?? [];
  const categories = catsData ?? [];
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"newest" | "az" | "za">("newest");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Category manager state
  const [showCatManager, setShowCatManager] = useState(false);
  const [catForm, setCatForm] = useState({
    id: "",
    label: "",
    color: "text-astro-navy bg-sky-bottom border-astro-cyan-2",
  });
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catSaving, setCatSaving] = useState(false);

  // Delete modal
  const [deleteModal, setDeleteModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

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
  const [tlForm, setTlForm] = useState({ date: "", title: "", desc: "" });
  const [tlEditingId, setTlEditingId] = useState<number | null>(null);
  const [tlSaving, setTlSaving] = useState(false);
  const [tlDateRange, setTlDateRange] = useState({ start: "", end: "" });

  const invalidate = (id?: string) => {
    qc.invalidateQueries({ queryKey: queryKeys.competitions.all });
    qc.invalidateQueries({ queryKey: ["competitions"] });
    if (id) {
      qc.invalidateQueries({ queryKey: queryKeys.competitions.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.competitions.timeline(id) });
    }
    qc.invalidateQueries({ queryKey: queryKeys.categories.all });
  };
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      apiHelpers.competitions.update(id, body),
    onSuccess: (_data, variables) => invalidate(variables.id),
  });

  const deleteCompMutation = useMutation({
    mutationFn: (id: string) => apiHelpers.competitions.remove(id),
    onSuccess: (_data, id) => {
      toast.success("Lomba berhasil dihapus");
      invalidate(id);
    },
    onError: () => toast.error("Gagal menghapus lomba"),
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
    onError: () => console.error("Category save failed"),
  });

  const catDeleteMutation = useMutation({
    mutationFn: (id: string) => apiHelpers.categories.remove(id),
    onSuccess: () => invalidate(),
  });

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
      toast.success(newStatus ? "Lomba diaktifkan" : "Lomba dinonaktifkan");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Gagal mengubah status");
    }
  };

  /* ─── Delete Competition ─── */
  const handleDeleteComp = (id: string) => {
    setDeleteModal({
      title: "Hapus Lomba",
      message: "Yakin ingin menghapus lomba ini? Tindakan ini tidak bisa dibatalkan.",
      onConfirm: async () => {
        setDeleteLoading(true);
        try {
          await deleteCompMutation.mutateAsync(id);
        } catch (err) {
          console.error(err);
          toast.error("Gagal menghapus lomba");
        }
        setDeleteLoading(false);
      },
    });
  };

  /* ─── Timeline CRUD ─── */
  const composeDate = (start: string, end: string) => {
    if (!start) return "";
    const s = new Date(start + "T00:00:00").toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (!end) return s;
    const e = new Date(end + "T00:00:00").toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
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
    setTlForm({ date: "", title: "", desc: "" });
    setTlDateRange({ start: "", end: "" });
    try {
      const items = await apiHelpers.competitions.timeline(compId);
      setTimelineItems((prev) => ({ ...prev, [compId]: items ?? [] }));
    } catch {
      toast.error("Gagal memuat timeline");
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
      toast.error("Judul, tanggal, dan deskripsi wajib diisi");
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
      setTlForm({ date: "", title: "", desc: "" });
      setTlDateRange({ start: "", end: "" });
      setTlEditingId(null);
      toast.success(tlEditingId ? "Timeline diperbarui" : "Timeline ditambahkan");
      const items = await apiHelpers.competitions.timeline(compId);
      setTimelineItems((prev) => ({ ...prev, [compId]: items ?? [] }));
    } catch {
      toast.error("Gagal menyimpan timeline");
    }
    setTlSaving(false);
  };

  const handleTlEdit = (item: TimelineItemData) => {
    setTlEditingId(item.id);
    setTlForm({ date: item.date, title: item.title, desc: item.desc });
    // Try to parse existing date back to range
    const parts = item.date.split(" - ");
    if (parts.length === 2) {
      // Convert Indonesian date-ish back to YYYY-MM-DD - best effort
      const guess = (s: string) => {
        try {
          return new Date(s).toISOString().split("T")[0];
        } catch {
          return "";
        }
      };
      setTlDateRange({ start: guess(parts[0]), end: guess(parts[1]) });
    } else {
      const d = new Date(item.date).toISOString().split("T")[0];
      setTlDateRange({ start: d, end: "" });
    }
  };

  const handleTlDelete = async (compId: string, itemId: number) => {
    if (!confirm("Hapus item timeline ini?")) return;
    try {
      await apiHelpers.competitions.removeTimeline(compId, String(itemId));
      toast.success("Item timeline dihapus");
      const items = await apiHelpers.competitions.timeline(compId);
      setTimelineItems((prev) => ({ ...prev, [compId]: items ?? [] }));
    } catch {
      toast.error("Gagal menghapus item timeline");
    }
  };

  /* ─── Category CRUD ─── */
  const handleCatSave = async () => {
    if (!catForm.label) return;
    setCatSaving(true);
    try {
      await catSaveMutation.mutateAsync(catForm);
      setCatForm({ id: "", label: "", color: "text-astro-navy bg-sky-bottom border-astro-cyan-2" });
    } catch (err) {
      console.error(err);
    }
    setCatSaving(false);
  };

  const handleCatEdit = (cat: Category) => {
    setCatForm({ id: cat.id, label: cat.label, color: cat.color });
    setEditingCatId(cat.id);
  };

  const handleCatDelete = (id: string) => {
    setDeleteModal({
      title: "Hapus Kategori",
      message:
        "Yakin ingin menghapus kategori ini? Hanya bisa dihapus jika tidak ada lomba yang menggunakannya.",
      onConfirm: async () => {
        setDeleteModal(null);
        try {
          await catDeleteMutation.mutateAsync(id);
        } catch (err) {
          toast.error(errorMessage(err, "Gagal menghapus kategori"));
        }
      },
    });
  };

  const filtered = [...competitions]
    .filter((c) => !search || c.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "az") return a.title.localeCompare(b.title);
      if (sortBy === "za") return b.title.localeCompare(a.title);
      return 0; // newest - keep DB order
    });
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <PageShell loading={loading}>
      <PageHeader
        title="Kompetisi"
        description={`${competitions.length} lomba terdaftar`}
        actions={
          <>
            <Button variant="outline" onClick={() => setShowCatManager(!showCatManager)}>
              <Tag data-icon="inline-start" /> Kelola Kategori
            </Button>
            <Button asChild>
              <Link href="/dashboard/competitions/new">
                <Plus data-icon="inline-start" /> Tambah Lomba
              </Link>
            </Button>
          </>
        }
      />

      {showCatManager && (
        <SectionCard
          title="Kelola Kategori"
          bodyClassName="space-y-4"
          actions={
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowCatManager(false)}
              aria-label="Tutup"
            >
              <X />
            </Button>
          }
        >
          <FieldGroup className="flex flex-wrap items-end gap-3">
            <Field className="min-w-40 flex-1">
              <FieldLabel required>Label</FieldLabel>
              <Input
                value={catForm.label}
                onChange={(e) =>
                  setCatForm({
                    ...catForm,
                    label: e.target.value,
                    id: editingCatId
                      ? catForm.id
                      : e.target.value.toLowerCase().replace(/\s+/g, "-"),
                  })
                }
                placeholder="Nama kategori"
              />
            </Field>
            {!editingCatId && (
              <Field className="min-w-40 flex-1">
                <FieldLabel required>ID</FieldLabel>
                <Input
                  value={catForm.id}
                  onChange={(e) => setCatForm({ ...catForm, id: e.target.value })}
                  placeholder="slug-kategori"
                />
              </Field>
            )}
            <Field className="min-w-44 flex-1">
              <FieldLabel>Warna</FieldLabel>
              <Select
                value={catForm.color}
                onValueChange={(value) => setCatForm({ ...catForm, color: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {CATEGORY_COLORS.map((option) => (
                      <SelectItem key={option.label} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <div className="flex gap-2">
              <Button
                onClick={handleCatSave}
                disabled={catSaving}
                size="icon"
                aria-label="Simpan kategori"
              >
                {catSaving ? <Spinner /> : editingCatId ? <Check /> : <Plus />}
              </Button>
              {editingCatId && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingCatId(null);
                    setCatForm({
                      id: "",
                      label: "",
                      color: "text-astro-navy bg-sky-bottom border-astro-cyan-2",
                    });
                  }}
                >
                  Batal
                </Button>
              )}
            </div>
          </FieldGroup>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge
                key={cat.id}
                variant="outline"
                className="gap-2 border px-2.5 py-1 font-medium normal-case tracking-normal shadow-none"
              >
                <span>{cat.label}</span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleCatEdit(cat)}
                  aria-label="Edit kategori"
                >
                  <Pencil />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleCatDelete(cat.id)}
                  aria-label="Hapus kategori"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X />
                </Button>
              </Badge>
            ))}
          </div>
        </SectionCard>
      )}

      <DataToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Cari lomba...">
        <SegmentedControl
          fullWidth={false}
          value={sortBy}
          onValueChange={(v) => setSortBy(v as "newest" | "az" | "za")}
          options={[
            { value: "newest", label: "Terbaru" },
            { value: "az", label: "A-Z" },
            { value: "za", label: "Z-A" },
          ]}
        />
      </DataToolbar>

      {/* List */}
      <div className="grid grid-cols-1 gap-3">
        {paginated.map((comp) => {
          const extras = compExtras(comp);
          const isFree = isFlagOn(extras.isFree);
          const hasBatches = isFlagOn(extras.hasBatches);
          const batches = extras.batches ?? [];
          const cat = categories.find((c) => c.id === comp.category);
          const typeLabel =
            comp.type === "both" ? "Tim & Individu" : comp.type === "team" ? "Tim" : "Individu";
          const feeLabel = (() => {
            if (isFree) return "Gratis";
            if (hasBatches && batches.length > 0) {
              const active = getActiveBatch(batches);
              if (active) {
                return `${active.name}: Rp ${active.fee.toLocaleString("id-ID")}`;
              }
              return `${batches.length} gelombang`;
            }
            return `Rp ${comp.fee.toLocaleString("id-ID")}`;
          })();

          const editHref = `/dashboard/competitions/${encodeURIComponent(comp.id)}/edit`;

          return (
            <Card key={comp.id} className="shadow-none">
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold tracking-tight">{comp.title}</h3>
                        <StatusBadge
                          status={comp.isActive ? "active" : "inactive"}
                          labelMap={{ active: "Dibuka", inactive: "Ditutup" }}
                          styleMap={{
                            active: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700",
                            inactive: "border-border bg-muted text-muted-foreground",
                          }}
                        />
                        {hasBatches ? (
                          <Badge variant="outline" className="gap-1">
                            <Layers className="size-3" /> {batches.length} batch
                          </Badge>
                        ) : null}
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {[
                          cat?.label || comp.category,
                          typeLabel,
                          isFree ? "Gratis" : "Berbayar",
                          extras.origin === "external" ? "Eksternal" : "Internal",
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>

                      {comp.tagline ? (
                        <p className="line-clamp-2 text-sm text-muted-foreground">{comp.tagline}</p>
                      ) : null}

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                          <Coins className="size-3.5 text-muted-foreground" />
                          {feeLabel}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="size-3.5" />
                          {comp.filledSlots}/{comp.maxSlots} terisi
                        </span>
                        {comp.location ? (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="size-3.5" />
                            {comp.location}
                          </span>
                        ) : null}
                        {comp.scheduleDate ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="size-3.5" />
                            {formatDateNumeric(comp.scheduleDate)}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="hidden sm:inline-flex"
                      >
                        <Link href={editHref}>
                          <Pencil data-icon="inline-start" />
                          Edit
                        </Link>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label="Aksi lomba">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem asChild className="sm:hidden">
                            <Link href={editHref}>
                              <Pencil /> Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(comp)}>
                            {comp.isActive ? <EyeOff /> : <Eye />}
                            {comp.isActive ? "Tutup pendaftaran" : "Buka pendaftaran"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTimelineOpen(comp.id)}>
                            <Clock /> Atur timeline
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleWinnerOpen(comp.id)}>
                            <Award /> Sertifikat & juara
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDeleteComp(comp.id)}
                          >
                            <Trash2 /> Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                {/* ─── Timeline Manager ─── */}
                {timelineOpen === comp.id && (
                  <div className="mt-5 space-y-4 border-t border-border pt-5">
                    <div className="flex items-center justify-between">
                      <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
                        <Clock className="size-4 text-primary" /> Timeline Lomba
                      </h3>
                      <span className="text-xs font-medium text-muted-foreground">
                        {(timelineItems[comp.id] || []).length} item
                      </span>
                    </div>

                    <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                      {(timelineItems[comp.id] || []).length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          Belum ada timeline. Tambah item baru di bawah.
                        </p>
                      )}
                      {(timelineItems[comp.id] || []).map((item, idx) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-3 rounded-md border border-border bg-muted/40 p-3"
                        >
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground tabular-nums">
                            {idx + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-xs font-semibold tracking-tight text-foreground">
                                {item.title}
                              </span>
                              <span className="whitespace-nowrap text-xs text-muted-foreground">
                                {item.date}
                              </span>
                            </div>
                            <p className="line-clamp-1 text-11 leading-relaxed text-muted-foreground">
                              {item.desc}
                            </p>
                          </div>
                          <div className="flex shrink-0 gap-1">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleTlEdit(item)}
                              aria-label="Edit timeline"
                            >
                              <Pencil />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleTlDelete(comp.id, item.id)}
                              aria-label="Hapus timeline"
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <X />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field>
                        <FieldLabel>Tanggal Mulai</FieldLabel>
                        <Input
                          type="date"
                          value={tlDateRange.start}
                          onChange={(e) =>
                            setTlDateRange({ ...tlDateRange, start: e.target.value })
                          }
                        />
                      </Field>
                      <Field>
                        <FieldLabel>
                          Tanggal Akhir{" "}
                          <span className="font-normal normal-case tracking-normal text-muted-foreground">
                            (opsional)
                          </span>
                        </FieldLabel>
                        <Input
                          type="date"
                          value={tlDateRange.end}
                          min={tlDateRange.start || undefined}
                          onChange={(e) => setTlDateRange({ ...tlDateRange, end: e.target.value })}
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Judul</FieldLabel>
                        <Input
                          value={tlForm.title}
                          onChange={(e) => setTlForm({ ...tlForm, title: e.target.value })}
                          placeholder="Pendaftaran dibuka"
                        />
                      </Field>
                      <div className="flex items-end gap-2">
                        <Button
                          onClick={() => handleTlSave(comp.id)}
                          disabled={tlSaving}
                          size="icon"
                          aria-label="Simpan timeline"
                        >
                          {tlSaving ? <Spinner /> : tlEditingId ? <Check /> : <Plus />}
                        </Button>
                        {tlEditingId && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setTlEditingId(null);
                              setTlForm({ date: "", title: "", desc: "" });
                              setTlDateRange({ start: "", end: "" });
                            }}
                            aria-label="Batal edit timeline"
                          >
                            <X />
                          </Button>
                        )}
                      </div>
                      <Field className="sm:col-span-2">
                        <FieldLabel>Deskripsi</FieldLabel>
                        <Textarea
                          value={tlForm.desc}
                          onChange={(e) => setTlForm({ ...tlForm, desc: e.target.value })}
                          placeholder="Deskripsi item timeline..."
                          rows={2}
                        />
                      </Field>
                    </FieldGroup>
                  </div>
                )}

                {winnerOpenId === comp.id && (
                  <div className="mt-5 space-y-4 border-t border-border pt-5">
                    <WinnerManager competitionId={comp.id} />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <EmptyState
            icon={<Trophy />}
            title={search ? "Tidak ada lomba yang cocok." : "Belum ada lomba."}
            description="Tambah lomba baru untuk mulai membuka pendaftaran."
          />
        )}
      </div>

      <Pagination
        currentPage={page}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      {/* Delete Modal */}
      <DeleteModal
        open={!!deleteModal}
        title={deleteModal?.title || ""}
        message={deleteModal?.message || ""}
        onConfirm={deleteModal?.onConfirm || (() => {})}
        onCancel={() => setDeleteModal(null)}
        loading={deleteLoading}
      />
    </PageShell>
  );
}
