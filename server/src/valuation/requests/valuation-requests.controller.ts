import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ValuationRequestsService } from './valuation-requests.service';
import { RequestStatus, ValuationPurpose } from '../entities/valuation-request.entity';
import { UserRole } from '../../users/user.entity';
import { requireRoles } from '../require-roles.util';

@UseGuards(JwtAuthGuard)
@Controller('valuation/requests')
export class ValuationRequestsController {
  constructor(private service: ValuationRequestsService) {}

  @Get('assignable-users')
  findUsersByRole(@Request() req: any, @Query('role') role: UserRole) {
    requireRoles(req, ['admin', 'valuer']);
    return this.service.findUsersByRole(role);
  }

  @Post()
  create(@Request() req: any, @Body() body: { purpose: ValuationPurpose; beneficiary?: string; instructor?: string; customerId?: string }) {
    requireRoles(req, ['admin', 'valuer']);
    return this.service.create({ ...body, createdById: req.user.id });
  }

  @Get()
  findAll(@Request() req: any, @Query('status') status?: RequestStatus) {
    requireRoles(req, ['admin', 'valuer', 'technician']);
    return this.service.findAll(status);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    requireRoles(req, ['admin', 'valuer', 'technician']);
    return this.service.findOne(id);
  }

  @Patch(':id/assign')
  assign(@Request() req: any, @Param('id') id: string, @Body() body: { assignedValuerId?: string; assignedTechnicianId?: string }) {
    requireRoles(req, ['admin', 'valuer']);
    return this.service.assign(id, body, req.user.id);
  }

  @Post(':id/fast-track')
  fastTrack(@Request() req: any, @Param('id') id: string) {
    requireRoles(req, ['admin', 'valuer']);
    return this.service.fastTrack(id, req.user.id);
  }

  @Patch(':id/details')
  updateDetails(@Request() req: any, @Param('id') id: string, @Body() body: { beneficiary?: string; instructor?: string }) {
    requireRoles(req, ['admin', 'valuer']);
    return this.service.updateDetails(id, body);
  }

  @Patch(':id/transition')
  transition(@Request() req: any, @Param('id') id: string, @Body() body: { toStatus: RequestStatus; reason?: string }) {
    requireRoles(req, ['admin', 'valuer', 'technician']);
    return this.service.transition(id, body.toStatus, req.user.id, body.reason);
  }

  @Patch(':id/select-engine')
  selectEngine(@Request() req: any, @Param('id') id: string, @Body() body: { engineVersionId: string }) {
    requireRoles(req, ['admin', 'valuer']);
    return this.service.selectEngine(id, body.engineVersionId, req.user.id);
  }

  @Patch(':id/approve')
  approve(@Request() req: any, @Param('id') id: string, @Body() body: { comment?: string; signedName?: string; licenseNumber?: string }) {
    requireRoles(req, ['admin', 'valuer']);
    return this.service.approve(id, req.user.id, body);
  }
}
