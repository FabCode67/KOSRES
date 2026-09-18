import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { EngineDefinitionsService } from './engine-definitions.service';
import { requireRoles } from '../require-roles.util';

@UseGuards(JwtAuthGuard)
@Controller('valuation/engines')
export class EngineDefinitionsController {
  constructor(private service: EngineDefinitionsService) {}

  @Get()
  findAll(@Request() req: any) {
    requireRoles(req, ['admin', 'valuer', 'technician']);
    return this.service.findAll();
  }

  @Get(':code/active-version')
  getActiveVersion(@Request() req: any, @Param('code') code: string) {
    requireRoles(req, ['admin', 'valuer', 'technician']);
    return this.service.getActiveVersion(code);
  }
}
