import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Calendar, User, Tag, Download, BookOpen } from "lucide-react"
import Navbar from "@/components/Navbar"
import { getPublication, getPublications } from "@/lib/api"
import type { ApiPublication } from "@/lib/api"

interface Props { params: Promise<{ id: string }> }

export default async function PublicationDetailPage({ params }: Props) {
  const { id } = await params
  let pub: ApiPublication
  try { pub = await getPublication(id) } catch { notFound() }

  let related: ApiPublication[] = []
  try {
    const all = await getPublications()
    related = all.filter(p => p.id !== id && p.category === pub.category).slice(0, 3)
  } catch {}

  return (
    <>
      <Navbar />
      {/* pt-36 = 144px — clears 3-row fixed navbar (~132px) */}
      <div className="pt-36 min-h-screen bg-[oklch(0.97_0.005_80)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">

          <Link href="/publications"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 mt-2 transition-colors group">
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to publications
          </Link>

          {pub.coverImage && (
            <div className="relative rounded-2xl overflow-hidden aspect-[16/7] mb-8 shadow-md">
              <Image src={pub.coverImage} alt={pub.title} fill className="object-cover" sizes="896px" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-muted-foreground">
            {pub.category && (
              <span className="flex items-center gap-1.5 bg-[oklch(0.42_0.19_25)] text-white px-3 py-1 rounded-full font-semibold">
                <Tag size={11} /> {pub.category}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              {new Date(pub.createdAt).toLocaleDateString("en-RW", { year: "numeric", month: "long", day: "numeric" })}
            </span>
            {pub.author && (
              <span className="flex items-center gap-1.5"><User size={12} /> {pub.author}</span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 leading-tight mb-4">{pub.title}</h1>

          <p className="text-lg text-muted-foreground leading-relaxed mb-8 border-l-4 border-[oklch(0.42_0.19_25)] pl-4 italic">
            {pub.excerpt}
          </p>

          {pub.documentUrl && (
            <a href={pub.documentUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 bg-[oklch(0.12_0.01_250)] text-white rounded-2xl p-5 mb-8 hover:bg-[oklch(0.18_0.01_250)] transition-colors group">
              <div className="w-12 h-12 bg-[oklch(0.42_0.19_25)] rounded-xl flex items-center justify-center flex-none">
                <Download size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">Download Full Document</p>
                <p className="text-white/60 text-xs mt-0.5 truncate">{pub.documentName || "PDF Document"}</p>
              </div>
              <span className="text-xs font-semibold text-white/60 group-hover:text-white transition-colors whitespace-nowrap">
                Download PDF →
              </span>
            </a>
          )}

          <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
            <div className="prose prose-slate max-w-none text-sm leading-relaxed whitespace-pre-line text-slate-700">
              {pub.body}
            </div>
          </div>

          {related.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-black mb-6 text-slate-800">Related Publications</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {related.map(r => (
                  <Link key={r.id} href={`/publications/${r.id}`}
                    className="bg-white rounded-xl border border-border p-4 hover:shadow-md transition-shadow group">
                    {r.coverImage && (
                      <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                        <Image src={r.coverImage} alt={r.title} fill className="object-cover" sizes="260px" />
                      </div>
                    )}
                    <p className="text-xs text-[oklch(0.42_0.19_25)] font-semibold mb-1">{r.category}</p>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-[oklch(0.42_0.19_25)] transition-colors line-clamp-2">{r.title}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
