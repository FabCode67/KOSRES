"use client"

import { useState } from "react"
import { ClipboardCheck, Loader2, Upload, CheckCircle2, X, FileText, Image as ImageIcon } from "lucide-react"
import {
  createEvaluationIntake, uploadLandTitleDocuments, uploadPropertyPictures,
} from "@/lib/valuation-api"

const inp =
  "w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[oklch(0.42_0.19_25)/25]"
const label = "mb-1.5 block text-xs font-semibold text-slate-600"

const PURPOSE_OPTIONS: { value: string; label: string }[] = [
  { value: "loan_application", label: "Loan application" },
  { value: "sale_purchase", label: "Sale / purchase" },
  { value: "insurance", label: "Insurance" },
  { value: "investment", label: "Investment" },
  { value: "taxation", label: "Taxation" },
  { value: "accounting", label: "Accounting" },
  { value: "financial_reporting", label: "Financial reporting" },
  { value: "forced_sale", label: "Forced sale" },
  { value: "market_value", label: "Market value" },
  { value: "other", label: "Other" },
]

const PROPERTY_TYPE_OPTIONS = [
  "Residential — House", "Residential — Apartment", "Commercial", "Industrial", "Vacant plot (undeveloped)", "Mixed-use", "Other",
]

/**
 * A "select, or type your own" control: KOSRES already uses this pattern
 * elsewhere in the valuation platform (Buildings/External Works/Services
 * name fields) so customers and staff aren't boxed into a fixed list.
 */
function SelectOrOther({
  value, onChange, options, placeholder,
}: { value: string; onChange: (v: string) => void; options: string[]; placeholder?: string }) {
  const isPreset = options.includes(value)
  const [mode, setMode] = useState<"preset" | "other">(value && !isPreset ? "other" : "preset")

  if (mode === "other") {
    return (
      <div className="flex gap-2">
        <input
          className={inp}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus
        />
        <button
          type="button"
          onClick={() => { setMode("preset"); onChange(options[0]) }}
          className="shrink-0 rounded-lg border border-border px-3 text-xs font-semibold text-muted-foreground hover:bg-muted"
        >
          List
        </button>
      </div>
    )
  }

  return (
    <select
      className={inp}
      value={isPreset ? value : ""}
      onChange={(e) => {
        if (e.target.value === "__other__") { setMode("other"); onChange("") }
        else onChange(e.target.value)
      }}
    >
      <option value="" disabled>Select…</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
      <option value="__other__">Other (type it in)…</option>
    </select>
  )
}

