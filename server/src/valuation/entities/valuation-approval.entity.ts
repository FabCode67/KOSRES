import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { ValuationRequest } from './valuation-request.entity';

@Entity('valuation_approvals')
export class ValuationApproval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ValuationRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'request_id' })
  request: ValuationRequest;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approver_id' })
  approver: User;

  @Column()
  decision: string; // "approved" | "rejected"

  @Column({ nullable: true })
  comment: string;

  @Column({ name: 'signed_name', nullable: true })
  signedName: string;

  @Column({ name: 'license_number', nullable: true })
  licenseNumber: string;

  @CreateDateColumn()
  at: Date;
}
