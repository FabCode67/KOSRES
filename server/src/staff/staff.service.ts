import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from './staff.entity';

export interface CreateStaffDto {
  name: string;
  position: string;
  department?: string;
  photo?: string;
  bio?: string;
  email?: string;
  phone?: string;
  active?: boolean;
  order?: number;
}

export interface UpdateStaffDto extends Partial<CreateStaffDto> {}

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private repo: Repository<Staff>,
  ) {}

  findAll(activeOnly = false): Promise<Staff[]> {
    return this.repo.find({
      where: activeOnly ? { active: true } : {},
      order: { order: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Staff> {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Staff member not found');
    return s;
  }

  create(dto: CreateStaffDto): Promise<Staff> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateStaffDto): Promise<Staff> {
    const s = await this.findOne(id);
    Object.assign(s, dto);
    return this.repo.save(s);
  }

  async remove(id: string): Promise<{ ok: boolean }> {
    await this.findOne(id);
    await this.repo.delete(id);
    return { ok: true };
  }
}
