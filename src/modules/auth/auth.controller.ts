import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthUser } from '../../common/types/auth-user.interface';
import { AuthService, LoginResult } from './auth.service';
import { LoginDto } from './dto/login.dto';

const REFRESH_COOKIE = 'refresh_token';
const COOKIE_PATH = '/api/v1/auth';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setRefreshCookie(res: Response, result: LoginResult): void {
    res.cookie(REFRESH_COOKIE, result.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: COOKIE_PATH,
      expires: result.refreshExpiresAt,
    });
  }

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Login — returns access token; refresh token set as httpOnly cookie',
  })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto.email, dto.password);
    this.setRefreshCookie(res, result);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Rotate refresh token (cookie) and get a new access token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = req.cookies as Record<string, string | undefined>;
    const result = await this.authService.refresh(cookies?.[REFRESH_COOKIE]);
    this.setRefreshCookie(res, result);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout — invalidates the refresh token and clears cookie' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = req.cookies as Record<string, string | undefined>;
    await this.authService.logout(cookies?.[REFRESH_COOKIE]);
    res.clearCookie(REFRESH_COOKIE, { path: COOKIE_PATH });
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current authenticated user' })
  me(@CurrentUser() user: AuthUser) {
    return user;
  }
}
