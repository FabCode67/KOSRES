import {
  Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { PropertyCategory } from './valuation-property.entity';

@Entity('comparable_properties')
export class ComparableProperty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true }) province: string;
  @Column({ nullable: true }) district: string;
  @Column({ nullable: true }) sector: string;
  @Column({ nullable: true }) cell: string;
  @Column({ nullable: true }) village: string;
  @Column({ nullable: true }) upi: string;

  @Column({ name: 'property_subtype', nullable: true }) propertySubtype: string;
  @Column({ type: 'text', nullable: true }) accommodation: string;

  // Grading attributes from the source database, e.g. { qualityGrade: 3, accommodationGrade: 2 } or { neighborhoodGrade, utilities, amenitiesNearby }
  @Column({ type: 'jsonb', nullable: true }) attributes: Record<string, unknown>;

  @Column({ name: 'property_category', type: 'enum', enum: PropertyCategory, nullable: true })
  propertyCategory: PropertyCategory;

  @Column({ name: 'plot_area_sqm', type: 'numeric', precision: 10, scale: 2, nullable: true })
  plotAreaSqm: number;

  @Column({ name: 'building_area_sqm', type: 'numeric', precision: 10, scale: 2, nullable: true })
  buildingAreaSqm: number;

  @Column({ nullable: true }) bedrooms: number;
  @Column({ name: 'age_years', nullable: true }) ageYears: number;
  @Column({ nullable: true }) condition: string;
  @Column({ nullable: true }) accessibility: string;

  @Column({ name: 'cbd_distance_km', type: 'numeric', precision: 6, scale: 2, nullable: true })
  cbdDistanceKm: number;

  @Column({ nullable: true }) source: string;
  @Column({ name: 'source_reliability', nullable: true }) sourceReliability: string;

  @Column({ name: 'verification_status', default: 'unverified' }) // unverified | verified | rejected
  verificationStatus: string;

  @OneToMany(() => ComparableTransaction, (t) => t.comparableProperty)
  transactions: ComparableTransaction[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('comparable_transactions')
export class ComparableTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'comparable_property_id' })
  comparablePropertyId: string;

  @ManyToOne(() => ComparableProperty, (p) => p.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'comparable_property_id' })
  comparableProperty: ComparableProperty;

  @Column({ name: 'transaction_date', type: 'date' })
  transactionDate: string;

  @Column({ type: 'numeric', precision: 16, scale: 2 })
  price: number;

  @Column({ name: 'price_per_sqm', type: 'numeric', precision: 14, scale: 2, nullable: true })
  pricePerSqm: number;

  @Column({ name: 'evidence_url', nullable: true })
  evidenceUrl: string;
}
