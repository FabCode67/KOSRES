"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Loader2, Mail, Phone, Users } from "lucide-react"
import { getStaff } from "@/lib/api"
import type { ApiStaff } from "@/lib/api"

export default function StaffSection() {
  const [staff,   setStaff]   = useState<ApiStaff[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStaff(false)             // active only
      .then(setStaff)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (staff.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Users size={40} className="mx-auto mb-3 opacity-20" />
        <p className="text-sm">Team profiles coming soon.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
      {staff.map(member => (
        <div
          key={member.id}
          className="card-hover group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
        >
          {/* ── Photo — fills the full card width, portrait ratio ── */}
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100">
            {member.photo ? (
              <Image
                src={member.photo}
                alt={member.name}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center font-heading text-6xl font-bold italic text-white/90"
                style={{ background: "linear-gradient(150deg, oklch(0.42 0.19 25) 0%, oklch(0.24 0.14 25) 55%, oklch(0.12 0.01 250) 100%)" }}
              >
                {member.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
              </div>
            )}

            {/* Department tag */}
            {member.department && (
              <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[oklch(0.42_0.19_25)] shadow-sm backdrop-blur-sm">
                {member.department}
              </span>
            )}

            {/* Gradient scrim + name/position overlay */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <h3 className="font-heading text-lg font-bold leading-tight text-white drop-shadow-sm">
                {member.name}
              </h3>
              <p className="gold-text mt-0.5 text-xs font-bold tracking-wide uppercase">
                {member.position}
              </p>
            </div>
          </div>

          {/* ── Info strip below the photo ── */}
          <div className="flex flex-1 flex-col gap-2.5 p-4">
            {member.bio && (
              <p className="line-clamp-3 text-xs leading-relaxed text-slate-500">{member.bio}</p>
            )}

            {(member.email || member.phone) && (
              <div className="mt-auto flex items-center gap-2 border-t border-border/60 pt-3">
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    title={member.email}
                    className="flex flex-1 items-center justify-center gap-1.5 truncate rounded-lg bg-slate-50 py-2 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-[oklch(0.42_0.19_25)] hover:text-white"
                  >
                    <Mail size={12} className="flex-none" /> <span className="truncate">Email</span>
                  </a>
                )}
                {member.phone && (
                  <a
                    href={`tel:${member.phone}`}
                    title={member.phone}
                    aria-label={`Call ${member.name}`}
                    className="flex h-8 w-9 flex-none items-center justify-center rounded-lg bg-slate-50 text-slate-600 transition-colors hover:bg-[oklch(0.42_0.19_25)] hover:text-white"
                  >
                    <Phone size={13} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
