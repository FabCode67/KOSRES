"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Globe, Loader2, Plus } from "lucide-react"
import { getPartners } from "@/lib/api"
import type { ApiPartner } from "@/lib/api"

export default function PartnersSection() {
  const [partners, setPartners] = useState<ApiPartner[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    getPartners(false)           // active only
      .then(setPartners)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      {/* Partner cards */}
      <div className="flex flex-wrap items-center justify-center gap-6">
        {partners.map(partner => (
          <div
            key={partner.id}
            className="group flex flex-col items-center gap-4 bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 px-8 py-7 min-w-[200px] max-w-[240px]"
          >
            {/* Logo or initials */}
            <div className="relative w-20 h-16 flex items-center justify-center">
              {partner.logo ? (
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  fill
                  className="object-contain"
                  sizes="80px"
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md"
                  style={{ backgroundColor: "#7B1113" }}
                >
                  {partner.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                </div>
              )}
            </div>

            {/* Name + category */}
            <div className="text-center">
              {partner.website ? (
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-black text-base text-slate-800 hover:text-[oklch(0.42_0.19_25)] transition-colors"
                >
                  {partner.name}
                </a>
              ) : (
                <p className="font-black text-base text-slate-800">{partner.name}</p>
              )}
              {partner.category && (
                <span className="inline-block mt-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[oklch(0.42_0.19_25)]/10 text-[oklch(0.42_0.19_25)]">
                  {partner.category}
                </span>
              )}
              {partner.description && (
                <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">
                  {partner.description}
                </p>
              )}
              {partner.website && (
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-[oklch(0.42_0.19_25)] mt-2 transition-colors"
                >
                  <Globe size={10} />
                  {new URL(partner.website).hostname.replace("www.", "")}
                </a>
              )}
            </div>
          </div>
        ))}

        {/* Become a Partner CTA card */}
        <div className="flex flex-col items-center gap-4 bg-white rounded-2xl border-2 border-dashed border-slate-300 hover:border-[oklch(0.42_0.19_25)] transition-colors duration-300 px-8 py-7 min-w-[200px] max-w-[240px] group">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 group-hover:bg-[oklch(0.42_0.19_25)]/10 flex items-center justify-center transition-colors">
            <Plus
              size={28}
              className="text-slate-300 group-hover:text-[oklch(0.42_0.19_25)] transition-colors"
            />
          </div>
          <div className="text-center">
            <p className="font-bold text-sm text-slate-600 group-hover:text-[oklch(0.42_0.19_25)] transition-colors">
              Become a Partner
            </p>
            <p className="text-xs text-slate-400 mt-1">Join our network</p>
            <a
              href="mailto:kosresltd@gmail.com"
              className="inline-block mt-2.5 text-[11px] font-bold px-3 py-1.5 rounded-full bg-[oklch(0.42_0.19_25)]/10 text-[oklch(0.42_0.19_25)] hover:bg-[oklch(0.42_0.19_25)] hover:text-white transition-colors"
            >
              Contact us →
            </a>
          </div>
        </div>
      </div>

      {/* Trust line */}
      <p className="text-center text-xs text-slate-400 mt-10">
        Interested in partnering with KOSRES LTD?{" "}
        <a href="mailto:kosresltd@gmail.com"
          className="text-[oklch(0.42_0.19_25)] font-semibold hover:underline">
          Get in touch
        </a>
      </p>
    </>
  )
}
