"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Search } from "lucide-react";
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
import type { Competition, CategoryType } from "@/types/astro";
import CompetitionCard from "./CompetitionCard";

const MotionImage = motion.create(Image);

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

  // Derive categories dynamically from competition data
  const categoryMap = useMemo(() => {
    const map = new Map<CategoryType, string>();
    competitions.forEach((c) => {
      if (!map.has(c.category)) {
        // Capitalize label
        const label = c.category.charAt(0).toUpperCase() + c.category.slice(1);
        map.set(c.category, label);
      }
    });
    return map;
  }, [competitions]);

  const CATEGORIES: { label: string; value: CategoryType | "all" }[] = useMemo(
    () => [
      { label: "SEMUA", value: "all" as const },
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

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return competitions
      .filter((c) => {
        const matchCat =
          selectedCategory === "all" || c.category === selectedCategory;
        const matchOrigin =
          selectedOrigin === "all" || c.origin === selectedOrigin;
        const matchQ =
          !q ||
          c.title.toLowerCase().includes(q) ||
          c.tagline.toLowerCase().includes(q);
        return matchCat && matchOrigin && matchQ;
      })
      .sort((a, b) => {
        const catDiff =
          categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
        if (catDiff !== 0) return catDiff;
        return a.title.localeCompare(b.title);
      });
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [competitions, selectedCategory, selectedOrigin, searchQuery]);

  return (
    <section
      id="competitions"
      className="astro-sky-soft astro-bubble-field relative overflow-hidden py-20 md:py-28"
    >
      {/* Background — seamless transition from Hero's sky fade */}
      <div className="astro-pattern absolute inset-0 -z-10 opacity-35" />
      <div className="pointer-events-none absolute top-0 left-0 size-[500px] rounded-full bg-[#66f4bd]/18 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 bottom-0 size-[500px] rounded-full bg-[#3157ff]/10 blur-[120px]" />

      {/* ─── FLOATING BLOB ROUND IMAGES ─── */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <Image
          src="/assets/blob-round.png"
          alt=""
          width={112}
          height={112}
          className="absolute top-[2%] right-[2%] w-12 h-12 md:w-40 md:h-40 md:top-[8%] md:right-[12%] object-contain pointer-events-none select-none z-10"
        />
      </motion.div>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.1 }}
      >
        <Image
          src="/assets/blob-round.png"
          alt=""
          width={96}
          height={96}
          className="absolute top-[30%] left-[1%] w-12 h-12 md:w-36 md:h-36 md:top-[35%] md:left-[2%] object-contain pointer-events-none select-none z-10"
        />
      </motion.div>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Image
          src="/assets/blob-round.png"
          alt=""
          width={64}
          height={64}
          className="absolute top-[60%] right-[1%] w-10 h-10 md:w-24 md:h-24 md:top-[55%] md:right-[3%] object-contain pointer-events-none select-none z-10"
        />
      </motion.div>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <Image
          src="/assets/blob-round.png"
          alt=""
          width={80}
          height={80}
          className="absolute bottom-[2%] left-[2%] w-10 h-10 md:w-32 md:h-32 md:bottom-[10%] md:left-[10%] object-contain pointer-events-none select-none z-10"
        />
      </motion.div>

      {/* ─── EARTH DECORATIVE ─── */}
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.6 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-[5%] right-[5%] md:top-[12%] md:right-[4%] z-10 pointer-events-none select-none"
      >
        <MotionImage
          src="/assets/earth.png"
          alt=""
          width={280}
          height={280}
          sizes="(min-width: 768px) 280px, 96px"
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="w-15 h-15 md:w-[280px] md:h-[280px] object-contain"
        />
      </motion.div>

      {/* ─── AWAN DECORATIVE ─── */}
      <motion.div
        initial={reduce ? false : { opacity: 0, x: -60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-[32%] left-[1%] md:top-[12%] md:left-[3%] z-10 pointer-events-none select-none"
      >
        <MotionImage
          src="/assets/awan1.png"
          alt=""
          width={160}
          height={160}
          animate={{ x: [0, 15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="w-10 h-10 md:w-[160px] md:h-[160px] object-contain"
        />
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0, x: 60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-[8%] right-[1%] md:bottom-[15%] md:right-[3%] z-10 pointer-events-none select-none"
      >
        <MotionImage
          src="/assets/awan2.png"
          alt=""
          width={200}
          height={200}
          animate={{ x: [0, -12, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="w-10 h-10 md:w-[200px] md:h-[200px] object-contain"
        />
      </motion.div>

      <div className="relative z-30 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Pilih Lombamu */}
        <div>
          {/* Title — rata kiri */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="accent-line mb-3" />
              <h2 className="font-masterpiece text-4xl leading-tight text-[#18345f] md:text-5xl lg:text-6xl">
                Pilih
                <br />
                <span className="astro-title-chrome">Lombamu</span>
              </h2>
              <p className="mt-2 text-sm font-semibold text-[#3157ff]/80">
                Tersedia berbagai cabang lomba seru dari tiga kategori berbeda.
              </p>
            </motion.div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-3">
            {/* Row 1: Search + Origin */}
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:max-w-xs">
                <InputGroup className="astro-pill h-11 border-white/80 bg-white/80">
                  <InputGroupAddon align="inline-start">
                    <Search className="size-3.5 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    placeholder="CARI LOMBA..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-xs font-bold tracking-wider uppercase placeholder:text-[#3157ff]/50"
                  />
                </InputGroup>
              </div>
              {/* Origin filter — parallelogram buttons, no label */}
              <div className="self-start sm:self-auto">
                <ToggleGroup
                  type="single"
                  value={selectedOrigin}
                  onValueChange={(v) =>
                    v &&
                    setSelectedOrigin(
                      v as "all" | "internal" | "external",
                    )
                  }
                  spacing={1}
                >
                  {[
                    { label: "Semua", value: "all" as const },
                    { label: "Internal", value: "internal" as const },
                    { label: "Eksternal", value: "external" as const },
                  ].map((opt) => (
                    <ToggleGroupItem
                      key={opt.value}
                      value={opt.value}
                      className="rounded-[14px] border border-[#83cfff]/80 bg-white/80 px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-[#3157ff] shadow-sm data-[state=on]:border-white data-[state=on]:bg-gradient-to-b data-[state=on]:from-[#28aaff] data-[state=on]:to-[#3157ff] data-[state=on]:text-white data-[state=on]:shadow-[0_8px_18px_rgba(49,87,255,0.22)]"
                    >
                      {opt.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </div>

            {/* Row 2: Category buttons */}
            <div className="flex flex-wrap items-center gap-1">
              <span className="mr-1 text-[10px] font-black uppercase tracking-wider text-[#3157ff]">
                Kategori
              </span>
              <ToggleGroup
                type="single"
                value={selectedCategory}
                onValueChange={(v) =>
                  v && setSelectedCategory(v as CategoryType | "all")
                }
                spacing={1}
              >
                {CATEGORIES.map((cat) => (
                  <ToggleGroupItem
                    key={cat.value}
                    value={cat.value}
                    className="rounded-[14px] border border-[#83cfff]/80 bg-white/80 px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-[#3157ff] shadow-sm data-[state=on]:border-white data-[state=on]:bg-gradient-to-b data-[state=on]:from-[#28aaff] data-[state=on]:to-[#3157ff] data-[state=on]:text-white data-[state=on]:shadow-[0_8px_18px_rgba(49,87,255,0.22)]"
                  >
                    {cat.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </div>

          {/* Competition Grid */}
          <AnimatePresence mode="wait">
            {filtered.length > 0 ? (
              <motion.div
                key={`${selectedCategory}-${searchQuery}`}
                className="grid gap-5 sm:grid-cols-2 md:grid-cols-3"
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
                <Empty className="astro-card py-16">
                  <EmptyHeader>
                    <EmptyTitle className="text-base font-black uppercase tracking-wider">
                      Tidak Ditemukan
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
    </section>
  );
}
