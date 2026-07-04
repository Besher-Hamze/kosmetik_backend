import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { LocalizedStringDto } from '../../../common/dto/localized-string.dto';
import { SeoDto } from '../../../common/dto/seo.dto';

export class CreateCourseDto {
  @ApiProperty({ example: 'microneedling' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiProperty({ type: LocalizedStringDto })
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  name: LocalizedStringDto;

  @ApiPropertyOptional({ type: LocalizedStringDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  subtitle?: LocalizedStringDto;

  @ApiProperty({ type: LocalizedStringDto })
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  duration: LocalizedStringDto;

  @ApiProperty({ type: LocalizedStringDto })
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  schedule: LocalizedStringDto;

  @ApiPropertyOptional({ type: Number, nullable: true, example: 750 })
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsNumber()
  priceFrom?: number | null;

  @ApiProperty({ type: LocalizedStringDto })
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  excerpt: LocalizedStringDto;

  @ApiProperty({ type: LocalizedStringDto })
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  description: LocalizedStringDto;

  @ApiPropertyOptional({ type: [LocalizedStringDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocalizedStringDto)
  curriculum?: LocalizedStringDto[];

  @ApiProperty({ type: LocalizedStringDto })
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  certificate: LocalizedStringDto;

  @ApiProperty({ type: LocalizedStringDto })
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  audience: LocalizedStringDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ type: SeoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SeoDto)
  seo?: SeoDto;
}

export class UpdateCourseDto extends PartialType(CreateCourseDto) {}
