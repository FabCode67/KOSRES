"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, Plus, Camera, Check, AlertCircle, MapPin, Building2 } from "lucide-react"
import { getInspection, addInspectionNote, submitInspection, uploadPropertyImage, transitionRequest } from "@/lib/valuation-api"
import type { InspectionSummary } from "@/lib/valuation-api"

const inp = "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[oklch(0.42_0.19_25)/25]"
const lbl = "mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500"

export default function InspectionDetailPage() {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  const params = useParams()
  const router = useRouter()
  const inspectionId = params.id as string

  const [inspection, setInspection] = useState<InspectionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [field, setField] = useState("")
  const [observation, setObservation] = useState("")
  const [addingNote, setAddingNote] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const load = useCallback(() => {
    if (!token) return
    getInspection(token, inspectionId).then(setInspection).finally(() => setLoading(false))
  }, [token, inspectionId])

  useEffect(() => { load() }, [load])

  const handleAddNote = async () => {
    if (!token || !field || !observation) return
    setAddingNote(true)
    try { await addInspectionNote(token, inspectionId, field, observation); setField(""); setObservation(""); load() }
    finally { setAddingNote(false) }
  }

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !token || !inspection?.request.property?.id) return
    setUploading(true)
    try { await uploadPropertyImage(token, inspection.request.property.id, file, "inspection"); load() }
    finally { setUploading(false) }
  }

  const handleSubmit = async () => {
    if (!token) return
    setSubmitting(true); setError("")
    try {
      await submitInspection(token, inspectionId, new Date().toISOString())
      // Submitting the inspection is what moves the request into valuer review.
      try { await transitionRequest(token, inspection!.request.id, "valuer_review" as any) } catch {}
      router.push("/valuation/inspections")
    } catch (e: any) {
      setError(e.message || "Failed to submit inspection")
    }
    setSubmitting(false)
  }

  if (loading) return <div className="flex justify-center py-32"><Loader2 size={26} className="animate-spin text-muted-foreground" /></div>
  if (!inspection) return <p className="text-sm text-muted-foreground">Inspection not found.</p>

  const property = inspection.request.property
  const isSubmitted = inspection.status === "submitted"

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/valuation/inspections" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> My Inspections
      </Link>

      <p className="mb-1 font-mono text-xs font-semibold text-muted-foreground">{inspection.request.reference}</p>
      <h1 className="mb-6 font-heading text-3xl font-bold text-slate-800">
        {property?.upi ? `Plot ${property.upi}` : "Property Inspection"}
      </h1>

      {property && (
        <div className="mb-5 rounded-xl border border-border bg-white p-5">
          <div className="mb-2 flex items-center gap-2"><MapPin size={15} className="text-[oklch(0.42_0.19_25)]" /><h2 className="font-heading text-base font-bold text-slate-800">Property</h2></div>
          <p className="text-sm text-slate-600">{property.propertyCategory} \u2014 {property.propertySubtype}</p>
          {property.land?.plotSizeSqm && <p className="text-xs text-muted-foreground">Plot: {property.land.plotSizeSqm} sqm</p>}
          {property.buildings?.length > 0 && (
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Building2 size={12} /> {property.buildings.map((b) => b.name).join(", ")}
            </div>
          )}
        </div>
      )}

      <div className="mb-5 rounded-xl border border-border bg-white p-5">
        <h2 className="mb-3 font-heading text-base font-bold text-slate-800">Observations</h2>
        {inspection.notes.length > 0 && (
          <div className="mb-4 space-y-2">
            {inspection.notes.map((n) => (
              <div key={n.id} className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs font-semibold text-slate-700">{n.field}</p>
                <p className="text-sm text-slate-600">{n.observation}</p>
              </div>
            ))}
          </div>
        )}
        {!isSubmitted && (
          <div className="space-y-2">
            <input value={field} onChange={(e) => setField(e.target.value)} className={inp} placeholder="Area, e.g. 'Roof condition', 'Boundary'" />
            <textarea value={observation} onChange={(e) => setObservation(e.target.value)} className={inp} rows={2} placeholder="What did you observe?" />
            <button onClick={handleAddNote} disabled={addingNote || !field || !observation} className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-900 disabled:opacity-40">
              <Plus size={13} /> Add observation
            </button>
          </div>
        )}
      </div>

      {property && !isSubmitted && (
        <div className="mb-5 rounded-xl border border-border bg-white p-5">
          <div className="mb-3 flex items-center gap-2"><Camera size={15} className="text-[oklch(0.42_0.19_25)]" /><h2 className="font-heading text-base font-bold text-slate-800">Photos</h2></div>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-6 text-sm text-muted-foreground hover:border-[oklch(0.42_0.19_25)] hover:text-[oklch(0.42_0.19_25)]">
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
            {uploading ? "Uploading\u2026" : "Take or upload a photo"}
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} disabled={uploading} />
          </label>
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={15} className="flex-none" /> {error}
        </div>
      )}

      {isSubmitted ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center text-sm font-semibold text-emerald-700">
          Inspection submitted \u2014 sent to the valuer for review.
        </div>
      ) : (
        <button onClick={handleSubmit} disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[oklch(0.42_0.19_25)] py-3 text-sm font-semibold text-white hover:bg-[oklch(0.36_0.18_25)] disabled:opacity-50">
          {submitting ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Submit inspection to valuer
        </button>
      )}
    </div>
  )
}
