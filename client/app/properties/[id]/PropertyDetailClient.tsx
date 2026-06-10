"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Bed, Bath, Maximize2, MapPin, ArrowLeft,
  ChevronLeft, ChevronRight, Hash, Calendar,
  Tag, Building2, Star,
} from "lucide-react"
import Navbar from "@/components/Navbar"
import PropertyCard from "@/components/PropertyCard"
import { formatPrice, formatPriceCompact, whatsappLink, instagramLink, facebookLink } from "@/lib/utils"
import { WhatsAppIcon, InstagramIcon, FacebookIcon } from "@/components/social-icons"
import type { ApiProperty } from "@/lib/api"

const OFFER_LABELS: Record<string, { label: string; cls: string }> = {
  sale:       { label: "For Sale",   cls: "bg-red-600 text-white"    },
  rent:       { label: "For Rent",   cls: "bg-green-700 text-white"  },
  short_stay: { label: "Short Stay", cls: "bg-amber-500 text-black"  },
}

interface Props {
  property: ApiProperty
  related:  ApiProperty[]
}

export default function PropertyDetailClient({ property, related }: Props) {
  const [imgIdx, setImgIdx] = useState(0)

  const images  = property.images?.length ? property.images : []
  const hasImgs = images.length > 0
  const offer   = OFFER_LABELS[property.offerType] ?? OFFER_LABELS.sale

  const waMsg = `Hi KOSRES, I'm interested in "${property.title}" (ID: ${property.id}). Please share more details.`

  const prev = () => setImgIdx(i => (i - 1 + images.length) % images.length)
  const next = () => setImgIdx(i => (i + 1) % images.length)

  return (
    <>
      <Navbar />

      <div className="pt-24 min-h-screen bg-[oklch(0.97_0.005_80)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">

          {/* Back link */}
          <Link href="/properties"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 mt-2 transition-colors group">
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to properties
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Left — images + details ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Main image */}
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-200 shadow-md">
                {hasImgs ? (
                  <Image
                    src={images[imgIdx]}
                    alt={property.title}
                    fill priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                    <Building2 size={48} strokeWidth={1} />
                    <p className="text-sm">No images available</p>
                  </div>
                )}

                {/* Offer badge */}
                <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-full shadow ${offer.cls}`}>
                  {offer.label}
                </span>

                {/* Featured badge */}
                {property.featured && (
                  <span className="absolute top-4 right-4 flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-400 text-black shadow">
                    <Star size={11} className="fill-black" /> Featured
                  </span>
                )}

                {/* Carousel controls */}
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
                    {/* Dot indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_, i) => (
                        <button key={i} onClick={() => setImgIdx(i)}
                          className={`w-2 h-2 rounded-full transition-all ${i === imgIdx ? "bg-white scale-125" : "bg-white/50"}`} />
                      ))}
                    </div>
                    {/* Counter */}
                    <span className="absolute bottom-4 right-4 text-[11px] font-semibold text-white bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
                      {imgIdx + 1} / {images.length}
                    </span>
                  </>
                )}
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setImgIdx(i)}
                      className={`relative flex-none w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                        i === imgIdx
                          ? "border-[oklch(0.42_0.19_25)] shadow-md scale-105"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}>
                      <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                    </button>
                  ))}
                </div>
              )}

              {/* Title + Location */}
              <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5">
                  {property.propertyType} · {property.category}
                </p>
                <h1 className="text-2xl sm:text-3xl font-black leading-tight mb-3 text-slate-800">
                  {property.title}
                </h1>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin size={14} className="text-[oklch(0.42_0.19_25)]" />
                  {property.sector}, {property.district}, Rwanda
                </p>

                {/* Specs row */}
                {(property.bedrooms || property.bathrooms || property.area) && (
                  <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-border text-sm text-slate-700">
                    {property.bedrooms && (
                      <span className="flex items-center gap-1.5">
                        <Bed size={16} className="text-[oklch(0.42_0.19_25)]" />
                        {property.bedrooms} Bedroom{property.bedrooms !== 1 ? "s" : ""}
                      </span>
                    )}
                    {property.bathrooms && (
                      <span className="flex items-center gap-1.5">
                        <Bath size={16} className="text-[oklch(0.42_0.19_25)]" />
                        {property.bathrooms} Bathroom{property.bathrooms !== 1 ? "s" : ""}
                      </span>
                    )}
                    {property.area && (
                      <span className="flex items-center gap-1.5">
                        <Maximize2 size={16} className="text-[oklch(0.42_0.19_25)]" />
                        {Number(property.area).toLocaleString()} m²
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-3 text-slate-800">About this property</h2>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              {/* Details table */}
              <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4 text-slate-800">Property Details</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Offer Type",     value: offer.label,           icon: Tag        },
                    { label: "Category",       value: property.category,     icon: Building2  },
                    { label: "Property Type",  value: property.propertyType, icon: Building2  },
                    { label: "District",       value: property.district,     icon: MapPin     },
                    { label: "Sector",         value: property.sector,       icon: MapPin     },
                    property.upi ? { label: "UPI", value: property.upi, icon: Hash } : null,
                    { label: "Status",         value: property.status,       icon: Tag        },
                    { label: "Listed",         value: new Date(property.createdAt).toLocaleDateString("en-RW", { year: "numeric", month: "short", day: "numeric" }), icon: Calendar },
                  ].filter(Boolean).map((item: any) => (
                    <div key={item.label} className="bg-slate-50 rounded-xl p-3 border border-border">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
                      <p className="text-sm font-semibold text-slate-800 capitalize">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right — sticky price & contact ── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-border shadow-lg p-6 sticky top-24 space-y-5">

                {/* Price */}
                <div>
                  <p className="text-3xl font-black text-[oklch(0.42_0.19_25)] leading-tight">
                    {formatPriceCompact(Number(property.price), property.priceUnit, property.priceFrequency)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatPrice(Number(property.price), property.priceUnit, property.priceFrequency)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Listed by KOSRES LTD</p>
                </div>

                <div className="h-px bg-border" />

                {/* Contact */}
                <div>
                  <p className="text-sm font-bold text-slate-700 mb-3">Enquire about this property</p>
                  <div className="flex flex-col gap-2.5">
                    <a href={whatsappLink(waMsg)} target="_blank" rel="noopener noreferrer"
                      className="whatsapp-btn flex items-center justify-center gap-2 text-white font-bold py-3 rounded-xl transition-opacity hover:opacity-90 text-sm">
                      <WhatsAppIcon size={17} /> Chat on WhatsApp
                    </a>
                    <a href={instagramLink()} target="_blank" rel="noopener noreferrer"
                      className="instagram-btn flex items-center justify-center gap-2 text-white font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity">
                      <InstagramIcon size={17} /> Message on Instagram
                    </a>
                    <a href={facebookLink()} target="_blank" rel="noopener noreferrer"
                      className="facebook-btn flex items-center justify-center gap-2 text-white font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity">
                      <FacebookIcon size={17} /> Message on Facebook
                    </a>
                  </div>
                </div>

                <div className="h-px bg-border" />

                {/* Meta */}
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-600">Property ID</span>
                    <span className="font-mono text-slate-500 truncate max-w-[120px]" title={property.id}>
                      {property.id.slice(0, 8)}…
                    </span>
                  </div>
                  {property.upi && (
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-600">UPI</span>
                      <span>{property.upi}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-600">Status</span>
                    <span className={`font-semibold capitalize ${
                      property.status === "active" ? "text-green-700" : "text-slate-500"
                    }`}>{property.status}</span>
                  </div>
                </div>

                {/* Back button */}
                <Link href="/properties"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-border text-sm font-medium text-slate-600 hover:bg-muted transition-colors">
                  <ArrowLeft size={14} /> All properties
                </Link>
              </div>
            </div>

          </div>

          {/* ── Related properties ── */}
          {related.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-black mb-6 text-slate-800">Similar Properties</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map(p => (
                  <PropertyCard key={p.id} property={p as any} />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
