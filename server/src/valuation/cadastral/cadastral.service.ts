import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CadastralParcel } from '../entities/cadastral-parcel.entity';
import { distanceToCbdKm, CBD_REFERENCE } from './cbd-distance.util';
import { drivingDistanceKm } from './driving-distance.util';

@Injectable()
export class CadastralService {
  constructor(
    @InjectRepository(CadastralParcel) private repo: Repository<CadastralParcel>,
  ) {}

  /**
   * Look up a parcel by its exact UPI (e.g. "1/02/01/01/4295") in the
   * imported cadastral survey data. Returns the parcel's real attributes
   * plus a live-computed distance to the CBD reference point — the
   * distance is never stored, so changing CBD_REFERENCE later doesn't
   * require touching any data.
   *
   * This is exact-match only, by design: a UPI is a precise identifier,
   * not a fuzzy address, so a "close but not exact" match would be
   * actively misleading (wrong parcel entirely, not an approximation of
   * the right one).
   */
  async lookupByUpi(upi: string) {
    const parcel = await this.repo.findOne({ where: { upi: upi.trim() } });
    if (!parcel) {
      throw new NotFoundException(
        `No cadastral record found for UPI "${upi}". Either it hasn't been imported yet ` +
        `(only districts we've loaded are searchable) or the UPI doesn't match exactly.`,
      );
    }

    const hasCoords = parcel.latitude != null && parcel.longitude != null;

    return {
      upi: parcel.upi,
      province: parcel.province,
      district: parcel.district,
      sector: parcel.sector,
      cell: parcel.cell,
      village: parcel.village,
      plotAreaSqm: parcel.plotAreaSqm != null ? Number(parcel.plotAreaSqm) : null,
      latitude: parcel.latitude != null ? Number(parcel.latitude) : null,
      longitude: parcel.longitude != null ? Number(parcel.longitude) : null,
      distanceToCbdKm: hasCoords
        ? Math.round(distanceToCbdKm(Number(parcel.latitude), Number(parcel.longitude)) * 100) / 100
        : null,
      cbdReference: CBD_REFERENCE,
      distanceNote: 'Straight-line distance, not driving distance.',
      source: parcel.sourceFile,
    };
  }

  /**
   * Real driving distance/time from a parcel's coordinates to the CBD,
   * via OSRM's free public routing demo (see driving-distance.util.ts).
   * Kept as a separate call from lookupByUpi so a slow/unavailable
   * routing server never blocks the core (instant, dependency-free)
   * straight-line lookup.
   */
  async drivingDistanceToCbd(upi: string) {
    const parcel = await this.repo.findOne({ where: { upi: upi.trim() } });
    if (!parcel) {
      throw new NotFoundException(
        `No cadastral record found for UPI "${upi}". Either it hasn't been imported yet ` +
        `(only districts we've loaded are searchable) or the UPI doesn't match exactly.`,
      );
    }
    if (parcel.latitude == null || parcel.longitude == null) {
      return { upi: parcel.upi, drivingDistanceKm: null, drivingDurationMin: null, available: false };
    }

    const route = await drivingDistanceKm(
      Number(parcel.latitude),
      Number(parcel.longitude),
      CBD_REFERENCE.lat,
      CBD_REFERENCE.lng,
    );

    return {
      upi: parcel.upi,
      drivingDistanceKm: route?.drivingDistanceKm ?? null,
      drivingDurationMin: route?.drivingDurationMin ?? null,
      available: route != null,
      note: route
        ? 'Real driving route via OSRM public routing (free demo server — for testing).'
        : 'Driving route currently unavailable; try again shortly.',
    };
  }

  /** Which districts currently have importable/searchable data — useful for the frontend to grey out UPI lookup where we have no coverage yet. */
  async coveredDistricts(): Promise<string[]> {
    const rows = await this.repo
      .createQueryBuilder('p')
      .select('DISTINCT p.district', 'district')
      .where('p.district IS NOT NULL')
      .orderBy('p.district', 'ASC')
      .getRawMany();
    return rows.map((r) => r.district);
  }
}
