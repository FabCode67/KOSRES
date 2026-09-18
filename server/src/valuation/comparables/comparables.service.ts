import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComparableProperty, ComparableTransaction } from '../entities/comparable-property.entity';
import { ComparableSelection } from '../entities/comparable-selection.entity';

@Injectable()
export class ComparablesService {
  constructor(
    @InjectRepository(ComparableProperty) private propertyRepo: Repository<ComparableProperty>,
    @InjectRepository(ComparableTransaction) private transactionRepo: Repository<ComparableTransaction>,
    @InjectRepository(ComparableSelection) private selectionRepo: Repository<ComparableSelection>,
  ) {}

  findAll(district?: string) {
    return this.propertyRepo.find({
      where: district ? { district } : {},
      relations: ['transactions'],
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }

  async findOne(id: string) {
    const comparable = await this.propertyRepo.findOne({ where: { id }, relations: ['transactions'] });
    if (!comparable) throw new NotFoundException('Comparable property not found');
    return comparable;
  }

  async create(data: Partial<ComparableProperty> & { transaction?: { transactionDate: string; price: number; pricePerSqm?: number; evidenceUrl?: string } }) {
    const { transaction, ...propData } = data;
    const saved = await this.propertyRepo.save(this.propertyRepo.create(propData));
    if (transaction) {
      await this.transactionRepo.save(this.transactionRepo.create({ ...transaction, comparablePropertyId: saved.id }));
    }
    return this.findOne(saved.id);
  }

  // ── Selections (per valuation request) ──
  findSelectionsForRequest(requestId: string) {
    return this.selectionRepo.find({
      where: { request: { id: requestId } },
      relations: ['comparableProperty', 'comparableProperty.transactions'],
      order: { createdAt: 'ASC' },
    });
  }

  addSelection(requestId: string, comparablePropertyId: string) {
    return this.selectionRepo.save(this.selectionRepo.create({
      request: { id: requestId } as any,
      comparableProperty: { id: comparablePropertyId } as any,
      included: true,
    }));
  }

  async updateSelection(id: string, data: { included?: boolean; adjustments?: any[]; valuerComment?: string }) {
    await this.selectionRepo.update(id, data);
    return this.selectionRepo.findOneOrFail({ where: { id }, relations: ['comparableProperty', 'comparableProperty.transactions'] });
  }

  removeSelection(id: string) {
    return this.selectionRepo.delete(id);
  }
}
