'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, AnimatePresence } from 'motion/react';
import { Users, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { normalizeImageUrl } from '@/components/ImportCommittee';
import SkeletonImage from '@/components/SkeletonImage';
import { useCommitteeMembers, useCommitteeDivisions } from '@/src/lib/hooks/use-queries';

const MotionImage = motion.create(Image);

export default function CommitteeSection() {
  const reduce = useReducedMotion();
  const [activeDivision, setActiveDivision] = useState<string>('');
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedMemberIndex, setSelectedMemberIndex] = useState<number | null>(null);
  const [loadedMemberId, setLoadedMemberId] = useState<number | string | null>(null);
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
          shortDisplay: m.divisionName?.split(' ')[0] || m.division,
          members: divMap.get(m.division) || [],
          staffCount: divMap.get(m.division)?.length || 0,
          id: m.division,
        });
      }
    });

    // Backend already returns divisions sorted by sortOrder ASC, then id ASC
    return merged;
  }, [members, divList]);

  useEffect(() => {
    if (divisions.length > 0 && !activeDivision) setActiveDivision(divisions[0].slug);
  }, [divisions, activeDivision]);

  const getRoleWeight = (role: string) => {
    if (!role) return 99;
    const r = role.toLowerCase();
    if (r.includes('sc') || r.includes('steering')) return 1;
    if (r.includes('po') || r.includes('project officer') || r.includes('ketua pelaksana')) return 2;
    if (r.includes('wakil')) return 3;
    if (r.includes('sekretaris') || r.includes('sekre')) return 4;
    if (r.includes('bendahara') || r.includes('bendum')) return 5;
    if (r.includes('pi') || r.includes('pengurus inti')) return 6;
    if (r.includes('koordinator') || r.includes('co')) return 7;
    return 99;
  };

  const filteredMembers = members
    .filter((m) => m.division === activeDivision)
    .sort((a, b) => {
      const weightDiff = getRoleWeight(a.role) - getRoleWeight(b.role);
      if (weightDiff !== 0) return weightDiff;
      if (a.sortOrder !== b.sortOrder) return (a.sortOrder || 0) - (b.sortOrder || 0);
      return a.name.localeCompare(b.name);
    });

  const currentDivision = divisions.find((d) => d.slug === activeDivision);

  const toggleHover = useCallback((id: number | null) => {
    setHoveredId((prev) => (prev === id ? null : id));
  }, []);

  const viewerMember = selectedMemberIndex !== null ? filteredMembers[selectedMemberIndex] : null;
  const isMemberReady = viewerMember ? loadedMemberId === viewerMember.id : false;

  const handlePrevMember = () => {
    if (selectedMemberIndex === null || filteredMembers.length === 0) return;
    setSelectedMemberIndex((prev) => (prev === 0 ? filteredMembers.length - 1 : (prev as number) - 1));
  };

  const handleNextMember = () => {
    if (selectedMemberIndex === null || filteredMembers.length === 0) return;
    setSelectedMemberIndex((prev) => (prev === filteredMembers.length - 1 ? 0 : (prev as number) + 1));
  };

  useEffect(() => {
    if (selectedMemberIndex !== null) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setSelectedMemberIndex(null);
        if (e.key === 'ArrowLeft') handlePrevMember();
        if (e.key === 'ArrowRight') handleNextMember();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedMemberIndex, filteredMembers.length]);

  return (
    <section id="committee" className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-sky-100 via-sky-100 to-sky-200 text-slate-900">
      {/* Ambient Sky Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] bg-cyan-300/30 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-sky-300/40 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Floating Decorative Clouds */}
      <MotionImage
        src="/assets/cloud.png"
        alt=""
        width={320}
        height={220}
        animate={reduce ? undefined : { x: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[4%] -left-10 w-72 md:w-96 h-auto opacity-75 pointer-events-none select-none z-0"
      />
      <MotionImage
        src="/assets/cloud.png"
        alt=""
        width={350}
        height={240}
        animate={reduce ? undefined : { x: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[12%] -right-12 w-80 md:w-[420px] h-auto opacity-70 pointer-events-none select-none z-0"
      />
      <MotionImage
        src="/assets/awan1.png"
        alt=""
        width={180}
        height={140}
        animate={reduce ? undefined : { x: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[10%] left-[2%] w-24 md:w-40 h-auto opacity-75 pointer-events-none select-none z-0"
      />
      <MotionImage
        src="/assets/awan2.png"
        alt=""
        width={200}
        height={160}
        animate={reduce ? undefined : { x: [0, -12, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[15%] right-[2%] w-28 md:w-48 h-auto opacity-70 pointer-events-none select-none z-0"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Section Header ── */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-3">
            <div className="accent-line" />
          </div>
          <h2 className="font-masterpiece text-4xl md:text-5xl lg:text-6xl text-slate-900 leading-tight mb-3">
            Our <span className="text-astro-cyan">Committee</span>
          </h2>
          <p className="text-sm md:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Tim panitia penggerak ASTRO 2026 yang bekerja keras untuk kesuksesan acara ini.
          </p>
        </div>

        {/* ── Filter Pills ── */}
        <div className="mb-12 flex flex-wrap justify-center gap-2">
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
                className="clip-angled gap-2 px-4 py-2 text-xs font-semibold tracking-wide data-[state=on]:bg-white data-[state=on]:text-slate-900 data-[state=on]:shadow-lg data-[state=on]:shadow-black/5 data-[state=on]:ring-1 data-[state=on]:ring-slate-200 data-[state=off]:bg-white/40 data-[state=off]:text-slate-600 data-[state=off]:hover:bg-white/70 data-[state=off]:hover:text-slate-800"
              >
                <span className={cn('size-1.5 rounded-full', activeDivision === div.slug ? 'bg-astro-cyan' : 'bg-slate-300')} />
                {div.shortDisplay}
                <Badge variant="secondary" className={cn('clip-angled-sm text-[10px] font-bold', activeDivision === div.slug ? 'bg-sky-50 text-astro-cyan' : 'bg-white/40 text-muted-foreground')}>
                  {div.staffCount}
                </Badge>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* ── Division Label ── */}
        {currentDivision && (
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="h-px bg-slate-200/60 flex-1 max-w-24" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              {currentDivision.displayName}
            </span>
            <div className="h-px bg-slate-200/60 flex-1 max-w-24" />
          </div>
        )}

        {/* ── Centered Member Grid ── */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 pb-8 px-4 sm:px-6 lg:px-8">
          {filteredMembers.map((member, index) => {
            const isRevealed = hoveredId === member.id;
            return (
              <motion.div
                key={member.id}
                initial={reduce ? undefined : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
                className="group w-56 md:w-64"
                onMouseEnter={() => setHoveredId(member.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => {
                  toggleHover(member.id);
                  setSelectedMemberIndex(index);
                }}
              >
                <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 shadow-sm hover:shadow-md transition-all duration-300 ring-1 ring-white/80 cursor-pointer">
                  <Image
                    src={normalizeImageUrl(member.image) || '/assets/users.png'}
                    alt={member.name}
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />

                  {/* Always-visible role badge */}
                  <div className="absolute top-3 left-3 z-20">
                    <Badge className={member.isLeader === '1' ? 'bg-amber-400 text-[10px] font-bold uppercase tracking-wider text-amber-950 shadow-sm max-w-[140px] truncate inline-block' : 'bg-white/80 text-[10px] font-bold uppercase tracking-wider text-slate-700 ring-1 ring-white backdrop-blur-sm max-w-[140px] truncate inline-block'}>
                      {member.role || 'Anggota'}
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
                        className="absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent backdrop-blur-[2px]"
                      >
                        <div className="p-4 md:p-5">
                          <h3 className="text-sm md:text-base font-bold text-white leading-tight drop-shadow-sm capitalize">
                            {member.name}
                          </h3>
                          <p className="text-xs text-white/80 mt-0.5 font-medium drop-shadow-sm">
                            {member.role}
                          </p>

                          {(member.studyProgram || member.batch) && (
                            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-200/90 drop-shadow-sm">
                              {[member.studyProgram, member.batch].filter(Boolean).join(' ')}
                            </p>
                          )}

                          {member.quote && (
                            <p className="text-xs text-white/60 italic mt-2 leading-relaxed line-clamp-2 drop-shadow-sm">
                              &ldquo;{member.quote}&rdquo;
                            </p>
                          )}

                          {(member.instagram || member.linkedin) && (
                            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/20">
                              {member.instagram && (
                                <span className="text-[10px] font-medium text-white/60 truncate">
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

        {/* ── Total Count ── */}
        <div className="flex justify-center mt-16">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/50 backdrop-blur-xl rounded-xl ring-1 ring-white/80 shadow-sm">
            <Users className="w-4 h-4 text-astro-cyan" />
            <span className="text-xs font-semibold text-slate-600">
              {filteredMembers.length} Anggota — {currentDivision?.name || activeDivision}
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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-sky-950/75 p-4 backdrop-blur-xl"
            role="dialog"
            aria-modal="true"
            aria-label={viewerMember.name}
            onClick={() => setSelectedMemberIndex(null)}
          >
            {/* Sky Glow Backdrop */}
            <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/20 blur-[130px]" />

            {/* Centered Portrait Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 flex flex-col w-full max-w-sm sm:max-w-md max-h-[92vh] overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-3 sm:p-4 text-white shadow-2xl shadow-slate-950/40 backdrop-blur-2xl backdrop-saturate-150"
            >
              {/* Glass Sheen */}
              <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent" />

              {/* Header inside Card */}
              <div className="relative z-10 flex items-center justify-between pb-2.5">
                <div className="flex items-center gap-2">
                  {isMemberReady ? (
                    <Badge className="clip-angled-sm bg-astro-cyan text-[11px] font-black uppercase tracking-wider text-slate-950 shadow-sm">
                      {currentDivision?.shortDisplay || currentDivision?.name || activeDivision}
                    </Badge>
                  ) : (
                    <div className="h-5 w-28 rounded bg-slate-800/80 shimmer clip-angled-sm" />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Tutup"
                  onClick={() => setSelectedMemberIndex(null)}
                  className="size-8 border border-white/15 bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white rounded-full"
                >
                  <X className="size-4" />
                </Button>
              </div>

              {/* Image Stage inside Portrait Card */}
              <div className="relative z-10">
                <SkeletonImage
                  key={viewerMember.id}
                  src={normalizeImageUrl(viewerMember.image) || '/assets/users.png'}
                  alt={viewerMember.name}
                  imgKey={viewerMember.id}
                  fill={false}
                  width={600}
                  height={800}
                  className="mx-auto w-fit max-w-full overflow-hidden rounded-2xl ring-1 ring-white/25 shadow-lg shadow-slate-950/40"
                  imgClassName="h-auto w-auto max-h-[46vh] sm:max-h-[50vh] max-w-full"
                  priority
                  sizes="(max-width: 640px) 100vw, 420px"
                  onReady={() => setLoadedMemberId(viewerMember.id)}
                />

                {/* Navigation Arrows */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevMember}
                  className="absolute top-1/2 left-2 z-30 -translate-y-1/2 border border-white/20 bg-slate-950/75 text-white shadow-lg hover:bg-astro-cyan hover:text-slate-950 rounded-full size-9"
                  aria-label="Anggota sebelumnya"
                >
                  <ChevronLeft className="size-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNextMember}
                  className="absolute top-1/2 right-2 z-30 -translate-y-1/2 border border-white/20 bg-slate-950/75 text-white shadow-lg hover:bg-astro-cyan hover:text-slate-950 rounded-full size-9"
                  aria-label="Anggota berikutnya"
                >
                  <ChevronRight className="size-5" />
                </Button>
              </div>

              {/* Footer Info inside Portrait Card */}
              <div className="relative z-10 pt-2.5 text-center overflow-y-auto max-h-[25vh] no-scrollbar">
                {isMemberReady ? (
                  <>
                    <h3 className="text-lg sm:text-xl font-black text-white capitalize leading-tight">
                      {viewerMember.name}
                    </h3>
                    <p className="mt-0.5 text-xs sm:text-sm font-bold text-sky-300">
                      {viewerMember.role}
                    </p>
                    {(viewerMember.studyProgram || viewerMember.batch) && (
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-cyan-200/80">
                        {[viewerMember.studyProgram, viewerMember.batch].filter(Boolean).join(' ')}
                      </p>
                    )}
                    {viewerMember.quote && (
                      <p className="mt-2 px-2 text-xs text-slate-300/90 italic leading-relaxed">
                        &ldquo;{viewerMember.quote}&rdquo;
                      </p>
                    )}
                    <p className="mt-2 text-[11px] font-semibold text-slate-400">
                      {selectedMemberIndex !== null ? selectedMemberIndex + 1 : 0} dari {filteredMembers.length} anggota
                    </p>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-1">
                    <div className="h-5 w-44 rounded bg-slate-800/80 shimmer mb-2" />
                    <div className="h-4 w-28 rounded bg-slate-800/80 shimmer mb-2" />
                    <div className="h-3 w-36 rounded bg-slate-800/80 shimmer mb-2" />
                    <div className="h-4 w-60 rounded bg-slate-800/80 shimmer mb-2" />
                    <div className="h-3 w-24 rounded bg-slate-800/80 shimmer" />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
