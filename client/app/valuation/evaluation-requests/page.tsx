"use client"

import { useEffect, useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Loader2, ClipboardCheck, ArrowUpRight } from "lucide-react"
import { getEvaluationIntakes } from "@/lib/valuation-api"
import type { EvaluationIntake, EvaluationIntakeStatus } from "@/lib/valuation-api"

const STATUS_LABEL: Record<EvaluationIntakeStatus, string> = {
  new: "New", in_review: "In review", converted: "Converted", rejected: "Rejected",
}
const STATUS_TONE: Record<EvaluationIntakeStatus, string> = {
  new: "bg-blue-50 text-blue-700",
  in_review: "bg-amber-50 text-amber-700",
  converted: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
}

export default function EvaluationRequestsPage() {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined

  const [intakes, setIntakes] = useState<EvaluationIntake[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<EvaluationIntakeStatus | "all">("all")

  useEffect(() => {
    if (!token) return
    getEvaluationIntakes(token).then(setIntakes).catch(() => {}).finally(() => setLoading(false))
  }, [token])

  const filtered = useMemo(
    () => (filter === "all" ? intakes : intakes.filter((i) => i.status === filter)),
    [intakes, filter],
  )

  const counts = useMemo(() => ({
    total: intakes.length,
    new: intakes.filter((i) => i.status === "new").length,
  }), [intakes])

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-[oklch(0.42_0.19_25)]">Public Intake</p>
          <h1 className="font-heading text-3xl font-bold text-slate-800">Evaluation Requests</h1>
          <p className="mt-1 text-sm text-muted-foreground">Submitted directly by clients from the website — review, then convert into a formal valuation request.</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 divide-x divide-border overflow-hidden rounded-xl border border-border bg-white">
        {[
          { label: "Total submissions", value: counts.total },
          { label: "Awaiting review", value: counts.new },
        ].map((s) => (
          <div key={s.label} className="px-6 py-4">
            <p className="font-mono text-2xl font-semibold tabular-nums text-slate-800">{loading ? "–" : s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex gap-2">
        {(["all", "new", "in_review", "converted", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              filter === f ? "bg-[oklch(0.42_0.19_25)] text-white" : "bg-white text-muted-foreground border border-border hover:bg-muted"
            }`}
          >
            {f === "all" ? "All" : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-white py-20 text-center">
          <ClipboardCheck size={28} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No submissions {filter !== "all" ? `with status "${STATUS_LABEL[filter]}"` : "yet"}.</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((intake) => (
          <Link
            key={intake.id}
            href={`/valuation/evaluation-requests/${intake.id}`}
            className="flex items-center justify-between rounded-xl border border-border bg-white px-5 py-4 shadow-sm transition-colors hover:border-[oklch(0.42_0.19_25)]"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-mono text-xs font-bold text-slate-500">{intake.reference}</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_TONE[intake.status]}`}>
                  {STATUS_LABEL[intake.status]}
                </span>
              </div>
              <p className="mt-1 truncate font-semibold text-slate-800">{intake.clientNames}</p>
              <p className="truncate text-xs text-muted-foreground">
                UPI {intake.upi} · {intake.typeOfProperty}
              </p>
            </div>
            <ArrowUpRight size={16} className="shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  )
}
