export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
  meta?: PaginationMeta;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  message?: string;
  success: boolean;
}

export interface PaginationMeta {
  page: number;
  pageSize?: number;
  limit?: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
  statusCode: number;
  details?: Record<string, unknown>;
}

export class ApiError extends Error {
  statusCode: number;
  code?: string;
  errors?: Record<string, string[]>;
  details?: Record<string, unknown>;

  constructor(response: ApiErrorResponse) {
    super(response.message);
    this.name = "ApiError";
    this.statusCode = response.statusCode;
    this.code = response.code;
    this.errors = response.errors;
    this.details = response.details;
  }
}

export interface ListParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}
