"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Loader2, Plus, Database } from "lucide-react"
import { getComparables, createComparable } from "@/lib/valuation-api"
import type { ComparableProperty } from "@/lib/valuation-api"

const inp = "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[oklch(0.42_0.19_25)/25]"
const lbl = "mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500"
const fmt = (n: number) => "RWF " + Math.round(n).toLocaleString("en-US")

export default function ComparablesPage() {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined

  const [comparables, setComparables] = useState<ComparableProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const load = () => { if (token) getComparables(token).then(setComparables).finally(() => setLoading(false)) }
  useEffect(load, [token])

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-[oklch(0.42_0.19_25)]">Market Evidence</p>
          <h1 className="font-heading text-3xl font-bold text-slate-800">Comparable Properties</h1>
          <p className="mt-1 text-sm text-muted-foreground">Reusable transaction evidence for the Sales Comparison engine — not tied to a single valuation.</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-2 rounded-lg bg-[oklch(0.42_0.19_25)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[oklch(0.36_0.18_25)]">
          <Plus size={15} /> Add comparable
        </button>
      </div>

      {showForm && <ComparableForm token={token!} onSaved={() => { setShowForm(false); load() }} />}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
      ) : comparables.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border py-16 text-center text-muted-foreground">
          <Database size={36} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">No comparables yet — add transaction evidence as you come across it.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Plot / Building</th>
                <th className="px-4 py-3">Condition</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {comparables.map((c) => {
                const tx = c.transactions?.[0]
                return (
                  <tr key={c.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3 text-slate-700">{c.sector ? `${c.sector}, ` : ""}{c.district || "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{c.plotAreaSqm ?? "–"} sqm / {c.buildingAreaSqm ?? "–"} sqm</td>
                    <td className="px-4 py-3 text-slate-600">{c.condition || "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-800">{tx ? fmt(tx.price) : "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{tx ? new Date(tx.transactionDate).toLocaleDateString("en-GB") : "—"}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function ComparableForm({ token, onSaved }: { token: string; onSaved: () => void }) {
  const [district, setDistrict] = useState("")
  const [sector, setSector] = useState("")
  const [plotArea, setPlotArea] = useState("")
  const [buildingArea, setBuildingArea] = useState("")
  const [bedrooms, setBedrooms] = useState("")
  const [condition, setCondition] = useState("Good")
  const [price, setPrice] = useState("")
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0, 10))
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!price) return
    setSaving(true)
    await createComparable(token, {
      district: district || undefined, sector: sector || undefined,
      plotAreaSqm: plotArea ? Number(plotArea) : undefined,
      buildingAreaSqm: buildingArea ? Number(buildingArea) : undefined,
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      condition,
      transaction: { transactionDate, price: Number(price) },
    })
    setSaving(false)
    onSaved()
  }

  return (
    <div className="mb-6 rounded-xl border border-border bg-white p-5">
      <div className="grid grid-cols-4 gap-3">
        <div><label className={lbl}>District</label><input value={district} onChange={(e) => setDistrict(e.target.value)} className={inp} /></div>
        <div><label className={lbl}>Sector</label><input value={sector} onChange={(e) => setSector(e.target.value)} className={inp} /></div>
        <div><label className={lbl}>Plot area (sqm)</label><input type="number" value={plotArea} onChange={(e) => setPlotArea(e.target.value)} className={inp} /></div>
        <div><label className={lbl}>Building area (sqm)</label><input type="number" value={buildingArea} onChange={(e) => setBuildingArea(e.target.value)} className={inp} /></div>
        <div><label className={lbl}>Bedrooms</label><input type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className={inp} /></div>
        <div>
          <label className={lbl}>Condition</label>
          <select value={condition} onChange={(e) => setCondition(e.target.value)} className={inp}>
            {["Very poor", "Poor", "Fair", "Good", "Very good", "Excellent"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div><label className={lbl}>Sale price (RWF)</label><input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={inp} /></div>
        <div><label className={lbl}>Transaction date</label><input type="date" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} className={inp} /></div>
      </div>
      <button onClick={handleSave} disabled={saving || !price} className="mt-4 rounded-lg bg-[oklch(0.42_0.19_25)] px-4 py-2 text-sm font-semibold text-white hover:bg-[oklch(0.36_0.18_25)] disabled:opacity-50">
        {saving ? "Saving…" : "Save comparable"}
      </button>
    </div>
  )
}
