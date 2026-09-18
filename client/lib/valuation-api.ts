// ── KOSRES Property Valuation Platform — API client ─────────────────────
// Separate from lib/api.ts (which is the main real-estate listings API) to
// keep the two feature areas' contracts independent, even though they share
// the same backend app, database, and auth.

const API_URL: string = (() => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL
  if (typeof window !== "undefined" && !window.location.hostname.includes("localhost")) {
    return "https://api.kosres.com/api"
  }
  return "http://localhost:3001/api"
})()

function authHeaders(token?: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function jsonFetch<T>(path: string, token?: string | null, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...authHeaders(token), ...(init?.headers ?? {}) },
    cache: "no-store",
  })
  const text = await res.text()
  if (!res.ok) {
    let body: any = {}
    try { body = text ? JSON.parse(text) : {} } catch {}
    throw new Error(body?.message || `Request failed: ${res.status}`)
  }
  // NestJS sends an empty body (not the literal "null") when a controller returns null/undefined —
  // e.g. GET .../by-request/:id when no property exists yet for that request.
  if (!text) return null as T
  return JSON.parse(text)
}

// ── Types ─────────────────────────────────────────────────────────────
export type RequestStatus =
  | "draft" | "submitted" | "assigned" | "data_collection" | "inspection_in_progress"
  | "information_required" | "valuer_review" | "engine_selected" | "analysis_in_progress"
  | "valuer_final_review" | "draft_report" | "approved" | "certified" | "completed"
  | "rejected" | "cancelled" | "on_hold" | "reassessment_required"

export type ValuationPurpose =
  | "loan_application" | "sale_purchase" | "insurance" | "investment" | "taxation"
  | "accounting" | "financial_reporting" | "forced_sale" | "market_value" | "other"

export interface ValuationUserRef { id: string; name: string; email: string }

export interface ValuationRequestSummary {
  id: string
  reference: string
  purpose: ValuationPurpose
  beneficiary?: string
  instructor?: string
  status: RequestStatus
  assignedValuer?: ValuationUserRef
  assignedTechnician?: ValuationUserRef
  property?: { id: string; propertyCategory: string; propertySubtype: string; upi?: string }
  createdAt: string
}

export interface ValuationRequestDetail extends ValuationRequestSummary {
  workflowTransitions: { fromStatus?: RequestStatus; toStatus: RequestStatus; reason?: string; at: string }[]
  results: ValuationResult[]
  calculations: { id: string; executedAt: string; outputsSnapshot: CostApproachBreakdown }[]
  property?: ValuationPropertyDetail
  engineVersion?: { id: string; version: number; engine?: { code: string; name: string } }
  inspections?: { id: string; status: string; inspectionDate?: string; technician?: { id: string; name: string }; notes: { id: string; field: string; observation: string }[] }[]
}

export interface ValuationResult {
  id: string
  basis: "market" | "forced_sale" | "insurance" | "land" | "development"
  amount: string | number
  currency: string
  method: "system_calculated" | "valuer_adopted"
  source?: string
  justification?: string
  valuationDate: string
}

export interface ValuationPropertyDetail {
  id: string
  upi?: string
  plotNumber?: string
  titleRef?: string
  propertyCategory: string
  propertySubtype: string
  tenure?: string
  occupancyStatus?: string
  location?: {
    province?: string; district?: string; sector?: string; cell?: string; village?: string
    accessibility?: string; neighborhoodQuality?: string
  }
  land?: { plotSizeSqm?: number; zoning?: string; topography?: string }
  buildings: { id: string; name: string; areaSqm: number; constructionYear?: number; condition?: string }[]
  externalWorks: { id: string; name: string; unit: string; quantity: number }[]
}

export interface CostApproachBreakdown {
  land: { areaSqm: number; ratePerSqm: number; value: number; source: string }
  buildingLines: { name: string; areaSqm: number; ratePerSqm: number; replacementCost: number }[]
  buildingSubtotal: number
  externalWorkLines: { name: string; unit: string; quantity: number; rate: number; cost: number }[]
  externalWorksSubtotal: number
  totalDevelopmentCost: number
  depreciation: { rate: number; amount: number; ruleCode: string; ruleVersion: number }
  depreciatedReplacementCost: number
  developerProfit: { rate: number; completionPercentage: number; amount: number; ruleCode: string; ruleVersion: number }
  developmentValue: number
  openMarketValue: number
}

