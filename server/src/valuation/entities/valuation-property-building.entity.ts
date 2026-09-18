import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
} from 'typeorm';
import { ValuationProperty } from './valuation-property.entity';

@Entity('valuation_property_buildings')
export class ValuationPropertyBuilding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ValuationProperty, (p) => p.buildings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: ValuationProperty;

  @Column()
  name: string; // "Main house" | "Annex I" | "Annex II" ...

  @Column({ name: 'area_sqm', type: 'numeric', precision: 10, scale: 2 })
  areaSqm: number;

  @Column({ nullable: true }) floors: number;
  @Column({ nullable: true }) bedrooms: number;
  @Column({ nullable: true }) bathrooms: number;
  @Column({ name: 'living_rooms', nullable: true }) livingRooms: number;
  @Column({ nullable: true }) kitchens: number;
  @Column({ nullable: true }) stores: number;

  @Column({ name: 'construction_year', nullable: true })
  constructionYear: number;

  // "Very poor".."Excellent" — stored as text, not an ordinal number
  @Column({ nullable: true }) condition: string;
  @Column({ nullable: true }) walling: string;
  @Column({ nullable: true }) roofing: string;
  @Column({ nullable: true }) flooring: string;
  @Column({ nullable: true }) ceiling: string;
  @Column({ nullable: true }) doors: string;
  @Column({ nullable: true }) windows: string;

  @Column({ name: 'completion_percentage', type: 'numeric', precision: 5, scale: 2, default: 100 })
  completionPercentage: number;
}
