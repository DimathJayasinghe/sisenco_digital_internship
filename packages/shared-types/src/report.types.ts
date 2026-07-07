import { ReportStatus } from './enums';
import { Project } from './project.types';
import { UserSummary } from './user.types';

/**
 * A weekly report. Exactly one per member per week (unique on user + week_start_date).
 * Field set is fixed — end users cannot add/remove fields.
 */
export interface Report {
  id: string;
  userId: string;
  projectId: string;
  weekStartDate: string;
  weekEndDate: string;
  tasksCompleted: string;
  tasksPlanned: string;
  blockers: string;
  hoursWorked: number | null;
  notesOrLinks: string | null;
  status: ReportStatus;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** A report enriched with its related project and author, as returned by list/detail endpoints. */
export interface ReportWithRelations extends Report {
  project: Project;
  user: UserSummary;
}
