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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ContactService } from './contact.service';
import {
  ContactListQueryDto,
  CreateContactMessageDto,
  MarkReadDto,
} from './dto/contact.dto';

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Public: send a contact message (rate limited)' })
  create(@Body() dto: CreateContactMessageDto) {
    return this.contactService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: list contact messages (paginated)' })
  findAll(@Query() query: ContactListQueryDto) {
    return this.contactService.findAll(query);
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: mark message read/unread' })
  setRead(@Param('id') id: string, @Body() dto: MarkReadDto) {
    return this.contactService.setRead(id, dto.isRead);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: delete contact message' })
  remove(@Param('id') id: string) {
    return this.contactService.remove(id);
  }
}
