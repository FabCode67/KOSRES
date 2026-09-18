"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { createRequest } from "@/lib/valuation-api"
import type { ValuationPurpose } from "@/lib/valuation-api"

const PURPOSES: { value: ValuationPurpose; label: string }[] = [
  { value: "loan_application",    label: "Loan application" },
  { value: "sale_purchase",       label: "Sale / purchase" },
  { value: "insurance",           label: "Insurance" },
  { value: "investment",          label: "Investment" },
  { value: "taxation",            label: "Taxation" },
  { value: "accounting",          label: "Accounting" },
  { value: "financial_reporting", label: "Financial reporting" },
  { value: "forced_sale",         label: "Forced sale" },
  { value: "market_value",        label: "Market value" },
  { value: "other",               label: "Other" },
]

export default function NewValuationRequestPage() {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  const router = useRouter()

  const [purpose, setPurpose] = useState<ValuationPurpose>("loan_application")
  const [beneficiary, setBeneficiary] = useState("")
  const [instructor, setInstructor] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const inp = "w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[oklch(0.42_0.19_25)/25]"
  const lbl = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500"

  const handleCreate = async () => {
    if (!token) return
    setSaving(true)
    setError("")
    try {
      const request = await createRequest(token, { purpose, beneficiary: beneficiary || undefined, instructor: instructor || undefined })
      router.push(`/valuation/requests/${request.id}`)
    } catch (e: any) {
      setError(e.message || "Failed to create request")
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/valuation" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> All requests
      </Link>

      <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-[oklch(0.42_0.19_25)]">Valuation Register</p>
      <h1 className="mb-6 font-heading text-3xl font-bold text-slate-800">New valuation request</h1>

      <div className="space-y-5 rounded-xl border border-border bg-white p-6">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle size={15} className="flex-none" /> {error}
          </div>
        )}

        <div>
          <label className={lbl}>Purpose of valuation</label>
          <select value={purpose} onChange={(e) => setPurpose(e.target.value as ValuationPurpose)} className={inp}>
            {PURPOSES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>

        <div>
          <label className={lbl}>Beneficiary (optional)</label>
          <input value={beneficiary} onChange={(e) => setBeneficiary(e.target.value)} className={inp} placeholder="e.g. Equity Bank Rwanda Ltd" />
        </div>

        <div>
          <label className={lbl}>Instructor (optional)</label>
          <input value={instructor} onChange={(e) => setInstructor(e.target.value)} className={inp} placeholder="Who instructed this valuation" />
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          A reference number is generated automatically. Property details, engine selection, and the calculation itself are added on the next screen.
        </p>

        <button
          onClick={handleCreate}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[oklch(0.42_0.19_25)] py-3 text-sm font-semibold text-white transition-colors hover:bg-[oklch(0.36_0.18_25)] disabled:opacity-60"
        >
          {saving ? <><Loader2 size={15} className="animate-spin" /> Creating…</> : <><Check size={15} /> Create request</>}
        </button>
      </div>
    </div>
  )
}
