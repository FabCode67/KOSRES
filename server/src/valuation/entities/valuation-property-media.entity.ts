import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { ValuationProperty } from './valuation-property.entity';

@Entity('valuation_property_images')
export class ValuationPropertyImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ValuationProperty, (p) => p.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: ValuationProperty;

  @Column()
  url: string;

  // exterior | interior | roof | fence | gate | external_works | ...
  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'uploaded_by_id', nullable: true })
  uploadedById: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('valuation_property_documents')
export class ValuationPropertyDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ValuationProperty, (p) => p.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: ValuationProperty;

  // "title_deed" | "planning_zoning" | "masterplan_extract" | ...
  @Column()
  type: string;

  @Column()
  url: string;

  @Column({ default: 1 })
  version: number;

  @Column({ name: 'uploaded_by_id', nullable: true })
  uploadedById: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
