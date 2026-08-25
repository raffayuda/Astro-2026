'use client';

import { motion, useReducedMotion } from 'motion/react';
import { Users, Coins, CalendarDays, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { Competition, CategoryType } from '@/types/astro';
import { formatDateShort } from '@/lib/date';

const categoryConfig: Record<CategoryType, { accent: string; label: string; badgeClass: string }> = {
  akademik: { accent: 'bg-emerald-500', label: 'AKADEMIK', badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  olahraga: { accent: 'bg-orange-500', label: 'OLAHRAGA', badgeClass: 'border-orange-200 bg-orange-50 text-orange-700' },
  esports: { accent: 'bg-cyan-500', label: 'ESPORTS', badgeClass: 'border-cyan-200 bg-cyan-50 text-cyan-700' },
};

function toIdr(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

interface Props {
  competition: Competition;
  index: number;
}

export default function CompetitionCard({ competition, index }: Props) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const cat = categoryConfig[competition.category] || categoryConfig.akademik;
  const ratio = Math.min((competition.filledSlots / competition.maxSlots) * 100, 100);
  const left = competition.maxSlots - competition.filledSlots;

  const isOpen = competition.isActive !== false;
  const isFull = left <= 0;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] as const }}
      whileHover={reduce ? {} : { y: -4 }}
    >
      <Card
        className={cn(
          "group clip-angled overflow-hidden border-slate-200/80 shadow-sm transition-all duration-200 ease-in-out hover:border-primary/40 hover:shadow-md",
          !isOpen && "bg-slate-50/50 opacity-90"
        )}
      >
        {/* Top angular corner accent per category */}
        <div className="relative">
          <div className={cn('absolute -top-px -left-px size-8', isOpen ? cat.accent : 'bg-slate-400')} style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
        </div>

        <CardContent className="flex flex-col gap-3 p-5 md:p-6">
          {/* Top row: badge + slots */}
          <div className="flex items-start justify-between gap-1">
            <div className="flex flex-wrap items-center gap-1">
              <Badge variant="outline" className={cn('clip-angled-sm border text-[10px] font-bold uppercase tracking-[0.15em]', cat.badgeClass)}>
                {cat.label}
              </Badge>
              <Badge variant="outline" className="clip-angled-sm border-sky-200 bg-sky-50 text-[9px] font-bold uppercase tracking-[0.1em] text-sky-700">
                {competition.origin === 'external' ? 'Eksternal' : 'Internal'}
              </Badge>
              {!isOpen && (
                <Badge variant="outline" className="clip-angled-sm border-red-200 bg-red-50 text-[9px] font-bold uppercase tracking-[0.1em] text-red-600">
                  Ditutup
                </Badge>
              )}
            </div>
            <span className={cn('flex-shrink-0 text-[10px] font-bold tracking-wide', !isOpen ? 'text-red-600' : left <= 5 ? 'text-destructive' : 'text-muted-foreground')}>
              {!isOpen ? 'DITUTUP' : left > 0 ? `SISA ${left} SLOT` : 'PENUH'}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-black uppercase leading-tight tracking-tight text-foreground md:text-lg">
            {competition.title}
          </h3>
          <p className="-mt-1 text-xs leading-relaxed text-muted-foreground md:text-sm">
            {competition.tagline || 'Informasi lomba segera diumumkan (TBA)'}
          </p>

          {/* Metadata grid */}
          <div className="mt-1 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Coins className="size-3 text-primary flex-shrink-0" />
              <span className="truncate">{competition.isFree ? 'Gratis' : competition.fee > 0 ? toIdr(competition.fee) : 'TBA'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3 text-primary flex-shrink-0" />
              <span className="truncate">{competition.location || 'TBA'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-3 text-primary flex-shrink-0" />
              <span className="truncate">{formatDateShort(competition.scheduleDate) || 'TBA'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="size-3 text-primary flex-shrink-0" />
              <span className="truncate">
                {competition.maxSlots > 0 ? `${competition.filledSlots}/${competition.maxSlots}` : 'Kuota TBA'}
              </span>
            </span>
          </div>

          {/* Progress bar */}
          <Progress
            value={competition.maxSlots > 0 ? ratio : 0}
            aria-label={`Kuota ${competition.title}`}
            className="h-1.5 bg-muted [&>div]:rounded-full"
          />

          {/* Actions */}
          <div className="mt-1 flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="clip-angled-sm flex-1 text-[10px] font-bold uppercase tracking-[0.1em]">
              <Link href={`/competitions/${competition.id}`} aria-label={`Detail ${competition.title}`}>Detail</Link>
            </Button>
            {!isOpen ? (
              <Button
                disabled
                size="sm"
                aria-label={`Pendaftaran ${competition.title} Ditutup`}
                className="clip-angled-sm flex-1 text-[10px] font-bold uppercase tracking-[0.1em] opacity-60 cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted"
              >
                Ditutup
              </Button>
            ) : isFull ? (
              <Button
                disabled
                size="sm"
                aria-label={`Kuota ${competition.title} Penuh`}
                className="clip-angled-sm flex-1 text-[10px] font-bold uppercase tracking-[0.1em] opacity-60 cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted"
              >
                Penuh
              </Button>
            ) : (
              <Button
                onClick={() => router.push(`/register/${competition.id}`)}
                size="sm"
                aria-label={`Daftar ${competition.title}`}
                className="clip-angled-sm flex-1 text-[10px] font-black uppercase tracking-[0.1em]"
              >
                Daftar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
