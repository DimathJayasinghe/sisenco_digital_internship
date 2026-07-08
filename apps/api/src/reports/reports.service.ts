import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Report as PrismaReport, ReportStatus as PrismaReportStatus } from '@prisma/client';
import { AuthUser, ReportWithRelations, Role } from '@sisenco/shared-types';
import { toReportWithRelationsDto } from '../common/mappers';
import { REPORT_RELATIONS } from '../common/prisma/report-includes';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { FindReportsQueryDto } from './dto/find-reports-query.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { computeWeekEndDate, isPastDeadline } from './utils/week.util';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateReportDto): Promise<ReportWithRelations> {
    await this.assertProjectAccessible(dto.projectId, userId);

    const weekStartDate = new Date(dto.weekStartDate);
    const weekEndDate = computeWeekEndDate(weekStartDate);
    await this.assertWeekAvailable(userId, weekStartDate);

    const report = await this.prisma.report.create({
      data: {
        userId,
        projectId: dto.projectId,
        weekStartDate,
        weekEndDate,
        tasksCompleted: dto.tasksCompleted,
        tasksPlanned: dto.tasksPlanned,
        blockers: dto.blockers,
        hoursWorked: dto.hoursWorked,
        notesOrLinks: dto.notesOrLinks,
      },
      include: REPORT_RELATIONS,
    });

    return toReportWithRelationsDto(report);
  }

  async findMine(userId: string): Promise<ReportWithRelations[]> {
    const reports = await this.prisma.report.findMany({
      where: { userId },
      include: REPORT_RELATIONS,
      orderBy: { weekStartDate: 'desc' },
    });
    return reports.map(toReportWithRelationsDto);
  }

  async findAll(query: FindReportsQueryDto): Promise<ReportWithRelations[]> {
    const weekStartDate: Prisma.DateTimeFilter | undefined =
      query.startDate || query.endDate
        ? {
            ...(query.startDate && { gte: new Date(query.startDate) }),
            ...(query.endDate && { lte: new Date(query.endDate) }),
          }
        : undefined;

    const reports = await this.prisma.report.findMany({
      where: {
        ...(query.userId && { userId: query.userId }),
        ...(query.projectId && { projectId: query.projectId }),
        ...(weekStartDate && { weekStartDate }),
      },
      include: REPORT_RELATIONS,
      orderBy: { weekStartDate: 'desc' },
    });
    return reports.map(toReportWithRelationsDto);
  }

  async findOne(id: string, requestingUser: AuthUser): Promise<ReportWithRelations> {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: REPORT_RELATIONS,
    });
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    if (requestingUser.role !== Role.MANAGER && report.userId !== requestingUser.id) {
      throw new ForbiddenException('You do not have access to this report');
    }
    return toReportWithRelationsDto(report);
  }

  async update(
    id: string,
    requestingUserId: string,
    dto: UpdateReportDto,
  ): Promise<ReportWithRelations> {
    await this.findOwnedDraftOrThrow(id, requestingUserId);

    if (dto.projectId !== undefined) {
      await this.assertProjectAccessible(dto.projectId, requestingUserId);
    }

    let weekStartDate: Date | undefined;
    let weekEndDate: Date | undefined;
    if (dto.weekStartDate !== undefined) {
      weekStartDate = new Date(dto.weekStartDate);
      weekEndDate = computeWeekEndDate(weekStartDate);
      await this.assertWeekAvailable(requestingUserId, weekStartDate, id);
    }

    const report = await this.prisma.report.update({
      where: { id },
      data: {
        ...(dto.projectId !== undefined && { projectId: dto.projectId }),
        ...(weekStartDate && weekEndDate && { weekStartDate, weekEndDate }),
        ...(dto.tasksCompleted !== undefined && { tasksCompleted: dto.tasksCompleted }),
        ...(dto.tasksPlanned !== undefined && { tasksPlanned: dto.tasksPlanned }),
        ...(dto.blockers !== undefined && { blockers: dto.blockers }),
        ...(dto.hoursWorked !== undefined && { hoursWorked: dto.hoursWorked }),
        ...(dto.notesOrLinks !== undefined && { notesOrLinks: dto.notesOrLinks }),
      },
      include: REPORT_RELATIONS,
    });

    return toReportWithRelationsDto(report);
  }

  /** DRAFT -> SUBMITTED, or -> LATE if past DATABASE.md §5's deadline. Sets submittedAt = now. */
  async submit(id: string, requestingUserId: string): Promise<ReportWithRelations> {
    const existing = await this.prisma.report.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Report not found');
    }
    if (existing.userId !== requestingUserId) {
      throw new ForbiddenException('You do not have access to this report');
    }
    if (existing.status !== PrismaReportStatus.DRAFT) {
      throw new ConflictException('This report has already been submitted');
    }

    const now = new Date();
    const status = isPastDeadline(existing.weekEndDate, now)
      ? PrismaReportStatus.LATE
      : PrismaReportStatus.SUBMITTED;

    const report = await this.prisma.report.update({
      where: { id },
      data: { status, submittedAt: now },
      include: REPORT_RELATIONS,
    });

    return toReportWithRelationsDto(report);
  }

  private async findOwnedDraftOrThrow(id: string, requestingUserId: string): Promise<PrismaReport> {
    const existing = await this.prisma.report.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Report not found');
    }
    if (existing.userId !== requestingUserId) {
      throw new ForbiddenException('You do not have access to this report');
    }
    if (existing.status !== PrismaReportStatus.DRAFT) {
      throw new ForbiddenException('Only DRAFT reports can be edited');
    }
    return existing;
  }

  /**
   * SECURITY_GUIDELINES.md §6 — project_id must reference a real, active project.
   * DATABASE.md §3 — user_projects "restricts which projects a member can report
   * on": if this member has any assignments at all, projectId must be one of
   * them; a member with zero assignments is unrestricted (assignment is opt-in).
   */
  private async assertProjectAccessible(projectId: string, userId: string): Promise<void> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project || !project.isActive) {
      throw new BadRequestException('projectId must reference an active project');
    }

    const assignmentCount = await this.prisma.userProject.count({ where: { userId } });
    if (assignmentCount === 0) {
      return;
    }

    const isAssigned = await this.prisma.userProject.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });
    if (!isAssigned) {
      throw new ForbiddenException('You are not assigned to this project');
    }
  }

  private async assertWeekAvailable(
    userId: string,
    weekStartDate: Date,
    excludingReportId?: string,
  ): Promise<void> {
    const existing = await this.prisma.report.findUnique({
      where: { userId_weekStartDate: { userId, weekStartDate } },
    });
    if (existing && existing.id !== excludingReportId) {
      throw new ConflictException('A report for this week already exists');
    }
  }
}
