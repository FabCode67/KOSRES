import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RateTablesService } from './rate-tables.service';
import { RateTableType } from '../entities/rate-table.entity';
import { PropertyCategory } from '../entities/valuation-property.entity';
import { requireRoles } from '../require-roles.util';

@UseGuards(JwtAuthGuard)
@Controller('valuation/rate-tables')
export class RateTablesController {
  constructor(private service: RateTablesService) {}

  @Get()
  findAll(@Request() req: any, @Query('type') type?: RateTableType) {
    requireRoles(req, ['admin', 'valuer', 'technician']);
    return this.service.findAll(type);
  }

  @Get('suggest/land')
  suggestLand(@Request() req: any, @Query('district') district?: string, @Query('propertyCategory') propertyCategory?: PropertyCategory) {
    requireRoles(req, ['admin', 'valuer', 'technician']);
    return this.service.suggestLandRate({ district, propertyCategory });
  }

  @Get('suggest/:type/:key')
  suggestComponent(
    @Request() req: any,
    @Param('type') type: RateTableType.BUILDING_COMPONENT | RateTableType.EXTERNAL_WORK,
    @Param('key') key: string,
  ) {
    requireRoles(req, ['admin', 'valuer', 'technician']);
    return this.service.suggestComponentRate(type, key);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    requireRoles(req, ['admin']);
    return this.service.findOne(id);
  }

  @Post()
  create(@Request() req: any, @Body() body: any) {
    requireRoles(req, ['admin']);
    return this.service.create(body);
  }
}
