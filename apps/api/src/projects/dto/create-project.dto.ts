import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  readonly name!: string;

  @IsOptional()
  @IsString()
  readonly description?: string;
}
