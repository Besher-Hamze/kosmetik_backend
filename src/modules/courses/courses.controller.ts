import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PublishDto } from '../../common/dto/publish.dto';
import { ReorderDto } from '../../common/dto/reorder.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/create-course.dto';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'Public: published courses sorted by order' })
  findPublished() {
    return this.coursesService.findPublished();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: all courses (paginated)' })
  findAllAdmin(@Query() query: PaginationQueryDto) {
    return this.coursesService.findAllAdmin(query);
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: course by id' })
  findByIdAdmin(@Param('id') id: string) {
    return this.coursesService.findByIdAdmin(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: create course' })
  create(@Body() dto: CreateCourseDto) {
    return this.coursesService.create(dto);
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: bulk order update' })
  reorder(@Body() dto: ReorderDto) {
    return this.coursesService.reorder(dto);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: toggle published state' })
  setPublished(@Param('id') id: string, @Body() dto: PublishDto) {
    return this.coursesService.setPublished(id, dto.isPublished);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: update course' })
  update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: delete course' })
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Public: published course by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.coursesService.findPublishedBySlug(slug);
  }
}
