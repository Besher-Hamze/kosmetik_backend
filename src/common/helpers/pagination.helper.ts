export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    data,
    meta: {
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export function parseSort(
  sort: string | undefined,
  fallback: Record<string, 1 | -1>,
): Record<string, 1 | -1> {
  if (!sort) return fallback;
  const direction: 1 | -1 = sort.startsWith('-') ? -1 : 1;
  const field = sort.replace(/^-/, '').trim();
  if (!field) return fallback;
  return { [field]: direction };
}
