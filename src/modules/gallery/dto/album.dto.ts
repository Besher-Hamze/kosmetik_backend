import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { LocalizedStringDto } from '../../../common/dto/localized-string.dto';

export class AlbumImageDto {
  @ApiProperty({ example: '/uploads/media/academy/classroom-1.png' })
  @IsString()
  src: string;

  @ApiProperty({ type: LocalizedStringDto })
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  alt: LocalizedStringDto;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  order?: number;
}

export class CreateAlbumDto {
  @ApiProperty({ example: 'academy' })
  @IsString()
  slug: string;

  @ApiProperty({ type: LocalizedStringDto })
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  title: LocalizedStringDto;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiPropertyOptional({ type: [AlbumImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AlbumImageDto)
  images?: AlbumImageDto[];
}

export class UpdateAlbumDto extends PartialType(CreateAlbumDto) {}
