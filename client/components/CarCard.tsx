"use client"

import Image from "next/image"
import Link from "next/link"
import { Car, Fuel, Users, MapPin, Star, Zap } from "lucide-react"
import { whatsappLink } from "@/lib/utils"
import { WhatsAppIcon } from "@/components/social-icons"
import type { ApiCar } from "@/lib/api"

const SERVICE_LABEL: Record<string, string> = {
  rent: "For Rent", sale: "For Sale", taxi: "Taxi",
}
const SERVICE_CLS: Record<string, string> = {
  rent:  "bg-[#1C2B4B] text-white",
  sale:  "bg-[oklch(0.42_0.19_25)] text-white",
  taxi:  "bg-[#1A4731] text-white",
}
const FUEL_ICON: Record<string, React.ReactNode> = {
  electric: <Zap size={11} />,
  hybrid:   <Zap size={11} />,
  petrol:   <Fuel size={11} />,
  diesel:   <Fuel size={11} />,
}

interface Props {
  car: ApiCar
  onRequest?: (car: ApiCar) => void
}

export default function CarCard({ car, onRequest }: Props) {
  const waMsg = `Hello KOSRES, I'm interested in the ${car.brand} ${car.model} (${SERVICE_LABEL[car.serviceType]}) — ${Number(car.price).toLocaleString()} ${car.priceUnit}${car.priceFrequency ? "/" + car.priceFrequency : ""}. Please share more details.`

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-300">
      {/* Image */}
      <Link href={`/cars/${car.id}`} className="relative block h-48 flex-none overflow-hidden bg-slate-100">
        {car.images[0] ? (
          <Image
            src={car.images[0]}
            alt={car.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width:640px)100vw,(max-width:1024px)50vw,33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car size={48} className="text-slate-300" strokeWidth={1} />
          </div>
        )}

        {/* Service type badge */}
        <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${SERVICE_CLS[car.serviceType]}`}>
          {SERVICE_LABEL[car.serviceType]}
        </span>

        {/* Featured badge */}
        {car.featured && (
          <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold bg-amber-400 text-black px-2.5 py-1 rounded-full">
            <Star size={9} className="fill-black" /> Featured
          </span>
        )}

        {/* Image count */}
        {car.images.length > 1 && (
          <span className="absolute bottom-2 right-2 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded-full">
            +{car.images.length - 1}
          </span>
        )}
      </Link>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        {/* Brand + model */}
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
            {car.brand} · {car.year ?? ""}
          </p>
          <Link href={`/cars/${car.id}`}>
            <h3 className="font-bold text-sm leading-snug mt-0.5 text-slate-800 hover:text-[oklch(0.42_0.19_25)] transition-colors line-clamp-2">
              {car.title}
            </h3>
          </Link>
          {car.location && (
            <p className="flex items-center gap-1 text-xs text-slate-400 mt-1">
              <MapPin size={10} /> {car.location}{car.district ? `, ${car.district}` : ""}
            </p>
          )}
        </div>

        {/* Specs row */}
        <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
          {car.fuelType && (
            <span className="flex items-center gap-1">
              {FUEL_ICON[car.fuelType]} {car.fuelType.charAt(0).toUpperCase() + car.fuelType.slice(1)}
            </span>
          )}
          {car.transmission && (
            <span className="flex items-center gap-1">
              <Car size={10} /> {car.transmission}
            </span>
          )}
          {car.seats && (
            <span className="flex items-center gap-1">
              <Users size={10} /> {car.seats} seats
            </span>
          )}
          {car.mileage && (
            <span className="text-slate-300">
              {Number(car.mileage).toLocaleString()} km
            </span>
          )}
        </div>

        {/* Price */}
        <p className="text-xl font-black leading-none text-[oklch(0.42_0.19_25)]">
          {Number(car.price).toLocaleString()} {car.priceUnit}
          {car.priceFrequency && (
            <span className="text-sm font-semibold text-slate-400">/{car.priceFrequency}</span>
          )}
        </p>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-3 border-t border-slate-100">
          {onRequest ? (
            <button
              onClick={() => onRequest(car)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white bg-[oklch(0.42_0.19_25)] hover:bg-[oklch(0.36_0.18_25)] transition-colors"
            >
              Request this
            </button>
          ) : (
            <Link
              href={`/cars/${car.id}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white bg-[oklch(0.42_0.19_25)] hover:bg-[oklch(0.36_0.18_25)] transition-colors"
            >
              View details
            </Link>
          )}
          <a
            href={whatsappLink(waMsg)}
            target="_blank"
            rel="noopener noreferrer"
            title="Chat on WhatsApp"
            className="whatsapp-btn w-10 h-10 flex items-center justify-center rounded-xl text-white flex-none"
          >
            <WhatsAppIcon size={15} />
          </a>
        </div>
      </div>
    </div>
  )
}
