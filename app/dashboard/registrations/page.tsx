'use client';

import { useState } from 'react';
import { authClient } from '@/src/lib/auth-client';
import Link from 'next/link';
import { Search, ChevronRight, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Pagination from '@/components/Pagination';
import { useCompetitions, useRegistrations, queryKeys } from '@/src/lib/hooks/use-queries';
import { useQueryClient } from '@tanstack/react-query';
import { apiHelpers } from '@/src/lib/api';
import { toast } from 'sonner';
import { ResponsiveAlertDialog } from '@/components/responsive-alert-dialog';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

const statusColors: Record<string, string> = {
  paid: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  detecting: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  failed: 'bg-red-500/10 text-red-600 border-red-500/20',
};

export default function RegistrationsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'all' | 'mine'>('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [lombaFilter, setLombaFilter] = useState('');
  const [page, setPage] = useState(1);
  const [regToDelete, setRegToDelete] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { data: allCompetitions } = useCompetitions();
  const { data: regPage, isLoading: loading } = useRegistrations({ pageSize: 100 });
  const { data: session } = authClient.useSession();

  const userEmail = session?.user?.email ?? '';
  const registrations = Array.isArray(regPage) ? regPage : (regPage as any)?.data ?? [];
  const userId = session?.user?.id;
  const myRegistrations = (userEmail || userId)
    ? registrations.filter(
        (r: any) =>
          (userEmail && r.email?.toLowerCase() === userEmail.toLowerCase()) ||
          (userId && r.userId === userId),
      )
    : [];

  const displayed = tab === 'mine' ? myRegistrations : registrations;

  const filtered = displayed.filter((reg: any) => {
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
    setSearch('');
    setStatusFilter('');
    setLombaFilter('');
  };

  const handleDelete = async () => {
    if (!regToDelete) return;
    setDeleteLoading(true);
    try {
      await apiHelpers.registrations.delete(regToDelete.id);
      toast.success('Pendaftaran berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: queryKeys.registrations.all });
      setRegToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus pendaftaran');
    } finally {
      setDeleteLoading(false);
    }
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
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">Pendaftaran</h1>
        <p className="mt-1 text-sm font-light text-muted-foreground">
          {tab === 'mine' ? `${userEmail} — ${myRegistrations.length} pendaftaran` : `${registrations.length} total pendaftaran`}
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => { setTab(v as 'all' | 'mine'); setPage(1); }}>
        <TabsList className="rounded-md">
          <TabsTrigger value="all" className="rounded-md text-xs font-bold uppercase tracking-wider" onClick={() => resetFilters()}>
            Semua ({registrations.length})
          </TabsTrigger>
          {userEmail && (
            <TabsTrigger value="mine" className="rounded-md text-xs font-bold uppercase tracking-wider" onClick={() => resetFilters()}>
              Pendaftaran Saya ({myRegistrations.length})
            </TabsTrigger>
          )}
        </TabsList>
      </Tabs>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <InputGroup className="rounded-md flex-1 bg-background">
          <InputGroupAddon>
            <Search className="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Cari nama, tim, atau email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </InputGroup>

        <Select value={statusFilter || undefined} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="rounded-md w-full bg-background sm:w-40">
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

        <Select value={lombaFilter || undefined} onValueChange={(v) => { setLombaFilter(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="rounded-md w-full bg-background sm:w-48">
            <SelectValue placeholder="Semua Lomba" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Semua Lomba</SelectItem>
              {(allCompetitions ?? []).map((c: any) => (
                <SelectItem key={c.id} value={c.title}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden border border-border bg-background">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 text-10 font-bold uppercase tracking-wider text-muted-foreground">
                <TableHead className="w-10 px-5">No</TableHead>
                <TableHead className="px-5">Referensi</TableHead>
                <TableHead className="px-5">Nama / Tim</TableHead>
                <TableHead className="hidden px-5 md:table-cell">Lomba</TableHead>
                <TableHead className="px-5">Status</TableHead>
                <TableHead className="hidden px-5 text-right md:table-cell">Tanggal</TableHead>
                <TableHead className="w-20 px-5 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-5 py-12 text-center text-sm text-muted-foreground">
                    Belum ada pendaftaran.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((reg: any, i: number) => (
                  <TableRow key={reg.id} className="hover:bg-muted/50">
                    <TableCell className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{(page - 1) * PAGE_SIZE + i + 1}</TableCell>
                    <TableCell className="px-5 py-3.5">
                      <code className="font-mono text-xs font-bold text-foreground">
                        {reg.paymentReference || '—'}
                      </code>
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <p className="font-medium text-foreground">
                        {reg.type === 'team' ? reg.teamName : reg.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">{reg.email}</p>
                    </TableCell>
                    <TableCell className="hidden px-5 py-3.5 md:table-cell">
                      <span className="text-sm text-foreground">{reg.competitionName}</span>
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <Badge variant="outline" className={cn('rounded-md border text-10 font-bold uppercase tracking-wider', statusColors[reg.paymentStatus] || statusColors.pending)}>
                        {reg.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden px-5 py-3.5 text-right md:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString('id-ID') : '—'}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
                          onClick={() => setRegToDelete(reg)}
                          title="Hapus Pendaftaran"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                        <Button asChild variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-primary">
                          <Link href={`/dashboard/registrations/${reg.id}`} aria-label={`Detail ${reg.id}`}>
                            <ChevronRight />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Pagination currentPage={page} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />

      <ResponsiveAlertDialog
        open={!!regToDelete}
        onOpenChange={(open) => !open && setRegToDelete(null)}
        title="Hapus Pendaftaran?"
        description={
          regToDelete ? (
            <span>
              Apakah Anda yakin ingin menghapus pendaftaran untuk{' '}
              <strong>{regToDelete.type === 'team' ? regToDelete.teamName : regToDelete.fullName}</strong>{' '}
              (Ref: <code className="font-mono">{regToDelete.paymentReference || regToDelete.id.slice(0, 8)}</code>)? Tindakan ini akan menghapus data pendaftar dan berkas terkait secara permanen.
            </span>
          ) : null
        }
        confirmText="Ya, Hapus"
        cancelText="Batal"
        destructive
        loading={deleteLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
