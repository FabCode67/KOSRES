import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindManyOptions } from 'typeorm';
import { Property, PropertyStatus } from './property.entity';
import { CreatePropertyDto, UpdatePropertyDto, PropertyQueryDto } from './property.dto';
import { User } from '../users/user.entity';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertyRepo: Repository<Property>,
  ) {}

  async findAll(query: PropertyQueryDto) {
    const {
      search, offerType, category, district, status,
      featured, page = 1, limit = 12,
    } = query;

    const where: any = {};
    if (offerType) where.offerType = offerType;
    if (category)  where.category  = category;
    if (district)  where.district  = district;
    if (featured !== undefined) where.featured = featured;
    where.status = status || PropertyStatus.ACTIVE;

    const options: FindManyOptions<Property> = {
      where: search
        ? [
            { ...where, title: ILike(`%${search}%`) },
            { ...where, sector: ILike(`%${search}%`) },
            { ...where, propertyType: ILike(`%${search}%`) },
          ]
        : where,
      order: { featured: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['createdBy'],
    };

    const [data, total] = await this.propertyRepo.findAndCount(options);
    return {
      data,
      meta: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const property = await this.propertyRepo.findOne({
      where: { id },
      relations: ['createdBy', 'inquiries'],
    });
    if (!property) throw new NotFoundException('Property not found');
    return property;
  }

  async findFeatured() {
    return this.propertyRepo.find({
      where: { featured: true, status: PropertyStatus.ACTIVE },
      order: { createdAt: 'DESC' },
      take: 6,
    });
  }

  async create(dto: CreatePropertyDto, user: User) {
    const property = this.propertyRepo.create({ ...dto, createdBy: user });
    return this.propertyRepo.save(property);
  }

  async update(id: string, dto: UpdatePropertyDto) {
    const property = await this.findOne(id);
    Object.assign(property, dto);
    return this.propertyRepo.save(property);
  }

  async remove(id: string) {
    const property = await this.findOne(id);
    await this.propertyRepo.remove(property);
    return { message: 'Property deleted successfully' };
  }

  async addImages(id: string, imageUrls: string[]) {
    const property = await this.findOne(id);
    property.images = [...property.images, ...imageUrls];
    return this.propertyRepo.save(property);
  }

  async removeImage(id: string, imageUrl: string) {
    const property = await this.findOne(id);
    property.images = property.images.filter((img) => img !== imageUrl);
    return this.propertyRepo.save(property);
  }

  async getStats() {
    const total     = await this.propertyRepo.count();
    const active    = await this.propertyRepo.count({ where: { status: PropertyStatus.ACTIVE } });
    const featured  = await this.propertyRepo.count({ where: { featured: true } });
    const forSale   = await this.propertyRepo.count({ where: { offerType: 'sale' as any } });
    const forRent   = await this.propertyRepo.count({ where: { offerType: 'rent' as any } });
    const shortStay = await this.propertyRepo.count({ where: { offerType: 'short_stay' as any } });
    return { total, active, featured, forSale, forRent, shortStay };
  }
}
