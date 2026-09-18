import { Controller, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ValuationCalculationsService } from './valuation-calculations.service';
import { requireRoles } from '../require-roles.util';

@UseGuards(JwtAuthGuard)
@Controller('valuation/calculations')
export class ValuationCalculationsController {
  constructor(private service: ValuationCalculationsService) {}

  @Post('cost-approach')
  runCostApproach(@Request() req: any, @Body() body: any) {
    requireRoles(req, ['admin', 'valuer']);
    return this.service.runCostApproach(body, req.user.id);
  }

  @Post('sales-comparison')
  runSalesComparison(@Request() req: any, @Body() body: any) {
    requireRoles(req, ['admin', 'valuer']);
    return this.service.runSalesComparison(body, req.user.id);
  }

  @Post('income-approach')
  runIncomeApproach(@Request() req: any, @Body() body: any) {
    requireRoles(req, ['admin', 'valuer']);
    return this.service.runIncomeApproach(body, req.user.id);
  }

  @Post('avs')
  runAvs(@Request() req: any, @Body() body: any) {
    requireRoles(req, ['admin', 'valuer']);
    return this.service.runAvs(body, req.user.id);
  }

  @Post('results/:resultId/adjustments')
  addAdjustment(@Request() req: any, @Param('resultId') resultId: string, @Body() body: { newValue: number; reason: string }) {
    requireRoles(req, ['admin', 'valuer']);
    return this.service.addAdjustment(resultId, body, req.user.id);
  }
}
