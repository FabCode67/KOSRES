"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft, Car, Fuel, Users, MapPin,
  Calendar, Gauge, Star, ChevronLeft, ChevronRight,
  Zap, Settings, Hash, Palette, Send, Loader2,
} from "lucide-react"
import Navbar from "@/components/Navbar"
import CarCard from "@/components/CarCard"
import { submitServiceRequest } from "@/lib/api"
import { whatsappLink } from "@/lib/utils"
import { WhatsAppIcon } from "@/components/social-icons"
import type { ApiCar } from "@/lib/api"

const SERVICE_LABEL: Record<string, string> = {
  rent: "For Rent", sale: "For Sale", taxi: "Taxi / Transfer",
}
const SERVICE_CLS: Record<string, string> = {
  rent: "bg-[#1C2B4B] text-white",
  sale: "bg-[oklch(0.42_0.19_25)] text-white",
  taxi: "bg-[#1A4731] text-white",
}
const FUEL_ICON: Record<string, React.ReactNode> = {
  electric: <Zap size={14} />, hybrid: <Zap size={14} />,
  petrol: <Fuel size={14} />, diesel: <Fuel size={14} />,
}

const ACCENT = "#7B1113"

interface Props { car: ApiCar; related: ApiCar[] }

export default function CarDetailClient({ car, related }: Props) {
  const [imgIdx, setImgIdx] = useState(0)
  const [form,   setForm]   = useState({ name: "", email: "", contact: "", message: "" })
  const [sending, setSending] = useState(false)
  const [sent,    setSent]   = useState(false)
  const [error,   setError]  = useState("")

  const images  = car.images?.length ? car.images : []
  const prev    = () => setImgIdx(i => (i - 1 + images.length) % images.length)
  const next    = () => setImgIdx(i => (i + 1) % images.length)

  const waMsg = `Hello KOSRES, I'm interested in the *${car.brand} ${car.model}* (${SERVICE_LABEL[car.serviceType]}) — ${Number(car.price).toLocaleString()} ${car.priceUnit}${car.priceFrequency ? "/" + car.priceFrequency : ""}. Please share more details.`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.contact.trim()) { setError("Name and contact are required."); return }
    setSending(true); setError("")
    try {
      await submitServiceRequest({
        service: `Car Request — ${SERVICE_LABEL[car.serviceType]}`,
        name:    form.name,
        email:   form.email || undefined,
        contact: form.contact,
        data: {
          carId: car.id, carTitle: car.title,
          brand: car.brand, model: car.model, year: String(car.year ?? ""),
          price: `${Number(car.price).toLocaleString()} ${car.priceUnit}${car.priceFrequency ? "/" + car.priceFrequency : ""}`,
          location: car.location ?? car.district ?? "",
          message: form.message,
        },
      })
      setSent(true)
    } catch { setError("Something went wrong. Try WhatsApp instead.") }
    setSending(false)
  }

  const inpCls = "w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[oklch(0.42_0.19_25)/30] placeholder:text-slate-300 transition-all"
  const lblCls = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5"

  return (
    <>
      <Navbar />
      <div className="pt-36 min-h-screen bg-[oklch(0.97_0.005_80)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">

          <Link href="/cars"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 mt-2 transition-colors group">
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to cars
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Left: images + details ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Main image */}
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-200 shadow-md">
                {images.length > 0 ? (
                  <Image src={images[imgIdx]} alt={car.title} fill priority
                    className="object-cover" sizes="(max-width:1024px)100vw,66vw" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                    <Car size={64} strokeWidth={1} />
                    <p className="text-sm">No images available</p>
                  </div>
                )}

                {/* Service badge */}
                <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-full shadow ${SERVICE_CLS[car.serviceType]}`}>
                  {SERVICE_LABEL[car.serviceType]}
                </span>

                {car.featured && (
                  <span className="absolute top-4 right-4 flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-400 text-black shadow">
                    <Star size={11} className="fill-black" /> Featured
                  </span>
                )}

                {images.length > 1 && (
                  <>
                    <button onClick={prev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/65 transition-colors backdrop-blur-sm">
                      <ChevronLeft size={20} />
                    </button>
                    <button onClick={next}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/65 transition-colors backdrop-blur-sm">
                      <ChevronRight size={20} />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_, i) => (
                        <button key={i} onClick={() => setImgIdx(i)}
                          className={`rounded-full transition-all ${i === imgIdx ? "w-8 h-2.5 bg-white" : "w-2.5 h-2.5 bg-white/50"}`} />
                      ))}
                    </div>
                    <span className="absolute bottom-4 right-4 text-[11px] font-semibold text-white bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
                      {imgIdx + 1} / {images.length}
                    </span>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setImgIdx(i)}
                      className={`relative flex-none w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                        i === imgIdx ? "border-[oklch(0.42_0.19_25)] scale-105 shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                      }`}>
                      <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                    </button>
                  ))}
                </div>
              )}

              {/* Title + location */}
              <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5">{car.brand} · {car.model}</p>
                <h1 className="text-2xl sm:text-3xl font-black leading-tight mb-3 text-slate-800">{car.title}</h1>
                {(car.location || car.district) && (
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin size={14} className="text-[oklch(0.42_0.19_25)]" />
                    {car.location}{car.district ? `, ${car.district}` : ""}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-3 text-slate-800">About this vehicle</h2>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{car.description}</p>
              </div>

              {/* Specs grid */}
              <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4 text-slate-800">Vehicle Specifications</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { icon: Car,      label: "Brand",        value: car.brand },
                    { icon: Car,      label: "Model",        value: car.model },
                    { icon: Calendar, label: "Year",         value: car.year ? String(car.year) : null },
                    { icon: car.fuelType === "electric" || car.fuelType === "hybrid" ? Zap : Fuel,
                                      label: "Fuel Type",    value: car.fuelType?.charAt(0).toUpperCase() + (car.fuelType?.slice(1) ?? "") },
                    { icon: Settings, label: "Transmission", value: car.transmission },
                    { icon: Users,    label: "Seats",        value: car.seats ? `${car.seats} seats` : null },
                    { icon: Gauge,    label: "Mileage",      value: car.mileage ? `${Number(car.mileage).toLocaleString()} km` : null },
                    { icon: Palette,  label: "Color",        value: car.color },
                    { icon: Hash,     label: "Plate",        value: car.plateNumber },
                    { icon: MapPin,   label: "Location",     value: car.district },
                    { icon: Car,      label: "Service",      value: SERVICE_LABEL[car.serviceType] },
                    { icon: Star,     label: "Status",       value: car.status?.charAt(0).toUpperCase() + (car.status?.slice(1) ?? "") },
                  ].filter(s => s.value).map(spec => (
                    <div key={spec.label} className="bg-slate-50 rounded-xl p-3 border border-border">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{spec.label}</p>
                      <p className="text-sm font-semibold text-slate-800">{spec.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right: sticky price + enquiry form ── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-border shadow-lg p-6 sticky top-36 space-y-5">
                {/* Price */}
                <div>
                  <p className="text-3xl font-black text-[oklch(0.42_0.19_25)] leading-tight">
                    {Number(car.price).toLocaleString()} {car.priceUnit}
                    {car.priceFrequency && <span className="text-lg font-semibold text-slate-400">/{car.priceFrequency}</span>}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Listed by KOSRES LTD</p>
                </div>

                <div className="h-px bg-border" />

                {/* Enquiry form */}
                <div>
                  <p className="text-sm font-bold text-slate-700 mb-3">Enquire about this vehicle</p>

                  {sent ? (
                    <div className="text-center py-6 text-white rounded-2xl" style={{ backgroundColor: ACCENT }}>
                      <p className="font-black mb-1">Request Sent! ✓</p>
                      <p className="text-xs text-white/70 mb-3">We'll contact you within 24 hours.</p>
                      <a href={whatsappLink(waMsg)} target="_blank" rel="noopener noreferrer"
                        className="whatsapp-btn inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs">
                        <WhatsAppIcon size={14} /> WhatsApp
                      </a>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <div>
                        <label className={lblCls}>Name <span className="text-red-400">*</span></label>
                        <input type="text" required placeholder="Full name" value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inpCls} />
                      </div>
                      <div>
                        <label className={lblCls}>Contact <span className="text-red-400">*</span></label>
                        <input type="tel" required placeholder="+250 7XX XXX XXX" value={form.contact}
                          onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} className={inpCls} />
                      </div>
                      <div>
                        <label className={lblCls}>Email</label>
                        <input type="email" placeholder="your@email.com" value={form.email}
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inpCls} />
                      </div>
                      <div>
                        <label className={lblCls}>Message</label>
                        <textarea rows={3} placeholder="Preferred dates, questions…" value={form.message}
                          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                          className={`${inpCls} resize-none`} />
                      </div>
                      {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}
                      <div className="flex gap-2">
                        <button type="submit" disabled={sending}
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-60 hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: ACCENT }}>
                          {sending ? <><Loader2 size={14} className="animate-spin" /> Sending…</> : <><Send size={14} /> Submit</>}
                        </button>
                        <a href={whatsappLink(waMsg)} target="_blank" rel="noopener noreferrer"
                          className="whatsapp-btn flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-white font-bold text-sm">
                          <WhatsAppIcon size={15} />
                        </a>
                      </div>
                    </form>
                  )}
                </div>

                <div className="h-px bg-border" />

                <Link href="/cars"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-border text-sm font-medium text-slate-600 hover:bg-muted transition-colors">
                  <ArrowLeft size={14} /> All cars
                </Link>
              </div>
            </div>
          </div>

          {/* Related cars */}
          {related.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-black mb-6 text-slate-800">Similar Vehicles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {related.map(c => <CarCard key={c.id} car={c} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
