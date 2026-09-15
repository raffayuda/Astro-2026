"use client";

import { useState } from "react";
import { authClient } from "@/src/lib/auth-client";
import { ClipboardList } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  EmptyState,
  PageHeader,
  PageShell,
  SectionCard,
  StatusBadge,
} from "@/components/dashboard";
import Pagination from "@/components/Pagination";
import { useRegistrations } from "@/src/lib/hooks/use-queries";
import { unwrapList } from "@/lib/lists";

const PAGE_SIZE = 10;

type MyRegistration = {
  id: string;
  competitionName: string | null;
  paymentReference: string | null;
  paymentStatus: string;
  createdAt: string | null;
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

  return (
    <PageShell loading={loading}>
      <PageHeader
        title="Pendaftaran Saya"
        description={`${userEmail} - ${registrations.length} pendaftaran`}
      />

      {registrations.length === 0 ? (
        <SectionCard>
          <EmptyState
            icon={<ClipboardList />}
            title="Belum ada pendaftaran"
            description="Pilih lomba yang ingin kamu ikuti untuk mulai mendaftar."
          >
            <Button asChild variant="outline" size="sm">
              <Link href="/#competitions">Lihat lomba</Link>
            </Button>
          </EmptyState>
        </SectionCard>
      ) : (
        <SectionCard bodyClassName="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4">Lomba</TableHead>
                  <TableHead className="hidden px-4 sm:table-cell">Referensi</TableHead>
                  <TableHead className="px-4">Status</TableHead>
                  <TableHead className="px-4 text-right">Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell className="px-4 font-medium">{reg.competitionName}</TableCell>
                    <TableCell className="hidden px-4 sm:table-cell">
                      <code className="font-mono text-xs text-muted-foreground">
                        {reg.paymentReference || "-"}
                      </code>
                    </TableCell>
                    <TableCell className="px-4">
                      <StatusBadge status={reg.paymentStatus} />
                    </TableCell>
                    <TableCell className="px-4 text-right text-xs text-muted-foreground">
                      {reg.createdAt
                        ? new Date(reg.createdAt).toLocaleDateString("id-ID")
                        : "-"}
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
        totalItems={registrations.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </PageShell>
  );
}
