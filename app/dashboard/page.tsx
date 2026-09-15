import { db } from "@/src/db";
import { competitions, registrations } from "@/src/db/schema";
import { count, sql, eq, desc, inArray } from "drizzle-orm";
import { Users, Trophy, Banknote, CheckCircle2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader, PageShell, SectionCard, StatTile } from "@/components/dashboard";
import OverviewCharts, { type OverviewAnalyticsData } from "@/components/OverviewCharts";

const CATEGORY_BADGES: Record<string, { label: string; className: string }> = {
  akademik: { label: "Akademik", className: "border-blue-200 bg-blue-50 text-blue-700" },
  olahraga: { label: "Olahraga", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  "kesenian-/-seni": {
    label: "Kesenian",
    className: "border-purple-200 bg-purple-50 text-purple-700",
  },
  esports: { label: "Esports", className: "border-amber-200 bg-amber-50 text-amber-700" },
};

const STATUS_COLORS: Record<string, string> = {
  paid: "#10b981",
  pending: "#f59e0b",
  detecting: "#0ea5e9",
  failed: "#ef4444",
  expired: "#94a3b8",
};

export const dynamic = "force-dynamic";

export default async function DashboardOverview() {
  const [compStatsRows, potentialRevRow, statusRows, typeRows] = await Promise.all([
    db
      .select({
        id: competitions.id,
        title: competitions.title,
        category: competitions.category,
        totalCount: count(registrations.id),
        paidCount: sql<number>`COALESCE(COUNT(CASE WHEN ${registrations.paymentStatus} = 'paid' THEN 1 END), 0)`,
        pendingCount: sql<number>`COALESCE(COUNT(CASE WHEN ${registrations.paymentStatus} IN ('pending', 'detecting') THEN 1 END), 0)`,
        revenue: sql<number>`COALESCE(SUM(CASE WHEN ${registrations.paymentStatus} = 'paid' THEN ${registrations.paymentAmount} ELSE 0 END), 0)`,
      })
      .from(competitions)
      .leftJoin(registrations, eq(competitions.id, registrations.competitionId))
      .groupBy(competitions.id, competitions.title, competitions.category),
    db
      .select({ total: sql<number>`COALESCE(SUM(${registrations.paymentAmount}), 0)` })
      .from(registrations)
      .where(inArray(registrations.paymentStatus, ["pending", "detecting"])),
    db
      .select({
        status: registrations.paymentStatus,
        count: count(),
      })
      .from(registrations)
      .groupBy(registrations.paymentStatus),
    db
      .select({
        type: registrations.type,
        count: count(),
      })
      .from(registrations)
      .groupBy(registrations.type),
  ]);

  const totalComp = compStatsRows.length;
  const totalReg = compStatsRows.reduce((acc, r) => acc + Number(r.totalCount), 0);
  const paidReg = compStatsRows.reduce((acc, r) => acc + Number(r.paidCount), 0);
  const pendingReg = compStatsRows.reduce((acc, r) => acc + Number(r.pendingCount), 0);
  const totalRev = compStatsRows.reduce((acc, r) => acc + Number(r.revenue), 0);
  const potentialRev = Number(potentialRevRow[0]?.total || 0);
  const conversionRate = totalReg > 0 ? (paidReg / totalReg) * 100 : 0;
  const arpu = paidReg > 0 ? Math.round(totalRev / paidReg) : 0;
  const teamCount = typeRows.find((r) => r.type === "team")?.count || 0;
  const individualCount = typeRows.find((r) => r.type === "individual")?.count || 0;

  // Only query trends and recent registrations if there is actual registration data
  let dailyTrends: { date: string; total: number; paid: number }[] = [];
  let recentRegistrations: OverviewAnalyticsData["recentRegistrations"] = [];

  if (totalReg > 0) {
    const [trendsRows, recentRows] = await Promise.all([
      db
        .select({
          date: sql<string>`TO_CHAR(${registrations.createdAt} AT TIME ZONE 'Asia/Jakarta', 'DD Mon')`,
          total: count(),
          paid: sql<number>`COALESCE(COUNT(CASE WHEN ${registrations.paymentStatus} = 'paid' THEN 1 END), 0)`,
        })
        .from(registrations)
        .groupBy(
          sql`TO_CHAR(${registrations.createdAt} AT TIME ZONE 'Asia/Jakarta', 'DD Mon')`,
          sql`DATE(${registrations.createdAt} AT TIME ZONE 'Asia/Jakarta')`,
        )
        .orderBy(sql`DATE(${registrations.createdAt} AT TIME ZONE 'Asia/Jakarta')`),
      db
        .select({
          id: registrations.id,
          type: registrations.type,
          fullName: registrations.fullName,
          teamName: registrations.teamName,
          leaderName: registrations.leaderName,
          institution: registrations.institution,
          paymentStatus: registrations.paymentStatus,
          paymentAmount: registrations.paymentAmount,
          createdAt: registrations.createdAt,
          competitionTitle: competitions.title,
        })
        .from(registrations)
        .innerJoin(competitions, eq(registrations.competitionId, competitions.id))
        .orderBy(desc(registrations.createdAt))
        .limit(5),
    ]);

    dailyTrends = trendsRows.map((r) => ({
      date: r.date,
      total: Number(r.total),
      paid: Number(r.paid),
    }));

    recentRegistrations = recentRows.map((r) => ({
      id: r.id,
      type: r.type,
      fullName: r.fullName,
      teamName: r.teamName,
      leaderName: r.leaderName,
      institution: r.institution,
      paymentStatus: r.paymentStatus,
      paymentAmount: r.paymentAmount,
      createdAt: r.createdAt.toISOString(),
      competitionTitle: r.competitionTitle,
    }));
  }

  // Aggregate category distribution from competition results
  const categoryMap = new Map<string, { count: number; paidCount: number }>();
  for (const row of compStatsRows) {
    const cat = row.category || "Lainnya";
    const existing = categoryMap.get(cat) || { count: 0, paidCount: 0 };
    existing.count += Number(row.totalCount);
    existing.paidCount += Number(row.paidCount);
    categoryMap.set(cat, existing);
  }

  const categoryDistribution = Array.from(categoryMap.entries()).map(([name, val]) => ({
    name,
    count: val.count,
    paidCount: val.paidCount,
    percentage: totalReg > 0 ? Math.round((val.count / totalReg) * 100) : 0,
  }));

  const statusDistribution = statusRows.map((r) => ({
    name: r.status,
    value: Number(r.count),
    color: STATUS_COLORS[r.status] || "#94a3b8",
  }));

  const perCompetition = compStatsRows.map((r) => ({
    id: r.id,
    name: r.title,
    category: r.category,
    totalCount: Number(r.totalCount),
    paidCount: Number(r.paidCount),
    pendingCount: Number(r.pendingCount),
    revenue: Number(r.revenue),
  }));

  const analyticsData: OverviewAnalyticsData = {
    totalRegistrations: totalReg,
    totalCompetitions: totalComp,
    paidRegistrations: paidReg,
    pendingRegistrations: pendingReg,
    totalRevenue: totalRev,
    potentialRevenue: potentialRev,
    conversionRate,
    arpu,
    teamCount,
    individualCount,
    perCompetition,
    statusDistribution,
    categoryDistribution,
    dailyTrends,
    recentRegistrations,
  };

  const stats = [
    {
      label: "Total Pendaftar",
      value: totalReg,
      icon: <Users />,
      tone: "blue" as const,
    },
    {
      label: "Total Lomba",
      value: totalComp,
      icon: <Trophy />,
      tone: "emerald" as const,
    },
    {
      label: "Pembayaran Terverifikasi",
      value: paidReg,
      icon: <CheckCircle2 />,
      tone: "green" as const,
    },
    {
      label: "Total Revenue",
      value: `Rp ${totalRev.toLocaleString("id-ID")}`,
      icon: <Banknote />,
      tone: "amber" as const,
    },
  ];

  return (
    <PageShell className="space-y-6">
      <PageHeader
        title="Overview"
        description="Ringkasan pendaftaran, pembayaran, dan performa kompetisi ASTRO 2026."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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

      <OverviewCharts initialData={analyticsData} />

      <SectionCard
        title="Performa Per Lomba"
        description="Pendaftar, konversi pembayaran, dan revenue per kompetisi."
        bodyClassName="px-0"
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Lomba</TableHead>
                <TableHead className="px-4">Kategori</TableHead>
                <TableHead className="px-4 text-right">Total</TableHead>
                <TableHead className="px-4 text-right">Lunas</TableHead>
                <TableHead className="px-4 text-right">Menunggu</TableHead>
                <TableHead className="px-4 text-right">Revenue</TableHead>
                <TableHead className="px-4 text-right">Konversi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {perCompetition.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Belum ada data kompetisi.
                  </TableCell>
                </TableRow>
              ) : (
                perCompetition.map((row) => {
                  const catCfg = CATEGORY_BADGES[row.category] || {
                    label: row.category,
                    className: "border-border bg-muted text-foreground",
                  };
                  const compConv =
                    row.totalCount > 0
                      ? Math.round((row.paidCount / row.totalCount) * 100)
                      : 0;

                  return (
                    <TableRow key={row.id}>
                      <TableCell className="px-4 font-medium">{row.name}</TableCell>
                      <TableCell className="px-4">
                        <Badge
                          variant="outline"
                          className={`normal-case tracking-normal font-medium shadow-none ${catCfg.className}`}
                        >
                          {catCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 text-right tabular-nums">{row.totalCount}</TableCell>
                      <TableCell className="px-4 text-right tabular-nums text-emerald-600">
                        {row.paidCount}
                      </TableCell>
                      <TableCell className="px-4 text-right tabular-nums text-amber-600">
                        {row.pendingCount}
                      </TableCell>
                      <TableCell className="px-4 text-right tabular-nums font-medium">
                        Rp {row.revenue.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="px-4 text-right">
                        <Badge
                          variant="outline"
                          className="normal-case tracking-normal font-medium shadow-none tabular-nums"
                        >
                          {compConv}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </PageShell>
  );
}

