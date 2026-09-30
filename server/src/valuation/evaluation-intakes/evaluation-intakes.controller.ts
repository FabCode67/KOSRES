import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Public } from '../../auth/public.decorator';
import { EvaluationIntakesService, CreateEvaluationIntakeDto } from './evaluation-intakes.service';
import { EvaluationIntakeStatus } from '../entities/evaluation-intake.entity';
import { requireRoles } from '../require-roles.util';

@UseGuards(JwtAuthGuard)
@Controller('valuation/evaluation-intakes')
export class EvaluationIntakesController {
  constructor(private service: EvaluationIntakesService) {}

  /**
   * Public: the landing-page "Request a Valuation" form submits here.
   * No auth -- same trust level as the existing public service-requests
   * and public cadastral lookup endpoints.
   */
  @Public()
  @Post()
  create(@Body() dto: CreateEvaluationIntakeDto) {
    return this.service.create(dto);
  }

  // Admin-only for now, per instruction -- widen to valuer once the
  // review workflow for this queue is settled.
  @Get()
  findAll(@Request() req: any, @Query('status') status?: EvaluationIntakeStatus) {
    requireRoles(req, ['admin']);
    return this.service.findAll(status);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    requireRoles(req, ['admin']);
    return this.service.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Request() req: any, @Param('id') id: string, @Body() body: { status: EvaluationIntakeStatus; adminNotes?: string }) {
    requireRoles(req, ['admin']);
    if (!body.status) throw new BadRequestException('status is required.');
    return this.service.updateStatus(id, body, req.user.id);
  }

  @Post(':id/convert')
  convert(@Request() req: any, @Param('id') id: string) {
    requireRoles(req, ['admin']);
    return this.service.convertToRequest(id, req.user.id);
  }
}
