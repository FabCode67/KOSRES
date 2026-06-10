"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { X, CloudUpload, Trash2, Star, Loader2, Check, AlertCircle } from "lucide-react"
import { API_URL, uploadImagesToCloudinary } from "@/lib/api"

interface Props {
  propertyId:    string
  propertyTitle: string
  currentImages: string[]
  onClose:       () => void
  onSaved:       (images: string[]) => void
}

export default function ImageManagerModal({
  propertyId, propertyTitle, currentImages, onClose, onSaved,
}: Props) {
  const [images,    setImages]    = useState<string[]>(currentImages)
  const [uploading, setUploading] = useState(false)
  const [deleting,  setDeleting]  = useState<string | null>(null)
  const [error,     setError]     = useState("")
  const [saveOk,    setSaveOk]    = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = prev }
  }, [])

  // Save updated image array back to the property
  const persist = async (newImages: string[]) => {
    const res = await fetch(`${API_URL}/properties/${propertyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: newImages }),
    })
    if (!res.ok) throw new Error("Failed to save images to property")
    return newImages
  }

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true); setError("")
    try {
      const newUrls  = await uploadImagesToCloudinary(Array.from(files))
      const updated  = [...images, ...newUrls]
      await persist(updated)
      setImages(updated)
      onSaved(updated)
      setSaveOk(true); setTimeout(() => setSaveOk(false), 2500)
    } catch (e: any) { setError(e.message) }
    setUploading(false)
  }

  const handleDelete = async (url: string) => {
    setDeleting(url); setError("")
    try {
      const updated = images.filter(i => i !== url)
      await persist(updated)
      setImages(updated); onSaved(updated)
    } catch (e: any) { setError(e.message) }
    setDeleting(null)
  }

  const handleSetCover = async (url: string) => {
    setError("")
    try {
      const updated = [url, ...images.filter(i => i !== url)]
      await persist(updated)
      setImages(updated); onSaved(updated)
      setSaveOk(true); setTimeout(() => setSaveOk(false), 2000)
    } catch (e: any) { setError(e.message) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-none">
          <div>
            <h2 className="font-black text-lg text-slate-800">Manage Images</h2>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{propertyTitle}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

          {/* Feedback banners */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={15} className="flex-none" />{error}
            </div>
          )}
          {saveOk && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
              <Check size={15} className="flex-none" /> Images updated successfully
            </div>
          )}

          {/* Upload drop zone */}
          <div
            onClick={() => !uploading && fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleUpload(e.dataTransfer.files) }}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 text-center transition-all
              ${uploading ? "border-slate-200 bg-slate-50 cursor-default" : "border-slate-300 cursor-pointer hover:border-[oklch(0.42_0.19_25)] hover:bg-slate-50 group"}`}
          >
            {uploading ? (
              <>
                <Loader2 size={26} className="animate-spin text-[oklch(0.42_0.19_25)]" />
                <p className="text-sm font-semibold text-slate-600">Uploading to Cloudinary…</p>
              </>
            ) : (
              <>
                <CloudUpload size={26} className="text-slate-400 group-hover:text-[oklch(0.42_0.19_25)] transition-colors" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">Drop images here or click to upload</p>
                  <p className="text-xs text-slate-400 mt-1">JPG · PNG · WebP · max 10 MB each</p>
                </div>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
              multiple className="hidden" disabled={uploading}
              onChange={e => handleUpload(e.target.files)} />
          </div>

          {/* Image grid */}
          {images.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-8">
              No images yet — upload some above.
            </p>
          ) : (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-3">
                {images.length} image{images.length !== 1 ? "s" : ""} ·{" "}
                <span className="text-slate-400">First image is used as cover</span>
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {images.map((url, idx) => (
                  <div key={url} className="relative group rounded-xl overflow-hidden aspect-square bg-slate-100 border border-slate-200">
                    <Image src={url} alt="" fill className="object-cover" sizes="150px" />

                    {/* Cover badge */}
                    {idx === 0 && (
                      <span className="absolute top-1.5 left-1.5 flex items-center gap-1 text-[10px] font-bold bg-amber-400 text-black px-2 py-0.5 rounded-full z-10">
                        <Star size={8} className="fill-black" /> Cover
                      </span>
                    )}

                    {/* Hover actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                      {idx !== 0 && (
                        <button onClick={() => handleSetCover(url)}
                          className="w-full flex items-center justify-center gap-1 text-[10px] font-bold bg-amber-400 text-black px-2 py-1.5 rounded-lg hover:bg-amber-300 transition-colors">
                          <Star size={10} /> Set Cover
                        </button>
                      )}
                      <button onClick={() => handleDelete(url)} disabled={deleting === url}
                        className="w-full flex items-center justify-center gap-1 text-[10px] font-bold bg-red-600 text-white px-2 py-1.5 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">
                        {deleting === url
                          ? <Loader2 size={10} className="animate-spin" />
                          : <Trash2 size={10} />
                        }
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between flex-none bg-slate-50/60">
          <p className="text-xs text-slate-400">{images.length} image{images.length !== 1 ? "s" : ""} total</p>
          <button onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[oklch(0.42_0.19_25)] text-white font-semibold text-sm hover:bg-[oklch(0.36_0.18_25)] transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
