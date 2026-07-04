import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UploadMediaDto {
  @ApiPropertyOptional({ description: 'German alt text' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  altDe?: string;

  @ApiPropertyOptional({ description: 'Arabic alt text' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  altAr?: string;
}
