import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CalculationRulesService } from './calculation-rules.service';
import { CalculationRuleType } from '../entities/calculation-rule.entity';
import { requireRoles } from '../require-roles.util';

@UseGuards(JwtAuthGuard)
@Controller('valuation/calculation-rules')
export class CalculationRulesController {
  constructor(private service: CalculationRulesService) {}

  @Get()
  findAll(@Request() req: any, @Query('type') type?: CalculationRuleType) {
    requireRoles(req, ['admin', 'valuer']);
    return this.service.findAll(type);
  }

  @Get('active')
  getActive(@Request() req: any, @Query('type') type: CalculationRuleType) {
    requireRoles(req, ['admin', 'valuer']);
    return this.service.getActive(type);
  }

  @Post()
  create(@Request() req: any, @Body() body: any) {
    requireRoles(req, ['admin']);
    return this.service.create(body);
  }
}
