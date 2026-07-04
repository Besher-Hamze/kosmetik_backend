import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LocalizedStringDto {
  @ApiProperty({ example: 'Deutscher Text' })
  @IsString()
  de: string;

  @ApiProperty({ example: 'نص عربي' })
  @IsString()
  ar: string;
}
