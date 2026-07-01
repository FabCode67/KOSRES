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
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {staff.map(member => (
        <div
          key={member.id}
          className="group flex flex-col items-center gap-3 bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 p-6 text-center"
        >
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-white shadow">
            {member.photo ? (
              <Image src={member.photo} alt={member.name} fill className="object-cover" sizes="96px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-black text-xl" style={{ backgroundColor: "#7B1113" }}>
                {member.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
              </div>
            )}
          </div>

          <div>
            <p className="font-black text-sm text-slate-800">{member.name}</p>
            <p className="text-xs font-semibold text-[oklch(0.42_0.19_25)] mt-0.5">{member.position}</p>
            {member.department && (
              <span className="inline-block mt-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
                {member.department}
              </span>
            )}
            {member.bio && (
              <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-3">{member.bio}</p>
            )}
          </div>

          {(member.email || member.phone) && (
            <div className="flex flex-col items-center gap-1 mt-1 pt-3 border-t border-border w-full">
              {member.email && (
                <a href={`mailto:${member.email}`} className="text-[11px] text-slate-400 hover:text-[oklch(0.42_0.19_25)] flex items-center gap-1 transition-colors">
                  <Mail size={10} /> {member.email}
                </a>
              )}
              {member.phone && (
                <a href={`tel:${member.phone}`} className="text-[11px] text-slate-400 hover:text-[oklch(0.42_0.19_25)] flex items-center gap-1 transition-colors">
                  <Phone size={10} /> {member.phone}
                </a>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
