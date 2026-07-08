import { Prisma } from '@prisma/client';
import { Report, ReportStatus, ReportWithRelations } from '@sisenco/shared-types';
import { toIsoDate } from '../utils/date.util';
import { toProjectDto } from './project.mapper';

type ReportWithRelationsPrisma = Prisma.ReportGetPayload<{
  include: { project: true; user: true };
}>;

function toReportDto(report: Prisma.ReportGetPayload<object>): Report {
  return {
    id: report.id,
    userId: report.userId,
    projectId: report.projectId,
    weekStartDate: toIsoDate(report.weekStartDate),
    weekEndDate: toIsoDate(report.weekEndDate),
    tasksCompleted: report.tasksCompleted,
    tasksPlanned: report.tasksPlanned,
    blockers: report.blockers,
    hoursWorked: report.hoursWorked === null ? null : report.hoursWorked.toNumber(),
    notesOrLinks: report.notesOrLinks,
    // Safe: Prisma's ReportStatus enum and the shared-types one share the same values (DATABASE.md §3).
    status: report.status as unknown as ReportStatus,
    submittedAt: report.submittedAt === null ? null : report.submittedAt.toISOString(),
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString(),
  };
}

/** Maps a Prisma report (with `project` and `user` relations loaded) to the API-safe shape. */
export function toReportWithRelationsDto(report: ReportWithRelationsPrisma): ReportWithRelations {
  return {
    ...toReportDto(report),
    project: toProjectDto(report.project),
    user: {
      id: report.user.id,
      firstName: report.user.firstName,
      lastName: report.user.lastName,
      email: report.user.email,
    },
  };
}
