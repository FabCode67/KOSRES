import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inquiry } from './inquiry.entity';
import { Property } from '../properties/property.entity';
import { CreateInquiryDto } from './inquiry.dto';

@Injectable()
export class InquiriesService {
  constructor(
    @InjectRepository(Inquiry)
    private inquiryRepo: Repository<Inquiry>,
    @InjectRepository(Property)
    private propertyRepo: Repository<Property>,
  ) {}

  async create(propertyId: string, dto: CreateInquiryDto) {
    const property = await this.propertyRepo.findOne({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Property not found');

    const inquiry = this.inquiryRepo.create({ ...dto, property });
    return this.inquiryRepo.save(inquiry);
  }

  async findAll() {
    return this.inquiryRepo.find({
      relations: ['property'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByProperty(propertyId: string) {
    return this.inquiryRepo.find({
      where: { property: { id: propertyId } },
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string) {
    const inquiry = await this.inquiryRepo.findOne({ where: { id } });
    if (!inquiry) throw new NotFoundException();
    await this.inquiryRepo.remove(inquiry);
    return { message: 'Deleted' };
  }
}