export interface CalculationRule {
  id: string
  type: "depreciation_flat_rate" | "developer_profit" | "forced_sale_percentage" | "insurance_value_rule"
  code: string
  name: string
  params: Record<string, number>
  version: number
  status: string
}

export interface RateTableEntry {
  id: string; key: string; unit: string; rate: number
  district?: string; propertyCategory?: string
}
export interface RateTable {
  id: string; type: "land" | "building_component" | "external_work"
  name: string; version: number; status: string; entries: RateTableEntry[]
}

// ── Requests ──────────────────────────────────────────────────────────
export function getRequests(token: string, status?: RequestStatus) {
  const qs = status ? `?status=${status}` : ""
  return jsonFetch<ValuationRequestSummary[]>(`/valuation/requests${qs}`, token)
}
export function getRequest(token: string, id: string) {
  return jsonFetch<ValuationRequestDetail>(`/valuation/requests/${id}`, token)
}
export function createRequest(token: string, data: { purpose: ValuationPurpose; beneficiary?: string; instructor?: string }) {
  return jsonFetch<ValuationRequestSummary>(`/valuation/requests`, token, { method: "POST", body: JSON.stringify(data) })
}
export function assignRequest(token: string, id: string, data: { assignedValuerId?: string; assignedTechnicianId?: string }) {
  return jsonFetch<ValuationRequestDetail>(`/valuation/requests/${id}/assign`, token, { method: "PATCH", body: JSON.stringify(data) })
}
export function transitionRequest(token: string, id: string, toStatus: RequestStatus, reason?: string) {
  return jsonFetch<ValuationRequestDetail>(`/valuation/requests/${id}/transition`, token, { method: "PATCH", body: JSON.stringify({ toStatus, reason }) })
}
export function selectEngine(token: string, id: string, engineVersionId: string) {
  return jsonFetch<ValuationRequestDetail>(`/valuation/requests/${id}/select-engine`, token, { method: "PATCH", body: JSON.stringify({ engineVersionId }) })
}
export function getAssignableUsers(token: string, role: "valuer" | "technician") {
  return jsonFetch<{ id: string; name: string; email: string }[]>(`/valuation/requests/assignable-users?role=${role}`, token)
}
export function approveRequest(token: string, id: string, data: { comment?: string; signedName?: string; licenseNumber?: string }) {
  return jsonFetch<ValuationRequestDetail>(`/valuation/requests/${id}/approve`, token, { method: "PATCH", body: JSON.stringify(data) })
}
export function addAdjustment(token: string, resultId: string, data: { newValue: number; reason: string }) {
  return jsonFetch<ValuationResult>(`/valuation/calculations/results/${resultId}/adjustments`, token, { method: "POST", body: JSON.stringify(data) })
}
export interface ValuationReport { id: string; reference: string; pdfUrl: string; generatedAt: string }
export function generateReport(token: string, requestId: string) {
  return jsonFetch<ValuationReport>(`/valuation/requests/${requestId}/report`, token, { method: "POST" })
}
export function getReport(token: string, requestId: string): Promise<ValuationReport | null> {
  return jsonFetch<ValuationReport>(`/valuation/requests/${requestId}/report`, token).catch(() => null)
}

