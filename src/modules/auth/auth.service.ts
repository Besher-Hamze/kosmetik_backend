import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import type { StringValue } from 'ms';
import { Model, Types } from 'mongoose';
import { AuthUser } from '../../common/types/auth-user.interface';
import { UserDocument } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import {
  RefreshToken,
  RefreshTokenDocument,
} from './schemas/refresh-token.schema';
import { AccessTokenPayload } from './strategies/jwt.strategy';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
  user: { id: string; email: string; name: string; role: string };
}

function parseTtlMs(ttl: string): number {
  const match = /^(\d+)([smhd])$/.exec(ttl.trim());
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = Number(match[1]);
  const unit = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2]];
  return value * (unit ?? 1000);
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async issueTokens(user: UserDocument): Promise<LoginResult> {
    const payload: AccessTokenPayload = {
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: (this.config.get<string>('JWT_ACCESS_TTL') ??
        '15m') as StringValue,
    });

    const refreshToken = randomBytes(48).toString('hex');
    const refreshExpiresAt = new Date(
      Date.now() + parseTtlMs(this.config.get<string>('JWT_REFRESH_TTL') ?? '7d'),
    );
    await this.refreshTokenModel.create({
      userId: user._id,
      tokenHash: this.hashToken(refreshToken),
      expiresAt: refreshExpiresAt,
    });

    return {
      accessToken,
      refreshToken,
      refreshExpiresAt,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async login(email: string, password: string): Promise<LoginResult> {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    return this.issueTokens(user);
  }

  /** Rotates the refresh token: the presented token is invalidated and a new one issued. */
  async refresh(presentedToken: string | undefined): Promise<LoginResult> {
    if (!presentedToken) {
      throw new UnauthorizedException('No refresh token provided');
    }
    const stored = await this.refreshTokenModel.findOneAndDelete({
      tokenHash: this.hashToken(presentedToken),
    });
    if (!stored || stored.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token invalid or expired');
    }
    const user = await this.usersService.findByIdInternal(
      stored.userId.toString(),
    );
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User no longer active');
    }
    return this.issueTokens(user);
  }

  async logout(presentedToken: string | undefined): Promise<void> {
    if (presentedToken) {
      await this.refreshTokenModel.deleteOne({
        tokenHash: this.hashToken(presentedToken),
      });
    }
  }

  async logoutAll(user: AuthUser): Promise<void> {
    await this.refreshTokenModel.deleteMany({
      userId: new Types.ObjectId(user.userId),
    });
  }
}
