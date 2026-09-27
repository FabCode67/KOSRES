"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Loader2, Plus, Trash2, Calculator, Check, AlertCircle,
  MapPin, Building2, Hammer, ChevronRight, FileText, Edit3, ShieldCheck, ArrowRight, X,
} from "lucide-react"
import {
  getRequest, getPropertyByRequest, createProperty, updatePropertyLocation, updatePropertyLand,
  addBuilding, addExternalWork, getRateTables, getCalculationRules,
  getActiveEngineVersion, selectEngine, runCostApproach, transitionRequest,
  approveRequest, addAdjustment, generateReport, getReport,
  getComparables, getSelectionsForRequest, addComparableSelection, updateComparableSelection, removeComparableSelection, runSalesComparison,
  runIncomeApproach, getAssignableUsers, createInspection, runAvs, addService, addAmenity,
} from "@/lib/valuation-api"
import type {
  ValuationRequestDetail, ValuationPropertyDetail, RateTable, CalculationRule, CostApproachBreakdown, RequestStatus, ValuationResult, ValuationReport,
  ComparableProperty, ComparableSelectionRow,
} from "@/lib/valuation-api"

const inp = "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[oklch(0.42_0.19_25)/25]"
const lbl = "mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500"

function fmt(n: number | string) {
  const v = typeof n === "string" ? Number(n) : n
  return "RWF " + Math.round(v).toLocaleString("en-US")
}

function normalizeKey(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "_")
}

// ── Reference option lists (Rwanda-specific where relevant) ─────────────────
const PROVINCES = ["Kigali City", "Southern Province", "Northern Province", "Eastern Province", "Western Province"]
const DISTRICTS = [
  "Gasabo", "Kicukiro", "Nyarugenge",
  "Huye", "Gisagara", "Kamonyi", "Muhanga", "Nyamagabe", "Nyanza", "Nyaruguru", "Ruhango",
  "Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo",
  "Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana",
  "Karongi", "Ngororero", "Nyabihu", "Nyamasheke", "Rubavu", "Rusizi", "Rutsiro",
]
const ACCESSIBILITY_OPTIONS = ["Footway", "Murram", "Cobble", "Tarmac"]
const ZONING_OPTIONS = [
  "A1-Agriculture zone", "R1-Residential zone", "R2-Residential zone", "R3-Residential zone",
  "C1-Commercial zone", "C2-Commercial zone", "I1-Industrial zone", "MU-Mixed use zone",
  "PF-Public facility zone", "GR-Green/recreation zone", "T1-Road reserve",
]
const TOPOGRAPHY_OPTIONS = ["Flat", "Gently sloping", "Moderately sloping", "Steeply sloping", "Undulating", "Hilly"]
const SERVICE_TYPE_OPTIONS = ["water", "electricity", "drainage", "internet", "gas", "sewage"]
const SUBTYPES_BY_CATEGORY: Record<string, string[]> = {
  residential: ["House", "Apartment", "Villa", "Bungalow", "Townhouse", "Duplex"],
  commercial: ["Office", "Retail / Shop", "Commercial Building", "Warehouse", "Hotel"],
  industrial: ["Factory", "Warehouse", "Industrial Plot"],
  agricultural: ["Farm", "Plantation", "Agricultural Land"],
  land: ["Residential Plot", "Commercial Plot", "Agricultural Plot"],
  special_purpose: ["School", "Hospital", "Church", "Government Building"],
}
const BUILDING_NAME_OPTIONS = ["Main house", "Annex I", "Annex II", "Boys' quarters", "Garage", "Store", "Guard house", "Detached kitchen"]
const EXTERNAL_WORK_OPTIONS = ["Site leveling", "Retaining wall", "Perimeter fence", "Entrance gate", "Parking shed", "Paved driveway/compound", "Water tank", "Septic tank / foul drainage", "Guard house", "Landscaping"]
const AMENITY_OPTIONS = ["School", "Hospital / Health center", "Market", "Church", "Mosque", "Bus park / Taxi park", "Main road / CBD access", "Police station", "Bank", "Fuel station"]

/**
 * A dropdown of common values with a final "Other…" option that reveals a
 * free-text input — keeps data entry fast for the common cases while never
 * blocking a genuinely unusual value (matches the "configurable, not a fixed
 * enum" principle for property subtypes/zoning/accessibility categories).
 */
function SelectOrOther({ value, onChange, options, placeholder, className }: { value: string; onChange: (v: string) => void; options: string[]; placeholder?: string; className: string }) {
  const isCustom = value !== "" && !options.includes(value)
  const [customMode, setCustomMode] = useState(isCustom)

  if (customMode) {
    return (
      <div className="flex gap-1">
        <input value={value} onChange={(e) => onChange(e.target.value)} className={className} placeholder={placeholder} autoFocus />
        <button type="button" onClick={() => { setCustomMode(false); onChange("") }} title="Back to list" className="flex-none rounded-lg border border-border px-2 text-xs text-muted-foreground hover:bg-muted">
          <X size={12} />
        </button>
      </div>
    )
  }
  return (
    <select
      value={options.includes(value) ? value : ""}
      onChange={(e) => { if (e.target.value === "__other__") { setCustomMode(true); onChange("") } else onChange(e.target.value) }}
      className={className}
    >
      <option value="">—</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
      <option value="__other__">Other (type your own)…</option>
    </select>
  )
}

// The single "happy path" forward status from each status — mirrors the
// backend's ALLOWED_TRANSITIONS map but only the preferred branch; the
// backend still enforces the full rule set regardless of what the UI offers.
const PREFERRED_NEXT: Partial<Record<RequestStatus, RequestStatus>> = {
  draft: "submitted",
  submitted: "assigned",
  assigned: "data_collection",
  data_collection: "valuer_review",
  valuer_final_review: "draft_report",
  approved: "certified",
  certified: "completed",
}
const STATUS_LABEL: Record<string, string> = {
  draft: "Draft", submitted: "Submitted", assigned: "Assigned", data_collection: "Data collection",
  inspection_in_progress: "Inspection", information_required: "Information required", valuer_review: "Valuer review",
  engine_selected: "Engine selected", analysis_in_progress: "Analysis in progress", valuer_final_review: "Final review",
  draft_report: "Draft report", approved: "Approved", certified: "Certified", completed: "Completed",
  rejected: "Rejected", cancelled: "Cancelled", on_hold: "On hold", reassessment_required: "Reassessment required",
}