// ── Inspections ─────────────────────────────────────────────────────────────
export interface InspectionSummary {
  id: string; status: string; inspectionDate?: string
  request: { id: string; reference: string; status: RequestStatus; property?: ValuationPropertyDetail }
  notes: { id: string; field: string; observation: string; createdAt: string }[]
}
export function getMyInspections(token: string) {
  return jsonFetch<InspectionSummary[]>(`/valuation/inspections/mine`, token)
}
export function getInspection(token: string, id: string) {
  return jsonFetch<InspectionSummary>(`/valuation/inspections/${id}`, token)
}
export function createInspection(token: string, requestId: string, technicianId: string) {
  return jsonFetch<InspectionSummary>(`/valuation/inspections`, token, { method: "POST", body: JSON.stringify({ requestId, technicianId }) })
}
export function addInspectionNote(token: string, inspectionId: string, field: string, observation: string) {
  return jsonFetch(`/valuation/inspections/${inspectionId}/notes`, token, { method: "POST", body: JSON.stringify({ field, observation }) })
}
export function submitInspection(token: string, inspectionId: string, inspectionDate: string) {
  return jsonFetch<InspectionSummary>(`/valuation/inspections/${inspectionId}/submit`, token, { method: "PATCH", body: JSON.stringify({ inspectionDate }) })
}
export async function uploadPropertyImage(token: string, propertyId: string, file: File, category?: string, description?: string) {
  const fd = new FormData()
  fd.append("file", file)
  if (category) fd.append("category", category)
  if (description) fd.append("description", description)
  const res = await fetch(`${API_URL}/valuation/properties/${propertyId}/images`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  })
  if (!res.ok) throw new Error("Failed to upload photo")
  return res.json()
}

// ── Comparables (Sales Comparison) ────────────────────────────────────────
export interface ComparableProperty {
  id: string; district?: string; sector?: string
  plotAreaSqm?: number; buildingAreaSqm?: number; bedrooms?: number; ageYears?: number
  condition?: string; accessibility?: string; cbdDistanceKm?: number
  source?: string; verificationStatus: string
  transactions: { id: string; transactionDate: string; price: number; pricePerSqm?: number }[]
}
export interface ComparableSelectionRow {
  id: string; included: boolean
  adjustments: { factor: string; amount: number; reason: string }[] | null
  valuerComment?: string
  comparableProperty: ComparableProperty
}
export function getComparables(token: string, district?: string) {
  return jsonFetch<ComparableProperty[]>(`/valuation/comparables${district ? `?district=${encodeURIComponent(district)}` : ""}`, token)
}
export function createComparable(token: string, data: any) {
  return jsonFetch<ComparableProperty>(`/valuation/comparables`, token, { method: "POST", body: JSON.stringify(data) })
}
export function getSelectionsForRequest(token: string, requestId: string) {
  return jsonFetch<ComparableSelectionRow[]>(`/valuation/comparables/for-request/${requestId}`, token)
}
export function addComparableSelection(token: string, requestId: string, comparablePropertyId: string) {
  return jsonFetch<ComparableSelectionRow>(`/valuation/comparables/for-request/${requestId}`, token, { method: "POST", body: JSON.stringify({ comparablePropertyId }) })
}
export function updateComparableSelection(token: string, id: string, data: { included?: boolean; adjustments?: { factor: string; amount: number; reason: string }[]; valuerComment?: string }) {
  return jsonFetch<ComparableSelectionRow>(`/valuation/comparables/selections/${id}`, token, { method: "PATCH", body: JSON.stringify(data) })
}
export function removeComparableSelection(token: string, id: string) {
  return jsonFetch<void>(`/valuation/comparables/selections/${id}`, token, { method: "DELETE" })
}
export interface RunSalesComparisonInput {
  requestId: string; engineVersionId: string
  comparables: { id: string; label: string; price: number; included: boolean; adjustments: { factor: string; amount: number; reason: string }[] }[]
  forcedSaleRuleCode?: string; forcedSaleRuleVersion?: number
  valuationDate: string
}
export function runSalesComparison(token: string, input: RunSalesComparisonInput) {
  return jsonFetch<{ id: string; outputsSnapshot: any; results: ValuationResult[] }>(`/valuation/calculations/sales-comparison`, token, { method: "POST", body: JSON.stringify(input) })
}

