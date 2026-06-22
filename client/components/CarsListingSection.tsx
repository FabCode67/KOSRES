"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Search, Loader2, Car, Fuel, Users, MapPin,
  Star, Send, CheckCircle2, X, ChevronDown, Zap,
} from "lucide-react"
import { getCars, submitServiceRequest } from "@/lib/api"
import { whatsappLink } from "@/lib/utils"
import { WhatsAppIcon } from "@/components/social-icons"
import type { ApiCar } from "@/lib/api"

const TABS = [
  { value: "all",  label: "All Available", color: "#1C2B4B" },
  { value: "rent", label: "For Rent",      color: "#1C2B4B" },
  { value: "sale", label: "For Sale",      color: "#7B1113" },
  { value: "taxi", label: "Taxi / Transfer", color: "#1A4731" },
]
const SERVICE_LABEL: Record<string, string> = {
  rent: "For Rent", sale: "For Sale", taxi: "Taxi",
}
const SERVICE_CLS: Record<string, string> = {
  rent: "bg-[#1C2B4B] text-white",
  sale: "bg-[oklch(0.42_0.19_25)] text-white",
  taxi: "bg-[#1A4731] text-white",
}

interface Props {
  accent:        string
  sectionTitle?: string
  serviceFilter?: "rent" | "sale" | "taxi"  // lock to one type if needed
  formAccent:    string
  formTitle:     string
  formWaPrefix:  string
  formFields:    React.ReactNode            // the ServiceRequestForm to show below
}

