"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Plus, Edit2, Trash2, Loader2, Star, Car,
  Eye, EyeOff, Camera, RefreshCw,
} from "lucide-react"
import AdminShell from "@/components/AdminShell"
import { getCars, deleteCar, updateCar } from "@/lib/api"
import type { ApiCar } from "@/lib/api"

const SERVICE_LABEL: Record<string, string> = {
  rent: "For Rent", sale: "For Sale", taxi: "Taxi",
}
const SERVICE_CLS: Record<string, string> = {
  rent: "bg-[#1C2B4B]/10 text-[#1C2B4B]",
  sale: "bg-red-50 text-red-700",
  taxi: "bg-green-50 text-green-700",
}

export default function AdminCarsPage() {
  const [cars,     setCars]     = useState<ApiCar[]>([])
  const [loading,  setLoading]  = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [filter,   setFilter]   = useState("all")

  const load = async () => {
    setLoading(true)
    try {
      const res = await getCars({ limit: 200, status: "all" as any })
      setCars(res.data)
    } catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this car listing?")) return
    setDeleting(id)
    try { await deleteCar(id); setCars(prev => prev.filter(c => c.id !== id)) } catch {}
    setDeleting(null)
  }

  const toggleFeatured = async (car: ApiCar) => {
    try {
      const updated = await updateCar(car.id, { featured: !car.featured })
      setCars(prev => prev.map(c => c.id === car.id ? updated : c))
    } catch {}
  }

  const filtered = filter === "all" ? cars : cars.filter(c => c.serviceType === filter)

  return (
    <AdminShell title="Cars">
      <div className="space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading…" : `${cars.length} total · ${cars.filter(c => c.status === "available").length} available`}
            </p>
            {/* Service type filter */}
            <div className="flex gap-1.5">
              {[["all","All"],["rent","Rent"],["sale","Sale"],["taxi","Taxi"]].map(([v,l]) => (
                <button key={v} onClick={() => setFilter(v)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    filter === v ? "bg-[oklch(0.42_0.19_25)] text-white" : "bg-muted text-slate-600 hover:bg-muted/80"
                  }`}>{l}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
              <RefreshCw size={13} /> Refresh
            </button>
            <Link href="/admin/cars/add"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[oklch(0.42_0.19_25)] text-white text-sm font-semibold hover:bg-[oklch(0.36_0.18_25)] transition-colors">
              <Plus size={14} /> Add Car
            </Link>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl text-muted-foreground">
            <Car size={44} className="mx-auto mb-4 opacity-20" strokeWidth={1} />
            <p className="font-semibold mb-2">No cars yet</p>
            <Link href="/admin/cars/add" className="text-sm text-[oklch(0.42_0.19_25)] hover:underline">
              Add your first car listing →
            </Link>
          </div>
        )}

        {!loading && filtered.map(car => (
          <div key={car.id}
            className={`bg-white rounded-xl border shadow-sm flex items-center gap-4 p-4 hover:shadow-md transition-shadow ${
              car.featured ? "border-amber-300" : "border-border"
            }`}>

            {/* Thumbnail */}
            <div className="relative w-24 h-16 rounded-xl overflow-hidden flex-none bg-slate-100">
              {car.images[0]
                ? <Image src={car.images[0]} alt={car.title} fill className="object-cover" sizes="96px" />
                : <div className="w-full h-full flex items-center justify-center"><Car size={20} className="text-slate-300" strokeWidth={1} /></div>
              }
              <span className="absolute bottom-1 right-1 text-[8px] bg-black/50 text-white px-1 py-0.5 rounded">
                {car.images.length} 📷
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${SERVICE_CLS[car.serviceType]}`}>
                  {SERVICE_LABEL[car.serviceType]}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  car.status === "available" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                }`}>{car.status}</span>
                {car.featured && <span className="text-[10px] text-amber-600 font-bold">⭐ Featured</span>}
              </div>
              <p className="font-bold text-sm text-slate-800 truncate">{car.title}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {car.brand} {car.model} {car.year ?? ""} · {car.fuelType} · {car.transmission ?? ""}
                {car.location ? ` · ${car.location}` : car.district ? ` · ${car.district}` : ""}
              </p>
            </div>

            {/* Price */}
            <div className="hidden sm:block flex-none text-right">
              <p className="font-black text-base text-[oklch(0.42_0.19_25)]">
                {Number(car.price).toLocaleString()} {car.priceUnit}
              </p>
              {car.priceFrequency && <p className="text-xs text-slate-400">/{car.priceFrequency}</p>}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-none">
              <button onClick={() => toggleFeatured(car)} title={car.featured ? "Unfeature" : "Feature"}
                className={`p-1.5 rounded-lg transition-colors ${car.featured ? "text-amber-500 hover:bg-amber-50" : "text-slate-400 hover:bg-muted"}`}>
                <Star size={14} className={car.featured ? "fill-amber-400" : ""} />
              </button>
              <Link href={`/admin/cars/${car.id}/edit`}
                className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors text-muted-foreground hover:text-blue-600">
                <Edit2 size={14} />
              </Link>
              <Link href={`/admin/cars/${car.id}/images`}
                className="p-1.5 rounded-lg hover:bg-purple-50 transition-colors text-muted-foreground hover:text-purple-600"
                title="Manage images">
                <Camera size={14} />
              </Link>
              <Link href={`/cars/${car.id}`} target="_blank"
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                <Eye size={14} />
              </Link>
              <button onClick={() => handleDelete(car.id)} disabled={deleting === car.id}
                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-600 disabled:opacity-40">
                {deleting === car.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  )
}
