import type { ApiProperty } from "@/lib/api"

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.kosres.com"

export const OFFER_LABEL: Record<string, string> = { sale: "for sale", rent: "for rent", short_stay: "for short stay" }

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

export function formatPrice(p: ApiProperty) {
  const n = Number(p.price)
  const num = n.toLocaleString("en-US", { maximumFractionDigits: 0 })
  const freq = p.offerType !== "sale" && p.priceFrequency ? ` / ${p.priceFrequency}` : ""
  return `${p.priceUnit === "USD" ? "USD " : "RWF "}${num}${freq}`
}

/** "Residential house for sale in Nyarutarama, Gasabo, Kigali" */
export function seoTitle(p: ApiProperty) {
  const type = (p.propertyType || p.category || "property").replace(/_/g, " ")
  const where = [p.sector, p.district].filter(Boolean).join(", ")
  const cap = type.charAt(0).toUpperCase() + type.slice(1)
  return `${cap} ${OFFER_LABEL[p.offerType] ?? ""} in ${where}, Rwanda`.replace(/\s+/g, " ")
}

export function seoDescription(p: ApiProperty) {
  const bits = [
    p.bedrooms ? `${p.bedrooms} bedrooms` : "",
    p.bathrooms ? `${p.bathrooms} bathrooms` : "",
    p.area ? `${p.area} m²` : "",
  ].filter(Boolean).join(", ")
  const base = `${seoTitle(p)}. ${bits ? bits + ". " : ""}Price: ${formatPrice(p)}. `
  const desc = (p.description || "").replace(/\s+/g, " ").trim()
  return (base + desc).slice(0, 158).trim()
}

export function listingJsonLd(p: ApiProperty) {
  const url = `${SITE_URL}/properties/${p.id}`
  return {
    "@context": "https://schema.org",
    "@type": ["Product", "RealEstateListing"],
    name: p.title,
    url,
    description: seoDescription(p),
    image: (p.images || []).slice(0, 6),
    datePosted: p.createdAt,
    offers: {
      "@type": "Offer",
      price: Number(p.price),
      priceCurrency: p.priceUnit,
      availability: p.status === "active" ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      url,
      seller: { "@type": "RealEstateAgent", name: "KOSRES LTD", url: SITE_URL },
    },
    contentLocation: {
      "@type": "Place",
      name: [p.sector, p.district].filter(Boolean).join(", "),
      address: { "@type": "PostalAddress", addressLocality: p.sector, addressRegion: p.district, addressCountry: "RW" },
    },
  }
}
