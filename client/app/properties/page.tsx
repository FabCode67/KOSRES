"use client"

import { useState, useMemo } from "react"
import { Search, SlidersHorizontal } from "lucide-react"
import Navbar from "@/components/Navbar"
import PropertyCard from "@/components/PropertyCard"
import { SEED_PROPERTIES } from "@/lib/properties"
import type { PropertyCategory, OfferType } from "@/lib/properties"

const DISTRICTS = ["All", "Kicukiro", "Nyarugenge", "Gasabo", "Musanze", "Rubavu", "Muhanga", "Kayonza", "Rusizi", "Bugesera"]
const OFFER_TYPES: { value: OfferType | "all"; label: string }[] = [
  { value: "all",       label: "All" },
  { value: "sale",      label: "For Sale" },
  { value: "rent",      label: "For Rent" },
  { value: "short_stay",label: "Short Stay" },
]
const CATEGORIES: { value: PropertyCategory | "all"; label: string }[] = [
  { value: "all",         label: "All Types" },
  { value: "residential", label: "Residential" },
  { value: "commercial",  label: "Commercial" },
  { value: "agricultural",label: "Agricultural" },
  { value: "industrial",  label: "Industrial" },
]

export default function PropertiesPage() {
  const [search, setSearch]     = useState("")
  const [offer, setOffer]       = useState<OfferType | "all">("all")
  const [category, setCategory] = useState<PropertyCategory | "all">("all")
  const [district, setDistrict] = useState("All")
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    return SEED_PROPERTIES.filter((p) => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase()) &&
          !p.sector.toLowerCase().includes(search.toLowerCase()) &&
          !p.propertyType.toLowerCase().includes(search.toLowerCase())) return false
      if (offer !== "all" && p.offerType !== offer) return false
      if (category !== "all" && p.category !== category) return false
      if (district !== "All" && p.district !== district) return false
      return true
    })
  }, [search, offer, category, district])

  return (
    <>
      <Navbar />

      <div className="pt-24 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[oklch(0.42_0.19_25)] text-sm font-semibold tracking-widest uppercase mb-1">
            Explore
          </p>
          <h1 className="text-3xl sm:text-4xl font-black">All Properties</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {filtered.length} {filtered.length === 1 ? "property" : "properties"} available
          </p>
        </div>

        {/* Search + filters */}
        <div className="bg-white border border-border rounded-xl p-4 mb-8 shadow-sm">
          <div className="flex gap-3 flex-col sm:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by title, location, type…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-lg bg-muted/40 focus:outline-none focus:ring-2 focus:ring-[oklch(0.42_0.19_25)/30]"
              />
            </div>
            {/* Offer type */}
            <select
              value={offer}
              onChange={(e) => setOffer(e.target.value as OfferType | "all")}
              className="px-3 py-2.5 text-sm border border-border rounded-lg bg-muted/40 focus:outline-none focus:ring-2 focus:ring-[oklch(0.42_0.19_25)/30]"
            >
              {OFFER_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PropertyCategory | "all")}
              className="px-3 py-2.5 text-sm border border-border rounded-lg bg-muted/40 focus:outline-none focus:ring-2 focus:ring-[oklch(0.42_0.19_25)/30]"
            >
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            {/* District */}
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="px-3 py-2.5 text-sm border border-border rounded-lg bg-muted/40 focus:outline-none focus:ring-2 focus:ring-[oklch(0.42_0.19_25)/30]"
            >
              {DISTRICTS.map((d) => <option key={d} value={d}>{d === "All" ? "All Districts" : d}</option>)}
            </select>
          </div>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        ) : (
          <div className="text-center py-24 text-muted-foreground">
            <Search size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold">No properties found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </>
  )
}
