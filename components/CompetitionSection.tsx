'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Search } from 'lucide-react';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { Competition, CategoryType } from '@/types/astro';
import CompetitionCard from './CompetitionCard';

interface Props {
  competitions: Competition[];
}

const CATEGORIES: { label: string; value: CategoryType | 'all' }[] = [
  { label: 'SEMUA', value: 'all' },
  { label: 'AKADEMIK', value: 'akademik' },
  { label: 'OLAHRAGA', value: 'olahraga' },
  { label: 'ESPORTS', value: 'esports' },
];

export default function CompetitionSection({ competitions }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const reduce = useReducedMotion();

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const categoryOrder = ['akademik', 'olahraga', 'esports'];
    return competitions
      .filter((c) => {
        const matchCat = selectedCategory === 'all' || c.category === selectedCategory;
        const matchQ = !q || c.title.toLowerCase().includes(q) || c.tagline.toLowerCase().includes(q);
        return matchCat && matchQ;
      })
      .sort((a, b) => {
        const catDiff = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
        if (catDiff !== 0) return catDiff;
        return a.title.localeCompare(b.title);
      });
  }, [competitions, selectedCategory, searchQuery]);

  return (
    <section id="competitions" className="relative overflow-hidden">
      {/* Background — white, connects About's white bottom */}
      <div className="absolute inset-0 bg-linear-to-b from-white to-white -z-10" />
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-astro-cyan/2 blur-[150px] rounded-full -z-10" />

      {/* Diagonal transition */}
      <div className="absolute top-0 left-0 right-0 h-24 -z-10">
        <svg viewBox="0 0 1440 96" preserveAspectRatio="none" className="w-full h-full" aria-hidden="true">
          <polygon points="1440,0 0,96 1440,96" fill="var(--color-deep-slate)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-16 md:pt-20 pb-20 md:pb-28">
        {/* Section Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 md:mb-14"
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <div className="accent-line mb-3" />
            <h2 className="font-masterpiece text-5xl md:text-6xl lg:text-7xl text-slate-900 leading-tight">
              Pilih<br />
              <span className="text-astro-cyan">Lombamu</span>
            </h2>
          </div>
          <p className="text-sm text-slate-600 max-w-xs leading-relaxed">
            Tersedia berbagai cabang lomba seru dari tiga kategori berbeda.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <InputGroup className="clip-angled h-10 border-border bg-background">
              <InputGroupAddon align="inline-start">
                <Search className="size-3.5 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="CARI LOMBA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs font-bold tracking-wider uppercase"
              />
            </InputGroup>
          </div>

          <div className="flex flex-wrap gap-1">
            <ToggleGroup type="single" value={selectedCategory} onValueChange={(v) => v && setSelectedCategory(v as CategoryType | 'all')} spacing={1}>
              {CATEGORIES.map((cat) => (
                <ToggleGroupItem key={cat.value} value={cat.value} className="clip-angled px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em]">
                  {cat.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            <motion.div
              key={`${selectedCategory}-${searchQuery}`}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {filtered.map((c, i) => (
                <CompetitionCard key={c.id} competition={c} index={i} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Empty className="clip-angled-lg border border-border bg-background py-20 shadow-sm">
                <EmptyHeader>
                  <EmptyTitle className="text-lg font-black uppercase tracking-wider">Tidak Ditemukan</EmptyTitle>
                  <EmptyDescription>Coba kata kunci atau filter lain.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
