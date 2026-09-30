import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { ValuationPurpose } from './valuation-request.entity';
import { User } from '../../users/user.entity';

/**
 * Lifecycle of a public "request a valuation" submission. Deliberately
 * separate from RequestStatus (on ValuationRequest) -- this is the raw,
 * unauthenticated customer intake, before any staff has looked at it or
 * decided it's a real, workable case. CONVERTED means a formal
 * ValuationRequest + ValuationProperty were created from it (see
 * `linkedRequestId`); the intake row itself is kept as the original
 * submission record either way.
 */
export enum EvaluationIntakeStatus {
  NEW         = 'new',
  IN_REVIEW   = 'in_review',
  CONVERTED   = 'converted',
  REJECTED    = 'rejected',
}

/**
 * A property valuation request submitted directly by a client/customer
 * from the public landing page -- before any staff involvement. An admin
 * reviews these and, when it's a workable case, converts it into a
 * formal ValuationRequest (+ ValuationProperty) to continue the real
 * workflow (inspection, engine selection, report, etc.).
 */
@Entity('evaluation_intakes')
export class EvaluationIntake {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Customer-facing reference, e.g. "EVL-2026-000123" -- so they have something to quote if they call in. */
  @Column({ unique: true })
  reference: string;

  @Column()
  upi: string;

  @Column({ name: 'client_names' })
  clientNames: string;

  /** Optional but important in practice -- staff need a way to actually reach the client to schedule an inspection. Not on the user's original field list, so kept optional. */
  @Column({ name: 'client_phone', nullable: true })
  clientPhone: string;

  @Column({ name: 'client_email', nullable: true })
  clientEmail: string;

  @Column({ type: 'enum', enum: ValuationPurpose })
  purpose: ValuationPurpose;

  /** Free text (with a suggested-options dropdown on the frontend) rather than tied to PropertyCategory -- customers describe property type in plain language. */
  @Column({ name: 'type_of_property' })
  typeOfProperty: string;

  @Column({ name: 'is_developed', default: false })
  isDeveloped: boolean;

  @Column({ name: 'construction_material', nullable: true })
  constructionMaterial: string;

  @Column({ nullable: true })
  bedrooms: number;

  @Column({ nullable: true })
  bathrooms: number;

  @Column({ name: 'land_title_document_urls', type: 'jsonb', default: () => "'[]'" })
  landTitleDocumentUrls: string[];

  @Column({ name: 'property_picture_urls', type: 'jsonb', default: () => "'[]'" })
  propertyPictureUrls: string[];

  @Column({ type: 'enum', enum: EvaluationIntakeStatus, default: EvaluationIntakeStatus.NEW })
  status: EvaluationIntakeStatus;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by_id' })
  reviewedBy: User;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes: string;

  /** Set once an admin converts this into a real case -- links back to the ValuationRequest that continues the workflow. */
  @Column({ name: 'linked_request_id', nullable: true })
  linkedRequestId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
