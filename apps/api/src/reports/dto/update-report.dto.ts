import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  MAX_HOURS_WORKED,
  MAX_NOTES_LENGTH,
  MAX_REPORT_TEXT_LENGTH,
  MIN_HOURS_WORKED,
} from '../reports.constants';

/** Only ever applied to a DRAFT report owned by the caller (enforced in ReportsService). */
export class UpdateReportDto {
  @IsOptional()
  @IsDateString()
  readonly weekStartDate?: string;

  @IsOptional()
  @IsUUID()
  readonly projectId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_REPORT_TEXT_LENGTH)
  readonly tasksCompleted?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_REPORT_TEXT_LENGTH)
  readonly tasksPlanned?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_REPORT_TEXT_LENGTH)
  readonly blockers?: string;

  @IsOptional()
  @IsNumber()
  @Min(MIN_HOURS_WORKED)
  @Max(MAX_HOURS_WORKED)
  readonly hoursWorked?: number;

  @IsOptional()
  @IsString()
  @MaxLength(MAX_NOTES_LENGTH)
  readonly notesOrLinks?: string;
}
