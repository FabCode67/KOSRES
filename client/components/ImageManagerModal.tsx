"use client"

import { useState, useRef } from "react"
import { X, Upload, Trash2, Loader2, Check, CloudUpload, Star } from "lucide-react"
import Image from "next/image"
import { API_URL } from "@/lib/api"

interface Props {
  propertyId: string
  propertyTitle: string
  currentImages: string[]
  onClose: () => void
  onSaved: (images: string[]) => void
}

export default function ImageManagerModal({ propertyId, propertyTitle, currentImages, onClose, onSaved }: Props) {
  const [images,   setImages]   = useState<string[]>(currentImages)
  const [uploading,setUploading]= useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error,    setError]    = useState("")
  const [saved,    setSaved]    = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Lock body scroll
  useState(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  })

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    setError("")
    try {
      // Get signed params
      const sigRes = await fetch(`${API_URL}/upload/sign`)
      if (!sigRes.ok) throw new Error("Could not get upload signature")
      const { timestamp, signature, folder, apiKey, cloudName } = await sigRes.json()

      const newUrls: string[] = []
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append("file", file)
        fd.append("timestamp", String(timestamp))
        fd.append("signature", signature)
        fd.append("folder", folder)
        fd.append("api_key", apiKey)
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: fd }
        )
        if (!res.ok) throw new Error("Upload failed for " + file.name)
        const data = await res.json()
        newUrls.push(data.secure_url)
      }

      // Patch property with new images appended
      const updated = [...images, ...newUrls]
      const patchRes = await fetch(`${API_URL}/properties/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: updated }),
      })
      if (!patchRes.ok) throw new Error("Failed to save images")
      setImages(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      onSaved(updated)
    } catch (e: any) {
      setError(e.message)
    }
    setUploading(false)
  }

  const handleDelete = async (url: string) => {
    setDeleting(url)
    setError("")
    try {
      const updated = images.filter(i => i !== url)
      const res = await fetch(`${API_URL}/properties/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: updated }),
      })
      if (!res.ok) throw new Error("Failed to remove image")
      setImages(updated)
      onSaved(updated)
    } catch (e: any) {
      setError(e.message)
    }
    setDeleting(null)
  }

  const handleSetCover = async (url: string) => {
    const reordered = [url, ...images.filter(i => i !== url)]
    const res = await fetch(`${API_URL}/properties/${propertyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: reordered }),
    })
    if (res.ok) { setImages(reordered); onSaved(reordered) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="font-black text-lg text-slate-800">Manage Images</h2>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{propertyTitle}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-6 space-y-6">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>
          )}
          {saved && (
            <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2 flex items-center gap-2">
              <Check size={13} /> Images updated successfully
            </p>
          )}

          {/* Upload zone */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleUpload(e.dataTransfer.files) }}
            className="border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-[oklch(0.42_0.19_25)] hover:bg-slate-50 transition-all group text-center"
          >
            {uploading ? (
              <><Loader2 size={24} className="animate-spin text-[oklch(0.42_0.19_25)]" /><p className="text-sm text-slate-600">Uploading to Cloudinary…</p></>
            ) : (
              <>
                <CloudUpload size={24} className="text-slate-400 group-hover:text-[oklch(0.42_0.19_25)] transition-colors" />
                <p className="text-sm font-semibold text-slate-700">Drop new images here or click to upload</p>
                <p className="text-xs text-slate-400">JPG, PNG, WebP · max 10MB each</p>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
              onChange={e => handleUpload(e.target.files)} disabled={uploading} />
          </div>

          {/* Image grid */}
          {images.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-6">No images yet — upload some above.</p>
          ) : (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-3">{images.length} image{images.length !== 1 ? "s" : ""} · First image is the cover</p>
              <div className="grid grid-cols-3 gap-3">
                {images.map((url, idx) => (
                  <div key={url} className="relative group rounded-xl overflow-hidden aspect-square bg-slate-100">
                    <Image src={url} alt="" fill className="object-cover" sizes="180px" />

                    {/* Cover badge */}
                    {idx === 0 && (
                      <span className="absolute top-2 left-2 text-[10px] bg-amber-400 text-black font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star size={9} className="fill-black" /> Cover
                      </span>
                    )}

                    {/* Hover actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {idx !== 0 && (
                        <button
                          onClick={() => handleSetCover(url)}
                          className="flex items-center gap-1 text-[10px] font-bold bg-amber-400 text-black px-2.5 py-1.5 rounded-lg hover:bg-amber-300 transition-colors"
                          title="Set as cover"
                        >
                          <Star size={10} /> Cover
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(url)}
                        disabled={deleting === url}
                        className="flex items-center gap-1 text-[10px] font-bold bg-red-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
                      >
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
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
          <button onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[oklch(0.42_0.19_25)] text-white font-semibold text-sm hover:bg-[oklch(0.36_0.18_25)] transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
