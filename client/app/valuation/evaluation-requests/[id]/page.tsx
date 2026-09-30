"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Loader2, FileText, Image as ImageIcon, ArrowRight, CheckCircle2, XCircle, Eye,
} from "lucide-react"
import {
  getEvaluationIntake, updateEvaluationIntakeStatus, convertEvaluationIntake,
} from "@/lib/valuation-api"
import type { EvaluationIntake, EvaluationIntakeStatus } from "@/lib/valuation-api"

const STATUS_LABEL: Record<EvaluationIntakeStatus, string> = {
  new: "New", in_review: "In review", converted: "Converted", rejected: "Rejected",
}
const PURPOSE_LABEL: Record<string, string> = {
  loan_application: "Loan application", sale_purchase: "Sale / purchase", insurance: "Insurance",
  investment: "Investment", taxation: "Taxation", accounting: "Accounting",
  financial_reporting: "Financial reporting", forced_sale: "Forced sale", market_value: "Market value", other: "Other",
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="font-semibold text-slate-800">{value ?? "—"}</p>
    </div>
  )
}

export default function EvaluationRequestDetailPage() {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [intake, setIntake] = useState<EvaluationIntake | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")

  const load = useCallback(() => {
    if (!token) return
    getEvaluationIntake(token, id).then((i) => { setIntake(i); setNotes(i.adminNotes ?? "") }).catch(() => {}).finally(() => setLoading(false))
  }, [token, id])

  useEffect(() => { load() }, [load])

  const handleStatus = async (status: EvaluationIntakeStatus) => {
    if (!token) return
    setBusy(true)
    setError("")
    try {
      await updateEvaluationIntakeStatus(token, id, { status, adminNotes: notes || undefined })
      await load()
    } catch (e: any) {
      setError(e?.message || "Failed to update status.")
    }
    setBusy(false)
  }

  const handleConvert = async () => {
    if (!token) return
    setBusy(true)
    setError("")
    try {
      const result = await convertEvaluationIntake(token, id)
      router.push(`/valuation/requests/${result.requestId}`)
    } catch (e: any) {
      setError(e?.message || "Failed to convert this request.")
      setBusy(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-muted-foreground" /></div>
  }
  if (!intake) {
    return <p className="text-sm text-muted-foreground">Evaluation request not found.</p>
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="mb-1 font-mono text-xs font-bold text-slate-500">{intake.reference}</p>
          <h1 className="font-heading text-2xl font-bold text-slate-800">{intake.clientNames}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Submitted {new Date(intake.createdAt).toLocaleString()}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-600">
          {STATUS_LABEL[intake.status]}
        </span>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl border border-border bg-white p-6 sm:grid-cols-3">
        <Field label="UPI" value={<span className="font-mono">{intake.upi}</span>} />
        <Field label="Purpose" value={PURPOSE_LABEL[intake.purpose] ?? intake.purpose} />
        <Field label="Type of property" value={intake.typeOfProperty} />
        <Field label="Phone" value={intake.clientPhone} />
        <Field label="Email" value={intake.clientEmail} />
        <Field label="Developed?" value={intake.isDeveloped ? "Yes" : "No"} />
        {intake.isDeveloped && (
          <>
            <Field label="Construction material" value={intake.constructionMaterial} />
            <Field label="Bedrooms" value={intake.bedrooms} />
            <Field label="Bathrooms" value={intake.bathrooms} />
          </>
        )}
      </div>

      {intake.landTitleDocumentUrls.length > 0 && (
        <div className="mb-6 rounded-xl border border-border bg-white p-6">
          <p className="mb-3 text-sm font-bold text-slate-800">Land title documents</p>
          <div className="flex flex-wrap gap-2">
            {intake.landTitleDocumentUrls.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-slate-600 hover:border-[oklch(0.42_0.19_25)] hover:text-[oklch(0.42_0.19_25)]">
                <FileText size={14} /> Document {i + 1}
              </a>
            ))}
          </div>
        </div>
      )}

      {intake.propertyPictureUrls.length > 0 && (
        <div className="mb-6 rounded-xl border border-border bg-white p-6">
          <p className="mb-3 text-sm font-bold text-slate-800">Property pictures</p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {intake.propertyPictureUrls.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noreferrer" className="group relative aspect-square overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Property ${i + 1}`} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/30 group-hover:opacity-100">
                  <Eye size={18} className="text-white" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-white p-6">
        <p className="mb-3 text-sm font-bold text-slate-800">Review</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Internal notes (optional)…"
          rows={3}
          className="mb-4 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[oklch(0.42_0.19_25)/25]"
        />

        {error && <p className="mb-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p>}

        {intake.status === "converted" ? (
          <Link
            href={`/valuation/requests/${intake.linkedRequestId}`}
            className="flex items-center gap-2 text-sm font-semibold text-[oklch(0.42_0.19_25)] hover:underline"
          >
            View the linked valuation request <ArrowRight size={14} />
          </Link>
        ) : (
          <div className="flex flex-wrap gap-2">
            {intake.status === "new" && (
              <button onClick={() => handleStatus("in_review")} disabled={busy} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-muted disabled:opacity-50">
                Mark as In Review
              </button>
            )}
            <button
              onClick={handleConvert}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-lg bg-[oklch(0.42_0.19_25)] px-4 py-2 text-sm font-semibold text-white hover:bg-[oklch(0.36_0.18_25)] disabled:opacity-50"
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              Convert to Valuation Request
            </button>
            <button
              onClick={() => handleStatus("rejected")}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <XCircle size={14} /> Reject
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
