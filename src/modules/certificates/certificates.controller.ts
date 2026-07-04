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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CertificatesService } from './certificates.service';
import {
  IssueCertificateDto,
  UpdateCertificateDto,
} from './dto/certificate.dto';

@ApiTags('certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get('verify/:code')
  @ApiOperation({
    summary:
      'Public: verify a certificate code — returns { valid: false } instead of 404',
  })
  verify(@Param('code') code: string) {
    return this.certificatesService.verify(code);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: issue a certificate (code auto-generated if omitted)' })
  issue(@Body() dto: IssueCertificateDto) {
    return this.certificatesService.issue(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: list certificates (paginated)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.certificatesService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: certificate by id' })
  findOne(@Param('id') id: string) {
    return this.certificatesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: update certificate (e.g. invalidate)' })
  update(@Param('id') id: string, @Body() dto: UpdateCertificateDto) {
    return this.certificatesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: delete certificate' })
  remove(@Param('id') id: string) {
    return this.certificatesService.remove(id);
  }
}
