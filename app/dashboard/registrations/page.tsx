'use client';

import { useState } from 'react';
import { authClient } from '@/src/lib/auth-client';
import Link from 'next/link';
import { Search, ChevronRight } from 'lucide-react';
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
import { useCompetitions, useRegistrations } from '@/src/lib/hooks/use-queries';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

const statusColors: Record<string, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  detecting: 'border-blue-200 bg-blue-50 text-blue-700',
  paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  failed: 'border-red-200 bg-red-50 text-red-700',
};

export default function RegistrationsPage() {
  const [tab, setTab] = useState<'all' | 'mine'>('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [lombaFilter, setLombaFilter] = useState('');

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

  const [page, setPage] = useState(1);
  const filtered = displayed.filter((reg: any) => {
    const matchSearch = !search ||
      reg.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      reg.teamName?.toLowerCase().includes(search.toLowerCase()) ||
      reg.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || reg.paymentStatus === statusFilter;
    const matchLomba = !lombaFilter || reg.competitionName === lombaFilter;
    return matchSearch && matchStatus && matchLomba;
  });
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-6 text-primary" />
      </div>
    );
  }

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setLombaFilter('');
  };

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
        <TabsList className="bg-muted">
          <TabsTrigger value="all" onClick={() => resetFilters()}>Semua Pendaftaran</TabsTrigger>
          <TabsTrigger value="mine" onClick={() => resetFilters()}>Pendaftaran Saya</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <InputGroup className="clip-angled h-10 border-border bg-white">
            <InputGroupAddon align="inline-start">
              <Search className="size-3.5 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, tim, atau email..."
              className="text-xs font-medium"
            />
          </InputGroup>
        </div>

        <Select value={statusFilter || undefined} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="clip-angled-sm h-10 w-full bg-white sm:w-44">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="detecting">Detecting</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={lombaFilter || undefined} onValueChange={(v) => setLombaFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="clip-angled-sm h-10 w-full bg-white sm:w-56">
            <SelectValue placeholder="Semua Lomba" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Semua Lomba</SelectItem>
              {(allCompetitions ?? []).map((c: any) => (
                <SelectItem key={c.id} value={c.title}>{c.title}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="clip-angled-lg overflow-hidden border border-border bg-background">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <TableHead className="w-10 px-5">No</TableHead>
                <TableHead className="px-5">Referensi</TableHead>
                <TableHead className="px-5">Nama / Tim</TableHead>
                <TableHead className="hidden px-5 md:table-cell">Lomba</TableHead>
                <TableHead className="px-5">Status</TableHead>
                <TableHead className="hidden px-5 text-right md:table-cell">Tanggal</TableHead>
                <TableHead className="w-10 px-5 text-right"></TableHead>
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
                    <TableCell className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{i + 1}</TableCell>
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
                      <Badge variant="outline" className={cn('clip-angled-sm border text-[10px] font-bold uppercase tracking-wider', statusColors[reg.paymentStatus] || statusColors.pending)}>
                        {reg.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden px-5 py-3.5 text-right md:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString('id-ID') : '—'}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-right">
                      <Button asChild variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-primary">
                        <Link href={`/dashboard/registrations/${reg.id}`} aria-label={`Detail ${reg.id}`}>
                          <ChevronRight />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Pagination currentPage={page} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </div>
  );
}
