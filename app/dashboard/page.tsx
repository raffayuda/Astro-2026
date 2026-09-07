import { db } from '@/src/db';
import { competitions, registrations } from '@/src/db/schema';
import { count, sql, eq } from 'drizzle-orm';
import { Users, Trophy, Banknote, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import OverviewCharts from '@/components/OverviewCharts';

export default async function DashboardOverview() {
  const totalRegistrations = await db.select({ count: count() }).from(registrations);
  const totalCompetitions = await db.select({ count: count() }).from(competitions);
  const paidRegistrations = await db
    .select({ count: count() })
    .from(registrations)
    .where(eq(registrations.paymentStatus, 'paid'));
  const totalRevenue = await db
    .select({ total: sql<number>`COALESCE(SUM(payment_amount), 0)` })
    .from(registrations)
    .where(eq(registrations.paymentStatus, 'paid'));

  // Per competition stats
  const perCompetition = await db
    .select({
      name: competitions.title,
      category: competitions.category,
      count: count(),
    })
    .from(registrations)
    .innerJoin(competitions, eq(registrations.competitionId, competitions.id))
    .groupBy(competitions.id, competitions.title, competitions.category);

  const stats = [
    {
      label: 'Total Pendaftar',
      value: totalRegistrations[0].count,
      icon: Users,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    },
    {
      label: 'Total Lomba',
      value: totalCompetitions[0].count,
      icon: Trophy,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Pembayaran Terverifikasi',
      value: paidRegistrations[0].count,
      icon: CheckCircle2,
      color: 'text-green-600 bg-green-50 border-green-200',
    },
    {
      label: 'Total Revenue',
      value: `Rp ${(totalRevenue[0]?.total || 0).toLocaleString('id-ID')}`,
      icon: Banknote,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-xl bg-linear-to-br from-astro-navy via-astro-blue to-blue-400 shadow-soft-lg p-6 text-white">
        <h1 className="text-2xl font-black uppercase tracking-tight text-white">Overview</h1>
        <p className="mt-1 text-sm font-semibold text-white/85">
          Ringkasan data pendaftaran ASTRO 2026
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="rounded-xl bg-white shadow-soft">
              <CardContent className="flex items-start gap-4 p-5">
                <div className={cn('border p-3', stat.color)} style={{ clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)' }}>
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="text-10 font-black uppercase tracking-[0.15em] text-astro-blue/70">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-2xl font-black text-astro-navy">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <OverviewCharts />

      {/* Per Competition Table */}
      <Card className="rounded-xl bg-white shadow-soft">
        <CardHeader>
          <CardTitle className="text-sm font-black uppercase tracking-tight">
            Pendaftar Per Lomba
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
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
                  <TableCell colSpan={3} className="px-5 py-8 text-center text-sm text-muted-foreground">
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
                    <TableCell className="px-5 text-right font-black text-foreground">{row.count}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
