"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Search, Loader2, Car, Send, CheckCircle2, X, ChevronDown } from "lucide-react"
import Navbar from "@/components/Navbar"
import CarCard from "@/components/CarCard"
import { getCars, submitServiceRequest } from "@/lib/api"
import { whatsappLink } from "@/lib/utils"
import { WhatsAppIcon } from "@/components/social-icons"
import type { ApiCar } from "@/lib/api"

const TABS = [
  { value: "all",  label: "All Cars"        },
  { value: "rent", label: "For Rent"        },
  { value: "sale", label: "For Sale"        },
  { value: "taxi", label: "Taxi / Transfer" },
]

const ACCENT = "#7B1113"

export default function CarsPage() {
  const [cars,      setCars]      = useState<ApiCar[]>([])
  const [loading,   setLoading]   = useState(true)
  const [tab,       setTab]       = useState("all")
  const [search,    setSearch]    = useState("")
  const [brand,     setBrand]     = useState("all")
  const [selected,  setSelected]  = useState<ApiCar | null>(null)
  const [form,      setForm]      = useState({ name: "", email: "", contact: "", message: "" })
  const [sending,   setSending]   = useState(false)
  const [sent,      setSent]      = useState(false)
  const [formError, setFormError] = useState("")
  const formRef    = useRef<HTMLDivElement>(null)
  const listingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getCars({ limit: 200 })
      .then(res => setCars(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const brands = useMemo(() => {
    const set = new Set(cars.map(c => c.brand))
    return ["all", ...Array.from(set).sort()]
  }, [cars])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return cars.filter(c => {
      if (tab !== "all" && c.serviceType !== tab) return false
      if (brand !== "all" && c.brand !== brand) return false
      if (q && !c.title.toLowerCase().includes(q) &&
          !c.brand.toLowerCase().includes(q) &&
          !c.model.toLowerCase().includes(q)) return false
      return true
    })
  }, [cars, tab, search, brand])

  const counts = useMemo(() => ({
    all:  cars.length,
    rent: cars.filter(c => c.serviceType === "rent").length,
    sale: cars.filter(c => c.serviceType === "sale").length,
    taxi: cars.filter(c => c.serviceType === "taxi").length,
  }), [cars])

  const handleRequest = (car: ApiCar) => {
    setSelected(car); setSent(false); setFormError("")
    setForm({ name: "", email: "", contact: "", message: "" })
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80)
  }
  const handleClear = () => {
    setSelected(null); setSent(false)
    setTimeout(() => listingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim())    { setFormError("Please enter your name."); return }
    if (!form.contact.trim()) { setFormError("Please enter your contact number."); return }
    setSending(true); setFormError("")
    try {
      await submitServiceRequest({
        service: selected
          ? `Car Request — ${selected.serviceType === "rent" ? "For Rent" : selected.serviceType === "sale" ? "For Sale" : "Taxi"}`
          : "Car General Enquiry",
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
    } catch { setFormError("Something went wrong. Please try WhatsApp instead.") }
    setSending(false)
  }

  const waMsg = selected
    ? `Hello KOSRES, I'm interested in:\n\n🚗 *${selected.brand} ${selected.model} ${selected.year ?? ""}*\n💰 ${Number(selected.price).toLocaleString()} ${selected.priceUnit}${selected.priceFrequency ? "/" + selected.priceFrequency : ""}\n📍 ${selected.location ?? selected.district ?? "Kigali"}\n\nMy name: ${form.name || "..."}\nContact: ${form.contact || "..."}\n\n${form.message}`
    : `Hello KOSRES, I have a car enquiry.\n\nMy name: ${form.name || "..."}\nContact: ${form.contact || "..."}\n\n${form.message}`

  const inpCls = "w-full px-4 py-3 rounded-xl text-sm bg-white/10 border border-white/20 text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/15 transition-all"
  const lblCls = "block text-[11px] font-bold text-white/70 uppercase tracking-widest mb-1.5"

  return (
    <>
      <Navbar />
      <div className="pt-36 min-h-screen bg-[oklch(0.97_0.005_80)]">

        {/* Page header */}
        <div className="bg-[#1C2B4B] text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
            <p className="text-amber-300 text-[11px] font-bold tracking-[0.22em] uppercase mb-2">Mobility Services</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3">Cars — Rent, Buy & Taxi</h1>
            <p className="text-white/70 text-sm max-w-2xl leading-relaxed">
              Browse our fleet of vetted, insured vehicles available for rent, purchase or taxi services across Rwanda.
              Click "Request this" on any car to send us your enquiry directly.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">

          {/* Tabs + filters */}
          <div ref={listingRef} className="scroll-mt-40 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">
            <div className="flex gap-2 overflow-x-auto pb-3 mb-3 border-b border-slate-100">
              {TABS.map(t => {
                const active = tab === t.value
                return (
                  <button key={t.value} onClick={() => setTab(t.value)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-none ${
                      active ? "text-white shadow-sm" : "text-slate-500 bg-slate-50 hover:bg-slate-100"
                    }`}
                    style={active ? { backgroundColor: ACCENT } : undefined}>
                    {t.label}
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-white/25 text-white" : "bg-slate-200 text-slate-500"}`}>
                      {counts[t.value as keyof typeof counts]}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="flex gap-3 flex-col sm:flex-row">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search by title, brand, model…"
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:bg-white transition-colors" />
              </div>
              <select value={brand} onChange={e => setBrand(e.target.value)}
                className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none min-w-[140px]">
                <option value="all">All Brands</option>
                {brands.filter(b => b !== "all").map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-slate-500 mb-4">
            {loading ? "Loading…" : `${filtered.length} car${filtered.length !== 1 ? "s" : ""} found`}
            {selected && (
              <span className="ml-3 text-[oklch(0.42_0.19_25)] font-semibold">
                · 1 selected — <button onClick={handleClear} className="underline">clear</button>
              </span>
            )}
          </p>

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={32} className="animate-spin text-slate-400" />
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {filtered.map(car => (
                <div key={car.id}
                  className={`rounded-2xl transition-all duration-200 ${selected?.id === car.id ? "ring-2 ring-[#7B1113] scale-[1.01]" : ""}`}>
                  <CarCard car={car} onRequest={handleRequest} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 text-slate-400">
              <Car size={44} className="mx-auto mb-3 opacity-25" strokeWidth={1} />
              <p className="font-semibold text-slate-600">No cars found</p>
              <p className="text-sm mt-1">Try a different tab or search term</p>
            </div>
          )}

          {/* ── Request Form ── */}
          <div ref={formRef} className="scroll-mt-40 mt-10">
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="flex items-center gap-2 px-4 bg-[oklch(0.97_0.005_80)] text-sm font-semibold text-slate-400 uppercase tracking-widest">
                  <ChevronDown size={14} /> Enquiry Form
                </span>
              </div>
            </div>

            {/* Selected car preview / empty state */}
            {selected ? (
              <div className="mb-6 rounded-2xl border-2 p-4 flex items-center gap-4 bg-white shadow-sm"
                style={{ borderColor: ACCENT }}>
                <div className="relative w-20 h-14 rounded-xl overflow-hidden flex-none bg-slate-100">
                  {selected.images[0]
                    ? <img src={selected.images[0]} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Car size={20} className="text-slate-300" /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Selected Vehicle</p>
                  <p className="font-bold text-sm text-slate-800 truncate">
                    {selected.brand} {selected.model} {selected.year ?? ""} — {selected.title}
                  </p>
                  <p className="font-black text-base mt-0.5" style={{ color: ACCENT }}>
                    {Number(selected.price).toLocaleString()} {selected.priceUnit}
                    {selected.priceFrequency ? `/${selected.priceFrequency}` : ""}
                  </p>
                </div>
                <button onClick={handleClear}
                  className="flex-none flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                  <X size={13} /> Clear
                </button>
              </div>
            ) : (
              <div className="mb-6 rounded-2xl border-2 border-dashed border-slate-300 p-5 text-center bg-white">
                <p className="text-slate-400 text-sm leading-relaxed">
                  👆 Click <strong style={{ color: ACCENT }}>"Request this"</strong> on any car above to attach it to your enquiry,
                  or fill in the form below for a general request.
                </p>
              </div>
            )}

            {/* Form */}
            {sent ? (
              <div className="rounded-2xl p-10 text-center text-white" style={{ backgroundColor: ACCENT }}>
                <div className="w-16 h-16 rounded-full bg-white/15 border border-white/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} strokeWidth={2} />
                </div>
                <h3 className="text-xl font-black mb-2">Request Sent!</h3>
                <p className="text-white/70 text-sm mb-6 max-w-sm mx-auto">
                  Our team will reach out within 24 hours
                  {selected && <> about the <strong className="text-white">{selected.brand} {selected.model}</strong></>}.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a href={whatsappLink(waMsg)} target="_blank" rel="noopener noreferrer"
                    className="whatsapp-btn inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm">
                    <WhatsAppIcon size={16} /> Also chat on WhatsApp
                  </a>
                  <button
                    onClick={() => { setSent(false); setSelected(null); setForm({ name: "", email: "", contact: "", message: "" }) }}
                    className="px-6 py-3 rounded-xl bg-white/15 font-semibold text-sm hover:bg-white/25 transition-colors">
                    Send another request
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden shadow-lg" style={{ backgroundColor: ACCENT }}>
                <div className="px-6 sm:px-8 py-6 border-b border-white/10">
                  <span className="text-amber-300 text-[10px] font-bold tracking-widest uppercase">Car Enquiry</span>
                  <h3 className="text-xl font-black text-white mt-0.5">
                    {selected ? `Enquire: ${selected.brand} ${selected.model}` : "General Car Request"}
                  </h3>
                  <p className="text-white/50 text-xs mt-1">
                    {selected
                      ? "Fill in your details — our team will contact you shortly."
                      : "Tell us what you're looking for and we'll find the perfect vehicle."}
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-7 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={lblCls}>Your Name <span className="text-amber-300">*</span></label>
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
                    <label className={lblCls}>Email Address</label>
                    <input type="email" placeholder="your@email.com" value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inpCls} />
                  </div>
                  <div>
                    <label className={lblCls}>{selected ? "Additional Notes" : "What are you looking for?"}</label>
                    <textarea rows={4} value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder={selected
                        ? "Preferred dates, duration, pickup location, any special requirements…"
                        : "Describe the car you need — brand, type, budget, dates, duration…"
                      }
                      className={`${inpCls} resize-none leading-relaxed`} />
                  </div>
                  {formError && (
                    <p className="text-amber-300 text-xs font-semibold bg-white/10 px-3 py-2 rounded-lg">⚠ {formError}</p>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-white/10">
                    <button type="submit" disabled={sending}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white font-bold text-sm disabled:opacity-60 hover:bg-white/90 transition-colors"
                      style={{ color: ACCENT }}>
                      {sending
                        ? <><Loader2 size={15} className="animate-spin" /> Sending…</>
                        : <><Send size={14} /> Submit Request</>
                      }
                    </button>
                    <a href={whatsappLink(waMsg)} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl whatsapp-btn text-white font-bold text-sm hover:opacity-90 transition-opacity">
                      <WhatsAppIcon size={15} /> WhatsApp
                    </a>
                  </div>
                  <p className="text-center text-[10px] text-white/30">Your information is kept confidential.</p>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