function FilePicker({
  files, onFiles, accept, hint, icon: Icon,
}: { files: File[]; onFiles: (f: File[]) => void; accept: string; hint: string; icon: any }) {
  return (
    <div>
      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-[oklch(0.97_0.005_80)] px-3 py-2.5 text-sm text-muted-foreground hover:border-[oklch(0.42_0.19_25)] hover:text-[oklch(0.42_0.19_25)]">
        <Icon size={16} />
        <span>{hint}</span>
        <input
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => {
            const chosen = Array.from(e.target.files ?? [])
            if (chosen.length) onFiles([...files, ...chosen])
            e.target.value = ""
          }}
        />
      </label>
      {files.length > 0 && (
        <ul className="mt-2 space-y-1">
          {files.map((f, i) => (
            <li key={i} className="flex items-center justify-between rounded-md bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">
              <span className="truncate">{f.name}</span>
              <button type="button" onClick={() => onFiles(files.filter((_, idx) => idx !== i))} className="ml-2 shrink-0 text-slate-400 hover:text-red-600">
                <X size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function EvaluationRequestForm() {
  const [upi, setUpi] = useState("")
  const [clientNames, setClientNames] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [purpose, setPurpose] = useState("")
  const [typeOfProperty, setTypeOfProperty] = useState("")
  const [isDeveloped, setIsDeveloped] = useState(false)
  const [constructionMaterial, setConstructionMaterial] = useState("")
  const [bedrooms, setBedrooms] = useState("")
  const [bathrooms, setBathrooms] = useState("")
  const [landTitleFiles, setLandTitleFiles] = useState<File[]>([])
  const [pictureFiles, setPictureFiles] = useState<File[]>([])

  const [submitting, setSubmitting] = useState(false)
  const [progress, setProgress] = useState("")
  const [error, setError] = useState("")
  const [reference, setReference] = useState("")

  const canSubmit = upi.trim() && clientNames.trim() && purpose && typeOfProperty.trim() && !submitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError("")
    try {
      let landTitleDocumentUrls: string[] = []
      let propertyPictureUrls: string[] = []

      if (landTitleFiles.length) {
        setProgress("Uploading land title documents…")
        landTitleDocumentUrls = await uploadLandTitleDocuments(landTitleFiles)
      }
      if (pictureFiles.length) {
        setProgress("Uploading property pictures…")
        propertyPictureUrls = await uploadPropertyPictures(pictureFiles)
      }

      setProgress("Submitting your request…")
      const result = await createEvaluationIntake({
        upi: upi.trim(),
        clientNames: clientNames.trim(),
        clientPhone: clientPhone.trim() || undefined,
        clientEmail: clientEmail.trim() || undefined,
        purpose,
        typeOfProperty: typeOfProperty.trim(),
        isDeveloped,
        constructionMaterial: isDeveloped ? constructionMaterial.trim() || undefined : undefined,
        bedrooms: isDeveloped && bedrooms ? Number(bedrooms) : undefined,
        bathrooms: isDeveloped && bathrooms ? Number(bathrooms) : undefined,
        landTitleDocumentUrls,
        propertyPictureUrls,
      })
      setReference(result.reference)
    } catch (err: any) {
      setError(err?.message || "Something went wrong submitting your request. Please try again.")
    }
    setSubmitting(false)
    setProgress("")
  }

  if (reference) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
        <CheckCircle2 size={36} className="mx-auto mb-3 text-emerald-600" />
        <h3 className="mb-1 text-xl font-black text-emerald-800">Request received</h3>
        <p className="text-sm text-emerald-700">
          Your valuation request has been submitted. Reference: <span className="font-mono font-bold">{reference}</span>
        </p>
        <p className="mt-2 text-xs text-emerald-700/80">
          A KOSRES valuer will review your submission and get in touch to continue the process.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-1 flex items-center justify-center gap-2">
        <ClipboardCheck size={16} className="text-[oklch(0.42_0.19_25)]" />
        <span className="text-xs font-bold tracking-widest text-[oklch(0.42_0.19_25)] uppercase">Request a Valuation</span>
      </div>
      <h3 className="mb-1 text-center text-xl font-black">Start your property valuation</h3>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        Fill in the details below and our valuation team will take it from here.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>UPI *</label>
            <input className={inp} value={upi} onChange={(e) => setUpi(e.target.value)} placeholder="e.g. 1/02/01/01/4295" required />
          </div>
          <div>
            <label className={label}>Client name(s) *</label>
            <input className={inp} value={clientNames} onChange={(e) => setClientNames(e.target.value)} placeholder="Full name(s)" required />
          </div>
          <div>
            <label className={label}>Phone (optional)</label>
            <input className={inp} value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="07xx xxx xxx" />
          </div>
          <div>
            <label className={label}>Email (optional)</label>
            <input type="email" className={inp} value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <label className={label}>Purpose of valuation *</label>
            <select className={inp} value={purpose} onChange={(e) => setPurpose(e.target.value)} required>
              <option value="" disabled>Select…</option>
              {PURPOSE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Type of property *</label>
            <SelectOrOther value={typeOfProperty} onChange={setTypeOfProperty} options={PROPERTY_TYPE_OPTIONS} placeholder="Describe the property type" />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={isDeveloped} onChange={(e) => setIsDeveloped(e.target.checked)} className="h-4 w-4 rounded border-border" />
          The property is developed (has building(s) on it)
        </label>

        {isDeveloped && (
          <div className="grid gap-4 rounded-lg bg-[oklch(0.97_0.005_80)] p-4 sm:grid-cols-3">
            <div className="sm:col-span-3">
              <label className={label}>Construction material of building(s)</label>
              <SelectOrOther
                value={constructionMaterial}
                onChange={setConstructionMaterial}
                options={["Burnt bricks", "Concrete blocks", "Stone", "Mud bricks / adobe", "Timber", "Mixed materials"]}
                placeholder="Describe the construction material"
              />
            </div>
            <div>
              <label className={label}>Bedrooms</label>
              <input type="number" min={0} className={inp} value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
            </div>
            <div>
              <label className={label}>Bathrooms</label>
              <input type="number" min={0} className={inp} value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Land title documents</label>
            <FilePicker files={landTitleFiles} onFiles={setLandTitleFiles} accept=".pdf,.doc,.docx,image/*" hint="Upload PDF, Word, or scanned image" icon={FileText} />
          </div>
          <div>
            <label className={label}>Picture(s) of the property</label>
            <FilePicker files={pictureFiles} onFiles={setPictureFiles} accept="image/*" hint="Upload one or more photos" icon={ImageIcon} />
          </div>
        </div>

        {error && <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[oklch(0.42_0.19_25)] px-5 py-3 text-sm font-semibold text-white hover:bg-[oklch(0.36_0.18_25)] disabled:opacity-50"
        >
          {submitting ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          {submitting ? (progress || "Submitting…") : "Submit valuation request"}
        </button>
      </form>
    </div>
  )
}
