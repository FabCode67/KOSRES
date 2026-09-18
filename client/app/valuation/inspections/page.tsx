"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Loader2, ClipboardCheck, ChevronRight } from "lucide-react"
import { getMyInspections } from "@/lib/valuation-api"
import type { InspectionSummary } from "@/lib/valuation-api"

const STATUS_TONE: Record<string, string> = {
  assigned: "bg-blue-50 text-blue-700",
  in_progress: "bg-amber-50 text-amber-700",
  submitted: "bg-emerald-50 text-emerald-700",
}

export default function MyInspectionsPage() {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  const [inspections, setInspections] = useState<InspectionSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) getMyInspections(token).then(setInspections).finally(() => setLoading(false))
  }, [token])

  return (
    <div className="mx-auto max-w-4xl">
      <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-[oklch(0.42_0.19_25)]">Field Work</p>
      <h1 className="mb-6 font-heading text-3xl font-bold text-slate-800">My Inspections</h1>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
      ) : inspections.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border py-16 text-center text-muted-foreground">
          <ClipboardCheck size={36} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">No inspections assigned to you yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inspections.map((i) => (
            <Link key={i.id} href={`/valuation/inspections/${i.id}`}
              className="flex items-center justify-between rounded-xl border border-border bg-white p-4 hover:border-[oklch(0.42_0.19_25)] hover:shadow-sm">
              <div>
                <p className="font-mono text-xs font-semibold text-slate-700">{i.request.reference}</p>
                <p className="text-sm text-slate-600">
                  {i.request.property?.upi ? `Plot ${i.request.property.upi}` : i.request.property?.propertyCategory || "Property pending"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_TONE[i.status] ?? "bg-slate-100 text-slate-600"}`}>
                  {i.status.replace(/_/g, " ")}
                </span>
                <ChevronRight size={16} className="text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
