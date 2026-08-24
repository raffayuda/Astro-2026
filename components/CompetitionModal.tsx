'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  BookOpen,
  Info,
  CalendarDays,
  MapPin,
  Coins,
  Users,
  FileText,
  MessageCircle,
} from 'lucide-react';
import { ResponsiveModal } from '@/components/responsive-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { formatDateLong } from '@/lib/date';
import type { Competition } from '@/types/astro';

type Tab = 'overview' | 'prizes' | 'rules';

interface Props {
  competition: Competition | null;
  onClose: () => void;
}

const categoryStyles: Record<string, string> = {
  akademik: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  olahraga: 'border-orange-200 bg-orange-50 text-orange-700',
  esports: 'border-cyan-200 bg-cyan-50 text-cyan-700',
};

const prizeColors = [
  'border-amber-200 bg-amber-50 text-amber-700',
  'border-slate-200 bg-slate-100 text-slate-700',
  'border-amber-200 bg-amber-50/80 text-amber-850',
  'border-cyan-200 bg-cyan-50 text-cyan-700',
  'border-violet-200 bg-violet-50 text-violet-700',
];

export default function CompetitionModal({ competition, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const router = useRouter();

  if (!competition) return null;

  const categoryLabel =
    competition.category === 'akademik'
      ? 'Akademik'
      : competition.category === 'olahraga'
        ? 'Olahraga'
        : 'Esports';

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <Info /> },
    { key: 'prizes', label: 'Hadiah', icon: <Trophy /> },
    { key: 'rules', label: 'Rulebook', icon: <BookOpen /> },
  ];

  return (
    <ResponsiveModal
      open={!!competition}
      onOpenChange={(next) => !next && onClose()}
      title={competition.title}
      titleClassName="sr-only"
      contentClassName="max-w-2xl gap-0 p-0"
    >
      <div className="border-b border-border p-6 pb-4 md:p-8">
        <Badge variant="outline" className={cn('mb-2 w-fit text-xs font-semibold', categoryStyles[competition.category])}>
          {categoryLabel}
        </Badge>
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">
          {competition.title}
        </h2>
        <p className="mt-1 italic text-muted-foreground">{competition.tagline}</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)} className="flex flex-col">
        <div className="border-b border-border px-6 md:px-8">
          <TabsList className="w-full justify-start gap-0 bg-transparent">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key} className="gap-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary">
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-5 p-6 md:p-8">
          <p className="leading-relaxed text-foreground">{competition.description}</p>
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-border/60 bg-muted/50">
              <CardContent className="p-4">
                <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Coins className="size-3.5 text-primary" /> Biaya Pendaftaran
                </div>
                <div className="font-semibold text-foreground">Rp {competition.fee.toLocaleString('id-ID')}</div>
              </CardContent>
            </Card>
            <Card className="border-border/60 bg-muted/50">
              <CardContent className="p-4">
                <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays className="size-3.5 text-primary" /> Jadwal
                </div>
                <div className="font-semibold text-foreground">
                  {formatDateLong(competition.scheduleDate) || 'Segera diumumkan'}
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60 bg-muted/50">
              <CardContent className="p-4">
                <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 text-primary" /> Lokasi
                </div>
                <div className="font-semibold text-foreground">{competition.location}</div>
              </CardContent>
            </Card>
            <Card className="border-border/60 bg-muted/50">
              <CardContent className="p-4">
                <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="size-3.5 text-primary" /> Kuota
                </div>
                <div className="font-semibold text-foreground">{competition.filledSlots}/{competition.maxSlots} Terisi</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prizes" className="space-y-4 p-6 md:p-8">
          {competition.prizes.map((p, i) => (
            <div key={p.label} className="flex items-center gap-4 rounded-xl border border-border bg-muted/50 p-4">
              <span className={cn('rounded-lg border p-2', prizeColors[i] || prizeColors[1])}>
                <Trophy className="size-5" />
              </span>
              <div>
                <div className="text-sm font-semibold text-muted-foreground">{p.label}</div>
                <div className="font-bold text-foreground">{p.value}</div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="rules" className="space-y-4 p-6 md:p-8">
          <ul className="space-y-2.5">
            {competition.rulesSummary.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-3 text-foreground">
                <span className="mt-0.5 flex size-5 flex-shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-xs font-bold text-primary">
                  {idx + 1}
                </span>
                {rule}
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <Button asChild variant="outline" className="gap-2">
              <a href={competition.rulebookUrl} target="_blank" rel="noopener noreferrer">
                <FileText data-icon="inline-start" /> Baca Rulebook Lengkap
              </a>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <a href={`https://wa.me/${competition.contactPerson.whatsapp}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle data-icon="inline-start" /> Hubungi {competition.contactPerson.name}
              </a>
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="px-6 pb-6 md:px-8 md:pb-8">
        <Button
          onClick={() => {
            onClose();
            router.push(`/register/${competition.id}`);
          }}
          size="lg"
          className="clip-angled w-full text-base shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]"
        >
          Daftar {competition.title}
        </Button>
      </div>
    </ResponsiveModal>
  );
}
