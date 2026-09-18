import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, Unique,
} from 'typeorm';

@Entity('valuation_engines')
export class ValuationEngineDefinition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string; // "COST_APPROACH" | "SALES_COMPARISON" | "INCOME_APPROACH" | "AVS" | "MVS"

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  methodology: string;

  @Column({ default: 'active' }) // active | retired
  status: string;

  @OneToMany(() => ValuationEngineVersion, (v) => v.engine)
  versions: ValuationEngineVersion[];
}

@Entity('valuation_engine_versions')
@Unique(['engine', 'version'])
export class ValuationEngineVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ValuationEngineDefinition, (e) => e.versions)
  @JoinColumn({ name: 'engine_id' })
  engine: ValuationEngineDefinition;

  @Column()
  version: number;

  @Column({ name: 'required_fields', type: 'jsonb', nullable: true })
  requiredFields: unknown;

  @Column({ name: 'required_docs', type: 'jsonb', nullable: true })
  requiredDocs: unknown;

  @Column({ name: 'report_sections', type: 'jsonb', nullable: true })
  reportSections: unknown;

  @Column({ name: 'effective_date', type: 'timestamptz', default: () => 'now()' })
  effectiveDate: Date;

  @Column({ default: 'active' }) // draft | active | retired
  status: string;
}
