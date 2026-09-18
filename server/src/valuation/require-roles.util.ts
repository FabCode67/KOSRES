import { ForbiddenException } from '@nestjs/common';

/** Shared role check for valuation-module controllers — mirrors the staff.controller.ts pattern. */
export function requireRoles(req: any, allowed: string[]) {
  if (!allowed.includes(req.user?.role)) {
    throw new ForbiddenException(`Requires one of: ${allowed.join(', ')}`);
  }
}
