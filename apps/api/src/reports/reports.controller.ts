import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AuthUser, ReportWithRelations, Role } from '@sisenco/shared-types';
import { CurrentUser, Roles } from '../common/decorators';
import { CreateReportDto } from './dto/create-report.dto';
import { FindReportsQueryDto } from './dto/find-reports-query.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Roles(Role.TEAM_MEMBER)
  @Post()
  create(
    @CurrentUser('id') userId: AuthUser['id'],
    @Body() dto: CreateReportDto,
  ): Promise<ReportWithRelations> {
    return this.reportsService.create(userId, dto);
  }

  @Roles(Role.TEAM_MEMBER)
  @Get('my')
  findMine(@CurrentUser('id') userId: AuthUser['id']): Promise<ReportWithRelations[]> {
    return this.reportsService.findMine(userId);
  }

  @Roles(Role.MANAGER)
  @Get()
  findAll(@Query() query: FindReportsQueryDto): Promise<ReportWithRelations[]> {
    return this.reportsService.findAll(query);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<ReportWithRelations> {
    return this.reportsService.findOne(id, user);
  }

  @Roles(Role.TEAM_MEMBER)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: AuthUser['id'],
    @Body() dto: UpdateReportDto,
  ): Promise<ReportWithRelations> {
    return this.reportsService.update(id, userId, dto);
  }

  @Roles(Role.TEAM_MEMBER)
  @HttpCode(HttpStatus.OK)
  @Post(':id/submit')
  submit(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: AuthUser['id'],
  ): Promise<ReportWithRelations> {
    return this.reportsService.submit(id, userId);
  }
}
