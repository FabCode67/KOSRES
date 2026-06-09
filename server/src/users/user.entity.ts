import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Property } from '../properties/property.entity';

export enum UserRole {
  ADMIN = 'admin',
  AGENT = 'agent',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Exclude()
  @Column({ length: 255 })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.AGENT })
  role: UserRole;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => Property, (p) => p.createdBy)
  properties: Property[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
