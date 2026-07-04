import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser, UserRole } from '../../../common/types/auth-user.interface';
import { UsersService } from '../../users/users.service';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET') ?? 'dev-secret',
    });
  }

  async validate(payload: AccessTokenPayload): Promise<AuthUser> {
    const user = await this.usersService.findByIdInternal(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User no longer active');
    }
    return {
      userId: payload.sub,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
