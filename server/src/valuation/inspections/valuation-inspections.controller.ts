import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ValuationInspectionsService } from './valuation-inspections.service';
import { requireRoles } from '../require-roles.util';

@UseGuards(JwtAuthGuard)
@Controller('valuation/inspections')
export class ValuationInspectionsController {
  constructor(private service: ValuationInspectionsService) {}

  @Get('mine')
  findMine(@Request() req: any) {
    requireRoles(req, ['technician', 'admin']);
    return this.service.findForTechnician(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    requireRoles(req, ['admin', 'valuer', 'technician']);
    return this.service.findOne(id);
  }

  @Post()
  create(@Request() req: any, @Body() body: { requestId: string; technicianId: string }) {
    requireRoles(req, ['admin', 'valuer']);
    return this.service.create(body.requestId, body.technicianId);
  }

  @Post(':id/notes')
  addNote(@Request() req: any, @Param('id') id: string, @Body() body: { field: string; observation: string }) {
    requireRoles(req, ['admin', 'valuer', 'technician']);
    return this.service.addNote(id, body.field, body.observation, req.user.id);
  }

  @Patch(':id/submit')
  submit(@Request() req: any, @Param('id') id: string, @Body() body: { inspectionDate: string }) {
    requireRoles(req, ['technician', 'admin']);
    return this.service.submit(id, body.inspectionDate);
  }
}
