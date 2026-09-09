"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { Users, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { normalizeImageUrl } from "@/components/ImportCommittee";
import SkeletonImage from "@/components/SkeletonImage";
import { SectionHeading } from "@/components/brand/SectionHeading";
import { SectionShell } from "@/components/brand/SectionShell";
import {
  useCommitteeMembers,
  useCommitteeDivisions,
} from "@/src/lib/hooks/use-queries";

export default function CommitteeSection() {
  const reduce = useReducedMotion();
  const [activeDivision, setActiveDivision] = useState<string>("");
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedMemberIndex, setSelectedMemberIndex] = useState<number | null>(
    null,
  );
  const [loadedMemberId, setLoadedMemberId] = useState<number | string | null>(
    null,
  );
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(false);

  const carouselRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);
  const startX = useRef<number>(0);
  const scrollLeftStart = useRef<number>(0);

  const { data: members = [] } = useCommitteeMembers();
  const { data: divList = [] } = useCommitteeDivisions();

  const divisions = useMemo(() => {
    const divMap = new Map<string, any[]>();
    members.forEach((m: any) => {
      const key = m.division;
      if (!divMap.has(key)) divMap.set(key, []);
      divMap.get(key)!.push(m);
    });

    const merged = divList.map((d: any) => ({
      slug: d.slug,
      name: d.name,
      shortName: d.shortName || null,
      displayName: d.shortName ? `${d.name} (${d.shortName})` : d.name,
      shortDisplay: d.shortName || d.name,
      members: divMap.get(d.slug) || [],
      staffCount: divMap.get(d.slug)?.length || 0,
      id: d.slug,
    }));

    // Add any divisions from members not in divList
    members.forEach((m: any) => {
      if (!merged.find((d: any) => d.slug === m.division)) {
        merged.push({
          slug: m.division,
          name: m.divisionName || m.division,
          shortName: null,
          displayName: m.divisionName || m.division,
          shortDisplay: m.divisionName?.split(" ")[0] || m.division,
          members: divMap.get(m.division) || [],
          staffCount: divMap.get(m.division)?.length || 0,
          id: m.division,
        });
      }
    });

    return merged;
  }, [members, divList]);

  useEffect(() => {
    if (divisions.length > 0 && !activeDivision)
      setActiveDivision(divisions[0].slug);
  }, [divisions, activeDivision]);

  const getRoleWeight = (role: string) => {
    if (!role) return 99;
    const r = role.toLowerCase();
    if (r.includes("sc") || r.includes("steering")) return 1;
    if (
      r.includes("po") ||
      r.includes("project officer") ||
      r.includes("ketua pelaksana")
    )
      return 2;
    if (r.includes("wakil")) return 3;
    if (r.includes("sekretaris") || r.includes("sekre")) return 4;
    if (r.includes("bendahara") || r.includes("bendum")) return 5;
    if (r.includes("pi") || r.includes("pengurus inti")) return 6;
    if (r.includes("koordinator") || r.includes("co")) return 7;
    return 99;
  };

  const filteredMembers = useMemo(() => {
    return members
      .filter((m) => m.division === activeDivision)
      .sort((a, b) => {
        const weightDiff = getRoleWeight(a.role) - getRoleWeight(b.role);
        if (weightDiff !== 0) return weightDiff;
        if (a.sortOrder !== b.sortOrder)
          return (a.sortOrder || 0) - (b.sortOrder || 0);
        return a.name.localeCompare(b.name);
      });
  }, [members, activeDivision]);

  const currentDivision = divisions.find((d) => d.slug === activeDivision);

  // Check scroll capability
  const updateScrollState = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  }, []);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [filteredMembers, updateScrollState]);

  // Reset scroll position on division change
  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [activeDivision]);

  // Auto-scroll loop (pauses on hover or when modal is active)
  useEffect(() => {
    if (
      reduce ||
      isPaused ||
      selectedMemberIndex !== null ||
      filteredMembers.length <= 3
    )
      return;

    const interval = setInterval(() => {
      const el = carouselRef.current;
      if (!el) return;

      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 10) return;

      if (el.scrollLeft >= maxScroll - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: 280, behavior: "smooth" });
      }
    }, 3200);

    return () => clearInterval(interval);
  }, [reduce, isPaused, selectedMemberIndex, filteredMembers.length]);

  const scroll = (direction: "left" | "right") => {
    const el = carouselRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  // Mouse Drag to Scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = carouselRef.current;
    if (!el) return;
    isDragging.current = true;
    startX.current = e.pageX - el.offsetLeft;
    scrollLeftStart.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const el = carouselRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    el.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  const toggleHover = useCallback((id: number | null) => {
    setHoveredId((prev) => (prev === id ? null : id));
  }, []);

  const viewerMember =
    selectedMemberIndex !== null ? filteredMembers[selectedMemberIndex] : null;
  const isMemberReady = viewerMember
    ? loadedMemberId === viewerMember.id
    : false;

  const handlePrevMember = () => {
    if (selectedMemberIndex === null || filteredMembers.length === 0) return;
    setSelectedMemberIndex((prev) =>
      prev === 0 ? filteredMembers.length - 1 : (prev as number) - 1,
    );
  };

  const handleNextMember = () => {
    if (selectedMemberIndex === null || filteredMembers.length === 0) return;
    setSelectedMemberIndex((prev) =>
      prev === filteredMembers.length - 1 ? 0 : (prev as number) + 1,
    );
  };

  // Keyboard navigation inside viewer modal
  useEffect(() => {
    if (selectedMemberIndex !== null) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setSelectedMemberIndex(null);
        if (e.key === "ArrowLeft") handlePrevMember();
        if (e.key === "ArrowRight") handleNextMember();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [selectedMemberIndex, filteredMembers.length]);

  return (
    <SectionShell id="committee" band="none" space="sm">
      <SectionHeading
        eyebrow="Panitia"
        pillTone="blue"
        title="Panitia ASTRO 2026"
        lead="Tim yang menggerakkan kompetisi, festival, dan grand final."
      />

      <div className="mt-10">

        {/* ── Filter Pills ── */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          <ToggleGroup
            type="single"
            value={activeDivision}
            onValueChange={(v) => {
              if (v) {
                setActiveDivision(v);
                setSelectedMemberIndex(null);
              }
            }}
            spacing={2}
            className="flex min-w-full flex-wrap justify-center"
          >
            {divisions.map((div) => (
              <ToggleGroupItem
                key={div.id}
                value={div.slug}
                className="rounded-lg gap-2 px-4 py-2 text-xs font-black tracking-wide transition-all data-[state=on]:bg-linear-to-b data-[state=on]:from-astro-blue data-[state=on]:to-astro-blue data-[state=on]:text-white data-[state=on]:shadow-lg data-[state=off]:bg-white/65 data-[state=off]:text-astro-blue data-[state=off]:hover:bg-white data-[state=off]:hover:text-astro-blue"
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    activeDivision === div.slug
                      ? "bg-astro-cyan"
                      : "bg-astro-cyan-2",
                  )}
                />
                {div.shortDisplay}
                <Badge
                  variant="secondary"
                  className={cn(
                    "rounded-md text-10 font-bold",
                    activeDivision === div.slug
                      ? "bg-sky-bottom text-astro-cyan"
                      : "bg-white/40 text-muted-foreground",
                  )}
                >
                  {div.staffCount}
                </Badge>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* ── Division Header & Controls ── */}
        <div className="flex items-center justify-between gap-4 mb-6 px-2 sm:px-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-astro-navy shadow-soft-sm">
              {currentDivision?.displayName || activeDivision}
            </span>
            <span className="hidden text-xs font-medium text-ink sm:inline-block">
              {filteredMembers.length} personel
            </span>
          </div>

          {/* Navigation Controls */}
          {filteredMembers.length > 2 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                aria-label="Geser ke kiri"
                className="size-8 rounded-full border-astro-cyan-2 bg-white/80 text-ink shadow-sm hover:bg-astro-cyan hover:text-astro-navy hover:border-astro-cyan disabled:opacity-30 disabled:hover:bg-white/80 transition-all"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                aria-label="Geser ke kanan"
                className="size-8 rounded-full border-astro-cyan-2 bg-white/80 text-ink shadow-sm hover:bg-astro-cyan hover:text-astro-navy hover:border-astro-cyan disabled:opacity-30 disabled:hover:bg-white/80 transition-all"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </div>

        {/* ── Auto-Scrolling / Slider Carousel Track ── */}
        <div
          ref={carouselRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => {
            setIsPaused(false);
            handleMouseUpOrLeave();
          }}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          className={cn(
            "flex gap-4 md:gap-6 overflow-x-auto pb-6 pt-2 px-2 sm:px-4 no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing select-none",
            filteredMembers.length <= 4 && "md:justify-center",
          )}
        >
          {filteredMembers.map((member, index) => {
            const isRevealed = hoveredId === member.id;
            return (
              <motion.div
                key={member.id}
                initial={reduce ? undefined : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.35,
                  delay: Math.min(index * 0.04, 0.25),
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group flex-shrink-0 w-56 md:w-64"
                onMouseEnter={() => setHoveredId(member.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => {
                  toggleHover(member.id);
                  setSelectedMemberIndex(index);
                }}
              >
                <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-surface shadow-md hover:shadow-xl transition-all duration-300 ring-1 ring-white/90 cursor-pointer">
                  <Image
                    src={normalizeImageUrl(member.image) || "/assets/users.png"}
                    alt={member.name}
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 240px, 280px"
                  />

                  {/* Always-visible role badge */}
                  <div className="absolute top-3 left-3 z-20">
                    <Badge
                      className={
                        member.isLeader === "1"
                          ? "bg-amber-400 text-10 font-bold uppercase tracking-wider text-amber-950 shadow-sm max-w-[140px] truncate inline-block"
                          : "bg-white/85 text-10 font-bold uppercase tracking-wider text-ink ring-1 ring-white/90 backdrop-blur-sm max-w-[140px] truncate inline-block"
                      }
                    >
                      {member.role || "Anggota"}
                    </Badge>
                  </div>

                  {/* Overlay on hover/tap */}
                  <AnimatePresence>
                    {isRevealed && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="absolute inset-0 z-10 flex flex-col justify-end bg-linear-to-t from-astro-navy/85 via-astro-navy/40 to-transparent backdrop-blur-[2px]"
                      >
                        <div className="p-4 md:p-5">
                          <h3 className="text-sm md:text-base font-bold text-white leading-tight drop-shadow-sm capitalize">
                            {member.name}
                          </h3>
                          <p className="text-xs text-astro-cyan mt-0.5 font-bold drop-shadow-sm">
                            {member.role}
                          </p>

                          {(member.studyProgram || member.batch) && (
                            <p className="mt-1 text-10 font-semibold uppercase tracking-wider text-astro-cyan-2/90 drop-shadow-sm">
                              {[member.studyProgram, member.batch]
                                .filter(Boolean)
                                .join(" ")}
                            </p>
                          )}

                          {member.quote && (
                            <p className="text-xs text-white/70 italic mt-2 leading-relaxed line-clamp-2 drop-shadow-sm">
                              "{member.quote}"
                            </p>
                          )}

                          {(member.instagram || member.linkedin) && (
                            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/20">
                              {member.instagram && (
                                <span className="text-10 font-medium text-white/80 truncate">
                                  @{member.instagram}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Summary & Interaction Hint ── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/60 backdrop-blur-xl rounded-xl ring-1 ring-astro-cyan-2 shadow-sm">
            <Users className="w-4 h-4 text-astro-cyan" />
            <span className="text-xs font-bold text-ink">
              {filteredMembers.length} Anggota —{" "}
              {currentDivision?.name || activeDivision}
            </span>
          </div>
        </div>
      </div>

      {/* ═══ PORTRAIT MEMBER VIEWER MODAL ═══ */}
      <AnimatePresence>
        {viewerMember && (
          <motion.div
            key="committee-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-astro-navy/80 p-4 backdrop-blur-xl"
            role="dialog"
            aria-modal="true"
            aria-label={viewerMember.name}
            onClick={() => setSelectedMemberIndex(null)}
          >
            {/* Sky Glow Backdrop */}
            <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 size-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-astro-sky/10 blur-[140px]" />

            {/* Centered Dark Navy Portrait Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 flex flex-col w-full max-w-sm sm:max-w-md max-h-[92vh] overflow-hidden rounded-3xl border border-sky-top/30 bg-astro-navy/95 p-4 sm:p-5 text-white shadow-2xl backdrop-blur-2xl"
            >
              {/* Header inside Card */}
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  {isMemberReady ? (
                    <Badge className="rounded-md bg-astro-cyan text-11 font-black uppercase tracking-wider text-astro-navy shadow-sm">
                      {currentDivision?.shortDisplay ||
                        currentDivision?.name ||
                        activeDivision}
                    </Badge>
                  ) : (
                    <div className="h-5 w-28 rounded bg-astro-cyan-2/40 animate-pulse rounded-md" />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Tutup"
                  onClick={() => setSelectedMemberIndex(null)}
                  className="size-8 border border-white/15 bg-white/10 text-astro-cyan-2 hover:bg-white/20 hover:text-white rounded-full"
                >
                  <X className="size-4" />
                </Button>
              </div>

              {/* Image Stage inside Portrait Card */}
              <div className="relative w-full aspect-[3/4] max-h-[46vh] sm:max-h-[50vh] overflow-hidden rounded-2xl border border-white/10 bg-astro-navy shadow-inner">
                <SkeletonImage
                  key={viewerMember.id}
                  src={
                    normalizeImageUrl(viewerMember.image) || "/assets/users.png"
                  }
                  alt={viewerMember.name}
                  imgKey={viewerMember.id}
                  className="h-full w-full"
                  objectFit="cover"
                  priority
                  sizes="(max-width: 640px) 100vw, 420px"
                  onReady={() => setLoadedMemberId(viewerMember.id)}
                />

                {/* White Circular Navigation Arrows */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevMember}
                  className="absolute top-1/2 left-2.5 z-30 -translate-y-1/2 size-9 rounded-full bg-white text-astro-navy shadow-lg hover:bg-astro-cyan hover:scale-105 transition-all"
                  aria-label="Anggota sebelumnya"
                >
                  <ChevronLeft className="size-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNextMember}
                  className="absolute top-1/2 right-2.5 z-30 -translate-y-1/2 size-9 rounded-full bg-white text-astro-navy shadow-lg hover:bg-astro-cyan hover:scale-105 transition-all"
                  aria-label="Anggota berikutnya"
                >
                  <ChevronRight className="size-5" />
                </Button>
              </div>

              {/* Footer Info inside Portrait Card */}
              <div className="pt-3 text-center overflow-y-auto max-h-[25vh] no-scrollbar">
                {isMemberReady ? (
                  <>
                    <h3 className="text-lg sm:text-xl font-black text-white capitalize leading-tight">
                      {viewerMember.name}
                    </h3>
                    <p className="mt-0.5 text-xs sm:text-sm font-bold text-astro-cyan">
                      {viewerMember.role}
                    </p>
                    {(viewerMember.studyProgram || viewerMember.batch) && (
                      <p className="mt-1 text-10 font-bold uppercase tracking-wider text-astro-cyan-2/90">
                        {[viewerMember.studyProgram, viewerMember.batch]
                          .filter(Boolean)
                          .join(" ")}
                      </p>
                    )}
                    {viewerMember.quote && (
                      <p className="mt-2 px-2 text-xs text-astro-cyan-2 italic leading-relaxed">
                        "{viewerMember.quote}"
                      </p>
                    )}
                    <p className="mt-2 text-11 font-semibold text-ink">
                      {selectedMemberIndex! + 1} dari {filteredMembers.length}{" "}
                      anggota
                    </p>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-1">
                    <div className="h-5 w-44 rounded bg-astro-cyan-2/40 animate-pulse mb-2" />
                    <div className="h-4 w-28 rounded bg-astro-cyan-2/40 animate-pulse mb-2" />
                    <div className="h-3 w-40 rounded bg-astro-cyan-2/40 animate-pulse mb-2" />
                    <div className="h-4 w-60 rounded bg-astro-cyan-2/40 animate-pulse mb-2" />
                    <div className="h-3 w-24 rounded bg-astro-cyan-2/40 animate-pulse" />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionShell>
  );
}
