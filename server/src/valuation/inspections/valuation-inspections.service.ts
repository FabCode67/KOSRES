import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ValuationInspection, ValuationInspectionNote } from '../entities/valuation-inspection.entity';

@Injectable()
export class ValuationInspectionsService {
  constructor(
    @InjectRepository(ValuationInspection) private repo: Repository<ValuationInspection>,
    @InjectRepository(ValuationInspectionNote) private noteRepo: Repository<ValuationInspectionNote>,
  ) {}

  findForTechnician(technicianId: string) {
    return this.repo.find({
      where: { technician: { id: technicianId } },
      relations: ['request', 'request.property', 'notes'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const inspection = await this.repo.findOne({ where: { id }, relations: ['request', 'request.property', 'notes'] });
    if (!inspection) throw new NotFoundException('Inspection not found');
    return inspection;
  }

  create(requestId: string, technicianId: string) {
    return this.repo.save(this.repo.create({
      request: { id: requestId } as any,
      technician: { id: technicianId } as any,
      status: 'assigned',
    }));
  }

  addNote(inspectionId: string, field: string, observation: string, authorId: string) {
    return this.noteRepo.save(this.noteRepo.create({ inspection: { id: inspectionId } as any, field, observation, authorId }));
  }

  async submit(id: string, inspectionDate: string) {
    await this.findOne(id);
    await this.repo.update(id, { status: 'submitted', inspectionDate: new Date(inspectionDate) });
    return this.findOne(id);
  }
}
