import { IsDateString, IsOptional, IsUUID } from 'class-validator';

/** Manager-only filters for GET /reports (ARCHITECTURE.md §3): by member, project, date range. */
export class FindReportsQueryDto {
  @IsOptional()
  @IsUUID()
  readonly userId?: string;

  @IsOptional()
  @IsUUID()
  readonly projectId?: string;

  /** Inclusive lower bound on weekStartDate. */
  @IsOptional()
  @IsDateString()
  readonly startDate?: string;

  /** Inclusive upper bound on weekStartDate. */
  @IsOptional()
  @IsDateString()
  readonly endDate?: string;
}
