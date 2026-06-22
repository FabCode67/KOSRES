"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ClipboardList, Trash2, Check, RefreshCw, Loader2, Home } from "lucide-react"
import AdminShell from "@/components/AdminShell"
import { useAdmin } from "@/components/AdminContext"
import { markServiceRequestRead, deleteServiceRequest } from "@/lib/api"
import type { ApiServiceRequest } from "@/lib/api"

const SERVICE_COLORS: Record<string, string> = {
  "Invest in Kigali Real Estate":    "bg-red-50 text-red-700 border-red-200",
  "Asset Valuation":                 "bg-blue-50 text-blue-700 border-blue-200",
  "Property Due Diligence":          "bg-green-50 text-green-700 border-green-200",
  "Buy / Sell & Rent":               "bg-orange-50 text-orange-700 border-orange-200",
  "Property Request — For Sale":     "bg-orange-50 text-orange-700 border-orange-200",
  "Property Request — For Rent":     "bg-green-50 text-green-700 border-green-200",
  "Property Request — Short Stay":   "bg-amber-50 text-amber-700 border-amber-200",
  "Property General Enquiry":        "bg-slate-50 text-slate-700 border-slate-200",
  "Property Tax Consulting":         "bg-amber-50 text-amber-700 border-amber-200",
  "Property Management":             "bg-purple-50 text-purple-700 border-purple-200",
  "Car Rental":                      "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Car Buy & Sell":                  "bg-pink-50 text-pink-700 border-pink-200",
  "Taxi & Transfer":                 "bg-teal-50 text-teal-700 border-teal-200",
}

// Fields to always hide from the key-value table (shown in header already)
const HIDDEN_KEYS = new Set([
  "name","email","contact","yourName","emailAddress","phone",
])

