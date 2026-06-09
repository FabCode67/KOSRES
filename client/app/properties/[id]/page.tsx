"use client"

import { use, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Bed, Bath, Maximize2, MapPin, ArrowLeft, MessageCircle, ChevronLeft, ChevronRight
} from "lucide-react"
import Navbar from "@/components/Navbar"
import PropertyCard from "@/components/PropertyCard"
import { SEED_PROPERTIES } from "@/lib/properties"
import { formatPrice, whatsappLink, instagramLink, facebookLink } from "@/lib/utils"
import { WhatsAppIcon, InstagramIcon, FacebookIcon } from "@/components/social-icons"

export default function PropertyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const property = SEED_PROPERTIES.find((p) => p.id === id)
  if (!property) notFound()

  const [imgIdx, setImgIdx] = useState(0)
  const related = SEED_PROPERTIES.filter((p) => p.id !== id && p.category === property.category).slice(0, 3)

  const waMsg = `Hi KOSRES, I'm interested in "${property.title}" (ID: ${property.id}). Please share more details.`
  const offerLabel =
    property.offerType === "sale" ? "For Sale"
    : property.offerType === "rent" ? "For Rent"
    : "Short Stay"

  return (
    <>
      <Navbar />

      <div className="pt-24 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <Link href="/properties" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={15} /> Back to properties
        </Link>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left – images + details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image carousel */}
            <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-muted">
              <Image
                src={property.images[imgIdx]}
                alt={property.title}
                fill
                className="object-cover transition-opacity duration-300"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIdx((i) => (i - 1 + property.images.length) % property.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setImgIdx((i) => (i + 1) % property.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {property.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIdx(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${i === imgIdx ? "bg-white" : "bg-white/40"}`}
                      />
                    ))}
                  </div>
                </>
              )}
              <span className="absolute top-4 left-4 text-xs font-semibold px-3 py-1 rounded-full bg-[oklch(0.42_0.19_25)] text-white">
                {offerLabel}
              </span>
            </div>

            {/* Thumbnails */}
            {property.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {property.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`relative flex-none w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === imgIdx ? "border-[oklch(0.42_0.19_25)]" : "border-transparent"
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}

            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                {property.propertyType} · {property.category}
              </p>
              <h1 className="text-2xl sm:text-3xl font-black leading-tight mb-2">{property.title}</h1>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin size={14} /> {property.sector}, {property.district}, Rwanda
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-xl border border-border text-sm">
              {property.bedrooms && (
                <span className="flex items-center gap-1.5"><Bed size={16} className="text-[oklch(0.42_0.19_25)]" /> {property.bedrooms} Bedrooms</span>
              )}
              {property.bathrooms && (
                <span className="flex items-center gap-1.5"><Bath size={16} className="text-[oklch(0.42_0.19_25)]" /> {property.bathrooms} Bathrooms</span>
              )}
              {property.area && (
                <span className="flex items-center gap-1.5"><Maximize2 size={16} className="text-[oklch(0.42_0.19_25)]" /> {property.area} m²</span>
              )}
            </div>

            <div>
              <h2 className="text-lg font-bold mb-2">About this property</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">{property.description}</p>
            </div>
          </div>

          {/* Right – price & contact */}
          <div>
            <div className="bg-white border border-border rounded-2xl p-6 shadow-md sticky top-24">
              <p className="text-2xl font-black text-[oklch(0.42_0.19_25)] mb-1">
                {formatPrice(property.price, property.priceUnit, property.priceFrequency)}
              </p>
              <p className="text-xs text-muted-foreground mb-5">Listed by KOSRES LTD</p>
              <p className="text-sm font-semibold mb-3">Contact about this property</p>

              <div className="flex flex-col gap-3">
                <a
                  href={whatsappLink(waMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-btn flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  <WhatsAppIcon size={17} /> Chat on WhatsApp
                </a>
                <a
                  href={instagramLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="instagram-btn flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl text-sm"
                >
                  <InstagramIcon size={17} /> Message on Instagram
                </a>
                <a
                  href={facebookLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="facebook-btn flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  <FacebookIcon size={17} /> Message on Facebook
                </a>
              </div>

              <div className="mt-5 pt-5 border-t border-border space-y-2 text-xs text-muted-foreground">
                <p><span className="font-medium text-foreground">Property ID:</span> {property.id}</p>
                <p><span className="font-medium text-foreground">Listed:</span> {new Date(property.createdAt).toLocaleDateString("en-RW", { year: "numeric", month: "long", day: "numeric" })}</p>
                <p><span className="font-medium text-foreground">Category:</span> {property.category}</p>
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-black mb-6">Similar Properties</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
