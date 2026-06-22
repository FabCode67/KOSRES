import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft, Car, Fuel, Users, MapPin, Calendar,
  Gauge, Hash, Palette, Star, ChevronLeft, ChevronRight, Zap
} from "lucide-react"
import Navbar from "@/components/Navbar"
import CarDetailClient from "./CarDetailClient"
import { getCar, getCars } from "@/lib/api"
import type { ApiCar } from "@/lib/api"

interface Props { params: Promise<{ id: string }> }

export default async function CarDetailPage({ params }: Props) {
  const { id } = await params
  let car: ApiCar
  try { car = await getCar(id) } catch { notFound() }

  let related: ApiCar[] = []
  try {
    const all = await getCars({ serviceType: car.serviceType, limit: 4 })
    related = all.data.filter(c => c.id !== id).slice(0, 3)
  } catch {}

  return <CarDetailClient car={car} related={related} />
}
