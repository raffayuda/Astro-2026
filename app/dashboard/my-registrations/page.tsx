"use client";

import { useState } from "react";
import { authClient } from "@/src/lib/auth-client";
import { ClipboardList } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState, PageHeader, SectionCard } from "@/components/dashboard";
import Pagination from "@/components/Pagination";
import { useRegistrations } from "@/src/lib/hooks/use-queries";
import { unwrapList } from "@/lib/lists";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

type MyRegistration = {
  id: string;
  competitionName: string | null;
  paymentReference: string | null;
  paymentStatus: string;
  createdAt: string | null;
};

const statusColors: Record<string, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  detecting: "border-astro-cyan-2 bg-sky-bottom text-astro-navy",
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
  failed: "border-red-200 bg-red-50 text-red-700",
};

export default function MyRegistrationsPage() {
  const [page, setPage] = useState(1);
  const { data: session } = authClient.useSession();
  const userEmail = session?.user?.email ?? "";

  const { data: regPage, isLoading: loading } = useRegistrations({
    search: userEmail,
    pageSize: 100,
  });

  const registrations = unwrapList<MyRegistration>(regPage);
  const paginated = registrations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-6 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pendaftaran Saya"
        description={`${userEmail} — ${registrations.length} pendaftaran`}
      />

      {registrations.length === 0 ? (
        <EmptyState
          icon={<ClipboardList />}
          title="Belum ada pendaftaran."
          description="Pilih lomba yang ingin kamu ikuti untuk mulai mendaftar."
        >
          <Button
            asChild
            variant="link"
            className="text-xs font-bold uppercase tracking-wider text-primary"
          >
            <Link href="/#competitions">Lihat lomba</Link>
          </Button>
        </EmptyState>
      ) : (
        <SectionCard bodyClassName="px-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 text-10 font-bold uppercase tracking-wider text-muted-foreground">
                <TableHead className="px-5">Lomba</TableHead>
                <TableHead className="hidden px-5 sm:table-cell">Referensi</TableHead>
                <TableHead className="px-5">Status</TableHead>
                <TableHead className="px-5 text-right">Tanggal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {paginated.map((reg) => (
                <TableRow key={reg.id} className="hover:bg-muted/50">
                  <TableCell className="px-5 py-3.5 font-medium text-foreground">
                    {reg.competitionName}
                  </TableCell>
                  <TableCell className="hidden px-5 py-3.5 sm:table-cell">
                    <code className="font-mono text-xs text-muted-foreground">
                      {reg.paymentReference || "—"}
                    </code>
                  </TableCell>
                  <TableCell className="px-5 py-3.5">
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-md border text-10 font-bold uppercase tracking-wider",
                        statusColors[reg.paymentStatus] ||
                          "border-astro-cyan-2 bg-muted text-muted-foreground",
                      )}
                    >
                      {reg.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-3.5 text-right text-xs text-muted-foreground">
                    {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString("id-ID") : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>
      )}

      <Pagination
        currentPage={page}
        totalItems={registrations.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}
