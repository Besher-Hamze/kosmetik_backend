import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ContentService } from './content.service';
import { UpdateContentDto } from './dto/update-content.dto';

@ApiTags('content')
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get(':key')
  @ApiOperation({ summary: 'Public: content document by key' })
  @ApiParam({ name: 'key', enum: ['homepage', 'courses-intro', 'about'] })
  get(@Param('key') key: string) {
    return this.contentService.get(key);
  }

  @Put(':key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: replace content document by key' })
  @ApiParam({ name: 'key', enum: ['homepage', 'courses-intro', 'about'] })
  upsert(@Param('key') key: string, @Body() dto: UpdateContentDto) {
    return this.contentService.upsert(key, dto.data);
  }
}
