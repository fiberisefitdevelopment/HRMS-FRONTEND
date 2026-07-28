import type { PaginationMeta } from "@/types/api";

export interface ListQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}

export function toListParams<T extends ListQueryParams>(params?: T) {
  const { page, limit, sort, search, ...rest } = (params ?? {}) as ListQueryParams &
    Record<string, unknown>;
  return {
    page: page ?? 1,
    limit: limit ?? 20,
    ...(sort ? { sort } : {}),
    ...(search ? { search } : {}),
    ...rest,
  };
}

export function normalizeMeta(meta: PaginationMeta & { limit?: number }): PaginationMeta {
  return {
    page: meta.page,
    pageSize: meta.pageSize ?? meta.limit ?? 20,
    total: meta.total,
    totalPages: meta.totalPages,
    hasNextPage: meta.hasNextPage,
    hasPrevPage: meta.hasPrevPage,
  };
}