export default function ServiceRequestsPage() {
  const { serviceRequests, setServiceRequests, refresh, loading, properties } = useAdmin()
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleMarkRead = async (id: string) => {
    await markServiceRequestRead(id)
    setServiceRequests(prev => prev.map(r => r.id === id ? { ...r, read: true } : r))
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    await deleteServiceRequest(id)
    setServiceRequests(prev => prev.filter(r => r.id !== id))
    setDeleting(null)
  }

  const unread = serviceRequests.filter(r => !r.read).length

  // Look up a property from the properties list by its ID
  const getProperty = (propertyId: string) =>
    properties.find(p => p.id === propertyId) ?? null

  return (
    <AdminShell title="Service Requests">
      <div className="space-y-4">

        {/* Summary bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading…" : `${serviceRequests.length} total`}
            </p>
            {unread > 0 && (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[oklch(0.42_0.19_25)] text-white">
                {unread} unread
              </span>
            )}
          </div>
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

        {!loading && serviceRequests.map((req: ApiServiceRequest) => {
          const colorCls  = SERVICE_COLORS[req.service] ?? "bg-slate-50 text-slate-700 border-slate-200"
          const propId    = req.data?.propertyId as string | undefined
          const property  = propId ? getProperty(propId) : null
          const propImage = property?.images?.[0] ?? null

          // Visible data entries (exclude header-level fields)
          const dataEntries = Object.entries(req.data ?? {})
            .filter(([k, v]) => v && !HIDDEN_KEYS.has(k))

          return (
            <div key={req.id}
              className={`bg-white rounded-xl border shadow-sm transition-all ${
                !req.read
                  ? "border-l-4 border-l-[oklch(0.42_0.19_25)] border-border"
                  : "border-border"
              }`}>

              {/* ── Property image banner (if a property is attached) ── */}
              {(propImage || property) && (
                <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-slate-100">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-14 rounded-xl overflow-hidden flex-none bg-slate-100 shadow-sm">
                    {propImage ? (
                      <Image
                        src={propImage}
                        alt={property?.title ?? "Property"}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Home size={22} />
                      </div>
                    )}
                    {/* Offer type badge */}
                    {property?.offerType && (
                      <span className={`absolute bottom-1 left-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                        property.offerType === "sale"       ? "bg-red-600 text-white"    :
                        property.offerType === "rent"       ? "bg-green-700 text-white"  :
                        "bg-amber-500 text-black"
                      }`}>
                        {property.offerType === "sale"       ? "For Sale"   :
                         property.offerType === "rent"       ? "For Rent"   :
                         "Short Stay"}
                      </span>
                    )}
                  </div>

                  {/* Property info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      Requested Property
                    </p>
                    <Link
                      href={`/properties/${property?.id}`}
                      target="_blank"
                      className="font-bold text-sm text-slate-800 hover:text-[oklch(0.42_0.19_25)] transition-colors truncate block"
                    >
                      {property?.title ?? req.data?.propertyTitle ?? "Unknown property"}
                    </Link>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {property ? `${property.sector}, ${property.district}` : req.data?.location ?? ""}
                      {property?.price && (
                        <span className="ml-2 font-semibold text-[oklch(0.42_0.19_25)]">
                          · {Number(property.price).toLocaleString()} {property.priceUnit}
                          {property.priceFrequency ? `/${property.priceFrequency}` : ""}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* View property link */}
                  {property && (
                    <Link
                      href={`/properties/${property.id}`}
                      target="_blank"
                      className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-[oklch(0.42_0.19_25)] hover:border-[oklch(0.42_0.19_25)] transition-colors flex-none"
                    >
                      <Home size={11} /> View listing
                    </Link>
                  )}
                </div>
              )}

              {/* ── Main request body ── */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">

                  {/* Left */}
                  <div className="flex-1 min-w-0">
                    {/* Service badge + unread dot */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${colorCls}`}>
                        {req.service}
                      </span>
                      {!req.read && (
                        <span className="w-2 h-2 rounded-full bg-[oklch(0.42_0.19_25)] flex-none" title="Unread" />
                      )}
                    </div>

                    {/* Contact info */}
                    <p className="font-bold text-sm text-slate-800">{req.name}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-0.5 mb-3">
                      {req.email   && (
                        <a href={`mailto:${req.email}`}
                          className="hover:text-[oklch(0.42_0.19_25)] hover:underline transition-colors">
                          {req.email}
                        </a>
                      )}
                      {req.contact && (
                        <a href={`tel:${req.contact}`}
                          className="hover:text-[oklch(0.42_0.19_25)] hover:underline transition-colors">
                          {req.contact}
                        </a>
                      )}
                    </div>

                    {/* Key-value data table */}
                    {dataEntries.length > 0 && (
                      <div className="bg-slate-50 rounded-xl px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5">
                        {dataEntries.map(([key, val]) => (
                          <div key={key} className="flex items-start gap-2 text-xs">
                            <span className="text-slate-400 font-medium capitalize min-w-[100px] flex-none">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                            </span>
                            <span className="text-slate-700 font-semibold break-words">{val}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: date + actions */}
                  <div className="flex flex-col items-end gap-2 flex-none">
                    <p className="text-[11px] text-muted-foreground whitespace-nowrap">
                      {new Date(req.createdAt).toLocaleDateString("en-RW", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(req.createdAt).toLocaleTimeString("en-RW", {
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {!req.read && (
                        <button onClick={() => handleMarkRead(req.id)}
                          className="p-1.5 rounded-lg hover:bg-green-50 transition-colors text-muted-foreground hover:text-green-600"
                          title="Mark as read">
                          <Check size={14} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(req.id)} disabled={deleting === req.id}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-600 disabled:opacity-50"
                        title="Delete">
                        {deleting === req.id
                          ? <Loader2 size={14} className="animate-spin" />
                          : <Trash2 size={14} />
                        }
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {!loading && serviceRequests.length === 0 && (
          <div className="text-center py-24 text-muted-foreground">
            <ClipboardList size={44} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-semibold mb-1">No service requests yet</p>
            <p className="text-sm">Requests submitted from service pages will appear here.</p>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
