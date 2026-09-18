import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalculationRule, CalculationRuleType } from '../entities/calculation-rule.entity';

@Injectable()
export class CalculationRulesService {
  constructor(@InjectRepository(CalculationRule) private repo: Repository<CalculationRule>) {}

  findAll(type?: CalculationRuleType) {
    return this.repo.find({ where: type ? { type } : {}, order: { code: 'ASC', version: 'DESC' } });
  }

  async getActive(type: CalculationRuleType) {
    const rule = await this.repo.findOne({ where: { type, status: 'active' }, order: { version: 'DESC' } });
    if (!rule) throw new NotFoundException(`No active ${type} rule configured`);
    return rule;
  }

  getByCodeVersion(code: string, version: number) {
    return this.repo.findOneOrFail({ where: { code, version } });
  }

  create(data: Partial<CalculationRule>) {
    return this.repo.save(this.repo.create(data));
  }
}
