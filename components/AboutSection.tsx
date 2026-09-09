"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { SectionHeading, SectionShell, Surface } from "@/components/brand";
import { cn } from "@/lib/utils";
import type { CategoryType, Competition } from "@/types/astro";
import CompetitionCard from "./CompetitionCard";

interface Props {
  competitions: Competition[];
}

/**
 * Competition catalog — heading, one filter bar, one grid.
 *
 * Filters used to live in a sticky sidebar next to a two-column grid, which
 * cost a third of the width and left the cards cramped. They are a toolbar now,
 * so the grid gets the full container and runs three-up.
 */
export default function AboutSection({ competitions }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | "all">("all");
  const [selectedOrigin, setSelectedOrigin] = useState<"all" | "internal" | "external">("all");

  const categoryMap = useMemo(() => {
    const map = new Map<CategoryType, string>();
    competitions.forEach((competition) => {
      if (!map.has(competition.category)) {
        map.set(
          competition.category,
          competition.category.charAt(0).toUpperCase() + competition.category.slice(1),
        );
      }
    });
    return map;
  }, [competitions]);

  const categories: { label: string; value: CategoryType | "all" }[] = useMemo(
    () => [
      { label: "Semua", value: "all" as const },
      ...Array.from(categoryMap.entries()).map(([value, label]) => ({
        label,
        value,
      })),
    ],
    [categoryMap],
  );

  const categoryOrder = useMemo(() => Array.from(categoryMap.keys()), [categoryMap]);

  const filtered = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return competitions
      .filter((competition) => {
        const matchCategory =
          selectedCategory === "all" || competition.category === selectedCategory;
        const matchOrigin = selectedOrigin === "all" || competition.origin === selectedOrigin;
        const matchQuery =
          !query ||
          competition.title.toLowerCase().includes(query) ||
          competition.tagline.toLowerCase().includes(query);

        return matchCategory && matchOrigin && matchQuery;
      })
      .sort((a, b) => {
        const categoryDiff = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
        if (categoryDiff !== 0) return categoryDiff;
        return a.title.localeCompare(b.title);
      });
  }, [competitions, selectedCategory, selectedOrigin, searchQuery, categoryOrder]);

  return (
    <SectionShell id="competitions" band="none" space="md" pattern>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
        <SectionHeading
          eyebrow="Katalog"
          pillTone="orange"
          title="Pilih cabang yang pas"
          lead="Cari berdasarkan nama, kategori, atau asal kompetisi."
          align="start"
          className="min-w-0 flex-1"
        />

        <label className="relative block w-full sm:w-72 sm:shrink-0">
          <span className="sr-only">Cari nama lomba</span>
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink/40"
          />
          <input
            type="text"
            autoComplete="off"
            placeholder="Cari nama lomba..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-12 w-full rounded-full bg-white/90 pr-4 pl-10 text-base font-medium text-ink shadow-soft ring-1 ring-white/80 outline-none placeholder:font-medium placeholder:text-ink/40 focus-visible:ring-2 focus-visible:ring-astro-blue/35 sm:h-11 sm:text-sm"
          />
        </label>
      </div>

      <Surface
        tone="plain"
        radius="2xl"
        pad="sm"
        className="mt-6 flex flex-col items-stretch gap-4 ring-1 ring-white/80 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-3"
      >
        <FilterGroup
          label="Kategori"
          value={selectedCategory}
          items={categories}
          onChange={(value) => setSelectedCategory(value as CategoryType | "all")}
        />
        <FilterGroup
          label="Asal"
          value={selectedOrigin}
          items={[
            { label: "Semua", value: "all" },
            { label: "Internal", value: "internal" },
            { label: "Eksternal", value: "external" },
          ]}
          onChange={(value) => setSelectedOrigin(value as "all" | "internal" | "external")}
        />
        <p className="text-xs font-bold text-ink/60 sm:ml-auto">
          {filtered.length} lomba
        </p>
      </Surface>

      <AnimatePresence mode="wait">
        {filtered.length > 0 ? (
          <motion.div
            key={`${selectedCategory}-${selectedOrigin}-${searchQuery}`}
            className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {filtered.map((competition, index) => (
              <CompetitionCard key={competition.id} competition={competition} index={index} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Surface tone="plain" radius="2xl" pad="xl">
              <Empty>
                <EmptyHeader>
                  <EmptyTitle className="font-heading text-base font-black">
                    Tidak ditemukan
                  </EmptyTitle>
                  <EmptyDescription>Coba kata kunci atau filter lain.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            </Surface>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionShell>
  );
}

function FilterGroup({
  label,
  value,
  items,
  onChange,
}: {
  label: string;
  value: string;
  items: { label: string; value: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
      <p className="text-xs font-bold text-ink/60">
        {label}
      </p>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(nextValue) => nextValue && onChange(nextValue)}
        className="flex flex-wrap justify-start gap-1.5"
      >
        {items.map((item) => (
          <ToggleGroupItem
            key={item.value}
            value={item.value}
            className={cn(
              "min-h-9 rounded-full px-3.5 text-xs font-bold",
              "data-[state=on]:bg-astro-navy data-[state=on]:text-white",
            )}
          >
            {item.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
