import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { ValuationRequest } from './valuation-request.entity';
import { ComparableProperty } from './comparable-property.entity';

@Entity('comparable_selections')
export class ComparableSelection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ValuationRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'request_id' })
  request: ValuationRequest;

  @ManyToOne(() => ComparableProperty)
  @JoinColumn({ name: 'comparable_property_id' })
  comparableProperty: ComparableProperty;

  @Column({ default: true })
  included: boolean;

  @Column({ name: 'similarity_score', type: 'numeric', precision: 5, scale: 2, nullable: true })
  similarityScore: number;

  // Flat RWF adjustment (positive or negative) applied to this comparable's
  // price to account for differences from the subject property, e.g.
  // [{ factor: "condition", amount: 2000000, reason: "Subject in better condition" }]
  @Column({ type: 'jsonb', nullable: true })
  adjustments: { factor: string; amount: number; reason: string }[];

  @Column({ name: 'valuer_comment', nullable: true })
  valuerComment: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
