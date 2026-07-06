/**
 * Report status enum — matches database CHECK constraint.
 * DRAFT: Report is being written by the team member.
 * SUBMITTED: Report has been formally submitted.
 * LATE: Report was submitted after the deadline (or not submitted).
 */
export enum ReportStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  LATE = 'LATE',
}

/**
 * Role name enum — matches database seed data.
 */
export enum RoleName {
  MANAGER = 'MANAGER',
  TEAM_MEMBER = 'TEAM_MEMBER',
}
