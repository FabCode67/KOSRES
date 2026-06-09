import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Inquiry } from '../inquiries/inquiry.entity';

export enum PropertyCategory {
  RESIDENTIAL  = 'residential',
  COMMERCIAL   = 'commercial',
  AGRICULTURAL = 'agricultural',
  INDUSTRIAL   = 'industrial',
}

export enum OfferType {
  SALE       = 'sale',
  RENT       = 'rent',
  SHORT_STAY = 'short_stay',
}

export enum PriceUnit {
  RWF = 'RWF',
  USD = 'USD',
}

export enum PropertyStatus {
  ACTIVE   = 'active',
  SOLD     = 'sold',
  RENTED   = 'rented',
  INACTIVE = 'inactive',
}

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 500 })
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'numeric', precision: 15, scale: 2 })
  price: number;

  @Column({ name: 'price_unit', type: 'enum', enum: PriceUnit, default: PriceUnit.RWF })
  priceUnit: PriceUnit;

  @Column({ name: 'price_frequency', nullable: true })
  priceFrequency: string;

  @Column({ name: 'offer_type', type: 'enum', enum: OfferType })
  offerType: OfferType;

  @Column({ type: 'enum', enum: PropertyCategory })
  category: PropertyCategory;

  @Column({ name: 'property_type', length: 100 })
  propertyType: string;

  @Column({ length: 100 })
  district: string;

  @Column({ length: 100 })
  sector: string;

  @Column({ nullable: true })
  bedrooms: number;

  @Column({ nullable: true })
  bathrooms: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  area: number;

  @Column({ type: 'text', array: true, default: '{}' })
  images: string[];

  @Column({ default: false })
  featured: boolean;

  @Column({ type: 'enum', enum: PropertyStatus, default: PropertyStatus.ACTIVE })
  status: PropertyStatus;

  @Column({ nullable: true })
  upi: string;

  @ManyToOne(() => User, (u) => u.properties, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @OneToMany(() => Inquiry, (i) => i.property)
  inquiries: Inquiry[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
