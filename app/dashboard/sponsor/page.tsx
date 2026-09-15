"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { Reorder } from "motion/react";
import {
  ArrowUpDown,
  Check,
  GripVertical,
  Handshake,
  Pencil,
  Plus,
  Share2,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import DeleteModal from "@/components/DeleteModal";
import ImagePreviewModal from "@/components/ImagePreviewModal";
import Pagination from "@/components/Pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, ImageUploadField, PageHeader, PageShell, SectionCard } from "@/components/dashboard";
import { useMediaPartners, useSponsors, queryKeys } from "@/src/lib/hooks/use-queries";
import { apiHelpers } from "@/src/lib/api";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

type Partner = {
  id: number;
  name: string;
  tier?: string;
  website: string | null;
  logo?: string | null;
  isCurrent?: boolean;
};

/** Sponsors and media partners expose the same CRUD surface. */
type PartnerApi = {
  create: (body: unknown) => Promise<unknown>;
  update: (id: string, body: unknown) => Promise<unknown>;
  remove: (id: string) => Promise<unknown>;
  reorder: (ids: number[]) => Promise<unknown>;
};

type PartnerForm = {
  name: string;
  website: string;
  logo: string;
  tier: string;
  isCurrent: boolean;
};

const emptyForm: PartnerForm = {
  name: "",
  website: "",
  logo: "",
  tier: "gold",
  isCurrent: false,
};

const TONES = {
  emerald: {
    filter: "bg-emerald-600 text-white hover:bg-emerald-700",
    filterIdle: "border-emerald-500/40 text-emerald-700 hover:bg-emerald-50",
    badge: "border-emerald-500/30 bg-emerald-500/15 text-emerald-700",
    icon: "text-emerald-500",
    toggleOn: "text-emerald-600 hover:text-amber-600",
    toggleOff: "text-muted-foreground hover:text-emerald-600",
  },
  blue: {
    filter: "bg-astro-blue text-white hover:bg-astro-navy",
    filterIdle: "border-astro-blue/40 text-astro-navy hover:bg-sky-bottom",
    badge: "border-astro-blue/30 bg-astro-blue/15 text-astro-navy",
    icon: "text-astro-blue",
    toggleOn: "text-astro-blue hover:text-amber-600",
    toggleOff: "text-muted-foreground hover:text-astro-blue",
  },
} as const;

export default function SponsorPage() {
  const qc = useQueryClient();
  const { data: sponsorsData, isLoading: loading } = useSponsors();
  const { data: mediaPartnersData } = useMediaPartners();
  const [tab, setTab] = useState<"sponsor" | "media-partner">("sponsor");

  const sponsors = (sponsorsData ?? []) as Partner[];
  const mediaPartners = (mediaPartnersData ?? []) as Partner[];

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: queryKeys.sponsors.all });
    qc.invalidateQueries({ queryKey: queryKeys.mediaPartners.all });
  };

  return (
    <PageShell loading={loading}>
      <PageHeader
        title="Sponsor & Media Partner"
        description="Kelola brand pendukung ASTRO 2026 dan portofolio periode lalu."
      />

      <Tabs value={tab} onValueChange={(value) => setTab(value as "sponsor" | "media-partner")}>
        <TabsList className="rounded-lg border border-border bg-muted/50 p-1">
          <TabsTrigger value="sponsor" className="rounded-md gap-2">
            <Star className="size-3.5" /> Sponsor ({sponsors.length})
          </TabsTrigger>
          <TabsTrigger value="media-partner" className="rounded-md gap-2">
            <Share2 className="size-3.5" /> Media Partner ({mediaPartners.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "sponsor" ? (
        <PartnerManager
          label="Sponsor"
          items={sponsors}
          api={apiHelpers.sponsors}
          withTier
          tone="emerald"
          onMutated={invalidate}
        />
      ) : (
        <PartnerManager
          label="Media Partner"
          items={mediaPartners}
          api={apiHelpers.mediaPartners}
          tone="blue"
          onMutated={invalidate}
        />
      )}
    </PageShell>
  );
}

/**
 * One editor drives both tabs: the sponsor and media-partner panels differ
 * only by label, accent tone, and whether a tier select is shown.
 */
