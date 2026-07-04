import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { LocalizedStringDto } from '../../../common/dto/localized-string.dto';

export class PageSectionDto {
  @ApiProperty({ type: LocalizedStringDto })
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  heading: LocalizedStringDto;

  @ApiProperty({ type: LocalizedStringDto })
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  body: LocalizedStringDto;
}

export class CreatePageDto {
  @ApiProperty({ example: 'datenschutz' })
  @IsString()
  slug: string;

  @ApiProperty({ type: LocalizedStringDto })
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  title: LocalizedStringDto;

  @ApiPropertyOptional({ type: [PageSectionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PageSectionDto)
  sections?: PageSectionDto[];
}

export class UpdatePageDto extends PartialType(CreatePageDto) {}
