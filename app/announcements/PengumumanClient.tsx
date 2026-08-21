"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { Search, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import WinnersModal from "./WinnersModal";
import { apiHelpers } from "@/src/lib/api";
import { queryKeys } from "@/src/lib/hooks/use-queries";

type CategoryType = "akademik" | "olahraga" | "esports";

interface CompetitionItem {
  id: string;
  title: string;
  category: string;
  tagline: string | null;
  type: string | null;
  hasWinners: boolean;
}

interface CertItem {
  name: string;
  url: string;
}

interface RegistrationWinner {
  id: string;
  type: string;
  fullName: string | null;
  teamName: string | null;
  leaderName: string | null;
  email: string;
  winnerRank: string | null;
  certificates: CertItem[];
}

const categoryConfig: Record<
  string,
  { label: string; color: string; bg: string; border: string; accent: string }
> = {
  akademik: {
    label: "AKADEMIK",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    accent: "bg-emerald-500",
  },
  olahraga: {
    label: "OLAHRAGA",
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    accent: "bg-orange-500",
  },
  esports: {
    label: "ESPORTS",
    color: "text-cyan-700",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    accent: "bg-cyan-500",
  },
};

const CATEGORIES: { label: string; value: CategoryType | "all" }[] = [
  { label: "SEMUA", value: "all" },
  { label: "AKADEMIK", value: "akademik" },
  { label: "OLAHRAGA", value: "olahraga" },
  { label: "ESPORTS", value: "esports" },
];

const SKELETON_COUNT = 6;

const MotionImage = motion.create(Image);

