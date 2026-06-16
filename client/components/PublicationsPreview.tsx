"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Tag, BookOpen, Download, Loader2 } from "lucide-react"
import { getPublications } from "@/lib/api"
import type { ApiPublication } from "@/lib/api"

export default function PublicationsPreview() {
  const [pubs, setPubs]     = useState<ApiPublication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPublications()
      .then(data => setPubs(data.slice(0, 3)))
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

  if (pubs.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border rounded-2xl text-muted-foreground">
        <BookOpen size={36} className="mx-auto mb-3 opacity-20" />
        <p className="text-sm">No publications yet — check back soon.</p>
      </div>
    )
  }

  const [featured, ...rest] = pubs

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      {/* ── Featured card — large ── */}
      <Link href={`/publications/${featured.id}`}
        className="lg:col-span-3 group relative rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col bg-white">
        <div className="relative aspect-[16/8] bg-gradient-to-br from-[oklch(0.42_0.19_25)] to-[oklch(0.12_0.01_250)] overflow-hidden">
          {featured.coverImage
            ? <Image src={featured.coverImage} alt={featured.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:1024px)100vw,60vw" />
            : <div className="w-full h-full flex items-center justify-center"><BookOpen size={64} className="text-white/20" /></div>
          }
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-2 mb-2">
              {featured.category && (
                <span className="text-[10px] font-bold bg-[oklch(0.42_0.19_25)] text-white px-2.5 py-1 rounded-full">
                  {featured.category}
                </span>
              )}
              {featured.documentUrl && (
                <span className="flex items-center gap-1 text-[10px] font-bold bg-white/20 text-white px-2.5 py-1 rounded-full">
                  <Download size={9} /> PDF
                </span>
              )}
            </div>
            <h3 className="text-white text-xl font-black leading-tight mb-1 line-clamp-2">
              {featured.title}
            </h3>
            <p className="text-white/70 text-xs">
              {new Date(featured.createdAt).toLocaleDateString("en-RW", { day:"numeric", month:"short", year:"numeric" })}
              {featured.author && ` · ${featured.author}`}
            </p>
          </div>
        </div>
        <div className="p-5 flex-1">
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{featured.excerpt}</p>
          <span className="inline-block mt-3 text-xs font-bold text-[oklch(0.42_0.19_25)] group-hover:underline">
            Read more →
          </span>
        </div>
      </Link>

      {/* ── Side cards ── */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        {rest.map(pub => (
          <Link key={pub.id} href={`/publications/${pub.id}`}
            className="group bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-all flex gap-4 overflow-hidden p-4">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-none bg-gradient-to-br from-[oklch(0.42_0.19_25)] to-[oklch(0.12_0.01_250)] shrink-0">
              {pub.coverImage
                ? <Image src={pub.coverImage} alt={pub.title} fill className="object-cover group-hover:scale-110 transition-transform duration-300" sizes="80px" />
                : <div className="w-full h-full flex items-center justify-center"><BookOpen size={24} className="text-white/30" /></div>
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                {pub.category && (
                  <span className="text-[9px] font-bold text-[oklch(0.42_0.19_25)] bg-red-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <Tag size={8} /> {pub.category}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-sm text-slate-800 line-clamp-2 leading-snug group-hover:text-[oklch(0.42_0.19_25)] transition-colors">
                {pub.title}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{pub.excerpt}</p>
              <p className="flex items-center gap-1 text-[10px] text-slate-400 mt-1.5">
                <Calendar size={9} />
                {new Date(pub.createdAt).toLocaleDateString("en-RW", { day:"numeric", month:"short" })}
              </p>
            </div>
          </Link>
        ))}

        <Link href="/publications"
          className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-border text-sm font-semibold text-muted-foreground hover:border-[oklch(0.42_0.19_25)] hover:text-[oklch(0.42_0.19_25)] transition-colors">
          <BookOpen size={16} /> View all publications
        </Link>
      </div>
    </div>
  )
}
