"use client"

import { useState } from "react"
import { Search, Loader2, MapPin } from "lucide-react"
import { publicLookupCadastralByUpi, publicDrivingDistanceCadastralByUpi } from "@/lib/valuation-api"
import type { CadastralLookupResult, CadastralDrivingDistanceResult } from "@/lib/valuation-api"

const inp =
  "w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[oklch(0.42_0.19_25)/25]"

/**
 * Public beta widget for the landing page: enter a UPI, get its plot area
 * and distance to the Kigali CBD from imported cadastral survey data.
 * Calls the unauthenticated /valuation/cadastral/public-lookup endpoint.
 *
 * Coverage is currently limited to imported districts (Kamonyi, Gakenke,
 * Gicumbi, Muhanga, Kigali City) -- a "not found" result is expected and
 * explained, not treated as an error.
 */
export default function CbdDistanceChecker() {
  const [upi, setUpi] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CadastralLookupResult | null>(null)
  const [error, setError] = useState("")
  const [checked, setChecked] = useState(false)
  const [driving, setDriving] = useState<CadastralDrivingDistanceResult | null>(null)
  const [drivingLoading, setDrivingLoading] = useState(false)

  const handleCheck = async () => {
    if (!upi.trim()) return
    setLoading(true)
    setError("")
    setResult(null)
    setDriving(null)
    try {
      const r = await publicLookupCadastralByUpi(upi.trim())
      setResult(r)
    } catch (e: any) {
      setError(
        e?.message?.includes("No cadastral record")
          ? e.message
          : "Something went wrong looking that up. Please try again."
      )
    }
    setChecked(true)
    setLoading(false)
  }

  const handleDrivingDistance = async () => {
    if (!upi.trim()) return
    setDrivingLoading(true)
    try {
      const r = await publicDrivingDistanceCadastralByUpi(upi.trim())
      setDriving(r)
    } catch {
      setDriving({ upi: upi.trim(), drivingDistanceKm: null, drivingDurationMin: null, available: false, note: "Couldn\'t reach the routing service. Please try again." })
    }
    setDrivingLoading(false)
  }

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-1 flex items-center justify-center gap-2">
        <MapPin size={16} className="text-[oklch(0.42_0.19_25)]" />
        <span className="text-xs font-bold tracking-widest text-[oklch(0.42_0.19_25)] uppercase">
          Beta
        </span>
      </div>
      <h3 className="mb-1 text-center text-xl font-black">Check a plot's distance to the CBD</h3>
      <p className="mb-5 text-center text-sm text-muted-foreground">
        Enter a UPI (e.g. <span className="font-mono">1/02/01/01/4295</span>) to see its plot size,
        location and straight-line distance to Kigali's CBD — from official cadastral survey records.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={upi}
          onChange={(e) => setUpi(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCheck()}
          className={inp}
          placeholder="e.g. 1/02/01/01/4295"
        />
        <button
          onClick={handleCheck}
          disabled={loading || !upi.trim()}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-[oklch(0.42_0.19_25)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[oklch(0.36_0.18_25)] disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          Check
        </button>
      </div>

      {checked && error && (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">{error}</p>
      )}

      {checked && result && (
        <div className="mt-4 rounded-lg border border-border bg-[oklch(0.97_0.005_80)] p-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">District</p>
              <p className="font-bold">{result.district || "—"}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Sector</p>
              <p className="font-bold">{result.sector || "—"}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Cell</p>
              <p className="font-bold">{result.cell || "—"}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Plot area</p>
              <p className="font-bold">{result.plotAreaSqm != null ? `${result.plotAreaSqm} sqm` : "—"}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Distance to CBD</p>
              <p className="text-lg font-black text-[oklch(0.42_0.19_25)]">
                {result.distanceToCbdKm != null ? `${result.distanceToCbdKm} km` : "—"}
              </p>
            </div>
          </div>
          <p className="mt-3 font-mono text-[11px] text-muted-foreground">
            Parcel coordinates: {result.latitude?.toFixed(6)}, {result.longitude?.toFixed(6)} &nbsp;|&nbsp;
            CBD reference: {result.cbdReference.lat}, {result.cbdReference.lng}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">{result.distanceNote} To compare against Google Maps, paste both coordinate pairs above as origin/destination and use driving mode — a straight-line number will always read lower than a driving route.</p>

          <div className="mt-3 border-t border-border pt-3">
            {!driving && (
              <button
                onClick={handleDrivingDistance}
                disabled={drivingLoading}
                className="flex items-center gap-1.5 text-xs font-semibold text-[oklch(0.42_0.19_25)] hover:underline disabled:opacity-50"
              >
                {drivingLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                {drivingLoading ? "Getting driving distance…" : "Get real driving distance →"}
              </button>
            )}
            {driving && (
              <div>
                {driving.available ? (
                  <p className="text-sm">
                    <span className="font-semibold">Driving distance: </span>
                    <span className="font-black text-[oklch(0.42_0.19_25)]">{driving.drivingDistanceKm} km</span>
                    {driving.drivingDurationMin != null && (
                      <span className="text-muted-foreground"> (~{driving.drivingDurationMin} min by road)</span>
                    )}
                  </p>
                ) : (
                  <p className="text-xs text-amber-700">{driving.note || "Driving distance currently unavailable."}</p>
                )}
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Routed via a free public routing service — good for testing; a production rollout would move
                  this to a paid or self-hosted routing engine for reliability.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <p className="mt-4 text-center text-[11px] text-muted-foreground">
        Coverage so far: Kamonyi, Gakenke, Gicumbi, Muhanga, Kigali City. More districts are being added.
      </p>
    </div>
  )
}
