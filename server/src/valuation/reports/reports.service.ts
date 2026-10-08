import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ValuationProperty } from '../entities/valuation-property.entity';
import { buildReportDocx } from './report-docx';
import { ValuationReportEntity } from '../entities/valuation-report.entity';
import { ValuationApproval } from '../entities/valuation-approval.entity';
import { ValuationRequestsService } from '../requests/valuation-requests.service';
import { UploadService } from '../../upload/upload.service';
import { RequestStatus } from '../entities/valuation-request.entity';

const BRAND_RED = '#C8102E';
const INK = '#1A1A1A';
const MUTED = '#6B7280';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ValuationReportEntity) private reportRepo: Repository<ValuationReportEntity>,
    @InjectRepository(ValuationApproval) private approvalRepo: Repository<ValuationApproval>,
    @InjectRepository(ValuationProperty) private propertyRepo: Repository<ValuationProperty>,
    private requestsService: ValuationRequestsService,
    private upload: UploadService,
  ) {}

  async getLatest(requestId: string) {
    return this.reportRepo.findOne({ where: { request: { id: requestId } }, order: { generatedAt: 'DESC' } });
  }

  /**
   * Generates the PDF from the request's current property data + latest
   * calculation, uploads it, records a ValuationReport row, and advances
   * the workflow to DRAFT_REPORT (from VALUER_FINAL_REVIEW).
   */
  async generate(
    requestId: string,
    actorId: string,
    opts: {
      valuationDate?: string;
      generalRemarks?: string;
      locationMapUrl?: string;
      cadastralPlanUrl?: string;
      planningZoneMapUrl?: string;
      appendixUrls?: string[];
      logoUrl?: string;
    } = {},
  ) {
    const request: any = await this.requestsService.findOne(requestId);
    if (!request.property) throw new BadRequestException('Cannot generate a report without property data');

    const calc = [...(request.calculations ?? [])].sort(
      (a: any, b: any) => new Date(a.executedAt).getTime() - new Date(b.executedAt).getTime(),
    ).pop();
    if (!calc) throw new BadRequestException('Cannot generate a report before a calculation has been run');

    const property = await this.propertyRepo.findOne({
      where: { id: request.property.id },
      relations: ['location', 'land', 'buildings', 'externalWorks', 'services', 'amenities', 'images', 'documents'],
    });
    if (!property) throw new BadRequestException('Property not found');

    const approval = await this.approvalRepo.findOne({
      where: { request: { id: requestId } },
      relations: ['approver'],
      order: { at: 'DESC' },
    });

    // Latest result per basis (market / forced_sale / insurance)
    const latestByBasis = new Map<string, any>();
    [...(request.results ?? [])]
      .filter((r: any) => r.calculation?.id === calc.id)
      .forEach((r: any) => latestByBasis.set(r.basis, r));

    const inspection = [...(request.inspections ?? [])]
      .filter((i: any) => i.inspectionDate)
      .sort((a: any, b: any) => new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime())[0];

    // Valuation date: explicit value from the valuer, else the sign-off date, else today.
    const valuationDate = opts.valuationDate
      ? new Date(opts.valuationDate)
      : approval?.at ? new Date(approval.at) : new Date();
    if (isNaN(valuationDate.getTime())) throw new BadRequestException('Invalid valuation date');

    const docxBuffer = await buildReportDocx({
      reference: request.reference,
      purpose: String(request.purpose),
      beneficiary: request.beneficiary,
      instructor: request.instructor,
      engagementDate: request.createdAt ? new Date(request.createdAt) : new Date(),
      inspectionDate: inspection?.inspectionDate ? new Date(inspection.inspectionDate) : null,
      valuationDate,
      engineCode: calc.engineVersion?.engine?.code ?? request.engineVersion?.engine?.code ?? null,
      property: property as any,
      breakdown: calc.outputsSnapshot,
      results: Array.from(latestByBasis.values()).map((r: any) => ({ basis: r.basis, amount: r.amount })),
      approval: approval
        ? { signedName: approval.signedName, licenseNumber: approval.licenseNumber, at: approval.at, comment: approval.comment }
        : null,
      extras: {
        generalRemarks: opts.generalRemarks,
        locationMapUrl: opts.locationMapUrl,
        cadastralPlanUrl: opts.cadastralPlanUrl,
        planningZoneMapUrl: opts.planningZoneMapUrl,
        appendixUrls: opts.appendixUrls,
        logoUrl: opts.logoUrl,
      },
    });
    const uploaded = await this.upload.uploadRaw(docxBuffer, `${request.reference}.docx`, 'kosres/valuation/reports');

    const existing = await this.reportRepo.findOne({ where: { reference: request.reference } });
    let report: ValuationReportEntity;
    if (existing) {
      existing.docxUrl = uploaded.secureUrl;
      existing.generatedById = actorId;
      report = await this.reportRepo.save(existing);
    } else {
      report = await this.reportRepo.save(this.reportRepo.create({
        request: { id: requestId } as any,
        reference: request.reference,
        docxUrl: uploaded.secureUrl,
        generatedById: actorId,
      }));
    }

    if (request.status === RequestStatus.VALUER_FINAL_REVIEW) {
      await this.requestsService.transition(requestId, RequestStatus.DRAFT_REPORT, actorId, 'Report generated');
    }

    return report;
  }

}
