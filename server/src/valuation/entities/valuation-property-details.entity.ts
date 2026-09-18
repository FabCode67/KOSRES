import {
  Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn,
} from 'typeorm';
import { ValuationProperty } from './valuation-property.entity';

@Entity('valuation_property_locations')
export class ValuationPropertyLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => ValuationProperty, (p) => p.location, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: ValuationProperty;

  @Column({ nullable: true }) province: string;
  @Column({ nullable: true }) district: string;
  @Column({ nullable: true }) sector: string;
  @Column({ nullable: true }) cell: string;
  @Column({ nullable: true }) village: string;
  @Column({ nullable: true }) address: string;

  @Column({ type: 'numeric', precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'numeric', precision: 10, scale: 6, nullable: true })
  longitude: number;

  @Column({ name: 'distance_to_cbd_km', type: 'numeric', precision: 6, scale: 2, nullable: true })
  distanceToCbdKm: number;

  @Column({ name: 'neighborhood_quality', nullable: true })
  neighborhoodQuality: string;

  // "Footway" | "Murram" | "Cobble" | "Tarmac" — stored as-is, not an ordinal number
  @Column({ nullable: true })
  accessibility: string;
}

@Entity('valuation_property_land')
export class ValuationPropertyLand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => ValuationProperty, (p) => p.land, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: ValuationProperty;

  @Column({ name: 'plot_size_sqm', type: 'numeric', precision: 12, scale: 2, nullable: true })
  plotSizeSqm: number;

  @Column({ nullable: true }) shape: string;
  @Column({ nullable: true }) topography: string;
  @Column({ nullable: true }) zoning: string; // e.g. "A1-Agriculture zone"
  @Column({ name: 'current_use', nullable: true }) currentUse: string;

  @Column({ name: 'permitted_uses', type: 'text', array: true, default: '{}' })
  permittedUses: string[];

  @Column({ name: 'prohibited_uses', type: 'text', array: true, default: '{}' })
  prohibitedUses: string[];
}
