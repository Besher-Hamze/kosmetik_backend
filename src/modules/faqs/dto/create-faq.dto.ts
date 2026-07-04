import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, ValidateNested } from 'class-validator';
import { LocalizedStringDto } from '../../../common/dto/localized-string.dto';

export class CreateFaqDto {
  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiProperty({ type: LocalizedStringDto })
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  question: LocalizedStringDto;

  @ApiProperty({ type: LocalizedStringDto })
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  answer: LocalizedStringDto;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateFaqDto extends PartialType(CreateFaqDto) {}
