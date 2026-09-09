import { z } from "zod";

/** Shared pagination query schema: ?page (1-based) & pageSize (default 20, max 1000). */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(1000).default(20),
});

export type Pagination = z.infer<typeof paginationSchema>;

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  { page, pageSize }: Pagination,
) {
  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasMore: page * pageSize < total,
    },
  };
}
