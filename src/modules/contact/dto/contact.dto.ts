import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class CreateContactMessageDto {
  @ApiProperty()
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(5000)
  message: string;

  @ApiPropertyOptional({ default: 'de' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  locale?: string;
}

export class MarkReadDto {
  @ApiProperty()
  @IsBoolean()
  isRead: boolean;
}

export class ContactListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by read state' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isRead?: boolean;
}
