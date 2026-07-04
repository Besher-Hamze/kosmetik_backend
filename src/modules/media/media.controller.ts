import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UploadMediaDto } from './dto/upload-media.dto';
import { MediaService } from './media.service';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

@ApiTags('media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'superadmin')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        altDe: { type: 'string' },
        altAr: { type: 'string' },
      },
      required: ['file'],
    },
  })
  @ApiOperation({
    summary:
      'Admin: upload file (max 10MB; images converted to webp + 400px thumbnail)',
  })
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadMediaDto,
  ) {
    return this.mediaService.upload(file, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Admin: list media (paginated, newest first)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.mediaService.findAll(query);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Admin: delete media (removes files from disk)' })
  remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }
}
