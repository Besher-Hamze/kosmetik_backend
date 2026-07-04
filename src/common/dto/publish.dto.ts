import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class PublishDto {
  @ApiProperty()
  @IsBoolean()
  isPublished: boolean;
}
