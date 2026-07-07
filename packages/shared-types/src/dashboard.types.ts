import { MemberSubmissionStatus } from './enums';

/** Manager dashboard summary metric cards. */
export interface DashboardSummary {
  totalSubmittedThisWeek: number;
  expectedMembers: number;
  submittedMembers: number;
  pendingMembers: number;
  complianceRate: number;
  openBlockers: number;
}

/** One point in the "tasks completed trend over time" chart. */
export interface TrendPoint {
  weekStartDate: string;
  reportCount: number;
}

/** Per-member submission status for the selected week. */
export interface MemberStatusRow {
  userId: string;
  firstName: string;
  lastName: string;
  status: MemberSubmissionStatus;
}

/** Workload distribution slice by project. */
export interface WorkloadSlice {
  projectId: string;
  projectName: string;
  reportCount: number;
  totalHours: number;
}
