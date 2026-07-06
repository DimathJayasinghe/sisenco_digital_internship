import { ReportStatus } from './enums';

/**
 * Report entity — maps to the `reports` database table.
 * Fixed schema — no dynamic/custom fields.
 */
export interface IReport {
  readonly id: string;
  readonly userId: string;
  readonly projectId: string;
  readonly weekStartDate: string;
  readonly weekEndDate: string;
  readonly tasksCompleted: string;
  readonly tasksPlanned: string;
  readonly blockers: string;
  readonly hoursWorked: number | null;
  readonly notesOrLinks: string | null;
  readonly status: ReportStatus;
  readonly submittedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Payload for creating a new report (DRAFT).
 */
export interface ICreateReportRequest {
  readonly projectId: string;
  readonly weekStartDate: string;
  readonly weekEndDate: string;
  readonly tasksCompleted: string;
  readonly tasksPlanned: string;
  readonly blockers: string;
  readonly hoursWorked?: number;
  readonly notesOrLinks?: string;
}

/**
 * Payload for updating an existing DRAFT report.
 */
export interface IUpdateReportRequest {
  readonly projectId?: string;
  readonly weekStartDate?: string;
  readonly weekEndDate?: string;
  readonly tasksCompleted?: string;
  readonly tasksPlanned?: string;
  readonly blockers?: string;
  readonly hoursWorked?: number | null;
  readonly notesOrLinks?: string | null;
}
