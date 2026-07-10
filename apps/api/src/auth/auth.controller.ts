import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthUser, User } from '@sisenco/shared-types';
import { CookieOptions, Response } from 'express';
import { CurrentUser, Public } from '../common/decorators';
import { ACCESS_TOKEN_COOKIE } from './auth.constants';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

// Stricter than the global rate limit (SECURITY_GUIDELINES.md §4) — brute-force mitigation.
const AUTH_THROTTLE = { default: { limit: 10, ttl: 60_000 } };

function cookieOptions(maxAge?: number): CookieOptions {
  return {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    ...(maxAge !== undefined && { maxAge }),
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<User> {
    const user = await this.authService.register(dto);
    this.attachSession(res, user);
    return user;
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response): Promise<User> {
    const user = await this.authService.validateCredentials(dto);
    this.attachSession(res, user);
    return user;
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response): { success: true } {
    res.clearCookie(ACCESS_TOKEN_COOKIE, cookieOptions());
    return { success: true };
  }

  @Get('me')
  async me(@CurrentUser('id') userId: AuthUser['id']): Promise<User> {
    return this.authService.getProfile(userId);
  }

  // Same throttle tier as login/register — brute-forcing the current-password
  // check is exactly the login brute-force risk, just from a signed-in session.
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @Patch('change-password')
  async changePassword(
    @CurrentUser('id') userId: AuthUser['id'],
    @Body() dto: ChangePasswordDto,
  ): Promise<{ success: true }> {
    await this.authService.changePassword(userId, dto);
    return { success: true };
  }

  private attachSession(res: Response, user: User): void {
    const { accessToken, maxAge } = this.authService.issueSession({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, cookieOptions(maxAge));
  }
}
