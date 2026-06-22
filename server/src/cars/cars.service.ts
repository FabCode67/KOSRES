import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindManyOptions } from 'typeorm';
import { Car, CarStatus, CarServiceType, CarFuelType } from './car.entity';

export interface CreateCarDto {
  title: string;
  description: string;
  brand: string;
  model: string;
  year?: number;
  fuelType?: CarFuelType;
  transmission?: string;
  seats?: number;
  mileage?: number;
  color?: string;
  plateNumber?: string;
  serviceType: CarServiceType;
  price: number;
  priceUnit?: string;
  priceFrequency?: string;
  district?: string;
  location?: string;
  images?: string[];
  featured?: boolean;
  status?: CarStatus;
}

export interface UpdateCarDto extends Partial<CreateCarDto> {}

export interface CarQueryDto {
  search?: string;
  serviceType?: string;
  brand?: string;
  district?: string;
  status?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class CarsService {
  constructor(
    @InjectRepository(Car)
    private repo: Repository<Car>,
  ) {}

  async findAll(query: CarQueryDto = {}) {
    const {
      search, serviceType, brand, district,
      featured, page = 1, limit = 12,
    } = query;

    // Allow explicit status override; default to available
    const statusFilter =
      query.status === 'all'
        ? undefined                              // no status filter
        : (query.status as CarStatus) || CarStatus.AVAILABLE;

    const base: Record<string, any> = {};
    if (serviceType) base.serviceType = serviceType as CarServiceType;
    if (brand)       base.brand       = ILike(`%${brand}%`);
    if (district)    base.district    = district;
    if (featured !== undefined) base.featured = featured;
    if (statusFilter) base.status = statusFilter;

    const where = search
      ? [
          { ...base, title: ILike(`%${search}%`) },
          { ...base, brand: ILike(`%${search}%`) },
          { ...base, model: ILike(`%${search}%`) },
        ]
      : base;

    const options: FindManyOptions<Car> = {
      where,
      order: { featured: 'DESC', createdAt: 'DESC' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    };

    const [data, total] = await this.repo.findAndCount(options);
    return {
      data,
      meta: {
        total,
        page:  Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async findFeatured(): Promise<Car[]> {
    return this.repo.find({
      where: { featured: true, status: CarStatus.AVAILABLE },
      order: { createdAt: 'DESC' },
      take: 6,
    });
  }

  async findOne(id: string): Promise<Car> {
    const car = await this.repo.findOne({ where: { id } });
    if (!car) throw new NotFoundException('Car not found');
    return car;
  }

  async create(dto: CreateCarDto): Promise<Car> {
    const car = this.repo.create({
      ...dto,
      images:   dto.images   ?? [],
      fuelType: dto.fuelType  ?? CarFuelType.PETROL,
      status:   dto.status    ?? CarStatus.AVAILABLE,
    });
    return this.repo.save(car);
  }

  async update(id: string, dto: UpdateCarDto): Promise<Car> {
    const car = await this.findOne(id);
    Object.assign(car, dto);
    return this.repo.save(car);
  }

  async remove(id: string): Promise<{ message: string }> {
    const car = await this.findOne(id);
    await this.repo.remove(car);
    return { message: 'Car deleted successfully' };
  }

  async addImages(id: string, urls: string[]): Promise<Car> {
    const car = await this.findOne(id);
    car.images = [...car.images, ...urls];
    return this.repo.save(car);
  }

  async removeImage(id: string, imageUrl: string): Promise<Car> {
    const car = await this.findOne(id);
    car.images = car.images.filter(u => u !== imageUrl);
    return this.repo.save(car);
  }

  async getStats() {
    const total     = await this.repo.count();
    const available = await this.repo.count({ where: { status: CarStatus.AVAILABLE } });
    const featured  = await this.repo.count({ where: { featured: true } });
    const forRent   = await this.repo.count({ where: { serviceType: CarServiceType.RENT } });
    const forSale   = await this.repo.count({ where: { serviceType: CarServiceType.SALE } });
    const taxi      = await this.repo.count({ where: { serviceType: CarServiceType.TAXI } });
    return { total, available, featured, forRent, forSale, taxi };
  }
}
