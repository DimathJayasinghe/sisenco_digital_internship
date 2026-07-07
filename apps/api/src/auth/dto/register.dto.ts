import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '../auth.constants';

/**
 * Registration payload. There is deliberately no `role` field — every
 * registration is assigned TEAM_MEMBER; promotion happens via PATCH /users/:id.
 */
export class RegisterDto {
  @IsEmail()
  @MaxLength(255)
  readonly email!: string;

  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  @MaxLength(MAX_PASSWORD_LENGTH)
  readonly password!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  readonly firstName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  readonly lastName!: string;
}
