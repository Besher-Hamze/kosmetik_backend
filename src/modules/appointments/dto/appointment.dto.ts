import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import type {
  AppointmentStatus,
  AppointmentType,
} from '../schemas/appointment.schema';

export class CreateAppointmentDto {
  @ApiProperty()
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiProperty({ example: '+4917612345678' })
  @IsString()
  @MaxLength(30)
  phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ enum: ['treatment', 'course'] })
  @IsIn(['treatment', 'course'])
  type: AppointmentType;

  @ApiProperty({ example: 'microneedling' })
  @IsString()
  @MaxLength(100)
  serviceSlug: string;

  @ApiProperty({ example: 'Microneedling' })
  @IsString()
  @MaxLength(200)
  serviceName: string;

  @ApiProperty({ type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  preferredDate: Date;

  @ApiPropertyOptional({ example: '14:00' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  preferredTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;

  @ApiPropertyOptional({ default: 'de', example: 'de' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  locale?: string;
}

export class UpdateAppointmentDto {
  @ApiPropertyOptional({
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
  })
  @IsOptional()
  @IsIn(['pending', 'confirmed', 'completed', 'cancelled'])
  status?: AppointmentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  adminNote?: string;
}

export class AppointmentListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
  })
  @IsOptional()
  @IsIn(['pending', 'confirmed', 'completed', 'cancelled'])
  status?: AppointmentStatus;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from?: Date;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to?: Date;
}
