import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partner } from './partner.entity';

export interface CreatePartnerDto {
  name: string;
  logo?: string;
  website?: string;
  description?: string;
  category?: string;
  active?: boolean;
  order?: number;
}

export interface UpdatePartnerDto extends Partial<CreatePartnerDto> {}

@Injectable()
export class PartnersService {
  constructor(
    @InjectRepository(Partner)
    private repo: Repository<Partner>,
  ) {}

  findAll(activeOnly = false): Promise<Partner[]> {
    return this.repo.find({
      where: activeOnly ? { active: true } : {},
      order: { order: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Partner> {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Partner not found');
    return p;
  }

  create(dto: CreatePartnerDto): Promise<Partner> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdatePartnerDto): Promise<Partner> {
    const p = await this.findOne(id);
    Object.assign(p, dto);
    return this.repo.save(p);
  }

  async remove(id: string): Promise<{ ok: boolean }> {
    await this.findOne(id);
    await this.repo.delete(id);
    return { ok: true };
  }
}
