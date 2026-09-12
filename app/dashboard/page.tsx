import { db } from "@/src/db";
import { competitions, registrations } from "@/src/db/schema";
import { count, sql, eq } from "drizzle-orm";
import { Users, Trophy, Banknote, CheckCircle2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader, SectionCard, StatTile } from "@/components/dashboard";
import OverviewCharts from "@/components/OverviewCharts";

export default async function DashboardOverview() {
  // Five independent aggregates — issue them together rather than paying five
  // sequential round trips before the page can render.
  const [totalRegistrations, totalCompetitions, paidRegistrations, totalRevenue, perCompetition] =
    await Promise.all([
      db.select({ count: count() }).from(registrations),
      db.select({ count: count() }).from(competitions),
      db
        .select({ count: count() })
        .from(registrations)
        .where(eq(registrations.paymentStatus, "paid")),
      db
        .select({ total: sql<number>`COALESCE(SUM(payment_amount), 0)` })
        .from(registrations)
        .where(eq(registrations.paymentStatus, "paid")),
      db
        .select({
          name: competitions.title,
          category: competitions.category,
          count: count(),
        })
        .from(registrations)
        .innerJoin(competitions, eq(registrations.competitionId, competitions.id))
        .groupBy(competitions.id, competitions.title, competitions.category),
    ]);

  const stats = [
    {
      label: "Total Pendaftar",
      value: totalRegistrations[0].count,
      icon: <Users />,
      tone: "blue" as const,
    },
    {
      label: "Total Lomba",
      value: totalCompetitions[0].count,
      icon: <Trophy />,
      tone: "emerald" as const,
    },
    {
      label: "Pembayaran Terverifikasi",
      value: paidRegistrations[0].count,
      icon: <CheckCircle2 />,
      tone: "green" as const,
    },
    {
      label: "Total Revenue",
      value: `Rp ${(totalRevenue[0]?.total || 0).toLocaleString("id-ID")}`,
      icon: <Banknote />,
      tone: "amber" as const,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Overview" description="Ringkasan data pendaftaran ASTRO 2026" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatTile
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            tone={stat.tone}
          />
        ))}
      </div>

      {/* Charts */}
      <OverviewCharts />

      {/* Per Competition Table */}
      <SectionCard title="Pendaftar Per Lomba" bodyClassName="px-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-10 font-bold uppercase tracking-wider text-muted-foreground">
              <TableHead className="px-5">Lomba</TableHead>
              <TableHead className="px-5">Kategori</TableHead>
              <TableHead className="px-5 text-right">Jumlah Pendaftar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {perCompetition.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="px-5 py-8 text-center text-sm text-muted-foreground"
                >
                  Belum ada data pendaftaran.
                </TableCell>
              </TableRow>
            ) : (
              perCompetition.map((row) => (
                <TableRow key={row.name} className="hover:bg-muted/50">
                  <TableCell className="px-5 font-medium text-foreground">{row.name}</TableCell>
                  <TableCell className="px-5 text-10 font-bold uppercase tracking-wider text-muted-foreground">
                    {row.category}
                  </TableCell>
                  <TableCell className="px-5 text-right font-black text-foreground">
                    {row.count}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </SectionCard>
    </div>
  );
}
