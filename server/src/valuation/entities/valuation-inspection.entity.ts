import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { ValuationRequest } from './valuation-request.entity';

@Entity('valuation_inspections')
export class ValuationInspection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ValuationRequest, (r) => r.inspections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'request_id' })
  request: ValuationRequest;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'technician_id' })
  technician: User;

  @Column({ name: 'inspection_date', type: 'timestamptz', nullable: true })
  inspectionDate: Date;

  @Column({ default: 'assigned' }) // assigned | in_progress | submitted
  status: string;

  @OneToMany(() => ValuationInspectionNote, (n) => n.inspection)
  notes: ValuationInspectionNote[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('valuation_inspection_notes')
export class ValuationInspectionNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ValuationInspection, (i) => i.notes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inspection_id' })
  inspection: ValuationInspection;

  @Column()
  field: string; // e.g. "boundary", "roof condition"

  @Column('text')
  observation: string;

  @Column({ name: 'author_id' })
  authorId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
