import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { ValuationRequest } from './valuation-request.entity';
import { ValuationPropertyLocation, ValuationPropertyLand } from './valuation-property-details.entity';
import { ValuationPropertyBuilding } from './valuation-property-building.entity';
import { ValuationExternalWork } from './valuation-external-work.entity';
import { ValuationPropertyService, ValuationPropertyAmenity } from './valuation-property-service.entity';
import { ValuationPropertyImage, ValuationPropertyDocument } from './valuation-property-media.entity';

export enum PropertyCategory {
  RESIDENTIAL     = 'residential',
  COMMERCIAL      = 'commercial',
  INDUSTRIAL      = 'industrial',
  AGRICULTURAL    = 'agricultural',
  LAND            = 'land',
  SPECIAL_PURPOSE = 'special_purpose',
}

@Entity('valuation_properties')
export class ValuationProperty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => ValuationRequest, (r) => r.property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'request_id' })
  request: ValuationRequest;

  @Column({ nullable: true })
  upi: string;

  @Column({ name: 'plot_number', nullable: true })
  plotNumber: string;

  @Column({ name: 'title_ref', nullable: true })
  titleRef: string;

  @Column({ name: 'registered_proprietors', type: 'jsonb', nullable: true })
  registeredProprietors: { name: string; nationalId?: string; sharePercentage?: number; gender?: string }[];

  @Column({ name: 'property_category', type: 'enum', enum: PropertyCategory })
  propertyCategory: PropertyCategory;

  @Column({ name: 'property_subtype' })
  propertySubtype: string;

  @Column({ nullable: true })
  tenure: string; // "Leasehold" | "Freehold"

  @Column({ name: 'lease_term_years', nullable: true })
  leaseTermYears: number;

  @Column({ name: 'occupancy_status', nullable: true })
  occupancyStatus: string;

  @Column({ name: 'mortgage_status', nullable: true })
  mortgageStatus: string;

  @Column({ name: 'restrictions_status', nullable: true })
  restrictionsStatus: string;

  @Column({ name: 'process_status', nullable: true })
  processStatus: string;

  @OneToOne(() => ValuationPropertyLocation, (l) => l.property)
  location: ValuationPropertyLocation;

  @OneToOne(() => ValuationPropertyLand, (l) => l.property)
  land: ValuationPropertyLand;

  @OneToMany(() => ValuationPropertyBuilding, (b) => b.property)
  buildings: ValuationPropertyBuilding[];

  @OneToMany(() => ValuationExternalWork, (w) => w.property)
  externalWorks: ValuationExternalWork[];

  @OneToMany(() => ValuationPropertyService, (s) => s.property)
  services: ValuationPropertyService[];

  @OneToMany(() => ValuationPropertyAmenity, (a) => a.property)
  amenities: ValuationPropertyAmenity[];

  @OneToMany(() => ValuationPropertyImage, (i) => i.property)
  images: ValuationPropertyImage[];

  @OneToMany(() => ValuationPropertyDocument, (d) => d.property)
  documents: ValuationPropertyDocument[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
