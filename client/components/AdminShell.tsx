"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, List, Plus, MessageSquare,
  ClipboardList, BookOpen, Home, LogOut, Loader2, Globe, Car,
} from "lucide-react"
import { useAdmin } from "@/components/AdminContext"

const LOGO = "/images/kosres_logo_refined.png"

const navItems = [
  { label: "Dashboard",        href: "/admin",                  icon: LayoutDashboard },
  { label: "Properties",       href: "/admin/properties",       icon: List            },
  { label: "Add Property",     href: "/admin/add",              icon: Plus            },
  { label: "Cars",             href: "/admin/cars",             icon: Car             },
  { label: "Publications",     href: "/admin/publications",     icon: BookOpen        },
  { label: "Partners",         href: "/admin/partners",         icon: Globe           },
  { label: "Inquiries",        href: "/admin/inquiries",        icon: MessageSquare   },
  { label: "Service Requests", href: "/admin/service-requests", icon: ClipboardList   },
]

export default function AdminShell({ children, title }: { children: React.ReactNode; title: string }) {
  const { user, logout, loading, serviceRequests } = useAdmin()
  const pathname = usePathname()
  const unreadCount = serviceRequests?.filter(r => !r.read).length ?? 0

  return (
    <div className="min-h-screen flex bg-[oklch(0.97_0.005_80)]">

      {/* ── Sidebar ── */}
      <aside className="w-60 bg-[oklch(0.12_0.01_250)] text-white flex flex-col shrink-0 sticky top-0 h-screen">

        {/* Logo */}
        <div className="px-4 py-3 border-b border-white/10 flex flex-col items-center">
          <div className="bg-white rounded-xl px-2 py-1.5 w-full flex justify-center">
            <Image
              src={LOGO}
              alt="KOSRES LTD"
              width={150}
              height={76}
              className="h-14 w-auto object-contain"
            />
          </div>
          <p className="text-[10px] text-white/40 mt-2 capitalize">{user?.role ?? "admin"}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href))
            const badge    = label === "Service Requests" && unreadCount > 0 ? unreadCount : 0
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-[oklch(0.42_0.19_25)] text-white" : "text-white/70 hover:bg-white/10"
                }`}
              >
                <Icon size={16} />
                <span className="flex-1">{label}</span>
                {badge > 0 && (
                  <span className="text-[10px] font-bold bg-white/20 text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <p className="text-xs text-white/40 truncate">{user?.email}</p>
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors">
              <Home size={12} /> Website
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors ml-auto"
            >
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-border px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-lg font-bold text-slate-800">{title}</h1>
          <div className="flex items-center gap-3">
            {loading && <Loader2 size={16} className="animate-spin text-muted-foreground" />}
            {pathname === "/admin/properties" && (
              <Link
                href="/admin/add"
                className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg bg-[oklch(0.42_0.19_25)] text-white hover:bg-[oklch(0.36_0.18_25)] transition-colors"
              >
                <Plus size={14} /> Add Property
              </Link>
            )}
            {pathname === "/admin/cars" && (
              <Link
                href="/admin/cars/add"
                className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg bg-[oklch(0.42_0.19_25)] text-white hover:bg-[oklch(0.36_0.18_25)] transition-colors"
              >
                <Plus size={14} /> Add Car
              </Link>
            )}
          </div>
        </header>

        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </main>
    </div>
  )
}
