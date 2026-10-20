import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ValuationRequest, WorkflowTransition, RequestStatus, ValuationPurpose } from '../entities/valuation-request.entity';
import { ValuationApproval } from '../entities/valuation-approval.entity';
import { User, UserRole } from '../../users/user.entity';

const ALLOWED_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  [RequestStatus.DRAFT]: [RequestStatus.SUBMITTED, RequestStatus.CANCELLED],
  [RequestStatus.SUBMITTED]: [RequestStatus.ASSIGNED, RequestStatus.REJECTED, RequestStatus.CANCELLED],
  [RequestStatus.ASSIGNED]: [RequestStatus.DATA_COLLECTION, RequestStatus.ON_HOLD, RequestStatus.CANCELLED],
  [RequestStatus.DATA_COLLECTION]: [RequestStatus.INSPECTION_IN_PROGRESS, RequestStatus.VALUER_REVIEW, RequestStatus.INFORMATION_REQUIRED, RequestStatus.ON_HOLD],
  [RequestStatus.INSPECTION_IN_PROGRESS]: [RequestStatus.VALUER_REVIEW, RequestStatus.INFORMATION_REQUIRED, RequestStatus.ON_HOLD],
  [RequestStatus.INFORMATION_REQUIRED]: [RequestStatus.DATA_COLLECTION, RequestStatus.INSPECTION_IN_PROGRESS, RequestStatus.VALUER_REVIEW, RequestStatus.CANCELLED],
  [RequestStatus.VALUER_REVIEW]: [RequestStatus.ENGINE_SELECTED, RequestStatus.INFORMATION_REQUIRED, RequestStatus.REASSESSMENT_REQUIRED, RequestStatus.ON_HOLD],
  [RequestStatus.ENGINE_SELECTED]: [RequestStatus.ANALYSIS_IN_PROGRESS],
  [RequestStatus.ANALYSIS_IN_PROGRESS]: [RequestStatus.VALUER_FINAL_REVIEW, RequestStatus.REASSESSMENT_REQUIRED],
  [RequestStatus.VALUER_FINAL_REVIEW]: [RequestStatus.DRAFT_REPORT, RequestStatus.REASSESSMENT_REQUIRED],
  [RequestStatus.DRAFT_REPORT]: [RequestStatus.APPROVED, RequestStatus.VALUER_FINAL_REVIEW],
  [RequestStatus.APPROVED]: [RequestStatus.CERTIFIED],
  [RequestStatus.CERTIFIED]: [RequestStatus.COMPLETED],
  [RequestStatus.COMPLETED]: [],
  [RequestStatus.REJECTED]: [],
  [RequestStatus.CANCELLED]: [],
  [RequestStatus.ON_HOLD]: [RequestStatus.DATA_COLLECTION, RequestStatus.INSPECTION_IN_PROGRESS, RequestStatus.VALUER_REVIEW, RequestStatus.CANCELLED],
  [RequestStatus.REASSESSMENT_REQUIRED]: [RequestStatus.DATA_COLLECTION, RequestStatus.ANALYSIS_IN_PROGRESS],
};

