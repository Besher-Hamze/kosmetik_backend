import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@karmen-kosmetik.de' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin#2026' })
  @IsString()
  @MinLength(1)
  password: string;
}
