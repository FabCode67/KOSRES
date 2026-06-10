"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Trash2, Eye, Edit2, ImageIcon, RefreshCw, Loader2 } from "lucide-react"
import AdminShell        from "@/components/AdminShell"
import EditPropertyModal from "@/components/EditPropertyModal"
import ImageManagerModal from "@/components/ImageManagerModal"
import { useAdmin }      from "@/components/AdminContext"
import { updateProperty, deleteProperty } from "@/lib/api"
import type { ApiProperty } from "@/lib/api"
import { formatPrice, formatPriceCompact } from "@/lib/utils"

export default function PropertiesPage() {
  const { token, properties, setProperties, refresh, loading } = useAdmin()
  const [deleteId,      setDeleteId]      = useState<string | null>(null)
  const [editProperty,  setEditProperty]  = useState<ApiProperty | null>(null)
  const [imageProperty, setImageProperty] = useState<ApiProperty | null>(null)

  const handleDelete = async (id: string) => {
    await deleteProperty(id)
    setProperties(prev => prev.filter(p => p.id !== id))
    setDeleteId(null)
    refresh()
  }

  const handleToggleFeatured = async (p: ApiProperty) => {
    await updateProperty(p.id, { featured: !p.featured })
    setProperties(prev => prev.map(x => x.id === p.id ? { ...x, featured: !x.featured } : x))
  }

  const handleSaved = (updated: ApiProperty) => {
    setProperties(prev => prev.map(p => p.id === updated.id ? updated : p))
    setEditProperty(null)
    refresh()
  }

  const handleImagesSaved = (propertyId: string, images: string[]) => {
    setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, images } : p))
  }

  return (
    <AdminShell title="Properties">
      {editProperty && (
        <EditPropertyModal
          property={editProperty}
          token={token ?? ""}
          onClose={() => setEditProperty(null)}
          onSaved={handleSaved}
        />
      )}

      {imageProperty && (
        <ImageManagerModal
          propertyId={imageProperty.id}
          propertyTitle={imageProperty.title}
          currentImages={imageProperty.images}
          onClose={() => setImageProperty(null)}
          onSaved={imgs => { handleImagesSaved(imageProperty.id, imgs); setImageProperty(prev => prev ? { ...prev, images: imgs } : null) }}
        />
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${properties.length} total`}
          </p>
          <button onClick={refresh}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && properties.map(p => (
          <div key={p.id}
            className="bg-white rounded-xl border border-border shadow-sm flex items-start gap-4 p-4 hover:shadow-md transition-shadow">

            {/* Thumbnail */}
            <div className="relative w-24 rounded-xl overflow-hidden flex-none bg-muted shrink-0" style={{ height: 72 }}>
              {p.images[0]
                ? <Image src={p.images[0]} alt={p.title} fill className="object-cover" sizes="96px" />
                : <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 text-xs">No img</div>
              }
              {/* Image count badge */}
              <span className="absolute bottom-1 right-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded-full leading-none">
                {p.images.length} img{p.images.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-slate-800 truncate">{p.title}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin size={10} />{p.sector}, {p.district}
              </p>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-base font-black text-[oklch(0.42_0.19_25)]">
                  {formatPriceCompact(Number(p.price), p.priceUnit, p.priceFrequency)}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  ({formatPrice(Number(p.price), p.priceUnit, p.priceFrequency)})
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  p.offerType === "sale"  ? "bg-red-50 text-red-700"
                  : p.offerType === "rent" ? "bg-green-50 text-green-700"
                  : "bg-amber-50 text-amber-700"
                }`}>{p.offerType}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  p.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                }`}>{p.status}</span>
                {p.featured && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-700">
                    ⭐ Featured
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-end gap-2 flex-none">
              <div className="flex items-center gap-1">
                {/* Image manager */}
                <button onClick={() => setImageProperty(p)}
                  className="p-1.5 rounded-lg hover:bg-purple-50 transition-colors text-muted-foreground hover:text-purple-600"
                  title="Manage images">
                  <ImageIcon size={14} />
                </button>
                {/* Edit */}
                <button onClick={() => setEditProperty(p)}
                  className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors text-muted-foreground hover:text-blue-600"
                  title="Edit property">
                  <Edit2 size={14} />
                </button>
                {/* View */}
                <Link href={`/properties/${p.id}`} target="_blank"
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  title="View on site">
                  <Eye size={14} />
                </Link>
                {/* Delete */}
                <button onClick={() => setDeleteId(p.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-600"
                  title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                <input type="checkbox" checked={p.featured}
                  onChange={() => handleToggleFeatured(p)}
                  className="accent-amber-500 cursor-pointer" />
                Featured
              </label>
            </div>
          </div>
        ))}

        {!loading && properties.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-semibold mb-2">No properties yet</p>
            <Link href="/admin/add" className="text-sm text-[oklch(0.42_0.19_25)] hover:underline">
              Add your first listing →
            </Link>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-lg mb-2">Delete Property?</h3>
            <p className="text-sm text-muted-foreground mb-5">This will permanently remove the listing from the website.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors">
                Yes, Delete
              </button>
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-lg border border-border text-sm font-semibold hover:bg-muted transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
