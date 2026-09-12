"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Percent,
  Clock,
  Banknote,
  Users,
  Trophy,
  CheckCircle2,
  ArrowRight,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CompetitionStat {
  id: string;
  name: string;
  category: string;
  totalCount: number;
  paidCount: number;
  revenue: number;
}

export interface StatusStat {
  name: string;
  value: number;
  color: string;
}

export interface CategoryStat {
  name: string;
  count: number;
  paidCount: number;
  percentage: number;
}

export interface DailyTrendStat {
  date: string;
  total: number;
  paid: number;
}

export interface RecentRegistration {
  id: string;
  type: string;
  fullName: string | null;
  teamName: string | null;
  leaderName: string | null;
  institution: string;
  paymentStatus: string;
  paymentAmount: number;
  createdAt: string;
  competitionTitle: string;
}

export interface OverviewAnalyticsData {
  totalRegistrations: number;
  totalCompetitions: number;
  paidRegistrations: number;
  pendingRegistrations: number;
  totalRevenue: number;
  potentialRevenue: number;
  conversionRate: number;
  arpu: number;
  teamCount: number;
  individualCount: number;
  perCompetition: CompetitionStat[];
  statusDistribution: StatusStat[];
  categoryDistribution: CategoryStat[];
  dailyTrends: DailyTrendStat[];
  recentRegistrations: RecentRegistration[];
}

interface OverviewChartsProps {
  initialData?: OverviewAnalyticsData;
}

