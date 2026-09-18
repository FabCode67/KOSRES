import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ValuationEngineDefinition, ValuationEngineVersion } from '../entities/valuation-engine.entity';

@Injectable()
export class EngineDefinitionsService {
  constructor(
    @InjectRepository(ValuationEngineDefinition) private engineRepo: Repository<ValuationEngineDefinition>,
    @InjectRepository(ValuationEngineVersion) private versionRepo: Repository<ValuationEngineVersion>,
  ) {}

  findAll() {
    return this.engineRepo.find({ relations: ['versions'] });
  }

  /** The active version for an engine code — what the frontend/orchestration should use by default. */
  async getActiveVersion(code: string) {
    return this.versionRepo.findOneOrFail({
      where: { engine: { code }, status: 'active' },
      relations: ['engine'],
      order: { version: 'DESC' },
    });
  }
}
