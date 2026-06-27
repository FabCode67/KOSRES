import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum PublicationStatus {
  DRAFT     = 'draft',
  PUBLISHED = 'published',
}

@Entity('publications')
export class Publication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 300 })
  title: string;

  @Column({ type: 'text' })
  excerpt: string;

  @Column({ type: 'text' })
  body: string;

  // DB column is cover_image
  @Column({ name: 'cover_image', nullable: true })
  coverImage: string;

  // DB column is document_url
  @Column({ name: 'document_url', nullable: true })
  documentUrl: string;

  // DB column is document_name
  @Column({ name: 'document_name', nullable: true })
  documentName: string;

  @Column({ length: 100, nullable: true })
  category: string;

  @Column({ length: 100, nullable: true })
  author: string;

  @Column({ default: false })
  featured: boolean;

  @Column({ type: 'enum', enum: PublicationStatus, default: PublicationStatus.DRAFT })
  status: PublicationStatus;

  @Column({ nullable: true })
  slug: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
