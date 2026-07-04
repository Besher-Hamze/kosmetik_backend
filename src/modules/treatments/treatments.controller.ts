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
import {
  CreateTreatmentDto,
  UpdateTreatmentDto,
} from './dto/create-treatment.dto';
import { TreatmentsService } from './treatments.service';

@ApiTags('treatments')
@Controller('treatments')
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Public: published treatments sorted by order' })
  findPublished() {
    return this.treatmentsService.findPublished();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: all treatments (paginated)' })
  findAllAdmin(@Query() query: PaginationQueryDto) {
    return this.treatmentsService.findAllAdmin(query);
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: treatment by id' })
  findByIdAdmin(@Param('id') id: string) {
    return this.treatmentsService.findByIdAdmin(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: create treatment' })
  create(@Body() dto: CreateTreatmentDto) {
    return this.treatmentsService.create(dto);
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: bulk order update' })
  reorder(@Body() dto: ReorderDto) {
    return this.treatmentsService.reorder(dto);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: toggle published state' })
  setPublished(@Param('id') id: string, @Body() dto: PublishDto) {
    return this.treatmentsService.setPublished(id, dto.isPublished);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: update treatment' })
  update(@Param('id') id: string, @Body() dto: UpdateTreatmentDto) {
    return this.treatmentsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: delete treatment' })
  remove(@Param('id') id: string) {
    return this.treatmentsService.remove(id);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Public: published treatment by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.treatmentsService.findPublishedBySlug(slug);
  }
}
