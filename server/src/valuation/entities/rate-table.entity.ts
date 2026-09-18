import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn,
  CreateDateColumn, UpdateDateColumn, Unique,
} from 'typeorm';
import { PropertyCategory } from './valuation-property.entity';
import { WorkUnit } from './valuation-external-work.entity';

export enum RateTableType {
  LAND                = 'land',
  BUILDING_COMPONENT  = 'building_component',
  EXTERNAL_WORK       = 'external_work',
}

@Entity('valuation_rate_tables')
@Unique(['type', 'name', 'version'])
export class RateTable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: RateTableType })
  type: RateTableType;

  @Column()
  name: string;

  @Column()
  version: number;

  @Column({ name: 'effective_date', type: 'timestamptz', default: () => 'now()' })
  effectiveDate: Date;

  @Column({ default: 'active' }) // draft | active | retired
  status: string;

  @Column({ nullable: true })
  source: string;

  @OneToMany(() => RateTableEntry, (e) => e.rateTable)
  entries: RateTableEntry[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('valuation_rate_table_entries')
export class RateTableEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => RateTable, (t) => t.entries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rate_table_id' })
  rateTable: RateTable;

  // BUILDING_COMPONENT / EXTERNAL_WORK: component/work name, e.g. "main_house","fence"
  // LAND: free-text label; the geographic columns below do the actual scoping
  @Column()
  key: string;

  @Column({ type: 'enum', enum: WorkUnit })
  unit: WorkUnit;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  rate: number;

  @Column({ nullable: true }) province: string;
  @Column({ nullable: true }) district: string;
  @Column({ nullable: true }) sector: string;

  @Column({ name: 'property_category', type: 'enum', enum: PropertyCategory, nullable: true })
  propertyCategory: PropertyCategory;

  @Column({ nullable: true })
  notes: string;
}
