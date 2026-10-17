import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluationIntake, EvaluationIntakeStatus } from '../entities/evaluation-intake.entity';
import { ValuationPurpose } from '../entities/valuation-request.entity';
import { ValuationRequestsService } from '../requests/valuation-requests.service';
import { ValuationPropertiesService } from '../properties/valuation-properties.service';
import { PropertyCategory } from '../entities/valuation-property.entity';

export type CreateEvaluationIntakeDto = {
  upi: string;
  clientNames: string;
  clientPhone?: string;
  clientEmail?: string;
  purpose: ValuationPurpose;
  typeOfProperty: string;
  isDeveloped?: boolean;
  constructionMaterial?: string;
  bedrooms?: number;
  bathrooms?: number;
  landTitleDocumentUrls?: string[];
  propertyPictureUrls?: string[];
};

// Best-effort mapping from the customer's free-text "type of property" to
// the internal PropertyCategory enum, used only when converting an intake
// into a formal ValuationProperty -- a sensible starting point the valuer
// can correct, not an authoritative classification.
function guessPropertyCategory(typeOfProperty: string): PropertyCategory {
  const t = typeOfProperty.toLowerCase();
  if (t.includes('commercial') || t.includes('office') || t.includes('shop') || t.includes('retail')) return PropertyCategory.COMMERCIAL;
  if (t.includes('industrial') || t.includes('warehouse') || t.includes('factory')) return PropertyCategory.INDUSTRIAL;
  if (t.includes('agri') || t.includes('farm')) return PropertyCategory.AGRICULTURAL;
  if ((t.includes('land') || t.includes('vacant') || t.includes('plot')) && !t.includes('building')) return PropertyCategory.LAND;
  if (t.includes('special') || t.includes('institution') || t.includes('school') || t.includes('church') || t.includes('hospital')) return PropertyCategory.SPECIAL_PURPOSE;
  return PropertyCategory.RESIDENTIAL;
}

@Injectable()
export class EvaluationIntakesService {
  constructor(
    @InjectRepository(EvaluationIntake) private repo: Repository<EvaluationIntake>,
    private requestsService: ValuationRequestsService,
    private propertiesService: ValuationPropertiesService,
  ) {}

  private async nextReference(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.repo
      .createQueryBuilder('e')
      .where('e.reference LIKE :prefix', { prefix: `EVL-${year}-%` })
      .getCount();
    return `EVL-${year}-${String(count + 1).padStart(6, '0')}`;
  }

  async create(dto: CreateEvaluationIntakeDto) {
    if (!dto.upi?.trim()) throw new BadRequestException('UPI is required.');
    if (!dto.clientNames?.trim()) throw new BadRequestException('Client name is required.');
    if (!dto.purpose) throw new BadRequestException('Purpose of valuation is required.');
    if (!dto.typeOfProperty?.trim()) throw new BadRequestException('Type of property is required.');

    const reference = await this.nextReference();
    const intake = this.repo.create({
      reference,
      upi: dto.upi.trim(),
      clientNames: dto.clientNames.trim(),
      clientPhone: dto.clientPhone?.trim() || undefined,
      clientEmail: dto.clientEmail?.trim() || undefined,
      purpose: dto.purpose,
      typeOfProperty: dto.typeOfProperty.trim(),
      isDeveloped: dto.isDeveloped ?? false,
      constructionMaterial: dto.isDeveloped ? (dto.constructionMaterial?.trim() || undefined) : undefined,
      bedrooms: dto.isDeveloped ? dto.bedrooms ?? undefined : undefined,
      bathrooms: dto.isDeveloped ? dto.bathrooms ?? undefined : undefined,
      landTitleDocumentUrls: dto.landTitleDocumentUrls ?? [],
      propertyPictureUrls: dto.propertyPictureUrls ?? [],
      status: EvaluationIntakeStatus.NEW,
    });
    return this.repo.save(intake);
  }

  findAll(status?: EvaluationIntakeStatus) {
    return this.repo.find({
      where: status ? { status } : {},
      relations: ['reviewedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const intake = await this.repo.findOne({ where: { id }, relations: ['reviewedBy'] });
    if (!intake) throw new NotFoundException('Evaluation request not found');
    return intake;
  }

  async updateStatus(id: string, data: { status: EvaluationIntakeStatus; adminNotes?: string }, actorId: string) {
    await this.findOne(id);
    await this.repo.update(id, {
      status: data.status,
      adminNotes: data.adminNotes,
      reviewedBy: { id: actorId } as any,
    });
    return this.findOne(id);
  }

  /**
   * Turns a reviewed intake into a real, workable case: creates the formal
   * ValuationRequest (purpose + client name as instructor) and a starter
   * ValuationProperty pre-filled with the UPI and a best-guess property
   * category/subtype, plus attaches whatever documents/pictures the client
   * already submitted -- so the assigned valuer/technician picks up from
   * here instead of re-entering everything the client already gave us.
   */
  async convertToRequest(id: string, actorId: string) {
    const intake = await this.findOne(id);
    if (intake.status === EvaluationIntakeStatus.CONVERTED && intake.linkedRequestId) {
      return { intake, requestId: intake.linkedRequestId, alreadyConverted: true };
    }

    const request = await this.requestsService.create({
      purpose: intake.purpose,
      instructor: intake.clientNames,
      createdById: actorId,
    });

    const property = await this.propertiesService.create(request.id, {
      upi: intake.upi,
      propertyCategory: guessPropertyCategory(intake.typeOfProperty),
      propertySubtype: intake.typeOfProperty,
    } as any);

    for (const url of intake.landTitleDocumentUrls ?? []) {
      await this.propertiesService.addDocument(property.id, 'land_title', url, actorId);
    }
    for (const url of intake.propertyPictureUrls ?? []) {
      await this.propertiesService.addImage(property.id, url, 'general', 'Submitted with client request', actorId);
    }

    await this.repo.update(id, {
      status: EvaluationIntakeStatus.CONVERTED,
      linkedRequestId: request.id,
      reviewedBy: { id: actorId } as any,
    });

    return { intake: await this.findOne(id), requestId: request.id, alreadyConverted: false };
  }
}
