import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class AddressDto {
  @ApiProperty()
  @IsString()
  street: string;

  @ApiProperty()
  @IsString()
  zip: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty({ type: LocalizedStringDto })
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  country: LocalizedStringDto;
}

export class ContactInfoDto {
  @ApiProperty()
  @IsString()
  ownerName: string;

  @ApiProperty({ type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  whatsapp: string;
}

export class SocialLinksDto {
  @ApiProperty()
  @IsString()
  instagram: string;

  @ApiProperty()
  @IsString()
  tiktok: string;

  @ApiProperty()
  @IsString()
  facebook: string;

  @ApiProperty()
  @IsString()
  whatsapp: string;
}

export class OpeningHourDto {
  @ApiProperty({ example: 'monday' })
  @IsString()
  day: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  open: string;

  @ApiProperty({ example: '18:00' })
  @IsString()
  close: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  closed: boolean;
}

export class UpdateSettingsDto {
  @ApiPropertyOptional({ type: LocalizedStringDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  siteName?: LocalizedStringDto;

  @ApiPropertyOptional({ type: LocalizedStringDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  tagline?: LocalizedStringDto;

  @ApiPropertyOptional({ type: ContactInfoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContactInfoDto)
  contact?: ContactInfoDto;

  @ApiPropertyOptional({ type: SocialLinksDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  social?: SocialLinksDto;

  @ApiPropertyOptional({ type: [OpeningHourDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OpeningHourDto)
  openingHours?: OpeningHourDto[];

  @ApiPropertyOptional({ example: 2023 })
  @IsOptional()
  @IsInt()
  foundedYear?: number;
}
