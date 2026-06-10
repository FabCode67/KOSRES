import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ServiceRequestsService, CreateServiceRequestDto } from './service-requests.service';

@ApiTags('service-requests')
@Controller('service-requests')
export class ServiceRequestsController {
  constructor(private svc: ServiceRequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a service request (public)' })
  create(@Body() dto: CreateServiceRequestDto) {
    return this.svc.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all service requests (admin)' })
  findAll() {
    return this.svc.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Count total + unread' })
  stats() {
    return this.svc.getStats();
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark as read' })
  markRead(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.markRead(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a service request' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.remove(id);
  }
}
