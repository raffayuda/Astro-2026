"use client";

import { useState } from "react";
import { authClient } from "@/src/lib/auth-client";
import Link from "next/link";
import { ChevronRight, ClipboardList, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DataToolbar,
  EmptyState,
  PageHeader,
  PageShell,
  SectionCard,
  StatusBadge,
} from "@/components/dashboard";
import Pagination from "@/components/Pagination";
import { useCompetitions, useRegistrations, queryKeys } from "@/src/lib/hooks/use-queries";
import { useQueryClient } from "@tanstack/react-query";
import { apiHelpers } from "@/src/lib/api";
import { toast } from "sonner";
import { ResponsiveAlertDialog } from "@/components/responsive-alert-dialog";
import { unwrapList } from "@/lib/lists";

const PAGE_SIZE = 10;

type RegistrationRow = {
  id: string;
  type: string;
  fullName: string | null;
  teamName: string | null;
  email: string | null;
  userId?: string | null;
  competitionName: string | null;
  paymentReference: string | null;
  paymentStatus: string;
  createdAt: string | null;
};

export default function RegistrationsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"all" | "mine">("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [lombaFilter, setLombaFilter] = useState("");
  const [page, setPage] = useState(1);
  const [regToDelete, setRegToDelete] = useState<RegistrationRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { data: allCompetitions } = useCompetitions();
  const { data: regPage, isLoading: loading } = useRegistrations({ pageSize: 100 });
  const { data: session } = authClient.useSession();

  const userEmail = session?.user?.email ?? "";
  const registrations = unwrapList<RegistrationRow>(regPage);
  const userId = session?.user?.id;
  const myRegistrations =
    userEmail || userId
      ? registrations.filter(
          (r) =>
            (userEmail && r.email?.toLowerCase() === userEmail.toLowerCase()) ||
            (userId && r.userId === userId),
        )
      : [];

  const displayed = tab === "mine" ? myRegistrations : registrations;

  const filtered = displayed.filter((reg) => {
    const matchSearch =
      !search ||
      reg.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      reg.teamName?.toLowerCase().includes(search.toLowerCase()) ||
      reg.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || reg.paymentStatus === statusFilter;
    const matchLomba = !lombaFilter || reg.competitionName === lombaFilter;
    return matchSearch && matchStatus && matchLomba;
  });
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setLombaFilter("");
  };

  const handleDelete = async () => {
    if (!regToDelete) return;
    setDeleteLoading(true);
    try {
      await apiHelpers.registrations.delete(regToDelete.id);
      toast.success("Pendaftaran berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: queryKeys.registrations.all });
      setRegToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Gagal menghapus pendaftaran");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <PageShell loading={loading}>
      <PageHeader
        title="Pendaftaran"
        description={
          tab === "mine"
            ? `${userEmail} - ${myRegistrations.length} pendaftaran`
            : `${registrations.length} total pendaftaran`
        }
      />

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as "all" | "mine");
          setPage(1);
          resetFilters();
        }}
      >
        <TabsList>
          <TabsTrigger value="all">Semua ({registrations.length})</TabsTrigger>
          {userEmail ? (
            <TabsTrigger value="mine">Saya ({myRegistrations.length})</TabsTrigger>
          ) : null}
        </TabsList>
      </Tabs>

      <DataToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Cari nama, tim, atau email..."
      >
        <Select
          value={statusFilter || undefined}
          onValueChange={(v) => {
            setStatusFilter(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full bg-background sm:w-40">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="detecting">Detecting</SelectItem>
              <SelectItem value="paid">Lunas</SelectItem>
              <SelectItem value="failed">Gagal</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={lombaFilter || undefined}
          onValueChange={(v) => {
            setLombaFilter(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full bg-background sm:w-48">
            <SelectValue placeholder="Semua Lomba" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Semua Lomba</SelectItem>
              {(allCompetitions ?? []).map((c) => (
                <SelectItem key={c.id} value={c.title}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </DataToolbar>

      {filtered.length === 0 ? (
        <SectionCard>
          <EmptyState
            icon={<ClipboardList />}
            title={
              search || statusFilter || lombaFilter
                ? "Tidak ada pendaftaran yang cocok"
                : "Belum ada pendaftaran"
            }
            description="Ubah filter atau tab untuk melihat data lain."
          />
        </SectionCard>
      ) : (
        <SectionCard bodyClassName="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 px-4">No</TableHead>
                  <TableHead className="px-4">Referensi</TableHead>
                  <TableHead className="px-4">Nama / Tim</TableHead>
                  <TableHead className="hidden px-4 md:table-cell">Lomba</TableHead>
                  <TableHead className="px-4">Status</TableHead>
                  <TableHead className="hidden px-4 text-right md:table-cell">Tanggal</TableHead>
                  <TableHead className="w-24 px-4 text-right">
                    <span className="sr-only">Aksi</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((reg, i) => (
                  <TableRow key={reg.id}>
                    <TableCell className="px-4 font-mono text-xs text-muted-foreground tabular-nums">
                      {(page - 1) * PAGE_SIZE + i + 1}
                    </TableCell>
                    <TableCell className="px-4">
                      <code className="font-mono text-xs font-medium">
                        {reg.paymentReference || "-"}
                      </code>
                    </TableCell>
                    <TableCell className="px-4">
                      <p className="font-medium">
                        {reg.type === "team" ? reg.teamName : reg.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">{reg.email}</p>
                    </TableCell>
                    <TableCell className="hidden px-4 md:table-cell">
                      {reg.competitionName}
                    </TableCell>
                    <TableCell className="px-4">
                      <StatusBadge status={reg.paymentStatus} />
                    </TableCell>
                    <TableCell className="hidden px-4 text-right text-xs text-muted-foreground md:table-cell">
                      {reg.createdAt
                        ? new Date(reg.createdAt).toLocaleDateString("id-ID")
                        : "-"}
                    </TableCell>
                    <TableCell className="px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => setRegToDelete(reg)}
                          title="Hapus"
                          aria-label="Hapus pendaftaran"
                        >
                          <Trash2 />
                        </Button>
                        <Button asChild variant="ghost" size="icon-sm">
                          <Link
                            href={`/dashboard/registrations/${reg.id}`}
                            aria-label={`Detail ${reg.id}`}
                          >
                            <ChevronRight />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      )}

      <Pagination
        currentPage={page}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      <ResponsiveAlertDialog
        open={!!regToDelete}
        onOpenChange={(open) => !open && setRegToDelete(null)}
        title="Hapus Pendaftaran?"
        description={
          regToDelete ? (
            <span>
              Yakin ingin menghapus pendaftaran untuk{" "}
              <strong>
                {regToDelete.type === "team" ? regToDelete.teamName : regToDelete.fullName}
              </strong>{" "}
              (Ref:{" "}
              <code className="font-mono">
                {regToDelete.paymentReference || regToDelete.id.slice(0, 8)}
              </code>
              )? Data dan berkas terkait akan dihapus permanen.
            </span>
          ) : null
        }
        confirmText="Ya, Hapus"
        cancelText="Batal"
        destructive
        loading={deleteLoading}
        onConfirm={handleDelete}
      />
    </PageShell>
  );
}
