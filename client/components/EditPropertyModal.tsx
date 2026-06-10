"use client"

import { useState, useEffect } from "react"
import { X, Check, Loader2, AlertCircle } from "lucide-react"
import { updateProperty } from "@/lib/api"
import type { ApiProperty } from "@/lib/api"

interface EditPropertyModalProps {
  property: ApiProperty
  token: string
  onClose: () => void
  onSaved: (updated: ApiProperty) => void
}

const DISTRICTS = ["Kicukiro","Nyarugenge","Gasabo","Musanze","Rubavu","Muhanga","Kayonza","Rusizi","Bugesera"]
const PROPERTY_TYPES = ["Flats","Single Family Home","Town House","Duplex","Villa","G+1","Plot","Office","Shop","Showroom","Hotel","Guest House","Bar & Restaurant","Fuel Station","Factory","Distribution Center","Commercial Land","Farmland","Crop Plantation","Green House","Industrial Land","Warehouse","Apartment"]
const STATUS_OPTIONS = ["active","sold","rented","inactive"]

export default function EditPropertyModal({ property, token, onClose, onSaved }: EditPropertyModalProps) {
  const [form, setForm] = useState({
    title:          property.title,
    description:    property.description,
    price:          String(property.price),
    priceUnit:      property.priceUnit,
    priceFrequency: property.priceFrequency ?? "",
    offerType:      property.offerType,
    category:       property.category,
    propertyType:   property.propertyType,
    district:       property.district,
    sector:         property.sector,
    bedrooms:       String(property.bedrooms ?? ""),
    bathrooms:      String(property.bathrooms ?? ""),
    area:           String(property.area ?? ""),
    featured:       property.featured,
    status:         property.status,
    upi:            property.upi ?? "",
  })

  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState("")

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  const set = (key: string, value: unknown) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setError("")
  }

  const handleSave = async () => {
    if (!form.title.trim()) { setError("Title is required"); return }
    if (!Number(form.price) || Number(form.price) <= 0) { setError("Valid price is required"); return }

    setSaving(true)
    try {
      const updated = await updateProperty(property.id, {
        title:          form.title,
        description:    form.description,
        price:          Number(form.price),
        priceUnit:      form.priceUnit as "RWF" | "USD",
        priceFrequency: form.priceFrequency || null,
        offerType:      form.offerType as ApiProperty["offerType"],
        category:       form.category as ApiProperty["category"],
        propertyType:   form.propertyType,
        district:       form.district,
        sector:         form.sector,
        bedrooms:       form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms:      form.bathrooms ? Number(form.bathrooms) : undefined,
        area:           form.area ? Number(form.area) : undefined,
        featured:       form.featured,
        status:         form.status as ApiProperty["status"],
        upi:            form.upi || undefined,
      }, token)
      onSaved(updated)
    } catch (err: any) {
      setError(err.message || "Failed to save changes")
    }
    setSaving(false)
  }

  const inp = "w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[oklch(0.42_0.19_25)/30] focus:border-[oklch(0.42_0.19_25)] transition-all placeholder:text-slate-300"
  const lbl = "block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white sticky top-0 z-10">
          <div>
            <h2 className="font-black text-lg text-slate-800">Edit Property</h2>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-sm">{property.title}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-500">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
              <AlertCircle size={15} className="flex-none" />{error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className={lbl}>Title <span className="text-red-400">*</span></label>
            <input value={form.title} onChange={e => set("title", e.target.value)} className={inp} placeholder="Property title" />
          </div>

          {/* Description */}
          <div>
            <label className={lbl}>Description</label>
            <textarea rows={3} value={form.description} onChange={e => set("description", e.target.value)} className={`${inp} resize-none`} />
          </div>

          {/* Price row */}
          <div>
            <label className={lbl}>Price <span className="text-red-400">*</span></label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                  {form.priceUnit === "USD" ? "$" : "RWF"}
                </span>
                <input
                  type="number" min="0" step="any"
                  value={form.price}
                  onChange={e => set("price", e.target.value)}
                  className={`${inp} pl-11 font-mono`}
                  placeholder="0"
                />
              </div>
              <select value={form.priceUnit} onChange={e => set("priceUnit", e.target.value)} className={`${inp} w-24`}>
                <option value="RWF">RWF</option>
                <option value="USD">USD</option>
              </select>
              <select value={form.priceFrequency} onChange={e => set("priceFrequency", e.target.value)} className={`${inp} w-36`}>
                <option value="">One-time</option>
                <option value="month">Per Month</option>
                <option value="year">Per Year</option>
              </select>
            </div>
            {form.price && (
              <p className="text-xs text-slate-500 mt-1.5 font-medium">
                Preview: {form.priceUnit === "USD"
                  ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(form.price))
                  : new Intl.NumberFormat("en-RW", { maximumFractionDigits: 0 }).format(Number(form.price)) + " RWF"
                }{form.priceFrequency ? `/${form.priceFrequency}` : ""}
              </p>
            )}
          </div>

          {/* Offer + Category row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Offer Type</label>
              <select value={form.offerType} onChange={e => set("offerType", e.target.value)} className={inp}>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
                <option value="short_stay">Short Stay</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Category</label>
              <select value={form.category} onChange={e => set("category", e.target.value)} className={inp}>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="agricultural">Agricultural</option>
                <option value="industrial">Industrial</option>
              </select>
            </div>
          </div>

          {/* Property type */}
          <div>
            <label className={lbl}>Property Type</label>
            <select value={form.propertyType} onChange={e => set("propertyType", e.target.value)} className={inp}>
              {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>District</label>
              <select value={form.district} onChange={e => set("district", e.target.value)} className={inp}>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Sector</label>
              <input value={form.sector} onChange={e => set("sector", e.target.value)} className={inp} placeholder="e.g. Kimihurura" />
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={lbl}>Bedrooms</label>
              <input type="number" min="0" value={form.bedrooms} onChange={e => set("bedrooms", e.target.value)} className={inp} placeholder="—" />
            </div>
            <div>
              <label className={lbl}>Bathrooms</label>
              <input type="number" min="0" value={form.bathrooms} onChange={e => set("bathrooms", e.target.value)} className={inp} placeholder="—" />
            </div>
            <div>
              <label className={lbl}>Area (m²)</label>
              <input type="number" min="0" value={form.area} onChange={e => set("area", e.target.value)} className={inp} placeholder="—" />
            </div>
          </div>

          {/* UPI */}
          <div>
            <label className={lbl}>UPI</label>
            <input value={form.upi} onChange={e => set("upi", e.target.value)} className={inp} placeholder="e.g. 1/05/01/01/0001" />
          </div>

          {/* Status + Featured */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)} className={inp}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div className="flex flex-col justify-end">
              <label
                onClick={() => set("featured", !form.featured)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.featured ? "border-amber-400 bg-amber-50" : "border-slate-200 hover:border-slate-300"}`}
              >
                <div className={`w-9 h-5 rounded-full relative transition-colors ${form.featured ? "bg-amber-400" : "bg-slate-200"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form.featured ? "left-4" : "left-0.5"}`} />
                </div>
                <span className="text-sm font-semibold text-slate-700">Featured</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[oklch(0.42_0.19_25)] text-white font-semibold text-sm hover:bg-[oklch(0.36_0.18_25)] disabled:opacity-60 transition-colors">
            {saving ? <><Loader2 size={14} className="animate-spin" />Saving…</> : <><Check size={14} />Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  )
}
