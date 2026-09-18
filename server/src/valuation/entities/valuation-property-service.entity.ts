import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
} from 'typeorm';
import { ValuationProperty } from './valuation-property.entity';

@Entity('valuation_property_services')
export class ValuationPropertyService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ValuationProperty, (p) => p.services, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: ValuationProperty;

  @Column()
  type: string; // "water" | "electricity" | "drainage" | "internet"

  // "connected" | "not_connected" — stored as-is, not an ordinal number
  @Column()
  status: string;

  @Column({ nullable: true })
  provider: string;
}

@Entity('valuation_property_amenities')
export class ValuationPropertyAmenity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ValuationProperty, (p) => p.amenities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: ValuationProperty;

  @Column()
  name: string; // "Schools" | "Hospital" | "Market" | "CBD" | ...

  @Column({ name: 'distance_km', type: 'numeric', precision: 6, scale: 2, nullable: true })
  distanceKm: number;
}
