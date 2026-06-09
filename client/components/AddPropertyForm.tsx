"use client"

import { useState, useRef, useCallback } from "react"
import {
  Check, Loader2, ChevronRight, ChevronLeft,
  Building2, MapPin, DollarSign, Ruler,
  Upload, X, Star, AlertCircle, ImageIcon,
  Home, Briefcase, Leaf, Factory,
  Tag, Calendar, Hash,
} from "lucide-react"
import { createProperty } from "@/lib/api"
import { formatPrice } from "@/lib/utils"

// ── Types ──────────────────────────────────────────────────────────────
type FormState = {
  // Step 1 – Details
  title: string
  description: string
  propertyType: string
  category: "residential" | "commercial" | "agricultural" | "industrial"
  upi: string
  // Step 2 – Location
  district: string
  sector: string
  // Step 3 – Pricing
  price: string
  priceUnit: "RWF" | "USD"
  priceFrequency: "" | "month" | "year"
  offerType: "sale" | "rent" | "short_stay"
  // Step 4 – Specs
  bedrooms: string
  bathrooms: string
  area: string
  featured: boolean
  // Step 5 – Images (preview only, URL strings)
  images: string[]
}

const EMPTY: FormState = {
  title: "", description: "", propertyType: "", category: "residential", upi: "",
  district: "Kicukiro", sector: "",
  price: "", priceUnit: "RWF", priceFrequency: "", offerType: "sale",
  bedrooms: "", bathrooms: "", area: "", featured: false,
  images: [],
}

const DISTRICTS = [
  "Kicukiro","Nyarugenge","Gasabo","Musanze",
  "Rubavu","Muhanga","Kayonza","Rusizi","Bugesera",
]

const PROPERTY_TYPES: Record<FormState["category"], string[]> = {
  residential:  ["Apartment","Villa","Single Family Home","Townhouse","Duplex","Plot","G+1"],
  commercial:   ["Office","Shop","Showroom","Hotel","Guest House","Bar & Restaurant","Fuel Station"],
  agricultural: ["Farmland","Crop Plantation","Greenhouse"],
  industrial:   ["Industrial Land","Factory","Warehouse","Distribution Center"],
}

const CATEGORY_META: { value: FormState["category"]; label: string; icon: React.ElementType; desc: string }[] = [
  { value: "residential",  label: "Residential",  icon: Home,      desc: "Houses, apartments, villas, plots" },
  { value: "commercial",   label: "Commercial",   icon: Briefcase, desc: "Offices, shops, hotels" },
  { value: "agricultural", label: "Agricultural", icon: Leaf,      desc: "Farms, greenhouses, plantations" },
  { value: "industrial",   label: "Industrial",   icon: Factory,   desc: "Factories, warehouses, land" },
]

const OFFER_META = [
  { value: "sale",       label: "For Sale",    color: "border-red-300 bg-red-50 text-red-700",        dot: "bg-red-500" },
  { value: "rent",       label: "For Rent",    color: "border-green-300 bg-green-50 text-green-700",  dot: "bg-green-500" },
  { value: "short_stay", label: "Short Stay",  color: "border-amber-300 bg-amber-50 text-amber-700",  dot: "bg-amber-500" },
] as const

// ── Steps config ───────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Details",  icon: Building2  },
  { id: 2, label: "Location", icon: MapPin     },
  { id: 3, label: "Pricing",  icon: DollarSign },
  { id: 4, label: "Specs",    icon: Ruler      },
  { id: 5, label: "Images",   icon: ImageIcon  },
]

// ── Validation per step ────────────────────────────────────────────────
function validateStep(step: number, form: FormState): string[] {
  const errors: string[] = []
  if (step === 1) {
    if (!form.title.trim())        errors.push("Title is required")
    if (!form.description.trim())  errors.push("Description is required")
    if (!form.propertyType)        errors.push("Property type is required")
  }
  if (step === 2) {
    if (!form.district) errors.push("District is required")
    if (!form.sector.trim()) errors.push("Sector is required")
  }
  if (step === 3) {
    if (!form.price || Number(form.price) <= 0) errors.push("Valid price is required")
  }
  return errors
}

