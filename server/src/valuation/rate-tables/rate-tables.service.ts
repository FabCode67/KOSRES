import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RateTable, RateTableEntry, RateTableType } from '../entities/rate-table.entity';
import { PropertyCategory } from '../entities/valuation-property.entity';

@Injectable()
export class RateTablesService {
  constructor(
    @InjectRepository(RateTable) private rateTableRepo: Repository<RateTable>,
    @InjectRepository(RateTableEntry) private entryRepo: Repository<RateTableEntry>,
  ) {}

  findAll(type?: RateTableType) {
    return this.rateTableRepo.find({
      where: type ? { type } : {},
      relations: ['entries'],
      order: { name: 'ASC', version: 'DESC' },
    });
  }

  findOne(id: string) {
    return this.rateTableRepo.findOneOrFail({ where: { id }, relations: ['entries'] });
  }

  async create(data: { type: RateTableType; name: string; version: number; source?: string; entries: Partial<RateTableEntry>[] }) {
    const table = this.rateTableRepo.create({
      type: data.type, name: data.name, version: data.version, source: data.source,
    });
    const saved = await this.rateTableRepo.save(table);
    const entries = this.entryRepo.create(data.entries.map((e) => ({ ...e, rateTable: saved })));
    await this.entryRepo.save(entries);
    return this.findOne(saved.id);
  }

  /** Suggested (not forced) land rate for a district/category — the valuer may still override it. */
  suggestLandRate(params: { district?: string; propertyCategory?: PropertyCategory }) {
    return this.entryRepo.findOne({
      where: {
        rateTable: { type: RateTableType.LAND, status: 'active' },
        district: params.district,
        propertyCategory: params.propertyCategory,
      },
      relations: ['rateTable'],
      order: { rateTable: { version: 'DESC' } },
    });
  }

  suggestComponentRate(type: RateTableType.BUILDING_COMPONENT | RateTableType.EXTERNAL_WORK, key: string) {
    return this.entryRepo.findOne({
      where: { key, rateTable: { type, status: 'active' } },
      relations: ['rateTable'],
      order: { rateTable: { version: 'DESC' } },
    });
  }
}
