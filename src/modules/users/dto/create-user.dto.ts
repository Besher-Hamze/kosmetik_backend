import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import type { UserRole } from '../../../common/types/auth-user.interface';

export class CreateUserDto {
  @ApiProperty({ example: 'editor@karmen-kosmetik.de' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: ['superadmin', 'admin', 'editor'] })
  @IsOptional()
  @IsIn(['superadmin', 'admin', 'editor'])
  role?: UserRole;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
