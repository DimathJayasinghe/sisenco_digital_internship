import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Role } from '@sisenco/shared-types';

/**
 * Manager-only update. All fields optional (partial update); `role` is how a
 * Manager promotes/demotes a user — the only role-assignment path in the app.
 */
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  readonly firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  readonly lastName?: string;

  @IsOptional()
  @IsEnum(Role)
  readonly role?: Role;
}
