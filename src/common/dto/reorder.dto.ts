import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsMongoId,
  ValidateNested,
} from 'class-validator';

export class ReorderItemDto {
  @ApiProperty()
  @IsMongoId()
  id: string;

  @ApiProperty()
  @IsInt()
  order: number;
}

export class ReorderDto {
  @ApiProperty({ type: [ReorderItemDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}
