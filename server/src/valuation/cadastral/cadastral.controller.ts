import { Controller, Get, Query, Request, UseGuards, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Public } from '../../auth/public.decorator';
import { CadastralService } from './cadastral.service';
import { requireRoles } from '../require-roles.util';

@UseGuards(JwtAuthGuard)
@Controller('valuation/cadastral')
export class CadastralController {
  constructor(private service: CadastralService) {}

  @Get('districts')
  coveredDistricts(@Request() req: any) {
    requireRoles(req, ['admin', 'valuer', 'technician']);
    return this.service.coveredDistricts();
  }

  // UPI contains slashes (e.g. "1/02/01/01/4295"), so it's a query param
  // rather than a path segment — avoids any path-matching ambiguity.
  @Get('lookup')
  lookupByUpi(@Request() req: any, @Query('upi') upi: string) {
    requireRoles(req, ['admin', 'valuer', 'technician']);
    if (!upi) throw new BadRequestException('Query param "upi" is required.');
    return this.service.lookupByUpi(upi);
  }

  /**
   * Public, unauthenticated version for the landing-page "try it" widget.
   * Same underlying lookup and the same data (province/district/sector/
   * cell/village/plot area/distance to CBD) -- none of it is sensitive,
   * it's the same class of info Rwanda's own public land portal already
   * shows for any UPI. No rate limiting yet; fine for a beta test with a
   * handful of visitors, worth revisiting before wider traffic.
   */
  @Public()
  @Get('public-lookup')
  publicLookupByUpi(@Query('upi') upi: string) {
    if (!upi) throw new BadRequestException('Query param "upi" is required.');
    return this.service.lookupByUpi(upi);
  }

  @Get('driving-distance')
  drivingDistance(@Request() req: any, @Query('upi') upi: string) {
    requireRoles(req, ['admin', 'valuer', 'technician']);
    if (!upi) throw new BadRequestException('Query param "upi" is required.');
    return this.service.drivingDistanceToCbd(upi);
  }

  /** Public counterpart for the landing-page "try it" widget — separate call so the (potentially slower) routing lookup never blocks the instant straight-line result. */
  @Public()
  @Get('public-driving-distance')
  publicDrivingDistance(@Query('upi') upi: string) {
    if (!upi) throw new BadRequestException('Query param "upi" is required.');
    return this.service.drivingDistanceToCbd(upi);
  }
}
