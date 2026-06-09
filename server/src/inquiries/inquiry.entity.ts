import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Property } from '../properties/property.entity';

@Entity('inquiries')
export class Inquiry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Property, (p) => p.inquiries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column('text')
  message: string;

  @Column({ length: 50, default: 'whatsapp' })
  channel: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
