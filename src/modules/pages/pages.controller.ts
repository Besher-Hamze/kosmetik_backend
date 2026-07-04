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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreatePageDto, UpdatePageDto } from './dto/create-page.dto';
import { PagesService } from './pages.service';

@ApiTags('pages')
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  @ApiOperation({ summary: 'Public: all pages' })
  findAll() {
    return this.pagesService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: create page' })
  create(@Body() dto: CreatePageDto) {
    return this.pagesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: update page' })
  update(@Param('id') id: string, @Body() dto: UpdatePageDto) {
    return this.pagesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: delete page' })
  remove(@Param('id') id: string) {
    return this.pagesService.remove(id);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Public: page by slug (e.g. datenschutz, agb)' })
  findBySlug(@Param('slug') slug: string) {
    return this.pagesService.findBySlug(slug);
  }
}
