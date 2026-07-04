import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class UpdateContentDto {
  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    description: 'Arbitrary content payload for this key',
  })
  @IsObject()
  data: Record<string, unknown>;
}
