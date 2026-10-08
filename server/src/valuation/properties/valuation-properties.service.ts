import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ValuationProperty } from '../entities/valuation-property.entity';
import { ValuationPropertyLocation, ValuationPropertyLand } from '../entities/valuation-property-details.entity';
import { ValuationPropertyBuilding } from '../entities/valuation-property-building.entity';
import { ValuationExternalWork } from '../entities/valuation-external-work.entity';
import { ValuationPropertyImage, ValuationPropertyDocument } from '../entities/valuation-property-media.entity';
import { ValuationPropertyService, ValuationPropertyAmenity } from '../entities/valuation-property-service.entity';

const RELATIONS = ['location', 'land', 'buildings', 'externalWorks', 'services', 'amenities', 'images', 'documents'];

@Injectable()
export class ValuationPropertiesService {
  constructor(
    @InjectRepository(ValuationProperty) private propertyRepo: Repository<ValuationProperty>,
    @InjectRepository(ValuationPropertyLocation) private locationRepo: Repository<ValuationPropertyLocation>,
    @InjectRepository(ValuationPropertyLand) private landRepo: Repository<ValuationPropertyLand>,
    @InjectRepository(ValuationPropertyBuilding) private buildingRepo: Repository<ValuationPropertyBuilding>,
    @InjectRepository(ValuationExternalWork) private workRepo: Repository<ValuationExternalWork>,
    @InjectRepository(ValuationPropertyImage) private imageRepo: Repository<ValuationPropertyImage>,
    @InjectRepository(ValuationPropertyDocument) private documentRepo: Repository<ValuationPropertyDocument>,
    @InjectRepository(ValuationPropertyService) private serviceRepo: Repository<ValuationPropertyService>,
    @InjectRepository(ValuationPropertyAmenity) private amenityRepo: Repository<ValuationPropertyAmenity>,
  ) {}

  findByRequest(requestId: string) {
    return this.propertyRepo.findOne({ where: { request: { id: requestId } }, relations: RELATIONS });
  }

  async findOne(id: string) {
    const property = await this.propertyRepo.findOne({ where: { id }, relations: RELATIONS });
    if (!property) throw new NotFoundException('Property not found');
    return property;
  }

  create(requestId: string, data: Partial<ValuationProperty>) {
    const property = this.propertyRepo.create({ ...data, request: { id: requestId } as any });
    return this.propertyRepo.save(property);
  }

  async update(id: string, data: Partial<ValuationProperty>) {
    await this.findOne(id);
    await this.propertyRepo.update(id, data);
    return this.findOne(id);
  }

  async upsertLocation(propertyId: string, data: Partial<ValuationPropertyLocation>) {
    const existing = await this.locationRepo.findOne({ where: { property: { id: propertyId } } });
    if (existing) {
      await this.locationRepo.update(existing.id, data);
      return this.locationRepo.findOneOrFail({ where: { id: existing.id } });
    }
    return this.locationRepo.save(this.locationRepo.create({ ...data, property: { id: propertyId } as any }));
  }

  async upsertLand(propertyId: string, data: Partial<ValuationPropertyLand>) {
    const existing = await this.landRepo.findOne({ where: { property: { id: propertyId } } });
    if (existing) {
      await this.landRepo.update(existing.id, data);
      return this.landRepo.findOneOrFail({ where: { id: existing.id } });
    }
    return this.landRepo.save(this.landRepo.create({ ...data, property: { id: propertyId } as any }));
  }

  addBuilding(propertyId: string, data: Partial<ValuationPropertyBuilding>) {
    return this.buildingRepo.save(this.buildingRepo.create({ ...data, property: { id: propertyId } as any }));
  }

  async updateBuilding(propertyId: string, buildingId: string, data: Partial<ValuationPropertyBuilding>) {
    const existing = await this.buildingRepo.findOne({ where: { id: buildingId, property: { id: propertyId } } });
    if (!existing) throw new NotFoundException('Building not found');
    const { id: _id, property: _p, ...patch } = data as any;
    await this.buildingRepo.update(buildingId, patch);
    return this.buildingRepo.findOneOrFail({ where: { id: buildingId } });
  }

  async removeBuilding(propertyId: string, buildingId: string) {
    const existing = await this.buildingRepo.findOne({ where: { id: buildingId, property: { id: propertyId } } });
    if (!existing) throw new NotFoundException('Building not found');
    await this.buildingRepo.delete(buildingId);
    return { deleted: true };
  }

  addExternalWork(propertyId: string, data: Partial<ValuationExternalWork>) {
    return this.workRepo.save(this.workRepo.create({ ...data, property: { id: propertyId } as any }));
  }

  addImage(propertyId: string, url: string, category?: string, description?: string, uploadedById?: string) {
    return this.imageRepo.save(this.imageRepo.create({ property: { id: propertyId } as any, url, category, description, uploadedById }));
  }

  addDocument(propertyId: string, type: string, url: string, uploadedById?: string) {
    return this.documentRepo.save(this.documentRepo.create({ property: { id: propertyId } as any, type, url, uploadedById }));
  }

  addService(propertyId: string, data: Partial<ValuationPropertyService>) {
    return this.serviceRepo.save(this.serviceRepo.create({ ...data, property: { id: propertyId } as any }));
  }

  addAmenity(propertyId: string, data: Partial<ValuationPropertyAmenity>) {
    return this.amenityRepo.save(this.amenityRepo.create({ ...data, property: { id: propertyId } as any }));
  }
}
