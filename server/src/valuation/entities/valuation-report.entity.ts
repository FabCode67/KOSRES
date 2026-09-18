import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { ValuationRequest } from './valuation-request.entity';

@Entity('valuation_reports')
export class ValuationReportEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ValuationRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'request_id' })
  request: ValuationRequest;

  @Column({ unique: true })
  reference: string; // matches the request reference, e.g. "VAL-2026-000123"

  @Column({ name: 'pdf_url', nullable: true })
  pdfUrl: string;

  @Column({ name: 'generated_by_id' })
  generatedById: string;

  @CreateDateColumn({ name: 'generated_at' })
  generatedAt: Date;
}
