import { Controller, Get } from '@nestjs/common';
import {
  DashboardSummary,
  MemberStatusRow,
  ReportWithRelations,
  Role,
  TrendPoint,
  WorkloadSlice,
} from '@sisenco/shared-types';
import { Roles } from '../common/decorators';
import { DashboardService } from './dashboard.service';

@Roles(Role.MANAGER)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(): Promise<DashboardSummary> {
    return this.dashboardService.getSummary();
  }

  @Get('charts/trend')
  getTrend(): Promise<TrendPoint[]> {
    return this.dashboardService.getTrend();
  }

  @Get('charts/status')
  getStatusByMember(): Promise<MemberStatusRow[]> {
    return this.dashboardService.getStatusByMember();
  }

  @Get('charts/workload')
  getWorkloadByProject(): Promise<WorkloadSlice[]> {
    return this.dashboardService.getWorkloadByProject();
  }

  @Get('activity')
  getActivityFeed(): Promise<ReportWithRelations[]> {
    return this.dashboardService.getActivityFeed();
  }
}
