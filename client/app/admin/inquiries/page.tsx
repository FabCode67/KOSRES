"use client"

import { MessageSquare } from "lucide-react"
import AdminShell  from "@/components/AdminShell"
import { useAdmin } from "@/components/AdminContext"

export default function InquiriesPage() {
  const { inquiries } = useAdmin()

  return (
    <AdminShell title="Inquiries">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{inquiries.length} total inquiries</p>

        {inquiries.map((inq: any) => (
          <div key={inq.id} className="bg-white rounded-xl border border-border p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm text-slate-800">{inq.name}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    inq.channel === "whatsapp"  ? "bg-green-50 text-green-700"
                    : inq.channel === "instagram" ? "bg-pink-50 text-pink-700"
                    : inq.channel === "facebook"  ? "bg-blue-50 text-blue-700"
                    : "bg-slate-100 text-slate-600"
                  }`}>{inq.channel}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                  {inq.email && <span>{inq.email}</span>}
                  {inq.phone && <span>{inq.phone}</span>}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{inq.message}</p>
                {inq.property && (
                  <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
                    Re: {inq.property.title}
                  </p>
                )}
              </div>
              <div className="text-right flex-none">
                <p className="text-xs text-muted-foreground">
                  {new Date(inq.createdAt).toLocaleDateString("en-RW", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(inq.createdAt).toLocaleTimeString("en-RW", {
                    hour: "2-digit", minute: "2-digit",
                  })}
                </p>
                {inq.email && (
                  <a href={`mailto:${inq.email}`}
                    className="inline-block mt-2 text-xs text-[oklch(0.42_0.19_25)] hover:underline">
                    Reply by email →
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}

        {inquiries.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <MessageSquare size={40} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-semibold mb-1">No inquiries yet</p>
            <p className="text-sm">Inquiries submitted via WhatsApp, Instagram and Facebook will appear here.</p>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
