import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceRequest } from './service-request.entity';

export interface CreateServiceRequestDto {
  service: string;
  name: string;
  email?: string;
  contact?: string;
  data: Record<string, string>;
}

@Injectable()
export class ServiceRequestsService {
  constructor(
    @InjectRepository(ServiceRequest)
    private repo: Repository<ServiceRequest>,
  ) {}

  create(dto: CreateServiceRequestDto) {
    const sr = this.repo.create({
      service: dto.service,
      name:    dto.name,
      email:   dto.email,
      contact: dto.contact,
      data:    dto.data,
    });
    return this.repo.save(sr);
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async markRead(id: string) {
    await this.repo.update(id, { read: true });
    return { ok: true };
  }

  async remove(id: string) {
    await this.repo.delete(id);
    return { ok: true };
  }

  async getStats() {
    const total  = await this.repo.count();
    const unread = await this.repo.count({ where: { read: false } });
    return { total, unread };
  }
}
