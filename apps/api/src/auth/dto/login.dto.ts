import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @MaxLength(255)
  readonly email!: string;

  @IsString()
  @IsNotEmpty()
  readonly password!: string;
}
