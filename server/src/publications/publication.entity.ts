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
  excerpt: string;          // short summary shown on cards

  @Column({ type: 'text' })
  body: string;             // full article content (rich text / markdown)

  @Column({ nullable: true })
  coverImage: string;       // Cloudinary URL

  @Column({ nullable: true })
  documentUrl: string;      // Cloudinary PDF URL (optional)

  @Column({ nullable: true })
  documentName: string;     // original filename for display

  @Column({ length: 100, nullable: true })
  category: string;         // e.g. "Market Report", "News", "Guide"

  @Column({ length: 100, nullable: true })
  author: string;

  @Column({ default: false })
  featured: boolean;

  @Column({ type: 'enum', enum: PublicationStatus, default: PublicationStatus.DRAFT })
  status: PublicationStatus;

  @Column({ nullable: true })
  slug: string;             // URL-friendly identifier

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