// ── Sub-components ─────────────────────────────────────────────────────
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-slate-600 mb-1.5 tracking-wide uppercase">
      {children} {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  )
}

function TextInput({ value, onChange, placeholder, required, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; type?: string
}) {
  return (
    <input
      type={type}
      required={required}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white
        focus:outline-none focus:ring-2 focus:ring-[oklch(0.42_0.19_25)/30] focus:border-[oklch(0.42_0.19_25)]
        placeholder:text-slate-300 transition-all"
    />
  )
}

function Textarea({ value, onChange, placeholder, rows = 4 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white resize-none
        focus:outline-none focus:ring-2 focus:ring-[oklch(0.42_0.19_25)/30] focus:border-[oklch(0.42_0.19_25)]
        placeholder:text-slate-300 transition-all"
    />
  )
}

function Select({ value, onChange, children }: {
  value: string; onChange: (v: string) => void; children: React.ReactNode
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white
        focus:outline-none focus:ring-2 focus:ring-[oklch(0.42_0.19_25)/30] focus:border-[oklch(0.42_0.19_25)]
        transition-all appearance-none cursor-pointer"
    >
      {children}
    </select>
  )
}

function NumericSpinner({ label, value, onChange, icon }: {
  label: string; value: string; onChange: (v: string) => void; icon?: React.ReactNode
}) {
  const n = Number(value) || 0
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
        <button type="button" onClick={() => onChange(String(Math.max(0, n - 1)))}
          className="px-3 py-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors text-lg font-light border-r border-slate-200">
          −
        </button>
        <div className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold">
          {icon}
          <span>{n === 0 ? "—" : n}</span>
        </div>
        <button type="button" onClick={() => onChange(String(n + 1))}
          className="px-3 py-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors text-lg font-light border-l border-slate-200">
          +
        </button>
      </div>
    </div>
  )
}

