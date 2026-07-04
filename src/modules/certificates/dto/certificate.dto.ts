import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { LocalizedStringDto } from '../../../common/dto/localized-string.dto';
import { IsLocalizedOrString } from '../../../common/validators/is-localized-or-string.validator';

export class IssueCertificateDto {
  @ApiPropertyOptional({
    description:
      "Human-friendly unique code (e.g. KK-2026-A7X3F). Auto-generated if omitted.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  code?: string;

  @ApiProperty({ example: 'Beispiel Teilnehmerin' })
  @IsString()
  @MaxLength(200)
  studentName: string;

  @ApiProperty({
    description: 'Plain string or localized { de, ar } object',
    oneOf: [
      { type: 'string' },
      { $ref: '#/components/schemas/LocalizedStringDto' },
    ],
  })
  @IsLocalizedOrString()
  courseName: LocalizedStringDto | string;

  @ApiPropertyOptional({ example: 'permanent-make-up-microblading' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  courseSlug?: string;

  @ApiProperty({ type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  issueDate: Date;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiryDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pdfUrl?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isValid?: boolean;
}

export class UpdateCertificateDto extends PartialType(IssueCertificateDto) {}
