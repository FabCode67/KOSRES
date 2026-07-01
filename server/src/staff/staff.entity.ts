import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 150 })
  position: string;        // e.g. "Managing Director", "Property Agent"

  @Column({ length: 100, nullable: true })
  department: string;      // e.g. "Sales", "Valuation", "Management"

  @Column({ nullable: true })
  photo: string;            // Cloudinary URL

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ default: true })
  active: boolean;

  @Column({ default: 0 })
  order: number;            // display order

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
