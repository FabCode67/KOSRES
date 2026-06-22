"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import AdminShell from "@/components/AdminShell"
import CarForm from "@/components/CarForm"
import { getCar } from "@/lib/api"
import type { ApiCar } from "@/lib/api"

export default function EditCarPage() {
  const { id } = useParams<{ id: string }>()
  const [car,     setCar]     = useState<ApiCar | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState("")

  useEffect(() => {
    getCar(id)
      .then(setCar)
      .catch(() => setError("Car not found"))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <AdminShell title="Edit Car">
      <div className="flex items-center justify-center py-24"><Loader2 size={28} className="animate-spin text-muted-foreground" /></div>
    </AdminShell>
  )
  if (error || !car) return (
    <AdminShell title="Edit Car">
      <p className="text-red-600 text-sm">{error || "Car not found"}</p>
    </AdminShell>
  )

  return <CarForm mode="edit" initial={car} />
}
