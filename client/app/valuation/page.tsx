"use client"

import { useEffect, useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Loader2, Search, FilePlus2, ArrowUpRight } from "lucide-react"
import { getRequests } from "@/lib/valuation-api"
import type { ValuationRequestSummary, RequestStatus } from "@/lib/valuation-api"

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft", submitted: "Submitted", assigned: "Assigned",
  data_collection: "Data collection", inspection_in_progress: "Inspection",
  information_required: "Info required", valuer_review: "Valuer review",
  engine_selected: "Engine selected", analysis_in_progress: "Analysis",
  valuer_final_review: "Final review", draft_report: "Draft report",
  approved: "Approved", certified: "Certified", completed: "Completed",
  rejected: "Rejected", cancelled: "Cancelled", on_hold: "On hold",
  reassessment_required: "Reassessment",
}

const STATUS_TONE: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  submitted: "bg-blue-50 text-blue-700",
  assigned: "bg-blue-50 text-blue-700",
  data_collection: "bg-amber-50 text-amber-700",
  inspection_in_progress: "bg-amber-50 text-amber-700",
  information_required: "bg-orange-50 text-orange-700",
  valuer_review: "bg-purple-50 text-purple-700",
  engine_selected: "bg-purple-50 text-purple-700",
  analysis_in_progress: "bg-purple-50 text-purple-700",
  valuer_final_review: "bg-purple-50 text-purple-700",
  draft_report: "bg-indigo-50 text-indigo-700",
  approved: "bg-emerald-50 text-emerald-700",
  certified: "bg-emerald-50 text-emerald-700",
  completed: "bg-emerald-600 text-white",
  rejected: "bg-red-50 text-red-700",
  cancelled: "bg-slate-100 text-slate-500",
  on_hold: "bg-slate-100 text-slate-500",
  reassessment_required: "bg-orange-50 text-orange-700",
}

const PURPOSE_LABEL: Record<string, string> = {
  loan_application: "Loan application", sale_purchase: "Sale / purchase", insurance: "Insurance",
  investment: "Investment", taxation: "Taxation", accounting: "Accounting",
  financial_reporting: "Financial reporting", forced_sale: "Forced sale", market_value: "Market value", other: "Other",
}

export default function ValuationDashboard() {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined

  const [requests, setRequests] = useState<ValuationRequestSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!token) return
    getRequests(token).then(setRequests).catch(() => {}).finally(() => setLoading(false))
  }, [token])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return requests
    return requests.filter((r) =>
      r.reference.toLowerCase().includes(q) ||
      r.beneficiary?.toLowerCase().includes(q) ||
      r.instructor?.toLowerCase().includes(q),
    )
  }, [requests, search])

  const counts = useMemo(() => {
    const active = requests.filter((r) => !["completed", "rejected", "cancelled"].includes(r.status)).length
    const completed = requests.filter((r) => r.status === "completed").length
    return { total: requests.length, active, completed }
  }, [requests])

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-[oklch(0.42_0.19_25)]">Valuation Register</p>
          <h1 className="font-heading text-3xl font-bold text-slate-800">Requests</h1>
        </div>
        <Link
          href="/valuation/requests/new"
          className="flex items-center gap-2 rounded-lg bg-[oklch(0.42_0.19_25)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[oklch(0.36_0.18_25)]"
        >
          <FilePlus2 size={15} /> New Request
        </Link>
      </div>

      {/* Ledger-style stat strip */}
      <div className="mb-6 grid grid-cols-3 divide-x divide-border overflow-hidden rounded-xl border border-border bg-white">
        {[
          { label: "Total requests", value: counts.total },
          { label: "In progress", value: counts.active },
          { label: "Completed", value: counts.completed },
        ].map((s) => (
          <div key={s.label} className="px-6 py-4">
            <p className="font-mono text-2xl font-semibold tabular-nums text-slate-800">{loading ? "–" : s.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by reference, beneficiary, or instructor…"
          className="w-full rounded-lg border border-border bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[oklch(0.42_0.19_25)/25]"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={26} className="animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border py-20 text-center text-muted-foreground">
          <p className="font-semibold">No valuation requests yet</p>
          <Link href="/valuation/requests/new" className="mt-2 inline-block text-sm text-[oklch(0.42_0.19_25)] hover:underline">
            Create the first one →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Purpose</th>
                <th className="px-5 py-3">Beneficiary</th>
                <th className="px-5 py-3">Valuer</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
                  <td className="px-5 py-3.5">
                    <Link href={`/valuation/requests/${r.id}`} className="font-mono text-xs font-semibold text-slate-700 hover:text-[oklch(0.42_0.19_25)]">
                      {r.reference}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{PURPOSE_LABEL[r.purpose] ?? r.purpose}</td>
                  <td className="px-5 py-3.5 text-slate-600">{r.beneficiary || "—"}</td>
                  <td className="px-5 py-3.5 text-slate-600">{r.assignedValuer?.name || "Unassigned"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_TONE[r.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {STATUS_LABEL[r.status] ?? r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/valuation/requests/${r.id}`} className="inline-flex text-muted-foreground hover:text-[oklch(0.42_0.19_25)]">
                      <ArrowUpRight size={15} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