export default function ValuationRequestDetailPage() {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  const params = useParams()
  const requestId = params.id as string

  const [request, setRequest] = useState<ValuationRequestDetail | null>(null)
  const [property, setProperty] = useState<ValuationPropertyDetail | null>(null)
  const [report, setReport] = useState<ValuationReport | null>(null)
  const [rateTables, setRateTables] = useState<{ land: RateTable[]; building: RateTable[]; external: RateTable[] }>({ land: [], building: [], external: [] })
  const [rules, setRules] = useState<{ depreciation?: CalculationRule; profit?: CalculationRule; forcedSale?: CalculationRule }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    if (!token) return
    setError("")
    try {
      const [req, prop] = await Promise.all([getRequest(token, requestId), getPropertyByRequest(token, requestId)])
      setRequest(req)
      setProperty(prop)
      getReport(token, requestId).then(setReport)
    } catch (e: any) {
      setError(e?.message || "Failed to load this request. Check that the API is reachable and you're logged in.")
    } finally {
      setLoading(false)
    }
  }, [token, requestId])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!token) return
    Promise.all([
      getRateTables(token, "land"), getRateTables(token, "building_component"), getRateTables(token, "external_work"),
      getCalculationRules(token, "depreciation_flat_rate"), getCalculationRules(token, "developer_profit"), getCalculationRules(token, "forced_sale_percentage"),
    ]).then(([land, building, external, dep, profit, fsv]) => {
      setRateTables({ land, building, external })
      setRules({ depreciation: dep.find((r) => r.status === "active"), profit: profit.find((r) => r.status === "active"), forcedSale: fsv.find((r) => r.status === "active") })
    }).catch(() => {})
  }, [token])

  const buildingRateOptions = useMemo(() => rateTables.building.flatMap((t) => t.entries), [rateTables])
  const externalRateOptions = useMemo(() => rateTables.external.flatMap((t) => t.entries), [rateTables])
  const suggestedLandRate = rateTables.land.flatMap((t) => t.entries)[0]?.rate

  if (loading) {
    return <div className="flex items-center justify-center py-32"><Loader2 size={26} className="animate-spin text-muted-foreground" /></div>
  }
  if (error) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <AlertCircle size={22} className="mx-auto mb-2 text-red-600" />
        <p className="mb-1 text-sm font-semibold text-red-800">Couldn't load this request</p>
        <p className="mb-4 text-xs text-red-700">{error}</p>
        <button onClick={load} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700">Retry</button>
      </div>
    )
  }
  if (!request) return <p className="text-sm text-muted-foreground">Request not found.</p>

  const engineCode = request.engineVersion?.engine?.code
  // Scope to the currently active engine — request.calculations/results accumulate
  // history from every engine ever tried on this request, so picking the globally
  // latest one could show a different engine's numbers than the one selected now.
  const engineCalculations = request.calculations.filter((c) => c.engineVersion?.engine?.code === engineCode)
  const latestCalc = engineCalculations[engineCalculations.length - 1]
  const latestBreakdown = latestCalc?.outputsSnapshot
  const currentResults = latestCalc ? request.results.filter((r) => r.calculation?.id === latestCalc.id) : []

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/valuation" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> All requests
      </Link>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="mb-1 font-mono text-xs font-semibold text-muted-foreground">{request.reference}</p>
          <h1 className="font-heading text-3xl font-bold text-slate-800">
            {property?.upi ? `Plot ${property.upi}` : "New valuation"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {request.beneficiary ? `For ${request.beneficiary}` : "No beneficiary set"}
          </p>
        </div>
      </div>

      <WorkflowStepper token={token!} request={request} onChanged={load} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Left: worksheet ── */}
        <div className="space-y-5 lg:col-span-2">
          {!property ? (
            <PropertyIntakeCard token={token!} requestId={requestId} onCreated={load} />
          ) : (
            <>
              <LocationCard token={token!} property={property} onSaved={load} />
              <LandCard token={token!} property={property} suggestedRate={suggestedLandRate} onSaved={load} />
              <BuildingsCard token={token!} property={property} presets={buildingRateOptions} onSaved={load} />
              <ExternalWorksCard token={token!} property={property} presets={externalRateOptions} onSaved={load} />
              <ServicesAmenitiesCard token={token!} property={property} onSaved={load} />
            </>
          )}
        </div>

        {/* ── Right: ledger ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-5">
            {property && request.status === "data_collection" && (
              <AssignInspectionCard token={token!} request={request} onAssigned={load} />
            )}

            {request.inspections && request.inspections.length > 0 && (
              <InspectionStatusCard inspections={request.inspections} />
            )}

            {property && request.status === "valuer_review" && (
              <EngineSelectionCard token={token!} requestId={request.id} onSelected={load} />
            )}

            {property && engineCode && request.status !== "valuer_review" && !(["approved", "certified", "completed"].includes(request.status)) && (
              <EngineSwitchCard token={token!} requestId={request.id} currentCode={engineCode} onSwitched={load} />
            )}

            {property && ["engine_selected", "analysis_in_progress", "valuer_final_review", "draft_report", "approved", "certified", "completed"].includes(request.status) && engineCode === "COST_APPROACH" && (
              <CalculationPanel
                token={token!}
                request={request}
                property={property}
                buildingRateOptions={buildingRateOptions}
                externalRateOptions={externalRateOptions}
                rules={rules}
                onCalculated={load}
              />
            )}

            {["engine_selected", "analysis_in_progress", "valuer_final_review", "draft_report", "approved", "certified", "completed"].includes(request.status) && engineCode === "SALES_COMPARISON" && (
              <SalesComparisonPanel token={token!} request={request} rules={rules} onCalculated={load} />
            )}

            {["engine_selected", "analysis_in_progress", "valuer_final_review", "draft_report", "approved", "certified", "completed"].includes(request.status) && engineCode === "INCOME_APPROACH" && (
              <IncomeApproachPanel token={token!} request={request} rules={rules} onCalculated={load} />
            )}

            {["engine_selected", "analysis_in_progress", "valuer_final_review", "draft_report", "approved", "certified", "completed"].includes(request.status) && engineCode === "AVS" && (
              <AvsPanel token={token!} request={request} rules={rules} onCalculated={load} />
            )}

            {latestBreakdown && engineCode === "COST_APPROACH" && (
              <ValuationLedger token={token!} breakdown={latestBreakdown} results={currentResults} onChanged={load} />
            )}
            {latestBreakdown && engineCode === "SALES_COMPARISON" && (
              <SalesComparisonLedger breakdown={latestBreakdown as any} results={currentResults} />
            )}
            {latestBreakdown && engineCode === "INCOME_APPROACH" && (
              <IncomeApproachLedger breakdown={latestBreakdown as any} results={currentResults} />
            )}
            {latestBreakdown && engineCode === "AVS" && (
              <AvsLedger token={token!} breakdown={latestBreakdown as any} results={currentResults} onChanged={load} />
            )}

            {(request.status === "valuer_final_review" || report) && (
              <ReportCard token={token!} requestId={request.id} report={report} status={request.status} onChanged={load} />
            )}

            {request.status === "draft_report" && (
              <ApproveCard token={token!} requestId={request.id} onApproved={load} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// Property intake — create the subject property record if none exists yet
// ═══════════════════════════════════════════════════════════════════════
// ═══ Workflow stepper ─ advances along the happy path; branch actions require a reason ═══
function WorkflowStepper({ token, request, onChanged }: { token: string; request: ValuationRequestDetail; onChanged: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [branchOpen, setBranchOpen] = useState(false)
  const [branchReason, setBranchReason] = useState("")

  const next = PREFERRED_NEXT[request.status]
  const terminal = ["completed", "rejected", "cancelled"].includes(request.status)
  const gated = ["valuer_review", "engine_selected", "analysis_in_progress", "valuer_final_review", "draft_report"].includes(request.status)

  const advance = async () => {
    if (!next) return
    setBusy(true); setError("")
    try { await transitionRequest(token, request.id, next); onChanged() }
    catch (e: any) { setError(e.message || "Could not advance") }
    setBusy(false)
  }

  const branch = async (toStatus: RequestStatus) => {
    setBusy(true); setError("")
    try { await transitionRequest(token, request.id, toStatus, branchReason || undefined); setBranchOpen(false); setBranchReason(""); onChanged() }
    catch (e: any) { setError(e.message || "Could not update status") }
    setBusy(false)
  }

  return (
    <div className="mb-6 rounded-xl border border-border bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[oklch(0.12_0.01_250)] px-3 py-1 text-xs font-semibold text-white">
            {STATUS_LABEL[request.status] ?? request.status}
          </span>
          {next && !terminal && (
            <>
              <ArrowRight size={13} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{STATUS_LABEL[next]}</span>
            </>
          )}
          {gated && (
            <span className="text-xs text-amber-700">
              {request.status === "valuer_review" && "— select an engine below to continue"}
              {(request.status === "engine_selected" || request.status === "analysis_in_progress") && "— run the calculation to continue"}
              {request.status === "valuer_final_review" && "— generate the report below to continue"}
              {request.status === "draft_report" && "— approve below to continue"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {next && !gated && !terminal && (
            <button onClick={advance} disabled={busy} className="flex items-center gap-1.5 rounded-lg bg-[oklch(0.42_0.19_25)] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[oklch(0.36_0.18_25)] disabled:opacity-50">
              {busy ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={12} />} Advance to {STATUS_LABEL[next]}
            </button>
          )}
          {!terminal && (
            <button onClick={() => setBranchOpen((v) => !v)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-muted">
              Other actions
            </button>
          )}
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {branchOpen && (
        <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3">
          <input value={branchReason} onChange={(e) => setBranchReason(e.target.value)} className={inp} placeholder="Reason (recommended)" />
          <div className="mt-2 flex flex-wrap gap-2">
            <button onClick={() => branch("information_required" as RequestStatus)} disabled={busy} className="rounded-md bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 hover:bg-orange-100">Request info</button>
            <button onClick={() => branch("on_hold" as RequestStatus)} disabled={busy} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200">Put on hold</button>
            <button onClick={() => branch("reassessment_required" as RequestStatus)} disabled={busy} className="rounded-md bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 hover:bg-orange-100">Reassessment needed</button>
            <button onClick={() => branch("rejected" as RequestStatus)} disabled={busy} className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100">Reject</button>
            <button onClick={() => branch("cancelled" as RequestStatus)} disabled={busy} className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══ Assign a technician for inspection ─ creates the Inspection, advances the workflow ═══
function AssignInspectionCard({ token, request, onAssigned }: { token: string; request: ValuationRequestDetail; onAssigned: () => void }) {
  const [technicians, setTechnicians] = useState<{ id: string; name: string; email: string }[]>([])
  const [selected, setSelected] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => { getAssignableUsers(token, "technician").then(setTechnicians).catch(() => {}) }, [token])

  const handleAssign = async () => {
    if (!selected) return
    setBusy(true); setError("")
    try {
      await createInspection(token, request.id, selected)
      await transitionRequest(token, request.id, "inspection_in_progress" as RequestStatus)
      onAssigned()
    } catch (e: any) {
      setError(e.message || "Failed to assign inspection")
    }
    setBusy(false)
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <h2 className="mb-2 font-heading text-base font-bold text-slate-800">Assign for inspection</h2>
      <p className="mb-3 text-xs text-muted-foreground">A technician collects and verifies property data on site before the valuer reviews it.</p>
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      {technicians.length === 0 ? (
        <p className="text-xs text-amber-700">No technician accounts found — ask an admin to create one.</p>
      ) : (
        <>
          <select value={selected} onChange={(e) => setSelected(e.target.value)} className={inp}>
            <option value="">Select a technician…</option>
            {technicians.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <button onClick={handleAssign} disabled={!selected || busy} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[oklch(0.42_0.19_25)] py-2.5 text-sm font-semibold text-white hover:bg-[oklch(0.36_0.18_25)] disabled:opacity-50">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Assign inspection
          </button>
        </>
      )}
    </div>
  )
}

// ═══ Read-only inspection status, shown to the valuer once assigned ═══
function InspectionStatusCard({ inspections }: { inspections: NonNullable<ValuationRequestDetail["inspections"]> }) {
  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <h2 className="mb-3 font-heading text-base font-bold text-slate-800">Inspection</h2>
      {inspections.map((insp) => (
        <div key={insp.id} className="mb-3 last:mb-0">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">{insp.technician?.name ?? "Unassigned"}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${insp.status === "submitted" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
              {insp.status.replace(/_/g, " ")}
            </span>
          </div>
          {insp.notes?.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {insp.notes.map((n) => (
                <div key={n.id} className="rounded-lg bg-muted/30 p-2 text-xs">
                  <span className="font-semibold text-slate-700">{n.field}: </span>
                  <span className="text-slate-600">{n.observation}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ═══ Explicit engine selection ─ required before the calculation panel unlocks ═══
function EngineSelectionCard({ token, requestId, onSelected }: { token: string; requestId: string; onSelected: () => void }) {
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState("")

  const handleSelect = async (code: "COST_APPROACH" | "SALES_COMPARISON" | "INCOME_APPROACH" | "AVS") => {
    setBusy(code); setError("")
    try {
      const engineVersion = await getActiveEngineVersion(token, code)
      await selectEngine(token, requestId, engineVersion.id)
      onSelected()
    } catch (e: any) {
      setError(e.message || "Failed to select engine")
    }
    setBusy(null)
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="mb-2 flex items-center gap-2">
        <Calculator size={16} className="text-[oklch(0.42_0.19_25)]" />
        <h2 className="font-heading text-base font-bold text-slate-800">Select valuation methodology</h2>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        The licensed valuer has final authority over methodology.
      </p>
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <div className="space-y-2">
        <button onClick={() => handleSelect("COST_APPROACH")} disabled={!!busy} className="flex w-full items-center justify-between rounded-lg border border-border px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:border-[oklch(0.42_0.19_25)] hover:bg-muted/40 disabled:opacity-50">
          <span>Cost Approach<span className="block text-xs font-normal text-muted-foreground">Depreciated replacement cost — land + development</span></span>
          {busy === "COST_APPROACH" ? <Loader2 size={14} className="animate-spin" /> : <ChevronRight size={14} />}
        </button>
        <button onClick={() => handleSelect("SALES_COMPARISON")} disabled={!!busy} className="flex w-full items-center justify-between rounded-lg border border-border px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:border-[oklch(0.42_0.19_25)] hover:bg-muted/40 disabled:opacity-50">
          <span>Sales Comparison<span className="block text-xs font-normal text-muted-foreground">Compares the subject against similar recent transactions</span></span>
          {busy === "SALES_COMPARISON" ? <Loader2 size={14} className="animate-spin" /> : <ChevronRight size={14} />}
        </button>
        <button onClick={() => handleSelect("INCOME_APPROACH")} disabled={!!busy} className="flex w-full items-center justify-between rounded-lg border border-border px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:border-[oklch(0.42_0.19_25)] hover:bg-muted/40 disabled:opacity-50">
          <span>Income Approach<span className="block text-xs font-normal text-muted-foreground">Capitalizes net operating income for rental/income-producing property</span></span>
          {busy === "INCOME_APPROACH" ? <Loader2 size={14} className="animate-spin" /> : <ChevronRight size={14} />}
        </button>
        <button onClick={() => handleSelect("AVS")} disabled={!!busy} className="flex w-full items-center justify-between rounded-lg border-2 border-dashed border-[oklch(0.42_0.19_25)/40] px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:border-[oklch(0.42_0.19_25)] hover:bg-muted/40 disabled:opacity-50">
          <span>Automated Valuation (AVS)<span className="block text-xs font-normal text-muted-foreground">System-suggested comparables, similarity-weighted — always requires your review</span></span>
          {busy === "AVS" ? <Loader2 size={14} className="animate-spin" /> : <ChevronRight size={14} />}
        </button>
      </div>
    </div>
  )
}

// ═══ Switch methodology ─ try a different engine without losing prior results ═══
function EngineSwitchCard({ token, requestId, currentCode, onSwitched }: { token: string; requestId: string; currentCode: string; onSwitched: () => void }) {
  const ENGINES: { code: "COST_APPROACH" | "SALES_COMPARISON" | "INCOME_APPROACH" | "AVS"; label: string }[] = [
    { code: "COST_APPROACH", label: "Cost Approach" },
    { code: "SALES_COMPARISON", label: "Sales Comparison" },
    { code: "INCOME_APPROACH", label: "Income Approach" },
    { code: "AVS", label: "Automated Valuation (AVS)" },
  ]
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState("")

  const handleSwitch = async (code: typeof ENGINES[number]["code"]) => {
    setBusy(code); setError("")
    try {
      const engineVersion = await getActiveEngineVersion(token, code)
      await selectEngine(token, requestId, engineVersion.id)
      setOpen(false)
      onSwitched()
    } catch (e: any) {
      setError(e.message || "Failed to switch methodology")
    }
    setBusy(null)
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2.5 text-xs font-semibold text-muted-foreground hover:border-[oklch(0.42_0.19_25)] hover:text-[oklch(0.42_0.19_25)]">
        <ChevronRight size={12} className="rotate-90" /> Try a different methodology
      </button>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <p className="mb-2 text-xs font-semibold text-slate-700">Switch valuation methodology</p>
      <p className="mb-3 text-[11px] text-muted-foreground">Past results from other methods aren't lost — you can switch back anytime.</p>
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <div className="space-y-1.5">
        {ENGINES.filter((e) => e.code !== currentCode).map((e) => (
          <button key={e.code} onClick={() => handleSwitch(e.code)} disabled={!!busy} className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:border-[oklch(0.42_0.19_25)] hover:bg-muted/40 disabled:opacity-50">
            {e.label}
            {busy === e.code ? <Loader2 size={12} className="animate-spin" /> : <ChevronRight size={12} />}
          </button>
        ))}
      </div>
      <button onClick={() => setOpen(false)} className="mt-2 text-[11px] text-muted-foreground hover:underline">Cancel</button>
    </div>
  )
}

// ═══ Approval ─ records a formal sign-off (name, license) and certifies ═══
function ApproveCard({ token, requestId, onApproved }: { token: string; requestId: string; onApproved: () => void }) {
  const [signedName, setSignedName] = useState("")
  const [licenseNumber, setLicenseNumber] = useState("")
  const [comment, setComment] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const handleApprove = async () => {
    setBusy(true); setError("")
    try {
      await approveRequest(token, requestId, { signedName: signedName || undefined, licenseNumber: licenseNumber || undefined, comment: comment || undefined })
      onApproved()
    } catch (e: any) {
      setError(e.message || "Failed to approve")
    }
    setBusy(false)
  }

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5">
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck size={16} className="text-emerald-700" />
        <h2 className="font-heading text-base font-bold text-slate-800">Approve & certify</h2>
      </div>
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <div className="space-y-2">
        <input value={signedName} onChange={(e) => setSignedName(e.target.value)} className={inp} placeholder="Valuer full name" />
        <input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} className={inp} placeholder="License number (e.g. RC/IRPV/259/2023)" />
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} className={inp} rows={2} placeholder="Remarks (optional)" />
      </div>
      <button onClick={handleApprove} disabled={busy} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
        {busy ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />} Approve valuation
      </button>
    </div>
  )
}

// ═══ Report generation ─ produces the PDF and advances to Draft Report ═══
function ReportCard({ token, requestId, report, status, onChanged }: { token: string; requestId: string; report: ValuationReport | null; status: RequestStatus; onChanged: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const handleGenerate = async () => {
    setBusy(true); setError("")
    try { await generateReport(token, requestId); onChanged() }
    catch (e: any) { setError(e.message || "Failed to generate report") }
    setBusy(false)
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="mb-2 flex items-center gap-2">
        <FileText size={16} className="text-[oklch(0.42_0.19_25)]" />
        <h2 className="font-heading text-base font-bold text-slate-800">Valuation report</h2>
      </div>
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}

      {report && (
        <a href={report.pdfUrl} target="_blank" rel="noopener noreferrer"
          className="mb-2 flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-muted">
          <span className="font-mono">{report.reference}.pdf</span>
          <span className="text-[oklch(0.42_0.19_25)]">Download ↓</span>
        </a>
      )}

      {(status === "valuer_final_review" || report) && (
        <button onClick={handleGenerate} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[oklch(0.42_0.19_25)] py-2.5 text-sm font-semibold text-white hover:bg-[oklch(0.36_0.18_25)] disabled:opacity-50">
          {busy ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />} {report ? "Regenerate report" : "Generate report"}
        </button>
      )}
    </div>
  )
}

function PropertyIntakeCard({ token, requestId, onCreated }: { token: string; requestId: string; onCreated: () => void }) {
  const [upi, setUpi] = useState("")
  const [category, setCategory] = useState("residential")
  const [subtype, setSubtype] = useState("House")
  const [tenure, setTenure] = useState("Leasehold")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const handleCreate = async () => {
    setSaving(true)
    setError("")
    try {
      await createProperty(token, requestId, { upi: upi || undefined, propertyCategory: category as any, propertySubtype: subtype, tenure })
      onCreated()
    } catch (e: any) {
      setError(e?.message || "Failed to create property")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <h2 className="mb-4 font-heading text-lg font-bold text-slate-800">Property identification</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={lbl}>UPI</label>
          <input value={upi} onChange={(e) => setUpi(e.target.value)} className={inp} placeholder="e.g. 2/08/10/05/14181" />
        </div>
        <div>
          <label className={lbl}>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inp}>
            {["residential", "commercial", "industrial", "agricultural", "land", "special_purpose"].map((c) => (
              <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={lbl}>Subtype</label>
          <SelectOrOther value={subtype} onChange={setSubtype} options={SUBTYPES_BY_CATEGORY[category] ?? []} placeholder="Type a subtype…" className={inp} />
        </div>
        <div>
          <label className={lbl}>Tenure</label>
          <select value={tenure} onChange={(e) => setTenure(e.target.value)} className={inp}>
            <option>Leasehold</option>
            <option>Freehold</option>
          </select>
        </div>
      </div>
      <button onClick={handleCreate} disabled={saving} className="mt-5 flex items-center gap-2 rounded-lg bg-[oklch(0.42_0.19_25)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[oklch(0.36_0.18_25)] disabled:opacity-60">
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Create property record
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// Land
// ═══════════════════════════════════════════════════════════════════════
// ═══ Location ─ district/sector drive AVS matching and land-rate suggestions ═══
function LocationCard({ token, property, onSaved }: { token: string; property: ValuationPropertyDetail; onSaved: () => void }) {
  const [province, setProvince] = useState(property.location?.province ?? "")
  const [district, setDistrict] = useState(property.location?.district ?? "")
  const [sector, setSector] = useState(property.location?.sector ?? "")
  const [cell, setCell] = useState(property.location?.cell ?? "")
  const [village, setVillage] = useState(property.location?.village ?? "")
  const [accessibility, setAccessibility] = useState(property.location?.accessibility ?? "")
  const [neighborhoodQuality, setNeighborhoodQuality] = useState(property.location?.neighborhoodQuality ?? "")
  const [distanceToCbdKm, setDistanceToCbdKm] = useState(property.location?.distanceToCbdKm?.toString() ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const handleSave = async () => {
    setSaving(true); setError("")
    try {
      await updatePropertyLocation(token, property.id, {
        province: province || undefined, district: district || undefined, sector: sector || undefined,
        cell: cell || undefined, village: village || undefined, accessibility: accessibility || undefined,
        neighborhoodQuality: neighborhoodQuality || undefined,
        distanceToCbdKm: distanceToCbdKm ? Number(distanceToCbdKm) : undefined,
      })
      onSaved()
    } catch (e: any) {
      setError(e?.message || "Failed to save location")
    }
    setSaving(false)
  }

  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <div className="mb-4 flex items-center gap-2">
        <MapPin size={16} className="text-[oklch(0.42_0.19_25)]" />
        <h2 className="font-heading text-lg font-bold text-slate-800">Location</h2>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">District especially matters — it drives comparable matching (Sales Comparison, AVS) and land-rate suggestions.</p>
      <div className="grid grid-cols-3 gap-4">
        <div><label className={lbl}>Province</label><SelectOrOther value={province} onChange={setProvince} options={PROVINCES} placeholder="Type province…" className={inp} /></div>
        <div><label className={lbl}>District</label><SelectOrOther value={district} onChange={setDistrict} options={DISTRICTS} placeholder="Type district…" className={inp} /></div>
        <div><label className={lbl}>Sector</label><input value={sector} onChange={(e) => setSector(e.target.value)} className={inp} placeholder="Rugarika" /></div>
        <div><label className={lbl}>Cell</label><input value={cell} onChange={(e) => setCell(e.target.value)} className={inp} placeholder="Sheli" /></div>
        <div><label className={lbl}>Village</label><input value={village} onChange={(e) => setVillage(e.target.value)} className={inp} placeholder="Kagangayire" /></div>
        <div>
          <label className={lbl}>Accessibility</label>
          <SelectOrOther value={accessibility} onChange={setAccessibility} options={ACCESSIBILITY_OPTIONS} placeholder="Type access type…" className={inp} />
        </div>
        <div><label className={lbl}>Distance to CBD (km)</label><input type="number" value={distanceToCbdKm} onChange={(e) => setDistanceToCbdKm(e.target.value)} className={inp} placeholder="4.2" /></div>
        <div className="col-span-2"><label className={lbl}>Neighborhood quality</label><input value={neighborhoodQuality} onChange={(e) => setNeighborhoodQuality(e.target.value)} className={inp} placeholder="Safe, good reputation" /></div>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <button onClick={handleSave} disabled={saving} className="mt-4 text-sm font-semibold text-[oklch(0.42_0.19_25)] hover:underline">
        {saving ? "Saving…" : "Save location"}
      </button>
    </div>
  )
}

function LandCard({ token, property, suggestedRate, onSaved }: { token: string; property: ValuationPropertyDetail; suggestedRate?: number; onSaved: () => void }) {
  const [plotSize, setPlotSize] = useState(property.land?.plotSizeSqm?.toString() ?? "")
  const [zoning, setZoning] = useState(property.land?.zoning ?? "")
  const [topography, setTopography] = useState(property.land?.topography ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const handleSave = async () => {
    setSaving(true)
    setError("")
    try {
      await updatePropertyLand(token, property.id, { plotSizeSqm: Number(plotSize) || undefined, zoning, topography })
      onSaved()
    } catch (e: any) {
      setError(e?.message || "Failed to save land details")
    }
    setSaving(false)
  }

  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <div className="mb-4 flex items-center gap-2">
        <MapPin size={16} className="text-[oklch(0.42_0.19_25)]" />
        <h2 className="font-heading text-lg font-bold text-slate-800">Land</h2>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={lbl}>Plot size (sqm)</label>
          <input type="number" value={plotSize} onChange={(e) => setPlotSize(e.target.value)} className={inp} placeholder="567" />
        </div>
        <div>
          <label className={lbl}>Zoning</label>
          <SelectOrOther value={zoning} onChange={setZoning} options={ZONING_OPTIONS} placeholder="Type zoning…" className={inp} />
        </div>
        <div>
          <label className={lbl}>Topography</label>
          <SelectOrOther value={topography} onChange={setTopography} options={TOPOGRAPHY_OPTIONS} placeholder="Type topography…" className={inp} />
        </div>
      </div>
      {suggestedRate && <p className="mt-3 text-xs text-muted-foreground">Suggested land rate on file: <span className="font-mono">{fmt(suggestedRate)}/sqm</span> — adopted in the calculation panel.</p>}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <button onClick={handleSave} disabled={saving} className="mt-4 text-sm font-semibold text-[oklch(0.42_0.19_25)] hover:underline">
        {saving ? "Saving…" : "Save land details"}
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// Buildings
// ═══════════════════════════════════════════════════════════════════════
function BuildingsCard({ token, property, presets, onSaved }: { token: string; property: ValuationPropertyDetail; presets: { key: string; rate: number }[]; onSaved: () => void }) {
  const [name, setName] = useState("")
  const [area, setArea] = useState("")
  const [year, setYear] = useState("")
  const [condition, setCondition] = useState("Good")
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState("")

  const nameOptions = useMemo(
    () => Array.from(new Set([...BUILDING_NAME_OPTIONS, ...presets.map((p) => p.key.replace(/_/g, " "))])),
    [presets]
  )

  const handleAdd = async () => {
    if (!name || !area) return
    setAdding(true)
    setError("")
    try {
      await addBuilding(token, property.id, { name, areaSqm: Number(area), constructionYear: year ? Number(year) : undefined, condition })
      setName(""); setArea(""); setYear("")
      onSaved()
    } catch (e: any) {
      setError(e?.message || "Failed to add building")
    }
    setAdding(false)
  }

  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <div className="mb-4 flex items-center gap-2">
        <Building2 size={16} className="text-[oklch(0.42_0.19_25)]" />
        <h2 className="font-heading text-lg font-bold text-slate-800">Buildings</h2>
      </div>

      {property.buildings.length > 0 && (
        <div className="mb-4 divide-y divide-border rounded-lg border border-border">
          {property.buildings.map((b) => (
            <div key={b.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span className="font-medium text-slate-700">{b.name}</span>
              <span className="font-mono text-xs text-muted-foreground">{b.areaSqm} sqm{b.constructionYear ? ` · built ${b.constructionYear}` : ""}{b.condition ? ` · ${b.condition}` : ""}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-4 gap-3">
        <SelectOrOther value={name} onChange={setName} options={nameOptions} placeholder="Type building name…" className={inp} />
        <input type="number" value={area} onChange={(e) => setArea(e.target.value)} className={inp} placeholder="Area sqm" />
        <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className={inp} placeholder="Built year" />
        <select value={condition} onChange={(e) => setCondition(e.target.value)} className={inp}>
          {["Very poor", "Poor", "Fair", "Good", "Very good", "Excellent"].map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <button onClick={handleAdd} disabled={adding || !name || !area} className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-[oklch(0.42_0.19_25)] hover:underline disabled:opacity-40">
        <Plus size={14} /> Add building
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// External works
// ═══════════════════════════════════════════════════════════════════════
function ExternalWorksCard({ token, property, presets, onSaved }: { token: string; property: ValuationPropertyDetail; presets: { key: string; unit: string; rate: number }[]; onSaved: () => void }) {
  const [name, setName] = useState("")
  const [unit, setUnit] = useState("sqm")
  const [quantity, setQuantity] = useState("")
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState("")

  const nameOptions = useMemo(
    () => Array.from(new Set([...EXTERNAL_WORK_OPTIONS, ...presets.map((p) => p.key.replace(/_/g, " "))])),
    [presets]
  )

  const handleAdd = async () => {
    if (!name || !quantity) return
    setAdding(true)
    setError("")
    try {
      await addExternalWork(token, property.id, { name, unit, quantity: Number(quantity) })
      setName(""); setQuantity("")
      onSaved()
    } catch (e: any) {
      setError(e?.message || "Failed to add external work")
    }
    setAdding(false)
  }

  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <div className="mb-4 flex items-center gap-2">
        <Hammer size={16} className="text-[oklch(0.42_0.19_25)]" />
        <h2 className="font-heading text-lg font-bold text-slate-800">External works</h2>
      </div>

      {property.externalWorks.length > 0 && (
        <div className="mb-4 divide-y divide-border rounded-lg border border-border">
          {property.externalWorks.map((w) => (
            <div key={w.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span className="font-medium text-slate-700">{w.name}</span>
              <span className="font-mono text-xs text-muted-foreground">{w.quantity} {(w.unit ?? "").toLowerCase().replace("_", " ")}</span>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}

      <div className="grid grid-cols-3 gap-3">
        <SelectOrOther value={name} onChange={setName} options={nameOptions} placeholder="Type external work…" className={inp} />
        <select value={unit} onChange={(e) => setUnit(e.target.value)} className={inp}>
          <option value="sqm">sqm</option>
          <option value="linear_m">linear m</option>
          <option value="item">item</option>
          <option value="lump_sum">lump sum</option>
        </select>
        <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className={inp} placeholder="Quantity" />
      </div>
      <button onClick={handleAdd} disabled={adding || !name || !quantity} className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-[oklch(0.42_0.19_25)] hover:underline disabled:opacity-40">
        <Plus size={14} /> Add external work
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// Calculation trigger panel — assigns rates to every line, then runs it
// ═══════════════════════════════════════════════════════════════════════
// ═══ Services & Amenities ═══
function ServicesAmenitiesCard({ token, property, onSaved }: { token: string; property: ValuationPropertyDetail; onSaved: () => void }) {
  const [serviceType, setServiceType] = useState("water")
  const [serviceStatus, setServiceStatus] = useState("connected")
  const [serviceProvider, setServiceProvider] = useState("")
  const [addingService, setAddingService] = useState(false)

  const [amenityName, setAmenityName] = useState("")
  const [amenityDistance, setAmenityDistance] = useState("")
  const [addingAmenity, setAddingAmenity] = useState(false)

  const [error, setError] = useState("")

  const handleAddService = async () => {
    setAddingService(true); setError("")
    try {
      await addService(token, property.id, { type: serviceType, status: serviceStatus, provider: serviceProvider || undefined })
      setServiceProvider("")
      onSaved()
    } catch (e: any) {
      setError(e?.message || "Failed to add service")
    }
    setAddingService(false)
  }

  const handleAddAmenity = async () => {
    if (!amenityName) return
    setAddingAmenity(true); setError("")
    try {
      await addAmenity(token, property.id, { name: amenityName, distanceKm: amenityDistance ? Number(amenityDistance) : undefined })
      setAmenityName(""); setAmenityDistance("")
      onSaved()
    } catch (e: any) {
      setError(e?.message || "Failed to add amenity")
    }
    setAddingAmenity(false)
  }

  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <h2 className="mb-4 font-heading text-lg font-bold text-slate-800">Services & Amenities</h2>
      {error && <p className="mb-3 text-xs text-red-600">{error}</p>}

      {/* Services */}
      <p className={lbl}>Services</p>
      {property.services && property.services.length > 0 && (
        <div className="mb-3 divide-y divide-border rounded-lg border border-border">
          {property.services.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-4 py-2 text-sm">
              <span className="font-medium capitalize text-slate-700">{s.type}{s.provider ? ` — ${s.provider}` : ""}</span>
              <span className={`text-xs font-semibold ${s.status === "connected" ? "text-emerald-600" : "text-slate-400"}`}>
                {s.status.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="mb-4 grid grid-cols-4 gap-2">
        <SelectOrOther value={serviceType} onChange={setServiceType} options={SERVICE_TYPE_OPTIONS} placeholder="Type service…" className={inp} />
        <select value={serviceStatus} onChange={(e) => setServiceStatus(e.target.value)} className={inp}>
          <option value="connected">Connected</option>
          <option value="not_connected">Not connected</option>
        </select>
        <input value={serviceProvider} onChange={(e) => setServiceProvider(e.target.value)} className={inp} placeholder="Provider (optional)" />
        <button onClick={handleAddService} disabled={addingService} className="flex items-center justify-center gap-1 rounded-lg bg-slate-800 text-xs font-semibold text-white hover:bg-slate-900 disabled:opacity-40">
          <Plus size={13} /> Add
        </button>
      </div>

      {/* Amenities */}
      <p className={lbl}>Nearby amenities</p>
      {property.amenities && property.amenities.length > 0 && (
        <div className="mb-3 divide-y divide-border rounded-lg border border-border">
          {property.amenities.map((a) => (
            <div key={a.id} className="flex items-center justify-between px-4 py-2 text-sm">
              <span className="text-slate-700">{a.name}</span>
              {a.distanceKm != null && <span className="font-mono text-xs text-muted-foreground">{a.distanceKm} km</span>}
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-[2fr_1fr_auto] gap-2">
        <SelectOrOther value={amenityName} onChange={setAmenityName} options={AMENITY_OPTIONS} placeholder="Type amenity…" className={inp} />
        <input type="number" value={amenityDistance} onChange={(e) => setAmenityDistance(e.target.value)} className={inp} placeholder="Distance km" />
        <button onClick={handleAddAmenity} disabled={addingAmenity || !amenityName} className="flex items-center justify-center gap-1 rounded-lg bg-slate-800 px-3 text-xs font-semibold text-white hover:bg-slate-900 disabled:opacity-40">
          <Plus size={13} /> Add
        </button>
      </div>
    </div>
  )
}

function CalculationPanel({
  token, request, property, buildingRateOptions, externalRateOptions, rules, onCalculated,
}: {
  token: string
  request: ValuationRequestDetail
  property: ValuationPropertyDetail
  buildingRateOptions: { key: string; rate: number }[]
  externalRateOptions: { key: string; unit: string; rate: number }[]
  rules: { depreciation?: CalculationRule; profit?: CalculationRule; forcedSale?: CalculationRule }
  onCalculated: () => void
}) {
  const [landRate, setLandRate] = useState("")
  const [buildingRates, setBuildingRates] = useState<Record<string, string>>({})
  const [workRates, setWorkRates] = useState<Record<string, string>>({})
  const [running, setRunning] = useState(false)
  const [error, setError] = useState("")

  const matchRate = (name: string, options: { key: string; rate: number }[]) =>
    options.find((o) => o.key === normalizeKey(name))?.rate

  const canRun =
    property.land?.plotSizeSqm && landRate &&
    property.buildings.length > 0 &&
    property.buildings.every((b) => buildingRates[b.id] || matchRate(b.name, buildingRateOptions)) &&
    rules.depreciation && rules.profit

  const handleRun = async () => {
    if (!token || !property.land?.plotSizeSqm) return
    setRunning(true)
    setError("")
    try {
      const engineVersion = await getActiveEngineVersion(token, "COST_APPROACH")

      await runCostApproach(token, {
        requestId: request.id,
        engineVersionId: engineVersion.id,
        landAreaSqm: property.land.plotSizeSqm,
        adoptedLandRatePerSqm: Number(landRate),
        landRateSource: "valuer adopted",
        buildingComponents: property.buildings.map((b) => ({
          name: b.name, areaSqm: b.areaSqm,
          adoptedRatePerSqm: Number(buildingRates[b.id] || matchRate(b.name, buildingRateOptions) || 0),
        })),
        externalWorks: property.externalWorks.map((w) => ({
          name: w.name, unit: w.unit.toUpperCase() as any, quantity: w.quantity,
          adoptedRate: Number(workRates[w.id] || matchRate(w.name, externalRateOptions as any) || 0),
        })),
        depreciationRuleCode: rules.depreciation!.code,
        depreciationRuleVersion: rules.depreciation!.version,
        developerProfitRuleCode: rules.profit!.code,
        developerProfitRuleVersion: rules.profit!.version,
        forcedSaleRuleCode: rules.forcedSale?.code,
        forcedSaleRuleVersion: rules.forcedSale?.version,
        valuationDate: new Date().toISOString().slice(0, 10),
      })

      // Running the calculation IS the engine-specific analysis step — chain
      // the workflow forward through the two transitions that represent it.
      if (request.status === "engine_selected") {
        try {
          await transitionRequest(token, request.id, "analysis_in_progress" as RequestStatus)
          await transitionRequest(token, request.id, "valuer_final_review" as RequestStatus)
        } catch { /* non-fatal: calculation succeeded regardless of status progression */ }
      }

      onCalculated()
    } catch (e: any) {
      setError(e.message || "Calculation failed")
    }
    setRunning(false)
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <Calculator size={16} className="text-[oklch(0.42_0.19_25)]" />
        <h2 className="font-heading text-base font-bold text-slate-800">Run Cost Approach</h2>
      </div>

      {error && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
          <AlertCircle size={13} className="flex-none" /> {error}
        </div>
      )}

      <div className="mb-3">
        <label className={lbl}>Adopted land rate (RWF/sqm)</label>
        <input type="number" value={landRate} onChange={(e) => setLandRate(e.target.value)} className={inp} placeholder="25000" />
      </div>

      {property.buildings.map((b) => {
        const auto = matchRate(b.name, buildingRateOptions)
        return (
          <div key={b.id} className="mb-2">
            <label className={lbl}>{b.name} — rate /sqm {auto ? `(suggested ${fmt(auto)})` : ""}</label>
            <input type="number" value={buildingRates[b.id] ?? ""} onChange={(e) => setBuildingRates((p) => ({ ...p, [b.id]: e.target.value }))} className={inp} placeholder={auto?.toString() ?? "e.g. 240000"} />
          </div>
        )
      })}

      {property.externalWorks.map((w) => {
        const auto = matchRate(w.name, externalRateOptions as any)
        return (
          <div key={w.id} className="mb-2">
            <label className={lbl}>{w.name} — rate {auto ? `(suggested ${fmt(auto)})` : ""}</label>
            <input type="number" value={workRates[w.id] ?? ""} onChange={(e) => setWorkRates((p) => ({ ...p, [w.id]: e.target.value }))} className={inp} placeholder={auto?.toString() ?? "rate"} />
          </div>
        )
      })}

      {(!rules.depreciation || !rules.profit) && (
        <p className="mt-2 text-xs text-amber-700">No active depreciation/developer-profit rule found — set one up under Rates & Rules first.</p>
      )}

      <button
        onClick={handleRun}
        disabled={!canRun || running}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[oklch(0.42_0.19_25)] py-2.5 text-sm font-semibold text-white hover:bg-[oklch(0.36_0.18_25)] disabled:opacity-40"
      >
        {running ? <Loader2 size={14} className="animate-spin" /> : <Calculator size={14} />}
        Calculate Open Market Value
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// Valuation ledger — the stepped, reproducible breakdown
// ═══════════════════════════════════════════════════════════════════════
// ═══ Sales Comparison ─ select comparables, adjust, calculate the indicated value ═══
function SalesComparisonPanel({
  token, request, rules, onCalculated,
}: {
  token: string
  request: ValuationRequestDetail
  rules: { forcedSale?: CalculationRule }
  onCalculated: () => void
}) {
  const [selections, setSelections] = useState<ComparableSelectionRow[]>([])
  const [candidates, setCandidates] = useState<ComparableProperty[]>([])
  const [showPicker, setShowPicker] = useState(false)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState("")

  const loadSelections = () => getSelectionsForRequest(token, request.id).then(setSelections)
  useEffect(() => { loadSelections() }, [request.id])
  useEffect(() => { if (showPicker) getComparables(token).then(setCandidates) }, [showPicker])

  const handleAdd = async (comparableId: string) => {
    await addComparableSelection(token, request.id, comparableId)
    setShowPicker(false)
    loadSelections()
  }

  const handleRemove = async (id: string) => {
    await removeComparableSelection(token, id)
    loadSelections()
  }

  const handleToggleIncluded = async (row: ComparableSelectionRow) => {
    await updateComparableSelection(token, row.id, { included: !row.included })
    loadSelections()
  }

  const handleAdjustment = async (row: ComparableSelectionRow, amount: number, reason: string) => {
    const adjustments = amount ? [{ factor: "manual", amount, reason }] : []
    await updateComparableSelection(token, row.id, { adjustments })
    loadSelections()
  }

  const includedCount = selections.filter((s) => s.included).length

  const handleRun = async () => {
    setRunning(true); setError("")
    try {
      const engineVersion = await getActiveEngineVersion(token, "SALES_COMPARISON")
      await runSalesComparison(token, {
        requestId: request.id,
        engineVersionId: engineVersion.id,
        comparables: selections.map((s) => ({
          id: s.id,
          label: [s.comparableProperty.sector, s.comparableProperty.district].filter(Boolean).join(", ") || s.comparableProperty.id,
          price: s.comparableProperty.transactions?.[0]?.price ?? 0,
          included: s.included,
          adjustments: s.adjustments ?? [],
        })),
        forcedSaleRuleCode: rules.forcedSale?.code,
        forcedSaleRuleVersion: rules.forcedSale?.version,
        valuationDate: new Date().toISOString().slice(0, 10),
      })
      if (request.status === "engine_selected") {
        try {
          await transitionRequest(token, request.id, "analysis_in_progress" as RequestStatus)
          await transitionRequest(token, request.id, "valuer_final_review" as RequestStatus)
        } catch {}
      }
      onCalculated()
    } catch (e: any) {
      setError(e.message || "Calculation failed")
    }
    setRunning(false)
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator size={16} className="text-[oklch(0.42_0.19_25)]" />
          <h2 className="font-heading text-base font-bold text-slate-800">Sales Comparison</h2>
        </div>
        <button onClick={() => setShowPicker((v) => !v)} className="flex items-center gap-1 text-xs font-semibold text-[oklch(0.42_0.19_25)] hover:underline">
          <Plus size={12} /> Add comparable
        </button>
      </div>

      {error && <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">{error}</div>}

      {showPicker && (
        <div className="mb-3 max-h-48 overflow-y-auto rounded-lg border border-border">
          {candidates.length === 0 ? (
            <p className="p-3 text-xs text-muted-foreground">No comparables in the database yet — add some under Comparables first.</p>
          ) : candidates.map((c) => (
            <button key={c.id} onClick={() => handleAdd(c.id)} className="flex w-full items-center justify-between border-b border-border px-3 py-2 text-left text-xs last:border-0 hover:bg-muted/40">
              <span>{c.sector ? `${c.sector}, ` : ""}{c.district || "—"} · {c.buildingAreaSqm ?? "?"} sqm</span>
              <span className="font-mono font-semibold">{c.transactions?.[0] ? fmt(c.transactions[0].price) : "—"}</span>
            </button>
          ))}
        </div>
      )}

      {selections.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">No comparables selected yet.</p>
      ) : (
        <div className="space-y-3">
          {selections.map((row) => (
            <ComparableRow key={row.id} row={row} onToggle={() => handleToggleIncluded(row)} onAdjust={(amt, reason) => handleAdjustment(row, amt, reason)} onRemove={() => handleRemove(row.id)} />
          ))}
        </div>
      )}

      <p className="mt-3 text-xs text-muted-foreground">{includedCount} of {selections.length} comparable{selections.length !== 1 ? "s" : ""} included</p>

      <button
        onClick={handleRun}
        disabled={running || includedCount === 0}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[oklch(0.42_0.19_25)] py-2.5 text-sm font-semibold text-white hover:bg-[oklch(0.36_0.18_25)] disabled:opacity-40"
      >
        {running ? <Loader2 size={14} className="animate-spin" /> : <Calculator size={14} />} Calculate Indicated Value
      </button>
    </div>
  )
}

function ComparableRow({ row, onToggle, onAdjust, onRemove }: { row: ComparableSelectionRow; onToggle: () => void; onAdjust: (amount: number, reason: string) => void; onRemove: () => void }) {
  const existing = row.adjustments?.[0]
  const [amount, setAmount] = useState(existing ? String(existing.amount) : "")
  const [reason, setReason] = useState(existing?.reason ?? "")
  const price = row.comparableProperty.transactions?.[0]?.price ?? 0

  return (
    <div className={`rounded-lg border p-3 ${row.included ? "border-border" : "border-border bg-muted/30 opacity-60"}`}>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <input type="checkbox" checked={row.included} onChange={onToggle} />
          {row.comparableProperty.sector ? `${row.comparableProperty.sector}, ` : ""}{row.comparableProperty.district || "Comparable"}
        </label>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-slate-600">{fmt(price)}</span>
          <button onClick={onRemove} className="text-muted-foreground hover:text-red-600"><X size={13} /></button>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} onBlur={() => onAdjust(Number(amount) || 0, reason)} className={`${inp} text-xs`} placeholder="Adjustment (± RWF)" />
        <input value={reason} onChange={(e) => setReason(e.target.value)} onBlur={() => onAdjust(Number(amount) || 0, reason)} className={`${inp} text-xs`} placeholder="Reason" />
      </div>
    </div>
  )
}

// ═══ Sales Comparison ledger ═══
function SalesComparisonLedger({ breakdown, results }: { breakdown: { comparableLines: { label: string; included: boolean; basePrice: number; adjustmentTotal: number; adjustedPrice: number }[]; includedCount: number; indicatedValue: number }; results: ValuationRequestDetail["results"] }) {
  const market = results.find((r) => r.basis === "market")
  const forced = results.find((r) => r.basis === "forced_sale")

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      <div className="border-b border-border bg-[oklch(0.12_0.01_250)] px-5 py-3.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">Valuation Ledger</p>
        <p className="font-heading text-sm font-bold text-white">Sales Comparison</p>
      </div>
      <div className="divide-y divide-border">
        <div className="px-5 py-3.5">
          <p className="mb-2 text-sm text-slate-600">Comparables ({breakdown.includedCount} included)</p>
          <div className="space-y-1.5">
            {breakdown.comparableLines.map((l) => (
              <div key={l.label} className={`flex items-center justify-between text-xs ${l.included ? "" : "opacity-40 line-through"}`}>
                <span className="text-muted-foreground">{l.label}</span>
                <span className="font-mono tabular-nums text-slate-600">
                  {fmt(l.basePrice)}{l.adjustmentTotal ? ` ${l.adjustmentTotal > 0 ? "+" : "−"}${fmt(Math.abs(l.adjustmentTotal))}` : ""} = {fmt(l.adjustedPrice)}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[oklch(0.97_0.02_80)] px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Indicated Value (Open Market)</span>
            <span className="gold-text font-mono text-xl font-bold tabular-nums">{fmt(market?.amount ?? breakdown.indicatedValue)}</span>
          </div>
          {forced && (
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Forced sale value ({forced.source})</span>
              <span className="font-mono tabular-nums">{fmt(forced.amount)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══ Income Approach ─ units, expenses, cap rate → NOI-based indicated value ═══
function IncomeApproachPanel({
  token, request, rules, onCalculated,
}: {
  token: string
  request: ValuationRequestDetail
  rules: { forcedSale?: CalculationRule }
  onCalculated: () => void
}) {
  const [units, setUnits] = useState<{ name: string; unitType: string; monthlyRent: string; occupancyRate: string }[]>([
    { name: "", unitType: "residential", monthlyRent: "", occupancyRate: "1" },
  ])
  const [expenses, setExpenses] = useState<{ name: string; annualAmount: string }[]>([])
  const [capRate, setCapRate] = useState("")
  const [capRateSource, setCapRateSource] = useState("")
  const [running, setRunning] = useState(false)
  const [error, setError] = useState("")

  const updateUnit = (i: number, field: string, value: string) =>
    setUnits((prev) => prev.map((u, idx) => (idx === i ? { ...u, [field]: value } : u)))
  const addUnitRow = () => setUnits((prev) => [...prev, { name: "", unitType: "residential", monthlyRent: "", occupancyRate: "1" }])
  const removeUnitRow = (i: number) => setUnits((prev) => prev.filter((_, idx) => idx !== i))

  const updateExpense = (i: number, field: string, value: string) =>
    setExpenses((prev) => prev.map((e, idx) => (idx === i ? { ...e, [field]: value } : e)))
  const addExpenseRow = () => setExpenses((prev) => [...prev, { name: "", annualAmount: "" }])
  const removeExpenseRow = (i: number) => setExpenses((prev) => prev.filter((_, idx) => idx !== i))

  const validUnits = units.filter((u) => u.name && u.monthlyRent)
  const canRun = validUnits.length > 0 && capRate

  const handleRun = async () => {
    setRunning(true); setError("")
    try {
      const engineVersion = await getActiveEngineVersion(token, "INCOME_APPROACH")
      await runIncomeApproach(token, {
        requestId: request.id,
        engineVersionId: engineVersion.id,
        units: validUnits.map((u) => ({ name: u.name, unitType: u.unitType, monthlyRent: Number(u.monthlyRent), occupancyRate: Number(u.occupancyRate) || 1 })),
        operatingExpenses: expenses.filter((e) => e.name && e.annualAmount).map((e) => ({ name: e.name, annualAmount: Number(e.annualAmount) })),
        adoptedCapRate: Number(capRate) / 100,
        capRateSource: capRateSource || "valuer adopted",
        forcedSaleRuleCode: rules.forcedSale?.code,
        forcedSaleRuleVersion: rules.forcedSale?.version,
        valuationDate: new Date().toISOString().slice(0, 10),
      })
      if (request.status === "engine_selected") {
        try {
          await transitionRequest(token, request.id, "analysis_in_progress" as RequestStatus)
          await transitionRequest(token, request.id, "valuer_final_review" as RequestStatus)
        } catch {}
      }
      onCalculated()
    } catch (e: any) {
      setError(e.message || "Calculation failed")
    }
    setRunning(false)
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <Calculator size={16} className="text-[oklch(0.42_0.19_25)]" />
        <h2 className="font-heading text-base font-bold text-slate-800">Income Approach</h2>
      </div>
      {error && <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">{error}</div>}

      <p className={lbl}>Units</p>
      <div className="mb-3 space-y-2">
        {units.map((u, i) => (
          <div key={i} className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2">
            <input value={u.name} onChange={(e) => updateUnit(i, "name", e.target.value)} className={`${inp} text-xs`} placeholder="Unit name" />
            <input type="number" value={u.monthlyRent} onChange={(e) => updateUnit(i, "monthlyRent", e.target.value)} className={`${inp} text-xs`} placeholder="Rent/mo" />
            <input type="number" min="0" max="1" step="0.05" value={u.occupancyRate} onChange={(e) => updateUnit(i, "occupancyRate", e.target.value)} className={`${inp} text-xs`} placeholder="Occ. 0-1" />
            <button onClick={() => removeUnitRow(i)} className="text-muted-foreground hover:text-red-600"><X size={14} /></button>
          </div>
        ))}
      </div>
      <button onClick={addUnitRow} className="mb-4 flex items-center gap-1 text-xs font-semibold text-[oklch(0.42_0.19_25)] hover:underline"><Plus size={12} /> Add unit</button>

      <p className={lbl}>Operating expenses</p>
      <div className="mb-3 space-y-2">
        {expenses.map((e, i) => (
          <div key={i} className="grid grid-cols-[2fr_1fr_auto] gap-2">
            <input value={e.name} onChange={(ev) => updateExpense(i, "name", ev.target.value)} className={`${inp} text-xs`} placeholder="Maintenance, management…" />
            <input type="number" value={e.annualAmount} onChange={(ev) => updateExpense(i, "annualAmount", ev.target.value)} className={`${inp} text-xs`} placeholder="Annual RWF" />
            <button onClick={() => removeExpenseRow(i)} className="text-muted-foreground hover:text-red-600"><X size={14} /></button>
          </div>
        ))}
      </div>
      <button onClick={addExpenseRow} className="mb-4 flex items-center gap-1 text-xs font-semibold text-[oklch(0.42_0.19_25)] hover:underline"><Plus size={12} /> Add expense</button>

      <div className="grid grid-cols-2 gap-2">
        <div><label className={lbl}>Adopted cap rate (%)</label><input type="number" value={capRate} onChange={(e) => setCapRate(e.target.value)} className={inp} placeholder="10" /></div>
        <div><label className={lbl}>Source</label><input value={capRateSource} onChange={(e) => setCapRateSource(e.target.value)} className={inp} placeholder="market evidence" /></div>
      </div>

      <button
        onClick={handleRun}
        disabled={!canRun || running}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[oklch(0.42_0.19_25)] py-2.5 text-sm font-semibold text-white hover:bg-[oklch(0.36_0.18_25)] disabled:opacity-40"
      >
        {running ? <Loader2 size={14} className="animate-spin" /> : <Calculator size={14} />} Calculate Indicated Value
      </button>
    </div>
  )
}

// ═══ Income Approach ledger ═══
function IncomeApproachLedger({ breakdown, results }: {
  breakdown: {
    unitLines: { name: string; grossAnnual: number; effectiveAnnual: number }[]
    grossPotentialIncome: number; effectiveGrossIncome: number
    expenseLines: { name: string; annualAmount: number }[]; totalOperatingExpenses: number
    netOperatingIncome: number; adoptedCapRate: number; indicatedValue: number
  }
  results: ValuationRequestDetail["results"]
}) {
  const market = results.find((r) => r.basis === "market")
  const forced = results.find((r) => r.basis === "forced_sale")

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      <div className="border-b border-border bg-[oklch(0.12_0.01_250)] px-5 py-3.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">Valuation Ledger</p>
        <p className="font-heading text-sm font-bold text-white">Income Approach</p>
      </div>
      <div className="divide-y divide-border">
        <div className="px-5 py-3.5">
          <p className="mb-2 text-sm text-slate-600">Rental income</p>
          <div className="space-y-1">
            {breakdown.unitLines.map((l) => (
              <div key={l.name} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{l.name}</span>
                <span className="font-mono tabular-nums text-slate-600">{fmt(l.effectiveAnnual)}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600">Effective Gross Income</span>
            <span className="font-mono tabular-nums">{fmt(breakdown.effectiveGrossIncome)}</span>
          </div>
        </div>
        <div className="px-5 py-3.5">
          <p className="mb-2 text-sm text-slate-600">Operating expenses</p>
          <div className="space-y-1">
            {breakdown.expenseLines.map((l) => (
              <div key={l.name} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{l.name}</span>
                <span className="font-mono tabular-nums text-slate-600">−{fmt(l.annualAmount)}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-sm font-semibold text-slate-800">
            <span>Net Operating Income</span>
            <span className="font-mono tabular-nums">{fmt(breakdown.netOperatingIncome)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>÷ Capitalization rate</span>
            <span className="font-mono tabular-nums">{(breakdown.adoptedCapRate * 100).toFixed(1)}%</span>
          </div>
        </div>
        <div className="bg-[oklch(0.97_0.02_80)] px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Indicated Value (Open Market)</span>
            <span className="gold-text font-mono text-xl font-bold tabular-nums">{fmt(market?.amount ?? breakdown.indicatedValue)}</span>
          </div>
          {forced && (
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Forced sale value ({forced.source})</span>
              <span className="font-mono tabular-nums">{fmt(forced.amount)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══ AVS ─ pulls subject + candidates automatically, scores, and ranks them ═══
function AvsPanel({ token, request, rules, onCalculated }: { token: string; request: ValuationRequestDetail; rules: { forcedSale?: CalculationRule }; onCalculated: () => void }) {
  const [topN, setTopN] = useState("5")
  const [minScore, setMinScore] = useState("0.3")
  const [running, setRunning] = useState(false)
  const [error, setError] = useState("")

  const handleRun = async () => {
    setRunning(true); setError("")
    try {
      const engineVersion = await getActiveEngineVersion(token, "AVS")
      await runAvs(token, {
        requestId: request.id,
        engineVersionId: engineVersion.id,
        topN: Number(topN) || 5,
        minScore: Number(minScore) || 0.3,
        forcedSaleRuleCode: rules.forcedSale?.code,
        forcedSaleRuleVersion: rules.forcedSale?.version,
        valuationDate: new Date().toISOString().slice(0, 10),
      })
      if (request.status === "engine_selected") {
        try {
          await transitionRequest(token, request.id, "analysis_in_progress" as RequestStatus)
          await transitionRequest(token, request.id, "valuer_final_review" as RequestStatus)
        } catch {}
      }
      onCalculated()
    } catch (e: any) {
      setError(e.message || "AVS run failed — make sure comparables exist in the database")
    }
    setRunning(false)
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="mb-2 flex items-center gap-2">
        <Calculator size={16} className="text-[oklch(0.42_0.19_25)]" />
        <h2 className="font-heading text-base font-bold text-slate-800">Automated Valuation</h2>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">Subject characteristics are pulled from the property record. Candidates are scored against the comparable database automatically.</p>
      {error && <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">{error}</div>}
      <div className="grid grid-cols-2 gap-2">
        <div><label className={lbl}>Max comparables</label><input type="number" value={topN} onChange={(e) => setTopN(e.target.value)} className={inp} /></div>
        <div><label className={lbl}>Min similarity (0-1)</label><input type="number" step="0.05" value={minScore} onChange={(e) => setMinScore(e.target.value)} className={inp} /></div>
      </div>
      <button onClick={handleRun} disabled={running} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[oklch(0.42_0.19_25)] py-2.5 text-sm font-semibold text-white hover:bg-[oklch(0.36_0.18_25)] disabled:opacity-40">
        {running ? <Loader2 size={14} className="animate-spin" /> : <Calculator size={14} />} Run AVS
      </button>
    </div>
  )
}

// ═══ AVS ledger ─ explainable: which comparables, why, confidence, warnings ═══
function AvsLedger({ token, breakdown, results, onChanged }: {
  token: string
  breakdown: {
    selected: { label: string; price: number; similarityScore: number }[]
    excluded: { label: string; price: number; similarityScore: number }[]
    confidence: "low" | "medium" | "high"
    averageSimilarity: number
    warnings: string[]
    indicatedValue: number
  }
  results: ValuationRequestDetail["results"]
  onChanged: () => void
}) {
  const market = results.find((r) => r.basis === "market")
  const forced = results.find((r) => r.basis === "forced_sale")
  const [overriding, setOverriding] = useState(false)

  const confidenceTone = { low: "bg-red-50 text-red-700", medium: "bg-amber-50 text-amber-700", high: "bg-emerald-50 text-emerald-700" }[breakdown.confidence]

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      <div className="border-b border-border bg-[oklch(0.12_0.01_250)] px-5 py-3.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">Valuation Ledger</p>
        <p className="font-heading text-sm font-bold text-white">Automated Valuation (AVS)</p>
      </div>
      <div className="divide-y divide-border">
        <div className="px-5 py-3.5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-slate-600">Selected comparables ({breakdown.selected.length})</p>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${confidenceTone}`}>{breakdown.confidence} confidence</span>
          </div>
          <div className="space-y-1.5">
            {breakdown.selected.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{c.label} <span className="font-mono text-[10px] text-slate-400">({Math.round(c.similarityScore * 100)}% match)</span></span>
                <span className="font-mono tabular-nums text-slate-600">{fmt(c.price)}</span>
              </div>
            ))}
          </div>
          {breakdown.excluded.length > 0 && (
            <p className="mt-2 text-[11px] text-muted-foreground">{breakdown.excluded.length} candidate(s) excluded — below similarity threshold</p>
          )}
          {breakdown.warnings.map((w, i) => (
            <p key={i} className="mt-2 flex items-start gap-1.5 text-[11px] text-amber-700"><AlertCircle size={12} className="mt-0.5 flex-none" /> {w}</p>
          ))}
        </div>
        <div className="bg-[oklch(0.97_0.02_80)] px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
              Indicated Value (Open Market)
              {market?.method === "valuer_adopted" && <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">OVERRIDDEN</span>}
            </span>
            <span className="flex items-center gap-2">
              <span className="gold-text font-mono text-xl font-bold tabular-nums">{fmt(market?.amount ?? breakdown.indicatedValue)}</span>
              {market && (
                <button onClick={() => setOverriding((v) => !v)} className="text-muted-foreground hover:text-[oklch(0.42_0.19_25)]" title="Override with reason">
                  <Edit3 size={13} />
                </button>
              )}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">System-assisted estimate — licensed valuer review required before relying on this figure.</p>
          {market && overriding && (
            <OverrideForm token={token} result={market} onDone={() => { setOverriding(false); onChanged() }} onCancel={() => setOverriding(false)} />
          )}
          {forced && (
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Forced sale value ({forced.source})</span>
              <span className="font-mono tabular-nums">{fmt(forced.amount)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ValuationLedger({ token, breakdown, results, onChanged }: { token: string; breakdown: CostApproachBreakdown; results: ValuationRequestDetail["results"]; onChanged: () => void }) {
  const market = results.find((r) => r.basis === "market")
  const forced = results.find((r) => r.basis === "forced_sale")
  const [overriding, setOverriding] = useState<string | null>(null)

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      <div className="border-b border-border bg-[oklch(0.12_0.01_250)] px-5 py-3.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">Valuation Ledger</p>
        <p className="font-heading text-sm font-bold text-white">Cost Approach</p>
      </div>

      <div className="divide-y divide-border">
        {/* Land */}
        <div className="px-5 py-3.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Land value</span>
            <span className="font-mono font-semibold tabular-nums text-slate-800">{fmt(breakdown.land.value)}</span>
          </div>
          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{breakdown.land.areaSqm} sqm × {fmt(breakdown.land.ratePerSqm)}</p>
        </div>

        {/* Development */}
        <div className="px-5 py-3.5">
          <p className="mb-2 text-sm text-slate-600">Development</p>
          <div className="space-y-1 border-l-2 border-border pl-3">
            {breakdown.buildingLines.map((l) => (
              <div key={l.name} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{l.name}</span>
                <span className="font-mono tabular-nums text-slate-600">{fmt(l.replacementCost)}</span>
              </div>
            ))}
            {breakdown.externalWorkLines.map((l) => (
              <div key={l.name} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{l.name}</span>
                <span className="font-mono tabular-nums text-slate-600">{fmt(l.cost)}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600">Total development cost</span>
            <span className="font-mono tabular-nums">{fmt(breakdown.totalDevelopmentCost)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>Depreciation ({(breakdown.depreciation.rate * 100).toFixed(0)}%)</span>
            <span className="font-mono tabular-nums">−{fmt(breakdown.depreciation.amount)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>Developer's profit ({(breakdown.developerProfit.rate * 100).toFixed(0)}%)</span>
            <span className="font-mono tabular-nums">+{fmt(breakdown.developerProfit.amount)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm font-semibold text-slate-800">
            <span>Development value</span>
            <span className="font-mono tabular-nums">{fmt(breakdown.developmentValue)}</span>
          </div>
        </div>

        {/* Open Market Value */}
        <div className="bg-[oklch(0.97_0.02_80)] px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
              Open Market Value
              {market?.method === "valuer_adopted" && <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">OVERRIDDEN</span>}
            </span>
            <span className="flex items-center gap-2">
              <span className="gold-text font-mono text-xl font-bold tabular-nums">{fmt(market?.amount ?? breakdown.openMarketValue)}</span>
              {market && (
                <button onClick={() => setOverriding(overriding === market.id ? null : market.id)} className="text-muted-foreground hover:text-[oklch(0.42_0.19_25)]" title="Override with reason">
                  <Edit3 size={13} />
                </button>
              )}
            </span>
          </div>
          {market && overriding === market.id && (
            <OverrideForm token={token} result={market} onDone={() => { setOverriding(null); onChanged() }} onCancel={() => setOverriding(null)} />
          )}

          {forced && (
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                Forced sale value ({forced.source})
                {forced.method === "valuer_adopted" && <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">OVERRIDDEN</span>}
              </span>
              <span className="flex items-center gap-2">
                <span className="font-mono tabular-nums">{fmt(forced.amount)}</span>
                <button onClick={() => setOverriding(overriding === forced.id ? null : forced.id)} className="text-muted-foreground hover:text-[oklch(0.42_0.19_25)]" title="Override with reason">
                  <Edit3 size={11} />
                </button>
              </span>
            </div>
          )}
          {forced && overriding === forced.id && (
            <OverrideForm token={token} result={forced} onDone={() => { setOverriding(null); onChanged() }} onCancel={() => setOverriding(null)} />
          )}
        </div>
      </div>
    </div>
  )
}

function OverrideForm({ token, result, onDone, onCancel }: { token: string; result: ValuationResult; onDone: () => void; onCancel: () => void }) {
  const [value, setValue] = useState(String(result.amount))
  const [reason, setReason] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const handleSave = async () => {
    if (!reason.trim()) { setError("A reason is required for every override"); return }
    setBusy(true); setError("")
    try {
      await addAdjustment(token, result.id, { newValue: Number(value), reason })
      onDone()
    } catch (e: any) {
      setError(e.message || "Failed to save override")
      setBusy(false)
    }
  }

  return (
    <div className="mt-3 rounded-lg border border-border bg-white p-3">
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className={inp} placeholder="New amount" />
      <textarea value={reason} onChange={(e) => setReason(e.target.value)} className={`${inp} mt-2`} rows={2} placeholder="Reason for override (required, recorded for audit)" />
      <div className="mt-2 flex items-center gap-2">
        <button onClick={handleSave} disabled={busy} className="flex items-center gap-1.5 rounded-md bg-[oklch(0.42_0.19_25)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[oklch(0.36_0.18_25)] disabled:opacity-50">
          {busy ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Save override
        </button>
        <button onClick={onCancel} className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-muted">
          <X size={12} /> Cancel
        </button>
      </div>
    </div>
  )
}
