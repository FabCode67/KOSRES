import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum CarServiceType {
  RENT = 'rent',
  SALE = 'sale',
  TAXI = 'taxi',
}

export enum CarStatus {
  AVAILABLE = 'available',
  RENTED    = 'rented',
  SOLD      = 'sold',
  INACTIVE  = 'inactive',
}

export enum CarFuelType {
  PETROL   = 'petrol',
  DIESEL   = 'diesel',
  HYBRID   = 'hybrid',
  ELECTRIC = 'electric',
}

@Entity('cars')
export class Car {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 300 })
  title: string;

  @Column('text')
  description: string;

  @Column({ length: 100 })
  brand: string;

  @Column({ length: 100 })
  model: string;

  @Column({ nullable: true })
  year: number;

  // DB column is fuel_type (snake_case from migration)
  @Column({ name: 'fuel_type', type: 'enum', enum: CarFuelType, default: CarFuelType.PETROL })
  fuelType: CarFuelType;

  @Column({ nullable: true })
  transmission: string;

  @Column({ nullable: true })
  seats: number;

  @Column({ nullable: true })
  mileage: number;

  @Column({ nullable: true })
  color: string;

  // DB column is plate_number
  @Column({ name: 'plate_number', nullable: true })
  plateNumber: string;

  // DB column is service_type
  @Column({ name: 'service_type', type: 'enum', enum: CarServiceType })
  serviceType: CarServiceType;

  @Column({ type: 'numeric', precision: 15, scale: 2 })
  price: number;

  // DB column is price_unit
  @Column({ name: 'price_unit', length: 10, default: 'RWF' })
  priceUnit: string;

  // DB column is price_frequency
  @Column({ name: 'price_frequency', nullable: true })
  priceFrequency: string;

  @Column({ length: 100, nullable: true })
  district: string;

  @Column({ length: 200, nullable: true })
  location: string;

  @Column({ type: 'text', array: true, default: '{}' })
  images: string[];

  @Column({ default: false })
  featured: boolean;

  @Column({ type: 'enum', enum: CarStatus, default: CarStatus.AVAILABLE })
  status: CarStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
