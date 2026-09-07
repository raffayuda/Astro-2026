"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CalendarCheck, Search, Trophy, Users } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Pattern,
  Pill,
  SectionHeading,
  SectionShell,
  StatCard,
  Surface,
} from "@/components/brand";
import { cn } from "@/lib/utils";
import type { CategoryType, Competition } from "@/types/astro";
import CompetitionCard from "./CompetitionCard";

interface Props {
  competitions: Competition[];
}

export default function AboutSection({ competitions }: Props) {
  const reduce = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    CategoryType | "all"
  >("all");
  const [selectedOrigin, setSelectedOrigin] = useState<
    "all" | "internal" | "external"
  >("all");

  const categoryMap = useMemo(() => {
    const map = new Map<CategoryType, string>();
    competitions.forEach((competition) => {
      if (!map.has(competition.category)) {
        map.set(
          competition.category,
          competition.category.charAt(0).toUpperCase() +
            competition.category.slice(1),
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

  const categoryOrder = useMemo(
    () => Array.from(categoryMap.keys()),
    [categoryMap],
  );

  const openCompetitions = useMemo(
    () =>
      competitions.filter((competition) => competition.isActive !== false).length,
    [competitions],
  );

  const totalSlots = useMemo(
    () => competitions.reduce((sum, competition) => sum + competition.maxSlots, 0),
    [competitions],
  );

  const filtered = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return competitions
      .filter((competition) => {
        const matchCategory =
          selectedCategory === "all" || competition.category === selectedCategory;
        const matchOrigin =
          selectedOrigin === "all" || competition.origin === selectedOrigin;
        const matchQuery =
          !query ||
          competition.title.toLowerCase().includes(query) ||
          competition.tagline.toLowerCase().includes(query);

        return matchCategory && matchOrigin && matchQuery;
      })
      .sort((a, b) => {
        const categoryDiff =
          categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
        if (categoryDiff !== 0) return categoryDiff;
        return a.title.localeCompare(b.title);
      });
  }, [competitions, selectedCategory, selectedOrigin, searchQuery, categoryOrder]);

  return (
    <SectionShell
      id="competitions"
      sky="none"
      width="wide"
      className="relative overflow-hidden bg-linear-to-b from-sky-bottom via-white to-white py-18 md:py-24"
    >
      <Pattern className="absolute inset-0 -z-10 opacity-35" />
      <div className="pointer-events-none absolute left-0 top-10 size-[420px] rounded-full bg-astro-cyan-2/20 blur-[110px]" />

      <div className="grid gap-8 lg:grid-cols-[0.36fr_0.64fr] lg:items-start">
        <aside className="flex flex-col gap-5 lg:sticky lg:top-24">
          <SectionHeading
            eyebrow="Katalog lomba"
            title="Pilih cabang yang pas"
            lead="Cari berdasarkan nama, kategori, atau asal kompetisi. Semua kartu tetap terhubung ke halaman detail dan pendaftaran."
            align="start"
            chrome={false}
          />

          <Surface
            tone="plain"
            radius="2xl"
            pad="lg"
            className="border border-white/80 bg-white/90 backdrop-blur"
          >
            <div className="flex flex-col gap-5">
              <div>
                <p className="mb-2 text-10 font-black uppercase tracking-widest text-muted-foreground">
                  Cari lomba
                </p>
                <InputGroup className="h-11 rounded-full border-astro-cyan-2/70 bg-sky-bottom/70 shadow-soft-sm">
                  <InputGroupAddon align="inline-start">
                    <Search className="size-3.5 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    placeholder="Nama lomba..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="text-xs font-bold placeholder:text-astro-blue/45"
                  />
                </InputGroup>
              </div>

              <FilterGroup
                label="Asal kompetisi"
                value={selectedOrigin}
                items={[
                  { label: "Semua", value: "all" },
                  { label: "Internal", value: "internal" },
                  { label: "Eksternal", value: "external" },
                ]}
                onChange={(value) =>
                  setSelectedOrigin(value as "all" | "internal" | "external")
                }
              />

              <FilterGroup
                label="Kategori"
                value={selectedCategory}
                items={categories}
                activeClassName="data-[state=on]:bg-astro-gold data-[state=on]:text-astro-navy"
                onChange={(value) =>
                  setSelectedCategory(value as CategoryType | "all")
                }
              />
            </div>
          </Surface>

          <div className="grid grid-cols-3 gap-3">
            <StatCard
              icon={Trophy}
              metric={String(competitions.length)}
              label="Lomba"
            />
            <StatCard
              icon={CalendarCheck}
              metric={String(openCompetitions)}
              label="Aktif"
            />
            <StatCard icon={Users} metric={String(totalSlots)} label="Kuota" />
          </div>
        </aside>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Pill tone="blue" size="sm">
                {filtered.length} hasil
              </Pill>
            </motion.div>
            <p className="text-sm font-semibold text-muted-foreground">
              Klik detail untuk aturan lengkap, atau daftar langsung dari kartu.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {filtered.length > 0 ? (
              <motion.div
                key={`${selectedCategory}-${selectedOrigin}-${searchQuery}`}
                className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {filtered.map((competition, index) => (
                  <CompetitionCard
                    key={competition.id}
                    competition={competition}
                    index={index}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Empty className="rounded-xl bg-white py-16 shadow-soft">
                  <EmptyHeader>
                    <EmptyTitle className="text-base font-black uppercase tracking-wider">
                      Tidak ditemukan
                    </EmptyTitle>
                    <EmptyDescription>
                      Coba kata kunci atau filter lain.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SectionShell>
  );
}

function FilterGroup({
  label,
  value,
  items,
  activeClassName = "data-[state=on]:bg-astro-blue data-[state=on]:text-white",
  onChange,
}: {
  label: string;
  value: string;
  items: { label: string; value: string }[];
  activeClassName?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-10 font-black uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(nextValue) => nextValue && onChange(nextValue)}
        className="flex flex-wrap justify-start gap-2"
      >
        {items.map((item) => (
          <ToggleGroupItem
            key={item.value}
            value={item.value}
            className={cn(
              "rounded-full px-4 text-10 font-black uppercase tracking-widest",
              activeClassName,
            )}
          >
            {item.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
