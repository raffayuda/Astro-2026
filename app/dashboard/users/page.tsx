"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
  Trophy,
  Calendar,
  Shield,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import Pagination from "@/components/Pagination";
import { ResponsiveAlertDialog } from "@/components/responsive-alert-dialog";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  useUsers,
  useRegistrations,
  queryKeys,
} from "@/src/lib/hooks/use-queries";
import { apiHelpers } from "@/src/lib/api";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

function UserDetailModal({
  user,
  onClose,
}: {
  user: User | null;
  onClose: () => void;
}) {
  const { data: regData, isLoading: loadingReg } = useRegistrations(
    user ? { search: user.email } : {},
    { enabled: !!user },
  );

  const registrations = Array.isArray(regData)
    ? regData
    : (regData as any)?.data ?? [];

  if (!user) return null;

  return (
    <ResponsiveModal
      open={!!user}
      onOpenChange={(open) => !open && onClose()}
      title="Detail User & Pendaftaran"
      description={`Informasi akun dan riwayat pendaftaran ${user.name || user.email}`}
      titleClassName="text-sm font-black uppercase tracking-tight text-foreground"
      contentClassName="max-w-2xl"
    >
      <div className="space-y-5">
        {/* User Card Info */}
        <div className="clip-angled group relative overflow-hidden border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/50">
          <div
            className="absolute -top-px -left-px size-7 bg-primary"
            style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 font-mono text-base font-bold text-primary">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {user.name || "—"}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="size-3.5" />
                  <span>{user.email}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "clip-angled-sm border text-[10px] font-bold uppercase tracking-wider",
                  user.role === "admin"
                    ? "border-cyan-200 bg-cyan-50 text-astro-cyan"
                    : "border-slate-200 bg-muted text-muted-foreground",
                )}
              >
                <Shield className="mr-1 size-3" />
                {user.role}
              </Badge>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Calendar className="size-3" />
                <span>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div className="flex items-center gap-2">
            <Trophy className="size-4 text-primary" />
            <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
              Pendaftaran Lomba / Event ({registrations.length})
            </h4>
          </div>
        </div>

        {/* Registrations List */}
        {loadingReg ? (
          <div className="flex items-center justify-center py-10">
            <Spinner className="size-5 text-primary" />
          </div>
        ) : registrations.length === 0 ? (
          <div className="clip-angled border border-dashed border-border bg-muted/30 py-8 text-center">
            <p className="text-xs italic text-muted-foreground">
              User ini belum terdaftar pada lomba/event manapun.
            </p>
          </div>
        ) : (
          <div className="max-h-[350px] space-y-3 overflow-y-auto pr-1">
            {registrations.map((reg: any) => {
              const isPaid = reg.paymentStatus === "paid";
              const isPending = reg.paymentStatus === "pending";
              const isFailed = reg.paymentStatus === "failed";

              return (
                <div
                  key={reg.id}
                  className="clip-angled group relative overflow-hidden border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <div
                    className={cn(
                      "absolute -top-px -left-px size-6 transition-colors",
                      isPaid
                        ? "bg-emerald-500"
                        : isPending
                          ? "bg-amber-500"
                          : "bg-destructive",
                    )}
                    style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
                  />

                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          ID: #{reg.id}
                        </span>
                        <h5 className="text-sm font-bold text-foreground">
                          {reg.competitionTitle ||
                            reg.competitionId ||
                            "Lomba ASTRO 2026"}
                        </h5>
                      </div>

                      <Badge
                        variant="outline"
                        className={cn(
                          "clip-angled-sm border text-[9px] font-bold uppercase tracking-wider",
                          isPaid &&
                            "border-emerald-200 bg-emerald-50 text-emerald-700",
                          isPending &&
                            "border-amber-200 bg-amber-50 text-amber-700",
                          isFailed && "border-red-200 bg-red-50 text-red-700",
                        )}
                      >
                        {isPaid ? "LUNAS" : isPending ? "MENUNGGU" : "GAGAL"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-2 pt-1 border-t border-border/50 text-xs sm:grid-cols-2">
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-muted-foreground">
                          {reg.teamName ? "Tim" : "Peserta"}
                        </span>
                        <span className="font-semibold text-foreground">
                          {reg.teamName
                            ? `${reg.teamName} (Ketua: ${reg.leaderName || reg.fullName})`
                            : reg.fullName}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[10px] font-bold uppercase text-muted-foreground">
                          Institusi / Sekolah
                        </span>
                        <span className="text-foreground">
                          {reg.institution || "—"}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[10px] font-bold uppercase text-muted-foreground">
                          Nominal & Referensi
                        </span>
                        <span className="font-mono text-foreground">
                          {reg.paymentAmount
                            ? `Rp ${Number(reg.paymentAmount).toLocaleString("id-ID")}`
                            : "Free"}
                          {reg.paymentReference
                            ? ` (${reg.paymentReference})`
                            : ""}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[10px] font-bold uppercase text-muted-foreground">
                          Tanggal Didaftarkan
                        </span>
                        <span className="text-muted-foreground">
                          {reg.createdAt
                            ? new Date(reg.createdAt).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose} className="clip-angled-sm">
            Tutup
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
}

export default function UsersPage() {
  const qc = useQueryClient();
  const { data: usersData, isLoading: loading } = useUsers();
  const users = (usersData as any)?.data ?? usersData ?? [];
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{
    mode: "create" | "edit";
    user?: User;
  } | null>(null);
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const invalidateUsers = () =>
    qc.invalidateQueries({ queryKey: queryKeys.users.all });

  const createMutation = useMutation({
    mutationFn: (body: {
      email: string;
      password: string;
      name: string;
      role: string;
    }) => apiHelpers.users.create(body),
    onSuccess: () => {
      toast.success("User berhasil dibuat");
      setModal(null);
      invalidateUsers();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: { name: string; role: string };
    }) => apiHelpers.users.update(id, body),
    onSuccess: () => {
      toast.success("User berhasil diupdate");
      setModal(null);
      invalidateUsers();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiHelpers.users.remove(id),
    onSuccess: () => {
      toast.success("User berhasil dihapus");
      setDeleteTarget(null);
      invalidateUsers();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filtered = users.filter(
    (u: User) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.name?.toLowerCase().includes(search.toLowerCase()),
  );
  const [page, setPage] = useState(1);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    try {
      await createMutation.mutateAsync({
        email: String(form.get("email")),
        password: String(form.get("password")),
        name: String(form.get("name")),
        role: String(form.get("role") || "participant"),
      });
    } catch {
      // handled by onError
    }
    setSaving(false);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!modal?.user) return;
    setSaving(true);
    const form = new FormData(e.currentTarget);
    try {
      await updateMutation.mutateAsync({
        id: modal.user.id,
        body: {
          name: String(form.get("name")),
          role: String(form.get("role")),
        },
      });
    } catch {
      // handled by onError
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
    } catch {
      // handled by onError
    }
    setDeleting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-6 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">
            User
          </h1>
          <p className="mt-1 text-sm font-light text-muted-foreground">
            {users.length} akun terdaftar
          </p>
        </div>
        <Button
          onClick={() => setModal({ mode: "create" })}
          className="clip-angled text-xs font-bold uppercase tracking-wider"
        >
          <Plus data-icon="inline-start" /> Tambah User
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-xs">
        <InputGroup className="clip-angled h-10 border-border bg-background">
          <InputGroupAddon align="inline-start">
            <Search className="size-3.5 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau email..."
            className="text-xs font-medium"
          />
        </InputGroup>
      </div>

      {/* User Items List - Parallelogram Card Frame */}
      <div className="grid grid-cols-1 gap-3">
        {paginated.length === 0 ? (
          <div className="clip-angled border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            {search ? "Tidak ditemukan user yang cocok." : "Belum ada user."}
          </div>
        ) : (
          paginated.map((u: User) => (
            <Card
              key={u.id}
              className="clip-angled group relative overflow-hidden border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div
                className="absolute -top-px -left-px size-6 bg-primary/20 transition-colors group-hover:bg-primary"
                style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
              />
              <CardContent className="flex flex-col gap-3 p-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary">
                    {(u.name || u.email).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">
                        {u.name || "—"}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "clip-angled-sm border text-[9px] font-bold uppercase tracking-wider",
                          u.role === "admin"
                            ? "border-cyan-200 bg-cyan-50 text-astro-cyan"
                            : "border-slate-200 bg-muted text-muted-foreground",
                        )}
                      >
                        {u.role}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {u.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between justify-end gap-3 pt-2 sm:pt-0 border-t border-border/50 sm:border-t-0">
                  <span className="text-xs text-muted-foreground">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDetailUser(u)}
                      title="Lihat Detail Pendaftaran"
                      aria-label="Lihat Detail Pendaftaran"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setModal({ mode: "edit", user: u })}
                      title="Edit"
                      aria-label="Edit"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeleteTarget(u)}
                      title="Hapus"
                      aria-label="Hapus"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Pagination
        currentPage={page}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      {/* ─── User Detail Modal ─── */}
      <UserDetailModal
        user={detailUser}
        onClose={() => setDetailUser(null)}
      />

      {/* ─── Modal Create / Edit ─── */}
      <ResponsiveModal
        open={!!modal}
        onOpenChange={(next) => !next && setModal(null)}
        title={modal?.mode === "create" ? "Tambah User" : "Edit User"}
        description={
          modal?.mode === "create"
            ? "Buat akun user baru."
            : `Edit akun ${modal?.user?.email}`
        }
        titleClassName="text-sm font-black uppercase tracking-tight"
        contentClassName="max-w-md"
      >
        <form
          onSubmit={modal?.mode === "create" ? handleCreate : handleUpdate}
          className="flex flex-col gap-4"
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="user-name" required={modal?.mode === "create"}>Nama</FieldLabel>
              <Input
                id="user-name"
                name="name"
                defaultValue={modal?.user?.name || ""}
                placeholder="Nama lengkap"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="user-email" required>Email</FieldLabel>
              <Input
                id="user-email"
                name="email"
                type="email"
                defaultValue={modal?.user?.email || ""}
                required
                disabled={modal?.mode === "edit"}
                placeholder="email@example.com"
              />
            </Field>

            {modal?.mode === "create" && (
              <Field>
                <FieldLabel htmlFor="user-password" required>Password</FieldLabel>
                <Input
                  id="user-password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Minimal 6 karakter"
                />
              </Field>
            )}

            <Field>
              <FieldLabel htmlFor="user-role">Role</FieldLabel>
              <Select
                name="role"
                defaultValue={modal?.user?.role || "participant"}
              >
                <SelectTrigger id="user-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="participant">Participant</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModal(null)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={saving} className="clip-angled-sm">
              {saving ? <Spinner data-icon="inline-start" /> : null}
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </ResponsiveModal>

      {/* ─── Delete Confirmation ─── */}
      <ResponsiveAlertDialog
        open={!!deleteTarget}
        onOpenChange={(next) => !next && setDeleteTarget(null)}
        title="Hapus User"
        description={
          <>
            Yakin ingin menghapus{" "}
            <strong>{deleteTarget?.name || deleteTarget?.email}</strong>?
            Tindakan ini tidak bisa dibatalkan.
          </>
        }
        cancelText="Batal"
        confirmText="Hapus"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

