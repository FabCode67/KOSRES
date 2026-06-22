"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save, Loader2, AlertCircle } from "lucide-react"
import AdminShell from "@/components/AdminShell"
import { createCar, updateCar } from "@/lib/api"
import { CAR_BRANDS, RWANDA_DISTRICTS_BY_PROVINCE } from "@/lib/rwanda"
import type { ApiCar } from "@/lib/api"

const EMPTY: Partial<ApiCar> = {
  title: "", description: "", brand: "", model: "",
  year: undefined, fuelType: "petrol", transmission: "Automatic",
  seats: undefined, mileage: undefined, color: "", plateNumber: "",
  serviceType: "rent", price: 0, priceUnit: "RWF", priceFrequency: "day",
  district: "", location: "", featured: false, status: "available",
}

interface Props { initial?: ApiCar; mode: "add" | "edit" }

export default function CarForm({ initial, mode }: Props) {
  const router = useRouter()
  const [form,    setForm]    = useState<Partial<ApiCar>>(initial ?? EMPTY)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState("")

  const set = (k: keyof ApiCar, v: any) => setForm(p => ({ ...p, [k]: v }))

  const inp = "w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[oklch(0.42_0.19_25)/30] focus:border-[oklch(0.42_0.19_25)] placeholder:text-slate-300 transition-all"
  const lbl = "block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide"

  const handleSave = async () => {
    if (!form.title?.trim())       { setError("Title is required"); return }
    if (!form.description?.trim()) { setError("Description is required"); return }
    if (!form.brand?.trim())       { setError("Brand is required"); return }
    if (!form.model?.trim())       { setError("Model is required"); return }
    if (!form.price)               { setError("Price is required"); return }
    setSaving(true); setError("")
    try {
      const car = mode === "add"
        ? await createCar(form)
        : await updateCar(initial!.id, form)
      router.push(`/admin/cars/${car.id}/images`)
    } catch (e: any) { setError(e.message) }
    setSaving(false)
  }

  return (
    <AdminShell title={mode === "add" ? "Add Car" : "Edit Car"}>
      <div className="max-w-3xl space-y-6">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={15} className="flex-none" /> {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className={lbl}>Listing Title <span className="text-red-400">*</span></label>
          <input value={form.title || ""} onChange={e => set("title", e.target.value)}
            className={inp} placeholder="e.g. Toyota RAV4 — Short Stay Kigali" />
        </div>

        {/* Description */}
        <div>
          <label className={lbl}>Description <span className="text-red-400">*</span></label>
          <textarea rows={4} value={form.description || ""} onChange={e => set("description", e.target.value)}
            className={`${inp} resize-none`} placeholder="Describe the vehicle, its condition, features and any terms…" />
        </div>

        {/* Brand + Model + Year */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className={lbl}>Brand <span className="text-red-400">*</span></label>
            <select value={form.brand || ""} onChange={e => set("brand", e.target.value)} className={inp}>
              <option value="">Select brand…</option>
              {CAR_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Model <span className="text-red-400">*</span></label>
            <input value={form.model || ""} onChange={e => set("model", e.target.value)}
              className={inp} placeholder="e.g. Corolla, RAV4" />
          </div>
          <div>
            <label className={lbl}>Year</label>
            <input type="number" min={1990} max={2030} value={form.year || ""} onChange={e => set("year", e.target.value ? Number(e.target.value) : undefined)}
              className={inp} placeholder="2023" />
          </div>
        </div>

        {/* Service type + Status + Featured */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className={lbl}>Service Type <span className="text-red-400">*</span></label>
            <select value={form.serviceType || "rent"} onChange={e => {
              set("serviceType", e.target.value)
              // Auto-set priceFrequency based on service
              if (e.target.value === "sale") set("priceFrequency", "")
              else if (e.target.value === "rent") set("priceFrequency", "day")
              else if (e.target.value === "taxi") set("priceFrequency", "trip")
            }} className={inp}>
              <option value="rent">For Rent</option>
              <option value="sale">For Sale</option>
              <option value="taxi">Taxi / Transfer</option>
            </select>
          </div>
          <div>
            <label className={lbl}>Status</label>
            <select value={form.status || "available"} onChange={e => set("status", e.target.value)} className={inp}>
              <option value="available">Available</option>
              <option value="rented">Rented</option>
              <option value="sold">Sold</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex flex-col justify-end">
            <label onClick={() => set("featured", !form.featured)}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                form.featured ? "border-amber-400 bg-amber-50" : "border-slate-200 hover:border-slate-300"
              }`}>
              <div className={`w-9 h-5 rounded-full relative transition-colors ${form.featured ? "bg-amber-400" : "bg-slate-200"}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form.featured ? "left-4" : "left-0.5"}`} />
              </div>
              <span className="text-sm font-semibold text-slate-700">Featured</span>
            </label>
          </div>
        </div>

        {/* Price */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className={lbl}>Price <span className="text-red-400">*</span></label>
            <input type="number" min={0} value={form.price || ""} onChange={e => set("price", Number(e.target.value))}
              className={inp} placeholder="e.g. 50000" />
          </div>
          <div>
            <label className={lbl}>Currency</label>
            <select value={form.priceUnit || "RWF"} onChange={e => set("priceUnit", e.target.value)} className={inp}>
              <option value="RWF">RWF</option>
              <option value="USD">USD</option>
            </select>
          </div>
          {form.serviceType !== "sale" && (
            <div>
              <label className={lbl}>Frequency</label>
              <select value={form.priceFrequency || "day"} onChange={e => set("priceFrequency", e.target.value)} className={inp}>
                <option value="hour">Per Hour</option>
                <option value="trip">Per Trip</option>
                <option value="day">Per Day</option>
                <option value="week">Per Week</option>
                <option value="month">Per Month</option>
              </select>
            </div>
          )}
        </div>

        {/* Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className={lbl}>Fuel Type</label>
            <select value={form.fuelType || "petrol"} onChange={e => set("fuelType", e.target.value)} className={inp}>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="hybrid">Hybrid</option>
              <option value="electric">Electric</option>
            </select>
          </div>
          <div>
            <label className={lbl}>Transmission</label>
            <select value={form.transmission || "Automatic"} onChange={e => set("transmission", e.target.value)} className={inp}>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
              <option value="CVT">CVT</option>
            </select>
          </div>
          <div>
            <label className={lbl}>Seats</label>
            <input type="number" min={1} max={60} value={form.seats || ""} onChange={e => set("seats", e.target.value ? Number(e.target.value) : undefined)}
              className={inp} placeholder="5" />
          </div>
          <div>
            <label className={lbl}>Mileage (km)</label>
            <input type="number" min={0} value={form.mileage || ""} onChange={e => set("mileage", e.target.value ? Number(e.target.value) : undefined)}
              className={inp} placeholder="e.g. 45000" />
          </div>
        </div>

        {/* Color + Plate */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Color</label>
            <input value={form.color || ""} onChange={e => set("color", e.target.value)}
              className={inp} placeholder="e.g. Pearl White" />
          </div>
          <div>
            <label className={lbl}>Plate Number</label>
            <input value={form.plateNumber || ""} onChange={e => set("plateNumber", e.target.value)}
              className={inp} placeholder="e.g. RAB 123A" />
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>District</label>
            <select value={form.district || ""} onChange={e => set("district", e.target.value)} className={inp}>
              <option value="">Select district…</option>
              {RWANDA_DISTRICTS_BY_PROVINCE.map(group => (
                <optgroup key={group.groupLabel} label={group.groupLabel}>
                  {group.items.map(d => <option key={d} value={d}>{d}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className={lbl}>Location (freeform)</label>
            <input value={form.location || ""} onChange={e => set("location", e.target.value)}
              className={inp} placeholder="e.g. Kicukiro, near Sonatubes" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <button onClick={() => router.push("/admin/cars")}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[oklch(0.42_0.19_25)] text-white font-semibold text-sm hover:bg-[oklch(0.36_0.18_25)] disabled:opacity-60 transition-colors">
            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> {mode === "add" ? "Save & Add Photos" : "Save Changes"}</>}
          </button>
        </div>
      </div>
    </AdminShell>
  )
}