// ── Live Preview Card ──────────────────────────────────────────────────
function PreviewCard({ form }: { form: FormState }) {
  const offerMeta = OFFER_META.find(o => o.value === form.offerType)
  const hasDetails = form.title || form.district || form.price

  if (!hasDetails) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-300 py-12">
        <Building2 size={40} strokeWidth={1} />
        <p className="text-sm">Your listing preview will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Image placeholder / preview */}
      <div className="relative rounded-xl overflow-hidden bg-slate-100 aspect-[16/10]">
        {form.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={form.images[0]} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-300">
            <ImageIcon size={28} strokeWidth={1} />
            <span className="text-xs">No image yet</span>
          </div>
        )}
        {offerMeta && (
          <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full border ${offerMeta.color}`}>
            {offerMeta.label}
          </span>
        )}
        {form.featured && (
          <span className="absolute top-3 right-3 flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-400 text-black border border-amber-300">
            <Star size={10} className="fill-black" /> Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest">
          {form.propertyType || "Property"} · {form.category}
        </p>
        <h3 className="font-bold text-base leading-tight text-slate-800 line-clamp-2">
          {form.title || "Property Title"}
        </h3>
        {(form.sector || form.district) && (
          <p className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin size={11} /> {[form.sector, form.district].filter(Boolean).join(", ")}
          </p>
        )}
        {form.price && (
          <p className="text-lg font-black text-[oklch(0.42_0.19_25)]">
            {formatPrice(Number(form.price), form.priceUnit, form.priceFrequency || null)}
          </p>
        )}

        {/* Specs pills */}
        {(form.bedrooms || form.bathrooms || form.area) && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {form.bedrooms && (
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {form.bedrooms} bed{Number(form.bedrooms) !== 1 ? "s" : ""}
              </span>
            )}
            {form.bathrooms && (
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {form.bathrooms} bath{Number(form.bathrooms) !== 1 ? "s" : ""}
              </span>
            )}
            {form.area && (
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {form.area} m²
              </span>
            )}
          </div>
        )}

        {form.description && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 pt-1 border-t border-slate-100">
            {form.description}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────
export default function AddPropertyForm({
  token,
  onSuccess,
}: {
  token: string
  onSuccess: () => void
}) {
  const [form, setForm]     = useState<FormState>(EMPTY)
  const [step, setStep]     = useState(1)
  const [errors, setErrors] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [done, setDone]     = useState(false)
  const fileInputRef        = useRef<HTMLInputElement>(null)

  const set = useCallback(<K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: val }))
    setErrors([])
  }, [])

  const goNext = () => {
    const errs = validateStep(step, form)
    if (errs.length) { setErrors(errs); return }
    setErrors([])
    setStep(s => Math.min(s + 1, STEPS.length))
  }

  const goBack = () => { setErrors([]); setStep(s => Math.max(s - 1, 1)) }

  // Image preview from file input
  const handleFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = e => {
        const url = e.target?.result as string
        setForm(prev => ({ ...prev, images: [...prev.images, url] }))
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (idx: number) =>
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await createProperty({
        title:          form.title,
        description:    form.description,
        propertyType:   form.propertyType,
        category:       form.category,
        upi:            form.upi || undefined,
        district:       form.district,
        sector:         form.sector,
        price:          Number(form.price),
        priceUnit:      form.priceUnit,
        priceFrequency: form.priceFrequency || undefined,
        offerType:      form.offerType,
        bedrooms:       form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms:      form.bathrooms ? Number(form.bathrooms) : undefined,
        area:           form.area ? Number(form.area) : undefined,
        featured:       form.featured,
        images:         [],   // TODO: upload files to /properties/:id/images after creation
      }, token)
      setDone(true)
      setTimeout(() => { setDone(false); setForm(EMPTY); setStep(1); onSuccess() }, 2000)
    } catch (err: any) {
      setErrors([err.message || "Failed to save property"])
    }
    setSaving(false)
  }

  // ── Success state ──
  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <Check size={32} className="text-green-600" strokeWidth={2.5} />
        </div>
        <h3 className="text-xl font-bold">Property Listed!</h3>
        <p className="text-sm text-slate-500">Redirecting to properties list…</p>
      </div>
    )
  }

  const progressPct = ((step - 1) / (STEPS.length - 1)) * 100

  return (
    <div className="flex gap-8 items-start">
      {/* ── Left: form ── */}
      <div className="flex-1 min-w-0 max-w-2xl">
        {/* Step header */}
        <div className="mb-6">
          {/* Progress bar */}
          <div className="relative h-1 bg-slate-100 rounded-full mb-6">
            <div
              className="absolute left-0 top-0 h-full bg-[oklch(0.42_0.19_25)] rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Step pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {STEPS.map(s => {
              const Icon = s.icon
              const isActive   = step === s.id
              const isComplete = step > s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => { if (s.id < step) { setErrors([]); setStep(s.id) } }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive   ? "bg-[oklch(0.42_0.19_25)] text-white shadow-sm"
                    : isComplete ? "bg-green-100 text-green-700 cursor-pointer hover:bg-green-200"
                    : "bg-slate-100 text-slate-400 cursor-default"
                  }`}
                >
                  {isComplete
                    ? <Check size={11} strokeWidth={3} />
                    : <Icon size={11} />
                  }
                  {s.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Error banner */}
        {errors.length > 0 && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-5 text-sm">
            <AlertCircle size={15} className="mt-0.5 flex-none" />
            <div>
              {errors.map((e, i) => <p key={i}>{e}</p>)}
            </div>
          </div>
        )}

        {/* ── STEP 1 – Details ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <FieldLabel required>Listing Title</FieldLabel>
              <TextInput
                value={form.title}
                onChange={v => set("title", v)}
                placeholder="e.g. Elegant 3-Bedroom Apartment in Kimihurura"
              />
              <p className="text-xs text-slate-400 mt-1">{form.title.length}/500 characters</p>
            </div>

            <div>
              <FieldLabel required>Description</FieldLabel>
              <Textarea
                value={form.description}
                onChange={v => set("description", v)}
                rows={5}
                placeholder="Describe the property — features, condition, surroundings, highlights…"
              />
            </div>

            {/* Category cards */}
            <div>
              <FieldLabel required>Category</FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORY_META.map(({ value, label, icon: Icon, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => { set("category", value); set("propertyType", "") }}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                      form.category === value
                        ? "border-[oklch(0.42_0.19_25)] bg-[oklch(0.42_0.19_25/0.05)]"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-none ${
                      form.category === value ? "bg-[oklch(0.42_0.19_25)] text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      <Icon size={15} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-tight">{label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Property type */}
            <div>
              <FieldLabel required>Property Type</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_TYPES[form.category].map(pt => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => set("propertyType", pt)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      form.propertyType === pt
                        ? "bg-[oklch(0.42_0.19_25)] text-white border-[oklch(0.42_0.19_25)]"
                        : "border-slate-200 text-slate-600 hover:border-slate-400 bg-white"
                    }`}
                  >
                    {pt}
                  </button>
                ))}
              </div>
            </div>

            {/* UPI */}
            <div>
              <FieldLabel>UPI (Property ID)</FieldLabel>
              <div className="relative">
                <Hash size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={form.upi}
                  onChange={e => set("upi", e.target.value)}
                  placeholder="e.g. 1/05/01/01/0001"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white
                    focus:outline-none focus:ring-2 focus:ring-[oklch(0.42_0.19_25)/30] focus:border-[oklch(0.42_0.19_25)]
                    placeholder:text-slate-300 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2 – Location ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <FieldLabel required>District</FieldLabel>
              <div className="grid grid-cols-3 gap-2">
                {DISTRICTS.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => set("district", d)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-all ${
                      form.district === d
                        ? "bg-[oklch(0.42_0.19_25)] text-white border-[oklch(0.42_0.19_25)]"
                        : "border-slate-200 text-slate-600 hover:border-slate-400 bg-white"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <FieldLabel required>Sector / Neighbourhood</FieldLabel>
              <div className="relative">
                <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={form.sector}
                  onChange={e => set("sector", e.target.value)}
                  placeholder="e.g. Kimihurura, Nyamirambo, Remera…"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white
                    focus:outline-none focus:ring-2 focus:ring-[oklch(0.42_0.19_25)/30] focus:border-[oklch(0.42_0.19_25)]
                    placeholder:text-slate-300 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3 – Pricing ── */}
        {step === 3 && (
          <div className="space-y-5">
            {/* Offer type */}
            <div>
              <FieldLabel required>Offer Type</FieldLabel>
              <div className="grid grid-cols-3 gap-3">
                {OFFER_META.map(o => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => set("offerType", o.value)}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                      form.offerType === o.value ? o.color + " border-current" : "border-slate-200 text-slate-500 bg-white hover:border-slate-300"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${form.offerType === o.value ? o.dot : "bg-slate-300"}`} />
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <FieldLabel required>Price</FieldLabel>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    {form.priceUnit}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={e => set("price", e.target.value)}
                    placeholder="0"
                    className="w-full pl-12 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white
                      focus:outline-none focus:ring-2 focus:ring-[oklch(0.42_0.19_25)/30] focus:border-[oklch(0.42_0.19_25)]
                      transition-all font-mono"
                  />
                </div>
                <Select value={form.priceUnit} onChange={v => set("priceUnit", v as "RWF" | "USD")}>
                  <option value="RWF">RWF</option>
                  <option value="USD">USD</option>
                </Select>
              </div>
              {form.price && (
                <p className="text-xs text-slate-500 mt-1.5 font-medium">
                  Preview: {formatPrice(Number(form.price), form.priceUnit, form.priceFrequency || null)}
                </p>
              )}
            </div>

            {/* Frequency — only for rent/short_stay */}
            {form.offerType !== "sale" && (
              <div>
                <FieldLabel>Billing Frequency</FieldLabel>
                <div className="flex gap-2">
                  {(["", "month", "year"] as const).map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => set("priceFrequency", f)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        form.priceFrequency === f
                          ? "bg-slate-800 text-white border-slate-800"
                          : "border-slate-200 text-slate-600 hover:border-slate-400 bg-white"
                      }`}
                    >
                      {f === "" ? "One-time" : f === "month" ? "Per Month" : "Per Year"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 4 – Specs ── */}
        {step === 4 && (
          <div className="space-y-6">
            {form.category === "residential" && (
              <div className="grid grid-cols-2 gap-4">
                <NumericSpinner label="Bedrooms" value={form.bedrooms} onChange={v => set("bedrooms", v)}
                  icon={<span className="text-slate-400 text-xs">🛏</span>} />
                <NumericSpinner label="Bathrooms" value={form.bathrooms} onChange={v => set("bathrooms", v)}
                  icon={<span className="text-slate-400 text-xs">🚿</span>} />
              </div>
            )}

            <div>
              <FieldLabel>Total Area (m²)</FieldLabel>
              <div className="relative">
                <Ruler size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  value={form.area}
                  onChange={e => set("area", e.target.value)}
                  placeholder="e.g. 120"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white
                    focus:outline-none focus:ring-2 focus:ring-[oklch(0.42_0.19_25)/30] focus:border-[oklch(0.42_0.19_25)]
                    placeholder:text-slate-300 transition-all font-mono"
                />
              </div>
            </div>

            {/* Featured toggle */}
            <div
              onClick={() => set("featured", !form.featured)}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                form.featured
                  ? "border-amber-400 bg-amber-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                form.featured ? "bg-amber-400" : "bg-slate-100"
              }`}>
                <Star size={18} className={form.featured ? "text-white fill-white" : "text-slate-400"} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Feature this listing</p>
                <p className="text-xs text-slate-500">Featured properties appear at the top of search results and on the homepage</p>
              </div>
              <div className={`w-10 h-5 rounded-full transition-colors relative ${form.featured ? "bg-amber-400" : "bg-slate-200"}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form.featured ? "left-5" : "left-0.5"}`} />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 5 – Images ── */}
        {step === 5 && (
          <div className="space-y-5">
            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
              className="border-2 border-dashed border-slate-300 rounded-2xl p-10 flex flex-col items-center gap-3
                cursor-pointer hover:border-[oklch(0.42_0.19_25)] hover:bg-slate-50 transition-all group text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-[oklch(0.42_0.19_25/0.1)] flex items-center justify-center transition-colors">
                <Upload size={20} className="text-slate-400 group-hover:text-[oklch(0.42_0.19_25)] transition-colors" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Drop images here or click to upload</p>
                <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, WebP — up to 10 images</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => handleFiles(e.target.files)}
              />
            </div>

            {/* Image grid */}
            {form.images.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">{form.images.length} image{form.images.length !== 1 ? "s" : ""} added</p>
                <div className="grid grid-cols-3 gap-2">
                  {form.images.map((src, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded-full">
                          Cover
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center
                          opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-slate-100">
          {step > 1 && (
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-200
                text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft size={15} /> Back
            </button>
          )}

          <div className="flex-1" />

          {step < STEPS.length ? (
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[oklch(0.42_0.19_25)] text-white
                text-sm font-semibold hover:bg-[oklch(0.36_0.18_25)] transition-colors shadow-sm"
            >
              Continue <ChevronRight size={15} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-green-600 text-white
                text-sm font-semibold hover:bg-green-700 disabled:opacity-60 transition-colors shadow-sm"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} strokeWidth={2.5} />}
              {saving ? "Publishing…" : "Publish Listing"}
            </button>
          )}
        </div>
      </div>

      {/* ── Right: live preview ── */}
      <div className="w-72 xl:w-80 flex-none hidden lg:block">
        <div className="sticky top-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Live Preview</p>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <PreviewCard form={form} />
          </div>
          <p className="text-xs text-slate-400 text-center mt-3">Updates as you type</p>
        </div>
      </div>
    </div>
  )
}