export interface RunIncomeApproachInput {
  requestId: string; engineVersionId: string
  units: { name: string; unitType: string; monthlyRent: number; occupancyRate: number }[]
  otherAnnualIncome?: number
  operatingExpenses: { name: string; annualAmount: number }[]
  adoptedCapRate: number
  capRateSource: string
  forcedSaleRuleCode?: string; forcedSaleRuleVersion?: number
  valuationDate: string
}
export function runIncomeApproach(token: string, input: RunIncomeApproachInput) {
  return jsonFetch<{ id: string; outputsSnapshot: any; results: ValuationResult[] }>(`/valuation/calculations/income-approach`, token, { method: "POST", body: JSON.stringify(input) })
}

export interface RunAvsInput {
  requestId: string; engineVersionId: string
  topN?: number; minScore?: number
  forcedSaleRuleCode?: string; forcedSaleRuleVersion?: number
  valuationDate: string
}
export function runAvs(token: string, input: RunAvsInput) {
  return jsonFetch<{ id: string; outputsSnapshot: any; results: ValuationResult[] }>(`/valuation/calculations/avs`, token, { method: "POST", body: JSON.stringify(input) })
}

// ── Properties ────────────────────────────────────────────────────────
export function getPropertyByRequest(token: string, requestId: string) {
  return jsonFetch<ValuationPropertyDetail | null>(`/valuation/properties/by-request/${requestId}`, token)
}
export function createProperty(token: string, requestId: string, data: Partial<ValuationPropertyDetail>) {
  return jsonFetch<ValuationPropertyDetail>(`/valuation/properties/by-request/${requestId}`, token, { method: "POST", body: JSON.stringify(data) })
}
export function updatePropertyLocation(token: string, propertyId: string, data: any) {
  return jsonFetch(`/valuation/properties/${propertyId}/location`, token, { method: "PATCH", body: JSON.stringify(data) })
}
export function updatePropertyLand(token: string, propertyId: string, data: any) {
  return jsonFetch(`/valuation/properties/${propertyId}/land`, token, { method: "PATCH", body: JSON.stringify(data) })
}
export function addBuilding(token: string, propertyId: string, data: any) {
  return jsonFetch(`/valuation/properties/${propertyId}/buildings`, token, { method: "POST", body: JSON.stringify(data) })
}
export function addExternalWork(token: string, propertyId: string, data: any) {
  return jsonFetch(`/valuation/properties/${propertyId}/external-works`, token, { method: "POST", body: JSON.stringify(data) })
}

// ── Rate tables & calculation rules ──────────────────────────────────
export function getRateTables(token: string, type?: string) {
  const qs = type ? `?type=${type}` : ""
  return jsonFetch<RateTable[]>(`/valuation/rate-tables${qs}`, token)
}
export function getCalculationRules(token: string, type?: string) {
  const qs = type ? `?type=${type}` : ""
  return jsonFetch<CalculationRule[]>(`/valuation/calculation-rules${qs}`, token)
}

// ── Calculations ──────────────────────────────────────────────────────
export interface RunCostApproachInput {
  requestId: string
  engineVersionId: string
  landAreaSqm: number
  adoptedLandRatePerSqm: number
  landRateSource: string
  buildingComponents: { name: string; areaSqm: number; adoptedRatePerSqm: number }[]
  externalWorks: { name: string; unit: "SQM" | "LINEAR_M" | "ITEM" | "LUMP_SUM"; quantity: number; adoptedRate: number }[]
  depreciationRuleCode: string
  depreciationRuleVersion: number
  developerProfitRuleCode: string
  developerProfitRuleVersion: number
  developerProfitCompletionPercentage?: number
  forcedSaleRuleCode?: string
  forcedSaleRuleVersion?: number
  insuranceValue?: { method: "VALUER_ADOPTED"; amount: number; source: string; justification: string }
  valuationDate: string
}
export function runCostApproach(token: string, input: RunCostApproachInput) {
  return jsonFetch<{ id: string; outputsSnapshot: CostApproachBreakdown; results: ValuationResult[] }>(
    `/valuation/calculations/cost-approach`, token, { method: "POST", body: JSON.stringify(input) },
  )
}

// ── Engines ──
export function getActiveEngineVersion(token: string, code: string) {
  return jsonFetch<{ id: string; version: number }>(`/valuation/engines/${code}/active-version`, token)
}