@Injectable()
export class ValuationRequestsService {
  constructor(
    @InjectRepository(ValuationRequest) private repo: Repository<ValuationRequest>,
    @InjectRepository(WorkflowTransition) private transitionRepo: Repository<WorkflowTransition>,
    @InjectRepository(ValuationApproval) private approvalRepo: Repository<ValuationApproval>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  /** Used to populate "assign technician/valuer" pickers — scoped to active users of the given role. */
  findUsersByRole(role: UserRole) {
    // Admins hold every valuation role, so they are always assignable as
    // valuer/technician -- lets an admin run a case end to end on their own.
    const roles = role === UserRole.ADMIN ? [role] : [role, UserRole.ADMIN];
    return this.userRepo.find({ where: { role: In(roles), isActive: true }, select: ['id', 'name', 'email', 'role'] });
  }

  private async nextReference(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.repo
      .createQueryBuilder('r')
      .where('r.reference LIKE :prefix', { prefix: `VAL-${year}-%` })
      .getCount();
    return `VAL-${year}-${String(count + 1).padStart(6, '0')}`;
  }

  async create(data: { purpose: ValuationPurpose; beneficiary?: string; instructor?: string; createdById: string; customerId?: string }) {
    const reference = await this.nextReference();
    const request = this.repo.create({
      reference,
      purpose: data.purpose,
      beneficiary: data.beneficiary,
      instructor: data.instructor,
      status: RequestStatus.DRAFT,
      createdBy: { id: data.createdById } as any,
      customer: data.customerId ? ({ id: data.customerId } as any) : undefined,
    });
    const saved = await this.repo.save(request);
    await this.logTransition(saved.id, null, RequestStatus.DRAFT, data.createdById, 'Request created');
    return saved;
  }

  findAll(status?: RequestStatus) {
    return this.repo.find({
      where: status ? { status } : {},
      relations: ['property', 'assignedValuer', 'assignedTechnician'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const request = await this.repo.findOne({
      where: { id },
      relations: [
        'property', 'property.location', 'property.land', 'property.buildings', 'property.externalWorks',
        'assignedValuer', 'assignedTechnician', 'customer',
        'calculations', 'calculations.engineVersion', 'calculations.engineVersion.engine',
        'results', 'results.calculation', 'workflowTransitions',
        'engineVersion', 'engineVersion.engine',
        'inspections', 'inspections.technician', 'inspections.notes',
      ],
    });
    if (!request) throw new NotFoundException('Valuation request not found');
    return request;
  }

  async updateDetails(id: string, data: { beneficiary?: string; instructor?: string }) {
    await this.findOne(id);
    const patch: any = {};
    if (data.beneficiary !== undefined) patch.beneficiary = data.beneficiary?.trim() || null;
    if (data.instructor !== undefined) patch.instructor = data.instructor?.trim() || null;
    if (Object.keys(patch).length) await this.repo.update(id, patch);
    return this.findOne(id);
  }

  async assign(id: string, data: { assignedValuerId?: string; assignedTechnicianId?: string }, actorId: string) {
    await this.findOne(id);
    await this.repo.update(id, {
      assignedValuer: data.assignedValuerId ? ({ id: data.assignedValuerId } as any) : undefined,
      assignedTechnician: data.assignedTechnicianId ? ({ id: data.assignedTechnicianId } as any) : undefined,
    });
    await this.transition(id, RequestStatus.ASSIGNED, actorId, 'Assigned valuer/technician');
    return this.findOne(id);
  }

  async transition(id: string, toStatus: RequestStatus, actorId: string, reason?: string) {
    const request = await this.repo.findOneOrFail({ where: { id } });
    const allowed = ALLOWED_TRANSITIONS[request.status] ?? [];
    if (!allowed.includes(toStatus)) {
      throw new BadRequestException(`Cannot move from ${request.status} to ${toStatus}`);
    }
    await this.logTransition(id, request.status, toStatus, actorId, reason);
    await this.repo.update(id, { status: toStatus });
    return this.findOne(id);
  }

  private logTransition(requestId: string, fromStatus: RequestStatus | null, toStatus: RequestStatus, actorId: string, reason?: string) {
    return this.transitionRepo.save(
      this.transitionRepo.create({ request: { id: requestId } as any, fromStatus: fromStatus ?? undefined, toStatus, actorId, reason }),
    );
  }

  /**
   * Sets which engine is currently "active" for this request. The FIRST
   * selection (from VALUER_REVIEW) also advances the workflow, since that's
   * the genuine "methodology chosen" milestone. Selecting again later —
   * e.g. a valuer wants to compare Cost Approach against Sales Comparison —
   * just switches which engine's panel/ledger is active without touching
   * status or discarding any previous engine's calculation history: every
   * Calculation row keeps its own engineVersion reference regardless of
   * which one the request currently points to.
   */
  async selectEngine(id: string, engineVersionId: string, actorId: string) {
    const request = await this.repo.findOneOrFail({ where: { id } });
    await this.repo.update(id, { engineVersion: { id: engineVersionId } as any });
    if (request.status === RequestStatus.VALUER_REVIEW) {
      return this.transition(id, RequestStatus.ENGINE_SELECTED, actorId, 'Engine selected by valuer');
    }
    await this.logTransition(id, request.status, request.status, actorId, 'Switched valuation methodology');
    return this.findOne(id);
  }

  /**
   * Records a formal Approval entry (decision + signed name/license) and
   * advances the workflow. Used at the DRAFT_REPORT → APPROVED step, which
   * is the one transition that's a genuine sign-off rather than a routine
   * status change — every other transition just logs a WorkflowTransition.
   */
  async approve(id: string, approverId: string, data: { comment?: string; signedName?: string; licenseNumber?: string }) {
    const request = await this.repo.findOneOrFail({ where: { id } });
    if (request.status !== RequestStatus.DRAFT_REPORT) {
      throw new BadRequestException('Can only approve a request that is in Draft Report status');
    }
    await this.approvalRepo.save(this.approvalRepo.create({
      request: { id } as any,
      approver: { id: approverId } as any,
      decision: 'approved',
      comment: data.comment,
      signedName: data.signedName,
      licenseNumber: data.licenseNumber,
    }));
    await this.transition(id, RequestStatus.APPROVED, approverId, 'Approved and signed off by valuer');
    // Sign-off is the only real decision; certification and completion follow automatically.
    await this.transition(id, RequestStatus.CERTIFIED, approverId, 'Certified automatically on approval');
    return this.transition(id, RequestStatus.COMPLETED, approverId, 'Completed automatically on approval');
  }

  /**
   * One-click path for a valuer/admin who does the whole job: moves an early-stage request
   * (draft, submitted, assigned, data collection, inspection, info required, on hold) straight
   * to VALUER_REVIEW, logging each hop, and assigns the caller as valuer if none is set.
   */
  async fastTrack(id: string, actorId: string) {
    let request = await this.repo.findOneOrFail({ where: { id }, relations: ['assignedValuer'] });
    const chain = [RequestStatus.DRAFT, RequestStatus.SUBMITTED, RequestStatus.ASSIGNED, RequestStatus.DATA_COLLECTION];
    const early = [...chain, RequestStatus.INSPECTION_IN_PROGRESS, RequestStatus.INFORMATION_REQUIRED, RequestStatus.ON_HOLD];
    if (!early.includes(request.status)) {
      throw new BadRequestException(`Fast track only applies to early-stage requests (currently ${request.status})`);
    }
    if (!request.assignedValuer) await this.repo.update(id, { assignedValuer: { id: actorId } as any });
    let idx = chain.indexOf(request.status);
    if (idx >= 0) {
      for (let i = idx + 1; i < chain.length; i++) await this.transition(id, chain[i], actorId, 'Fast track');
    }
    request = await this.repo.findOneOrFail({ where: { id } });
    if (request.status !== RequestStatus.VALUER_REVIEW) await this.transition(id, RequestStatus.VALUER_REVIEW, actorId, 'Fast track');
    return this.findOne(id);
  }
}
