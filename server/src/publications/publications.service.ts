import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publication, PublicationStatus } from './publication.entity';

export interface CreatePublicationDto {
  title: string;
  excerpt: string;
  body: string;
  coverImage?: string;
  documentUrl?: string;
  documentName?: string;
  category?: string;
  author?: string;
  featured?: boolean;
  status?: PublicationStatus;
}

export interface UpdatePublicationDto extends Partial<CreatePublicationDto> {}

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 200);
}

@Injectable()
export class PublicationsService {
  constructor(
    @InjectRepository(Publication)
    private repo: Repository<Publication>,
  ) {}

  async findAll(includesDrafts = false): Promise<Publication[]> {
    const where: any = {};
    if (!includesDrafts) where.status = PublicationStatus.PUBLISHED;
    return this.repo.find({
      where,
      order: { featured: 'DESC', createdAt: 'DESC' },
    });
  }

  async findFeatured(): Promise<Publication[]> {
    return this.repo.find({
      where: { featured: true, status: PublicationStatus.PUBLISHED },
      order: { createdAt: 'DESC' },
      take: 3,
    });
  }

  async findOne(id: string): Promise<Publication> {
    const pub = await this.repo.findOne({ where: { id } });
    if (!pub) throw new NotFoundException('Publication not found');
    return pub;
  }

  async create(dto: CreatePublicationDto): Promise<Publication> {
    const slug = toSlug(dto.title) + '-' + Date.now().toString(36);
    const pub  = this.repo.create({ ...dto, slug });
    return this.repo.save(pub);
  }

  async update(id: string, dto: UpdatePublicationDto): Promise<Publication> {
    const pub = await this.findOne(id);
    if (dto.title && dto.title !== pub.title) {
      pub.slug = toSlug(dto.title) + '-' + Date.now().toString(36);
    }
    Object.assign(pub, dto);
    return this.repo.save(pub);
  }

  async remove(id: string): Promise<{ ok: boolean }> {
    await this.findOne(id);
    await this.repo.delete(id);
    return { ok: true };
  }

  async togglePublish(id: string): Promise<Publication> {
    const pub = await this.findOne(id);
    pub.status = pub.status === PublicationStatus.PUBLISHED
      ? PublicationStatus.DRAFT
      : PublicationStatus.PUBLISHED;
    return this.repo.save(pub);
  }
}