interface TooltipContentProps {
  active?: boolean;
  label?: string | number;
  payload?: { name?: string; value?: number | string; color?: string; dataKey?: string }[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  paid: { label: "Terverifikasi", color: "#10b981" },
  pending: { label: "Menunggu", color: "#f59e0b" },
  detecting: { label: "Mengecek", color: "#0ea5e9" },
  failed: { label: "Gagal", color: "#ef4444" },
  expired: { label: "Kedaluwarsa", color: "#94a3b8" },
};

const CATEGORY_LABELS: Record<string, string> = {
  akademik: "Akademik",
  olahraga: "Olahraga",
  "kesenian-/-seni": "Kesenian & Seni",
  esports: "Esports",
};

const CATEGORY_COLORS: Record<string, string> = {
  akademik: "#3b82f6",
  olahraga: "#10b981",
  "kesenian-/-seni": "#8b5cf6",
  esports: "#f59e0b",
};

/**
 * Custom glass tooltip styled for ASTRO admin chrome.
 */
function CustomChartTooltip({ active, payload, label }: TooltipContentProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-astro-cyan-2/70 bg-white/95 p-3.5 shadow-lg backdrop-blur-md text-xs">
        <p className="font-bold text-astro-navy mb-1.5 border-b border-astro-cyan-2/30 pb-1">
          {label}
        </p>
        <div className="space-y-1">
          {payload.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4 font-medium">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                {item.name}:
              </span>
              <span className="font-bold text-astro-navy">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

/**
 * Overview Analytics Component
 * Displays interactive trend lines, competition performance bars, status distribution donut,
 * category breakdowns, and secondary insight metrics.
 */
const DEFAULT_DATA: OverviewAnalyticsData = {
  totalRegistrations: 0,
  totalCompetitions: 0,
  paidRegistrations: 0,
  pendingRegistrations: 0,
  totalRevenue: 0,
  potentialRevenue: 0,
  conversionRate: 0,
  arpu: 0,
  teamCount: 0,
  individualCount: 0,
  perCompetition: [],
  statusDistribution: [],
  categoryDistribution: [],
  dailyTrends: [],
  recentRegistrations: [],
};

export default function OverviewCharts({ initialData }: OverviewChartsProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "trends" | "competitions">("overview");
  const data: OverviewAnalyticsData = initialData || DEFAULT_DATA;
  const hasRegistrations = data.totalRegistrations > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Analytics Section Header & Quick Tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-black uppercase tracking-tight text-foreground">
            <TrendingUp className="size-5 text-astro-blue" />
            Analytics & Performa
          </h2>
          <p className="text-xs text-muted-foreground">
            Metrik analitik real-time pendaftaran, konversi pembayaran, dan performa cabang lomba.
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-astro-cyan-2/60 bg-white/70 p-1 shadow-2xs">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("overview")}
            className={cn(
              "h-7 rounded-md px-3 text-xs font-bold transition-all",
              activeTab === "overview"
                ? "bg-astro-blue text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Ringkasan
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("trends")}
            className={cn(
              "h-7 rounded-md px-3 text-xs font-bold transition-all",
              activeTab === "trends"
                ? "bg-astro-blue text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Tren Harian
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("competitions")}
            className={cn(
              "h-7 rounded-md px-3 text-xs font-bold transition-all",
              activeTab === "competitions"
                ? "bg-astro-blue text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Per Lomba
          </Button>
        </div>
      </div>

      {/* Secondary Quick Insight Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Conversion Rate */}
        <Card className="rounded-xl border-border bg-white shadow-soft-sm">
          <CardContent className="flex items-center justify-between p-4">
            <div className="space-y-1 min-w-0">
              <p className="text-10 font-bold uppercase tracking-wider text-muted-foreground">
                Tingkat Konversi
              </p>
              <p className="text-xl font-black text-foreground">
                {data.conversionRate.toFixed(1)}%
              </p>
              <p className="text-10 text-muted-foreground">
                {data.paidRegistrations} dari {data.totalRegistrations} pendaftar lunas
              </p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-emerald-600 shrink-0">
              <Percent className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Potential Revenue */}
        <Card className="rounded-xl border-border bg-white shadow-soft-sm">
          <CardContent className="flex items-center justify-between p-4">
            <div className="space-y-1 min-w-0">
              <p className="text-10 font-bold uppercase tracking-wider text-muted-foreground">
                Potensi Tertunda
              </p>
              <p className="text-xl font-black text-amber-600 truncate">
                Rp {data.potentialRevenue.toLocaleString("id-ID")}
              </p>
              <p className="text-10 text-muted-foreground">
                {data.pendingRegistrations} transaksi menunggu bayar
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-amber-600 shrink-0">
              <Clock className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* ARPU / Average Order */}
        <Card className="rounded-xl border-border bg-white shadow-soft-sm">
          <CardContent className="flex items-center justify-between p-4">
            <div className="space-y-1 min-w-0">
              <p className="text-10 font-bold uppercase tracking-wider text-muted-foreground">
                Rata-Rata Transaksi
              </p>
              <p className="text-xl font-black text-foreground truncate">
                Rp {data.arpu.toLocaleString("id-ID")}
              </p>
              <p className="text-10 text-muted-foreground">Nilai per pendaftaran lunas</p>
            </div>
            <div className="rounded-lg border border-astro-cyan-2 bg-sky-bottom p-2.5 text-astro-blue shrink-0">
              <Banknote className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Demographics / Type */}
        <Card className="rounded-xl border-border bg-white shadow-soft-sm">
          <CardContent className="flex items-center justify-between p-4">
            <div className="space-y-1 min-w-0">
              <p className="text-10 font-bold uppercase tracking-wider text-muted-foreground">
                Tipe Pendaftar
              </p>
              <p className="text-xl font-black text-foreground truncate">
                {data.teamCount} <span className="text-xs font-normal text-muted-foreground">Tim</span>{" "}
                / {data.individualCount}{" "}
                <span className="text-xs font-normal text-muted-foreground">Individu</span>
              </p>
              <p className="text-10 text-muted-foreground">Partisipasi tim vs individu</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/60 p-2.5 text-muted-foreground shrink-0">
              <Users className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Bento Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Tren Pendaftaran Harian (Area Chart) */}
        {(activeTab === "overview" || activeTab === "trends") && (
          <Card
            className={cn(
              "rounded-xl border-border bg-white shadow-soft-sm",
              activeTab === "trends" ? "lg:col-span-5" : "lg:col-span-3",
            )}
          >
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                    <Calendar className="size-4 text-astro-blue" />
                    Tren Pendaftaran Harian
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Pertumbuhan pendaftar baru dan pembayaran terverifikasi setiap hari.
                  </CardDescription>
                </div>
                {hasRegistrations && (
                  <Badge variant="outline" className="text-10 text-astro-blue border-astro-cyan-2">
                    Aktif
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-5">
              {!hasRegistrations || data.dailyTrends.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-sky-bottom p-3 text-astro-blue mb-2.5">
                    <TrendingUp className="size-6" />
                  </div>
                  <p className="text-sm font-bold text-foreground">Belum Ada Riwayat Tren Harian</p>
                  <p className="text-xs text-muted-foreground max-w-sm mt-1">
                    Grafik time-series akan otomatis terbentuk begitu peserta mulai mendaftar dan
                    melakukan konfirmasi pembayaran.
                  </p>
                </div>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data.dailyTrends}
                      margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#126FD6" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#126FD6" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: "#64748b" }}
                        tickLine={false}
                        axisLine={{ stroke: "#e2e8f0" }}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#64748b" }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ fontSize: 11, fontWeight: 600 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        name="Total Pendaftar"
                        stroke="#126FD6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorTotal)"
                      />
                      <Area
                        type="monotone"
                        dataKey="paid"
                        name="Lunas (Paid)"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorPaid)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Distribusi Status Pembayaran (Donut Chart) */}
        {(activeTab === "overview" || activeTab === "trends") && (
          <Card
            className={cn(
              "rounded-xl border-border bg-white shadow-soft-sm",
              activeTab === "trends" ? "lg:col-span-5" : "lg:col-span-2",
            )}
          >
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                <PieIcon className="size-4 text-emerald-600" />
                Status Pembayaran
              </CardTitle>
              <CardDescription className="text-xs">
                Proporsi penyelesaian tagihan pendaftaran.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              {!hasRegistrations || data.statusDistribution.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-emerald-50 p-3 text-emerald-600 mb-2.5">
                    <CheckCircle2 className="size-6" />
                  </div>
                  <p className="text-sm font-bold text-foreground">Belum Ada Transaksi</p>
                  <p className="text-xs text-muted-foreground max-w-xs mt-1">
                    Status transaksi QRIS & transfer peserta akan ditampilkan di sini secara visual.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="relative size-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.statusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {data.statusDistribution.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.color} stroke="transparent" />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomChartTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Centered Total Count */}
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-black text-foreground">
                        {data.totalRegistrations}
                      </span>
                      <span className="text-10 font-bold uppercase tracking-wider text-muted-foreground">
                        Total
                      </span>
                    </div>
                  </div>

                  {/* Status Badges List */}
                  <div className="mt-4 grid grid-cols-2 gap-2 w-full">
                    {data.statusDistribution.map((s) => {
                      const cfg = STATUS_CONFIG[s.name] || { label: s.name, color: s.color };
                      const pct =
                        data.totalRegistrations > 0
                          ? Math.round((s.value / data.totalRegistrations) * 100)
                          : 0;
                      return (
                        <div
                          key={s.name}
                          className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/30 px-2.5 py-1.5 text-xs"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span
                              className="size-2 rounded-full shrink-0"
                              style={{ backgroundColor: cfg.color }}
                            />
                            <span className="font-semibold text-foreground truncate">
                              {cfg.label}
                            </span>
                          </div>
                          <span className="font-bold text-muted-foreground shrink-0 text-11">
                            {s.value} ({pct}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Performa Lomba: Pendaftar vs Terverifikasi (Grouped Bar Chart) */}
        {(activeTab === "overview" || activeTab === "competitions") && (
          <Card
            className={cn(
              "rounded-xl border-border bg-white shadow-soft-sm",
              activeTab === "competitions" ? "lg:col-span-5" : "lg:col-span-3",
            )}
          >
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                    <BarChart3 className="size-4 text-astro-blue" />
                    Performa Pendaftar Per Lomba
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Perbandingan total pendaftar dan pendaftar yang sudah lunas per cabang.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-10 border-astro-cyan-2">
                  {data.perCompetition.length} Lomba
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              {data.perCompetition.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Belum ada data kompetisi.
                </p>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.perCompetition}
                      margin={{ top: 10, right: 10, left: -15, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: "#0A1E3F" }}
                        tickLine={false}
                        axisLine={{ stroke: "#A4E2F6" }}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                        height={40}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#64748b" }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ fontSize: 11, fontWeight: 600 }}
                      />
                      <Bar
                        dataKey="totalCount"
                        name="Total Pendaftar"
                        fill="#126FD6"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                      />
                      <Bar
                        dataKey="paidCount"
                        name="Lunas (Paid)"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Distribusi Kategori Lomba & Demografi */}
        {(activeTab === "overview" || activeTab === "competitions") && (
          <Card
            className={cn(
              "rounded-xl border-border bg-white shadow-soft-sm",
              activeTab === "competitions" ? "lg:col-span-5" : "lg:col-span-2",
            )}
          >
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                <Trophy className="size-4 text-amber-500" />
                Distribusi Kategori
              </CardTitle>
              <CardDescription className="text-xs">
                Sebaran minat peserta berdasarkan rumpun kategori lomba.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              {data.categoryDistribution.length === 0 ? (
                <div className="space-y-3">
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">{label}</span>
                        <span className="text-muted-foreground">0 pendaftar (0%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-astro-blue/30 rounded-full w-0" />
                      </div>
                    </div>
                  ))}
                  <p className="pt-2 text-center text-10 text-muted-foreground">
                    Menunggu pendaftaran pertama untuk kalkulasi persentase kategori.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.categoryDistribution.map((cat) => {
                    const label = CATEGORY_LABELS[cat.name] || cat.name;
                    const color = CATEGORY_COLORS[cat.name] || "#126FD6";
                    return (
                      <div key={cat.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground flex items-center gap-1.5">
                            <span
                              className="size-2 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                            {label}
                          </span>
                          <span className="font-black text-foreground">
                            {cat.count} ({cat.percentage}%)
                          </span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-muted/60 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${cat.percentage}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-10 text-muted-foreground">
                          <span>{cat.paidCount} terverifikasi lunas</span>
                          <span>{cat.count - cat.paidCount} tertunda</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pendaftaran Terkini (Recent Registrations Live Feed) */}
      {data.recentRegistrations && data.recentRegistrations.length > 0 && (
        <Card className="rounded-xl border-border bg-white shadow-soft-sm">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                  <Clock className="size-4 text-astro-blue" />
                  Pendaftaran Terkini
                </CardTitle>
                <CardDescription className="text-xs">
                  5 pendaftar terbaru yang masuk ke sistem ASTRO 2026.
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-xs font-bold text-astro-blue">
                <Link href="/dashboard/registrations" className="flex items-center gap-1">
                  Lihat Semua
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border overflow-x-auto">
              {data.recentRegistrations.map((reg) => {
                const cfg = STATUS_CONFIG[reg.paymentStatus] || {
                  label: reg.paymentStatus,
                  color: "#94a3b8",
                };
                const name = reg.type === "team" ? reg.teamName : reg.fullName;
                const formattedDate = new Date(reg.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={reg.id}
                    className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-bold text-foreground">{name}</p>
                        <Badge
                          variant="outline"
                          className="text-10 font-bold uppercase tracking-wider py-0 px-1.5"
                        >
                          {reg.type === "team" ? "Tim" : "Individu"}
                        </Badge>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {reg.competitionTitle} • {reg.institution}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-right">
                      <div className="hidden sm:block">
                        <p className="text-xs font-black text-foreground">
                          Rp {reg.paymentAmount.toLocaleString("id-ID")}
                        </p>
                        <p className="text-10 text-muted-foreground">{formattedDate}</p>
                      </div>
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
                        style={{
                          backgroundColor: `${cfg.color}15`,
                          color: cfg.color,
                        }}
                      >
                        <span
                          className="size-1.5 rounded-full"
                          style={{ backgroundColor: cfg.color }}
                        />
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

