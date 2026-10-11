"use client"

import { useMemo, useState } from "react"
import { AlertCircle, Check, ChevronLeft, ChevronRight, FileText, Loader2, X } from "lucide-react"
import {
  generateReport, updatePropertyDetails, updatePropertyLocation, updatePropertyLand, updateBuilding,
  updateRequestDetails, uploadPropertyPictures, uploadLandTitleDocuments,
} from "@/lib/valuation-api"
import type { ValuationPropertyDetail, ValuationReport } from "@/lib/valuation-api"

type Field = {
  key: string
  label: string
  hint?: string
  type?: "text" | "number" | "select"
  options?: string[]
  target: "request" | "property" | "location" | "land"
  value: string
  /** Missing = the report will omit this row, so we ask for it. */
  required?: boolean
}

const STEPS = ["Parties & title", "Location & land", "Buildings", "Maps, plans & logo", "Review & generate"]

const inp = "w-full rounded-md border border-border bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[oklch(0.42_0.19_25)/25]"
const str = (v: unknown) => (v == null ? "" : String(v))

export function ReportWizard({
  token, requestId, request, property, report, status, onChanged,
}: {
  token: string
  requestId: string
  request: { beneficiary?: string; instructor?: string }
  property?: ValuationPropertyDetail
  report: ValuationReport | null
  status: string
  onChanged: () => void
}) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [uploading, setUploading] = useState("")

  // Edits typed by the user in this session, keyed by "target.key".
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [bEdits, setBEdits] = useState<Record<string, Record<string, string>>>({})

  const [valuationDate, setValuationDate] = useState("")
  const [remarks, setRemarks] = useState("")
  const [locationMapUrl, setLocationMapUrl] = useState("")
  const [cadastralPlanUrl, setCadastralPlanUrl] = useState("")
  const [planningZoneMapUrl, setPlanningZoneMapUrl] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [appendixUrls, setAppendixUrls] = useState<string[]>([])

  const p = property
  const fieldsByStep: Field[][] = useMemo(() => [
    [
      { key: "instructor", label: "Instructor (who instructed the valuation)", target: "request", value: str(request.instructor), required: true },
      { key: "beneficiary", label: "Beneficiary (e.g. bank)", target: "request", value: str(request.beneficiary) },
      { key: "plotNumber", label: "Plot number", target: "property", value: str(p?.plotNumber) },
      { key: "tenure", label: "Land tenure", type: "select", options: ["Leasehold", "Freehold", "Emphyteutic lease"], target: "property", value: str(p?.tenure), required: true },
      { key: "occupancyStatus", label: "Occupancy status", type: "select", options: ["Owner occupied", "Tenant occupied", "Vacant", "Under construction"], target: "property", value: str(p?.occupancyStatus) },
      { key: "mortgageStatus", label: "Mortgage status", hint: "e.g. Not under mortgage", target: "property", value: str(p?.mortgageStatus) },
      { key: "restrictionsStatus", label: "Restrictions status", hint: "e.g. No restrictions", target: "property", value: str(p?.restrictionsStatus) },
      { key: "processStatus", label: "Process status", hint: "e.g. No process", target: "property", value: str(p?.processStatus) },
    ],
    [
      { key: "distanceToCbdKm", label: "Distance to Kigali CBD (km)", type: "number", target: "location", value: str(p?.location?.distanceToCbdKm), hint: "Use the CBD distance checker or enter manually" },
      { key: "neighborhoodQuality", label: "Neighborhood quality", type: "select", options: ["Poor", "Fair", "Good", "Very good", "Excellent"], target: "location", value: str(p?.location?.neighborhoodQuality) },
      { key: "accessibility", label: "Accessibility (road type)", hint: "e.g. Tarmac, Murram, Paved", target: "location", value: str(p?.location?.accessibility) },
      { key: "plotSizeSqm", label: "Plot size (sqm)", type: "number", target: "land", value: str(p?.land?.plotSizeSqm), required: true },
      { key: "shape", label: "Plot shape", hint: "e.g. Regular, Irregular", target: "land", value: str(p?.land?.shape) },
      { key: "topography", label: "Topography", hint: "e.g. Gently sloping", target: "land", value: str(p?.land?.topography) },
      { key: "zoning", label: "Zoning (code, e.g. R1A)", target: "land", value: str(p?.land?.zoning), required: true },
      { key: "currentUse", label: "Current use", hint: "e.g. Residential", target: "land", value: str(p?.land?.currentUse) },
    ],
    [],
    [],
    [],
  ], [request, p])

  const val = (f: Field) => edits[`${f.target}.${f.key}`] ?? f.value
  const missingFields = (i: number) => fieldsByStep[i].filter((f) => !val(f).trim())

  const bVal = (id: string, k: string, base?: string) => bEdits[id]?.[k] ?? base ?? ""
  const BUILD_FIELDS: [string, string][] = [
    ["walling", "Walling"], ["roofing", "Roof"], ["flooring", "Floor"], ["ceiling", "Ceiling"], ["doors", "Doors"], ["windows", "Windows"],
  ]
  const buildingMissing = (b: any) => BUILD_FIELDS.filter(([k]) => !bVal(b.id, k, b[k]).trim()).map(([, l]) => l)
  const noRooms = (b: any) => !(b.accommodation ?? []).some((a: any) => a.items?.length)

  const saveFields = async (i: number) => {
    const touched = fieldsByStep[i].filter((f) => edits[`${f.target}.${f.key}`] !== undefined && edits[`${f.target}.${f.key}`] !== f.value)
    if (!touched.length) return
    const group = (t: Field["target"]) => Object.fromEntries(touched.filter((f) => f.target === t).map((f) => [f.key, f.type === "number" ? (val(f) === "" ? null : Number(val(f))) : val(f).trim() || null]))
    const req = group("request"), prop = group("property"), loc = group("location"), land = group("land")
    if (Object.keys(req).length) await updateRequestDetails(token, requestId, req as any)
    if (p) {
      if (Object.keys(prop).length) await updatePropertyDetails(token, p.id, prop)
      if (Object.keys(loc).length) await updatePropertyLocation(token, p.id, loc)
      if (Object.keys(land).length) await updatePropertyLand(token, p.id, land)
    }
  }
  const saveBuildings = async () => {
    if (!p) return
    for (const [id, patch] of Object.entries(bEdits)) {
      const clean = Object.fromEntries(Object.entries(patch).map(([k, v]) => [k, v.trim() || null]))
      if (Object.keys(clean).length) await updateBuilding(token, p.id, id, clean)
    }
  }

  const next = async () => {
    setBusy(true); setError("")
    try {
      if (step <= 1) await saveFields(step)
      if (step === 2) await saveBuildings()
      if (step <= 2) { setEdits({}); setBEdits({}); onChanged() }
      setStep((s) => Math.min(s + 1, STEPS.length - 1))
    } catch (e: any) { setError(e?.message || "Could not save") }
    setBusy(false)
  }

  const uploadOne = async (slot: string, file: File | undefined, set: (u: string) => void) => {
    if (!file) return
    setUploading(slot); setError("")
    try { const [url] = await uploadPropertyPictures([file]); set(url) } catch (e: any) { setError(e.message || "Upload failed") }
    setUploading("")
  }
  const uploadAppendices = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading("appendix"); setError("")
    try { const urls = await uploadLandTitleDocuments(Array.from(files)); setAppendixUrls((x) => [...x, ...urls]) }
    catch (e: any) { setError(e.message || "Upload failed") }
    setUploading("")
  }

  // Everything still missing, for the final review.
  const gaps: { step: number; text: string; level: "needed" | "optional" }[] = []
  fieldsByStep.forEach((fs, i) => fs.forEach((f) => { if (!val(f).trim()) gaps.push({ step: i, text: f.label, level: f.required ? "needed" : "optional" }) }))
  ;(p?.buildings ?? []).forEach((b: any) => {
    const m = buildingMissing(b)
    if (m.length) gaps.push({ step: 2, text: `${b.name}: ${m.join(", ")}`, level: "optional" })
    if (noRooms(b)) gaps.push({ step: 2, text: `${b.name}: rooms per floor (add in the Buildings card)`, level: "optional" })
  })
  if (!p?.buildings?.length) gaps.push({ step: 2, text: "No buildings recorded", level: "optional" })
  if (!p?.images?.length) gaps.push({ step: 3, text: "No customer property photos on the request", level: "optional" })
  if (!locationMapUrl) gaps.push({ step: 3, text: "Location map", level: "optional" })
  if (!cadastralPlanUrl) gaps.push({ step: 3, text: "Cadastral parcel plan", level: "optional" })
  if (!planningZoneMapUrl) gaps.push({ step: 3, text: "Planning zone map", level: "optional" })

  const generate = async () => {
    setBusy(true); setError("")
    try {
      await generateReport(token, requestId, {
        valuationDate: valuationDate || undefined, generalRemarks: remarks || undefined,
        locationMapUrl: locationMapUrl || undefined, cadastralPlanUrl: cadastralPlanUrl || undefined,
        planningZoneMapUrl: planningZoneMapUrl || undefined, logoUrl: logoUrl || undefined,
        appendixUrls: appendixUrls.length ? appendixUrls : undefined,
      })
      setOpen(false); setStep(0); onChanged()
    } catch (e: any) { setError(e.message || "Failed to generate report") }
    setBusy(false)
  }

  const fileSlot = (id: string, label: string, url: string, set: (u: string) => void, note?: string) => (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-700">{label}</p>
          {note && <p className="text-[11px] text-muted-foreground">{note}</p>}
        </div>
        <span className="flex items-center gap-2 text-xs">
          {uploading === id && <Loader2 size={12} className="animate-spin" />}
          {url ? (<><a href={url} target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">uploaded</a><button type="button" onClick={() => set("")} className="text-red-600"><X size={12} /></button></>)
            : <input type="file" accept="image/*" className="max-w-[190px] text-[11px]" onChange={(e) => uploadOne(id, e.target.files?.[0], set)} />}
        </span>
      </div>
    </div>
  )

  const renderField = (f: Field) => {
    const v = val(f)
    const missing = !v.trim()
    const set = (x: string) => setEdits((e) => ({ ...e, [`${f.target}.${f.key}`]: x }))
    return (
      <label key={`${f.target}.${f.key}`} className="block text-xs font-semibold text-slate-700">
        <span className="flex items-center gap-2">{f.label}
          {missing && <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${f.required ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{f.required ? "needed" : "missing"}</span>}
        </span>
        {f.type === "select" ? (
          <select value={v} onChange={(e) => set(e.target.value)} className={`${inp} mt-1 font-normal`}>
            <option value="">— select —</option>
            {Array.from(new Set([...(f.options ?? []), ...(v ? [v] : [])])).map((o) => <option key={o}>{o}</option>)}
          </select>
        ) : (
          <input type={f.type === "number" ? "number" : "text"} value={v} onChange={(e) => set(e.target.value)} placeholder={f.hint} className={`${inp} mt-1 font-normal`} />
        )}
      </label>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="mb-2 flex items-center gap-2">
        <FileText size={16} className="text-[oklch(0.42_0.19_25)]" />
        <h2 className="font-heading text-base font-bold text-slate-800">Valuation report</h2>
      </div>
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}

      {report && (report.pdfUrl || report.docxUrl) && (
        <div className="mb-2 space-y-1.5">
          {report.pdfUrl && (
            <a href={report.pdfUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-muted">
              <span className="font-mono">{report.reference}.pdf</span>
              <span className="text-[oklch(0.42_0.19_25)]">Download PDF ↓</span>
            </a>
          )}
          {report.docxUrl && (
            <a href={report.docxUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-muted">
              <span className="font-mono">{report.reference}.docx</span>
              <span className="text-[oklch(0.42_0.19_25)]">Download Word ↓</span>
            </a>
          )}
          {report.docxUrl && !report.pdfUrl && (
            <p className="text-[11px] text-amber-700">PDF is not available on this server yet (LibreOffice is not installed) — download the Word file and save as PDF from Word.</p>
          )}
        </div>
      )}

      {(status === "valuer_final_review" || report) && !open && (
        <button onClick={() => { setOpen(true); setStep(0) }} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[oklch(0.42_0.19_25)] py-2.5 text-sm font-semibold text-white hover:bg-[oklch(0.36_0.18_25)]">
          <FileText size={14} /> {report ? "Regenerate report" : "Prepare report"}
        </button>
      )}

      {open && (
        <div className="space-y-3 rounded-lg border border-border p-3">
          <ol className="flex flex-wrap gap-1 text-[10px] font-semibold">
            {STEPS.map((s, i) => (
              <li key={s}>
                <button type="button" onClick={() => setStep(i)}
                  className={`rounded-full px-2 py-1 ${i === step ? "bg-[oklch(0.42_0.19_25)] text-white" : i < step ? "bg-emerald-100 text-emerald-800" : "bg-muted text-slate-600"}`}>
                  {i + 1}. {s}
                </button>
              </li>
            ))}
          </ol>

          {step <= 1 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {missingFields(step).length
                  ? `${missingFields(step).length} item(s) are missing. Enter them now, or skip — empty items are left out of the report.`
                  : "Everything here is filled in."}
              </p>
              {!p && step > 0 ? <p className="text-xs text-red-600">No property recorded yet.</p> : fieldsByStep[step].map(renderField)}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Construction details per building. Rooms per floor are edited in the Buildings card above (“Construction &amp; rooms”).</p>
              {!(p?.buildings ?? []).length && <p className="text-xs text-amber-700">No buildings recorded — the construction and accommodation sections will be left out.</p>}
              {(p?.buildings ?? []).map((b: any) => (
                <div key={b.id} className="rounded-lg border border-border p-3">
                  <p className="mb-2 text-sm font-semibold text-slate-700">{b.name} <span className="font-normal text-muted-foreground">· {b.areaSqm} sqm</span></p>
                  <div className="grid grid-cols-2 gap-2">
                    {BUILD_FIELDS.map(([k, l]) => {
                      const v = bVal(b.id, k, b[k])
                      return (
                        <label key={k} className="block text-[11px] font-semibold text-slate-600">
                          <span className="flex items-center gap-1">{l}{!v.trim() && <span className="rounded bg-amber-100 px-1 text-[9px] font-bold text-amber-700">missing</span>}</span>
                          <input value={v} onChange={(e) => setBEdits((x) => ({ ...x, [b.id]: { ...x[b.id], [k]: e.target.value } }))} className={`${inp} mt-1 font-normal`} />
                        </label>
                      )
                    })}
                  </div>
                  {noRooms(b) && <p className="mt-2 text-[11px] text-amber-700">Rooms per floor not recorded yet.</p>}
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Upload what you have; anything skipped is left out. Customer photos come from the original request ({p?.images?.length ?? 0} found).</p>
              {fileSlot("loc", "Location map", locationMapUrl, setLocationMapUrl)}
              {fileSlot("cad", "Cadastral parcel plan", cadastralPlanUrl, setCadastralPlanUrl)}
              {fileSlot("zone", "Planning zone map", planningZoneMapUrl, setPlanningZoneMapUrl)}
              {fileSlot("logo", "Company logo", logoUrl, setLogoUrl, "Optional — the current KOSRES logo is used unless you upload another")}
              <div className="rounded-lg border border-border p-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-700">Appendices <span className="text-[11px] font-normal text-muted-foreground">(images / PDFs, in order)</span></span>
                  {uploading === "appendix" && <Loader2 size={12} className="animate-spin" />}
                  <input type="file" multiple accept="image/*,.pdf,.doc,.docx" className="max-w-[190px] text-[11px]" onChange={(e) => { uploadAppendices(e.target.files); e.target.value = "" }} />
                </div>
                {appendixUrls.map((u, i) => (
                  <div key={u} className="mt-1 flex items-center justify-between rounded border border-border px-2 py-1">
                    <a href={u} target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">Appendix {i + 1}</a>
                    <button type="button" onClick={() => setAppendixUrls((x) => x.filter((y) => y !== u))} className="text-red-600"><X size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">Valuation date <span className="font-normal text-muted-foreground">(blank = sign-off date, else today)</span>
                <input type="date" value={valuationDate} onChange={(e) => setValuationDate(e.target.value)} className={`${inp} mt-1`} />
              </label>
              <label className="block text-xs font-semibold text-slate-700">General remarks <span className="font-normal text-muted-foreground">(optional)</span>
                <textarea rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} className={`${inp} mt-1`} />
              </label>
              {gaps.length === 0 ? (
                <p className="flex items-center gap-1 text-xs font-semibold text-emerald-700"><Check size={14} /> Nothing missing — ready to generate.</p>
              ) : (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="mb-1 flex items-center gap-1 text-xs font-bold text-amber-800"><AlertCircle size={13} /> Still missing ({gaps.length}) — these will be left out</p>
                  <ul className="space-y-0.5 text-[11px] text-amber-900">
                    {gaps.map((g, i) => (
                      <li key={i} className="flex items-center justify-between gap-2">
                        <span>{g.level === "needed" ? "● " : "○ "}{g.text}</span>
                        <button type="button" onClick={() => setStep(g.step)} className="shrink-0 font-semibold underline">fill in</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-1">
            <button type="button" onClick={() => (step === 0 ? setOpen(false) : setStep(step - 1))} className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm">
              <ChevronLeft size={14} /> {step === 0 ? "Cancel" : "Back"}
            </button>
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={next} disabled={busy || !!uploading} className="flex items-center gap-1 rounded-lg bg-[oklch(0.42_0.19_25)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                {busy && <Loader2 size={13} className="animate-spin" />} {step <= 2 ? "Save & continue" : "Continue"} <ChevronRight size={14} />
              </button>
            ) : (
              <button type="button" onClick={generate} disabled={busy || !!uploading} className="flex items-center gap-1 rounded-lg bg-[oklch(0.42_0.19_25)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                {busy ? <Loader2 size={13} className="animate-spin" /> : <FileText size={14} />} Generate report
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