export default function PengumumanClient() {
  const reduce = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    CategoryType | "all"
  >("all");
  const [modalOpen, setModalOpen] = useState<string | null>(null);
  const [modalData, setModalData] = useState<{
    competition: CompetitionItem;
    winners: RegistrationWinner[];
    certHolders: RegistrationWinner[];
    prizes: { label: string; value: string }[];
  } | null>(null);
  const [loadingModal, setLoadingModal] = useState(false);

  // Lazy-loaded: data ditarik dari API di client, halaman langsung tampil.
  const { data: competitions, isLoading } = useQuery({
    queryKey: queryKeys.competitions.withWinners,
    queryFn: () => apiHelpers.competitions.withWinners(),
  });

  const filtered = useMemo(() => {
    const list = competitions ?? [];
    const q = searchQuery.toLowerCase().trim();
    return list
      .filter((c) => {
        const matchCat =
          selectedCategory === "all" || c.category === selectedCategory;
        const matchQ =
          !q ||
          c.title.toLowerCase().includes(q) ||
          c.tagline?.toLowerCase().includes(q);
        return matchCat && matchQ;
      })
      .sort((a, b) => {
        // Winners first, then by category
        if (a.hasWinners !== b.hasWinners) return a.hasWinners ? -1 : 1;
        const order = ["akademik", "olahraga", "esports"];
        return order.indexOf(a.category) - order.indexOf(b.category);
      });
  }, [competitions, selectedCategory, searchQuery]);

  const openModal = async (comp: CompetitionItem) => {
    setModalOpen(comp.id);
    setModalData(null);
    setLoadingModal(true);
    try {
      const json = await apiHelpers.registrations.winners(comp.id);
      setModalData({
        competition: comp,
        winners: json.winners || [],
        certHolders: json.certHolders || [],
        prizes: json.winners?.[0]?.prizes || [],
      });
    } catch {
      toast.error("Gagal memuat data pemenang");
      setModalOpen(null);
    } finally {
      setLoadingModal(false);
    }
  };

  const closeModal = () => {
    setModalOpen(null);
    setModalData(null);
  };

  return (
    <section className="relative min-h-screen pt-24 md:pt-32 pb-20 overflow-hidden bg-gradient-to-b from-sky-400 via-sky-300 to-sky-100 text-slate-900">
      {/* Floating blobs — seperti hero halaman detail lomba */}
      <MotionImage
        src="/assets/blob-round.png" alt="" width={112} height={112}
        animate={reduce ? undefined : { y: [0, -14, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[6%] -left-[2%] w-14 h-14 md:w-28 md:h-28 object-contain pointer-events-none select-none z-0"
      />
      <MotionImage
        src="/assets/blob-round.png" alt="" width={96} height={96}
        animate={reduce ? undefined : { y: [0, -12, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
        className="absolute top-[12%] -right-[2%] w-12 h-12 md:w-24 md:h-24 object-contain pointer-events-none select-none z-0"
      />
      <MotionImage
        src="/assets/blob-round.png" alt="" width={80} height={80}
        animate={reduce ? undefined : { y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        className="absolute bottom-[18%] left-[4%] w-10 h-10 md:w-20 md:h-20 object-contain pointer-events-none select-none z-0"
      />
      <MotionImage
        src="/assets/blob-round.png" alt="" width={128} height={128}
        animate={reduce ? undefined : { y: [0, -16, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
        className="absolute bottom-[8%] right-[3%] w-16 h-16 md:w-32 md:h-32 object-contain pointer-events-none select-none z-0"
      />

      {/* Floating clouds — seperti hero halaman detail lomba */}
      <MotionImage
        src="/assets/awan1.png" alt="" width={160} height={120}
        animate={reduce ? undefined : { x: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[10%] left-[2%] w-16 h-auto md:w-40 md:h-auto object-contain pointer-events-none select-none z-0 opacity-40"
      />
      <MotionImage
        src="/assets/awan2.png" alt="" width={200} height={140}
        animate={reduce ? undefined : { x: [0, -12, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[30%] right-[3%] w-20 h-auto md:w-48 md:h-auto object-contain pointer-events-none select-none z-0 opacity-35"
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="accent-line" />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="font-masterpiece text-5xl md:text-6xl lg:text-7xl text-slate-900 leading-tight mb-3"
          >
            Pengumuman
            <br />
            <span className="bg-gradient-to-r from-sky-900 via-cyan-800 to-slate-800 bg-clip-text text-transparent">
              Pemenang
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm md:text-base text-slate-600 max-w-lg mx-auto leading-relaxed"
          >
            Selamat kepada para pemenang di setiap cabang lomba ASTRO 2026!
          </motion.p>
        </div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col items-stretch justify-center gap-3 mb-10 sm:flex-row sm:items-center"
        >
          <div className="relative w-full sm:max-w-xs">
            <InputGroup className="clip-angled h-10 border-border bg-white">
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
          <div className="flex flex-wrap justify-center gap-1">
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
                  className="clip-angled px-4 py-2 text-[10px] font-bold tracking-[0.15em] uppercase data-[state=on]:bg-astro-cyan data-[state=on]:text-slate-950 data-[state=on]:shadow-sm data-[state=off]:border data-[state=off]:border-border data-[state=off]:bg-white data-[state=off]:text-muted-foreground data-[state=off]:hover:text-foreground"
                >
                  {cat.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex items-center justify-center gap-2 mb-8"
        >
          {isLoading ? (
            <Skeleton className="h-4 w-40" />
          ) : (
            <>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {filtered.length} LOMBA DITEMUKAN
              </span>
              {selectedCategory !== "all" && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                  className="text-[10px] font-bold text-primary underline underline-offset-2 hover:text-primary/80"
                >
                  Reset filter
                </Button>
              )}
            </>
          )}
        </motion.div>

        {/* Grid / Skeleton / Empty */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <div
                key={index}
                className="group bg-white border border-slate-200/80 p-5 md:p-6 flex flex-col gap-3"
                style={{
                  clipPath:
                    "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
                }}
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-3.5 w-12" />
                </div>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="mt-2 h-9 w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {filtered.map((comp, index) => {
              const cat =
                categoryConfig[comp.category] || categoryConfig.akademik;
              const isTeam = comp.type === "team";
              const typeLabel =
                comp.type === "both"
                  ? "TIM & INDIVIDU"
                  : comp.type === "team"
                    ? "TIM"
                    : "INDIVIDU";

              return (
                <motion.div
                  key={comp.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: Math.min(index * 0.05, 0.3),
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="group bg-white border border-slate-200/80 hover:border-astro-cyan/40 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out"
                  style={{
                    clipPath:
                      "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
                  }}
                >
                  {/* Corner accent */}
                  <div className="relative">
                    <div
                      className={`absolute -top-[1px] -left-[1px] w-8 h-8 ${cat.accent}`}
                      style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
                    />
                  </div>

                  <div className="p-5 md:p-6 flex flex-col gap-3">
                    {/* Top row */}
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={`clip-angled-sm border text-[10px] font-bold tracking-[0.15em] uppercase ${cat.bg} ${cat.color} ${cat.border}`}
                      >
                        {cat.label}
                      </Badge>
                      <span className="text-[10px] font-bold tracking-wide text-astro-cyan">
                        {typeLabel}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base md:text-lg font-black text-slate-900 uppercase leading-tight tracking-tight">
                      {comp.title}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed -mt-1">
                      {comp.tagline}
                    </p>

                    {/* Action */}
                    <div className="mt-2">
                      {comp.hasWinners ? (
                        <Button
                          onClick={() => openModal(comp)}
                          className="clip-angled-sm w-full py-2.5 text-[10px] font-black tracking-[0.1em] uppercase bg-astro-cyan text-white hover:bg-astro-cyan/80"
                        >
                          <Eye data-icon="inline-start" />
                          Lihat Juara
                        </Button>
                      ) : (
                        <div className="clip-angled-sm w-full border border-border bg-muted/50 py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                          Belum Ada
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Empty className="py-20">
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

        {/* Modal */}
        {modalOpen && (
          <WinnersModal
            isOpen={!!modalOpen}
            onClose={closeModal}
            competitionTitle={modalData?.competition.title || ""}
            competitionId={modalData?.competition.id || ""}
            category={modalData?.competition.category || ""}
            type={modalData?.competition.type || null}
            winners={modalData?.winners || []}
            certHolders={modalData?.certHolders || []}
            prizes={modalData?.prizes || []}
            loading={loadingModal}
          />
        )}
      </div>
    </section>
  );
}