export default function CarsListingSection({
  accent, sectionTitle = "Available Vehicles", serviceFilter,
  formAccent, formTitle, formWaPrefix, formFields,
}: Props) {
  const [cars,     setCars]     = useState<ApiCar[]>([])
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState<string>(serviceFilter ?? "all")
  const [search,   setSearch]   = useState("")
  const [selected, setSelected] = useState<ApiCar | null>(null)
  const [form,     setForm]     = useState({ name: "", email: "", contact: "", message: "" })
  const [sending,  setSending]  = useState(false)
  const [sent,     setSent]     = useState(false)
  const [formErr,  setFormErr]  = useState("")
  const formRef    = useRef<HTMLDivElement>(null)
  const topRef     = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getCars({ limit: 200 })
      .then(r => setCars(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return cars.filter(c => {
      if (serviceFilter && c.serviceType !== serviceFilter) return false
      if (!serviceFilter && tab !== "all" && c.serviceType !== tab) return false
      if (q && !c.title.toLowerCase().includes(q) &&
          !c.brand.toLowerCase().includes(q) &&
          !c.model.toLowerCase().includes(q)) return false
      return true
    })
  }, [cars, tab, search, serviceFilter])

  const counts = useMemo(() => ({
    all:  cars.length,
    rent: cars.filter(c => c.serviceType === "rent").length,
    sale: cars.filter(c => c.serviceType === "sale").length,
    taxi: cars.filter(c => c.serviceType === "taxi").length,
  }), [cars])

  const handleSelect = (car: ApiCar) => {
    setSelected(car); setSent(false); setFormErr("")
    setForm({ name: "", email: "", contact: "", message: "" })
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80)
  }

  const handleClear = () => {
    setSelected(null); setSent(false)
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim())    { setFormErr("Name is required."); return }
    if (!form.contact.trim()) { setFormErr("Contact is required."); return }
    setSending(true); setFormErr("")
    try {
      await submitServiceRequest({
        service: selected
          ? `Car Request — ${SERVICE_LABEL[selected.serviceType]}`
          : formTitle,
        name:    form.name,
        email:   form.email || undefined,
        contact: form.contact,
        data: {
          ...(selected ? {
            carId:    selected.id,
            carTitle: selected.title,
            brand:    selected.brand,
            model:    selected.model,
            year:     String(selected.year ?? ""),
            price:    `${Number(selected.price).toLocaleString()} ${selected.priceUnit}${selected.priceFrequency ? "/" + selected.priceFrequency : ""}`,
            location: selected.location ?? selected.district ?? "",
          } : {}),
          message: form.message,
        },
      })
      setSent(true)
    } catch { setFormErr("Something went wrong. Please use WhatsApp.") }
    setSending(false)
  }

  const waMsg = selected
    ? `${formWaPrefix}\n\n🚗 *${selected.brand} ${selected.model} ${selected.year ?? ""}*\n💰 ${Number(selected.price).toLocaleString()} ${selected.priceUnit}${selected.priceFrequency ? "/" + selected.priceFrequency : ""}\n📍 ${selected.location ?? selected.district ?? "Kigali"}\n\nName: ${form.name || "..."}\nContact: ${form.contact || "..."}\n\n${form.message}`
    : `${formWaPrefix}\n\nName: ${form.name || "..."}\nContact: ${form.contact || "..."}\n\n${form.message}`

  const inpCls = "w-full px-4 py-3 rounded-xl text-sm bg-white/10 border border-white/20 text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/15 transition-all"
  const lblCls = "block text-[11px] font-bold text-white/70 uppercase tracking-widest mb-1.5"

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 size={26} className="animate-spin text-slate-400" />
    </div>
  )

  if (cars.filter(c => !serviceFilter || c.serviceType === serviceFilter).length === 0) {
    return null // hide section entirely if no cars for this service type
  }

  return (
    <div className="mb-14">
      {/* ── Section header ── */}
      <div ref={topRef} className="scroll-mt-40 flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-black text-slate-800">{sectionTitle}</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {filtered.length} vehicle{filtered.length !== 1 ? "s" : ""} available
            {selected && (
              <span className="ml-2 font-semibold" style={{ color: accent }}>
                · 1 selected — <button onClick={handleClear} className="underline">clear</button>
              </span>
            )}
          </p>
        </div>
        <Link href="/cars"
          className="hidden sm:inline-flex text-xs font-bold px-3.5 py-2 rounded-lg border-2 transition-colors"
          style={{ borderColor: accent, color: accent }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = accent; el.style.color = "#fff" }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = ""; el.style.color = accent }}>
          View all cars →
        </Link>
      </div>

      {/* ── Tabs + search (only show tabs if not locked to a service type) ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-5">
        {!serviceFilter && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-3 border-b border-slate-100">
            {TABS.map(t => {
              const active = tab === t.value
              return (
                <button key={t.value} onClick={() => setTab(t.value)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-none ${
                    active ? "text-white shadow-sm" : "text-slate-500 bg-slate-50 hover:bg-slate-100"
                  }`}
                  style={active ? { backgroundColor: t.color } : undefined}>
                  {t.label}
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-white/25 text-white" : "bg-slate-200 text-slate-500"}`}>
                    {counts[t.value as keyof typeof counts]}
                  </span>
                </button>
              )
            })}
          </div>
        )}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search brand, model, title…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:bg-white transition-colors" />
        </div>
      </div>

      {/* ── Grid ── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filtered.map(car => {
            const isChosen = selected?.id === car.id
            return (
              <div key={car.id}
                className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden flex flex-col transition-all duration-200 ${
                  isChosen ? "shadow-xl scale-[1.01]" : "border-transparent hover:border-slate-200 hover:shadow-md"
                }`}
                style={isChosen ? { borderColor: accent } : undefined}>

                {/* Image */}
                <Link href={`/cars/${car.id}`} className="relative block h-44 flex-none overflow-hidden bg-slate-100">
                  {car.images[0]
                    ? <Image src={car.images[0]} alt={car.title} fill className="object-cover hover:scale-105 transition-transform duration-500" sizes="(max-width:640px)100vw,(max-width:1024px)50vw,33vw" />
                    : <div className="w-full h-full flex items-center justify-center text-slate-300"><Car size={40} strokeWidth={1} /></div>
                  }
                  <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-1 rounded-full ${SERVICE_CLS[car.serviceType]}`}>
                    {SERVICE_LABEL[car.serviceType]}
                  </span>
                  {car.featured && (
                    <span className="absolute top-2.5 right-2.5 flex items-center gap-0.5 text-[9px] font-bold bg-amber-400 text-black px-2 py-1 rounded-full">
                      <Star size={8} className="fill-black" /> Featured
                    </span>
                  )}
                  {isChosen && (
                    <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1 text-[10px] font-bold bg-white text-green-700 px-2 py-1 rounded-full shadow">
                      <CheckCircle2 size={10} className="fill-green-100" /> Selected
                    </span>
                  )}
                  {car.images.length > 1 && !isChosen && (
                    <span className="absolute bottom-2.5 right-2.5 text-[9px] bg-black/50 text-white px-1.5 py-0.5 rounded-full">
                      +{car.images.length - 1} photos
                    </span>
                  )}
                </Link>

                {/* Body */}
                <div className="p-4 flex flex-col flex-1 gap-2">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">{car.brand} · {car.year ?? ""}</p>
                    <Link href={`/cars/${car.id}`}>
                      <h3 className="font-bold text-sm text-slate-800 hover:text-[oklch(0.42_0.19_25)] transition-colors line-clamp-2 mt-0.5">{car.title}</h3>
                    </Link>
                    {(car.location || car.district) && (
                      <p className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                        <MapPin size={10} /> {car.location ?? car.district}
                      </p>
                    )}
                  </div>

                  {/* Specs */}
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400">
                    {car.fuelType && (
                      <span className="flex items-center gap-1">
                        {car.fuelType === "electric" || car.fuelType === "hybrid"
                          ? <Zap size={10} /> : <Fuel size={10} />}
                        {car.fuelType.charAt(0).toUpperCase() + car.fuelType.slice(1)}
                      </span>
                    )}
                    {car.transmission && <span className="flex items-center gap-1"><Car size={10} />{car.transmission}</span>}
                    {car.seats && <span className="flex items-center gap-1"><Users size={10} />{car.seats} seats</span>}
                  </div>

                  {/* Price */}
                  <p className="text-lg font-black leading-none" style={{ color: accent }}>
                    {Number(car.price).toLocaleString()} {car.priceUnit}
                    {car.priceFrequency && <span className="text-sm font-semibold text-slate-400">/{car.priceFrequency}</span>}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto pt-3 border-t border-slate-100">
                    <button
                      onClick={() => isChosen ? handleClear() : handleSelect(car)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white transition-all"
                      style={{ backgroundColor: isChosen ? "#16a34a" : accent }}>
                      {isChosen
                        ? <><CheckCircle2 size={12} /> Selected — scroll down</>
                        : <><Send size={12} /> Request this</>
                      }
                    </button>
                    <a href={whatsappLink(`Hello KOSRES, I'm interested in the ${car.brand} ${car.model} ${car.year ?? ""} (${SERVICE_LABEL[car.serviceType]}) — ${Number(car.price).toLocaleString()} ${car.priceUnit}${car.priceFrequency ? "/" + car.priceFrequency : ""}. Please share more details.`)}
                      target="_blank" rel="noopener noreferrer"
                      className="whatsapp-btn w-10 h-10 flex items-center justify-center rounded-xl text-white flex-none">
                      <WhatsAppIcon size={14} />
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-10 text-slate-400 border border-dashed border-slate-200 rounded-2xl mb-8">
          <Car size={36} className="mx-auto mb-2 opacity-25" strokeWidth={1} />
          <p className="text-sm">No vehicles found — try a different search</p>
        </div>
      )}

      {/* ── Enquiry form ── */}
      <div ref={formRef} className="scroll-mt-40">
        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
          <div className="relative flex justify-center">
            <span className="flex items-center gap-1.5 px-4 bg-[#f4f2ef] text-xs font-bold text-slate-400 uppercase tracking-widest">
              <ChevronDown size={12} /> Enquiry Form
            </span>
          </div>
        </div>

        {/* Selected car preview or hint */}
        {selected ? (
          <div className="mb-5 rounded-2xl border-2 p-4 flex items-center gap-3 bg-white shadow-sm"
            style={{ borderColor: accent }}>
            <div className="relative w-16 h-12 rounded-xl overflow-hidden flex-none bg-slate-100">
              {selected.images[0]
                ? <Image src={selected.images[0]} alt="" fill className="object-cover" sizes="64px" />
                : <div className="w-full h-full flex items-center justify-center"><Car size={16} className="text-slate-300" /></div>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Selected Vehicle</p>
              <p className="font-bold text-sm text-slate-800 truncate">{selected.brand} {selected.model} {selected.year ?? ""}</p>
              <p className="font-black text-sm" style={{ color: accent }}>
                {Number(selected.price).toLocaleString()} {selected.priceUnit}{selected.priceFrequency ? `/${selected.priceFrequency}` : ""}
              </p>
            </div>
            <button onClick={handleClear}
              className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors flex-none">
              <X size={12} /> Clear
            </button>
          </div>
        ) : (
          <div className="mb-5 rounded-2xl border-2 border-dashed border-slate-300 p-4 text-center bg-white">
            <p className="text-slate-400 text-sm">
              👆 Click <strong style={{ color: accent }}>"Request this"</strong> on a vehicle above to attach it,
              or fill in the form for a general enquiry.
            </p>
          </div>
        )}

        {/* Form */}
        {sent ? (
          <div className="rounded-2xl p-8 text-center text-white" style={{ backgroundColor: formAccent }}>
            <CheckCircle2 size={40} className="mx-auto mb-3 opacity-80" strokeWidth={1.5} />
            <h3 className="text-lg font-black mb-1">Request Sent!</h3>
            <p className="text-white/70 text-sm mb-5">
              Our team will contact you within 24 hours{selected ? <> about the <strong className="text-white">{selected.brand} {selected.model}</strong></> : ""}.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={whatsappLink(waMsg)} target="_blank" rel="noopener noreferrer"
                className="whatsapp-btn inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm">
                <WhatsAppIcon size={15} /> Also chat on WhatsApp
              </a>
              <button onClick={() => { setSent(false); setSelected(null); setForm({ name: "", email: "", contact: "", message: "" }) }}
                className="px-5 py-2.5 rounded-xl bg-white/15 font-semibold text-sm hover:bg-white/25 transition-colors">
                Send another
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden shadow-lg" style={{ backgroundColor: formAccent }}>
            <div className="px-6 py-5 border-b border-white/10">
              <span className="text-amber-300 text-[10px] font-bold tracking-widest uppercase">
                {selected ? "Vehicle Enquiry" : "General Enquiry"}
              </span>
              <h3 className="text-lg font-black text-white mt-0.5">
                {selected ? `Enquire: ${selected.brand} ${selected.model}` : formTitle}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={lblCls}>Name <span className="text-amber-300">*</span></label>
                  <input type="text" required placeholder="Full name" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inpCls} />
                </div>
                <div>
                  <label className={lblCls}>Contact <span className="text-amber-300">*</span></label>
                  <input type="tel" required placeholder="+250 7XX XXX XXX" value={form.contact}
                    onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} className={inpCls} />
                </div>
              </div>
              <div>
                <label className={lblCls}>Email</label>
                <input type="email" placeholder="your@email.com" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inpCls} />
              </div>
              <div>
                <label className={lblCls}>{selected ? "Additional Notes" : "What are you looking for?"}</label>
                <textarea rows={3} value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder={selected
                    ? "Preferred dates, duration, pickup, special requirements…"
                    : "Describe what you need — brand, type, budget, dates…"
                  }
                  className={`${inpCls} resize-none`} />
              </div>
              {formErr && <p className="text-amber-300 text-xs font-semibold bg-white/10 px-3 py-2 rounded-lg">⚠ {formErr}</p>}
              <div className="flex gap-3 pt-2 border-t border-white/10">
                <button type="submit" disabled={sending}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white font-bold text-sm disabled:opacity-60 hover:bg-white/90 transition-colors"
                  style={{ color: formAccent }}>
                  {sending ? <><Loader2 size={14} className="animate-spin" /> Sending…</> : <><Send size={13} /> Submit Request</>}
                </button>
                <a href={whatsappLink(waMsg)} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl whatsapp-btn text-white font-bold text-sm hover:opacity-90 transition-opacity">
                  <WhatsAppIcon size={14} /> WhatsApp
                </a>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
