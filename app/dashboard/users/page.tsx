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
  UserPlus,
  Link as LinkIcon,
  Copy,
  Check,
  Send,
  Clock,
  Ban,
  Users,
  ExternalLink,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useUsers,
  useInvitations,
  useInvitationMutations,
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
  emailVerified?: boolean;
  createdAt: string;
}

interface Invitation {
  id: string;
  token: string;
  email: string | null;
  role: string;
  status: "pending" | "accepted" | "expired" | "revoked";
  invitedById: string | null;
  invitedByName: string | null;
  invitedByEmail: string | null;
  expiresAt: string;
  usedAt: string | null;
  usedById: string | null;
  revokedAt: string | null;
  createdAt: string;
  inviteUrl: string;
}

function UserDetailModal({
  user,
  onClose,
}: {
  user: User | null;
  onClose: () => void;
}) {
  const { data: regData, isLoading: loadingReg } = useRegistrations(
    user ? { userId: user.id, search: user.email } : {},
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
              <Badge
                variant="outline"
                className={cn(
                  "clip-angled-sm border text-[10px] font-bold uppercase tracking-wider",
                  user.emailVerified
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-700",
                )}
              >
                {user.emailVerified ? "Terverifikasi" : "Belum Verifikasi"}
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
  const { data: usersData, isLoading: loadingUsers } = useUsers();
  const users = (usersData as any)?.data ?? usersData ?? [];

  const { data: invData, isLoading: loadingInvitations } = useInvitations();
  const invitations: Invitation[] = (invData as any)?.data ?? invData ?? [];
  const invitationMutations = useInvitationMutations();

  const [tab, setTab] = useState<"users" | "invitations">("users");
  const [search, setSearch] = useState("");
  const [inviteSearch, setInviteSearch] = useState("");
  const [page, setPage] = useState(1);
  const [invitePage, setInvitePage] = useState(1);

  // User modal state
  const [modal, setModal] = useState<{
    mode: "create" | "edit";
    user?: User;
  } | null>(null);
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Invite modal state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [createdInviteLink, setCreatedInviteLink] = useState<string | null>(null);
  const [copiedCreatedLink, setCopiedCreatedLink] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<Invitation | null>(null);
  const [revoking, setRevoking] = useState(false);
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [invForm, setInvForm] = useState({
    email: "",
    role: "admin",
    expiresInHours: 168, // 7 days default
    sendEmail: false,
  });

  const invalidateUsers = () =>
    qc.invalidateQueries({ queryKey: queryKeys.users.all });

  const invalidateInvitations = () =>
    qc.invalidateQueries({ queryKey: queryKeys.invitations.all });

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

  const filteredUsers = users.filter(
    (u: User) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.name?.toLowerCase().includes(search.toLowerCase()),
  );
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const filteredInvitations = invitations.filter(
    (inv: Invitation) =>
      (inv.email && inv.email.toLowerCase().includes(inviteSearch.toLowerCase())) ||
      inv.token.toLowerCase().includes(inviteSearch.toLowerCase()) ||
      inv.role.toLowerCase().includes(inviteSearch.toLowerCase()) ||
      (inv.invitedByName &&
        inv.invitedByName.toLowerCase().includes(inviteSearch.toLowerCase())),
  );
  const paginatedInvitations = filteredInvitations.slice(
    (invitePage - 1) * PAGE_SIZE,
    invitePage * PAGE_SIZE,
  );

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
    const verifiedValue = form.get("emailVerified");
    try {
      await updateMutation.mutateAsync({
        id: modal.user.id,
        body: {
          name: String(form.get("name")),
          role: String(form.get("role")),
          ...(verifiedValue !== null
            ? { emailVerified: verifiedValue === "true" }
            : {}),
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

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingInvite(true);
    try {
      const res = await invitationMutations.create.mutateAsync({
        email: invForm.email.trim() || undefined,
        role: invForm.role as "admin" | "participant",
        expiresInHours: Number(invForm.expiresInHours),
        sendEmail: invForm.sendEmail && !!invForm.email.trim(),
      });
      const inviteUrl =
        (res as any)?.inviteUrl ||
        (res as any)?.data?.inviteUrl ||
        `${window.location.origin}/invite/${(res as any)?.token || (res as any)?.data?.token}`;

      setCreatedInviteLink(inviteUrl);
      toast.success("Tautan undangan berhasil dibuat!");
      invalidateInvitations();
    } catch (err: any) {
      toast.error(err?.message || "Gagal membuat tautan undangan");
    } finally {
      setCreatingInvite(false);
    }
  };

  const handleRevokeInvite = async () => {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      await invitationMutations.revoke.mutateAsync(revokeTarget.id);
      toast.success("Tautan undangan berhasil dibatalkan");
      setRevokeTarget(null);
      invalidateInvitations();
    } catch (err: any) {
      toast.error(err?.message || "Gagal membatalkan undangan");
    } finally {
      setRevoking(false);
    }
  };

  const copyToClipboard = (text: string, id?: string) => {
    navigator.clipboard.writeText(text);
    if (id) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      setCopiedCreatedLink(true);
      setTimeout(() => setCopiedCreatedLink(false), 2000);
    }
    toast.success("Tautan berhasil disalin ke clipboard!");
  };

  const loading = loadingUsers || loadingInvitations;

  if (loading && users.length === 0 && invitations.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-6 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">
            User & Akses
          </h1>
          <p className="mt-1 text-sm font-light text-muted-foreground">
            Kelola akun terdaftar dan buat tautan undangan untuk admin / panitia baru.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setCreatedInviteLink(null);
              setInvForm({
                email: "",
                role: "admin",
                expiresInHours: 168,
                sendEmail: false,
              });
              setInviteModalOpen(true);
            }}
            className="clip-angled text-xs font-bold uppercase tracking-wider border-cyan-200 text-cyan-700 bg-cyan-50 hover:bg-cyan-100 hover:text-cyan-800"
          >
            <UserPlus className="size-3.5 mr-1.5" /> Undang User
          </Button>
          <Button
            onClick={() => setModal({ mode: "create" })}
            className="clip-angled text-xs font-bold uppercase tracking-wider"
          >
            <Plus data-icon="inline-start" /> Tambah Manual
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as "users" | "invitations");
          setPage(1);
          setInvitePage(1);
        }}
      >
        <TabsList className="clip-angled border border-border bg-muted/50 p-1">
          <TabsTrigger value="users" className="clip-angled-sm gap-2">
            <Users className="size-3.5" /> Daftar Akun ({users.length})
          </TabsTrigger>
          <TabsTrigger value="invitations" className="clip-angled-sm gap-2">
            <LinkIcon className="size-3.5" /> Tautan Undangan ({invitations.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* ─── TAB 1: USERS ─── */}
      {tab === "users" && (
        <div className="space-y-4">
          {/* Search */}
          <div className="max-w-xs">
            <InputGroup className="clip-angled h-10 border-border bg-background">
              <InputGroupAddon align="inline-start">
                <Search className="size-3.5 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari nama atau email..."
                className="text-xs font-medium"
              />
            </InputGroup>
          </div>

          {/* User Items List */}
          <div className="grid grid-cols-1 gap-3">
            {paginatedUsers.length === 0 ? (
              <div className="clip-angled border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                {search ? "Tidak ditemukan user yang cocok." : "Belum ada user."}
              </div>
            ) : (
              paginatedUsers.map((u: User) => (
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
                          <Badge
                            variant="outline"
                            className={cn(
                              "clip-angled-sm border text-[9px] font-bold uppercase tracking-wider",
                              u.emailVerified
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-amber-200 bg-amber-50 text-amber-700",
                            )}
                          >
                            {u.emailVerified ? "Verified" : "Unverified"}
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
            totalItems={filteredUsers.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* ─── TAB 2: INVITATIONS ─── */}
      {tab === "invitations" && (
        <div className="space-y-4">
          {/* Search */}
          <div className="max-w-xs">
            <InputGroup className="clip-angled h-10 border-border bg-background">
              <InputGroupAddon align="inline-start">
                <Search className="size-3.5 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                value={inviteSearch}
                onChange={(e) => {
                  setInviteSearch(e.target.value);
                  setInvitePage(1);
                }}
                placeholder="Cari email atau token..."
                className="text-xs font-medium"
              />
            </InputGroup>
          </div>

          {/* Invitation Items List */}
          <div className="grid grid-cols-1 gap-3">
            {paginatedInvitations.length === 0 ? (
              <div className="clip-angled border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                {inviteSearch
                  ? "Tidak ditemukan tautan undangan yang cocok."
                  : "Belum ada tautan undangan yang dibuat."}
              </div>
            ) : (
              paginatedInvitations.map((inv: Invitation) => {
                const isPending = inv.status === "pending";
                const isAccepted = inv.status === "accepted";
                const isExpired = inv.status === "expired";
                const isRevoked = inv.status === "revoked";

                return (
                  <Card
                    key={inv.id}
                    className="clip-angled group relative overflow-hidden border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
                  >
                    <div
                      className={cn(
                        "absolute -top-px -left-px size-6 transition-colors",
                        isPending
                          ? "bg-amber-400"
                          : isAccepted
                            ? "bg-emerald-500"
                            : isRevoked
                              ? "bg-rose-500"
                              : "bg-slate-300",
                      )}
                      style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
                    />
                    <CardContent className="flex flex-col gap-3 p-0 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary">
                          <LinkIcon className="size-4" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-foreground">
                              {inv.email || "Tautan Terbuka (Siapa saja)"}
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "clip-angled-sm border text-[9px] font-bold uppercase tracking-wider",
                                inv.role === "admin"
                                  ? "border-cyan-200 bg-cyan-50 text-astro-cyan"
                                  : "border-slate-200 bg-muted text-muted-foreground",
                              )}
                            >
                              {inv.role}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn(
                                "clip-angled-sm border text-[9px] font-bold uppercase tracking-wider",
                                isPending &&
                                  "border-amber-200 bg-amber-50 text-amber-700",
                                isAccepted &&
                                  "border-emerald-200 bg-emerald-50 text-emerald-700",
                                isExpired &&
                                  "border-slate-200 bg-slate-100 text-slate-500",
                                isRevoked &&
                                  "border-rose-200 bg-rose-50 text-rose-700",
                              )}
                            >
                              {isPending && "Menunggu Digunakan"}
                              {isAccepted && "Sudah Digunakan"}
                              {isExpired && "Kadaluarsa"}
                              {isRevoked && "Dibatalkan"}
                            </Badge>
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span>
                              Token:{" "}
                              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground">
                                {inv.token.slice(0, 10)}...
                              </code>
                            </span>
                            <span>
                              Masa Berlaku:{" "}
                              <strong className="text-foreground">
                                {new Date(inv.expiresAt).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </strong>
                            </span>
                            {inv.invitedByName && (
                              <span>Dibuat oleh: {inv.invitedByName}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t border-border/50 sm:border-t-0">
                        {isPending && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(inv.inviteUrl, inv.id)}
                            className="clip-angled-sm text-xs font-bold"
                          >
                            {copiedId === inv.id ? (
                              <>
                                <Check className="size-3.5 mr-1 text-emerald-600" /> Disalin
                              </>
                            ) : (
                              <>
                                <Copy className="size-3.5 mr-1" /> Salin Link
                              </>
                            )}
                          </Button>
                        )}

                        {isPending && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setRevokeTarget(inv)}
                            title="Batalkan Tautan"
                            aria-label="Batalkan Tautan"
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Ban className="size-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          <Pagination
            currentPage={invitePage}
            totalItems={filteredInvitations.length}
            pageSize={PAGE_SIZE}
            onPageChange={setInvitePage}
          />
        </div>
      )}

      {/* ─── User Detail Modal ─── */}
      <UserDetailModal
        user={detailUser}
        onClose={() => setDetailUser(null)}
      />

      {/* ─── Modal Create / Edit User Manual ─── */}
      <ResponsiveModal
        open={!!modal}
        onOpenChange={(next) => !next && setModal(null)}
        title={modal?.mode === "create" ? "Tambah User Manual" : "Edit User"}
        description={
          modal?.mode === "create"
            ? "Buat akun user secara manual (langsung terverifikasi tanpa OTP)."
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
              <FieldLabel htmlFor="user-name" required={modal?.mode === "create"}>
                Nama
              </FieldLabel>
              <Input
                id="user-name"
                name="name"
                defaultValue={modal?.user?.name || ""}
                placeholder="Nama lengkap"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="user-email" required>
                Email
              </FieldLabel>
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
                <FieldLabel htmlFor="user-password" required>
                  Password
                </FieldLabel>
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

            {modal?.mode === "edit" && (
              <Field>
                <FieldLabel htmlFor="user-verified">Status Verifikasi</FieldLabel>
                <Select
                  name="emailVerified"
                  defaultValue={modal?.user?.emailVerified ? "true" : "false"}
                >
                  <SelectTrigger id="user-verified" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="true">Terverifikasi (Aktif)</SelectItem>
                      <SelectItem value="false">
                        Belum Verifikasi (Perlu OTP)
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            )}
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

      {/* ─── Modal Buat Tautan Undangan ─── */}
      <ResponsiveModal
        open={inviteModalOpen}
        onOpenChange={(next) => {
          if (!next) {
            setInviteModalOpen(false);
            setCreatedInviteLink(null);
          }
        }}
        title="Buat Tautan Undangan User"
        description="Hasilkan tautan khusus bagi calon admin / panitia atau peserta untuk mendaftar dan menentukan password mandiri."
        titleClassName="text-sm font-black uppercase tracking-tight"
        contentClassName="max-w-md"
      >
        {createdInviteLink ? (
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center">
              <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-2">
                <Check className="size-5" />
              </div>
              <h3 className="text-sm font-bold text-emerald-900">
                Tautan Undangan Berhasil Dibuat!
              </h3>
              <p className="text-xs text-emerald-700 mt-1">
                Kirim tautan ini kepada calon pengguna untuk mengaktifkan akun.
              </p>
            </div>

            <Field>
              <FieldLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Tautan Pendaftaran
              </FieldLabel>
              <InputGroup className="clip-angled">
                <InputGroupInput
                  readOnly
                  value={createdInviteLink}
                  className="font-mono text-xs select-all bg-muted"
                />
                <InputGroupAddon align="inline-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => copyToClipboard(createdInviteLink)}
                    title="Salin Tautan"
                  >
                    {copiedCreatedLink ? (
                      <Check className="size-4 text-emerald-600" />
                    ) : (
                      <Copy className="size-4 text-muted-foreground" />
                    )}
                  </Button>
                </InputGroupAddon>
              </InputGroup>
            </Field>

            <div className="flex justify-between items-center pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreatedInviteLink(null);
                  setInvForm({
                    email: "",
                    role: "admin",
                    expiresInHours: 168,
                    sendEmail: false,
                  });
                }}
                className="clip-angled-sm text-xs"
              >
                Buat Tautan Lain
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setInviteModalOpen(false);
                  setCreatedInviteLink(null);
                }}
                className="clip-angled-sm text-xs font-bold"
              >
                Selesai
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateInvite} className="flex flex-col gap-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="inv-role">Role Akun</FieldLabel>
                <Select
                  value={invForm.role}
                  onValueChange={(v) => setInvForm({ ...invForm, role: v })}
                >
                  <SelectTrigger id="inv-role" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="admin">Admin / Panitia</SelectItem>
                      <SelectItem value="participant">Participant / Peserta</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Pilih hak akses yang akan langsung diperoleh saat akun aktif.
                </p>
              </Field>

              <Field>
                <FieldLabel htmlFor="inv-email">Email Tujuan (Opsional)</FieldLabel>
                <Input
                  id="inv-email"
                  type="email"
                  value={invForm.email}
                  onChange={(e) =>
                    setInvForm({ ...invForm, email: e.target.value })
                  }
                  placeholder="Contoh: panitia@gmail.com"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Kosongkan jika tautan ini terbuka untuk siapa saja yang membukanya pertama kali.
                </p>
              </Field>

              <Field>
                <FieldLabel htmlFor="inv-expiry">Masa Berlaku Tautan</FieldLabel>
                <Select
                  value={String(invForm.expiresInHours)}
                  onValueChange={(v) =>
                    setInvForm({ ...invForm, expiresInHours: Number(v) })
                  }
                >
                  <SelectTrigger id="inv-expiry" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="24">24 Jam (1 Hari)</SelectItem>
                      <SelectItem value="72">72 Jam (3 Hari)</SelectItem>
                      <SelectItem value="168">7 Hari (Standar)</SelectItem>
                      <SelectItem value="336">14 Hari (2 Minggu)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              {invForm.email.trim() && (
                <div className="rounded border border-border bg-muted/40 p-3">
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-foreground">
                    <input
                      type="checkbox"
                      checked={invForm.sendEmail}
                      onChange={(e) =>
                        setInvForm({ ...invForm, sendEmail: e.target.checked })
                      }
                      className="size-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span>Kirim email undangan otomatis ke alamat di atas via Resend</span>
                  </label>
                </div>
              )}
            </FieldGroup>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setInviteModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={creatingInvite}
                className="clip-angled-sm text-xs font-bold"
              >
                {creatingInvite ? <Spinner data-icon="inline-start" /> : null}
                {creatingInvite ? "Membuat Tautan..." : "Buat Tautan Undangan"}
              </Button>
            </div>
          </form>
        )}
      </ResponsiveModal>

      {/* ─── Delete User Confirmation ─── */}
      <ResponsiveAlertDialog
        open={!!deleteTarget}
        onOpenChange={(next) => !next && setDeleteTarget(null)}
        title="Hapus User"
        description={
          <>
            Yakin ingin menghapus{" "}
            <strong>{deleteTarget?.name || deleteTarget?.email}</strong>? Tindakan
            ini tidak bisa dibatalkan.
          </>
        }
        cancelText="Batal"
        confirmText="Hapus"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />

      {/* ─── Revoke Invitation Confirmation ─── */}
      <ResponsiveAlertDialog
        open={!!revokeTarget}
        onOpenChange={(next) => !next && setRevokeTarget(null)}
        title="Batalkan Tautan Undangan"
        description={
          <>
            Yakin ingin membatalkan tautan undangan untuk{" "}
            <strong>{revokeTarget?.email || "Tautan Terbuka"}</strong>? Tautan ini
            tidak akan bisa digunakan lagi setelah dibatalkan.
          </>
        }
        cancelText="Kembali"
        confirmText="Batalkan Tautan"
        destructive
        loading={revoking}
        onConfirm={handleRevokeInvite}
      />
    </div>
  );
}

