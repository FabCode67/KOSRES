import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Calendar, User, Tag, Download, BookOpen } from "lucide-react"
import Navbar from "@/components/Navbar"
import { getPublications } from "@/lib/api"
import type { ApiPublication } from "@/lib/api"

export const metadata: Metadata = {
  title: "Publications – Real Estate Market Reports & Guides Rwanda",
  description:
    "Read KOSRES LTD's latest real estate market reports, investment guides, property insights and news about the Kigali and Rwanda property market.",
  keywords: [
    "Rwanda real estate market report", "Kigali property market 2025", "real estate investment guide Rwanda",
    "property news Kigali", "Rwanda housing market", "real estate publications Rwanda",
  ],
  openGraph: {
    title:       "Real Estate Publications & Market Reports | KOSRES LTD",
    description: "Stay informed with KOSRES LTD's market reports, investment guides and property insights for Rwanda.",
    url:         "https://www.kosres.rw/publications",
  },
  alternates: { canonical: "https://www.kosres.rw/publications" },
}

export default async function PublicationsPage() {
  let pubs: ApiPublication[] = []
  try { pubs = await getPublications() } catch {}

  return (
    <>
      <Navbar />
      <div className="pt-36 min-h-screen bg-[oklch(0.97_0.005_80)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">

          <div className="mb-12 text-center">
            <p className="text-[oklch(0.42_0.19_25)] text-sm font-bold tracking-widest uppercase mb-2">Knowledge Hub</p>
            <h1 className="text-4xl font-black text-slate-800 mb-3">Publications</h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
              Market reports, real estate guides, investment insights and news from KOSRES LTD.
            </p>
          </div>

          {pubs.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg font-semibold">No publications yet</p>
              <p className="text-sm mt-1">Check back soon for market reports and guides.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pubs.map(pub => (
                <article key={pub.id}
                  className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col">
                  <Link href={`/publications/${pub.id}`} className="relative block aspect-[16/9] bg-slate-100 overflow-hidden">
                    {pub.coverImage
                      ? <Image src={pub.coverImage} alt={pub.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:768px)100vw,(max-width:1200px)50vw,33vw" />
                      : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[oklch(0.42_0.19_25)] to-[oklch(0.12_0.01_250)]">
                          <BookOpen size={40} className="text-white/40" />
                        </div>
                      )
                    }
                    {pub.featured && (
                      <span className="absolute top-3 left-3 text-[10px] font-bold bg-amber-400 text-black px-2.5 py-1 rounded-full">⭐ Featured</span>
                    )}
                    {pub.documentUrl && (
                      <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold bg-black/60 text-white px-2.5 py-1 rounded-full">
                        <Download size={10} /> PDF
                      </span>
                    )}
                  </Link>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {pub.category && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[oklch(0.42_0.19_25)] bg-red-50 px-2 py-0.5 rounded-full">
                          <Tag size={9} /> {pub.category}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Calendar size={9} />
                        {new Date(pub.createdAt).toLocaleDateString("en-RW", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <Link href={`/publications/${pub.id}`}>
                      <h2 className="font-bold text-base text-slate-800 leading-snug mb-2 group-hover:text-[oklch(0.42_0.19_25)] transition-colors line-clamp-2">
                        {pub.title}
                      </h2>
                    </Link>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 flex-1 mb-4">{pub.excerpt}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                      {pub.author && (
                        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <User size={11} /> {pub.author}
                        </span>
                      )}
                      <Link href={`/publications/${pub.id}`}
                        className="text-xs font-bold text-[oklch(0.42_0.19_25)] hover:underline ml-auto">
                        Read more →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
