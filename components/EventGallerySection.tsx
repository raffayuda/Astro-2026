"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { Camera, ChevronLeft, ChevronRight, Heart, X, ZoomIn } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import SkeletonImage from "@/components/SkeletonImage";
import { cn } from "@/lib/utils";
import { normalizeImageUrl } from "@/components/ImportCommittee";
import { useGalleryPhotos, useGalleryCategories } from "@/src/lib/hooks/use-queries";
import { SectionHeading } from "@/components/brand/SectionHeading";
import { SectionShell } from "@/components/brand/SectionShell";

interface GalleryPhoto {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  year: string;
  likesCount: number;
}

interface GalleryCategory {
  id: number;
  name: string;
  slug: string;
}

export default function EventGallerySection() {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [loadedPhotoId, setLoadedPhotoId] = useState<string | null>(null);
  const [likedPhotos, setLikedPhotos] = useState<Record<string, boolean>>({});
  const [isMarqueeHovered, setIsMarqueeHovered] = useState(false);

  const { data: gData } = useGalleryPhotos({ page: 1, pageSize: 1000 });
  const { data: categories = [] } = useGalleryCategories() as {
    data: GalleryCategory[];
  };
  const photos: GalleryPhoto[] = Array.isArray(gData) ? gData : ((gData as any)?.data ?? []);

  const filteredPhotos =
    activeCategory === "ALL" ? photos : photos.filter((p) => p.category === activeCategory);

  // Lebih cepat saat filter kategori tertentu (non-ALL), biar tidak terasa lambat/berat.
  const marqueeDuration = activeCategory === "ALL" ? 90 : 32;

  // Duplicated arrays for seamless continuous infinite marquee sliding
  const marqueeRow1 = [...filteredPhotos, ...filteredPhotos, ...filteredPhotos];
  const marqueeRow2 = [
    ...filteredPhotos.slice().reverse(),
    ...filteredPhotos.slice().reverse(),
    ...filteredPhotos.slice().reverse(),
  ];

  const handlePrevPhoto = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prev) =>
      prev === 0 ? filteredPhotos.length - 1 : (prev as number) - 1,
    );
  };

  const handleNextPhoto = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prev) =>
      prev === filteredPhotos.length - 1 ? 0 : (prev as number) + 1,
    );
  };

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedPhotos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const photo = selectedPhotoIndex !== null ? filteredPhotos[selectedPhotoIndex] : null;
  const isPhotoReady = photo ? loadedPhotoId === photo.id : false;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when lightbox is active
  useEffect(() => {
    if (selectedPhotoIndex === null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [selectedPhotoIndex !== null]);

  // Keyboard navigation inside lightbox
  useEffect(() => {
    if (selectedPhotoIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedPhotoIndex(null);
      if (e.key === "ArrowLeft") handlePrevPhoto();
      if (e.key === "ArrowRight") handleNextPhoto();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPhotoIndex, filteredPhotos.length]);

  return (
    <SectionShell id="gallery" band="none" space="sm">
      <SectionHeading
        eyebrow="Galeri"
        pillTone="pink"
        title="Galeri acara"
        lead="Dokumentasi lomba, seminar, dan perayaan ASTRO dari masa ke masa."
      />

      <div className="mt-10">
        {/* ── Category Filter Pills ── */}
        <div className="max-w-full overflow-x-auto px-2 pb-2 pt-1 no-scrollbar">
          <ToggleGroup
            type="single"
            value={activeCategory}
            onValueChange={(v) => v && setActiveCategory(v)}
            spacing={2}
          >
            {[{ name: "All", slug: "ALL" } as any, ...categories].map((cat: any) => (
              <ToggleGroupItem
                key={cat.slug}
                value={cat.slug}
                className="rounded-full gap-2 border border-white/80 bg-white/70 px-4 py-2 text-xs font-bold text-astro-navy backdrop-blur-xl data-[state=on]:border-white data-[state=on]:bg-astro-navy data-[state=on]:text-white data-[state=on]:shadow-md"
              >
                <Camera className="size-3.5" />
                {cat.name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      {/* ═══ MARQUEE ROWS ═══ */}
      <div
        className="relative w-full overflow-hidden py-4"
        onMouseEnter={() => setIsMarqueeHovered(true)}
        onMouseLeave={() => setIsMarqueeHovered(false)}
      >
        {/* Narrow edge fade masks */}
        <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-30 w-12 bg-linear-to-r from-sky-mid via-sky-mid/60 to-transparent sm:w-16 md:w-24" />
        <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-30 w-12 bg-linear-to-l from-sky-mid via-sky-mid/60 to-transparent sm:w-16 md:w-24" />

        <div className="space-y-6">
          {[marqueeRow1, marqueeRow2].map((row, rowIdx) => (
            <div key={rowIdx} className="relative flex w-full overflow-hidden">
              <motion.div
                animate={
                  isMarqueeHovered ? false : { x: rowIdx === 0 ? ["0%", "-50%"] : ["-50%", "0%"] }
                }
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: rowIdx === 0 ? marqueeDuration : marqueeDuration + 10,
                    ease: "linear",
                  },
                }}
                className="flex shrink-0 items-center gap-6"
              >
                {row.map((photoItem, idx) => (
                  <div
                    key={`r${rowIdx}-${photoItem.id}-${idx}`}
                    onClick={() => setSelectedPhotoIndex(idx % filteredPhotos.length)}
                    className="group relative aspect-[4/3] w-[280px] shrink-0 cursor-pointer overflow-hidden rounded-2xl border-2 border-white/80 bg-white/60 p-3 shadow-md backdrop-blur-2xl transition-all duration-500 hover:border-white hover:shadow-2xl sm:w-[330px] md:w-[380px]"
                  >
                    {/* Glass Refraction Highlight */}
                    <div className="pointer-events-none absolute inset-0 z-10 bg-linear-to-tr from-white/10 via-white/35 to-transparent" />

                    <div
                      className="relative h-full w-full overflow-hidden border border-white/60 bg-astro-navy transition-colors group-hover:border-astro-cyan"
                      style={{ borderRadius: "18px" }}
                    >
                      {/* Shimmer skeleton while thumbnail loads */}
                      <SkeletonImage
                        src={normalizeImageUrl(photoItem.imageUrl)}
                        alt={photoItem.title}
                        imgKey={photoItem.id}
                        className="absolute inset-0 h-full w-full"
                        sizes="380px"
                        imgClassName="transition-all duration-700 ease-out group-hover:scale-115 group-hover:rotate-1 group-hover:brightness-105"
                      />

                      {/* Dark Gradient Legibility Overlay */}
                      <div className="absolute inset-0 bg-linear-to-t from-astro-navy/85 via-astro-navy/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-90" />

                      {/* Year Badge */}
                      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                        <Badge className="rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-bold text-astro-navy shadow-soft-sm">
                          {photoItem.year}
                        </Badge>
                      </div>

                      {/* Photo Title Overlay */}
                      <div className="absolute right-3 bottom-3 left-3 z-20 text-white">
                        <h4 className="text-sm font-black leading-tight text-white transition-colors group-hover:text-astro-cyan md:text-base">
                          {photoItem.title}
                        </h4>
                        <p className="mt-0.5 text-11 font-semibold text-astro-cyan-2 opacity-80">
                          {photoItem.category}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ FULLSCREEN LIGHTBOX ═══ */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {photo && (
              <motion.div
                key="lightbox"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.2 }}
                className="fixed inset-0 z-[100] flex flex-col bg-astro-navy/95 backdrop-blur-xl text-white"
                role="dialog"
                aria-modal="true"
                aria-label={photo.title}
              >
                {/* Ambient Cyan Glow */}
                <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 size-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-astro-sky/10 blur-[140px]" />

                {/* Header */}
                <div className="relative z-10 flex items-center justify-between px-5 py-4 md:px-8 md:py-5">
                  <div className="flex items-center gap-3">
                    {isPhotoReady ? (
                      <>
                        <Badge className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-astro-navy">
                          {photo.year}
                        </Badge>
                        <span className="text-xs font-medium text-white/80">{photo.category}</span>
                      </>
                    ) : (
                      <>
                        <div className="h-5 w-14 rounded bg-astro-cyan-2/40 animate-pulse rounded-md" />
                        <div className="h-4 w-24 rounded bg-astro-cyan-2/40 animate-pulse" />
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => toggleLike(photo.id, e)}
                      className={cn(
                        "border border-white/20 bg-white/10 text-white hover:bg-white/20 shadow-sm",
                        likedPhotos[photo.id] &&
                          "scale-110 border-rose-500 bg-rose-500 text-white shadow-md hover:bg-rose-500",
                      )}
                      aria-label="Suka foto ini"
                    >
                      <Heart className={cn(likedPhotos[photo.id] && "fill-current")} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Tutup"
                      onClick={() => setSelectedPhotoIndex(null)}
                      className="border border-white/20 bg-white/10 text-white hover:bg-white/20 shadow-sm rounded-full"
                    >
                      <X />
                    </Button>
                  </div>
                </div>

                {/* Main fullscreen image stage (landscape) */}
                <div className="relative z-10 flex-1 min-h-0 px-4 pb-2 md:px-12">
                  <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-astro-navy shadow-2xl">
                    {/* Animated pulse skeleton while loading */}
                    <SkeletonImage
                      key={photo.id}
                      src={normalizeImageUrl(photo.imageUrl)}
                      alt={photo.title}
                      imgKey={photo.id}
                      className="h-full w-full"
                      objectFit="contain"
                      priority
                      sizes="(max-width: 1280px) 100vw, 1280px"
                      onReady={() => setLoadedPhotoId(photo.id)}
                    />

                    {/* White Circular Navigation Arrows */}
                    <Button
                      variant="ghost"
                      size="icon-lg"
                      onClick={handlePrevPhoto}
                      className="absolute top-1/2 left-3 z-30 -translate-y-1/2 size-10 rounded-full bg-white text-astro-navy shadow-lg hover:bg-astro-cyan hover:scale-105 transition-all md:left-6"
                      aria-label="Foto sebelumnya"
                    >
                      <ChevronLeft className="size-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-lg"
                      onClick={handleNextPhoto}
                      className="absolute top-1/2 right-3 z-30 -translate-y-1/2 size-10 rounded-full bg-white text-astro-navy shadow-lg hover:bg-astro-cyan hover:scale-105 transition-all md:right-6"
                      aria-label="Foto berikutnya"
                    >
                      <ChevronRight className="size-6" />
                    </Button>
                  </div>
                </div>

                {/* Footer info */}
                <div className="relative z-10 flex items-center justify-between px-5 py-4 md:px-8 md:py-5">
                  <div>
                    {isPhotoReady ? (
                      <>
                        <h3 className="text-base font-black text-white md:text-lg">{photo.title}</h3>
                        <p className="mt-0.5 text-xs font-semibold text-astro-cyan-2">
                          Foto {selectedPhotoIndex! + 1} dari {filteredPhotos.length} dokumentasi resmi
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="h-6 w-48 sm:w-72 rounded bg-astro-cyan-2/40 animate-pulse mb-1.5" />
                        <div className="h-4 w-36 sm:w-48 rounded bg-astro-cyan-2/40 animate-pulse" />
                      </>
                    )}
                  </div>

                  {isPhotoReady ? (
                    <div className="hidden items-center gap-1.5 border border-sky-top/30 bg-astro-blue/10 px-3 py-1.5 text-xs font-bold text-astro-cyan-2 rounded-lg shadow-sm sm:flex">
                      <ZoomIn className="size-3.5 text-astro-cyan-2" /> HD Documentation
                    </div>
                  ) : (
                    <div className="hidden sm:block h-7 w-32 rounded bg-astro-cyan-2/40 animate-pulse" />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </SectionShell>
  );
}
