'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiHelpers } from '@/src/lib/api';

/** Standard query-key factory for the app's resources. */
export const queryKeys = {
  competitions: {
    all: ['competitions'] as const,
    detail: (id: string) => ['competitions', id] as const,
    timeline: (id: string) => ['competitions', id, 'timeline'] as const,
    withWinners: ['competitions', 'with-winners'] as const,
  },
  registrations: {
    all: ['registrations'] as const,
    list: (query: Record<string, unknown>) => ['registrations', query] as const,
    detail: (id: string) => ['registrations', id] as const,
    stats: ['registrations', 'stats'] as const,
    winners: (competitionId: string) => ['registrations', 'winners', competitionId] as const,
  },
  categories: { all: ['categories'] as const },
  faqs: { all: ['faqs'] as const },
  committeeMembers: { all: ['committee-members'] as const },
  committeeDivisions: { all: ['committee-divisions'] as const },
  galleryPhotos: {
    all: ['gallery-photos'] as const,
    list: (query: Record<string, unknown>) => ['gallery-photos', query] as const,
  },
  galleryCategories: { all: ['gallery-categories'] as const },
  journeys: { all: ['journeys'] as const },
  journeyPhotos: {
    all: ['journey-photos'] as const,
    list: (journeyId: string) => ['journey-photos', journeyId] as const,
  },
  sponsors: { all: ['sponsors'] as const },
  mediaPartners: { all: ['media-partners'] as const },
  users: { all: ['users'] as const },
  certificateTemplates: {
    all: ['certificate-templates'] as const,
    list: (competitionId: string) =>
      ['certificate-templates', competitionId] as const,
  },
};

/* ─── Competitions ─── */

export function useCompetitions() {
  return useQuery({ queryKey: queryKeys.competitions.all, queryFn: apiHelpers.competitions.list });
}

export function useCompetition(id: string) {
  return useQuery({
    queryKey: queryKeys.competitions.detail(id),
    queryFn: () => apiHelpers.competitions.get(id),
    enabled: !!id,
  });
}

export function useCompetitionTimeline(id: string) {
  return useQuery({
    queryKey: queryKeys.competitions.timeline(id),
    queryFn: () => apiHelpers.competitions.timeline(id),
    enabled: !!id,
  });
}

export function useCompetitionMutations() {
  const qc = useQueryClient();
  return {
    create: useMutation({
      mutationFn: apiHelpers.competitions.create,
      onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.competitions.all }),
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: string; body: unknown }) =>
        apiHelpers.competitions.update(id, body),
      onSuccess: (_d, v) => {
        qc.invalidateQueries({ queryKey: queryKeys.competitions.all });
        qc.invalidateQueries({ queryKey: queryKeys.competitions.detail(v.id) });
      },
    }),
    remove: useMutation({
      mutationFn: apiHelpers.competitions.remove,
      onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.competitions.all }),
    }),
    createTimeline: useMutation({
      mutationFn: ({ id, body }: { id: string; body: unknown }) =>
        apiHelpers.competitions.createTimeline(id, body),
      onSuccess: (_d, v) =>
        qc.invalidateQueries({ queryKey: queryKeys.competitions.timeline(v.id) }),
    }),
    updateTimeline: useMutation({
      mutationFn: ({ id, itemId, body }: { id: string; itemId: string; body: unknown }) =>
        apiHelpers.competitions.updateTimeline(id, itemId, body),
      onSuccess: (_d, v) =>
        qc.invalidateQueries({ queryKey: queryKeys.competitions.timeline(v.id) }),
    }),
    removeTimeline: useMutation({
      mutationFn: ({ id, itemId }: { id: string; itemId: string }) =>
        apiHelpers.competitions.removeTimeline(id, itemId),
      onSuccess: (_d, v) =>
        qc.invalidateQueries({ queryKey: queryKeys.competitions.timeline(v.id) }),
    }),
  };
}

/* ─── Registrations ─── */

export function useRegistrations(
  query: Record<string, string | number | undefined> = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: queryKeys.registrations.list(query),
    queryFn: () => apiHelpers.registrations.list(query),
    enabled: options.enabled,
  });
}

