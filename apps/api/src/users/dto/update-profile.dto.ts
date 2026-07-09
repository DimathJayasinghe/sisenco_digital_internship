import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * Self-service update for the authenticated principal (PATCH /users/me).
 * Deliberately has no `role` field — `forbidNonWhitelisted` rejects any
 * request that tries to smuggle one in, so a member can never self-promote.
 */
export class UpdateProfileDto {
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
}
