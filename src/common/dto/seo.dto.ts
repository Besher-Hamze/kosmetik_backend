import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { LocalizedStringDto } from './localized-string.dto';

export class SeoDto {
  @ApiPropertyOptional({ type: LocalizedStringDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  title?: LocalizedStringDto;

  @ApiPropertyOptional({ type: LocalizedStringDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  description?: LocalizedStringDto;
}
