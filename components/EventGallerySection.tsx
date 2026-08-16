'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, AnimatePresence } from 'motion/react';
import { Camera, ChevronLeft, ChevronRight, Heart, X, ZoomIn } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import SkeletonImage from '@/components/SkeletonImage';
import { cn } from '@/lib/utils';
import { normalizeImageUrl } from '@/components/ImportCommittee';
import { useGalleryPhotos, useGalleryCategories } from '@/src/lib/hooks/use-queries';

const MotionImage = motion.create(Image);

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
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [likedPhotos, setLikedPhotos] = useState<Record<string, boolean>>({});
  const [isMarqueeHovered, setIsMarqueeHovered] = useState(false);

  const { data: gData } = useGalleryPhotos({ page: 1, pageSize: 1000 });
  const { data: categories = [] } = useGalleryCategories() as { data: GalleryCategory[] };
  const photos: GalleryPhoto[] = Array.isArray(gData) ? gData : (gData as any)?.data ?? [];

  const filteredPhotos = activeCategory === 'ALL'
    ? photos
    : photos.filter((p) => p.category === activeCategory);

  // Lebih cepat saat filter kategori tertentu (non-ALL), biar tidak terasa lambat/berat.
  const marqueeDuration = activeCategory === 'ALL' ? 90 : 32;

  // Duplicated arrays for seamless continuous infinite marquee sliding
  const marqueeRow1 = [...filteredPhotos, ...filteredPhotos, ...filteredPhotos];
  const marqueeRow2 = [...filteredPhotos.slice().reverse(), ...filteredPhotos.slice().reverse(), ...filteredPhotos.slice().reverse()];

  const handlePrevPhoto = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prev) => (prev === 0 ? filteredPhotos.length - 1 : (prev as number) - 1));
  };

  const handleNextPhoto = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prev) => (prev === filteredPhotos.length - 1 ? 0 : (prev as number) + 1));
  };

  const toggleLike = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLikedPhotos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const photo = selectedPhotoIndex !== null ? filteredPhotos[selectedPhotoIndex] : null;

  return (
    <section id="gallery" className="relative overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-sky-100 py-24 text-slate-900 md:py-32">
      {/* ─── SKY BACKGROUND GLOWS ─── */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 size-[850px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/25 blur-[140px]" />

      {/* ─── FLOATING DECORATIVE CLOUDS & BLOBS ─── */}
      <MotionImage
        src="/assets/cloud.png"
        alt=""
        width={320}
        height={220}
        animate={reduce ? undefined : { x: [0, 20, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute top-[6%] -left-12 z-0 h-auto w-72 opacity-75 select-none md:w-96"
      />
      <MotionImage
        src="/assets/cloud.png"
        alt=""
        width={350}
        height={240}
        animate={reduce ? undefined : { x: [0, -20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute top-[14%] -right-16 z-0 h-auto w-80 opacity-70 select-none md:w-[420px]"
      />
      <MotionImage
        src="/assets/blob-round.png"
        alt=""
        width={112}
        height={112}
        animate={reduce ? undefined : { y: [0, -18, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute top-[10%] right-[12%] z-0 size-16 object-contain opacity-80 select-none md:size-28"
      />

      <div className="relative z-10 w-full">
        {/* ── Section Header ── */}
        <div className="mx-auto mb-10 flex max-w-7xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-3 flex justify-center">
            <div className="accent-line" />
          </div>
          <h2 className="font-masterpiece mb-3 text-4xl leading-tight tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            EVENT <span className="text-astro-cyan">GALLERY</span>
          </h2>
          <p className="mx-auto mb-6 max-w-xl text-xs font-bold leading-relaxed text-slate-700 md:text-sm">
            Kumpulan momen berharga, dokumentasi keseruan lomba, seminar, dan perayaan kemenangan ASTRO dari masa ke masa.
          </p>

          {/* ── Category Filter Pills ── */}
          <div className="max-w-full overflow-x-auto px-2 pb-2 pt-1 no-scrollbar">
            <ToggleGroup
              type="single"
              value={activeCategory}
              onValueChange={(v) => v && setActiveCategory(v)}
              spacing={2}
            >
              {[{ name: 'All', slug: 'ALL' } as any, ...categories].map((cat: any) => (
                <ToggleGroupItem
                  key={cat.slug}
                  value={cat.slug}
                  className="clip-angled gap-2 border border-white/80 bg-white/40 px-4 py-2 text-xs font-black uppercase tracking-wider backdrop-blur-xl data-[state=on]:border-cyan-200 data-[state=on]:bg-astro-cyan data-[state=on]:text-slate-950 data-[state=on]:shadow-md"
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
          <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-30 w-12 bg-gradient-to-r from-sky-100 via-sky-100/60 to-transparent sm:w-16 md:w-24" />
          <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-30 w-12 bg-gradient-to-l from-sky-100 via-sky-100/60 to-transparent sm:w-16 md:w-24" />

          <div className="space-y-6">
            {[marqueeRow1, marqueeRow2].map((row, rowIdx) => (
              <div key={rowIdx} className="relative flex w-full overflow-hidden">
                <motion.div
                  animate={isMarqueeHovered ? false : { x: rowIdx === 0 ? ['0%', '-50%'] : ['-50%', '0%'] }}
                  transition={{
                    x: { repeat: Infinity, repeatType: 'loop', duration: rowIdx === 0 ? marqueeDuration : marqueeDuration + 10, ease: 'linear' },
                  }}
                  className="flex shrink-0 items-center gap-6"
                >
                  {row.map((photoItem, idx) => (
                    <div
                      key={`r${rowIdx}-${photoItem.id}-${idx}`}
                      onClick={() => setSelectedPhotoIndex(idx % filteredPhotos.length)}
                      className="group relative aspect-[4/3] w-[280px] shrink-0 cursor-pointer overflow-hidden border-2 border-white/80 bg-white/50 p-3 shadow-md backdrop-blur-2xl transition-all duration-500 hover:border-white hover:shadow-2xl sm:w-[330px] md:w-[380px]"
                      style={{ clipPath: 'polygon(14px 0, 100% 0, calc(100% - 14px) 100%, 0 100%)' }}
                    >
                      {/* Glass Refraction Highlight */}
                      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-tr from-white/10 via-white/35 to-transparent" />

                      <div
                        className="relative h-full w-full overflow-hidden border border-white/60 bg-slate-900 transition-colors group-hover:border-astro-cyan"
                        style={{ clipPath: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)' }}
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
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-90" />

                        {/* Year Badge */}
                        <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                          <Badge className="clip-angled-sm bg-astro-cyan text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-md">
                            {photoItem.year}
                          </Badge>
                        </div>

                        {/* Photo Title Overlay */}
                        <div className="absolute right-3 bottom-3 left-3 z-20 text-white">
                          <h4 className="text-sm font-black leading-tight text-white transition-colors group-hover:text-astro-cyan md:text-base">
                            {photoItem.title}
                          </h4>
                          <p className="mt-0.5 text-[11px] font-semibold text-slate-300 opacity-80">
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
      </div>

      {/* ═══ FULLSCREEN LIGHTBOX ═══ */}
      <AnimatePresence>
        {photo && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex flex-col bg-slate-950/95 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-label={photo.title}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 md:px-8 md:py-5">
              <div className="flex items-center gap-3">
                <Badge className="clip-angled-sm bg-astro-cyan text-[11px] font-black uppercase tracking-wider text-slate-950 shadow-sm">
                  {photo.year}
                </Badge>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
                  {photo.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => toggleLike(photo.id, e)}
                  className={cn(
                    'border border-white/15 bg-white/5 text-slate-200 hover:bg-white/15 hover:text-white',
                    likedPhotos[photo.id] && 'scale-110 border-rose-500 bg-rose-500 text-white shadow-md hover:bg-rose-500',
                  )}
                  aria-label="Suka foto ini"
                >
                  <Heart className={cn(likedPhotos[photo.id] && 'fill-current')} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Tutup"
                  onClick={() => setSelectedPhotoIndex(null)}
                  className="border border-white/15 bg-white/5 text-slate-200 hover:bg-white/15 hover:text-white"
                >
                  <X />
                </Button>
              </div>
            </div>

            {/* Main fullscreen image stage */}
            <div className="relative flex-1 min-h-0 px-4 pb-2 md:px-12">
              <div className="relative h-full w-full overflow-hidden bg-slate-900/60">
                {/* Animated shimmer skeleton while loading */}
                <SkeletonImage
                  src={normalizeImageUrl(photo.imageUrl)}
                  alt={photo.title}
                  imgKey={photo.id}
                  className="h-full w-full"
                  objectFit="contain"
                  priority
                  sizes="(max-width: 1280px) 100vw, 1280px"
                />

                {/* Navigation arrows */}
                <Button
                  variant="ghost"
                  size="icon-lg"
                  onClick={handlePrevPhoto}
                  className="absolute top-1/2 left-3 z-30 -translate-y-1/2 border border-white/20 bg-slate-950/70 text-white shadow-lg hover:bg-astro-cyan hover:text-slate-950 md:left-6"
                  aria-label="Foto sebelumnya"
                >
                  <ChevronLeft />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-lg"
                  onClick={handleNextPhoto}
                  className="absolute top-1/2 right-3 z-30 -translate-y-1/2 border border-white/20 bg-slate-950/70 text-white shadow-lg hover:bg-astro-cyan hover:text-slate-950 md:right-6"
                  aria-label="Foto berikutnya"
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>

            {/* Footer info */}
            <div className="flex items-center justify-between px-5 py-4 md:px-8 md:py-5">
              <div>
                <h3 className="text-base font-black text-white md:text-lg">{photo.title}</h3>
                <p className="mt-0.5 text-xs font-semibold text-slate-400">
                  Foto {selectedPhotoIndex! + 1} dari {filteredPhotos.length} dokumentasi resmi
                </p>
              </div>

              <div className="hidden items-center gap-1.5 border border-sky-400/30 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-200 sm:flex">
                <ZoomIn className="size-3.5 text-sky-300" /> HD Documentation
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
