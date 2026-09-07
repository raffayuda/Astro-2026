'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRegistrationStats } from '@/src/lib/hooks/use-queries';

interface ChartData {
  name: string;
  category: string;
  count: number;
}

interface StatusData {
  name: string;
  value: number;
  color: string;
}

const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  detecting: 'Detecting',
  paid: 'Paid',
  failed: 'Failed',
};

export default function OverviewCharts() {
  const { data: stats, isLoading: loading } = useRegistrationStats();
  const perCompetition: ChartData[] = stats?.perCompetition || [];
  const statusDistribution: StatusData[] = stats?.statusDistribution || [];

  if (loading) return null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 shadow-md px-4 py-3 text-xs">
          <p className="font-bold text-slate-900 mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color }} className="font-medium">
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* Bar Chart — Pendaftar Per Lomba */}
      <Card className="rounded-xl border-border lg:col-span-3">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-sm font-black uppercase tracking-tight">
            Pendaftar Per Lomba
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          {perCompetition.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Belum ada data.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={perCompetition} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="count" name="Pendaftar" radius={[4, 4, 0, 0]} barSize={32}>
                  {perCompetition.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Pie Chart — Status Pembayaran */}
      <Card className="rounded-xl border-border lg:col-span-2">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-sm font-black uppercase tracking-tight">
            Status Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          {statusDistribution.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Belum ada data.</p>
          ) : (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 flex flex-wrap justify-center gap-4">
                {statusDistribution.map((s) => (
                  <div key={s.name} className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-10 font-medium uppercase tracking-wider text-muted-foreground">
                      {STATUS_LABELS[s.name] || s.name}: {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
