/**
 * Standard success API response wrapper.
 * All API endpoints MUST return this structure.
 */
export interface IApiResponse<T> {
  readonly statusCode: number;
  readonly message: string;
  readonly data: T;
}

/**
 * Paginated list response — used for GET endpoints that return lists.
 */
export interface IPaginatedData<T> {
  readonly items: T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

/**
 * Standard error API response.
 */
export interface IApiErrorResponse {
  readonly statusCode: number;
  readonly error: string;
  readonly message: string[];
}

/**
 * Dashboard summary metrics — returned by GET /api/v1/dashboard/summary.
 */
export interface IDashboardSummary {
  readonly totalReportsThisWeek: number;
  readonly complianceRate: number;
  readonly openBlockers: number;
}
