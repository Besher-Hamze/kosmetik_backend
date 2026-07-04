import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { LocalizedStringDto } from '../../../common/dto/localized-string.dto';
import { SeoDto } from '../../../common/dto/seo.dto';

export class TreatmentGalleryImageDto {
  @ApiProperty({ example: '/uploads/media/treatments/microneedling.png' })
  @IsString()
  src: string;

  @ApiPropertyOptional({ type: LocalizedStringDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  alt?: LocalizedStringDto;

  @ApiPropertyOptional({ type: LocalizedStringDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  caption?: LocalizedStringDto;
}

export class TreatmentSectionDto {
  @ApiProperty({ type: LocalizedStringDto })
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  heading: LocalizedStringDto;

  @ApiProperty({ type: LocalizedStringDto })
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  body: LocalizedStringDto;

  @ApiPropertyOptional({ type: [TreatmentGalleryImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TreatmentGalleryImageDto)
  images?: TreatmentGalleryImageDto[];
}

export class BeforeAfterPairDto {
  @ApiProperty()
  @IsString()
  before: string;

  @ApiProperty()
  @IsString()
  after: string;

  @ApiPropertyOptional({ type: LocalizedStringDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  caption?: LocalizedStringDto;
}

export class CreateTreatmentDto {
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
  benefits?: LocalizedStringDto[];

  @ApiPropertyOptional({ type: [TreatmentSectionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TreatmentSectionDto)
  sections?: TreatmentSectionDto[];

  @ApiPropertyOptional({ type: [TreatmentGalleryImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TreatmentGalleryImageDto)
  gallery?: TreatmentGalleryImageDto[];

  @ApiPropertyOptional({ type: [BeforeAfterPairDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BeforeAfterPairDto)
  beforeAfter?: BeforeAfterPairDto[];

  @ApiPropertyOptional({ example: '/uploads/media/treatments/microneedling.png' })
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

export class UpdateTreatmentDto extends PartialType(CreateTreatmentDto) {}
