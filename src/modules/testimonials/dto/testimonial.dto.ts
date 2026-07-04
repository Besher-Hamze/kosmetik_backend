import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { LocalizedStringDto } from '../../../common/dto/localized-string.dto';
import { IsLocalizedOrString } from '../../../common/validators/is-localized-or-string.validator';
import type { TestimonialSource } from '../schemas/testimonial.schema';

/** Public submission — always created with isApproved=false, source=website. */
export class SubmitTestimonialDto {
  @ApiProperty()
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiProperty({ description: 'Plain text review' })
  @IsString()
  @MaxLength(2000)
  text: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;
}

export class CreateTestimonialDto {
  @ApiProperty()
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiProperty({
    description: 'Plain string or localized { de, ar } object',
    oneOf: [
      { type: 'string' },
      { $ref: '#/components/schemas/LocalizedStringDto' },
    ],
  })
  @IsLocalizedOrString()
  text: LocalizedStringDto | string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ enum: ['google', 'website'], default: 'website' })
  @IsOptional()
  @IsIn(['google', 'website'])
  source?: TestimonialSource;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  order?: number;
}

export class UpdateTestimonialDto extends PartialType(CreateTestimonialDto) {}

export class ApproveTestimonialDto {
  @ApiProperty()
  @IsBoolean()
  isApproved: boolean;
}
