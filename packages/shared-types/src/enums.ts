/**
 * Fixed RBAC roles. Values match the `name` column seeded into the `roles` table.
 */
export enum Role {
  MANAGER = 'MANAGER',
  TEAM_MEMBER = 'TEAM_MEMBER',
}

/**
 * Persisted report lifecycle status (stored on `reports.status`).
 * `PENDING` is intentionally NOT here — it is a derived dashboard state
 * (absence of a submitted report), see {@link MemberSubmissionStatus}.
 */
export enum ReportStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  LATE = 'LATE',
}

/**
 * Derived per-member submission state for a given week on the Manager dashboard.
 * See DATABASE.md §5 — a member with no SUBMITTED/LATE report is PENDING.
 */
export enum MemberSubmissionStatus {
  SUBMITTED = 'SUBMITTED',
  LATE = 'LATE',
  PENDING = 'PENDING',
}
