"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { LayoutGrid, FilePlus2, Settings2, LogOut, Loader2, Ruler, Database, ClipboardCheck } from "lucide-react"

const NAV = [
  { label: "Requests",  href: "/valuation",           icon: LayoutGrid },
  { label: "New Request", href: "/valuation/requests/new", icon: FilePlus2 },
  { label: "My Inspections", href: "/valuation/inspections", icon: ClipboardCheck },
  { label: "Comparables", href: "/valuation/comparables", icon: Database },
]

export default function ValuationLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const role = (session?.user as any)?.role as string | undefined
  const allowed = role === "admin" || role === "valuer" || role === "technician"

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/admin/login?callbackUrl=/valuation")
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[oklch(0.98_0.005_80)]">
        <Loader2 size={28} className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (status === "unauthenticated") return null

  if (!allowed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[oklch(0.98_0.005_80)] px-6 text-center">
        <Ruler size={32} className="text-muted-foreground" />
        <p className="font-heading text-xl font-bold text-slate-800">Valuation access required</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Your account doesn't have Valuer, Technician, or Admin access. Contact an administrator if this is unexpected.
        </p>
        <Link href="/admin" className="mt-2 text-sm font-semibold text-[oklch(0.42_0.19_25)] hover:underline">
          Back to KOSRES Admin
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[oklch(0.98_0.005_80)]">
      {/* ── Sidebar ── */}
      <aside className="fixed inset-y-0 left-0 z-20 flex w-60 flex-col bg-[oklch(0.12_0.01_250)] text-white">
        <div className="flex items-center gap-2.5 px-5 py-6">
          <div className="flex h-9 w-9 flex-none items-center justify-center rounded-lg" style={{ background: "linear-gradient(150deg, oklch(0.42 0.19 25), oklch(0.24 0.14 25))" }}>
            <Ruler size={17} className="text-white" strokeWidth={2.2} />
          </div>
          <div className="leading-tight">
            <p className="font-heading text-sm font-bold tracking-wide">KOSRES</p>
            <p className="gold-text text-[10px] font-bold uppercase tracking-[0.18em]">Valuation</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active ? "bg-white/10 font-semibold text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            )
          })}

          {role === "admin" && (
            <Link
              href="/valuation/settings"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                pathname === "/valuation/settings" ? "bg-white/10 font-semibold text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Settings2 size={16} />
              Rates & Rules
            </Link>
          )}
        </nav>

        <div className="border-t border-white/10 px-3 py-4">
          <div className="mb-3 px-2">
            <p className="truncate text-xs font-semibold text-white/85">{session?.user?.name}</p>
            <p className="truncate text-[11px] capitalize text-white/45">{role}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="ml-60 flex-1 px-8 py-8">{children}</main>
    </div>
  )
}
