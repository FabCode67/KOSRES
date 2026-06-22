"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Search, Loader2, SlidersHorizontal,
  Bed, Bath, Maximize2, MapPin,
  Send, CheckCircle2, ChevronDown, X,
} from "lucide-react"
import { getProperties, submitServiceRequest } from "@/lib/api"
import { formatPriceCompact, whatsappLink } from "@/lib/utils"
import { WhatsAppIcon } from "@/components/social-icons"
import type { ApiProperty } from "@/lib/api"

const TABS = [
  { value: "all",        label: "All Listings" },
  { value: "sale",       label: "For Sale"     },
  { value: "rent",       label: "For Rent"     },
  { value: "short_stay", label: "Short Stay"   },
]

const OFFER_LABEL: Record<string, string> = {
  sale:       "For Sale",
  rent:       "For Rent",
  short_stay: "Short Stay",
}
const OFFER_CLS: Record<string, string> = {
  sale:       "bg-[oklch(0.42_0.19_25)] text-white",
  rent:       "bg-green-700 text-white",
  short_stay: "bg-amber-500 text-black",
}

interface Props { accent: string }

export default function BuySellRentListings({ accent }: Props) {
  const [properties, setProperties] = useState<ApiProperty[]>([])
  const [loading,    setLoading]    = useState(true)
  const [tab,        setTab]        = useState("all")
  const [search,     setSearch]     = useState("")

  // Request form
  const [selected,   setSelected]   = useState<ApiProperty | null>(null)
  const [form,       setForm]       = useState({ name: "", email: "", contact: "", message: "" })
  const [sending,    setSending]    = useState(false)
  const [sent,       setSent]       = useState(false)
  const [formError,  setFormError]  = useState("")

  const formRef    = useRef<HTMLDivElement>(null)
  const listingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getProperties({ limit: 200 })
      .then(res => setProperties(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return properties.filter(p => {
      if (tab !== "all" && p.offerType !== tab) return false
      if (q && !p.title.toLowerCase().includes(q) &&
          !p.sector.toLowerCase().includes(q) &&
          !p.district.toLowerCase().includes(q)) return false
      return true
    })
  }, [properties, tab, search])

  const counts = useMemo(() => ({
    all:        properties.length,
    sale:       properties.filter(p => p.offerType === "sale").length,
    rent:       properties.filter(p => p.offerType === "rent").length,
    short_stay: properties.filter(p => p.offerType === "short_stay").length,
  }), [properties])

  // Select a property and scroll down to the form
  const handleSelect = (p: ApiProperty) => {
    setSelected(p)
    setSent(false)
    setFormError("")
    setForm({ name: "", email: "", contact: "", message: "" })
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 80)
  }

  // Clear selection and scroll back up to listings
  const handleClear = () => {
    setSelected(null)
    setSent(false)
    setFormError("")
    setTimeout(() => {
      listingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 80)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim())    { setFormError("Please enter your name."); return }
    if (!form.contact.trim()) { setFormError("Please enter your contact number."); return }
    setSending(true); setFormError("")
    try {
      await submitServiceRequest({
        service: selected
          ? `Property Request — ${OFFER_LABEL[selected.offerType]}`
          : "Property General Enquiry",
        name:    form.name,
        email:   form.email || undefined,
        contact: form.contact,
        data: {
          ...(selected ? {
            propertyId:    selected.id,
            propertyTitle: selected.title,
            offerType:     OFFER_LABEL[selected.offerType],
            price:         formatPriceCompact(Number(selected.price), selected.priceUnit, selected.priceFrequency),
            location:      `${selected.sector}, ${selected.district}`,
          } : {}),
          message: form.message,
        },
      })
      setSent(true)
    } catch {
      setFormError("Something went wrong. Please try WhatsApp instead.")
    }
    setSending(false)
  }

  const waMsg = selected
    ? `Hello KOSRES, I'm interested in:\n\n🏠 *${selected.title}*\n📍 ${selected.sector}, ${selected.district}\n💰 ${formatPriceCompact(Number(selected.price), selected.priceUnit, selected.priceFrequency)}\n🏷 ${OFFER_LABEL[selected.offerType]}\n\nMy name: ${form.name || "..."}\nContact: ${form.contact || "..."}\n\n${form.message}`
    : `Hello KOSRES, I have a general property enquiry.\n\nMy name: ${form.name || "..."}\nContact: ${form.contact || "..."}\n\n${form.message}`

  const inpCls = "w-full px-4 py-3 rounded-xl text-sm bg-white/10 border border-white/20 text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/15 transition-all"
  const lblCls = "block text-[11px] font-bold text-white/70 uppercase tracking-widest mb-1.5"

  return (
    <div>

      {/* ── Section heading ── */}
      <div ref={listingRef} className="flex items-center justify-between mb-6 scroll-mt-40">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Available Listings</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {loading
              ? "Loading properties…"
              : `${filtered.length} propert${filtered.length !== 1 ? "ies" : "y"} found — click "Request this" to enquire`}
          </p>
        </div>
        <Link href="/properties"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg border-2 transition-all"
          style={{ borderColor: accent, color: accent }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = accent; el.style.color = "white" }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "transparent"; el.style.color = accent }}>
          <SlidersHorizontal size={13} /> Full listings
        </Link>
      </div>

      {/* ── Tabs + Search ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-3 mb-3 border-b border-slate-100">
          {TABS.map(t => {
            const active = tab === t.value
            return (
              <button key={t.value} onClick={() => setTab(t.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-none ${
                  active ? "text-white shadow-sm" : "text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-800"
                }`}
                style={active ? { backgroundColor: accent } : undefined}>
                {t.label}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-white/25 text-white" : "bg-slate-200 text-slate-500"}`}>
                  {counts[t.value as keyof typeof counts]}
                </span>
              </button>
            )
          })}
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by title, sector, district…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none bg-slate-50 focus:bg-white transition-colors" />
        </div>
      </div>

      {/* ── Property grid ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-slate-400" />
        </div>
      ) : filtered.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(p => {
              const isChosen = selected?.id === p.id
              return (
                <div key={p.id}
                  className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden flex flex-col transition-all duration-200 ${
                    isChosen ? "shadow-xl scale-[1.02]" : "border-transparent hover:border-slate-200 hover:shadow-md"
                  }`}
                  style={isChosen ? { borderColor: accent } : undefined}>

                  {/* Thumbnail */}
                  <Link href={`/properties/${p.id}`} className="relative block h-48 flex-none overflow-hidden">
                    {p.images[0]
                      ? <Image src={p.images[0]} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px)100vw,(max-width:1024px)50vw,33vw" />
                      : <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-400 text-xs">No image</div>
                    }
                    <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${OFFER_CLS[p.offerType]}`}>
                      {OFFER_LABEL[p.offerType]}
                    </span>
                    {isChosen && (
                      <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold bg-white text-green-700 px-2.5 py-1 rounded-full shadow-md">
                        <CheckCircle2 size={10} className="fill-green-100" /> Selected
                      </span>
                    )}
                  </Link>

                  {/* Body */}
                  <div className="p-4 flex flex-col flex-1 gap-2">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">{p.propertyType} · {p.category}</p>
                      <Link href={`/properties/${p.id}`}>
                        <h3 className="font-bold text-sm leading-snug mt-0.5 hover:text-[oklch(0.42_0.19_25)] transition-colors line-clamp-2">{p.title}</h3>
                      </Link>
                      <p className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                        <MapPin size={10} /> {p.sector}, {p.district}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      {p.bedrooms  && <span className="flex items-center gap-1"><Bed       size={11}/>{p.bedrooms}</span>}
                      {p.bathrooms && <span className="flex items-center gap-1"><Bath      size={11}/>{p.bathrooms}</span>}
                      {p.area      && <span className="flex items-center gap-1"><Maximize2 size={11}/>{Number(p.area).toLocaleString()} m²</span>}
                    </div>

                    <p className="text-lg font-black leading-none" style={{ color: accent }}>
                      {formatPriceCompact(Number(p.price), p.priceUnit, p.priceFrequency)}
                    </p>

                    {/* ── Action buttons ── */}
                    <div className="flex gap-2 mt-auto pt-3 border-t border-slate-100">
                      <button
                        onClick={() => isChosen ? handleClear() : handleSelect(p)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all text-white"
                        style={{ backgroundColor: isChosen ? "#16a34a" : accent }}>
                        {isChosen
                          ? <><CheckCircle2 size={13} /> Selected — scroll down</>
                          : <><Send size={13} /> Request this</>
                        }
                      </button>
                      <a href={whatsappLink(`Hello KOSRES, I'm interested in "${p.title}" (${OFFER_LABEL[p.offerType]}) — ${formatPriceCompact(Number(p.price), p.priceUnit, p.priceFrequency)}. Please send more details.`)}
                        target="_blank" rel="noopener noreferrer"
                        title="Chat on WhatsApp"
                        className="whatsapp-btn w-10 h-10 flex items-center justify-center rounded-xl text-white flex-none">
                        <WhatsAppIcon size={15} />
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* View all CTA */}
          <div className="mt-8 text-center">
            <Link href="/properties"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-bold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: accent }}>
              View all {properties.length} listings on the full page →
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center py-20 text-slate-400">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-slate-600">No properties found</p>
          <p className="text-sm mt-1">Try a different tab or search term</p>
        </div>
      )}

      {/* ── Request Form ── */}
      <div ref={formRef} className="mt-16 scroll-mt-40">

        {/* Divider with scroll anchor hint */}
        <div className="relative mb-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="flex items-center gap-2 px-4 bg-[#f4f2ef] text-sm font-semibold text-slate-400 uppercase tracking-widest">
              <ChevronDown size={14} /> Enquiry Form <ChevronDown size={14} />
            </span>
          </div>
        </div>

        {/* ── Selected property preview OR empty state ── */}
        {selected ? (
          <div
            className="mb-6 rounded-2xl border-2 p-4 flex items-center gap-4 bg-white shadow-sm"
            style={{ borderColor: accent }}>
            {/* Thumbnail */}
            <div className="relative w-20 h-16 rounded-xl overflow-hidden flex-none bg-slate-100 shrink-0">
              {selected.images[0]
                ? <Image src={selected.images[0]} alt={selected.title} fill className="object-cover" sizes="80px" />
                : <div className="w-full h-full bg-slate-200" />
              }
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${OFFER_CLS[selected.offerType]}`}>
                  {OFFER_LABEL[selected.offerType]}
                </span>
                <span className="text-[10px] text-slate-400">{selected.district}</span>
              </div>
              <p className="font-bold text-sm text-slate-800 truncate leading-snug">{selected.title}</p>
              <p className="text-base font-black mt-0.5" style={{ color: accent }}>
                {formatPriceCompact(Number(selected.price), selected.priceUnit, selected.priceFrequency)}
              </p>
            </div>
            {/* Clear */}
            <button onClick={handleClear}
              className="flex-none flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 shrink-0">
              <X size={13} /> Clear
            </button>
          </div>
        ) : (
          <div className="mb-6 rounded-2xl border-2 border-dashed border-slate-300 p-5 text-center bg-white">
            <p className="text-slate-400 text-sm leading-relaxed">
              👆 Click <strong style={{ color: accent }}>"Request this"</strong> on any property above to attach it to your request,
              or fill in the form below for a general enquiry.
            </p>
          </div>
        )}

        {/* ── The form ── */}
        {sent ? (
          /* Success state */
          <div className="rounded-2xl p-10 text-center text-white" style={{ backgroundColor: accent }}>
            <div className="w-16 h-16 rounded-full bg-white/15 border border-white/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-black mb-2">Request Sent!</h3>
            <p className="text-white/70 text-sm mb-2 max-w-sm mx-auto">
              Our team will reach out within 24 hours
              {selected ? <> about <strong className="text-white">{selected.title}</strong></> : ""}.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <a href={whatsappLink(waMsg)} target="_blank" rel="noopener noreferrer"
                className="whatsapp-btn inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm">
                <WhatsAppIcon size={16} /> Also chat on WhatsApp
              </a>
              <button
                onClick={() => { setSent(false); setSelected(null); setForm({ name: "", email: "", contact: "", message: "" }) }}
                className="px-6 py-3 rounded-xl bg-white/15 text-white font-semibold text-sm hover:bg-white/25 transition-colors">
                Send another request
              </button>
            </div>
          </div>
        ) : (
          /* Form */
          <div className="rounded-2xl overflow-hidden shadow-lg" style={{ backgroundColor: accent }}>
            {/* Header */}
            <div className="px-6 sm:px-8 py-6 border-b border-white/10">
              <span className="text-amber-300 text-[10px] font-bold tracking-widest uppercase">
                {selected ? "Property Enquiry" : "General Enquiry"}
              </span>
              <h3 className="text-xl font-black text-white mt-0.5">
                {selected ? `Enquire about: ${selected.title}` : "Submit a Property Request"}
              </h3>
              <p className="text-white/50 text-xs mt-1">
                {selected
                  ? "Fill in your details — our agent will contact you with more information about this property."
                  : "Don't see what you're looking for? Tell us and we'll find the perfect match."
                }
              </p>
            </div>

            {/* Fields */}
            <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={lblCls}>Your Name <span className="text-amber-300">*</span></label>
                  <input type="text" required placeholder="Full name"
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className={inpCls} />
                </div>
                <div>
                  <label className={lblCls}>Contact / Phone <span className="text-amber-300">*</span></label>
                  <input type="tel" required placeholder="+250 7XX XXX XXX"
                    value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
                    className={inpCls} />
                </div>
              </div>
              <div>
                <label className={lblCls}>Email Address</label>
                <input type="email" placeholder="your@email.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className={inpCls} />
              </div>
              <div>
                <label className={lblCls}>{selected ? "Additional Notes" : "What are you looking for?"}</label>
                <textarea rows={4} value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder={selected
                    ? "Specific questions about this property, preferred viewing times, financing needs, or anything else…"
                    : "Describe the property you want — location, size, budget, number of rooms, timeline…"
                  }
                  className={`${inpCls} resize-none leading-relaxed`} />
              </div>

              {formError && (
                <p className="text-amber-300 text-xs font-semibold bg-white/10 px-3 py-2 rounded-lg">
                  ⚠ {formError}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-white/10">
                <button type="submit" disabled={sending}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white font-bold text-sm disabled:opacity-60 hover:bg-white/90 transition-colors"
                  style={{ color: accent }}>
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
              <p className="text-center text-[10px] text-white/30">
                Your information is kept confidential and used only to process your request.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
