import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
} from 'typeorm';
import { ValuationProperty } from './valuation-property.entity';

export enum WorkUnit {
  SQM       = 'sqm',
  LINEAR_M  = 'linear_m',
  ITEM      = 'item',
  LUMP_SUM  = 'lump_sum',
}

@Entity('valuation_external_works')
export class ValuationExternalWork {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ValuationProperty, (p) => p.externalWorks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: ValuationProperty;

  @Column()
  name: string; // "Site leveling" | "Retaining wall" | "Fence" | ...

  @Column({ type: 'enum', enum: WorkUnit })
  unit: WorkUnit;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  quantity: number;

  @Column({ nullable: true })
  notes: string;
}
