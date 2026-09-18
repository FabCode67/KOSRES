import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { ValuationRequest } from './valuation-request.entity';
import { ValuationEngineVersion } from './valuation-engine.entity';

@Entity('valuation_calculations')
export class ValuationCalculation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ValuationRequest, (r) => r.calculations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'request_id' })
  request: ValuationRequest;

  @ManyToOne(() => ValuationEngineVersion)
  @JoinColumn({ name: 'engine_version_id' })
  engineVersion: ValuationEngineVersion;

  // Point-in-time snapshots (not live FKs) so a later rate/rule change can
  // never alter the meaning of an already-run calculation.
  @Column({ name: 'rate_tables_used', type: 'jsonb', nullable: true })
  rateTablesUsed: unknown;

  @Column({ name: 'calculation_rules_used', type: 'jsonb', nullable: true })
  calculationRulesUsed: unknown;

  @Column({ name: 'inputs_snapshot', type: 'jsonb' })
  inputsSnapshot: unknown;

  @Column({ name: 'outputs_snapshot', type: 'jsonb' })
  outputsSnapshot: unknown;

  @Column({ name: 'executed_by_id' })
  executedById: string;

  @CreateDateColumn({ name: 'executed_at' })
  executedAt: Date;

  @OneToMany(() => ValuationResult, (r) => r.calculation)
  results: ValuationResult[];
}

export enum ValuationBasis {
  MARKET      = 'market',
  FORCED_SALE = 'forced_sale',
  INSURANCE   = 'insurance',
  LAND        = 'land',
  DEVELOPMENT = 'development',
}

export enum ResultMethod {
  SYSTEM_CALCULATED = 'system_calculated',
  VALUER_ADOPTED    = 'valuer_adopted',
}

@Entity('valuation_results')
export class ValuationResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ValuationRequest, (r) => r.results, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'request_id' })
  request: ValuationRequest;

  @ManyToOne(() => ValuationCalculation, (c) => c.results, { nullable: true })
  @JoinColumn({ name: 'calculation_id' })
  calculation: ValuationCalculation;

  @Column({ type: 'enum', enum: ValuationBasis })
  basis: ValuationBasis;

  @Column({ type: 'numeric', precision: 16, scale: 2 })
  amount: number;

  @Column({ default: 'RWF' })
  currency: string;

  @Column({ name: 'valuation_date', type: 'date' })
  valuationDate: string;

  @Column({ type: 'enum', enum: ResultMethod, default: ResultMethod.SYSTEM_CALCULATED })
  method: ResultMethod;

  @Column({ nullable: true })
  source: string; // e.g. rule code, or "valuer professional judgement"

  @Column({ nullable: true })
  justification: string; // required narrative when method = VALUER_ADOPTED or overridden

  @Column({ name: 'created_by_id' })
  createdById: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => ValuationAdjustment, (a) => a.result)
  adjustments: ValuationAdjustment[];
}

@Entity('valuation_adjustments')
export class ValuationAdjustment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ValuationResult, (r) => r.adjustments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'result_id' })
  result: ValuationResult;

  @Column()
  field: string;

  @Column({ name: 'original_value', nullable: true })
  originalValue: string;

  @Column({ name: 'new_value' })
  newValue: string;

  @Column()
  reason: string;

  @Column({ name: 'author_id' })
  authorId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
