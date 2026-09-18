import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as PDFDocument from 'pdfkit';
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
  async generate(requestId: string, actorId: string) {
    const request: any = await this.requestsService.findOne(requestId);
    if (!request.property) throw new BadRequestException('Cannot generate a report without property data');

    const calc = [...(request.calculations ?? [])].sort(
      (a: any, b: any) => new Date(a.executedAt).getTime() - new Date(b.executedAt).getTime(),
    ).pop();
    if (!calc) throw new BadRequestException('Cannot generate a report before a calculation has been run');

    const approval = await this.approvalRepo.findOne({
      where: { request: { id: requestId } },
      relations: ['approver'],
      order: { at: 'DESC' },
    });

    const pdfBuffer = await this.renderPdf(request, calc.outputsSnapshot, approval);
    const uploaded = await this.upload.uploadRaw(pdfBuffer, `${request.reference}.pdf`, 'kosres/valuation/reports');

    const existing = await this.reportRepo.findOne({ where: { reference: request.reference } });
    let report: ValuationReportEntity;
    if (existing) {
      existing.pdfUrl = uploaded.secureUrl;
      existing.generatedById = actorId;
      report = await this.reportRepo.save(existing);
    } else {
      report = await this.reportRepo.save(this.reportRepo.create({
        request: { id: requestId } as any,
        reference: request.reference,
        pdfUrl: uploaded.secureUrl,
        generatedById: actorId,
      }));
    }

    if (request.status === RequestStatus.VALUER_FINAL_REVIEW) {
      await this.requestsService.transition(requestId, RequestStatus.DRAFT_REPORT, actorId, 'Report generated');
    }

    return report;
  }

  // ── PDF layout ──────────────────────────────────────────────────────
  private renderPdf(request: any, breakdown: any, approval: ValuationApproval | null): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new (PDFDocument as any)({ size: 'A4', margin: 50, bufferPages: true });
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const property = request.property;
      const money = (n: number | string) => `RWF ${Math.round(Number(n)).toLocaleString('en-US')}`;

      // ── Letterhead ──
      doc.fillColor(BRAND_RED).font('Helvetica-Bold').fontSize(18).text('KOSRES LTD', { continued: false });
      doc.fillColor(INK).font('Helvetica').fontSize(8).text('KIGALI ONE STOP REAL ESTATE SERVICE');
      doc.fillColor(BRAND_RED).font('Helvetica-Oblique').fontSize(8).text('"ALL SERVICES UNDER ONE ROOF"');
      doc.moveDown(1);
      doc.strokeColor(BRAND_RED).lineWidth(1.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1.5);

      // ── Title ──
      doc.fillColor(INK).font('Helvetica-Bold').fontSize(15).text('SECURED VALUATION REPORT', { align: 'center' });
      doc.moveDown(0.3);
      const propTitle = `A ${property.propertyCategory} property${property.upi ? ` with UPI ${property.upi}` : ''}`;
      doc.font('Helvetica').fontSize(10).text(propTitle, { align: 'center' });
      if (property.location) {
        const loc = property.location;
        const locLine = [loc.village, loc.cell, loc.sector, loc.district].filter(Boolean).join(', ');
        if (locLine) doc.text(`situated at ${locLine}.`, { align: 'center' });
      }
      doc.moveDown(1.5);

      this.sectionHeader(doc, 'EXECUTIVE SUMMARY');
      this.kv(doc, 'Reference', request.reference);
      this.kv(doc, 'Purpose', String(request.purpose).replace(/_/g, ' '));
      if (request.beneficiary) this.kv(doc, 'Beneficiary', request.beneficiary);
      if (request.instructor) this.kv(doc, 'Instructor', request.instructor);
      this.kv(doc, 'Property Type', `${property.propertyCategory} — ${property.propertySubtype}`);
      if (property.tenure) this.kv(doc, 'Tenure', property.tenure);
      if (property.land?.plotSizeSqm) this.kv(doc, 'Plot Size', `Approximately ${property.land.plotSizeSqm} sqm`);
      if (property.land?.zoning) this.kv(doc, 'Zoning', property.land.zoning);
      if (property.occupancyStatus) this.kv(doc, 'Occupancy Status', property.occupancyStatus);
      doc.moveDown(1);

      this.sectionHeader(doc, 'TERMS OF ENGAGEMENT');
      doc.font('Helvetica').fontSize(9).fillColor(INK).text(
        'This valuation has been undertaken in accordance with RICS Valuation - Professional Standards, ' +
        'which incorporate the IVSC International Valuation Standards. KOSRES LTD accepts no liability for ' +
        'any direct or indirect loss arising from reliance on this report by any party other than the named client.',
        { align: 'justify' },
      );
      doc.moveDown(1);

      if (property.land || property.location) {
        this.sectionHeader(doc, 'PROPERTY FEATURES');
        if (property.location?.accessibility) this.kv(doc, 'Accessibility', property.location.accessibility);
        if (property.location?.neighborhoodQuality) this.kv(doc, 'Quality of Neighborhood', property.location.neighborhoodQuality);
        if (property.land?.topography) this.kv(doc, 'Topography', property.land.topography);
        if (property.land?.currentUse) this.kv(doc, 'Current Use', property.land.currentUse);
        doc.moveDown(1);
      }

      if (property.buildings?.length) {
        this.sectionHeader(doc, 'CONSTRUCTION DETAILS');
        property.buildings.forEach((b: any) => {
          doc.font('Helvetica-Bold').fontSize(9).fillColor(INK).text(b.name);
          doc.font('Helvetica').fontSize(9).fillColor(MUTED).text(
            [`${b.areaSqm} sqm`, b.constructionYear ? `built ${b.constructionYear}` : null, b.condition ? `condition: ${b.condition}` : null]
              .filter(Boolean).join(' · '),
          );
        });
        doc.moveDown(1);
      }

      // ── Valuation analysis table ──
      this.sectionHeader(doc, 'VALUATION ANALYSIS');
      this.row(doc, 'Land value', `${breakdown.land.areaSqm} sqm × ${money(breakdown.land.ratePerSqm)}`, money(breakdown.land.value));
      (breakdown.buildingLines ?? []).forEach((l: any) => this.row(doc, l.name, `${l.areaSqm} sqm × ${money(l.ratePerSqm)}`, money(l.replacementCost)));
      (breakdown.externalWorkLines ?? []).forEach((l: any) => this.row(doc, l.name, `${l.quantity} × ${money(l.rate)}`, money(l.cost)));
      this.row(doc, 'Total development cost', '', money(breakdown.totalDevelopmentCost), true);
      this.row(doc, `Depreciation (${(breakdown.depreciation.rate * 100).toFixed(0)}%)`, '', `-${money(breakdown.depreciation.amount)}`);
      this.row(doc, `Developer's profit (${(breakdown.developerProfit.rate * 100).toFixed(0)}%)`, '', `+${money(breakdown.developerProfit.amount)}`);
      this.row(doc, 'Development Value', '', money(breakdown.developmentValue), true);
      this.row(doc, 'Land Value', '', money(breakdown.land.value), true);
      doc.moveDown(0.3);
      doc.strokeColor(BRAND_RED).lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.3);

      const results = request.results ?? [];
      const market = results.find((r: any) => r.basis === 'market');
      const fsv = results.find((r: any) => r.basis === 'forced_sale');
      const ins = results.find((r: any) => r.basis === 'insurance');

      doc.font('Helvetica-Bold').fontSize(11).fillColor(BRAND_RED);
      if (market) this.bigRow(doc, 'OPEN MARKET VALUE', money(market.amount));
      if (fsv) this.bigRow(doc, 'FORCED SALE VALUE', money(fsv.amount));
      if (ins) this.bigRow(doc, 'INSURANCE VALUE', money(ins.amount));
      doc.moveDown(1);

      this.sectionHeader(doc, 'VALUATION DISCLAIMER');
      doc.font('Helvetica').fontSize(9).fillColor(INK).text(
        'This valuation is prepared on the assumption that the property is held under good and marketable title, ' +
        'free from onerous encumbrances or defects, and that all necessary rights of access and services are ' +
        'available. No structural survey has been undertaken. Should any of these assumptions prove incorrect, ' +
        'this valuation may need to be reviewed.',
        { align: 'justify' },
      );
      doc.moveDown(1.5);

      // ── Certificate ──
      doc.addPage();
      doc.fillColor(BRAND_RED).font('Helvetica-Bold').fontSize(14).text('VALUATION CERTIFICATE', { align: 'center' });
      doc.moveDown(1);
      doc.fillColor(INK).font('Helvetica').fontSize(10).text(
        `We hereby certify that we have carried out the assessments above and, to the best of our knowledge, ` +
        `the opinion of values as at ${new Date().toLocaleDateString('en-GB')} is set out below.`,
        { align: 'justify' },
      );
      doc.moveDown(1.5);
      if (market) this.bigRow(doc, 'OPEN MARKET VALUE', money(market.amount));
      if (fsv) this.bigRow(doc, 'FORCED SALE VALUE', money(fsv.amount));
      if (ins) this.bigRow(doc, 'INSURANCE VALUE', money(ins.amount));
      doc.moveDown(2);

      doc.font('Helvetica').fontSize(10).fillColor(INK).text('FOR: KOSRES LTD');
      doc.moveDown(2);
      if (approval) {
        doc.font('Helvetica-Bold').fontSize(10).text(approval.signedName || approval.approver?.name || '');
        if (approval.licenseNumber) doc.font('Helvetica').fontSize(9).text(`License No. ${approval.licenseNumber}`);
        doc.font('Helvetica').fontSize(9).fillColor(MUTED).text(`Approved: ${new Date(approval.at).toLocaleDateString('en-GB')}`);
        if (approval.comment) { doc.moveDown(0.5); doc.fillColor(INK).text(approval.comment, { align: 'justify' }); }
      } else {
        doc.font('Helvetica-Oblique').fontSize(9).fillColor(MUTED).text('Awaiting valuer approval and signature.');
      }

      doc.moveDown(3);
      doc.fontSize(7).fillColor(MUTED).text(
        `Report Reference: ${request.reference}  ·  Generated ${new Date().toLocaleString('en-GB')}  ·  KOSRES LTD, Kigali, Rwanda`,
        { align: 'center' },
      );

      doc.end();
    });
  }

  private sectionHeader(doc: any, label: string) {
    doc.font('Helvetica-Bold').fontSize(11).fillColor(BRAND_RED).text(label);
    doc.strokeColor('#E5E7EB').lineWidth(0.5).moveTo(50, doc.y + 2).lineTo(545, doc.y + 2).stroke();
    doc.moveDown(0.5);
  }

  private kv(doc: any, label: string, value: string) {
    doc.font('Helvetica-Bold').fontSize(9).fillColor(INK).text(`${label}: `, { continued: true });
    doc.font('Helvetica').fillColor(INK).text(value);
  }

  private row(doc: any, label: string, detail: string, amount: string, bold = false) {
    const y = doc.y;
    doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9).fillColor(INK).text(label, 50, y, { width: 280 });
    doc.font('Helvetica').fontSize(8).fillColor(MUTED).text(detail, 300, y, { width: 130 });
    doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9).fillColor(INK).text(amount, 430, y, { width: 115, align: 'right' });
    doc.moveDown(0.4);
  }

  private bigRow(doc: any, label: string, amount: string) {
    const y = doc.y;
    doc.font('Helvetica-Bold').fontSize(11).fillColor(BRAND_RED).text(label, 50, y, { width: 300 });
    doc.font('Helvetica-Bold').fontSize(13).fillColor(BRAND_RED).text(amount, 300, y, { width: 245, align: 'right' });
    doc.moveDown(0.6);
  }
}
