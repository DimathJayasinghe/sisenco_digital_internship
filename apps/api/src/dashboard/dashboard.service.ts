import { Injectable } from '@nestjs/common';
import { ReportStatus as PrismaReportStatus } from '@prisma/client';
import {
  DashboardSummary,
  MemberStatusRow,
  MemberSubmissionStatus,
  ReportWithRelations,
  Role,
  TrendPoint,
  WorkloadSlice,
} from '@sisenco/shared-types';
import { toReportWithRelationsDto } from '../common/mappers';
import { REPORT_RELATIONS } from '../common/prisma/report-includes';
import { PrismaService } from '../common/prisma/prisma.service';
import { toIsoDate } from '../common/utils/date.util';
import { ACTIVITY_FEED_LIMIT } from './dashboard.constants';
import { getCurrentWeekStart } from './utils/current-week.util';
import { hasOpenBlocker } from './utils/blockers.util';

const SUBMITTED_OR_LATE = [PrismaReportStatus.SUBMITTED, PrismaReportStatus.LATE];

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /** DATABASE.md §5's compliance formula, windowed to the current (Monday-aligned) week. */
  async getSummary(): Promise<DashboardSummary> {
    const weekStartDate = getCurrentWeekStart(new Date());

    const [expectedMembers, submittedMembers, submittedReports] = await Promise.all([
      this.prisma.user.count({ where: { role: { name: Role.TEAM_MEMBER } } }),
      this.prisma.report.count({
        where: { weekStartDate, status: { in: SUBMITTED_OR_LATE } },
      }),
      this.prisma.report.findMany({
        where: { weekStartDate, status: { in: SUBMITTED_OR_LATE } },
        select: { blockers: true },
      }),
    ]);

    const pendingMembers = expectedMembers - submittedMembers;
    const complianceRate = expectedMembers === 0 ? 0 : submittedMembers / expectedMembers;
    const openBlockers = submittedReports.filter((report) =>
      hasOpenBlocker(report.blockers),
    ).length;

    return {
      totalSubmittedThisWeek: submittedMembers,
      expectedMembers,
      submittedMembers,
      pendingMembers,
      complianceRate,
      openBlockers,
    };
  }

  /** Tasks-completed trend: submitted/late report count per week, across all weeks on record. */
  async getTrend(): Promise<TrendPoint[]> {
    const grouped = await this.prisma.report.groupBy({
      by: ['weekStartDate'],
      where: { status: { in: SUBMITTED_OR_LATE } },
      _count: { _all: true },
      orderBy: { weekStartDate: 'asc' },
    });

    return grouped.map((point) => ({
      weekStartDate: toIsoDate(point.weekStartDate),
      reportCount: point._count._all,
    }));
  }

  /** Per-member submission status for the current week — DRAFT or no report both read as PENDING. */
  async getStatusByMember(): Promise<MemberStatusRow[]> {
    const weekStartDate = getCurrentWeekStart(new Date());

    const [members, reports] = await Promise.all([
      this.prisma.user.findMany({
        where: { role: { name: Role.TEAM_MEMBER } },
        select: { id: true, firstName: true, lastName: true },
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      }),
      this.prisma.report.findMany({
        where: { weekStartDate },
        select: { userId: true, status: true },
      }),
    ]);

    const statusByUserId = new Map(reports.map((report) => [report.userId, report.status]));

    return members.map((member) => ({
      userId: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      status: this.toMemberSubmissionStatus(statusByUserId.get(member.id)),
    }));
  }

  /** Workload distribution across active reporting activity (submitted/late reports only). */
  async getWorkloadByProject(): Promise<WorkloadSlice[]> {
    const grouped = await this.prisma.report.groupBy({
      by: ['projectId'],
      where: { status: { in: SUBMITTED_OR_LATE } },
      _count: { _all: true },
      _sum: { hoursWorked: true },
    });

    const projects = await this.prisma.project.findMany({
      where: { id: { in: grouped.map((group) => group.projectId) } },
      select: { id: true, name: true },
    });
    const projectNameById = new Map(projects.map((project) => [project.id, project.name]));

    return grouped
      .map((group) => ({
        projectId: group.projectId,
        projectName: projectNameById.get(group.projectId) ?? 'Unknown project',
        reportCount: group._count._all,
        totalHours: group._sum.hoursWorked === null ? 0 : group._sum.hoursWorked.toNumber(),
      }))
      .sort((a, b) => b.reportCount - a.reportCount);
  }

  /** Most recently submitted reports across the team. */
  async getActivityFeed(): Promise<ReportWithRelations[]> {
    const reports = await this.prisma.report.findMany({
      where: { status: { in: SUBMITTED_OR_LATE } },
      include: REPORT_RELATIONS,
      orderBy: { submittedAt: 'desc' },
      take: ACTIVITY_FEED_LIMIT,
    });
    return reports.map(toReportWithRelationsDto);
  }

  private toMemberSubmissionStatus(
    reportStatus: PrismaReportStatus | undefined,
  ): MemberSubmissionStatus {
    if (reportStatus === PrismaReportStatus.SUBMITTED) {
      return MemberSubmissionStatus.SUBMITTED;
    }
    if (reportStatus === PrismaReportStatus.LATE) {
      return MemberSubmissionStatus.LATE;
    }
    return MemberSubmissionStatus.PENDING;
  }
}
