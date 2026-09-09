"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import WinnersModal from "./WinnersModal";
import { apiHelpers } from "@/src/lib/api";
import { queryKeys } from "@/src/lib/hooks/use-queries";
import {
  Pill,
  SectionHeading,
  SectionShell,
  Surface,
  WindowCard,
  type PillProps,
} from "@/components/brand";

type CategoryType = "akademik" | "olahraga" | "esports" | "kesenian-/-seni";

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
  winnerRank: string | null;
  certificates: CertItem[];
}

const CATEGORY_PILL: Record<string, { label: string; tone: NonNullable<PillProps["tone"]> }> = {
  akademik: { label: "Akademik", tone: "blue" },
  olahraga: { label: "Olahraga", tone: "orange" },
  esports: { label: "Esports", tone: "navy" },
  "kesenian-/-seni": { label: "Kesenian", tone: "pink" },
};

const CATEGORIES: { label: string; value: CategoryType | "all" }[] = [
  { label: "Semua", value: "all" },
  { label: "Akademik", value: "akademik" },
  { label: "Olahraga", value: "olahraga" },
  { label: "Esports", value: "esports" },
  { label: "Kesenian", value: "kesenian-/-seni" },
];

const SKELETON_COUNT = 6;

export default function PengumumanClient() {
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
    <SectionShell band="none" space="md" className="pt-24 md:pt-28">
      <SectionHeading
        eyebrow="Hasil"
        pillTone="gold"
        title="Pengumuman pemenang"
        lead="Selamat kepada para pemenang di setiap cabang lomba ASTRO 2026."
        align="start"
      />

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink/45" />
          <Input
            placeholder="Cari lomba"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 rounded-full border-sky-mid bg-white pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setSelectedCategory(cat.value)}
            >
              <Pill tone={selectedCategory === cat.value ? "blue" : "glass"} size="sm">
                {cat.label}
              </Pill>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm font-medium text-ink/65">
        {isLoading ? "Memuat…" : `${filtered.length} lomba`}
      </p>

      {isLoading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <Skeleton key={index} className="h-44 rounded-3xl" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {filtered.map((comp) => {
            const cat = CATEGORY_PILL[comp.category] ?? CATEGORY_PILL.akademik;
            const typeLabel =
              comp.type === "both"
                ? "Tim & individu"
                : comp.type === "team"
                  ? "Tim"
                  : "Individu";

            return (
              <WindowCard key={comp.id} title={comp.title} close={false} pad="compact">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Pill tone={cat.tone} size="sm" className="shadow-gloss">
                    {cat.label}
                  </Pill>
                  <Pill tone="glass" size="sm">
                    {typeLabel}
                  </Pill>
                </div>
                {comp.tagline && (
                  <p className="text-sm leading-relaxed text-ink/75">{comp.tagline}</p>
                )}
                {comp.hasWinners ? (
                  <Button
                    onClick={() => openModal(comp)}
                    className="mt-auto w-full rounded-full"
                  >
                    <Eye data-icon="inline-start" />
                    Lihat juara
                  </Button>
                ) : (
                  <p className="mt-auto text-sm font-medium text-ink/50">Belum diumumkan</p>
                )}
              </WindowCard>
            );
          })}
        </div>
      ) : (
        <Surface tone="plain" radius="2xl" pad="lg" className="mt-6 text-center">
          <p className="font-heading font-bold text-astro-navy">Tidak ditemukan</p>
          <p className="mt-1 text-sm text-ink/70">Coba kata kunci atau filter lain.</p>
        </Surface>
      )}

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
    </SectionShell>
  );
}
