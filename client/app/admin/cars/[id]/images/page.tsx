"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  Loader2, Upload, Trash2, Star, ArrowLeft,
  ImageIcon, CheckCircle2, AlertCircle,
} from "lucide-react"
import AdminShell from "@/components/AdminShell"
import { getCar, uploadCarImages, deleteCarImage, updateCar } from "@/lib/api"
import type { ApiCar } from "@/lib/api"

export default function CarImagesPage() {
  const { id }    = useParams<{ id: string }>()
  const router    = useRouter()
  const [car,     setCar]     = useState<ApiCar | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleting,  setDeleting]  = useState<string | null>(null)
  const [toast,   setToast]   = useState("")
  const fileRef   = useRef<HTMLInputElement>(null)

  const load = () => getCar(id).then(setCar).finally(() => setLoading(false))
  useEffect(() => { load() }, [id])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(""), 3000)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    try {
      const updated = await uploadCarImages(id, files)
      setCar(updated)
      showToast(`${files.length} image${files.length > 1 ? "s" : ""} uploaded successfully`)
    } catch { showToast("Upload failed — please try again") }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ""
  }

  const handleDelete = async (url: string) => {
    if (!confirm("Remove this image?")) return
    setDeleting(url)
    try {
      const updated = await deleteCarImage(id, url)
      setCar(updated)
      showToast("Image removed")
    } catch { showToast("Failed to remove image") }
    setDeleting(null)
  }

  const setCover = async (url: string) => {
    if (!car) return
    // Reorder images so chosen is first
    const newImages = [url, ...car.images.filter(i => i !== url)]
    try {
      const updated = await updateCar(id, { images: newImages })
      setCar(updated)
      showToast("Cover image updated")
    } catch {}
  }

  if (loading) return (
    <AdminShell title="Car Images">
      <div className="flex items-center justify-center py-24"><Loader2 size={28} className="animate-spin text-muted-foreground" /></div>
    </AdminShell>
  )

  return (
    <AdminShell title={`Images — ${car?.title ?? ""}`}>
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-slate-800 text-white text-sm px-4 py-3 rounded-xl shadow-xl">
          <CheckCircle2 size={15} className="text-green-400" /> {toast}
        </div>
      )}

      <div className="max-w-4xl space-y-6">
        {/* Back nav */}
        <div className="flex items-center gap-4">
          <Link href="/admin/cars" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group">
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Back to cars
          </Link>
          <Link href={`/admin/cars/${id}/edit`} className="text-sm text-[oklch(0.42_0.19_25)] hover:underline">
            ← Edit details
          </Link>
        </div>

        {/* Upload zone */}
        <div
          onClick={() => !uploading && fileRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-[oklch(0.42_0.19_25)] rounded-2xl p-10 text-center cursor-pointer transition-colors group"
        >
          <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 size={32} className="animate-spin" />
              <p className="text-sm font-semibold">Uploading…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 group-hover:bg-[oklch(0.42_0.19_25)]/10 flex items-center justify-center transition-colors">
                <Upload size={24} className="text-slate-400 group-hover:text-[oklch(0.42_0.19_25)] transition-colors" />
              </div>
              <p className="text-sm font-bold text-slate-700 mt-1">Click to upload car images</p>
              <p className="text-xs text-slate-400">JPG, PNG, WebP · Max 10MB per file · Multiple files allowed</p>
            </div>
          )}
        </div>

        {/* Image grid */}
        {car && car.images.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-700">{car.images.length} image{car.images.length !== 1 ? "s" : ""}</p>
              <p className="text-xs text-slate-400">First image = cover photo · Click ⭐ to set as cover</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {car.images.map((url, i) => (
                <div key={url} className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-border">
                  <Image src={url} alt="" fill className="object-cover" sizes="200px" />

                  {/* Cover badge */}
                  {i === 0 && (
                    <span className="absolute top-2 left-2 text-[9px] font-bold bg-amber-400 text-black px-1.5 py-0.5 rounded-full">
                      Cover
                    </span>
                  )}

                  {/* Hover actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    {i !== 0 && (
                      <button onClick={() => setCover(url)}
                        title="Set as cover"
                        className="w-8 h-8 rounded-full bg-white/90 text-amber-500 flex items-center justify-center hover:bg-amber-400 hover:text-white transition-colors shadow">
                        <Star size={14} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(url)} disabled={deleting === url}
                      title="Remove image"
                      className="w-8 h-8 rounded-full bg-white/90 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors shadow">
                      {deleting === url ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <ImageIcon size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">No images yet — upload some above</p>
          </div>
        )}

        {/* Done button */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Link href="/admin/cars"
            className="px-6 py-2.5 rounded-xl bg-[oklch(0.42_0.19_25)] text-white font-semibold text-sm hover:bg-[oklch(0.36_0.18_25)] transition-colors">
            ✓ Done — Back to Cars
          </Link>
          <Link href={`/cars/${id}`} target="_blank"
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            Preview listing →
          </Link>
        </div>
      </div>
    </AdminShell>
  )
}
