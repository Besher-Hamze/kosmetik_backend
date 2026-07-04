import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UpdateNavigationDto } from './dto/update-navigation.dto';
import { NavigationService } from './navigation.service';

@ApiTags('navigation')
@Controller('navigation')
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Get()
  @ApiOperation({ summary: 'Public: navigation menus' })
  get() {
    return this.navigationService.get();
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: update navigation menus' })
  upsert(@Body() dto: UpdateNavigationDto) {
    return this.navigationService.upsert(dto);
  }
}
