import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { ReorderDto } from '../../common/dto/reorder.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateAlbumDto, UpdateAlbumDto } from './dto/album.dto';
import { GalleryService } from './gallery.service';

@ApiTags('gallery')
@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get()
  @ApiOperation({ summary: 'Public: all albums sorted by order' })
  findAll() {
    return this.galleryService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: create album' })
  create(@Body() dto: CreateAlbumDto) {
    return this.galleryService.create(dto);
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: bulk album order update' })
  reorder(@Body() dto: ReorderDto) {
    return this.galleryService.reorder(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: update album (incl. images array)' })
  update(@Param('id') id: string, @Body() dto: UpdateAlbumDto) {
    return this.galleryService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: delete album' })
  remove(@Param('id') id: string) {
    return this.galleryService.remove(id);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Public: album by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.galleryService.findBySlug(slug);
  }
}
