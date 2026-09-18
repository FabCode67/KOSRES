import { Controller, Get, Post, Param, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ReportsService } from './reports.service';
import { requireRoles } from '../require-roles.util';

@UseGuards(JwtAuthGuard)
@Controller('valuation/requests/:requestId/report')
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Get()
  async getLatest(@Request() req: any, @Param('requestId') requestId: string) {
    requireRoles(req, ['admin', 'valuer', 'technician']);
    const report = await this.service.getLatest(requestId);
    if (!report) throw new NotFoundException('No report generated yet');
    return report;
  }

  @Post()
  generate(@Request() req: any, @Param('requestId') requestId: string) {
    requireRoles(req, ['admin', 'valuer']);
    return this.service.generate(requestId, req.user.id);
  }
}