function PartnerManager({
  label,
  items,
  api,
  tone,
  withTier = false,
  onMutated,
}: {
  label: string;
  items: Partner[];
  api: PartnerApi;
  tone: keyof typeof TONES;
  withTier?: boolean;
  onMutated: () => void;
}) {
  const accent = TONES[tone];
  const [filter, setFilter] = useState<"all" | "current" | "previous">("all");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<PartnerForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [reorderList, setReorderList] = useState<Partner[] | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Partner | null>(null);

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const saveMutation = useMutation({
    mutationFn: (body: PartnerForm) =>
      editingId ? api.update(String(editingId), body) : api.create(body),
    onSuccess: () => {
      toast.success(editingId ? `${label} diperbarui` : `${label} ditambahkan`);
      closeForm();
      onMutated();
    },
    onError: (err: Error) => toast.error(err.message || `Gagal menyimpan ${label}`),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.remove(String(id)),
    onSuccess: () => {
      toast.success(`${label} dihapus`);
      setDeleteTarget(null);
      onMutated();
    },
    onError: (err: Error) => toast.error(err.message || `Gagal menghapus ${label}`),
  });

  const reorderMutation = useMutation({
    mutationFn: (ids: number[]) => api.reorder(ids),
    onSuccess: () => {
      toast.success(`Urutan ${label.toLowerCase()} disimpan`);
      setReorderList(null);
      onMutated();
    },
    onError: (err: Error) => toast.error(err.message || "Gagal menyimpan urutan"),
  });

  const toggleCurrent = async (item: Partner) => {
    try {
      await api.update(String(item.id), { isCurrent: !item.isCurrent });
      onMutated();
      toast.success(
        item.isCurrent
          ? `"${item.name}" dipindah ke periode lalu`
          : `"${item.name}" dijadikan ${label} ASTRO 2026`,
      );
    } catch {
      toast.error(`Gagal mengubah status ${label.toLowerCase()}`);
    }
  };

  const handleSave = () => {
    if (!form.name && !form.logo) {
      toast.error("Nama atau logo wajib diisi");
      return;
    }
    saveMutation.mutate(form);
  };

  const handleEdit = (item: Partner) => {
    setForm({
      name: item.name,
      website: item.website || "",
      logo: item.logo || "",
      tier: item.tier || "gold",
      isCurrent: !!item.isCurrent,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const filtered = items.filter((item) => {
    if (filter === "current") return !!item.isCurrent;
    if (filter === "previous") return !item.isCurrent;
    return true;
  });
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const currentCount = items.filter((item) => item.isCurrent).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs text-muted-foreground">
            Filter
          </span>
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFilter("all");
              setPage(1);
            }}
            className="h-7 text-xs"
          >
            Semua ({items.length})
          </Button>
          <Button
            variant={filter === "current" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFilter("current");
              setPage(1);
            }}
            className={cn(
              "h-7 text-xs",
              filter === "current" ? accent.filter : accent.filterIdle,
            )}
          >
            ASTRO 2026 ({currentCount})
          </Button>
          <Button
            variant={filter === "previous" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFilter("previous");
              setPage(1);
            }}
            className="h-7 text-xs"
          >
            Periode Lalu ({items.length - currentCount})
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setReorderList([...items])}
           
          >
            <ArrowUpDown data-icon="inline-start" /> Atur Urutan
          </Button>
          <Button
            onClick={() => {
              if (showForm) {
                closeForm();
                return;
              }
              setForm({ ...emptyForm, isCurrent: filter === "current" });
              setEditingId(null);
              setShowForm(true);
            }}
           
          >
            <Plus data-icon="inline-start" /> Tambah {label}
          </Button>
        </div>
      </div>

      {showForm ? (
        <SectionCard title={`${editingId ? "Edit" : "Tambah"} ${label}`} bodyClassName="space-y-4">
          <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field>
              <FieldLabel>
                Nama{" "}
                <span className="font-normal normal-case text-muted-foreground">
                  (opsional, untuk alt text)
                </span>
              </FieldLabel>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={`Nama ${label.toLowerCase()}`}
              />
            </Field>
            <Field>
              <FieldLabel>
                Website{" "}
                <span className="font-normal normal-case text-muted-foreground">(opsional)</span>
              </FieldLabel>
              <Input
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://..."
              />
            </Field>
            {withTier ? (
              <Field>
                <FieldLabel>Tier</FieldLabel>
                <Select
                  value={form.tier}
                  onValueChange={(value) => setForm({ ...form, tier: value })}
                >
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
            ) : null}
            <Field className={withTier ? undefined : "sm:col-span-2"}>
              <FieldLabel>
                Logo{" "}
                <span className="font-normal normal-case text-muted-foreground">
                  (opsional jika ada teks nama)
                </span>
              </FieldLabel>
              <ImageUploadField
                value={form.logo}
                onValueChange={(url) => setForm({ ...form, logo: url })}
                buttonLabel="Pilih file"
              />
            </Field>
            <Field className="sm:col-span-2">
              <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/40 p-3">
                <div className="space-y-0.5">
                  <Label
                    htmlFor={`is-current-${label}`}
                    className="flex cursor-pointer items-center gap-1.5 text-xs text-foreground"
                  >
                    <Sparkles className={cn("size-3.5", accent.icon)} />
                    {label} ASTRO 2026
                  </Label>
                  <p className="text-11 text-muted-foreground">
                    Aktifkan jika brand ini mendukung ASTRO 2026 yang sedang berlangsung. Matikan
                    untuk menyimpannya sebagai portofolio periode lalu.
                  </p>
                </div>
                <Switch
                  id={`is-current-${label}`}
                  checked={form.isCurrent}
                  onCheckedChange={(checked) => setForm({ ...form, isCurrent: checked })}
                />
              </div>
            </Field>
          </FieldGroup>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="rounded-md gap-1 text-xs"
            >
              {saveMutation.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Check data-icon="inline-start" />
              )}
              Simpan
            </Button>
            <Button
              variant="outline"
              onClick={closeForm}
              className="rounded-md gap-1 text-xs"
            >
              Batal
            </Button>
          </div>
        </SectionCard>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Handshake />}
          title={`Tidak ada ${label.toLowerCase()} pada filter ini.`}
          description="Ubah filter atau tambah brand baru."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {paginated.map((item) => (
            <Card
              key={item.id}
              className="border border-border transition-colors hover:border-primary/50"
            >
              <CardContent className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  {item.logo ? (
                    <button
                      type="button"
                      onClick={() => setPreviewImage(item.logo || null)}
                      className="overflow-hidden rounded transition-opacity hover:opacity-80"
                    >
                      <Image
                        src={item.logo}
                        alt=""
                        width={32}
                        height={32}
                        unoptimized
                        className="size-8 object-contain"
                      />
                    </button>
                  ) : null}
                  <span className="truncate text-sm font-bold text-foreground">
                    {item.name || "(tanpa nama)"}
                  </span>
                  {item.isCurrent ? (
                    <Badge className={cn("text-xs font-bold", accent.badge)}>ASTRO 2026</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs font-medium text-muted-foreground">
                      Periode Lalu
                    </Badge>
                  )}
                  {item.website ? (
                    <span className="hidden text-11 text-muted-foreground sm:block">
                      {item.website.replace(/https?:\/\//, "")}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => toggleCurrent(item)}
                    title={item.isCurrent ? "Ubah ke periode lalu" : `Jadikan ${label} ASTRO 2026`}
                    aria-label={
                      item.isCurrent ? "Ubah ke periode lalu" : `Jadikan ${label} ASTRO 2026`
                    }
                    className={item.isCurrent ? accent.toggleOn : accent.toggleOff}
                  >
                    <Sparkles className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleEdit(item)}
                    aria-label="Edit"
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setDeleteTarget(item)}
                    aria-label="Hapus"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Pagination
        currentPage={page}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      <DeleteModal
        open={!!deleteTarget}
        title={`Hapus ${label}`}
        message={`Yakin ingin menghapus "${deleteTarget?.name || "(tanpa nama)"}"?`}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
      <ImagePreviewModal url={previewImage} onClose={() => setPreviewImage(null)} />

      <Dialog
        open={reorderList !== null}
        onOpenChange={(open) => {
          if (!open) setReorderList(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Urutkan {label}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Geser item di bawah ini untuk mengatur urutan tampil di halaman publik.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto pr-2">
            <Reorder.Group
              axis="y"
              values={reorderList ?? []}
              onReorder={setReorderList}
              className="flex flex-col gap-2"
            >
              {(reorderList ?? []).map((item) => (
                <Reorder.Item
                  key={item.id}
                  value={item}
                  className="flex cursor-grab items-center gap-3 rounded-md border border-border bg-card p-3 shadow-soft-sm hover:border-primary/50 active:cursor-grabbing"
                >
                  <GripVertical className="size-4 text-muted-foreground" />
                  {item.logo ? (
                    <Image
                      src={item.logo}
                      alt=""
                      width={24}
                      height={24}
                      unoptimized
                      className="size-6 object-contain"
                    />
                  ) : null}
                  <span className="truncate text-sm font-bold">{item.name || "(tanpa nama)"}</span>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setReorderList(null)}
             
            >
              Batal
            </Button>
            <Button
              onClick={() => reorderMutation.mutate((reorderList ?? []).map((item) => item.id))}
              disabled={reorderMutation.isPending}
              className="gap-2 text-xs"
            >
              {reorderMutation.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Check data-icon="inline-start" />
              )}
              Simpan Urutan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
