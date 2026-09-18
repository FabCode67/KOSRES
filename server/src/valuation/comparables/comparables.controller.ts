import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ComparablesService } from './comparables.service';
import { requireRoles } from '../require-roles.util';

@UseGuards(JwtAuthGuard)
@Controller('valuation/comparables')
export class ComparablesController {
  constructor(private service: ComparablesService) {}

  @Get()
  findAll(@Request() req: any, @Query('district') district?: string) {
    requireRoles(req, ['admin', 'valuer', 'technician']);
    return this.service.findAll(district);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    requireRoles(req, ['admin', 'valuer', 'technician']);
    return this.service.findOne(id);
  }

  @Post()
  create(@Request() req: any, @Body() body: any) {
    requireRoles(req, ['admin', 'valuer', 'technician']);
    return this.service.create(body);
  }

  @Get('for-request/:requestId')
  findSelectionsForRequest(@Request() req: any, @Param('requestId') requestId: string) {
    requireRoles(req, ['admin', 'valuer', 'technician']);
    return this.service.findSelectionsForRequest(requestId);
  }

  @Post('for-request/:requestId')
  addSelection(@Request() req: any, @Param('requestId') requestId: string, @Body() body: { comparablePropertyId: string }) {
    requireRoles(req, ['admin', 'valuer']);
    return this.service.addSelection(requestId, body.comparablePropertyId);
  }

  @Patch('selections/:id')
  updateSelection(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    requireRoles(req, ['admin', 'valuer']);
    return this.service.updateSelection(id, body);
  }

  @Delete('selections/:id')
  removeSelection(@Request() req: any, @Param('id') id: string) {
    requireRoles(req, ['admin', 'valuer']);
    return this.service.removeSelection(id);
  }
}
