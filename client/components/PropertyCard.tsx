"use client"

import Image from "next/image"
import Link from "next/link"
import { Bed, Bath, Maximize2, MapPin, MessageCircle } from "lucide-react"
import type { Property } from "@/lib/properties"
import { formatPrice, whatsappLink, instagramLink, facebookLink } from "@/lib/utils"
import { WhatsAppIcon, InstagramIcon, FacebookIcon } from "@/components/social-icons"

export default function PropertyCard({ property }: { property: Property }) {
  const offerBadge =
    property.offerType === "sale"
      ? { label: "For Sale", cls: "bg-[oklch(0.42_0.19_25)] text-white" }
      : property.offerType === "rent"
      ? { label: "For Rent", cls: "bg-[oklch(0.35_0.13_160)] text-white" }
      : { label: "Short Stay", cls: "bg-[oklch(0.72_0.11_72)] text-black" }

  const waMsg = `Hi KOSRES, I'm interested in "${property.title}" (ID: ${property.id}). Please share more details.`

  return (
    <div className="card-hover bg-card rounded-xl overflow-hidden border border-border shadow-sm flex flex-col">
      {/* Image */}
      <Link href={`/properties/${property.id}`} className="relative block h-52 overflow-hidden">
        <Image
          src={property.images[0]}
          alt={property.title}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${offerBadge.cls}`}>
          {offerBadge.label}
        </span>
        {property.featured && (
          <span className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-400 text-black">
            Featured
          </span>
        )}
      </Link>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
            {property.propertyType} · {property.category}
          </p>
          <Link href={`/properties/${property.id}`}>
            <h3 className="font-semibold text-base leading-snug hover:text-[oklch(0.42_0.19_25)] transition-colors line-clamp-2">
              {property.title}
            </h3>
          </Link>
          <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <MapPin size={11} /> {property.sector}, {property.district}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {property.bedrooms && (
            <span className="flex items-center gap-1"><Bed size={13} /> {property.bedrooms} bd</span>
          )}
          {property.bathrooms && (
            <span className="flex items-center gap-1"><Bath size={13} /> {property.bathrooms} ba</span>
          )}
          {property.area && (
            <span className="flex items-center gap-1"><Maximize2 size={13} /> {property.area} m²</span>
          )}
        </div>

        {/* Price */}
        <p className="text-lg font-bold text-[oklch(0.42_0.19_25)] mt-auto">
          {formatPrice(property.price, property.priceUnit, property.priceFrequency)}
        </p>

        {/* Contact buttons */}
        <div className="flex items-center gap-2 pt-1">
          <a
            href={whatsappLink(waMsg)}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-btn flex-1 flex items-center justify-center gap-1.5 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
          >
            <WhatsAppIcon size={14} /> WhatsApp
          </a>
          <a
            href={instagramLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="instagram-btn w-9 h-9 flex items-center justify-center rounded-lg text-white transition-opacity hover:opacity-90"
            aria-label="Instagram"
          >
            <InstagramIcon size={15} />
          </a>
          <a
            href={facebookLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="facebook-btn w-9 h-9 flex items-center justify-center rounded-lg text-white transition-opacity hover:opacity-90"
            aria-label="Facebook"
          >
            <FacebookIcon size={15} />
          </a>
        </div>
      </div>
    </div>
  )
}
