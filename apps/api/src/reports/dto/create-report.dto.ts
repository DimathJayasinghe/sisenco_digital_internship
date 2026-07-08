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
import { IsMonday } from '../validators/is-monday.validator';

export class CreateReportDto {
  /** Must be a Monday — weekEndDate is always derived as +6 days (the following Sunday). */
  @IsDateString()
  @IsMonday()
  readonly weekStartDate!: string;

  @IsUUID()
  readonly projectId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(MAX_REPORT_TEXT_LENGTH)
  readonly tasksCompleted!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(MAX_REPORT_TEXT_LENGTH)
  readonly tasksPlanned!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(MAX_REPORT_TEXT_LENGTH)
  readonly blockers!: string;

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
