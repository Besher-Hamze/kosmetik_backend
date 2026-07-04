import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { LocalizedStringDto } from '../../../common/dto/localized-string.dto';

export class NavItemDto {
  @ApiProperty({ example: 'treatments' })
  @IsString()
  key: string;

  @ApiProperty({ type: LocalizedStringDto })
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  label: LocalizedStringDto;

  @ApiProperty({ example: '/behandlungen' })
  @IsString()
  href: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  hidden?: boolean;
}

export class UpdateNavigationDto {
  @ApiPropertyOptional({ type: [NavItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NavItemDto)
  quickMenu?: NavItemDto[];

  @ApiPropertyOptional({ type: [NavItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NavItemDto)
  legalMenu?: NavItemDto[];
}
