"use client"

import { useState } from "react"
import { ClipboardList, Trash2, Check, RefreshCw, Loader2 } from "lucide-react"
import AdminShell from "@/components/AdminShell"
import { useAdmin } from "@/components/AdminContext"
import { markServiceRequestRead, deleteServiceRequest } from "@/lib/api"
import type { ApiServiceRequest } from "@/lib/api"

const SERVICE_COLORS: Record<string, string> = {
  "Invest in Kigali Real Estate": "bg-red-50 text-red-700 border-red-200",
  "Asset Valuation":              "bg-blue-50 text-blue-700 border-blue-200",
  "Property Due Diligence":       "bg-green-50 text-green-700 border-green-200",
  "Buy / Sell & Rent":            "bg-orange-50 text-orange-700 border-orange-200",
  "Property Tax Consulting":      "bg-amber-50 text-amber-700 border-amber-200",
  "Property Management":          "bg-purple-50 text-purple-700 border-purple-200",
}

export default function ServiceRequestsPage() {
  const { serviceRequests, setServiceRequests, refresh, loading } = useAdmin()
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
          const colorCls = SERVICE_COLORS[req.service] || "bg-slate-50 text-slate-700 border-slate-200"
          return (
            <div key={req.id}
              className={`bg-white rounded-xl border shadow-sm p-5 transition-all ${!req.read ? "border-l-4 border-l-[oklch(0.42_0.19_25)] border-border" : "border-border"}`}>
              <div className="flex items-start justify-between gap-4">

                {/* Left content */}
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
                  <p className="font-semibold text-sm text-slate-800">{req.name}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-0.5 mb-3">
                    {req.email   && <a href={`mailto:${req.email}`}   className="hover:text-[oklch(0.42_0.19_25)] hover:underline">{req.email}</a>}
                    {req.contact && <a href={`tel:${req.contact}`}    className="hover:text-[oklch(0.42_0.19_25)] hover:underline">{req.contact}</a>}
                  </div>

                  {/* Form fields as key-value table */}
                  {Object.entries(req.data).length > 0 && (
                    <div className="bg-slate-50 rounded-xl px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                      {Object.entries(req.data)
                        .filter(([k, v]) => v && !["name","email","contact","yourName","emailAddress","phone"].includes(k))
                        .map(([key, val]) => (
                          <div key={key} className="flex items-start gap-2 text-xs">
                            <span className="text-slate-400 font-medium capitalize min-w-[90px] flex-none">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                            </span>
                            <span className="text-slate-700 font-semibold">{val}</span>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>

                {/* Right actions */}
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
