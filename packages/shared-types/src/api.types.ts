/**
 * Standard success envelope returned by every API endpoint.
 * Mirrors the format defined in ARCHITECTURE.md §4.
 */
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

/** Payload shape for paginated list endpoints (wrapped in {@link ApiResponse}). */
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

/** Standard error envelope. `message` is an array to accommodate validation errors. */
export interface ApiError {
  statusCode: number;
  error: string;
  message: string | string[];
}
