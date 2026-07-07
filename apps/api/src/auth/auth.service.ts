import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthUser, Role, User } from '@sisenco/shared-types';
import * as bcrypt from 'bcrypt';
import { toSafeUser } from '../common/mappers';
import { PrismaService } from '../common/prisma/prisma.service';
import { BCRYPT_ROUNDS } from './auth.constants';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { parseDurationMs } from './utils/duration.util';

const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password';
const DEFAULT_JWT_EXPIRES_IN = '7d';

/** The signed JWT plus how long the carrying cookie should live, in ms. */
export interface Session {
  accessToken: string;
  maxAge: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  /** Registers a new account. Always TEAM_MEMBER — no client-supplied role is ever read. */
  async register(dto: RegisterDto): Promise<User> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const teamMemberRole = await this.prisma.role.findUniqueOrThrow({
      where: { name: Role.TEAM_MEMBER },
    });
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        roleId: teamMemberRole.id,
      },
      include: { role: true },
    });

    return toSafeUser(user);
  }

  /** Verifies credentials for login. Generic error on any failure — never reveals which field was wrong. */
  async validateCredentials(dto: LoginDto): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });

    const isMatch = user ? await bcrypt.compare(dto.password, user.passwordHash) : false;
    if (!user || !isMatch) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    return toSafeUser(user);
  }

  /** Returns the full profile for the authenticated principal (used by GET /auth/me). */
  async getProfile(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    return toSafeUser(user);
  }

  /** Signs a new access token for `user` and sizes a cookie maxAge to match its expiry. */
  issueSession(user: AuthUser): Session {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const expiresIn = this.config.get<string>('JWT_EXPIRES_IN', DEFAULT_JWT_EXPIRES_IN);

    return {
      accessToken: this.jwtService.sign(payload),
      maxAge: parseDurationMs(expiresIn),
    };
  }
}
