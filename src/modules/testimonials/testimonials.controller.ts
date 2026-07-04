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
import { Throttle } from '@nestjs/throttler';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  ApproveTestimonialDto,
  CreateTestimonialDto,
  SubmitTestimonialDto,
  UpdateTestimonialDto,
} from './dto/testimonial.dto';
import { TestimonialsService } from './testimonials.service';

@ApiTags('testimonials')
@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Get()
  @ApiOperation({ summary: 'Public: approved testimonials' })
  findApproved() {
    return this.testimonialsService.findApproved();
  }

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Public: submit a testimonial (goes into moderation queue)',
  })
  submit(@Body() dto: SubmitTestimonialDto) {
    return this.testimonialsService.submitPublic(dto);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: all testimonials (paginated)' })
  findAllAdmin(@Query() query: PaginationQueryDto) {
    return this.testimonialsService.findAllAdmin(query);
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: create testimonial' })
  create(@Body() dto: CreateTestimonialDto) {
    return this.testimonialsService.create(dto);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: approve / unapprove testimonial' })
  approve(@Param('id') id: string, @Body() dto: ApproveTestimonialDto) {
    return this.testimonialsService.setApproved(id, dto.isApproved);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: update testimonial' })
  update(@Param('id') id: string, @Body() dto: UpdateTestimonialDto) {
    return this.testimonialsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: delete testimonial' })
  remove(@Param('id') id: string) {
    return this.testimonialsService.remove(id);
  }
}
