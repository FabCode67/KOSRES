import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { ValuationEngineVersion } from './valuation-engine.entity';
import { ValuationProperty } from './valuation-property.entity';
import { ValuationInspection } from './valuation-inspection.entity';
import { ValuationCalculation, ValuationResult } from './valuation-calculation.entity';

export enum ValuationPurpose {
  LOAN_APPLICATION     = 'loan_application',
  SALE_PURCHASE        = 'sale_purchase',
  INSURANCE            = 'insurance',
  INVESTMENT           = 'investment',
  TAXATION             = 'taxation',
  ACCOUNTING           = 'accounting',
  FINANCIAL_REPORTING  = 'financial_reporting',
  FORCED_SALE          = 'forced_sale',
  MARKET_VALUE         = 'market_value',
  OTHER                = 'other',
}

export enum RequestStatus {
  DRAFT                    = 'draft',
  SUBMITTED                = 'submitted',
  ASSIGNED                 = 'assigned',
  DATA_COLLECTION          = 'data_collection',
  INSPECTION_IN_PROGRESS   = 'inspection_in_progress',
  INFORMATION_REQUIRED     = 'information_required',
  VALUER_REVIEW            = 'valuer_review',
  ENGINE_SELECTED          = 'engine_selected',
  ANALYSIS_IN_PROGRESS     = 'analysis_in_progress',
  VALUER_FINAL_REVIEW      = 'valuer_final_review',
  DRAFT_REPORT             = 'draft_report',
  APPROVED                 = 'approved',
  CERTIFIED                = 'certified',
  COMPLETED                = 'completed',
  REJECTED                 = 'rejected',
  CANCELLED                = 'cancelled',
  ON_HOLD                  = 'on_hold',
  REASSESSMENT_REQUIRED    = 'reassessment_required',
}

@Entity('valuation_requests')
export class ValuationRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  reference: string; // e.g. "VAL-2026-000123"

  @Column({ type: 'enum', enum: ValuationPurpose })
  purpose: ValuationPurpose;

  @Column({ nullable: true })
  beneficiary: string; // e.g. "Equity Bank Rwanda Ltd"

  @Column({ nullable: true })
  instructor: string;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.DRAFT })
  status: RequestStatus;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_valuer_id' })
  assignedValuer: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_technician_id' })
  assignedTechnician: User;

  @ManyToOne(() => ValuationEngineVersion, { nullable: true })
  @JoinColumn({ name: 'engine_version_id' })
  engineVersion: ValuationEngineVersion;

  @OneToOne(() => ValuationProperty, (p) => p.request)
  property: ValuationProperty;

  @OneToMany(() => ValuationInspection, (i) => i.request)
  inspections: ValuationInspection[];

  @OneToMany(() => ValuationCalculation, (c) => c.request)
  calculations: ValuationCalculation[];

  @OneToMany(() => ValuationResult, (r) => r.request)
  results: ValuationResult[];

  @OneToMany(() => WorkflowTransition, (t) => t.request)
  workflowTransitions: WorkflowTransition[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('valuation_workflow_transitions')
export class WorkflowTransition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ValuationRequest, (r) => r.workflowTransitions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'request_id' })
  request: ValuationRequest;

  @Column({ name: 'from_status', type: 'enum', enum: RequestStatus, nullable: true })
  fromStatus: RequestStatus;

  @Column({ name: 'to_status', type: 'enum', enum: RequestStatus })
  toStatus: RequestStatus;

  @Column({ name: 'actor_id' })
  actorId: string;

  @Column({ nullable: true })
  reason: string;

  @CreateDateColumn()
  at: Date;
}
