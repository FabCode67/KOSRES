"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Loader2 } from "lucide-react"
import Navbar from "@/components/Navbar"
import PropertyCard from "@/components/PropertyCard"
import { getProperties } from "@/lib/api"
import type { ApiProperty } from "@/lib/api"

const DISTRICTS = ["All","Kicukiro","Nyarugenge","Gasabo","Musanze","Rubavu","Muhanga","Kayonza","Rusizi","Bugesera"]
const OFFER_TYPES = [
  { value: "all",       label: "All"        },
  { value: "sale",      label: "For Sale"   },
  { value: "rent",      label: "For Rent"   },
  { value: "short_stay",label: "Short Stay" },
]
const CATEGORIES = [
  { value: "all",         label: "All Types"    },
  { value: "residential", label: "Residential"  },
  { value: "commercial",  label: "Commercial"   },
  { value: "agricultural",label: "Agricultural" },
  { value: "industrial",  label: "Industrial"   },
]

export default function PropertiesPage() {
  const [properties, setProperties] = useState<ApiProperty[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState("")
  const [offer, setOffer]           = useState("all")
  const [category, setCategory]     = useState("all")
  const [district, setDistrict]     = useState("All")

  useEffect(() => {
    getProperties({ limit: 200 })
      .then(res => setProperties(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return properties.filter(p => {
      if (q && !p.title.toLowerCase().includes(q) &&
          !p.sector.toLowerCase().includes(q) &&
          !p.propertyType.toLowerCase().includes(q)) return false
      if (offer    !== "all" && p.offerType !== offer)   return false
      if (category !== "all" && p.category  !== category) return false
      if (district !== "All" && p.district  !== district) return false
      return true
    })
  }, [properties, search, offer, category, district])

  const sel = "px-3 py-2.5 text-sm border border-border rounded-lg bg-muted/40 focus:outline-none focus:ring-2 focus:ring-[oklch(0.42_0.19_25)/30]"

  return (
    <>
      <Navbar />
      <div className="pt-24 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 pb-20">

        <div className="mb-8">
          <p className="text-[oklch(0.42_0.19_25)] text-sm font-semibold tracking-widest uppercase mb-1">Explore</p>
          <h1 className="text-3xl sm:text-4xl font-black">All Properties</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {loading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "property" : "properties"} available`}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white border border-border rounded-xl p-4 mb-8 shadow-sm">
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Search by title, location, type…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-lg bg-muted/40 focus:outline-none focus:ring-2 focus:ring-[oklch(0.42_0.19_25)/30]" />
            </div>
            <select value={offer}    onChange={e => setOffer(e.target.value)}    className={sel}>
              {OFFER_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={category} onChange={e => setCategory(e.target.value)} className={sel}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <select value={district} onChange={e => setDistrict(e.target.value)} className={sel}>
              {DISTRICTS.map(d => <option key={d} value={d}>{d === "All" ? "All Districts" : d}</option>)}
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 size={32} className="animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(p => (
              <PropertyCard key={p.id} property={p as any} />
            ))}
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