export function useRegistration(
  id: string,
  options: { refetchInterval?: number | false } = {},
) {
  return useQuery({
    queryKey: queryKeys.registrations.detail(id),
    queryFn: () => apiHelpers.registrations.get(id),
    enabled: !!id,
    refetchInterval: options.refetchInterval,
  });
}

export function useRegistrationStats() {
  return useQuery({
    queryKey: queryKeys.registrations.stats,
    queryFn: apiHelpers.registrations.stats,
  });
}

export function useWinners(competitionId: string) {
  return useQuery({
    queryKey: queryKeys.registrations.winners(competitionId),
    queryFn: () => apiHelpers.registrations.winners(competitionId),
    enabled: !!competitionId,
  });
}

export function useRegistrationMutations() {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ['registrations'] });
  return {
    create: useMutation({
      mutationFn: apiHelpers.registrations.create,
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: string; body: unknown }) =>
        apiHelpers.registrations.update(id, body),
      onSuccess: invalidate,
    }),
  };
}

/* ─── Categories / FAQs ─── */

export function useCategories() {
  return useQuery({ queryKey: queryKeys.categories.all, queryFn: apiHelpers.categories.list });
}

export function useFaqs() {
  return useQuery({ queryKey: queryKeys.faqs.all, queryFn: apiHelpers.faqs.list });
}

/* ─── Committee ─── */

export function useCommitteeMembers() {
  return useQuery({
    queryKey: queryKeys.committeeMembers.all,
    queryFn: apiHelpers.committeeMembers.list,
  });
}

export function useCommitteeDivisions() {
  return useQuery({
    queryKey: queryKeys.committeeDivisions.all,
    queryFn: apiHelpers.committeeDivisions.list,
  });
}

/* ─── Gallery ─── */

export function useGalleryPhotos(query: Record<string, string | number | undefined> = {}) {
  return useQuery({
    queryKey: queryKeys.galleryPhotos.list(query),
    queryFn: () => apiHelpers.galleryPhotos.list(query),
  });
}

export function useGalleryCategories() {
  return useQuery({
    queryKey: queryKeys.galleryCategories.all,
    queryFn: apiHelpers.galleryCategories.list,
  });
}

/* ─── Journeys / Sponsors / Media partners ─── */

export function useJourneys() {
  return useQuery({ queryKey: queryKeys.journeys.all, queryFn: apiHelpers.journeys.list });
}

export function useJourneyPhotos(journeyId: string) {
  return useQuery({
    queryKey: queryKeys.journeyPhotos.list(journeyId),
    queryFn: () => apiHelpers.journeyPhotos.list(journeyId),
  });
}

export function useSponsors() {
  return useQuery({ queryKey: queryKeys.sponsors.all, queryFn: apiHelpers.sponsors.list });
}

export function useMediaPartners() {
  return useQuery({
    queryKey: queryKeys.mediaPartners.all,
    queryFn: apiHelpers.mediaPartners.list,
  });
}

/* ─── Users ─── */

export function useUsers() {
  return useQuery({ queryKey: queryKeys.users.all, queryFn: apiHelpers.users.list });
}

/* ─── Certificate Templates ─── */

export function useCertificateTemplates(competitionId: string) {
  return useQuery({
    queryKey: queryKeys.certificateTemplates.list(competitionId),
    queryFn: () => apiHelpers.certificateTemplates.list(competitionId),
    enabled: !!competitionId,
  });
}

export function useCertificateTemplateMutations(competitionId: string) {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({
      queryKey: queryKeys.certificateTemplates.list(competitionId),
    });
  return {
    create: useMutation({
      mutationFn: apiHelpers.certificateTemplates.create,
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: apiHelpers.certificateTemplates.remove,
      onSuccess: invalidate,
    }),
  };
}

/* ─── Certificate Generation ─── */

export function useCertificateGenerate(competitionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: apiHelpers.certificates.generate,
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.certificateTemplates.list(competitionId),
      });
      qc.invalidateQueries({
        queryKey: queryKeys.registrations.winners(competitionId),
      });
    },
  });
}

export function useCertificateGenerateSingle() {
  return useMutation({
    mutationFn: apiHelpers.certificates.generateSingle,
  });
}
